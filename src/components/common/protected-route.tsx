import { Navigate, Outlet } from 'react-router-dom';
import { useAtomValue, useSetAtom } from 'jotai';
import { memo, useEffect } from 'react';
import type { IApi, ProfileResponse } from '@/lib/types';
import { profileAtom } from '@/store/profile';
import { authTokenAtom } from '@/store/auth';
import { useApi } from '@/hooks/use-api';
import { urls } from '@/lib/urls';

// note: spinner shown by react-router while protectedRouteLoader is restoring the session
export function ProtectedRouteFallback() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-surface">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand border-t-transparent" />
    </div>
  );
}

function ProtectedRoute() {
  const token = useAtomValue(authTokenAtom);
  const setProfile = useSetAtom(profileAtom);

  const { data } = useApi<IApi<ProfileResponse>>({
    url: urls.Profile,
    enabled: !!token,
  });

  useEffect(() => {
    if (data) setProfile(data.data);
  }, [data, setProfile]);

  if (!token) return <Navigate to="/login" replace />;
  return <Outlet />;
}

export default memo(ProtectedRoute);

