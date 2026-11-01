-- Shikshan (ಶಿಕ್ಷಣ) MySQL Database Schema
-- Academic Mentorship & Tutor Discovery Platform for Karnataka School Students

CREATE DATABASE IF NOT EXISTS shikshan_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE shikshan_db;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('student', 'tutor', 'admin') NOT NULL DEFAULT 'student',
  name VARCHAR(150) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  photo_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Student Profiles Table
CREATE TABLE IF NOT EXISTS student_profiles (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL UNIQUE,
  class_level VARCHAR(50) NOT NULL,
  board VARCHAR(100) NOT NULL,
  learning_language VARCHAR(100) NOT NULL,
  subjects JSON NOT NULL,
  guardian_phone VARCHAR(20),
  learning_goals TEXT,
  photo_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Tutor Profiles / Applications Table
CREATE TABLE IF NOT EXISTS tutor_profiles (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL UNIQUE,
  education_level VARCHAR(150) NOT NULL,
  course_qualification VARCHAR(200) NOT NULL,
  institution_name VARCHAR(200) NOT NULL,
  subjects JSON NOT NULL,
  class_levels JSON NOT NULL,
  board_familiarity JSON NOT NULL,
  teaching_languages JSON NOT NULL,
  bio_intro TEXT NOT NULL,
  teaching_experience VARCHAR(255),
  available_days JSON NOT NULL,
  time_windows JSON NOT NULL,
  hours_per_day INT DEFAULT 2,
  fee_amount DECIMAL(10, 2) NOT NULL DEFAULT 350.00,
  fee_unit ENUM('per_hour', 'per_month') NOT NULL DEFAULT 'per_hour',
  status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  photo_url TEXT,
  admin_notes TEXT,
  reviewer_message TEXT,
  reviewed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Tutor Inquiries / Student Requests Table
CREATE TABLE IF NOT EXISTS tutor_requests (
  id VARCHAR(36) PRIMARY KEY,
  student_id VARCHAR(36) NOT NULL,
  tutor_id VARCHAR(36) NOT NULL,
  subject VARCHAR(100) NOT NULL,
  class_level VARCHAR(50) NOT NULL,
  learning_needs TEXT NOT NULL,
  preferred_schedule VARCHAR(200),
  guardian_phone VARCHAR(20),
  status ENUM('pending', 'accepted', 'declined', 'cancelled') NOT NULL DEFAULT 'pending',
  response_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (tutor_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Student Favorite Tutors Table
CREATE TABLE IF NOT EXISTS tutor_favorites (
  id VARCHAR(36) PRIMARY KEY,
  student_id VARCHAR(36) NOT NULL,
  tutor_id VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_favorite (student_id, tutor_id),
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (tutor_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
