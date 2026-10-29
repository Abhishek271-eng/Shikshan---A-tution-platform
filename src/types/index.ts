export type UserRole = 'tutor' | 'student' | 'admin';

export type TutorApplicationStatus = 'pending_review' | 'approved' | 'rejected' | 'needs_info';

export interface UserProfile {
  id: string;
  role: UserRole;
  name: string;
  email: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface SubjectClassPair {
  subject: string;
  classLevelRange: string; // e.g. "Classes 6–8"
}

export interface TutorApplication {
  id: string;
  tutor_id: string;
  education_level: string;
  course_qualification?: string;
  institution_name?: string;
  subjects: string[];
  class_levels: string[];
  subject_class_pairs: SubjectClassPair[];
  teaching_languages: string[];
  marks_summary?: string;
  commitment_months: 3 | 6;
  available_days: string[];
  time_windows: string[];
  hours_per_day: number;
  proposed_rate?: number;
  status: TutorApplicationStatus;
  applicant_message?: string;
  submitted_at: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
  // Join fields for review
  tutor_profile?: UserProfile;
}

export interface StudentProfile {
  id: string;
  student_id: string;
  class_level: string;
  board: string;
  learning_language: string;
  subjects: string[];
  guardian_phone?: string;
  guardian_consent: boolean;
  created_at: string;
  updated_at: string;
  student_profile?: UserProfile;
}

export interface TutorDocument {
  id: string;
  tutor_id: string;
  application_id?: string;
  file_path: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  document_category: string;
  created_at: string;
  signed_url?: string;
}

export interface AdminReviewHistory {
  id: string;
  application_id: string;
  reviewer_id: string;
  action: 'approved' | 'rejected' | 'needs_info' | 'note_added';
  internal_note?: string;
  applicant_message?: string;
  created_at: string;
  reviewer_name?: string;
}

export interface AuthState {
  user: { id: string; email: string } | null;
  profile: UserProfile | null;
  tutorApplication: TutorApplication | null;
  studentProfile: StudentProfile | null;
  isLoading: boolean;
  isConfigured: boolean;
  error: string | null;
}
