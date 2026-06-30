import { useCallback } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { authTokenAtom } from '@/store/auth';
import { profileAtom } from '@/store/profile';
import { clearToken, setToken } from '@/lib/auth';

export function useAuth() {
  const [token, setTokenState] = useAtom(authTokenAtom);
  const setProfile = useSetAtom(profileAtom);

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
    setProfile(null);
  }, [setTokenState, setProfile]);

  return { token, isAuthenticated: !!token, login, logout };
}
