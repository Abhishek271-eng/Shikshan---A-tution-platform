import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { user, profile, isLoading, isConfigured } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#EEF4FA]">
        <div className="w-10 h-10 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  // If Supabase is unconfigured, allow previewing routes for local test/demo inspection
  if (!isConfigured) {
    return <>{children}</>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Role validation
  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    // If user has a different role, send them to their role home
    if (profile.role === 'admin') return <Navigate to="/admin" replace />;
    if (profile.role === 'student') return <Navigate to="/student/dashboard" replace />;
    if (profile.role === 'tutor') return <Navigate to="/tutor/status" replace />;
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
