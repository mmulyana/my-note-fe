import { memo } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAtomValue } from 'jotai';
import { authTokenAtom } from '@/store/auth';

function ProtectedRoute() {
  const token = useAtomValue(authTokenAtom);

  if (!token) return <Navigate to="/login" replace />;
  return <Outlet />;
}

export default memo(ProtectedRoute);
