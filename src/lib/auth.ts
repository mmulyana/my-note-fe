const TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const REFRESH_STORAGE_KEY = 'mynote_refresh_token';

// note: fallback refresh-token cookie lifetime in seconds, used when the server response has no expiresAt
const DEFAULT_REFRESH_EXPIRY_SECONDS = 7 * 24 * 60 * 60;

function setCookie(name: string, value: string, expiresAt?: number) {
  let cookie = `${name}=${encodeURIComponent(value)}; path=/; SameSite=Lax`;
  if (expiresAt) cookie += `; expires=${new Date(expiresAt * 1000).toUTCString()}`;
  document.cookie = cookie;
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

export function setToken(token: string, expiresAt?: number) {
  setCookie(TOKEN_KEY, token, expiresAt);
}

export function getToken(): string | null {
  return getCookie(TOKEN_KEY);
}

export function setRefreshToken(token: string, expiresAt?: number) {
  const expiry = expiresAt ?? Math.floor(Date.now() / 1000) + DEFAULT_REFRESH_EXPIRY_SECONDS;
  setCookie(REFRESH_TOKEN_KEY, token, expiry);
  try {
    localStorage.setItem(REFRESH_STORAGE_KEY, token);
  } catch {
    // note: ignore localStorage write error if disabled/quota exceeded
  }
}

export function getRefreshToken(): string | null {
  const cookieToken = getCookie(REFRESH_TOKEN_KEY);
  if (cookieToken) return cookieToken;

  try {
    return localStorage.getItem(REFRESH_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setAuthTokens(params: {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
}) {
  setToken(params.accessToken, params.expiresAt);
  if (params.refreshToken) {
    setRefreshToken(params.refreshToken);
  }
}

export function clearToken() {
  deleteCookie(TOKEN_KEY);
  deleteCookie(REFRESH_TOKEN_KEY);
  try {
    localStorage.removeItem(REFRESH_STORAGE_KEY);
  } catch {
    // note: ignore localStorage error
  }
}

export const clearTokens = clearToken;

