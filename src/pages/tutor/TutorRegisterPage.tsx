import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  Lock,
  GraduationCap,
  Calendar,
  Clock,
  Upload,
  CheckCircle2,
  AlertCircle,
  FileText,
  Trash2,
  IndianRupee,
  ShieldCheck,
} from 'lucide-react';
import { Header } from '../../components/common/Header';
import { ClayCard } from '../../components/common/ClayCard';
import { ClayInput } from '../../components/common/ClayInput';
import { ClayButton } from '../../components/common/ClayButton';
import { ProgressBar } from '../../components/common/ProgressBar';
import { SetupNotice } from '../../components/common/SetupNotice';
import { useAuth } from '../../context/AuthContext';
import {
  EDUCATION_LEVELS,
  SCHOOL_SUBJECTS,
  CLASS_LEVEL_RANGES,
  TEACHING_LANGUAGES,
  COMMITMENT_PERIODS,
  WEEKDAYS,
  TIME_WINDOWS,
} from '../../config/options';
import { SubjectClassPair } from '../../types';
import { uploadTutorDocument, isSupabaseConfigured, supabase } from '../../lib/supabase';

const STEPS = [
  { id: 0, label: 'Account', shortLabel: 'Account' },
  { id: 1, label: 'Eligibility', shortLabel: 'Eligibility' },
  { id: 2, label: 'Availability', shortLabel: 'Availability' },
  { id: 3, label: 'Documents', shortLabel: 'Documents' },
  { id: 4, label: 'Review & Submit', shortLabel: 'Review' },
];

