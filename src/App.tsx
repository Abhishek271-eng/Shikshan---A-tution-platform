import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
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

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Landing */}
          <Route path="/" element={<HomePage />} />

          {/* Authentication Journeys */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/update-password" element={<UpdatePasswordPage />} />

          {/* Tutor Journeys */}
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

          {/* Student Journeys */}
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

          {/* Trust & Informational Pages */}
          <Route path="/about" element={<AboutPage />} />
          <Route path="/developer" element={<DeveloperPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/help" element={<HelpContactPage />} />

          {/* 404 Catch-All */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
