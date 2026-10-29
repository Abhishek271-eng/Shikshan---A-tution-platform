import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  User,
  Mail,
  GraduationCap,
  Clock,
  CheckCircle2,
  AlertCircle,
  IndianRupee,
} from 'lucide-react';
import { Header } from '../../components/common/Header';
import { ClayCard } from '../../components/common/ClayCard';
import { ClayInput } from '../../components/common/ClayInput';
import { ClayButton } from '../../components/common/ClayButton';
import { PhoneInput } from '../../components/common/PhoneInput';
import { PasswordInput, validatePasswordStrength } from '../../components/common/PasswordInput';
import { ProgressBar } from '../../components/common/ProgressBar';
import { SetupNotice } from '../../components/common/SetupNotice';
import { useAuth } from '../../context/AuthContext';
import {
  EDUCATION_LEVELS,
  SCHOOL_SUBJECTS,
  INDIVIDUAL_CLASSES,
  EDUCATION_BOARDS,
  TEACHING_LANGUAGES,
  FEE_UNITS,
  WEEKDAYS,
  TIME_WINDOWS,
} from '../../config/options';
import { FeeUnit } from '../../types';

const STEPS = [
  { id: 0, label: 'Account', shortLabel: 'Account' },
  { id: 1, label: 'Teaching Profile', shortLabel: 'Profile' },
  { id: 2, label: 'Fees & Schedule', shortLabel: 'Fees' },
  { id: 3, label: 'Review & Submit', shortLabel: 'Review' },
];

