-- ==============================================================================
-- Shikshan Platform — Promote Founder/Admin User
-- ==============================================================================
-- Once the founder signs up with their email via the app or Supabase Auth,
-- execute this query in the Supabase SQL Editor to grant admin privileges:

-- Replace 'founder@shikshan.org' with your actual founder/administrator email:
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'founder@shikshan.org';

-- Verification query:
SELECT id, name, email, role, created_at FROM public.profiles WHERE role = 'admin';
