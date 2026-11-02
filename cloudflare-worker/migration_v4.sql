PRAGMA foreign_keys = OFF;

CREATE TABLE tutor_requests_v4 (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  tutor_id TEXT NOT NULL,
  subject TEXT NOT NULL,
  class_level TEXT NOT NULL,
  learning_needs TEXT NOT NULL,
  preferred_schedule TEXT,
  guardian_phone TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'accepted', 'declined', 'cancelled', 'terminated')),
  response_message TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  batch_id TEXT,
  batch_name TEXT,
  batch_time TEXT,
  is_terminated INTEGER DEFAULT 0,
  terminated_at DATETIME,
  terminated_by TEXT,
  termination_reason TEXT,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (tutor_id) REFERENCES users(id) ON DELETE CASCADE
);

INSERT INTO tutor_requests_v4 (
  id, student_id, tutor_id, subject, class_level, learning_needs, preferred_schedule,
  guardian_phone, status, response_message, created_at, updated_at, batch_id,
  batch_name, batch_time, is_terminated, terminated_at, terminated_by, termination_reason
)
SELECT
  id, student_id, tutor_id, subject, class_level, learning_needs, preferred_schedule,
  guardian_phone, status, response_message, created_at, updated_at, batch_id,
  batch_name, batch_time,
  COALESCE(is_terminated, 0), terminated_at, terminated_by, termination_reason
FROM tutor_requests;

DROP TABLE tutor_requests;

ALTER TABLE tutor_requests_v4 RENAME TO tutor_requests;

CREATE INDEX IF NOT EXISTS idx_tutor_requests_batch ON tutor_requests(batch_id);
CREATE INDEX IF NOT EXISTS idx_tutor_requests_student ON tutor_requests(student_id);
CREATE INDEX IF NOT EXISTS idx_tutor_requests_tutor ON tutor_requests(tutor_id);
CREATE INDEX IF NOT EXISTS idx_tutor_requests_status ON tutor_requests(status);

PRAGMA foreign_keys = ON;
