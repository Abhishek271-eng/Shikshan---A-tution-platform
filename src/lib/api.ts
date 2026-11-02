// Production Cloudflare Workers Edge API base URL
export const PRODUCTION_API_URL = 'https://shikshan-api.abhishekdevanagaon2712005.workers.dev/api';

// Determine the API base URL:
// 1. User/Developer override in localStorage: 'shikshan_api_url'
// 2. Vite environment override if specified: VITE_API_URL
// 3. Default to 24/7 Production Cloudflare Workers Edge API
export const getApiBaseUrl = (): string => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const custom = window.localStorage.getItem('shikshan_api_url');
    if (custom && custom.trim().length > 0) {
      return custom.trim().replace(/\/+$/, '');
    }
  }

  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // Default to 24/7 production serverless API so APK works everywhere on Wi-Fi and mobile data
  return PRODUCTION_API_URL;
};

export const setCustomApiUrl = (url: string | null) => {
  if (typeof window !== 'undefined' && window.localStorage) {
    if (url && url.trim().length > 0) {
      window.localStorage.setItem('shikshan_api_url', url.trim().replace(/\/+$/, ''));
    } else {
      window.localStorage.removeItem('shikshan_api_url');
    }
  }
};

let currentToken: string | null = typeof window !== 'undefined' ? localStorage.getItem('shikshan_auth_token') : null;

export const setAuthToken = (token: string | null) => {
  currentToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('shikshan_auth_token', token);
    } else {
      localStorage.removeItem('shikshan_auth_token');
    }
  }
};

export const getAuthToken = (): string | null => {
  if (!currentToken && typeof window !== 'undefined') {
    currentToken = localStorage.getItem('shikshan_auth_token');
  }
  return currentToken;
};

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      // If 401 unauthorized or invalid token, let caller know
      if (res.status === 401 && endpoint !== '/auth/login' && endpoint !== '/auth/register') {
        setAuthToken(null);
      }
      const message = data.error || data.message || `Request failed with status ${res.status}`;
      throw new Error(message);
    }

    return data as T;
  } catch (err: any) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error('Unable to connect to server. Please check your internet connection.');
    }
    throw err;
  }
}

export interface AdminBatchStudent {
  id: string;
  requestId: string;
  studentId: string;
  name: string;
  email: string;
  phone?: string;
  status: string;
  subject?: string;
  classLevel?: string;
  enrolledAt?: string;
}

export interface AdminBatchRecord {
  id: string;
  name: string;
  tutor_id: string;
  tutor_name: string;
  tutor_email?: string;
  tutor_phone?: string;
  subject: string;
  class_level: string;
  start_time: string;
  end_time: string;
  days: string;
  max_capacity: number;
  enrolled_count: number;
  available_seats: number;
  students: AdminBatchStudent[];
  created_at?: string;
}

