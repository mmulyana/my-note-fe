const TOKEN_KEY = 'accessToken';

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

export function clearToken() {
  deleteCookie(TOKEN_KEY);
}
