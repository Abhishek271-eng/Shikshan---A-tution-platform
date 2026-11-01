import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NavigationProvider } from './context/NavigationContext';
import { ShikshanSplashLoader } from './components/common/ShikshanSplashLoader';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/auth/LoginPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { UpdatePasswordPage } from './pages/auth/UpdatePasswordPage';
import { TutorRegisterPage } from './pages/tutor/TutorRegisterPage';
import { TutorStatusPage } from './pages/tutor/TutorStatusPage';
import { TutorDashboardPage } from './pages/tutor/TutorDashboardPage';
import { StudentRegisterPage } from './pages/student/StudentRegisterPage';
import { StudentDashboardPage } from './pages/student/StudentDashboardPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AboutPage } from './pages/info/AboutPage';
import { DeveloperPage } from './pages/info/DeveloperPage';
import { PrivacyPolicyPage } from './pages/info/PrivacyPolicyPage';
import { TermsPage } from './pages/info/TermsPage';
import { HelpContactPage } from './pages/info/HelpContactPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ProtectedRoute } from './components/common/ProtectedRoute';

const StatusBarConfig: React.FC = () => {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
    StatusBar.setBackgroundColor({ color: '#2E1065' }).catch(() => {});
  }, []);

  return null;
};

/**
 * Mandatory Application Entry Flow:
 * App Launch → Authentication Check → Main Application
 * 
 * If authenticated, user is strictly routed to their role-specific dashboard:
 * - Admin -> /admin
 * - Tutor -> /tutor/dashboard (if approved) or /tutor/status
 * - Student -> /student/dashboard
 */
const AppEntryGateway: React.FC = () => {
  const { user, profile, tutorApplication, isLoading } = useAuth();

  if (isLoading) {
    return <ShikshanSplashLoader />;
  }

  if (user && profile) {
    if (profile.role === 'admin') {
      return <Navigate to="/admin" replace />;
    } else if (profile.role === 'tutor') {
      const isApproved = tutorApplication?.status === 'approved';
      return <Navigate to={isApproved ? "/tutor/dashboard" : "/tutor/status"} replace />;
    } else if (profile.role === 'student') {
      return <Navigate to="/student/dashboard" replace />;
    }
  }

  // First screen on launch when unauthenticated is strictly Login
  return <LoginPage />;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <NavigationProvider>
          <StatusBarConfig />
          <Routes>
            {/* Mandatory Entry Gateway */}
            <Route path="/" element={<AppEntryGateway />} />

            {/* Authentication Journeys */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/update-password" element={<UpdatePasswordPage />} />

            {/* Tutor Journeys (Protected) */}
            <Route path="/tutor/register" element={<TutorRegisterPage />} />
            <Route
              path="/tutor/status"
              element={
                <ProtectedRoute allowedRoles={['tutor', 'admin']}>
                  <TutorStatusPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tutor/dashboard"
              element={
                <ProtectedRoute allowedRoles={['tutor', 'admin']}>
                  <TutorDashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Student Journeys (Protected) */}
            <Route path="/student/register" element={<StudentRegisterPage />} />
            <Route
              path="/student/dashboard"
              element={
                <ProtectedRoute allowedRoles={['student', 'admin']}>
                  <StudentDashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Protected Administrator Review Panel */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Informational & Marketing */}
            <Route path="/welcome" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/developer" element={<DeveloperPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/help" element={<HelpContactPage />} />

            {/* 404 Catch-All */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </NavigationProvider>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
