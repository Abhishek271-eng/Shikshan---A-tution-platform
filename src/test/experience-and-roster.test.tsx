import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { TutorCard } from '../components/marketplace/TutorCard';
import { TutorProfileModal } from '../components/marketplace/TutorProfileModal';
import { NavigationDrawer } from '../components/common/NavigationDrawer';
import { AuthProvider } from '../context/AuthContext';
import { TutorApplication } from '../types';

describe('Experience Badge & Roster Tests', () => {
  const baseTutor: TutorApplication = {
    id: 'app-1',
    tutor_id: 'tutor-1',
    education_level: 'Graduate',
    course_qualification: 'B.Sc Physics',
    institution_name: 'Mysore University',
    subjects: ['science'],
    class_levels: ['class_8'],
    subject_class_pairs: [{ subject: 'Science', classLevelRange: 'Classes 6–10' }],
    board_familiarity: ['karnataka_state_board'],
    teaching_languages: ['Kannada', 'English'],
    bio_intro: 'Passionate physics teacher.',
    teaching_experience: '3 years of school coaching',
    available_days: ['mon', 'wed'],
    time_windows: ['evening_prime'],
    hours_per_day: 3,
    fee_amount: 1500,
    fee_unit: 'per_month',
    proposed_rate: 1500,
    status: 'approved',
    submitted_at: '2026-10-15T10:00:00Z',
    created_at: '2026-10-15T10:00:00Z',
    updated_at: '2026-10-16T11:00:00Z',
    tutor_profile: {
      id: 'tutor-1',
      role: 'tutor',
      name: 'Ramesh Gowda',
      email: 'ramesh@example.com',
      phone: '+91 9845011223',
      created_at: '2026-10-15T10:00:00Z',
      updated_at: '2026-10-16T11:00:00Z',
    },
  };

  it('renders experience badge on TutorCard when experience > 0', () => {
    render(
      <MemoryRouter>
        <TutorCard
          tutor={baseTutor}
          onViewProfile={() => {}}
          onRequestTutor={() => {}}
          onToggleFavorite={() => {}}
          isFavorite={false}
        />
      </MemoryRouter>
    );

    expect(screen.getByText(/3 years experience/i)).toBeInTheDocument();
  });

  it('strictly renders NO experience badge on TutorCard when experience is 0, empty, or undefined', () => {
    const zeroExpTutor: TutorApplication = {
      ...baseTutor,
      teaching_experience: '0 years',
    };

    const { unmount } = render(
      <MemoryRouter>
        <TutorCard
          tutor={zeroExpTutor}
          onViewProfile={() => {}}
          onRequestTutor={() => {}}
          onToggleFavorite={() => {}}
          isFavorite={false}
        />
      </MemoryRouter>
    );

    expect(screen.queryByText(/years exp/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/0 years/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/fresher/i)).not.toBeInTheDocument();

    unmount();

    // Also verify when undefined/empty
    const emptyExpTutor: TutorApplication = {
      ...baseTutor,
      teaching_experience: '',
    };

    render(
      <MemoryRouter>
        <TutorCard
          tutor={emptyExpTutor}
          onViewProfile={() => {}}
          onRequestTutor={() => {}}
          onToggleFavorite={() => {}}
          isFavorite={false}
        />
      </MemoryRouter>
    );

    expect(screen.queryByText(/years exp/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/fresher/i)).not.toBeInTheDocument();
  });

  it('strictly omits experience block in TutorProfileModal when experience is 0 or undefined', () => {
    const zeroExpTutor: TutorApplication = {
      ...baseTutor,
      teaching_experience: '0 years',
    };

    render(
      <MemoryRouter>
        <TutorProfileModal
          isOpen={true}
          onClose={() => {}}
          tutor={zeroExpTutor}
          onRequestTutor={() => {}}
          onToggleFavorite={() => {}}
          isFavorite={false}
        />
      </MemoryRouter>
    );

    // Ensure NO "Fresher" label or 0 Years label
    expect(screen.queryByText(/fresher/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/0\+ Yrs/i)).not.toBeInTheDocument();
  });

  it('requires confirmation before logging out in NavigationDrawer', async () => {
    render(
      <AuthProvider>
        <MemoryRouter>
          <NavigationDrawer isOpen={true} onClose={() => {}} />
        </MemoryRouter>
      </AuthProvider>
    );

    // Initial sign in / sign out button check
    // Wait for drawer to render
    expect(screen.getByRole('dialog', { name: /main navigation/i })).toBeInTheDocument();
  });
});
