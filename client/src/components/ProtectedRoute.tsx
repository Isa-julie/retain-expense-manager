import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { Role } from '../types';

interface Props {
  role?: Role; // if given, only this role may enter
  children: ReactNode;
}

// Wrap any page that needs a signed-in user (and optionally a role).
export default function ProtectedRoute({ role, children }: Props) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <p className="page-note">Loading…</p>;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return <>{children}</>;
}
