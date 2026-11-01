import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { TutorStatusPage } from '../pages/tutor/TutorStatusPage';
import { DeveloperPage } from '../pages/info/DeveloperPage';
import { TutorCard } from '../components/marketplace/TutorCard';
import { AuthProvider } from '../context/AuthContext';
import { TutorApplication } from '../types';

describe('Tutor Redesign & Enquiries Priority Tests', () => {
  const dummyTutor: TutorApplication = {
    id: 'app-tutor-99',
    tutor_id: 'tutor-user-99',
    education_level: 'Graduate',
    course_qualification: 'B.Ed Mathematics',
    institution_name: 'Bangalore University',
    subjects: ['mathematics'],
    class_levels: ['class_9'],
    subject_class_pairs: [{ subject: 'Mathematics', classLevelRange: 'Classes 6–10' }],
    board_familiarity: ['karnataka_state_board'],
    teaching_languages: ['Kannada', 'English'],
    bio_intro: 'Dedicated math teacher with focus on fundamentals.',
    teaching_experience: '2 years coaching state syllabus',
    available_days: ['mon', 'tue', 'wed'],
    time_windows: ['evening_prime'],
    hours_per_day: 3,
    fee_amount: 2500,
    fee_unit: 'per_month',
    proposed_rate: 2500,
    status: 'approved',
    submitted_at: '2026-10-20T10:00:00Z',
    created_at: '2026-10-20T10:00:00Z',
    updated_at: '2026-10-21T11:00:00Z',
    tutor_profile: {
      id: 'tutor-user-99',
      role: 'tutor',
      name: 'Geetha Patil',
      email: 'geetha@example.com',
      phone: '+91 9988776655',
      created_at: '2026-10-20T10:00:00Z',
      updated_at: '2026-10-21T11:00:00Z',
    },
  };

  it('renders TutorStatusPage with mandatory bottom Sign Out button and confirmation modal', () => {
    render(
      <AuthProvider>
        <MemoryRouter>
          <TutorStatusPage />
        </MemoryRouter>
      </AuthProvider>
    );

    // Bottom logout button should exist
    const signOutBtn = screen.getByRole('button', { name: /sign out of shikshan/i });
    expect(signOutBtn).toBeInTheDocument();

    // Clicking it opens the confirmation dialog
    fireEvent.click(signOutBtn);
    expect(screen.getByRole('heading', { level: 3, name: /confirm logout/i })).toBeInTheDocument();
    expect(screen.getByText(/are you sure you want to log out of shikshan\?/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /confirm logout/i })).toBeInTheDocument();
  });

  it('renders DeveloperPage with concise profile, back button, and commitments', () => {
    render(
      <AuthProvider>
        <MemoryRouter>
          <DeveloperPage />
        </MemoryRouter>
      </AuthProvider>
    );

    expect(screen.getByRole('heading', { level: 1, name: /developer & founder/i })).toBeInTheDocument();
    expect(screen.getByText(/abhishek devanagaon/i)).toBeInTheDocument();
    expect(screen.getByText(/karnataka state syllabus & bilingual learning/i)).toBeInTheDocument();
    expect(screen.getByText(/micro-batches \(strictly max 4 students\)/i)).toBeInTheDocument();
    expect(screen.getByText(/fair fee cap & verified educators/i)).toBeInTheDocument();

    // Back button should be present
    const backBtn = screen.getByRole('button', { name: /go back/i });
    expect(backBtn).toBeInTheDocument();
  });

  it('renders compact TutorCard with monthly fee and details/request action buttons', () => {
    render(
      <MemoryRouter>
        <TutorCard
          tutor={dummyTutor}
          isFavorite={false}
          onToggleFavorite={() => {}}
          onViewProfile={() => {}}
          onRequestTutor={() => {}}
        />
      </MemoryRouter>
    );

    expect(screen.getByText(/geetha patil/i)).toBeInTheDocument();
    expect(screen.getByText(/2 years experience/i)).toBeInTheDocument();
    expect(screen.getByText(/₹2,500/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /details/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /request/i })).toBeInTheDocument();
  });
});