export const TutorRegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { signUp, createProfile, saveTutorApplication, user } = useAuth();

  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Step 1: Account Information
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Step 2: Teaching Profile & Qualifications
  const [educationLevel, setEducationLevel] = useState(EDUCATION_LEVELS[2].id);
  const [courseQualification, setCourseQualification] = useState('');
  const [institutionName, setInstitutionName] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(['mathematics', 'science']);
  const [selectedClasses, setSelectedClasses] = useState<string[]>(['class_6', 'class_7', 'class_8']);
  const [boardFamiliarity, setBoardFamiliarity] = useState<string[]>(['karnataka_state_board']);
  const [teachingLanguages, setTeachingLanguages] = useState<string[]>(['kannada', 'english']);
  const [bioIntro, setBioIntro] = useState('');
  const [teachingExperience, setTeachingExperience] = useState('');

  // Step 3: Availability & Proposed Fees (NO mandatory 3/6-month commitment!)
  const [availableDays, setAvailableDays] = useState<string[]>(['mon', 'tue', 'wed', 'thu', 'fri']);
  const [timeWindows, setTimeWindows] = useState<string[]>(['evening_prime']);
  const [hoursPerDay, setHoursPerDay] = useState<number>(2);
  const [feeAmount, setFeeAmount] = useState<string>('350');
  const [feeUnit, setFeeUnit] = useState<FeeUnit>('per_hour');

  // Step 4: Consent & Confirmation
  const [consentReview, setConsentReview] = useState(false);
  const [confirmAccuracy, setConfirmAccuracy] = useState(false);

  // Validation before advancing steps
  const handleNext = () => {
    setError(null);

    // Step 0 validation (Account)
    if (currentStep === 0) {
      if (!name.trim()) return setError('Please enter your full name.');
      if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        return setError('Please enter a valid email address.');
      }
      if (phone.length !== 10 || !/^[6-9]\d{9}$/.test(phone)) {
        return setError('Enter a valid 10-digit mobile number.');
      }
      if (!user) {
        const { isValid } = validatePasswordStrength(password);
        if (!isValid) {
          return setError('Please satisfy all 5 password requirements before proceeding.');
        }
        if (password !== confirmPassword) {
          return setError('Passwords do not match. Please re-enter.');
        }
      }
    }

    // Step 1 validation (Teaching Profile)
    if (currentStep === 1) {
      if (selectedSubjects.length === 0) return setError('Please select at least one subject you can teach.');
      if (selectedClasses.length === 0) return setError('Please select at least one class level (Classes 1–10).');
      if (teachingLanguages.length === 0) return setError('Please select at least one teaching language.');
      if (!bioIntro.trim() || bioIntro.trim().length < 15) {
        return setError('Please provide a short teaching introduction (at least 15 characters).');
      }
    }

    // Step 2 validation (Fees & Availability)
    if (currentStep === 2) {
      if (availableDays.length === 0) return setError('Please select at least one available day.');
      if (timeWindows.length === 0) return setError('Please select at least one preferred time window.');
      if (!feeAmount || parseFloat(feeAmount) <= 0) {
        return setError('Please enter a valid proposed fee amount.');
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

  const toggleSubject = (subId: string) => {
    if (selectedSubjects.includes(subId)) {
      setSelectedSubjects(selectedSubjects.filter((s) => s !== subId));
    } else {
      setSelectedSubjects([...selectedSubjects, subId]);
    }
  };

  const toggleClass = (classId: string) => {
    if (selectedClasses.includes(classId)) {
      setSelectedClasses(selectedClasses.filter((c) => c !== classId));
    } else {
      setSelectedClasses([...selectedClasses, classId]);
    }
  };

  const toggleBoard = (boardId: string) => {
    if (boardFamiliarity.includes(boardId)) {
      setBoardFamiliarity(boardFamiliarity.filter((b) => b !== boardId));
    } else {
      setBoardFamiliarity([...boardFamiliarity, boardId]);
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

  const handleSubmit = async () => {
    setError(null);

    if (!consentReview) {
      setError('Please provide consent for tutor profile review.');
      return;
    }
    if (!confirmAccuracy) {
      setError('Please confirm the accuracy of your academic credentials.');
      return;
    }

    setIsSubmitting(true);

    try {
      let activeUserId = user?.id;

      if (!activeUserId) {
        const { userId, error: signUpErr } = await signUp(email.trim(), password);
        if (signUpErr) {
          setError(signUpErr);
          setIsSubmitting(false);
          return;
        }
        activeUserId = userId!;
      }

      const { error: profileErr } = await createProfile({
        id: activeUserId,
        role: 'tutor',
        name: name.trim(),
        email: email.trim(),
        phone: `+91 ${phone.trim()}`,
      });

      if (profileErr) {
        setError(profileErr);
        setIsSubmitting(false);
        return;
      }

      const { error: appErr } = await saveTutorApplication({
        tutor_id: activeUserId,
        education_level: educationLevel,
        course_qualification: courseQualification.trim() || undefined,
        institution_name: institutionName.trim() || undefined,
        subjects: selectedSubjects,
        class_levels: selectedClasses,
        subject_class_pairs: selectedSubjects.map((s) => ({
          subject: s,
          classLevelRange: selectedClasses.length > 2 ? 'Multiple Classes' : selectedClasses.join(', '),
        })),
        board_familiarity: boardFamiliarity,
        teaching_languages: teachingLanguages,
        bio_intro: bioIntro.trim(),
        teaching_experience: teachingExperience.trim() || undefined,
        available_days: availableDays,
        time_windows: timeWindows,
        hours_per_day: hoursPerDay,
        fee_amount: parseFloat(feeAmount),
        fee_unit: feeUnit,
        proposed_rate: parseFloat(feeAmount),
        status: 'pending_review',
      });

      if (appErr) {
        setError(appErr);
        setIsSubmitting(false);
        return;
      }

      setIsSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Application submission failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F6FC]">
      <Header
        title="Tutor Onboarding"
        subtitle={`Step ${currentStep + 1} of ${STEPS.length}: ${STEPS[currentStep].label}`}
        onBack={handlePrev}
      />
      <SetupNotice />

      <main className="flex-1 max-w-xl mx-auto w-full px-4 sm:px-6 py-6 pb-24 flex flex-col justify-between">
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

        {isSubmitted ? (
          <ClayCard className="p-6 sm:p-8 space-y-6 text-center my-auto animate-fade-in border-[#DFD8F3] shadow-clay-card bg-white">
            <div className="w-16 h-16 rounded-full bg-[#EBF3E8] text-[#3B522F] border border-[#3B522F]/20 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-9 h-9 stroke-[2.2]" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-[#1C1938] tracking-tight">
                Application Submitted Successfully
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
                “Your tutor application has been submitted successfully. Our team will review your application, and you should receive an update within one day.”
              </p>
              <p className="text-xs text-slate-500 font-medium">
                Note: Applications are reviewed manually outside the application by the founder and trusted educators before you can appear in student discovery.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F4F1FA] border border-[#DFD8F3] text-left space-y-2 text-xs text-[#1C1938]">
              <div className="flex justify-between font-bold text-[#1C1938] pb-1 border-b border-[#DFD8F3]">
                <span>Application Summary</span>
                <span className="text-[#3B522F] bg-[#EBF3E8] border border-[#3B522F]/20 px-2.5 py-0.5 rounded-full font-bold">
                  Pending Review
                </span>
              </div>
              <p><strong>Applicant:</strong> {name} ({email})</p>
              <p><strong>Education:</strong> {EDUCATION_LEVELS.find((e) => e.id === educationLevel)?.label}</p>
              <p><strong>Proposed Fee:</strong> ₹{feeAmount} {FEE_UNITS.find((u) => u.id === feeUnit)?.label}</p>
              <p><strong>Teaching Languages:</strong> {teachingLanguages.join(', ')}</p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <ClayButton
                variant="primary"
                fullWidth
                onClick={() => navigate('/tutor/status')}
              >
                Track Application Status
              </ClayButton>
              <Link to="/" className="w-full">
                <ClayButton variant="secondary" fullWidth>
                  Return to Home
                </ClayButton>
              </Link>
            </div>
          </ClayCard>
        ) : (
          <ClayCard className="p-6 sm:p-8 space-y-6 flex-1 flex flex-col justify-between border-[#DFD8F3] shadow-clay-card bg-white">
            {error && (
              <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            {/* STEP 0: Account Details */}
            {currentStep === 0 && (
              <div className="space-y-4 animate-fade-in text-left">
                <div>
                  <h3 className="text-lg font-bold text-[#1C1938]">Basic Account Information</h3>
                  <p className="text-xs text-slate-500">
                    We collect only what is necessary to create and contact your tutor account.
                  </p>
                </div>

                <ClayInput
                  label="Full Name"
                  required
                  placeholder="e.g. Anand Kumar Hegde"
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

                <PhoneInput
                  label="Mobile Number"
                  kannadaLabel="ಮೊಬೈಲ್ ಸಂಖ್ಯೆ"
                  required
                  value={phone}
                  onChange={setPhone}
                  hint="Enter your 10-digit Indian phone number."
                />

                {!user && (
                  <>
                    <PasswordInput
                      label="Create Password"
                      value={password}
                      onChange={setPassword}
                      required
                      showRequirements={true}
                    />

                    <ClayInput
                      label="Confirm Password"
                      type="password"
                      required
                      placeholder="Repeat password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </>
                )}
              </div>
            )}

            {/* STEP 1: Teaching Profile & Qualifications */}
            {currentStep === 1 && (
              <div className="space-y-5 animate-fade-in text-left">
                <div>
                  <h3 className="text-lg font-bold text-[#1C1938]">Teaching Profile & Expertise</h3>
                  <p className="text-xs text-slate-500 font-kannada">
                    ಬೋಧನಾ ವಿವರಗಳು • Subjects and classes you are qualified to support
                  </p>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="tutor-edu-select" className="text-sm font-semibold text-[#1C1938]">
                    Highest Qualification <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="tutor-edu-select"
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <ClayInput
                    label="Degree / Course Name"
                    placeholder="e.g. B.Sc Mathematics, B.Ed"
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

                {/* Subjects */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#1C1938] block">
                    Subjects You Teach <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {SCHOOL_SUBJECTS.map((sub) => {
                      const isSelected = selectedSubjects.includes(sub.id);
                      return (
                        <div
                          key={sub.id}
                          onClick={() => toggleSubject(sub.id)}
                          className={`p-3 rounded-2xl border text-xs font-semibold cursor-pointer select-none transition-all flex items-center justify-between ${
                            isSelected
                              ? 'bg-[#DFD8F3]/60 border-[#4136CA] text-[#4136CA] shadow-sm'
                              : 'bg-white border-[#DFD8F3] text-slate-700 hover:bg-[#F4F1FA]'
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
                            className="rounded text-[#4136CA] focus:ring-0 ml-2"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Classes 1-10 Multi-Selector */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#1C1938] block">
                    Classes You Can Support (Classes 1–10) <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-5 sm:grid-cols-5 gap-1.5">
                    {INDIVIDUAL_CLASSES.map((cls) => {
                      const isSelected = selectedClasses.includes(cls.id);
                      return (
                        <button
                          key={cls.id}
                          type="button"
                          onClick={() => toggleClass(cls.id)}
                          className={`py-2 px-1 text-center rounded-xl text-xs font-bold border transition-all ${
                            isSelected
                              ? 'bg-[#4136CA] text-white border-[#4136CA] shadow-sm'
                              : 'bg-white text-slate-700 border-[#DFD8F3] hover:bg-[#F4F1FA]'
                          }`}
                        >
                          {cls.label.replace('Class ', 'C')}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Board familiarity */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#1C1938] block">
                    Curriculum / Board Familiarity
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {EDUCATION_BOARDS.map((board) => {
                      const isSelected = boardFamiliarity.includes(board.id);
                      return (
                        <button
                          key={board.id}
                          type="button"
                          onClick={() => toggleBoard(board.id)}
                          className={`p-2.5 rounded-xl text-left text-xs font-semibold border transition-all ${
                            isSelected
                              ? 'bg-[#DFD8F3]/60 border-[#4136CA] text-[#4136CA] font-bold'
                              : 'bg-white border-[#DFD8F3] text-slate-700 hover:bg-[#F4F1FA]'
                          }`}
                        >
                          {board.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Teaching languages */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#1C1938] block">
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
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                            isSelected
                              ? 'bg-[#4136CA] text-white border-[#4136CA] shadow-sm'
                              : 'bg-white text-slate-700 border-[#DFD8F3] hover:bg-[#F4F1FA]'
                          }`}
                        >
                          {lang.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Short bio and teaching approach */}
                <div className="space-y-1">
                  <label htmlFor="tutor-bio-textarea" className="text-sm font-semibold text-[#1C1938] flex items-center justify-between">
                    <span>Short Bio & Teaching Approach <span className="text-red-500">*</span></span>
                    <span className="text-xs text-slate-400 font-normal">{bioIntro.length}/400</span>
                  </label>
                  <textarea
                    id="tutor-bio-textarea"
                    rows={3}
                    maxLength={400}
                    placeholder="Describe how you help students understand tough concepts, your patience with doubts, and your experience with Kannada-medium students..."
                    value={bioIntro}
                    onChange={(e) => setBioIntro(e.target.value)}
                    className="clay-input text-xs"
                  />
                </div>

                {/* Teaching experience */}
                <ClayInput
                  label="Relevant Experience (Optional)"
                  placeholder="e.g. 2 years home tutoring, school teaching, coaching"
                  value={teachingExperience}
                  onChange={(e) => setTeachingExperience(e.target.value)}
                />
              </div>
            )}

            {/* STEP 2: Proposed Fees & Schedule */}
            {currentStep === 2 && (
              <div className="space-y-5 animate-fade-in text-left">
                <div>
                  <h3 className="text-lg font-bold text-[#1C1938]">Proposed Fees & Schedule</h3>
                  <p className="text-xs text-slate-500 font-kannada">
                    ಲಭ್ಯತೆ ಮತ್ತು ಶುಲ್ಕ • Set your availability and proposed tuition rate
                  </p>
                </div>

                {/* Proposed fee & unit */}
                <div className="p-4 rounded-2xl bg-[#F4F1FA] border border-[#DFD8F3] space-y-3">
                  <label className="text-sm font-bold text-[#1C1938] block">
                    Proposed Tutoring Rate <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <ClayInput
                      label="Amount (₹)"
                      type="number"
                      placeholder="e.g. 350"
                      value={feeAmount}
                      onChange={(e) => setFeeAmount(e.target.value)}
                      icon={<IndianRupee className="w-4 h-4 text-[#4136CA]" />}
                    />

                    <div className="flex flex-col gap-1.5 text-left">
                      <label htmlFor="tutor-fee-unit-select" className="text-sm font-semibold text-[#1C1938]">
                        Fee Unit <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="tutor-fee-unit-select"
                        value={feeUnit}
                        onChange={(e) => setFeeUnit(e.target.value as FeeUnit)}
                        className="clay-input"
                      >
                        {FEE_UNITS.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    This is your proposed fee displayed on your tutor card. Terms can be confirmed directly upon matching.
                  </p>
                </div>

                {/* Days available */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#1C1938] block">
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
                              ? 'bg-[#4136CA] text-white border-[#4136CA] shadow-sm'
                              : 'bg-white text-slate-700 border-[#DFD8F3] hover:bg-[#F4F1FA]'
                          }`}
                        >
                          {day.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Time windows */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#1C1938] block">
                    Daily Time Slots <span className="text-red-500">*</span>
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
                              ? 'bg-[#DFD8F3]/60 border-[#4136CA] text-[#4136CA] shadow-sm'
                              : 'bg-white border-[#DFD8F3] text-slate-700 hover:bg-[#F4F1FA]'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-[#4136CA]" />
                            {win.label}
                          </span>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            readOnly
                            className="rounded text-[#4136CA]"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Hours per day */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="tutor-hours-day-select" className="text-sm font-semibold text-[#1C1938]">
                    Approximate Hours Available Per Day
                  </label>
                  <select
                    id="tutor-hours-day-select"
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
              </div>
            )}

            {/* STEP 3: Review & Submit */}
            {currentStep === 3 && (
              <div className="space-y-5 animate-fade-in text-left">
                <div>
                  <h3 className="text-lg font-bold text-[#1C1938]">Review & Consent</h3>
                  <p className="text-xs text-slate-500">
                    Review your application summary before final submission.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#F4F1FA] border border-[#DFD8F3] space-y-2.5 text-xs text-[#1C1938]">
                  <p><strong>Name:</strong> {name} • +91 {phone}</p>
                  <p><strong>Education:</strong> {EDUCATION_LEVELS.find((e) => e.id === educationLevel)?.label}</p>
                  <p><strong>Subjects:</strong> {selectedSubjects.map((s) => SCHOOL_SUBJECTS.find((sub) => sub.id === s)?.label).join(', ')}</p>
                  <p><strong>Classes:</strong> {selectedClasses.map((c) => c.replace('class_', 'Class ')).join(', ')}</p>
                  <p><strong>Proposed Fee:</strong> ₹{feeAmount} {FEE_UNITS.find((u) => u.id === feeUnit)?.label}</p>
                  <p><strong>Languages:</strong> {teachingLanguages.join(', ')}</p>
                  <p><strong>Bio:</strong> {bioIntro}</p>
                </div>

                <div className="space-y-3 pt-2">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consentReview}
                      onChange={(e) => setConsentReview(e.target.checked)}
                      className="mt-1 w-4 h-4 rounded text-[#4136CA] focus:ring-0"
                    />
                    <span className="text-xs text-slate-700 leading-relaxed">
                      I understand that applications are <strong>reviewed manually</strong> by the founder and trusted educators outside the app before profile approval.
                    </span>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={confirmAccuracy}
                      onChange={(e) => setConfirmAccuracy(e.target.checked)}
                      className="mt-1 w-4 h-4 rounded text-[#4136CA] focus:ring-0"
                    />
                    <span className="text-xs text-slate-700 leading-relaxed">
                      I confirm that all submitted educational and contact details are truthful and authentic.
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="pt-6 border-t border-[#DFD8F3] flex items-center justify-between gap-3">
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
                  onClick={handleSubmit}
                >
                  Submit Tutor Application
                </ClayButton>
              )}
            </div>
          </ClayCard>
        )}
      </main>
    </div>
  );
};
