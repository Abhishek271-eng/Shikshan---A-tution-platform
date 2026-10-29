import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { TutorRegisterPage } from '../pages/tutor/TutorRegisterPage';
import { AuthProvider } from '../context/AuthContext';

describe('Tutor Multi-Step Registration Journey', () => {
  it('renders Step A and rejects progression with empty required fields', () => {
    render(
      <AuthProvider>
        <MemoryRouter>
          <TutorRegisterPage />
        </MemoryRouter>
      </AuthProvider>
    );

    expect(screen.getByText(/basic account information/i)).toBeInTheDocument();

    const continueButton = screen.getByRole('button', { name: /continue/i });
    fireEvent.click(continueButton);

    // Validation error shown
    expect(screen.getByText(/please enter your full name/i)).toBeInTheDocument();
  });

  it('preserves form input values when moving between steps and navigating back', () => {
    render(
      <AuthProvider>
        <MemoryRouter>
          <TutorRegisterPage />
        </MemoryRouter>
      </AuthProvider>
    );

    const nameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/email address/i);
    const phoneInput = screen.getByPlaceholderText(/98765 43210/i);
    const passwordInput = screen.getByLabelText(/^create password/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

    fireEvent.change(nameInput, { target: { value: 'Basavaraj Patil' } });
    fireEvent.change(emailInput, { target: { value: 'basavaraj@example.com' } });
    fireEvent.change(phoneInput, { target: { value: '9845012345' } });
    fireEvent.change(passwordInput, { target: { value: 'secret123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'secret123' } });

    // Advance to Step B
    const continueButton = screen.getByRole('button', { name: /continue/i });
    fireEvent.click(continueButton);

    // Step B is active
    expect(screen.getByText(/education & eligibility/i)).toBeInTheDocument();

    // Now click Back button
    const backButton = screen.getByRole('button', { name: /^back$/i });
    fireEvent.click(backButton);

    // Returned to Step A: form data is fully preserved!
    expect(screen.getByDisplayValue('Basavaraj Patil')).toBeInTheDocument();
    expect(screen.getByDisplayValue('basavaraj@example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('9845012345')).toBeInTheDocument();
  });

  it('confirms 3 or 6 months commitment period requirement in Step C', () => {
    render(
      <AuthProvider>
        <MemoryRouter>
          <TutorRegisterPage />
        </MemoryRouter>
      </AuthProvider>
    );

    // Fill Step A
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'Asha Hegde' } });
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'asha@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/98765 43210/i), { target: { value: '9880011223' } });
    fireEvent.change(screen.getByLabelText(/^create password/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    // Step B: advance to Step C
    expect(screen.getByText(/education & eligibility/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    // Step C: Availability & Commitment
    expect(screen.getByText(/availability & commitment/i)).toBeInTheDocument();
    expect(screen.getAllByText(/3 months commitment/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/6 months commitment/i)[0]).toBeInTheDocument();

    // Trying to continue without acknowledging commitment fails
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));
    expect(screen.getByText(/please confirm your understanding of the 3 or 6 months commitment/i)).toBeInTheDocument();
  });
});
