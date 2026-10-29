# Shikshan (ಶಿಕ್ಷಣ)

> **Learn with confidence. Grow with guidance.**  
> *ಆತ್ಮವಿಶ್ವಾಸದಿಂದ ಕಲಿಯಿರಿ. ಮಾರ್ಗದರ್ಶನದೊಂದಿಗೆ ಮುನ್ನಡೆಯಿರಿ.*

Shikshan is an educational platform connecting school students (Classes 1–10)—particularly students from rural areas and Kannada-medium schooling—with verified, dedicated tutors for structured academic commitments of **3 or 6 months**.

---

## 1. Product Vision & Core Business Rules

- **Long-Term Support:** Shikshan operates on fixed commitments of **3 or 6 months** for continuous, steady conceptual understanding, rather than ad-hoc, isolated 1-hour doubt clearing.
- **Rural & Kannada-Medium Focus:** Dedicated curriculum alignment for Karnataka State Board (KSEAB/SSLC) and CBSE with bilingual (Kannada + English) explanation.
- **Manual Human Review:** **No automated tutor quizzes or exams exist in the app.** Tutors are assessed manually by the founder and trusted educators based on academic marksheets and qualifications.
- **Verification Guarantee:** A tutor is never represented as approved or verified until the review team has explicitly approved their application.
- **Child Privacy & Safety:** Minimal data collection for minors; requires parent/guardian consent; does not collect unnecessary demographic details (e.g. caste, religion, marital status, full address).
- **Private Marksheet Storage:** Academic marksheets are stored in an encrypted private Supabase Storage bucket with strict Row Level Security (RLS) and accessible only via time-limited signed URLs to authorized reviewers.

---

## 2. Technical Architecture

- **Frontend:** React 18, TypeScript, Vite, React Router v6.
- **Styling:** Custom Modern Claymorphism Design System (soft rounded cards, tactile dimensional shadows, accessible high-contrast navy typography, responsive mobile-first layout).
- **Icons:** `lucide-react`.
- **Edge Deployment:** **Cloudflare Pages** static hosting with SPA routing support (`public/_redirects`).
- **Authentication:** **Supabase Auth** with secure email/password management (no plaintext password handling).
- **Database:** **Supabase PostgreSQL** with comprehensive Row Level Security (RLS) on all tables.
- **Storage:** Private encrypted **Supabase Storage** bucket (`tutor-documents`) with folder-isolated RLS.
- **Testing:** `vitest` + `@testing-library/react` + `@testing-library/jest-dom`.

---

## 3. Quick Start & Local Development

### Prerequisites
- Node.js `v18+` or `v20+` (tested on Node v24).
- npm `v9+` or `v11+`.

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in your Supabase project credentials (see Section 4):
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-actual-anon-key
VITE_SITE_URL=http://localhost:5173
```
*(Note: If credentials are not yet supplied, Shikshan starts in safe demo/preview mode and displays a clear setup banner.)*

### Step 3: Run Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### Step 4: Run Automated Tests
```bash
npm test
```

### Step 5: Build for Production
```bash
npm run build
```

---

## 4. Supabase Setup & Database Deployment

### A. Create Project
1. Log in to [Supabase](https://supabase.com) and create a new project.
2. Note your **Project URL** and **anon public key** from `Settings` &rarr; `API`.

### B. Execute Database Migration
Open the Supabase **SQL Editor** and run the contents of [`supabase/schema.sql`](./supabase/schema.sql):
- Creates `profiles` table linked to `auth.users(id)` with roles (`tutor`, `student`, `admin`).
- Creates `tutor_applications` table with status constraint (`pending_review`, `approved`, `rejected`, `needs_info`).
- Creates `student_profiles` table for academic curriculum and guardian consent.
- Creates `tutor_documents` table for academic marksheet records.
- Creates `admin_review_history` for private internal audit trails.
- Enables **Row Level Security (RLS)** on all tables.
- Enforces security rules ensuring ordinary tutors cannot approve their own applications and students cannot access tutor dossiers.

### C. Configure Private Storage
Run [`supabase/storage.sql`](./supabase/storage.sql) in the Supabase SQL Editor:
- Creates the private `tutor-documents` bucket (`public = false`, 5 MB limit, PDF/JPG/PNG only).
- Configures folder-isolated RLS (`<user_id>/<file>`) so applicants can only access their own documents.
- Grants read/download permissions to authorized administrators via signed URLs.

### D. Promote Founder to Administrator
After signing up in the application with your administrator email, execute [`supabase/seed_admin.sql`](./supabase/seed_admin.sql):
```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'founder@shikshan.org';
```

### E. Supabase Auth Email & Redirect Configuration
In the Supabase Dashboard &rarr; `Authentication` &rarr; `URL Configuration`:
- **Site URL:** Set to your deployed production URL (e.g. `https://shikshan.pages.dev`).
- **Redirect URLs:** Add:
  - `http://localhost:5173/**` (for local dev)
  - `https://your-domain.pages.dev/**`
  - `https://your-domain.pages.dev/update-password`

