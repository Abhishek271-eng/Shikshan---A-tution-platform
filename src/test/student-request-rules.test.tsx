import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { TutorRequestModal } from '../components/marketplace/TutorRequestModal';
import { AuthProvider } from '../context/AuthContext';
import { TutorRequest, TutorApplication } from '../types';

describe('Student Tutor Request Business Rules & Uniqueness Enforcement', () => {
  // Pure logic engine reflecting backend worker and frontend client rules
  interface RequestValidationResult {
    allowed: boolean;
    error?: string;
  }

  const validateStudentTutorRequest = (
    studentId: string,
    tutorId: string,
    batchId: string | undefined,
    existingRequests: TutorRequest[],
    batchCapacities: Record<string, number>
  ): RequestValidationResult => {
    // 1. Check for active request for this tutor (pending or accepted)
    const activeRequest = existingRequests.find(
      (r) =>
        r.student_id === studentId &&
        r.tutor_id === tutorId &&
        (r.status === 'pending' || r.status === 'accepted')
    );

    if (activeRequest) {
      if (activeRequest.status === 'pending') {
        return {
          allowed: false,
          error: 'You have already requested this tutor. Please wait for the response.',
        };
      }
      return {
        allowed: false,
        error: 'You already have an active enrolled mentorship with this tutor.',
      };
    }

    // 2. If a specific batch was selected, check capacity (Strictly 4 students)
    if (batchId) {
      const currentEnrolled = batchCapacities[batchId] || 0;
      if (currentEnrolled >= 4) {
        return {
          allowed: false,
          error: 'This batch is full. Please choose another available batch.',
        };
      }
    }

    return { allowed: true };
  };

  const dummyTutor: TutorApplication = {
    id: 'app-tutor-01',
    tutor_id: 'tutor-user-01',
    education_level: 'Graduate',
    course_qualification: 'B.Sc Mathematics',
    institution_name: 'Mysore University',
    subjects: ['mathematics'],
    class_levels: ['class_8', 'class_9'],
    subject_class_pairs: [{ subject: 'Mathematics', classLevelRange: 'Classes 6–10' }],
    board_familiarity: ['karnataka_state_board'],
    teaching_languages: ['Kannada', 'English'],
    bio_intro: 'Passionate math educator.',
    teaching_experience: '3 years coaching',
    available_days: ['mon', 'wed', 'fri'],
    time_windows: ['evening_prime'],
    hours_per_day: 3,
    fee_amount: 1500,
    fee_unit: 'per_month',
    proposed_rate: 1500,
    status: 'approved',
    submitted_at: '2026-10-20T10:00:00Z',
    created_at: '2026-10-20T10:00:00Z',
    updated_at: '2026-10-21T11:00:00Z',
    tutor_profile: {
      id: 'tutor-user-01',
      role: 'tutor',
      name: 'Ramesh Gowda',
      email: 'ramesh@example.com',
      phone: '+91 9845012345',
      created_at: '2026-10-20T10:00:00Z',
      updated_at: '2026-10-21T11:00:00Z',
    },
  };

  it('Rule 1: First request from a student to an available tutor succeeds', () => {
    const existing: TutorRequest[] = [];
    const capacities = { 'batch-1': 2 };

    const result = validateStudentTutorRequest('student-101', 'tutor-user-01', 'batch-1', existing, capacities);
    expect(result.allowed).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('Rule 2: Duplicate pending request to same tutor is rejected with exact authoritative message', () => {
    const existing: TutorRequest[] = [
      {
        id: 'req-001',
        student_id: 'student-101',
        tutor_id: 'tutor-user-01',
        subject: 'mathematics',
        class_level: 'class_8',
        learning_needs: 'Exam fundamentals',
        status: 'pending',
        created_at: '2026-11-01T10:00:00Z',
        updated_at: '2026-11-01T10:00:00Z',
      },
    ];

    const result = validateStudentTutorRequest('student-101', 'tutor-user-01', undefined, existing, {});
    expect(result.allowed).toBe(false);
    expect(result.error).toBe('You have already requested this tutor. Please wait for the response.');
  });

  it('Rule 3: Duplicate request when student already has accepted request is rejected', () => {
    const existing: TutorRequest[] = [
      {
        id: 'req-002',
        student_id: 'student-101',
        tutor_id: 'tutor-user-01',
        subject: 'mathematics',
        class_level: 'class_8',
        learning_needs: 'Exam fundamentals',
        status: 'accepted',
        batch_id: 'batch-1',
        created_at: '2026-11-01T10:00:00Z',
        updated_at: '2026-11-01T10:00:00Z',
      },
    ];

    const result = validateStudentTutorRequest('student-101', 'tutor-user-01', 'batch-1', existing, { 'batch-1': 1 });
    expect(result.allowed).toBe(false);
    expect(result.error).toBe('You already have an active enrolled mentorship with this tutor.');
  });

  it('Rule 4: Multiple different students can independently request the same tutor', () => {
    const existing: TutorRequest[] = [
      {
        id: 'req-001',
        student_id: 'student-101',
        tutor_id: 'tutor-user-01',
        subject: 'mathematics',
        class_level: 'class_8',
        learning_needs: 'Geometry',
        status: 'pending',
        created_at: '2026-11-01T10:00:00Z',
        updated_at: '2026-11-01T10:00:00Z',
      },
    ];

    // Student 102 requesting same tutor
    const resultStudent102 = validateStudentTutorRequest('student-102', 'tutor-user-01', undefined, existing, {});
    expect(resultStudent102.allowed).toBe(true);

    // Student 103 requesting same tutor
    const resultStudent103 = validateStudentTutorRequest('student-103', 'tutor-user-01', undefined, existing, {});
    expect(resultStudent103.allowed).toBe(true);
  });

  it('Rule 5: Request targeting a full batch (enrolled >= 4) is rejected with authoritative full message', () => {
    const capacities = { 'batch-1': 4 }; // full
    const existing: TutorRequest[] = [];

    const result = validateStudentTutorRequest('student-104', 'tutor-user-01', 'batch-1', existing, capacities);
    expect(result.allowed).toBe(false);
    expect(result.error).toBe('This batch is full. Please choose another available batch.');
  });

  it('Rule 6: Rapid tap protection simulation prevents duplicate in-flight submissions', async () => {
    let inFlight = false;
    let submissionCount = 0;

    const submitRequest = async () => {
      if (inFlight) return { success: false, reason: 'locked' };
      inFlight = true;
      try {
        await new Promise((resolve) => setTimeout(resolve, 50));
        submissionCount += 1;
        return { success: true };
      } finally {
        inFlight = false;
      }
    };

    // Simulate 4 rapid clicks within milliseconds
    const results = await Promise.all([
      submitRequest(),
      submitRequest(),
      submitRequest(),
      submitRequest(),
    ]);

    // Exactly 1 submission succeeds, the other 3 were locked out
    expect(submissionCount).toBe(1);
    expect(results.filter((r) => r.success).length).toBe(1);
    expect(results.filter((r) => !r.success && r.reason === 'locked').length).toBe(3);
  });

  it('Rule 7: TutorRequestModal displays "Already Requested" and disables button when active request exists', () => {
    const existingRequests: TutorRequest[] = [
      {
        id: 'req-existing-01',
        student_id: 'student-logged-in',
        tutor_id: 'tutor-user-01',
        subject: 'mathematics',
        class_level: 'class_8',
        learning_needs: 'Help with algebra',
        status: 'pending',
        created_at: '2026-11-01T10:00:00Z',
        updated_at: '2026-11-01T10:00:00Z',
      },
    ];

    render(
      <AuthProvider>
        <MemoryRouter>
          <TutorRequestModal
            isOpen={true}
            onClose={() => {}}
            tutor={dummyTutor}
            existingRequests={existingRequests}
            onSuccess={() => {}}
          />
        </MemoryRouter>
      </AuthProvider>
    );

    // Modal renders active duplicate warning banner
    expect(
      screen.getByText(/you have already requested this tutor\. please wait for the response\./i)
    ).toBeInTheDocument();

    // Submit button is disabled and displays "Already Requested"
    const submitBtn = screen.getByRole('button', { name: /already requested/i });
    expect(submitBtn).toBeInTheDocument();
    expect(submitBtn).toBeDisabled();
  });
});
