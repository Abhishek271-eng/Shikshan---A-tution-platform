import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { StudentDashboardPage } from '../pages/student/StudentDashboardPage';
import { AuthProvider } from '../context/AuthContext';

describe('Tutor Discovery Marketplace Journey', () => {
  it('renders marketplace tabs and approved tutor cards with fees and subjects', async () => {
    render(
      <AuthProvider>
        <MemoryRouter>
          <StudentDashboardPage />
        </MemoryRouter>
      </AuthProvider>
    );

    // Verify tabs
    expect(screen.getByRole('button', { name: /find tutors/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /my requests/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /shortlist/i })).toBeInTheDocument();

    // Verify mock approved tutors load
    await waitFor(() => {
      expect(screen.getByText(/anand kumar hegde/i)).toBeInTheDocument();
    });

    // Check fee display and verification badge
    expect(screen.getAllByText(/verified/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/proposed fee/i)[0]).toBeInTheDocument();
  });

  it('filters tutors by search query', async () => {
    render(
      <AuthProvider>
        <MemoryRouter>
          <StudentDashboardPage />
        </MemoryRouter>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/anand kumar hegde/i)).toBeInTheDocument();
    });

    // Filter by search query "Savitha"
    const searchInput = screen.getByPlaceholderText(/search by tutor name/i);
    fireEvent.change(searchInput, { target: { value: 'Savitha' } });

    await waitFor(() => {
      expect(screen.getByText(/dr\. savitha murthy/i)).toBeInTheDocument();
      expect(screen.queryByText(/anand kumar hegde/i)).not.toBeInTheDocument();
    });
  });

  it('opens tutor profile details modal when Details button is clicked', async () => {
    render(
      <AuthProvider>
        <MemoryRouter>
          <StudentDashboardPage />
        </MemoryRouter>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/anand kumar hegde/i)).toBeInTheDocument();
    });

    const detailsButtons = screen.getAllByRole('button', { name: /^details$/i });
    fireEvent.click(detailsButtons[0]);

    // Modal opens
    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: /tutor profile details/i })).toBeInTheDocument();
      expect(screen.getByText(/teaching approach & bio/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /request this tutor/i })).toBeInTheDocument();
    });
  });

  it('allows opening tutor request modal and validates required fields', async () => {
    render(
      <AuthProvider>
        <MemoryRouter>
          <StudentDashboardPage />
        </MemoryRouter>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/anand kumar hegde/i)).toBeInTheDocument();
    });

    const requestButtons = screen.getAllByRole('button', { name: /^request$/i });
    fireEvent.click(requestButtons[0]);

    // Request modal opens
    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: /request tutor/i })).toBeInTheDocument();
    });

    // Provide short learning needs to trigger validation error
    const learningNeedsTextarea = screen.getByPlaceholderText(/need assistance with mathematics/i);
    fireEvent.change(learningNeedsTextarea, { target: { value: 'Short' } });

    const submitBtn = screen.getByRole('button', { name: /submit request/i });
    const form = submitBtn.closest('form')!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText(/please provide a brief description of your learning needs/i)).toBeInTheDocument();
    });
  });
});