---

## 5. Cloudflare Pages Deployment

Shikshan is fully static and pre-configured for Cloudflare Pages edge hosting.

### Option 1: Direct Git Integration (Recommended)
1. Push this repository to GitHub or GitLab.
2. In the **Cloudflare Dashboard** &rarr; **Workers & Pages** &rarr; **Create application** &rarr; **Pages** &rarr; **Connect to Git**.
3. Select the repository and configure build settings:
   - **Framework preset:** `Vite`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
4. Add Environment Variables in Cloudflare Pages settings:
   - `VITE_SUPABASE_URL`: `https://your-project.supabase.co`
   - `VITE_SUPABASE_ANON_KEY`: `your-anon-key`
5. Click **Save and Deploy**.

### Option 2: Wrangler CLI Direct Upload
```bash
npm run build
npx wrangler pages deploy dist --project-name shikshan
```

*(The included [`public/_redirects`](./public/_redirects) file guarantees that all nested client-side routes like `/tutor/status`, `/student/dashboard`, and `/admin` reload properly without 404 errors.)*

---

## 6. How the Founder Manages Tutor Reviews & User Data

### A. In-App Administrator Review Desk (`/admin`)
- Accessible via the hamburger menu or directly at `/admin` for users with `role = 'admin'`.
- **Pending Applications Queue:** View all applicants awaiting qualification checks.
- **Academic Marksheet Inspection:** Click **Inspect** next to any marksheet to generate a secure, 5-minute signed URL and view the document without exposing public links.
- **Decision Controls:**
  - **Approve Tutor:** Sets status to `approved`, enabling the tutor to access the verified Tutor Dashboard.
  - **Request More Info:** Sets status to `needs_info` and transmits an applicant-facing message.
  - **Reject Application:** Sets status to `rejected` with an optional respectful applicant reason.
- **Confidential Internal Notes:** Add review notes stored in `admin_review_history`, strictly concealed from applicants.

### B. Supabase Dashboard Fallback
If managing directly via Supabase Dashboard:
1. **Registered Users:** `Authentication` &rarr; `Users`.
2. **Tutor Applications:** `Table Editor` &rarr; `tutor_applications`. Update `status` to `'approved'` or `'rejected'`.
3. **Academic Marksheets:** `Storage` &rarr; `tutor-documents` bucket.
4. **Student Profiles:** `Table Editor` &rarr; `student_profiles`.

### C. Account Deletion & Right to Be Forgotten
To honor user deletion requests:
1. Deleting a user in `Authentication` &rarr; `Users` cascades to `profiles`, `student_profiles`, and `tutor_applications` via SQL foreign keys (`ON DELETE CASCADE`).
2. Delete the user's marksheet files in `Storage` &rarr; `tutor-documents/<user_id>/` to prevent orphaned personal documents.

---

## 7. Automated Test Results

The automated test suite runs with Vitest and React Testing Library:
```bash
npm test
```
**Test Suites:**
- `src/test/navigation.test.tsx` (3 tests): Brand name, tagline, welcoming message, role entry buttons, persistent hamburger drawer, and nested back-arrow navigation.
- `src/test/auth.test.tsx` (2 tests): Email/password validation, login error handling, password reset flow.
- `src/test/tutor-flow.test.tsx` (3 tests): 5-step onboarding, validation, form input preservation on back navigation, 3/6-month commitment model validation.
- `src/test/student-flow.test.tsx` (3 tests): Minor considerations, parent/guardian consent, Karnataka State Board, and Kannada learning language options.
- `src/test/admin.test.tsx` (2 tests): Protected review desk, application queue, approval actions, internal confidential review notes.

**Total:** 5 Test Files, 13 Tests Passed (100%).
