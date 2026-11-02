-- Shikshan (ಶಿಕ್ಷಣ) Cloudflare D1 SQLite Database Schema
-- Academic Mentorship & Tutor Discovery Platform for Karnataka School Students

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('student', 'tutor', 'admin')),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  photo_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Student Profiles Table
CREATE TABLE IF NOT EXISTS student_profiles (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  class_level TEXT NOT NULL,
  board TEXT NOT NULL,
  learning_language TEXT NOT NULL,
  subjects TEXT NOT NULL,
  guardian_phone TEXT,
  learning_goals TEXT,
  photo_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Tutor Profiles / Applications Table
CREATE TABLE IF NOT EXISTS tutor_profiles (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  education_level TEXT NOT NULL,
  course_qualification TEXT NOT NULL,
  institution_name TEXT NOT NULL,
  subjects TEXT NOT NULL,
  class_levels TEXT NOT NULL,
  board_familiarity TEXT NOT NULL,
  teaching_languages TEXT NOT NULL,
  bio_intro TEXT NOT NULL,
  teaching_experience TEXT,
  available_days TEXT NOT NULL,
  time_windows TEXT NOT NULL,
  hours_per_day INTEGER DEFAULT 2,
  requested_fee REAL DEFAULT 3000.00,
  fee_amount REAL NOT NULL DEFAULT 3000.00,
  fee_unit TEXT NOT NULL DEFAULT 'per_month',
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
  approval_acknowledged INTEGER DEFAULT 0,
  photo_url TEXT,
  admin_notes TEXT,
  reviewer_message TEXT,
  reviewed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Tutor Batches Table (4 Students Max, 3-Hour Fixed Duration)
CREATE TABLE IF NOT EXISTS tutor_batches (
  id TEXT PRIMARY KEY,
  tutor_id TEXT NOT NULL,
  name TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  days TEXT NOT NULL,
  max_capacity INTEGER DEFAULT 4,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tutor_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 5. Tutor Inquiries / Student Requests Table
CREATE TABLE IF NOT EXISTS tutor_requests (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  tutor_id TEXT NOT NULL,
  batch_id TEXT,
  batch_name TEXT,
  batch_time TEXT,
  subject TEXT NOT NULL,
  class_level TEXT NOT NULL,
  learning_needs TEXT NOT NULL,
  preferred_schedule TEXT,
  guardian_phone TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'accepted', 'declined', 'cancelled', 'terminated')),
  response_message TEXT,
  is_terminated INTEGER DEFAULT 0,
  terminated_at DATETIME,
  terminated_by TEXT,
  termination_reason TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (tutor_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 6. Student Favorite Tutors Table
CREATE TABLE IF NOT EXISTS tutor_favorites (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  tutor_id TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(student_id, tutor_id),
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (tutor_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 7. Payment Coordination Table (Manual Assisted Coordination)
CREATE TABLE IF NOT EXISTS payment_coordinations (
  id TEXT PRIMARY KEY,
  request_id TEXT NOT NULL UNIQUE,
  student_id TEXT NOT NULL,
  tutor_id TEXT NOT NULL,
  monthly_fee REAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'interested' CHECK(status IN ('not_interested', 'interested', 'awaiting_admin_contact', 'payment_pending', 'partially_paid', 'paid', 'cancelled')),
  amount_collected REAL DEFAULT 0.00,
  admin_notes TEXT,
  payment_date DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (request_id) REFERENCES tutor_requests(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (tutor_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 8. Admin Audit Logs
CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id TEXT PRIMARY KEY,
  admin_id TEXT NOT NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  details TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for performance & 1,000-user readiness
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_tutor_profiles_status ON tutor_profiles(status);
CREATE INDEX IF NOT EXISTS idx_student_profiles_user_id ON student_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_tutor_batches_tutor ON tutor_batches(tutor_id);
CREATE INDEX IF NOT EXISTS idx_tutor_requests_batch ON tutor_requests(batch_id);
CREATE INDEX IF NOT EXISTS idx_payment_student ON payment_coordinations(student_id);
CREATE INDEX IF NOT EXISTS idx_payment_tutor ON payment_coordinations(tutor_id);
CREATE INDEX IF NOT EXISTS idx_payment_status ON payment_coordinations(status);
