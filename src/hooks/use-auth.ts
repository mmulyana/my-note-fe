import { useCallback } from 'react';
import { useAtom } from 'jotai';
import { authTokenAtom } from '@/store/auth';
import { clearToken, setToken } from '@/lib/auth';

export function useAuth() {
  const [token, setTokenState] = useAtom(authTokenAtom);

  const login = useCallback(
    (accessToken: string, expiresAt?: number) => {
      setToken(accessToken, expiresAt);
      setTokenState(accessToken);
    },
    [setTokenState],
  );

  const logout = useCallback(() => {
    clearToken();
    setTokenState(null);
  }, [setTokenState]);

  return { token, isAuthenticated: !!token, login, logout };
}
