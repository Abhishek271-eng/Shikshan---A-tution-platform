import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { TutorRegisterPage } from '../pages/tutor/TutorRegisterPage';
import { AuthProvider } from '../context/AuthContext';

describe('Tutor Multi-Step Registration Journey', () => {
  it('renders Step 0 and rejects progression with empty required fields', () => {
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

  it('validates 10-digit phone number and strong password checklist', () => {
    render(
      <AuthProvider>
        <MemoryRouter>
          <TutorRegisterPage />
        </MemoryRouter>
      </AuthProvider>
    );

    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'Suresh Kumar' } });
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'suresh@example.com' } });

    // Invalid phone (only 6 digits)
    const phoneInput = screen.getByPlaceholderText(/98765 43210/i);
    fireEvent.change(phoneInput, { target: { value: '984501' } });

    // Password lacking special character & uppercase
    fireEvent.change(screen.getByLabelText(/^create password/i), { target: { value: 'weakpass1' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'weakpass1' } });

    const continueButton = screen.getByRole('button', { name: /continue/i });
    fireEvent.click(continueButton);

    // Rejects invalid phone
    expect(screen.getByText(/enter a valid 10-digit mobile number/i)).toBeInTheDocument();

    // Now fix phone to valid 10 digits
    fireEvent.change(phoneInput, { target: { value: '9845012345' } });
    fireEvent.click(continueButton);

    // Rejects weak password
    expect(screen.getByText(/please satisfy all 5 password requirements/i)).toBeInTheDocument();
  });

  it('preserves form input values when moving between steps and navigating back', () => {
    render(
      <AuthProvider>
        <MemoryRouter>
          <TutorRegisterPage />
        </MemoryRouter>
      </AuthProvider>
    );

    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'Basavaraj Patil' } });
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'basavaraj@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/98765 43210/i), { target: { value: '9845012345' } });
    fireEvent.change(screen.getByLabelText(/^create password/i), { target: { value: 'TutorPass@123' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'TutorPass@123' } });

    // Advance to Step 1 (Teaching Profile)
    const continueButton = screen.getByRole('button', { name: /continue/i });
    fireEvent.click(continueButton);

    expect(screen.getByText(/teaching profile & expertise/i)).toBeInTheDocument();

    // Now click Back button
    const backButton = screen.getByRole('button', { name: /^back$/i });
    fireEvent.click(backButton);

    // Returned to Step 0: form data is fully preserved!
    expect(screen.getByDisplayValue('Basavaraj Patil')).toBeInTheDocument();
    expect(screen.getByDisplayValue('basavaraj@example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('9845012345')).toBeInTheDocument();
  });

  it('collects teaching bio, proposed fee and fee unit without mandatory commitment or document uploads', () => {
    render(
      <AuthProvider>
        <MemoryRouter>
          <TutorRegisterPage />
        </MemoryRouter>
      </AuthProvider>
    );

    // Step 0: Fill Account Details
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'Asha Hegde' } });
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'asha@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/98765 43210/i), { target: { value: '9880011223' } });
    fireEvent.change(screen.getByLabelText(/^create password/i), { target: { value: 'AshaPass@123' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'AshaPass@123' } });
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    // Step 1: Teaching Profile
    expect(screen.getByText(/teaching profile & expertise/i)).toBeInTheDocument();

    // Fill bio
    const bioTextarea = screen.getByPlaceholderText(/describe how you help students understand tough concepts/i);
    fireEvent.change(bioTextarea, {
      target: { value: 'Passionate educator providing patient bilingual science and math guidance for rural students.' }
    });
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    // Step 2: Fees & Schedule (NO 3/6-month commitment, NO marksheet upload!)
    expect(screen.getByText(/proposed fees & schedule/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/amount \(₹\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/fee unit/i)).toBeInTheDocument();

    // Verify there is NO documents upload tab or forced commitment
    expect(screen.queryByText(/documents & marksheets/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/mandatory 3 months commitment/i)).not.toBeInTheDocument();

    // Advance to Step 3: Review & Submit
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));
    expect(screen.getByText(/review & consent/i)).toBeInTheDocument();
  });
});
