import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { StudentRegisterPage } from '../pages/student/StudentRegisterPage';
import { AuthProvider } from '../context/AuthContext';

describe('Student Registration Journey', () => {
  it('renders student registration with child privacy & guardian consent requirement', () => {
    render(
      <AuthProvider>
        <MemoryRouter>
          <StudentRegisterPage />
        </MemoryRouter>
      </AuthProvider>
    );

    expect(screen.getByRole('heading', { level: 3, name: /student account/i })).toBeInTheDocument();
    expect(screen.getByText(/child privacy & guardian involvement/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/parent \/ guardian confirms consent/i)).toBeInTheDocument();
  });

  it('validates required fields before allowing progression to academic details', () => {
    render(
      <AuthProvider>
        <MemoryRouter>
          <StudentRegisterPage />
        </MemoryRouter>
      </AuthProvider>
    );

    const continueButton = screen.getByRole('button', { name: /continue/i });
    fireEvent.click(continueButton);

    expect(screen.getByText(/please enter student’s name/i)).toBeInTheDocument();
  });

  it('allows selecting Karnataka State Board and Kannada learning language in Step 1', () => {
    render(
      <AuthProvider>
        <MemoryRouter>
          <StudentRegisterPage />
        </MemoryRouter>
      </AuthProvider>
    );

    // Complete Step A
    fireEvent.change(screen.getByLabelText(/student's full name/i), { target: { value: 'Chidananda' } });
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'chidu@example.com' } });
    const mobileInputs = screen.getAllByPlaceholderText(/98765 43210/i);
    fireEvent.change(mobileInputs[0], { target: { value: '9900112233' } });
    fireEvent.change(screen.getByLabelText(/^account password/i), { target: { value: 'student123' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'student123' } });

    // Advance to Step 1
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    expect(screen.getByRole('heading', { level: 3, name: /academic details/i })).toBeInTheDocument();

    // Check board options include Karnataka State Board
    const boardSelect = screen.getByLabelText(/school board \/ curriculum/i);
    expect(boardSelect).toHaveTextContent(/karnataka state board/i);

    // Check language options include Kannada
    const languageSelect = screen.getByLabelText(/preferred learning language/i);
    expect(languageSelect).toHaveTextContent(/kannada/i);

    // Finish button is visible
    expect(screen.getByRole('button', { name: /complete registration/i })).toBeInTheDocument();
  });
});
