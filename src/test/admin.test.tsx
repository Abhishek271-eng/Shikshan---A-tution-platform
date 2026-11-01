import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { AuthProvider } from '../context/AuthContext';

describe('Admin Review Panel Tests', () => {
  it('renders admin review desk with pending applications and review controls', async () => {
    render(
      <AuthProvider>
        <MemoryRouter>
          <AdminDashboardPage />
        </MemoryRouter>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 2, name: /tutor eligibility review desk/i })).toBeInTheDocument();
    });

    await waitFor(() => {
      // Review decision controls after data loads
      expect(screen.getByRole('button', { name: /approve application/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /reject application/i })).toBeInTheDocument();
    });

    expect(screen.getAllByText(/pending/i)[0]).toBeInTheDocument();
    expect(screen.getByText(/applicant message/i)).toBeInTheDocument();
  });

  it('updates application status when Approve Application is clicked', async () => {
    render(
      <AuthProvider>
        <MemoryRouter>
          <AdminDashboardPage />
        </MemoryRouter>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /approve application/i })).toBeInTheDocument();
    });

    const approveButton = screen.getByRole('button', { name: /approve application/i });
    fireEvent.click(approveButton);

    await waitFor(() => {
      expect(screen.getByText(/successfully approved/i)).toBeInTheDocument();
    });
  });
});
