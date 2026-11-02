import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock matchMedia for responsive / mobile testing
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

// Mock api client for Vitest unit tests so they don't depend on live network
const mockTutors = [
  {
    id: 'app-tutor-1',
    tutor_id: 'tutor-usr-1',
    education_level: 'Graduate (B.Sc Mathematics)',
    course_qualification: 'B.Sc Mathematics & Statistics',
    institution_name: 'Bangalore University',
    subjects: ['mathematics', 'science'],
    class_levels: ['class_6', 'class_7', 'class_8', 'class_9', 'class_10'],
    subject_class_pairs: [{ subject: 'Mathematics', classLevelRange: 'Classes 6–10' }],
    board_familiarity: ['karnataka_state_board', 'cbse'],
    teaching_languages: ['Kannada', 'English'],
    bio_intro: 'Passionate math mentor dedicated to helping rural Karnataka students conquer math anxiety through step-by-step bilingual explanations.',
    teaching_experience: '3+ years tutoring SSLC students in Kannada medium with 95% pass rate.',
    available_days: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat'],
    time_windows: ['evening_prime'],
    hours_per_day: 2,
    fee_amount: 350,
    fee_unit: 'per_hour',
    proposed_rate: 350,
    status: 'approved',
    submitted_at: '2026-10-15T10:00:00Z',
    created_at: '2026-10-15T10:00:00Z',
    updated_at: '2026-10-16T11:00:00Z',
    tutor_profile: {
      id: 'tutor-usr-1',
      role: 'tutor',
      name: 'Anand Kumar Hegde',
      email: 'anand.hegde@shikshan.org',
      phone: '+91 9845012345',
      created_at: '2026-10-15T10:00:00Z',
      updated_at: '2026-10-16T11:00:00Z',
    },
  },
  {
    id: 'app-tutor-2',
    tutor_id: 'tutor-usr-2',
    education_level: 'Postgraduate (Ph.D Physics)',
    course_qualification: 'Ph.D Physics',
    institution_name: 'Mysore University',
    subjects: ['science', 'physics'],
    class_levels: ['class_8', 'class_9', 'class_10'],
    subject_class_pairs: [{ subject: 'Science', classLevelRange: 'Classes 8–10' }],
    board_familiarity: ['karnataka_state_board'],
    teaching_languages: ['Kannada'],
    bio_intro: 'Science researcher and educator specializing in conceptual physics and interactive experiments.',
    teaching_experience: '5+ years experience mentoring secondary school learners.',
    available_days: ['mon', 'wed', 'fri'],
    time_windows: ['evening_prime'],
    hours_per_day: 2,
    fee_amount: 400,
    fee_unit: 'per_hour',
    proposed_rate: 400,
    status: 'approved',
    submitted_at: '2026-10-16T10:00:00Z',
    created_at: '2026-10-16T10:00:00Z',
    updated_at: '2026-10-17T11:00:00Z',
    tutor_profile: {
      id: 'tutor-usr-2',
      role: 'tutor',
      name: 'Dr. Savitha Murthy',
      email: 'savitha.murthy@shikshan.org',
      phone: '+91 9845054321',
      created_at: '2026-10-16T10:00:00Z',
      updated_at: '2026-10-17T11:00:00Z',
    },
  },
];

