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
  USING (auth.uid() = id OR public.is_admin());

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
    -- Prevent non-admins from promoting themselves to admin
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
  teaching_languages TEXT[] NOT NULL DEFAULT '{}',
  marks_summary TEXT,
  commitment_months INTEGER NOT NULL CHECK (commitment_months IN (3, 6)),
  available_days TEXT[] NOT NULL DEFAULT '{}',
  time_windows TEXT[] NOT NULL DEFAULT '{}',
  hours_per_day NUMERIC(3, 1) NOT NULL DEFAULT 1.0,
  proposed_rate NUMERIC(10, 2),
  status TEXT NOT NULL DEFAULT 'pending_review' CHECK (status IN ('pending_review', 'approved', 'rejected', 'needs_info')),
  applicant_message TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.tutor_applications ENABLE ROW LEVEL SECURITY;

-- Tutor Applications Policies
DROP POLICY IF EXISTS "Tutors can read own application" ON public.tutor_applications;
CREATE POLICY "Tutors can read own application"
  ON public.tutor_applications FOR SELECT
  USING (auth.uid() = tutor_id OR public.is_admin());

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
    (auth.uid() = tutor_id AND status IN ('pending_review', 'needs_info'))
    OR public.is_admin()
  )
  WITH CHECK (
    public.is_admin()
    OR (
      auth.uid() = tutor_id
      -- Ordinary tutors cannot mark themselves as approved
      AND status = 'pending_review'
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
  guardian_phone TEXT,
  guardian_consent BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_student_profile UNIQUE (student_id)
);

ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;

-- Student Profiles Policies
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
-- Table 4: tutor_documents
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.tutor_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  application_id UUID REFERENCES public.tutor_applications(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  document_category TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.tutor_documents ENABLE ROW LEVEL SECURITY;

-- Tutor Documents Policies
DROP POLICY IF EXISTS "Tutors can read own documents" ON public.tutor_documents;
CREATE POLICY "Tutors can read own documents"
  ON public.tutor_documents FOR SELECT
  USING (auth.uid() = tutor_id OR public.is_admin());

DROP POLICY IF EXISTS "Tutors can insert own documents" ON public.tutor_documents;
CREATE POLICY "Tutors can insert own documents"
  ON public.tutor_documents FOR INSERT
  WITH CHECK (auth.uid() = tutor_id);

DROP POLICY IF EXISTS "Tutors can delete own documents during review" ON public.tutor_documents;
CREATE POLICY "Tutors can delete own documents during review"
  ON public.tutor_documents FOR DELETE
  USING (auth.uid() = tutor_id OR public.is_admin());

-- ==============================================================================
-- Table 5: admin_review_history
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

-- Admin Review History Policies (ONLY accessible by administrators)
DROP POLICY IF EXISTS "Admins only access review history" ON public.admin_review_history;
CREATE POLICY "Admins only access review history"
  ON public.admin_review_history FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ==============================================================================
-- Automatic updated_at trigger
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
