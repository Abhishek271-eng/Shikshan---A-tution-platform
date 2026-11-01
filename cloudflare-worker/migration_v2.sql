-- Safe Migration v2 for Shikshan (ಶಿಕ್ಷಣ) D1 Database
-- Adds requested_fee and approval_acknowledged to tutor_profiles
-- Adds batch fields to tutor_requests
-- Creates tutor_batches, payment_coordinations, and admin_audit_logs

ALTER TABLE tutor_profiles ADD COLUMN requested_fee REAL DEFAULT 3000.00;
ALTER TABLE tutor_profiles ADD COLUMN approval_acknowledged INTEGER DEFAULT 0;

ALTER TABLE tutor_requests ADD COLUMN batch_id TEXT;
ALTER TABLE tutor_requests ADD COLUMN batch_name TEXT;
ALTER TABLE tutor_requests ADD COLUMN batch_time TEXT;

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

CREATE INDEX IF NOT EXISTS idx_tutor_batches_tutor ON tutor_batches(tutor_id);
CREATE INDEX IF NOT EXISTS idx_tutor_requests_batch ON tutor_requests(batch_id);
CREATE INDEX IF NOT EXISTS idx_payment_student ON payment_coordinations(student_id);
CREATE INDEX IF NOT EXISTS idx_payment_tutor ON payment_coordinations(tutor_id);
CREATE INDEX IF NOT EXISTS idx_payment_status ON payment_coordinations(status);
