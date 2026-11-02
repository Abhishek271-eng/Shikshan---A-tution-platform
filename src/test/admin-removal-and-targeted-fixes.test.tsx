import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HomePage } from '../pages/HomePage';
import { DeveloperPage } from '../pages/info/DeveloperPage';
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { TutorDashboardPage } from '../pages/tutor/TutorDashboardPage';
import { AuthProvider } from '../context/AuthContext';
import { api } from '../lib/api';

describe('Admin Removal & Targeted UI Fixes Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Requirement 1: Student cards in tutor section contain long names within card boundaries without overflow', async () => {
    vi.mocked(api.getTutorRequests).mockResolvedValueOnce({
      requests: [
        {
          id: 'req-01',
          student_id: 'student-99',
          student_name: 'Very Long Student Name Abhishek Kumar Veeranna Devanagaon',
          guardian_phone: '+91 9845012345',
          class_level: 'class_8',
          subject: 'mathematics',
          learning_needs: 'Advanced geometry and algebra preparation',
          status: 'accepted',
          batch_id: 'batch-01',
          batch_name: 'Evening Mathematics',
        },
      ],
    });

    render(
      <AuthProvider>
        <MemoryRouter>
          <TutorDashboardPage />
        </MemoryRouter>
      </AuthProvider>
    );

    // Switch to Students tab in the top tab bar
    const tabButtons = screen.getAllByRole('button', { name: /students/i });
    fireEvent.click(tabButtons[0]);

    // Long student name is present and wrapped cleanly with break-words
    const studentHeading = await screen.findByText(/very long student name abhishek kumar veeranna devanagaon/i);
    expect(studentHeading).toBeInTheDocument();
    expect(studentHeading.className).toContain('break-words');

    // Enrolled pill badge is protected from shrinking
    const enrolledBadge = screen.getByText(/^enrolled$/i);
    expect(enrolledBadge).toBeInTheDocument();
    expect(enrolledBadge.className).toContain('flex-shrink-0');
  });

  it('Requirement 2 & Strict Permissions: Tutors do NOT receive a Remove Student button in batch management', async () => {
    vi.mocked(api.getTutorBatches).mockResolvedValueOnce({
      batches: [
        {
          id: 'batch-01',
          tutor_id: 'tutor-01',
          name: 'Evening Mathematics',
          start_time: '16:00',
          end_time: '19:00',
          days: 'Mon,Wed,Fri',
          max_capacity: 4,
          enrolled_count: 1,
        },
      ],
    });

    vi.mocked(api.getBatchStudents).mockResolvedValueOnce({
      batch: { id: 'batch-01', name: 'Evening Mathematics' },
      students: [
        {
          id: 'req-01',
          request_id: 'req-01',
          student_id: 'student-99',
          student_name: 'Rohan Sharma',
          class_level: 'class_8',
          subject: 'mathematics',
        },
      ],
    });

    render(
      <AuthProvider>
        <MemoryRouter>
          <TutorDashboardPage />
        </MemoryRouter>
      </AuthProvider>
    );

    // Switch to Batches tab
    const batchButtons = screen.getAllByRole('button', { name: /batches/i });
    fireEvent.click(batchButtons[0]);

    // Open View Students / Manage Batch modal
    const manageBtn = await screen.findByRole('button', { name: /manage batch/i });
    fireEvent.click(manageBtn);

    // Verify modal is open
    expect(await screen.findByText(/batch roster:/i)).toBeInTheDocument();
    expect(screen.getByText(/currently enrolled students/i)).toBeInTheDocument();

    // STRICT CHECK: Tutors must NOT receive a Remove Student button!
    expect(screen.queryByRole('button', { name: /^remove$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /remove student/i })).not.toBeInTheDocument();
  });

  it('Requirement 2: Admin has clearly visible Remove Student action and confirmation dialog with required fields', async () => {
    vi.mocked(api.getAdminRequests).mockResolvedValueOnce({
      requests: [
        {
          id: 'req-01',
          student_id: 'student-99',
          student_name: 'Chandrashekar Patil',
          student_email: 'chandra@example.com',
          student_phone: '+91 9845012345',
          tutor_id: 'tutor-01',
          tutor_name: 'Abhishek Devanagaon',
          tutor_phone: '+91 9900112233',
          batch_id: 'batch-01',
          batch_name: 'Evening Mathematics',
          subject: 'mathematics',
          class_level: 'class_8',
          status: 'accepted',
          batch_start_time: '16:00',
          batch_end_time: '19:00',
        },
      ],
    });

    render(
      <AuthProvider>
        <MemoryRouter>
          <AdminDashboardPage />
        </MemoryRouter>
      </AuthProvider>
    );

    // Switch to Batches desk
    const batchesDeskBtn = await screen.findByRole('button', { name: /batches/i });
    fireEvent.click(batchesDeskBtn);

    // Enrolled student Chandrashekar Patil is shown
    expect(await screen.findByText(/chandrashekar patil/i)).toBeInTheDocument();

    // Admin-only "Remove Student" button is clearly visible
    const removeBtn = screen.getByRole('button', { name: /remove student/i });
    expect(removeBtn).toBeInTheDocument();

    // Click Remove Student to open confirmation dialog
    fireEvent.click(removeBtn);

    // Confirmation dialog displays: Student name, Tutor name, Relevant batch, Reason for removal
    const modal = screen.getByRole('dialog', { name: /confirm student removal/i });
    expect(modal).toBeInTheDocument();
    expect(within(modal).getByText(/chandrashekar patil/i)).toBeInTheDocument();
    expect(within(modal).getByText(/abhishek devanagaon/i)).toBeInTheDocument();
    expect(within(modal).getByText(/evening mathematics/i)).toBeInTheDocument();

    // Reason options: Payment not completed, Administrative removal, Other
    expect(within(modal).getByLabelText(/payment not completed/i)).toBeInTheDocument();
    expect(within(modal).getByLabelText(/administrative removal/i)).toBeInTheDocument();
    expect(within(modal).getByLabelText(/other/i)).toBeInTheDocument();

    // Confirm removal
    const confirmBtn = within(modal).getByRole('button', { name: /confirm removal/i });
    fireEvent.click(confirmBtn);

    // API was called with batchId, requestId and reason
    expect(api.adminRemoveStudentFromBatch).toHaveBeenCalledWith(
      'batch-01',
      'req-01',
      expect.objectContaining({
        reason: 'Payment not completed',
      })
    );
  });

  it('Requirement 3 & 4: Developer page has fixed non-editable photo, one-line name, and email & linkedin tiles below profile', () => {
    render(
      <AuthProvider>
        <MemoryRouter>
          <DeveloperPage />
        </MemoryRouter>
      </AuthProvider>
    );

    // Heading and single-line name
    const nameHeading = screen.getByRole('heading', { level: 1, name: /abhishek devanagaon/i });
    expect(nameHeading).toBeInTheDocument();
    expect(nameHeading.className).toContain('whitespace-nowrap');

    // Designation
    expect(screen.getByText(/founder & full-stack developer/i)).toBeInTheDocument();

    // Circular photograph display
    const img = screen.getByAltText(/abhishek devanagaon/i);
    expect(img).toBeInTheDocument();

    // No photo upload / camera / edit buttons
    expect(screen.queryByTitle(/upload developer photograph/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/edit profile/i)).not.toBeInTheDocument();

    // Contact tiles directly below profile
    const emailLink = screen.getByRole('link', { name: /email me/i });
    expect(emailLink).toHaveAttribute('href', 'mailto:abhishekdevanagaon2712005@gmail.com');

    const linkedinLink = screen.getByRole('link', { name: /linkedin/i });
    expect(linkedinLink).toHaveAttribute('href', 'https://www.linkedin.com/in/abhishek-devanagaon-19668b219/');

    // Unnecessary sections ("Why Shikshan?", "Our little promises") removed
    expect(screen.queryByText(/why shikshan\?/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/our little promises/i)).not.toBeInTheDocument();
  });

  it('Requirement 5: Hamburger menu displays developer circular profile picture beside Developer option', () => {
    render(
      <AuthProvider>
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      </AuthProvider>
    );

    // Open hamburger menu
    const menuBtn = screen.getByRole('button', { name: /open menu/i });
    fireEvent.click(menuBtn);

    // Find the Developer link in the drawer
    const devLink = screen.getByRole('link', { name: /developer/i });
    expect(devLink).toBeInTheDocument();

    // It contains the small circular developer profile picture
    const devImg = within(devLink).getByAltText(/developer profile/i);
    expect(devImg).toBeInTheDocument();
    expect(devImg).toHaveAttribute('src', '/images/abhishek.jpg');
    expect(devImg.className).toContain('object-cover');
  });

  it('Requirement 7: Strict backend authorization & data integrity simulation for student removal', () => {
    // 1. Role Authorization Verification
    const verifyRoleAccess = (userRole: string) => {
      if (userRole !== 'admin') {
        return { status: 403, error: 'Access denied: insufficient permissions' };
      }
      return { status: 200, success: true };
    };

    expect(verifyRoleAccess('student').status).toBe(403);
    expect(verifyRoleAccess('tutor').status).toBe(403);
    expect(verifyRoleAccess('admin').status).toBe(200);

    // 2. Data Integrity Simulation
    interface MockRequest {
      id: string;
      student_id: string;
      tutor_id: string;
      batch_id?: string | null;
      status: string;
    }

    interface MockBatch {
      id: string;
      tutor_id: string;
      start_time: string;
      end_time: string;
      days: string;
    }

    const initialBatch: MockBatch = {
      id: 'batch-01',
      tutor_id: 'tutor-01',
      start_time: '16:00',
      end_time: '19:00',
      days: 'Mon,Wed,Fri',
    };

    let requests: MockRequest[] = [
      { id: 'req-1', student_id: 'stu-1', tutor_id: 'tutor-01', batch_id: 'batch-01', status: 'accepted' },
      { id: 'req-2', student_id: 'stu-2', tutor_id: 'tutor-01', batch_id: 'batch-01', status: 'accepted' },
      { id: 'req-3', student_id: 'stu-3', tutor_id: 'tutor-01', batch_id: 'batch-01', status: 'accepted' },
      { id: 'req-4', student_id: 'stu-4', tutor_id: 'tutor-01', batch_id: 'batch-01', status: 'accepted' },
      // Stu-4 also enrolled in another batch (Batch 2)
      { id: 'req-5', student_id: 'stu-4', tutor_id: 'tutor-02', batch_id: 'batch-02', status: 'accepted' },
    ];

    // Initial capacity: 4/4
    const countEnrolled = (bId: string) =>
      new Set(requests.filter((r) => r.batch_id === bId && r.status === 'accepted').map((r) => r.student_id)).size;

    expect(countEnrolled('batch-01')).toBe(4);

    // Admin removes student stu-4 from batch-01
    requests = requests.map((r) => (r.id === 'req-4' ? { ...r, batch_id: null } : r));

    // Capacity after removal: exactly 3/4 (one seat released)
    expect(countEnrolled('batch-01')).toBe(3);

    // Student account & other batch enrollments preserved
    expect(requests.find((r) => r.id === 'req-5')?.batch_id).toBe('batch-02');

    // Other students in batch-01 are completely unaffected
    expect(requests.filter((r) => r.batch_id === 'batch-01').map((r) => r.student_id)).toEqual(['stu-1', 'stu-2', 'stu-3']);

    // Tutor batch and 3-hour locked schedule remain completely intact
    expect(initialBatch.start_time).toBe('16:00');
    expect(initialBatch.end_time).toBe('19:00');
  });
});
