import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { AuthProvider } from '../context/AuthContext';

describe('Admin Review Panel Tests', () => {
  it('renders admin review desk with pending applications and review controls', () => {
    render(
      <AuthProvider>
        <MemoryRouter>
          <AdminDashboardPage />
        </MemoryRouter>
      </AuthProvider>
    );

    // Title and banner
    expect(screen.getByRole('heading', { level: 2, name: /tutor eligibility review desk/i })).toBeInTheDocument();
    expect(screen.getByText(/pending review/i)).toBeInTheDocument();

    // Review decision controls
    expect(screen.getByRole('button', { name: /approve tutor/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /request more info/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reject application/i })).toBeInTheDocument();

    // Internal note input marked as confidential
    expect(screen.getByLabelText(/internal review note \(confidential/i)).toBeInTheDocument();
    // Applicant-facing message input
    expect(screen.getByLabelText(/applicant message \(visible to tutor/i)).toBeInTheDocument();
  });

  it('updates application status when Approve Tutor is clicked', () => {
    render(
      <AuthProvider>
        <MemoryRouter>
          <AdminDashboardPage />
        </MemoryRouter>
      </AuthProvider>
    );

    const approveButton = screen.getByRole('button', { name: /approve tutor/i });
    fireEvent.click(approveButton);

    expect(screen.getByText(/application successfully marked as approved/i)).toBeInTheDocument();
  });
});
