import { useAuth, RedirectToSignIn } from '@clerk/clerk-react';
import { Outlet } from 'react-router-dom';

export default function RequireAuth() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) return null; // or a loading spinner
  if (!isSignedIn) return <RedirectToSignIn/>;
  return <Outlet />;
}