export const TutorRegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { signUp, createProfile, saveTutorApplication, user } = useAuth();

  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Step A: Account Information
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Step B: Education & Eligibility
  const [educationLevel, setEducationLevel] = useState(EDUCATION_LEVELS[2].id);
  const [courseQualification, setCourseQualification] = useState('');
  const [institutionName, setInstitutionName] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(['mathematics', 'science']);
  const [selectedClassRanges, setSelectedClassRanges] = useState<string[]>(['classes_6_8']);
  const [teachingLanguages, setTeachingLanguages] = useState<string[]>(['kannada', 'english']);
  const [marksSummary, setMarksSummary] = useState('');
  const [subjectClassPairs, setSubjectClassPairs] = useState<SubjectClassPair[]>([
    { subject: 'Mathematics', classLevelRange: 'Classes 6–8' },
    { subject: 'Science', classLevelRange: 'Classes 6–8' },
  ]);

  // Step C: Availability & Commitment
  const [commitmentMonths, setCommitmentMonths] = useState<3 | 6>(3);
  const [availableDays, setAvailableDays] = useState<string[]>(['mon', 'tue', 'wed', 'thu', 'fri', 'sat']);
  const [timeWindows, setTimeWindows] = useState<string[]>(['evening_prime']);
  const [hoursPerDay, setHoursPerDay] = useState<number>(2);
  const [proposedRate, setProposedRate] = useState<string>('1500');
  const [understandsCommitment, setUnderstandsCommitment] = useState(false);

  // Step D: Academic Document Upload
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [documentCategory, setDocumentCategory] = useState('academic_marksheet');
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Step E: Review Consent
  const [consentDataProcessing, setConsentDataProcessing] = useState(false);
  const [confirmAccuracy, setConfirmAccuracy] = useState(false);

  // Navigation handlers preserving state
  const handleNext = () => {
    setError(null);

    // Validation for Step A
    if (currentStep === 0) {
      if (!name.trim()) return setError('Please enter your full name.');
      if (!email.trim() || !email.includes('@')) return setError('Please enter a valid email address.');
      if (!phone.trim() || phone.length < 10) return setError('Please enter a valid 10-digit mobile number.');
      if (!user) {
        if (password.length < 6) return setError('Password must be at least 6 characters long.');
        if (password !== confirmPassword) return setError('Passwords do not match.');
      }
    }

    // Validation for Step B
    if (currentStep === 1) {
      if (selectedSubjects.length === 0) return setError('Please select at least one subject to teach.');
      if (selectedClassRanges.length === 0) return setError('Please select at least one class level.');
      if (teachingLanguages.length === 0) return setError('Please select at least one teaching language.');
    }

    // Validation for Step C
    if (currentStep === 2) {
      if (availableDays.length === 0) return setError('Please select at least one available day.');
      if (timeWindows.length === 0) return setError('Please select at least one preferred time window.');
      if (!understandsCommitment) {
        return setError('Please confirm your understanding of the 3 or 6 months commitment model.');
      }
    }

    // Validation for Step D
    if (currentStep === 3) {
      if (!documentFile && !isSubmitted) {
        return setError('Please attach your academic marksheet (PDF, JPG, or PNG) for manual verification.');
      }
    }

    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  };

  const handlePrev = () => {
    setError(null);
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    } else {
      navigate(-1);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size must not exceed 5 MB.');
      return;
    }

    // Validate file type
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setUploadError('Only PDF, JPG, or PNG files are supported.');
      return;
    }

    setDocumentFile(file);
  };

  const toggleSubject = (subjectId: string, subjectLabel: string) => {
    if (selectedSubjects.includes(subjectId)) {
      setSelectedSubjects(selectedSubjects.filter((s) => s !== subjectId));
      setSubjectClassPairs(subjectClassPairs.filter((p) => p.subject !== subjectLabel));
    } else {
      setSelectedSubjects([...selectedSubjects, subjectId]);
      setSubjectClassPairs([
        ...subjectClassPairs,
        { subject: subjectLabel, classLevelRange: 'Classes 6–8' },
      ]);
    }
  };

  const toggleClassRange = (rangeId: string) => {
    if (selectedClassRanges.includes(rangeId)) {
      setSelectedClassRanges(selectedClassRanges.filter((r) => r !== rangeId));
    } else {
      setSelectedClassRanges([...selectedClassRanges, rangeId]);
    }
  };

  const toggleLanguage = (langId: string) => {
    if (teachingLanguages.includes(langId)) {
      setTeachingLanguages(teachingLanguages.filter((l) => l !== langId));
    } else {
      setTeachingLanguages([...teachingLanguages, langId]);
    }
  };

  const toggleDay = (dayId: string) => {
    if (availableDays.includes(dayId)) {
      setAvailableDays(availableDays.filter((d) => d !== dayId));
    } else {
      setAvailableDays([...availableDays, dayId]);
    }
  };

  const toggleTimeWindow = (windowId: string) => {
    if (timeWindows.includes(windowId)) {
      setTimeWindows(timeWindows.filter((w) => w !== windowId));
    } else {
      setTimeWindows([...timeWindows, windowId]);
    }
  };

  // Final Submission Handler
  const handleSubmitApplication = async () => {
    setError(null);

    if (!consentDataProcessing) {
      setError('Please provide consent for review of your documents and information.');
      return;
    }

    if (!confirmAccuracy) {
      setError('Please confirm that your submitted academic details are accurate.');
      return;
    }

    setIsSubmitting(true);

    try {
      let activeUserId = user?.id;

      // 1. Create Supabase Auth user if not already signed in
      if (!activeUserId) {
        if (!isSupabaseConfigured) {
          // If unconfigured, show notice but allow test flow
          activeUserId = 'demo-tutor-' + Date.now();
        } else {
          const { userId, error: signUpErr } = await signUp(email.trim(), password);
          if (signUpErr) {
            setError(signUpErr);
            setIsSubmitting(false);
            return;
          }
          activeUserId = userId!;
        }
      }

      // 2. Save tutor profile to cloud database
      if (isSupabaseConfigured && activeUserId) {
        const { error: profileErr } = await createProfile({
          id: activeUserId,
          role: 'tutor',
          name: name.trim(),
          email: email.trim(),
          phone: `+91 ${phone.trim()}`,
        });

        if (profileErr) {
          setError(`Profile creation error: ${profileErr}`);
          setIsSubmitting(false);
          return;
        }

        // 3. Save tutor application record
        const { application, error: appErr } = await saveTutorApplication({
          tutor_id: activeUserId,
          education_level: educationLevel,
          course_qualification: courseQualification.trim() || undefined,
          institution_name: institutionName.trim() || undefined,
          subjects: selectedSubjects,
          class_levels: selectedClassRanges,
          subject_class_pairs: subjectClassPairs,
          teaching_languages: teachingLanguages,
          marks_summary: marksSummary.trim() || undefined,
          commitment_months: commitmentMonths,
          available_days: availableDays,
          time_windows: timeWindows,
          hours_per_day: hoursPerDay,
          proposed_rate: proposedRate ? parseFloat(proposedRate) : undefined,
          status: 'pending_review',
        });

        if (appErr) {
          setError(`Application error: ${appErr}`);
          setIsSubmitting(false);
          return;
        }

        // 4. Upload private document to Supabase Storage if attached
        if (documentFile && application) {
          const { path, error: uploadErr } = await uploadTutorDocument(
            activeUserId,
            documentFile,
            documentCategory
          );

          if (!uploadErr && path) {
            // Save document reference to tutor_documents table
            await supabase.from('tutor_documents').insert({
              tutor_id: activeUserId,
              application_id: application.id,
              file_path: path,
              file_name: documentFile.name,
              file_size: documentFile.size,
              mime_type: documentFile.type,
              document_category: documentCategory,
            });
          } else if (uploadErr) {
            console.error('Document upload notice:', uploadErr);
          }
        }
      }

      setIsSubmitted(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Application submission failed.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#EEF4FA]">
      <Header
        title="Tutor Application"
        subtitle={`Step ${currentStep + 1} of ${STEPS.length}: ${STEPS[currentStep].label}`}
        onBack={handlePrev}
      />
      <SetupNotice />

      <main className="flex-1 max-w-xl mx-auto w-full px-4 sm:px-6 py-6 flex flex-col">
        {/* Multi-step Progress Bar */}
        {!isSubmitted && (
          <div className="mb-4">
            <ProgressBar
              steps={STEPS}
              currentStep={currentStep}
              onStepClick={(idx) => setCurrentStep(idx)}
              allowStepClick={true}
            />
          </div>
        )}

        {/* Success Confirmation Screen (Step E Done) */}
        {isSubmitted ? (
          <ClayCard className="p-6 sm:p-8 space-y-6 text-center my-auto animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-9 h-9 stroke-[2.2]" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Application Submitted Successfully
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
                “Your tutor application has been submitted successfully. Our team will review your application, and you should receive an update within one day.”
              </p>
              <p className="text-xs text-slate-500 font-medium">
                Note: The 1-day period is our target review timeline, not an automatic guarantee of approval. Tutors are assessed manually by our founder and trusted teachers.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-100 text-left space-y-2 text-xs text-slate-700">
              <div className="flex justify-between font-bold text-slate-900 pb-1 border-b border-blue-200/60">
                <span>Application Summary</span>
                <span className="text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">Pending Review</span>
              </div>
              <p><strong>Applicant:</strong> {name} ({email})</p>
              <p><strong>Education:</strong> {EDUCATION_LEVELS.find((e) => e.id === educationLevel)?.label}</p>
              <p><strong>Commitment:</strong> {commitmentMonths} Months ({hoursPerDay} hrs/day)</p>
              <p><strong>Proposed Rate:</strong> ₹{proposedRate} / month (pending review)</p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <ClayButton
                variant="primary"
                fullWidth
                onClick={() => navigate('/tutor/status')}
              >
                View Application Status
              </ClayButton>
              <Link to="/" className="w-full">
                <ClayButton variant="secondary" fullWidth>
                  Return to Home
                </ClayButton>
              </Link>
            </div>
          </ClayCard>
        ) : (
          /* Step Forms Container */
          <ClayCard className="p-6 sm:p-8 space-y-6 flex-1 flex flex-col justify-between">
            {error && (
              <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            {/* STEP A: Basic Account Information */}
            {currentStep === 0 && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Basic Account Information</h3>
                  <p className="text-xs text-slate-500">
                    We collect only what is necessary to create and contact your applicant account.
                  </p>
                </div>

                <ClayInput
                  label="Full Name"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  icon={<User className="w-4 h-4" />}
                />

                <ClayInput
                  label="Email Address"
                  type="email"
                  required
                  placeholder="tutor@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  icon={<Mail className="w-4 h-4" />}
                  hint="Used for secure sign in and review status notifications."
                />

                <div className="flex flex-col gap-1.5 text-left">
                  <label htmlFor="tutor-mobile-input" className="text-sm font-semibold text-slate-800">
                    Mobile Number <span className="text-red-500 font-bold">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="clay-input w-20 flex items-center justify-center font-bold text-slate-600 bg-slate-100 select-none">
                      +91
                    </span>
                    <ClayInput
                      id="tutor-mobile-input"
                      label=""
                      type="tel"
                      required
                      placeholder="98765 43210"
                      maxLength={10}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      icon={<Phone className="w-4 h-4" />}
                    />
                  </div>
                </div>

                {!user && (
                  <>
                    <ClayInput
                      label="Create Password"
                      type="password"
                      required
                      placeholder="Minimum 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      icon={<Lock className="w-4 h-4" />}
                    />

                    <ClayInput
                      label="Confirm Password"
                      type="password"
                      required
                      placeholder="Repeat password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      icon={<Lock className="w-4 h-4" />}
                    />
                  </>
                )}
              </div>
            )}

            {/* STEP B: Education & Eligibility */}
            {currentStep === 1 && (
              <div className="space-y-5 animate-fade-in">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Education & Eligibility</h3>
                  <p className="text-xs text-slate-500">
                    Tell us your academic qualifications and the specific classes you want to mentor.
                  </p>
                </div>

                {/* Education Level Selector */}
                <div className="flex flex-col gap-1.5 text-left">
                  <label htmlFor="tutor-education-level-select" className="text-sm font-semibold text-slate-800">
                    Current Highest Education Level <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="tutor-education-level-select"
                    value={educationLevel}
                    onChange={(e) => setEducationLevel(e.target.value)}
                    className="clay-input"
                  >
                    {EDUCATION_LEVELS.map((level) => (
                      <option key={level.id} value={level.id}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Conditional fields for college student / graduate */}
                {(educationLevel === 'college_student' ||
                  educationLevel === 'graduate' ||
                  educationLevel === 'post_graduate' ||
                  educationLevel === 'qualified_teacher') && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <ClayInput
                      label="Current Course / Degree"
                      placeholder="e.g. B.Sc Mathematics, B.E. CS"
                      value={courseQualification}
                      onChange={(e) => setCourseQualification(e.target.value)}
                      icon={<GraduationCap className="w-4 h-4" />}
                    />
                    <ClayInput
                      label="College / Institution"
                      placeholder="e.g. Kuvempu University"
                      value={institutionName}
                      onChange={(e) => setInstitutionName(e.target.value)}
                    />
                  </div>
                )}

                {/* Subjects willing to teach */}
                <div className="text-left space-y-2">
                  <label className="text-sm font-semibold text-slate-800 block">
                    Subjects You Want to Teach <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {SCHOOL_SUBJECTS.map((sub) => {
                      const isSelected = selectedSubjects.includes(sub.id);
                      return (
                        <div
                          key={sub.id}
                          onClick={() => toggleSubject(sub.id, sub.label)}
                          className={`p-3 rounded-2xl border text-xs font-semibold cursor-pointer select-none transition-all flex items-center justify-between ${
                            isSelected
                              ? 'bg-blue-50 border-blue-400 text-blue-900 shadow-sm'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div>
                            <p>{sub.label}</p>
                            {sub.kannadaLabel && (
                              <p className="text-[11px] text-slate-500 font-normal font-kannada">
                                {sub.kannadaLabel}
                              </p>
                            )}
                          </div>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            readOnly
                            className="rounded text-blue-600 focus:ring-0 ml-2"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Class levels */}
                <div className="text-left space-y-2">
                  <label className="text-sm font-semibold text-slate-800 block">
                    Class Levels You Are Qualified to Support <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {CLASS_LEVEL_RANGES.map((range) => {
                      const isSelected = selectedClassRanges.includes(range.id);
                      return (
                        <div
                          key={range.id}
                          onClick={() => toggleClassRange(range.id)}
                          className={`p-3 rounded-2xl border text-xs font-semibold cursor-pointer select-none transition-all flex items-center justify-between ${
                            isSelected
                              ? 'bg-blue-50 border-blue-400 text-blue-900 shadow-sm'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span>{range.label}</span>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            readOnly
                            className="rounded text-blue-600"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Teaching languages */}
                <div className="text-left space-y-2">
                  <label className="text-sm font-semibold text-slate-800 block">
                    Teaching Languages <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {TEACHING_LANGUAGES.map((lang) => {
                      const isSelected = teachingLanguages.includes(lang.id);
                      return (
                        <button
                          key={lang.id}
                          type="button"
                          onClick={() => toggleLanguage(lang.id)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                            isSelected
                              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {lang.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Relevant Subject Marks */}
                <ClayInput
                  label="Relevant Subject Marks (10th / PUC / Degree)"
                  placeholder="e.g. 10th Maths: 94%, Science: 90% | PUC PCM: 88%"
                  value={marksSummary}
                  onChange={(e) => setMarksSummary(e.target.value)}
                  hint="Used by reviewers to assess academic strength in chosen teaching subjects."
                />
              </div>
            )}

            {/* STEP C: Availability & Commitment */}
            {currentStep === 2 && (
              <div className="space-y-5 animate-fade-in">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Availability & Commitment</h3>
                  <p className="text-xs text-slate-500">
                    Shikshan is built on long-term 3 or 6 months consistency for steady student growth.
                  </p>
                </div>

                {/* Preferred Commitment */}
                <div className="text-left space-y-2">
                  <label className="text-sm font-semibold text-slate-800 block">
                    Commitment Period <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {COMMITMENT_PERIODS.map((period) => {
                      const isSelected = commitmentMonths === period.months;
                      return (
                        <div
                          key={period.months}
                          onClick={() => setCommitmentMonths(period.months as 3 | 6)}
                          className={`p-4 rounded-2xl border cursor-pointer select-none transition-all flex flex-col justify-between ${
                            isSelected
                              ? 'bg-blue-50/90 border-blue-500 shadow-md ring-2 ring-blue-200'
                              : 'bg-white border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-extrabold text-sm text-slate-900">{period.label}</span>
                              <Calendar className="w-4 h-4 text-blue-600" />
                            </div>
                            <p className="text-xs text-slate-600 leading-normal">{period.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Days Available */}
                <div className="text-left space-y-2">
                  <label className="text-sm font-semibold text-slate-800 block">
                    Days Available Each Week <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {WEEKDAYS.map((day) => {
                      const isSelected = availableDays.includes(day.id);
                      return (
                        <button
                          key={day.id}
                          type="button"
                          onClick={() => toggleDay(day.id)}
                          className={`w-11 h-11 rounded-2xl font-bold text-xs border transition-all ${
                            isSelected
                              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {day.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Time Windows */}
                <div className="text-left space-y-2">
                  <label className="text-sm font-semibold text-slate-800 block">
                    Daily Time Windows <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {TIME_WINDOWS.map((win) => {
                      const isSelected = timeWindows.includes(win.id);
                      return (
                        <div
                          key={win.id}
                          onClick={() => toggleTimeWindow(win.id)}
                          className={`p-3 rounded-2xl border text-xs font-semibold cursor-pointer select-none transition-all flex items-center justify-between ${
                            isSelected
                              ? 'bg-blue-50 border-blue-400 text-blue-900'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-blue-600" />
                            {win.label}
                          </span>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            readOnly
                            className="rounded text-blue-600"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Hours & Proposed Rate */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                  <div>
                    <label htmlFor="tutor-hours-select" className="text-sm font-semibold text-slate-800 block mb-1.5">
                      Hours Available Per Day
                    </label>
                    <select
                      id="tutor-hours-select"
                      value={hoursPerDay}
                      onChange={(e) => setHoursPerDay(parseFloat(e.target.value))}
                      className="clay-input"
                    >
                      <option value={1}>1 hour per day</option>
                      <option value={1.5}>1.5 hours per day</option>
                      <option value={2}>2 hours per day</option>
                      <option value={3}>3 hours per day</option>
                      <option value={4}>4 hours per day</option>
                    </select>
                  </div>

                  <div>
                    <ClayInput
                      label="Proposed Monthly Rate (₹)"
                      type="number"
                      placeholder="e.g. 1500"
                      value={proposedRate}
                      onChange={(e) => setProposedRate(e.target.value)}
                      icon={<IndianRupee className="w-4 h-4" />}
                      hint="Proposed rate pending review. No payment is taken now."
                    />
                  </div>
                </div>

                {/* Commitment Acknowledgment Checkbox */}
                <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-left">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={understandsCommitment}
                      onChange={(e) => setUnderstandsCommitment(e.target.checked)}
                      className="mt-1 w-4 h-4 rounded text-blue-600 focus:ring-0"
                    />
                    <span className="text-xs text-amber-950 font-medium leading-relaxed">
                      I understand that Shikshan is a <strong>3 or 6 months commitment model</strong> for consistent student support, not an ad-hoc single-hour marketplace.
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* STEP D: Academic Document Upload */}
            {currentStep === 3 && (
              <div className="space-y-5 animate-fade-in text-left">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Academic Document Upload</h3>
                  <p className="text-xs text-slate-500">
                    Upload your relevant 10th, PUC, or college marksheet for manual verification.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 flex-shrink-0 text-blue-700 mt-0.5" />
                  <div>
                    <p className="font-bold">Private & Protected Storage</p>
                    <p className="mt-0.5">
                      Your documents are stored in an encrypted, private storage bucket with strict access controls. Only authorized Shikshan reviewers can view your marksheets.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="tutor-doc-category-select" className="text-sm font-semibold text-slate-800">
                    Document Category
                  </label>
                  <select
                    id="tutor-doc-category-select"
                    value={documentCategory}
                    onChange={(e) => setDocumentCategory(e.target.value)}
                    className="clay-input"
                  >
                    <option value="10th_marksheet">10th Standard Marksheet</option>
                    <option value="puc_marksheet">PUC / 12th Marksheet</option>
                    <option value="degree_marksheet">College / Degree Semester Marksheet</option>
                    <option value="teaching_certificate">Teaching / B.Ed Certificate</option>
                  </select>
                </div>

                {uploadError && (
                  <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{uploadError}</span>
                  </div>
                )}

                {/* Upload Area */}
                {!documentFile ? (
                  <label
                    htmlFor="tutor-marksheet-file"
                    className="border-2 border-dashed border-blue-200 hover:border-blue-400 bg-blue-50/40 rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-blue-50/70"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mb-3">
                      <Upload className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-slate-800">Click or tap to upload marksheet</p>
                    <p className="text-xs text-slate-500 mt-1">Supports PDF, JPG, or PNG (Max 5 MB)</p>
                    <input
                      id="tutor-marksheet-file"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 truncate max-w-[200px] sm:max-w-xs">
                          {documentFile.name}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {(documentFile.size / 1024 / 1024).toFixed(2)} MB • Ready for review
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDocumentFile(null)}
                      className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                      title="Remove file"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* STEP E: Review & Consent */}
            {currentStep === 4 && (
              <div className="space-y-5 animate-fade-in text-left">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Review & Consent</h3>
                  <p className="text-xs text-slate-500">
                    Review your application summary and confirm before submission.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs text-slate-700">
                  <p><strong>Name:</strong> {name}</p>
                  <p><strong>Email:</strong> {email} | <strong>Mobile:</strong> +91 {phone}</p>
                  <p><strong>Education:</strong> {EDUCATION_LEVELS.find((e) => e.id === educationLevel)?.label}</p>
                  <p><strong>Subjects:</strong> {selectedSubjects.map((s) => SCHOOL_SUBJECTS.find((sub) => sub.id === s)?.label).join(', ')}</p>
                  <p><strong>Teaching Languages:</strong> {teachingLanguages.join(', ')}</p>
                  <p><strong>Commitment:</strong> {commitmentMonths} Months ({hoursPerDay} hrs/day)</p>
                  <p><strong>Attached Document:</strong> {documentFile ? documentFile.name : 'Pending attachment'}</p>
                </div>

                <div className="space-y-3 pt-2">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consentDataProcessing}
                      onChange={(e) => setConsentDataProcessing(e.target.checked)}
                      className="mt-1 w-4 h-4 rounded text-blue-600 focus:ring-0"
                    />
                    <span className="text-xs text-slate-700 leading-relaxed">
                      I consent to the processing of my contact details and academic marksheets for the purpose of tutor qualification review by Shikshan in accordance with the{' '}
                      <Link to="/privacy-policy" target="_blank" className="text-blue-700 font-bold underline">
                        Privacy Policy
                      </Link>.
                    </span>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={confirmAccuracy}
                      onChange={(e) => setConfirmAccuracy(e.target.checked)}
                      className="mt-1 w-4 h-4 rounded text-blue-600 focus:ring-0"
                    />
                    <span className="text-xs text-slate-700 leading-relaxed">
                      I confirm that all information provided is accurate and authentic, and I agree to the platform&apos;s{' '}
                      <Link to="/terms" target="_blank" className="text-blue-700 font-bold underline">
                        Terms and Conditions
                      </Link>.
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* Step Navigation Controls */}
            <div className="pt-6 border-t border-slate-100 flex items-center justify-between gap-3">
              <ClayButton
                type="button"
                variant="secondary"
                onClick={handlePrev}
              >
                Back
              </ClayButton>

              {currentStep < STEPS.length - 1 ? (
                <ClayButton
                  type="button"
                  variant="primary"
                  onClick={handleNext}
                >
                  Continue &rarr;
                </ClayButton>
              ) : (
                <ClayButton
                  type="button"
                  variant="primary"
                  isLoading={isSubmitting}
                  onClick={handleSubmitApplication}
                >
                  Submit Application
                </ClayButton>
              )}
            </div>
          </ClayCard>
        )}
      </main>
    </div>
  );
};
