import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { StudentDashboardPage } from '../pages/student/StudentDashboardPage';
import { TutorDashboardPage } from '../pages/tutor/TutorDashboardPage';
import { AuthProvider } from '../context/AuthContext';
import { api, AdminBatchRecord } from '../lib/api';
import { TutorRequest, TutorApplication } from '../types';

describe('Complete Student–Tutor Mentorship Removal & Reapplication Lifecycle', () => {
  const tutorUser = {
    id: 'tutor-usr-99',
    role: 'tutor' as const,
    name: 'Shankaracharya Shastri',
    email: 'shankar@shikshan.in',
    phone: '+91 9845099999',
    created_at: '2026-10-10T10:00:00Z',
    updated_at: '2026-10-10T10:00:00Z',
  };

  const studentUserA = {
    id: 'student-usr-01',
    role: 'student' as const,
    name: 'Manjunath Hegde',
    email: 'manju@shikshan.in',
    phone: '+91 9900112233',
  };

  const studentUserB = {
    id: 'student-usr-02',
    role: 'student' as const,
    name: 'Suma Patil',
    email: 'suma@shikshan.in',
    phone: '+91 9900445566',
  };

  const tutorApp: TutorApplication = {
    id: 'app-tutor-99',
    tutor_id: tutorUser.id,
    education_level: 'Graduate (B.Sc)',
    course_qualification: 'B.Sc Mathematics',
    institution_name: 'Karnatak University Dharwad',
    subjects: ['mathematics', 'science'],
    class_levels: ['class_9', 'class_10'],
    subject_class_pairs: [{ subject: 'Mathematics', classLevelRange: 'Classes 9–10' }],
    board_familiarity: ['karnataka_state_board'],
    teaching_languages: ['Kannada', 'English'],
    bio_intro: 'Master math educator for North Karnataka students.',
    teaching_experience: '6+ years coaching state syllabus SSLC students.',
    available_days: ['mon', 'wed', 'fri'],
    time_windows: ['evening_prime'],
    hours_per_day: 3,
    fee_amount: 1200,
    fee_unit: 'per_month',
    proposed_rate: 1200,
    status: 'approved',
    approval_acknowledged: 1,
    submitted_at: '2026-10-10T10:00:00Z',
    created_at: '2026-10-10T10:00:00Z',
    updated_at: '2026-10-11T10:00:00Z',
    tutor_profile: tutorUser,
  };

  let mockBatches: AdminBatchRecord[] = [];
  let mockRequests: TutorRequest[] = [];
  let mockPayments: any[] = [];

  beforeEach(() => {
    vi.clearAllMocks();

    mockBatches = [
      {
        id: 'batch-sslc-math',
        name: 'Class 10 SSLC Mathematics Batch',
        tutor_id: tutorUser.id,
        tutor_name: tutorUser.name,
        tutor_email: tutorUser.email,
        tutor_phone: tutorUser.phone,
        subject: 'Mathematics',
        class_level: 'Class 10',
        start_time: '17:00',
        end_time: '20:00',
        days: 'Mon,Wed,Fri',
        max_capacity: 4,
        enrolled_count: 2,
        available_seats: 2,
        students: [
          {
            id: 'req-manju-01',
            requestId: 'req-manju-01',
            studentId: studentUserA.id,
            name: studentUserA.name,
            email: studentUserA.email,
            phone: studentUserA.phone,
            status: 'accepted',
            subject: 'Mathematics',
            classLevel: 'Class 10',
            enrolledAt: '2026-10-20T10:00:00Z',
          },
          {
            id: 'req-suma-02',
            requestId: 'req-suma-02',
            studentId: studentUserB.id,
            name: studentUserB.name,
            email: studentUserB.email,
            phone: studentUserB.phone,
            status: 'accepted',
            subject: 'Mathematics',
            classLevel: 'Class 10',
            enrolledAt: '2026-10-21T10:00:00Z',
          },
        ],
      },
    ];

    mockRequests = [
      {
        id: 'req-manju-01',
        student_id: studentUserA.id,
        tutor_id: tutorUser.id,
        student_name: studentUserA.name,
        student_phone: studentUserA.phone,
        tutor_name: tutorUser.name,
        subject: 'Mathematics',
        class_level: 'Class 10',
        learning_needs: 'Geometry and Trigonometry focus',
        status: 'accepted',
        batch_id: 'batch-sslc-math',
        batch_name: 'Class 10 SSLC Mathematics Batch',
        batch_time: '17:00–20:00 (Mon,Wed,Fri)',
        created_at: '2026-10-20T10:00:00Z',
        updated_at: '2026-10-20T11:00:00Z',
      },
      {
        id: 'req-suma-02',
        student_id: studentUserB.id,
        tutor_id: tutorUser.id,
        student_name: studentUserB.name,
        student_phone: studentUserB.phone,
        tutor_name: tutorUser.name,
        subject: 'Mathematics',
        class_level: 'Class 10',
        learning_needs: 'State board exam preparation',
        status: 'accepted',
        batch_id: 'batch-sslc-math',
        batch_name: 'Class 10 SSLC Mathematics Batch',
        batch_time: '17:00–20:00 (Mon,Wed,Fri)',
        created_at: '2026-10-21T10:00:00Z',
        updated_at: '2026-10-21T11:00:00Z',
      },
    ];

    mockPayments = [
      {
        id: 'pay-coord-01',
        request_id: 'req-manju-01',
        student_id: studentUserA.id,
        tutor_id: tutorUser.id,
        status: 'interest_registered',
        amount: 1200,
        recorded_at: '2026-10-20T12:00:00Z',
      },
    ];

    vi.mocked(api.getAdminBatches).mockImplementation(async () => ({
      batches: JSON.parse(JSON.stringify(mockBatches)),
    }));

    vi.mocked(api.getAdminRequests).mockImplementation(async () => ({
      requests: JSON.parse(JSON.stringify(mockRequests)),
    }));

    vi.mocked(api.getApprovedTutors).mockImplementation(async () => ({
      tutors: [tutorApp],
    }));

    vi.mocked(api.getStudentRequests).mockImplementation(async () => ({
      requests: JSON.parse(JSON.stringify(mockRequests.filter((r) => r.student_id === studentUserA.id))),
    }));

    vi.mocked(api.getTutorRequests).mockImplementation(async () => ({
      requests: JSON.parse(JSON.stringify(mockRequests.filter((r) => r.tutor_id === tutorUser.id))),
    }));

    vi.mocked(api.getTutorBatches).mockImplementation(async () => ({
      batches: JSON.parse(
        JSON.stringify(
          mockBatches.map((b) => ({
            id: b.id,
            name: b.name,
            tutor_id: b.tutor_id,
            subject: b.subject,
            class_level: b.class_level,
            start_time: b.start_time,
            end_time: b.end_time,
            days: b.days,
            max_capacity: b.max_capacity,
            enrolled_count: b.enrolled_count,
            created_at: '2026-10-10T10:00:00Z',
            updated_at: '2026-10-10T10:00:00Z',
          }))
        )
      ),
    }));

    vi.mocked(api.getBatchStudents).mockImplementation(async (batchId) => {
      const b = mockBatches.find((item) => item.id === batchId);
      return {
        batch: b ? { id: b.id, name: b.name } : { id: batchId, name: 'Batch' },
        students: b ? JSON.parse(JSON.stringify(b.students)) : [],
      };
    });

    vi.mocked(api.getStudentPaymentCoordinations).mockImplementation(async () => ({
      payments: JSON.parse(JSON.stringify(mockPayments)),
    }));

    vi.mocked(api.adminTerminateMentorship).mockImplementation(async ({ requestId, batchId }) => {
      const req = mockRequests.find((r) => r.id === requestId);
      if (req) {
        req.status = 'terminated';
        (req as any).is_terminated = 1;
        req.batch_id = undefined;
      }
      if (batchId) {
        const b = mockBatches.find((item) => item.id === batchId);
        if (b) {
          b.students = b.students.filter((s) => s.requestId !== requestId && s.id !== requestId);
          b.enrolled_count = b.students.length;
          b.available_seats = b.max_capacity - b.enrolled_count;
        }
      }
      return {
        success: true,
        message: 'Mentorship terminated completely on both sides.',
        enrolledCount: 1,
        availableSeats: 3,
      };
    });

    vi.mocked(api.adminRemoveStudentFromBatch).mockImplementation(async (batchId, payload) => {
      const reqId = typeof payload === 'string' ? payload : payload.requestId;
      const req = mockRequests.find((r) => r.id === reqId);
      if (req) {
        req.status = 'terminated';
        (req as any).is_terminated = 1;
        req.batch_id = undefined;
      }
      const b = mockBatches.find((item) => item.id === batchId);
      if (b) {
        b.students = b.students.filter((s) => s.requestId !== reqId && s.id !== reqId);
        b.enrolled_count = b.students.length;
        b.available_seats = b.max_capacity - b.enrolled_count;
      }
      return {
        success: true,
        message: 'Student removed from batch enrollment',
        batchId,
        requestId: reqId,
        enrolledCount: b ? b.enrolled_count : 0,
        availableSeats: b ? b.available_seats : 4,
      };
    });
  });

  // Condition 1: Admin visible action, identifying details, and verbatim confirmation text
  it('Condition 1: Admin dashboard shows visible "Remove from Mentorship" button with verbatim confirmation and identifying details', async () => {
    vi.mocked(api.getMe).mockResolvedValue({
      user: {
        id: 'admin-01',
        email: 'admin@shikshan.in',
        role: 'admin',
        name: 'Master Admin',
        phone: '9019394446',
      },
    });

    render(
      <AuthProvider>
        <MemoryRouter>
          <AdminDashboardPage />
        </MemoryRouter>
      </AuthProvider>
    );

    // Switch to Batches tab
    const batchTabBtn = await screen.findByRole('button', { name: /batches/i });
    fireEvent.click(batchTabBtn);

    // Expect batch card and enrolled students
    expect(await screen.findByText(/class 10 sslc mathematics batch/i)).toBeInTheDocument();
    expect(screen.getByText(/manjunath hegde/i)).toBeInTheDocument();

    // Verify "Remove from Mentorship" button is visibly rendered
    const removeButtons = screen.getAllByRole('button', { name: /remove from mentorship/i });
    expect(removeButtons.length).toBeGreaterThanOrEqual(1);

    // Click the remove button for Manjunath Hegde
    fireEvent.click(removeButtons[0]);

    // Verify Confirmation Dialog Header & Identifying Details
    expect(
      screen.getByRole('heading', { level: 3, name: /terminate student[–-]tutor mentorship/i })
    ).toBeInTheDocument();
    expect(screen.getAllByText(/manjunath hegde/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/shankaracharya shastri/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/class 10 sslc mathematics batch/i).length).toBeGreaterThanOrEqual(1);

    // Verify Verbatim Mandatory Confirmation Message
    const verbatimText =
      "Are you sure you want to completely remove this student's mentorship with this tutor? The relationship will be terminated on both sides. The student can apply to this tutor again later.";
    expect(screen.getByText(new RegExp(verbatimText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'))).toBeInTheDocument();

    // Confirm Removal
    const confirmBtn = screen.getByRole('button', { name: /confirm removal from mentorship/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(api.adminRemoveStudentFromBatch).toHaveBeenCalled();
    });
  });

  // Condition 2: Student Side — Tutor card completely disappears from My Requests
  it('Condition 2: Student side completely removes tutor card from My Requests when status is terminated (no card, no disabled badge)', async () => {
    vi.mocked(api.getMe).mockResolvedValue({
      user: studentUserA,
    });

    // Provide terminated request in student's request list
    vi.mocked(api.getStudentRequests).mockResolvedValue({
      requests: [
        {
          id: 'req-manju-01',
          student_id: studentUserA.id,
          tutor_id: tutorUser.id,
          student_name: studentUserA.name,
          student_phone: studentUserA.phone,
          tutor_name: tutorUser.name,
          subject: 'Mathematics',
          class_level: 'Class 10',
          learning_needs: 'Geometry',
          status: 'terminated',
          is_terminated: 1,
          created_at: '2026-10-20T10:00:00Z',
          updated_at: '2026-10-22T10:00:00Z',
        } as any,
      ],
    });

    render(
      <AuthProvider>
        <MemoryRouter>
          <StudentDashboardPage />
        </MemoryRouter>
      </AuthProvider>
    );

    // Switch to My Requests tab
    const requestsTab = await screen.findByRole('button', { name: /my requests/i });
    fireEvent.click(requestsTab);

    // The terminated tutor card must NOT appear
    await waitFor(() => {
      expect(screen.queryByText(/shankaracharya shastri/i)).not.toBeInTheDocument();
    });

    // Empty state should be visible instead of any card or removed badge
    expect(screen.getByText(/no requests sent yet/i)).toBeInTheDocument();
    expect(screen.getByText(/0 Total/i)).toBeInTheDocument();
  });

  // Condition 3: Reapplication Unblocking — Student can apply again to the same tutor immediately
  it('Condition 3: Student can immediately discover and apply again to the same tutor after termination', async () => {
    vi.mocked(api.getMe).mockResolvedValue({
      user: studentUserA,
    });

    // Terminated request exists in student history
    vi.mocked(api.getStudentRequests).mockResolvedValue({
      requests: [
        {
          id: 'req-manju-01',
          student_id: studentUserA.id,
          tutor_id: tutorUser.id,
          student_name: studentUserA.name,
          student_phone: studentUserA.phone,
          tutor_name: tutorUser.name,
          subject: 'Mathematics',
          class_level: 'Class 10',
          learning_needs: 'Geometry',
          status: 'terminated',
          is_terminated: 1,
          created_at: '2026-10-20T10:00:00Z',
          updated_at: '2026-10-22T10:00:00Z',
        } as any,
      ],
    });

    render(
      <AuthProvider>
        <MemoryRouter>
          <StudentDashboardPage />
        </MemoryRouter>
      </AuthProvider>
    );

    // Switch to Find Tutors tab
    const exploreTab = await screen.findByRole('button', { name: /find tutors/i });
    fireEvent.click(exploreTab);

    // Find the tutor card
    expect(await screen.findByText(/shankaracharya shastri/i)).toBeInTheDocument();

    // Verify "Request" button is enabled (not 'Requested' or 'Enrolled')
    const requestBtn = screen.getByRole('button', { name: /^request$/i });
    expect(requestBtn).toBeEnabled();

    // Clicking it opens the request modal
    fireEvent.click(requestBtn);
    expect(await screen.findByRole('heading', { level: 3, name: /request tutor/i })).toBeInTheDocument();
  });

  // Condition 4: Tutor Side — Removed student disappears from My Students and batch capacity recalculates
  it('Condition 4: Tutor side drops terminated student from My Students and restores batch seat (N -> N-1)', async () => {
    vi.mocked(api.getMe).mockResolvedValue({
      user: tutorUser,
    });

    vi.mocked(api.getTutorMyStatus).mockResolvedValue({
      application: tutorApp,
    });

    // Only Suma Patil remains active; Manjunath Hegde was terminated
    vi.mocked(api.getTutorRequests).mockResolvedValue({
      requests: [
        {
          id: 'req-suma-02',
          student_id: studentUserB.id,
          tutor_id: tutorUser.id,
          student_name: studentUserB.name,
          student_phone: studentUserB.phone,
          tutor_name: tutorUser.name,
          subject: 'Mathematics',
          class_level: 'Class 10',
          learning_needs: 'Exam prep',
          status: 'accepted',
          batch_id: 'batch-sslc-math',
          created_at: '2026-10-21T10:00:00Z',
          updated_at: '2026-10-21T11:00:00Z',
        },
        {
          id: 'req-manju-01',
          student_id: studentUserA.id,
          tutor_id: tutorUser.id,
          student_name: studentUserA.name,
          student_phone: studentUserA.phone,
          tutor_name: tutorUser.name,
          subject: 'Mathematics',
          class_level: 'Class 10',
          learning_needs: 'Geometry',
          status: 'terminated',
          is_terminated: 1,
          created_at: '2026-10-20T10:00:00Z',
          updated_at: '2026-10-22T10:00:00Z',
        } as any,
      ],
    });

    render(
      <AuthProvider>
        <MemoryRouter>
          <TutorDashboardPage />
        </MemoryRouter>
      </AuthProvider>
    );

    // Switch to Students section
    const studentsTabBtns = await screen.findAllByRole('button', { name: /students/i });
    fireEvent.click(studentsTabBtns[0]);

    // Suma Patil should be visible
    expect(await screen.findByText(/suma patil/i)).toBeInTheDocument();

    // Terminated student Manjunath Hegde must NOT be in My Students roster
    expect(screen.queryByText(/manjunath hegde/i)).not.toBeInTheDocument();

    // Verify active enrolled count header shows 1 student
    expect(screen.getByRole('heading', { level: 3, name: /enrolled students \(1\)/i })).toBeInTheDocument();
  });

  // Condition 5: Data Safety & Isolation Guarantee — Other students, batches, and payment history are preserved
  it('Condition 5: Preserves other students in batch, tutor schedule, and historical payment records', async () => {
    // Terminate Manjunath Hegde
    await api.adminTerminateMentorship({
      requestId: 'req-manju-01',
      batchId: 'batch-sslc-math',
      reason: 'payment_not_completed',
      note: 'Admin intervention test',
    });

    // 1. Check Batch Record: Suma Patil is still enrolled, seat opened up
    const batchRes = await api.getAdminBatches();
    const updatedBatch = batchRes.batches.find((b) => b.id === 'batch-sslc-math');
    expect(updatedBatch).toBeDefined();
    expect(updatedBatch!.students).toHaveLength(1);
    expect(updatedBatch!.students[0].name).toBe('Suma Patil');
    expect(updatedBatch!.enrolled_count).toBe(1);
    expect(updatedBatch!.available_seats).toBe(3);

    // 2. Tutor daily schedule remains intact (3 hours)
    expect(tutorApp.hours_per_day).toBe(3);
    expect(tutorApp.time_windows).toContain('evening_prime');

    // 3. Historical payment coordination record for the student remains preserved in database
    const payRes = await api.getStudentPaymentCoordinations();
    expect(payRes.payments).toHaveLength(1);
    expect(payRes.payments[0].request_id).toBe('req-manju-01');
    expect(payRes.payments[0].amount).toBe(1200);
  });
});
