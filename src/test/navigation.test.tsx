import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HomePage } from '../pages/HomePage';
import { Header } from '../components/common/Header';
import { AuthProvider } from '../context/AuthContext';

describe('Navigation and Usability Tests', () => {
  it('renders landing page with Shikshan brand, tagline, and welcoming message', () => {
    render(
      <AuthProvider>
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      </AuthProvider>
    );

    // Brand and tagline
    expect(screen.getByRole('heading', { level: 1, name: /shikshan/i })).toBeInTheDocument();
    expect(screen.getByText(/learn with confidence\. grow with guidance\./i)).toBeInTheDocument();
    expect(screen.getByText(/your learning journey starts here\./i)).toBeInTheDocument();

    // Primary role actions
    expect(screen.getByRole('heading', { level: 2, name: /^tutor$/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /^student$/i })).toBeInTheDocument();
    expect(screen.getByText(/apply as tutor/i)).toBeInTheDocument();
    expect(screen.getByText(/register as student/i)).toBeInTheDocument();
  });

  it('opens navigation drawer when hamburger menu icon is clicked', () => {
    render(
      <AuthProvider>
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      </AuthProvider>
    );

    const hamburgerButton = screen.getByRole('button', { name: /open menu/i });
    expect(hamburgerButton).toBeInTheDocument();

    // Drawer is initially not visible
    expect(screen.queryByRole('dialog', { name: /main navigation/i })).not.toBeInTheDocument();

    // Click hamburger button to open drawer
    fireEvent.click(hamburgerButton);

    // Drawer is now open with required links
    const dialog = screen.getByRole('dialog', { name: /main navigation/i });
    expect(dialog).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^home$/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /about shikshan/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /developer/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /privacy policy/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /terms and conditions/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /help and contact/i })).toBeInTheDocument();

    // Close button works
    const closeButton = screen.getByRole('button', { name: /close menu/i });
    fireEvent.click(closeButton);
    expect(screen.queryByRole('dialog', { name: /main navigation/i })).not.toBeInTheDocument();
  });

  it('displays a visible back-arrow button on nested screens and triggers onBack handler', () => {
    let backTriggered = false;
    const handleBack = () => {
      backTriggered = true;
    };

    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/tutor/register']}>
          <Header title="Tutor Application" showBack={true} onBack={handleBack} />
        </MemoryRouter>
      </AuthProvider>
    );

    const backButton = screen.getByRole('button', { name: /go back/i });
    expect(backButton).toBeInTheDocument();

    fireEvent.click(backButton);
    expect(backTriggered).toBe(true);
  });
});