vi.mock('../lib/api', () => ({
  API_BASE_URL: 'http://127.0.0.1:5000/api',
  getApiBaseUrl: vi.fn(() => 'http://127.0.0.1:5000/api'),
  setCustomApiUrl: vi.fn(),
  getAuthToken: () => 'mock-admin-token',
  setAuthToken: vi.fn(),
  api: {
    checkHealth: vi.fn().mockResolvedValue({ status: 'ok', database: 'connected' }),
    login: vi.fn().mockResolvedValue({
      token: 'mock-admin-token',
      user: {
        id: 'admin-1',
        email: 'abhishekdevanagaon2712005@gmail.com',
        role: 'admin',
        name: 'Shikshan Administrator',
        phone: '9019394446',
      },
    }),
    register: vi.fn().mockResolvedValue({
      token: 'mock-user-token',
      user: { id: 'user-new', email: 'new@example.com', role: 'student', name: 'Student', phone: '9900112233' },
    }),
    getMe: vi.fn().mockResolvedValue({
      user: {
        id: 'admin-1',
        email: 'abhishekdevanagaon2712005@gmail.com',
        role: 'admin',
        name: 'Shikshan Administrator',
        phone: '9019394446',
      },
    }),
    getApprovedTutors: vi.fn().mockImplementation(async (params) => {
      let filtered = [...mockTutors];
      if (params?.search) {
        const q = params.search.toLowerCase();
        filtered = filtered.filter(
          (t) => t.tutor_profile?.name.toLowerCase().includes(q) || t.subjects.join(' ').toLowerCase().includes(q)
        );
      }
      return { tutors: filtered };
    }),
    getTutorDetails: vi.fn().mockImplementation(async (id) => {
      const tutor = mockTutors.find((t) => t.id === id) || mockTutors[0];
      return { tutor };
    }),
    saveStudentProfile: vi.fn().mockResolvedValue({ success: true }),
    getStudentProfile: vi.fn().mockResolvedValue({ profile: null }),
    saveTutorProfile: vi.fn().mockResolvedValue({ success: true }),
    getTutorMyStatus: vi.fn().mockResolvedValue({ application: mockTutors[0] }),
    createTutorRequest: vi.fn().mockResolvedValue({ success: true, requestId: 'req-mock-1' }),
    getStudentRequests: vi.fn().mockResolvedValue({ requests: [] }),
    getTutorRequests: vi.fn().mockResolvedValue({ requests: [] }),
    updateRequestStatus: vi.fn().mockResolvedValue({ success: true }),
    getFavorites: vi.fn().mockResolvedValue({ favorites: [] }),
    toggleFavorite: vi.fn().mockResolvedValue({ isFavorite: true }),
    getAdminApplications: vi.fn().mockResolvedValue({
      applications: [
        {
          id: 'app-tutor-1',
          tutor_id: 'tutor-usr-1',
          education_level: 'Graduate (B.Sc Mathematics)',
          course_qualification: 'B.Sc Mathematics & Statistics',
          institution_name: 'Bangalore University',
          subjects: ['mathematics', 'science'],
          class_levels: ['class_6', 'class_7', 'class_8'],
          subject_class_pairs: [{ subject: 'Mathematics', classLevelRange: 'Classes 6–8' }],
          teaching_languages: ['Kannada', 'English'],
          bio_intro: 'Passionate math mentor dedicated to helping rural Karnataka students.',
          fee_amount: 350,
          fee_unit: 'per_hour',
          status: 'pending_review',
          tutor_profile: {
            id: 'tutor-usr-1',
            role: 'tutor',
            name: 'Pooja Hegde',
            email: 'pooja.h@example.com',
            phone: '+91 9876543210',
          },
        },
      ],
    }),
    getAdminStudents: vi.fn().mockResolvedValue({
      students: [
        {
          id: 'user-stu-1',
          name: 'Chidananda Patil',
          email: 'chidu@example.com',
          phone: '+91 9900112233',
          class_level: 'Class 8',
          board: 'Karnataka State Board',
          learning_language: 'Kannada',
          subjects: ['mathematics', 'science'],
          guardian_phone: '+91 9845012345',
          created_at: '2026-10-20T10:00:00Z',
        },
      ],
    }),
    updateApplicationStatus: vi.fn().mockResolvedValue({ success: true }),
    getPublicTutorBatches: vi.fn().mockResolvedValue({ batches: [] }),
    getTutorBatches: vi.fn().mockResolvedValue({ batches: [] }),
    createTutorBatch: vi.fn().mockResolvedValue({ success: true, batchId: 'batch-mock-1' }),
    deleteTutorBatch: vi.fn().mockResolvedValue({ success: true }),
    getBatchStudents: vi.fn().mockResolvedValue({ batch: { id: 'batch-1', name: 'Math Batch' }, students: [] }),
    assignStudentToBatch: vi.fn().mockResolvedValue({ success: true, message: 'Student assigned' }),
    unassignStudentFromBatch: vi.fn().mockResolvedValue({ success: true, message: 'Student removed' }),
    adminRemoveStudentFromBatch: vi.fn().mockResolvedValue({ success: true, message: 'Student removed from batch enrollment', enrolledCount: 0 }),
    acknowledgeTutorApproval: vi.fn().mockResolvedValue({ success: true, message: 'Acknowledged' }),
    getStudentPayments: vi.fn().mockResolvedValue({ payments: [] }),
    getStudentPaymentCoordinations: vi.fn().mockResolvedValue({ payments: [] }),
    recordPaymentInterest: vi.fn().mockResolvedValue({ success: true, message: 'Interest registered' }),
    getAdminPayments: vi.fn().mockResolvedValue({ payments: [] }),
    updateAdminPayment: vi.fn().mockResolvedValue({ success: true }),
    updateAdminTutorFee: vi.fn().mockResolvedValue({ success: true, monthly_fee: 3000 }),
    getAdminRequests: vi.fn().mockResolvedValue({ requests: [] }),
    getAdminBatches: vi.fn().mockResolvedValue({ batches: [] }),
    getAdminAuditLogs: vi.fn().mockResolvedValue({ audit_logs: [] }),
    getAdminStats: vi.fn().mockResolvedValue({ stats: {} }),
    updateAdminProfile: vi.fn().mockResolvedValue({ success: true }),
    uploadPhoto: vi.fn().mockResolvedValue({ success: true, photo_url: 'https://example.com/photo.jpg' }),
    removePhoto: vi.fn().mockResolvedValue({ success: true }),
  },
}));
