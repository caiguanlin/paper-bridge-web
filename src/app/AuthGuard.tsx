import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('teacher_token');
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