export const api = {
  // Auth
  register: (payload: {
    email: string;
    password: string;
    name: string;
    phone: string;
    role: 'student' | 'tutor' | 'admin';
    photo_url?: string;
  }) =>
    request<{ token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  login: (payload: { email: string; password: string }) =>
    request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getMe: () => request<{ user: any }>('/auth/me'),

  // Student Profile
  saveStudentProfile: (profile: any) =>
    request<{ success: boolean }>('/student/profile', {
      method: 'POST',
      body: JSON.stringify(profile),
    }),

  getStudentProfile: () => request<{ profile: any }>('/student/profile'),

  // Tutor Profile & Application
  saveTutorProfile: (profile: any) =>
    request<{ success: boolean }>('/tutor/profile', {
      method: 'POST',
      body: JSON.stringify(profile),
    }),

  getTutorMyStatus: () => request<{ application: any }>('/tutor/my-status'),

  acknowledgeTutorApproval: () =>
    request<{ success: boolean; message: string }>('/tutor/acknowledge-approval', {
      method: 'POST',
    }),

  // Batch Management (Strict 4-student capacity, 3-hour fixed duration)
  getTutorBatches: () => request<{ batches: any[] }>('/tutor/batches'),

  getPublicTutorBatches: (tutorId: string) =>
    request<{ batches: any[] }>(`/tutors/${tutorId}/batches`),

  createTutorBatch: (payload: { name: string; start_time: string; end_time: string; days: string[] | string }) =>
    request<{ success: boolean; batchId: string }>('/tutor/batches', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  deleteTutorBatch: (id: string) =>
    request<{ success: boolean }>(`/tutor/batches/${id}`, {
      method: 'DELETE',
    }),

  getBatchStudents: (batchId: string) =>
    request<{ batch: any; students: any[] }>(`/tutor/batches/${batchId}/students`),

  assignStudentToBatch: (batchId: string, requestId: string) =>
    request<{ success: boolean; message: string }>(`/tutor/batches/${batchId}/assign`, {
      method: 'POST',
      body: JSON.stringify({ requestId }),
    }),

  unassignStudentFromBatch: (batchId: string, requestId: string) =>
    request<{ success: boolean; message: string }>(`/tutor/batches/${batchId}/unassign`, {
      method: 'POST',
      body: JSON.stringify({ requestId }),
    }),

  // Public / Approved Tutors Discovery
  getApprovedTutors: (params?: { subject?: string; classLevel?: string; search?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return request<{ tutors: any[] }>(`/tutors${query ? `?${query}` : ''}`);
  },

  getTutorDetails: (id: string) => request<{ tutor: any }>(`/tutors/${id}`),

  // Inquiries / Requests
  createTutorRequest: (payload: {
    tutor_id: string;
    batch_id?: string;
    batch_name?: string;
    batch_time?: string;
    subject: string;
    class_level: string;
    learning_needs: string;
    preferred_schedule?: string;
    guardian_phone?: string;
  }) =>
    request<{ success: boolean; requestId: string }>('/requests', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getStudentRequests: () => request<{ requests: any[] }>('/requests/student'),

  getTutorRequests: () => request<{ requests: any[] }>('/requests/tutor'),

  updateRequestStatus: (id: string, status: string, response_message?: string) =>
    request<{ success: boolean }>(`/requests/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, response_message }),
    }),

  checkHealth: async (customBaseUrl?: string) => {
    const base = customBaseUrl ? customBaseUrl.replace(/\/+$/, '') : getApiBaseUrl();
    const res = await fetch(`${base}/health`);
    if (!res.ok) throw new Error(`Health check returned HTTP ${res.status}`);
    return (await res.json()) as { status: string; database?: string; db?: string };
  },

  // Manual Payment Coordination (Part 13)
  expressPaymentInterest: (requestId: string) =>
    request<{ success: boolean; message: string }>('/payment/interest', {
      method: 'POST',
      body: JSON.stringify({ request_id: requestId }),
    }),

  recordPaymentInterest: (payload: { requestId: string; tutorId?: string; batchId?: string; notes?: string }) =>
    request<{ success: boolean; message: string }>('/payment/interest', {
      method: 'POST',
      body: JSON.stringify({
        request_id: payload.requestId,
        tutor_id: payload.tutorId,
        batch_id: payload.batchId,
        notes: payload.notes,
      }),
    }),

  getStudentPayments: () => request<{ payments: any[] }>('/payment/student'),
  getStudentPaymentCoordinations: () => request<{ payments: any[] }>('/payment/student'),

  getAdminPayments: () => request<{ payments: any[] }>('/payment/admin'),

  updateAdminPayment: (id: string, payload: { status?: string; amount_collected?: number; admin_notes?: string }) =>
    request<{ success: boolean }>(`/payment/admin/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  // Profile Photos
  uploadPhoto: (photoData: string) =>
    request<{ success: boolean; photo_url: string }>('/user/photo', {
      method: 'POST',
      body: JSON.stringify({ photo_url: photoData }),
    }),

  removePhoto: () =>
    request<{ success: boolean }>('/user/photo', {
      method: 'DELETE',
    }),

  // Favorites
  getFavorites: () => request<{ favorites: string[] }>('/favorites'),

  toggleFavorite: (tutor_id: string) =>
    request<{ favorited: boolean }>('/favorites/toggle', {
      method: 'POST',
      body: JSON.stringify({ tutor_id }),
    }),

  // Admin Desk (Protected)
  getAdminApplications: (status?: string) => {
    const query = status ? `?status=${status}` : '';
    return request<{ applications: any[] }>(`/admin/applications${query}`);
  },

  getAdminStudents: (search?: string) => {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return request<{ students: any[] }>(`/admin/students${query}`);
  },

  updateApplicationStatus: (
    id: string,
    payload: {
      status: 'approved' | 'rejected' | 'pending';
      approved_fee?: number;
      admin_notes?: string;
      reviewer_message?: string;
    }
  ) =>
    request<{ success: boolean; message: string }>(`/admin/applications/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  updateAdminTutorFee: (tutorId: string, monthlyFee: number) =>
    request<{ success: boolean; monthly_fee: number }>(`/admin/tutor/${tutorId}/fee`, {
      method: 'PATCH',
      body: JSON.stringify({ monthly_fee: monthlyFee }),
    }),

  getAdminRequests: () => request<{ requests: any[] }>('/admin/requests'),

  getAdminBatches: () => request<{ batches: AdminBatchRecord[] }>('/admin/batches'),

  adminRemoveStudentFromBatch: (
    batchId: string,
    requestIdOrPayload: string | { requestId?: string; studentId?: string },
    reasonData?: { reason?: string; note?: string }
  ) => {
    const payload =
      typeof requestIdOrPayload === 'string'
        ? { requestId: requestIdOrPayload, ...reasonData }
        : { ...requestIdOrPayload, ...reasonData };

    return request<{
      success: boolean;
      message: string;
      batchId?: string;
      requestId?: string;
      studentId?: string;
      enrolledCount?: number;
      availableSeats?: number;
    }>(`/admin/batches/${batchId}/remove-student`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  adminTerminateMentorship: (payload: {
    requestId?: string;
    studentId?: string;
    tutorId?: string;
    batchId?: string;
    reason?: string;
    note?: string;
  }) =>
    request<{
      success: boolean;
      message: string;
      batchId?: string;
      requestId?: string;
      studentId?: string;
      tutorId?: string;
      enrolledCount?: number;
      availableSeats?: number;
    }>('/admin/mentorship/terminate', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getAdminAuditLogs: () => request<{ audit_logs: any[] }>('/admin/audit-logs'),

  getAdminStats: () => request<{ stats: any }>('/admin/stats'),

  updateAdminProfile: (payload: { name?: string; phone?: string; photo_url?: string }) =>
    request<{ success: boolean }>('/admin/profile', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};
