import { useCallback } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { authTokenAtom } from '@/store/auth';
import { profileAtom } from '@/store/profile';
import { clearToken, getRefreshToken, setAuthTokens } from '@/lib/auth';
import { request } from '@/lib/api-client';
import { urls } from '@/lib/urls';

export function useAuth() {
  const [token, setTokenState] = useAtom(authTokenAtom);
  const setProfile = useSetAtom(profileAtom);

  const login = useCallback(
    (accessToken: string, expiresAt?: number, refreshToken?: string) => {
      setAuthTokens({ accessToken, refreshToken, expiresAt });
      setTokenState(accessToken);
    },
    [setTokenState],
  );

  const logout = useCallback(async () => {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      try {
        await request(urls.Logout, {
          method: 'POST',
          body: { refreshToken },
        });
      } catch {
        //
      }
    }
    clearToken();
    setTokenState(null);
    setProfile(null);
  }, [setTokenState, setProfile]);

  return { token, isAuthenticated: !!token, login, logout };
}
