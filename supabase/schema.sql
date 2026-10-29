-- ==============================================================================
-- Shikshan Platform — Production Relational Database Schema & RLS Policies
-- ==============================================================================

-- Enable UUID generation extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Helper function: check if currently authenticated user is an administrator
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- Table 1: profiles
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('tutor', 'student', 'admin')),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin() OR role = 'tutor');

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND (role = (SELECT role FROM public.profiles WHERE id = auth.uid()) OR public.is_admin())
  );

-- ==============================================================================
-- Table 2: tutor_applications
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.tutor_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  education_level TEXT NOT NULL,
  course_qualification TEXT,
  institution_name TEXT,
  subjects TEXT[] NOT NULL DEFAULT '{}',
  class_levels TEXT[] NOT NULL DEFAULT '{}',
  subject_class_pairs JSONB NOT NULL DEFAULT '[]'::jsonb,
  board_familiarity TEXT[] NOT NULL DEFAULT '{}',
  teaching_languages TEXT[] NOT NULL DEFAULT '{}',
  marks_summary TEXT,
  bio_intro TEXT,
  teaching_experience TEXT,
  commitment_months INTEGER, -- Optional, not mandatory
  available_days TEXT[] NOT NULL DEFAULT '{}',
  time_windows TEXT[] NOT NULL DEFAULT '{}',
  hours_per_day NUMERIC(3, 1) NOT NULL DEFAULT 1.0,
  proposed_rate NUMERIC(10, 2),
  fee_amount NUMERIC(10, 2),
  fee_unit TEXT NOT NULL DEFAULT 'per_month' CHECK (fee_unit IN ('per_hour', 'per_session', 'per_month')),
  status TEXT NOT NULL DEFAULT 'pending_review' CHECK (status IN ('pending_review', 'approved', 'rejected', 'needs_info')),
  applicant_message TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.tutor_applications ENABLE ROW LEVEL SECURITY;

-- Tutor Applications Policies
-- CRITICAL FIX: Allow students to discover and read APPROVED tutor profiles
DROP POLICY IF EXISTS "Anyone can read approved tutors" ON public.tutor_applications;
CREATE POLICY "Anyone can read approved tutors"
  ON public.tutor_applications FOR SELECT
  USING (
    status = 'approved'
    OR auth.uid() = tutor_id
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "Tutors can insert own application" ON public.tutor_applications;
CREATE POLICY "Tutors can insert own application"
  ON public.tutor_applications FOR INSERT
  WITH CHECK (
    auth.uid() = tutor_id
    AND status = 'pending_review'
  );

DROP POLICY IF EXISTS "Tutors can update own application if pending or needs_info" ON public.tutor_applications;
CREATE POLICY "Tutors can update own application if pending or needs_info"
  ON public.tutor_applications FOR UPDATE
  USING (
    (auth.uid() = tutor_id AND status IN ('pending_review', 'needs_info', 'approved'))
    OR public.is_admin()
  )
  WITH CHECK (
    public.is_admin()
    OR (
      auth.uid() = tutor_id
      -- Ordinary tutors cannot approve themselves
      AND (status = (SELECT status FROM public.tutor_applications WHERE tutor_id = auth.uid()) OR status = 'pending_review')
    )
  );

-- ==============================================================================
-- Table 3: student_profiles
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.student_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  class_level TEXT NOT NULL,
  board TEXT NOT NULL,
  learning_language TEXT NOT NULL,
  subjects TEXT[] NOT NULL DEFAULT '{}',
  learning_goals TEXT,
  guardian_phone TEXT,
  guardian_consent BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_student_profile UNIQUE (student_id)
);

ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students can read own academic profile" ON public.student_profiles;
CREATE POLICY "Students can read own academic profile"
  ON public.student_profiles FOR SELECT
  USING (auth.uid() = student_id OR public.is_admin());

DROP POLICY IF EXISTS "Students can insert own academic profile" ON public.student_profiles;
CREATE POLICY "Students can insert own academic profile"
  ON public.student_profiles FOR INSERT
  WITH CHECK (auth.uid() = student_id);

DROP POLICY IF EXISTS "Students can update own academic profile" ON public.student_profiles;
CREATE POLICY "Students can update own academic profile"
  ON public.student_profiles FOR UPDATE
  USING (auth.uid() = student_id OR public.is_admin())
  WITH CHECK (auth.uid() = student_id OR public.is_admin());

-- ==============================================================================
-- Table 4: tutor_requests (Student Tutor Matching Requests)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.tutor_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tutor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  class_level TEXT NOT NULL,
  learning_needs TEXT NOT NULL,
  preferred_schedule TEXT,
  guardian_phone TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled', 'completed')),
  response_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.tutor_requests ENABLE ROW LEVEL SECURITY;

-- Students can read their own requests
DROP POLICY IF EXISTS "Students can read own requests" ON public.tutor_requests;
CREATE POLICY "Students can read own requests"
  ON public.tutor_requests FOR SELECT
  USING (auth.uid() = student_id OR auth.uid() = tutor_id OR public.is_admin());

-- Students can create requests to tutors
DROP POLICY IF EXISTS "Students can create requests" ON public.tutor_requests;
CREATE POLICY "Students can create requests"
  ON public.tutor_requests FOR INSERT
  WITH CHECK (auth.uid() = student_id);

-- Students or Tutors can update request status according to their role
DROP POLICY IF EXISTS "Users can update relevant requests" ON public.tutor_requests;
CREATE POLICY "Users can update relevant requests"
  ON public.tutor_requests FOR UPDATE
  USING (auth.uid() = student_id OR auth.uid() = tutor_id OR public.is_admin())
  WITH CHECK (
    public.is_admin()
    -- Students can only cancel their own pending request
    OR (auth.uid() = student_id AND status = 'cancelled')
    -- Tutors can accept or decline requests addressed to them
    OR (auth.uid() = tutor_id AND status IN ('accepted', 'declined'))
  );

-- ==============================================================================
-- Table 5: tutor_favorites (Shortlisted Tutors)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.tutor_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tutor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_student_tutor_fav UNIQUE (student_id, tutor_id)
);

ALTER TABLE public.tutor_favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students manage own favorites" ON public.tutor_favorites;
CREATE POLICY "Students manage own favorites"
  ON public.tutor_favorites FOR ALL
  USING (auth.uid() = student_id)
  WITH CHECK (auth.uid() = student_id);

-- ==============================================================================
-- Table 6: admin_review_history
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.admin_review_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.tutor_applications(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES public.profiles(id),
  action TEXT NOT NULL CHECK (action IN ('approved', 'rejected', 'needs_info', 'note_added')),
  internal_note TEXT,
  applicant_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.admin_review_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins only access review history" ON public.admin_review_history;
CREATE POLICY "Admins only access review history"
  ON public.admin_review_history FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ==============================================================================
-- Triggers for automatic updated_at
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_profiles_updated_at ON public.profiles;
CREATE TRIGGER tr_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_tutor_applications_updated_at ON public.tutor_applications;
CREATE TRIGGER tr_tutor_applications_updated_at
  BEFORE UPDATE ON public.tutor_applications
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_student_profiles_updated_at ON public.student_profiles;
CREATE TRIGGER tr_student_profiles_updated_at
  BEFORE UPDATE ON public.student_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_tutor_requests_updated_at ON public.tutor_requests;
CREATE TRIGGER tr_tutor_requests_updated_at
  BEFORE UPDATE ON public.tutor_requests
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
