export type UserRole = 'tutor' | 'student' | 'admin';

export type TutorApplicationStatus = 'pending' | 'pending_review' | 'approved' | 'rejected' | 'needs_info';

export type FeeUnit = 'per_hour' | 'per_session' | 'per_month';

export type TutorRequestStatus = 'pending' | 'accepted' | 'declined' | 'cancelled' | 'completed' | 'terminated';

export interface UserProfile {
  id: string;
  role: UserRole;
  name: string;
  email: string;
  phone?: string;
  photo_url?: string;
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
  board_familiarity?: string[];
  teaching_languages: string[];
  marks_summary?: string;
  bio_intro?: string;
  teaching_experience?: string;
  commitment_months?: number; // Optional now, NOT mandatory
  available_days: string[];
  time_windows: string[];
  hours_per_day: number;
  proposed_rate?: number;
  fee_amount?: number;
  fee_unit?: FeeUnit;
  photo_url?: string;
  status: TutorApplicationStatus;
  applicant_message?: string;
  is_phone_revealed?: boolean;
  approved_fee?: number;
  requested_fee?: number;
  approval_acknowledged?: number | boolean;
  submitted_at: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
  // Join fields for discovery & review
  tutor_profile?: UserProfile;
}

export interface StudentProfile {
  id: string;
  student_id: string;
  class_level: string;
  board: string;
  learning_language: string;
  subjects: string[];
  learning_goals?: string;
  guardian_phone?: string;
  guardian_consent: boolean;
  photo_url?: string;
  created_at: string;
  updated_at: string;
  student_profile?: UserProfile;
}

export interface TutorRequest {
  id: string;
  student_id: string;
  tutor_id: string;
  subject: string;
  class_level: string;
  learning_needs: string;
  preferred_schedule?: string;
  guardian_phone?: string;
  batch_id?: string;
  batch_name?: string;
  batch_time?: string;
  is_terminated?: number;
  terminated_at?: string;
  terminated_by?: string;
  termination_reason?: string;
  fee?: number;
  status: TutorRequestStatus;
  response_message?: string;
  created_at: string;
  updated_at: string;
  student_name?: string;
  student_email?: string;
  student_phone?: string;
  tutor_name?: string;
  tutor_email?: string;
  tutor_phone?: string;
  tutor_profile?: UserProfile;
  tutor_application?: TutorApplication;
  student_profile?: UserProfile;
  student_academic?: StudentProfile;
}

export interface TutorFavorite {
  id: string;
  student_id: string;
  tutor_id: string;
  created_at: string;
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
  user: { id: string; email: string; role?: UserRole; name?: string; phone?: string; photo_url?: string } | null;
  profile: UserProfile | null;
  tutorApplication: TutorApplication | null;
  studentProfile: StudentProfile | null;
  isLoading: boolean;
  isConfigured?: boolean;
  isAuthenticated?: boolean;
  error?: string | null;
}
