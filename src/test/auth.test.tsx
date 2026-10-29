import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LoginPage } from '../pages/auth/LoginPage';
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage';
import { AuthProvider } from '../context/AuthContext';

describe('Authentication & Account Recovery Tests', () => {
  it('renders login form and requires email and password', () => {
    render(
      <AuthProvider>
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      </AuthProvider>
    );

    expect(screen.getByRole('heading', { level: 2, name: /welcome back/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();

    const submitButton = screen.getByRole('button', { name: /^sign in$/i });
    const form = submitButton.closest('form')!;
    fireEvent.submit(form);

    expect(screen.getByText(/please enter both your email address and password/i)).toBeInTheDocument();
  });

  it('renders password reset flow and validates email input', () => {
    render(
      <AuthProvider>
        <MemoryRouter>
          <ForgotPasswordPage />
        </MemoryRouter>
      </AuthProvider>
    );

    expect(screen.getByRole('heading', { level: 2, name: /forgot password\?/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/registered email address/i)).toBeInTheDocument();

    const sendButton = screen.getByRole('button', { name: /send reset link/i });
    const form = sendButton.closest('form')!;
    fireEvent.submit(form);

    expect(screen.getByText(/please enter your email address/i)).toBeInTheDocument();
  });
});
