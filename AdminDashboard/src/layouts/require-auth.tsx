import { useAuth } from '@clerk/clerk-react';
import { Navigate, Outlet } from 'react-router-dom';

export default function RequireAuth() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) return null; // or a loading spinner
  if (!isSignedIn) return <Navigate to="/" replace />;
  return <Outlet />;
}
