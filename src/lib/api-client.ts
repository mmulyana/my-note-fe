import { getDefaultStore } from 'jotai';
import { authTokenAtom } from '../store/auth';
import { profileAtom } from '../store/profile';
import { clearToken, getRefreshToken, getToken, setRefreshToken, setToken } from './auth';
import type { RefreshTokenResponse } from './types';
import { urls } from './urls';

const BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/** Error thrown for any non-2xx response, carrying the status and parsed body. */
export class ApiError extends Error {
  readonly status: number;
  readonly data: unknown;

  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  params?: Record<string, unknown>;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  _retry?: boolean;
}

let refreshPromise: Promise<string | null> | null = null;

// note: calls the refresh-token endpoint and syncs the resulting tokens into cookies and the auth atom
async function performTokenRefresh(currentRefreshToken: string): Promise<string | null> {
  try {
    const res = await fetch(`${BASE_URL}${urls.RefreshToken}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken: currentRefreshToken }),
    });

    const isJson = res.headers.get('content-type')?.includes('application/json');
    const json = isJson ? await res.json() : null;

    if (!res.ok || !json?.data?.accessToken) {
      throw new Error(json?.message || 'Failed to refresh token');
    }

    const refreshData = json.data as RefreshTokenResponse;
    setToken(refreshData.accessToken, refreshData.expiresAt);
    if (refreshData.refreshToken) {
      setRefreshToken(refreshData.refreshToken);
    }

    getDefaultStore().set(authTokenAtom, refreshData.accessToken);
    return refreshData.accessToken;
  } catch {
    clearToken();
    getDefaultStore().set(authTokenAtom, null);
    getDefaultStore().set(profileAtom, null);
    return null;
  } finally {
    refreshPromise = null;
  }
}

// note: dedupes concurrent refresh calls behind a single in-flight promise
export async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) {
    return refreshPromise;
  }

  const currentRefreshToken = getRefreshToken();
  if (!currentRefreshToken) {
    clearToken();
    getDefaultStore().set(authTokenAtom, null);
    getDefaultStore().set(profileAtom, null);
    return null;
  }

  refreshPromise = performTokenRefresh(currentRefreshToken);
  return refreshPromise;
}

// note: react-router loader that restores the access token before the protected route renders
export async function protectedRouteLoader() {
  const token = getDefaultStore().get(authTokenAtom);
  if (!token && getRefreshToken()) {
    await refreshAccessToken();
  }
  return null;
}

function buildQuery(params: Record<string, unknown>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) search.append(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

/** Thin typed wrapper over fetch. Resolves with the parsed body, throws ApiError on failure. */
export async function request<T>(url: string, opts: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, params, headers, signal, _retry } = opts;

  const token = getToken();
  const isFormData = body instanceof FormData;
  const finalHeaders: Record<string, string> = {
    ...(body !== undefined && !isFormData ? { 'Content-Type': 'application/json' } : {}),
    ...headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(`${BASE_URL}${url}${params ? buildQuery(params) : ''}`, {
    method,
    signal,
    headers: finalHeaders,
    body: body === undefined ? undefined : isFormData ? (body as FormData) : JSON.stringify(body),
  });

  const isJson = res.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    const isAuthEndpoint =
      url.includes(urls.RefreshToken) ||
      url.includes(urls.Login) ||
      url.includes(urls.Logout) ||
      url.includes(urls.Register);

    if (res.status === 401 && !_retry && !isAuthEndpoint) {
      const newToken = await refreshAccessToken();
      if (newToken) {
        return request<T>(url, {
          ...opts,
          _retry: true,
        });
      }
    }

    const message =
      (isJson && data && typeof data === 'object' && 'message' in data
        ? String((data as { message: unknown }).message)
        : res.statusText) || 'Request failed';
    throw new ApiError(message, res.status, data);
  }

  return data as T;
}

