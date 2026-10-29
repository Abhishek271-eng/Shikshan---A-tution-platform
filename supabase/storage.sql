-- ==============================================================================
-- Shikshan Platform — Supabase Storage Bucket & RLS Setup
-- ==============================================================================

-- 1. Create the private 'tutor-documents' bucket
-- Note: 'public' is explicitly set to false to prevent public document disclosure.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'tutor-documents',
  'tutor-documents',
  false,
  5242880, -- 5 MB limit
  ARRAY['application/pdf', 'image/jpeg', 'image/png']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['application/pdf', 'image/jpeg', 'image/png'];

-- 2. Storage RLS Policies for 'tutor-documents'

-- Tutors can upload files into their own user folder: <user_id>/<file_name>
DROP POLICY IF EXISTS "Tutors can upload own marksheets" ON storage.objects;
CREATE POLICY "Tutors can upload own marksheets"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'tutor-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Tutors can view and download their own files
DROP POLICY IF EXISTS "Tutors can view own marksheets" ON storage.objects;
CREATE POLICY "Tutors can view own marksheets"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'tutor-documents'
    AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR public.is_admin()
    )
  );

-- Tutors can delete their own files
DROP POLICY IF EXISTS "Tutors can delete own marksheets" ON storage.objects;
CREATE POLICY "Tutors can delete own marksheets"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'tutor-documents'
    AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR public.is_admin()
    )
  );
