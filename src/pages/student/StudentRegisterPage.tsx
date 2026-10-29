import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  ShieldCheck,
  AlertCircle,
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
  INDIVIDUAL_CLASSES,
  EDUCATION_BOARDS,
  TEACHING_LANGUAGES,
  SCHOOL_SUBJECTS,
} from '../../config/options';

const STEPS = [
  { id: 0, label: 'Student Account', shortLabel: 'Account' },
  { id: 1, label: 'Academic Details', shortLabel: 'Academics' },
];

export const StudentRegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { signUp, createProfile, saveStudentProfile, user } = useAuth();

  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 0: Account Details
  const [studentName, setStudentName] = useState('');
  const [email, setEmail] = useState('');
  const [studentPhone, setStudentPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [guardianConsent, setGuardianConsent] = useState(true);

  // Step 1: Academic Profile
  const [selectedClass, setSelectedClass] = useState(INDIVIDUAL_CLASSES[7].id); // default Class 8
  const [selectedBoard, setSelectedBoard] = useState(EDUCATION_BOARDS[0].id); // Karnataka State Board
  const [preferredLanguage, setPreferredLanguage] = useState(TEACHING_LANGUAGES[0].id); // Kannada
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(['mathematics', 'science']);
  const [learningGoals, setLearningGoals] = useState('');

  const toggleSubject = (subId: string) => {
    if (selectedSubjects.includes(subId)) {
      setSelectedSubjects(selectedSubjects.filter((s) => s !== subId));
    } else {
      setSelectedSubjects([...selectedSubjects, subId]);
    }
  };

  const handleNext = () => {
    setError(null);

    if (currentStep === 0) {
      if (!studentName.trim()) return setError('Please enter student’s full name.');
      if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        return setError('Please enter a valid email address.');
      }
      if (studentPhone.length !== 10 || !/^[6-9]\d{9}$/.test(studentPhone)) {
        return setError('Enter a valid 10-digit mobile number.');
      }
      if (!guardianConsent) {
        return setError('Parent / Guardian consent is required for school student enrollment.');
      }
      if (!user) {
        const { isValid } = validatePasswordStrength(password);
        if (!isValid) {
          return setError('Please satisfy all 5 password requirements.');
        }
        if (password !== confirmPassword) {
          return setError('Passwords do not match.');
        }
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

  const handleSubmit = async () => {
    setError(null);

    if (selectedSubjects.length === 0) {
      setError('Please select at least one subject you would like help with.');
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

      const { error: profErr } = await createProfile({
        id: activeUserId,
        role: 'student',
        name: studentName.trim(),
        email: email.trim(),
        phone: `+91 ${studentPhone.trim()}`,
      });

      if (profErr) {
        setError(profErr);
        setIsSubmitting(false);
        return;
      }

      const { error: studentErr } = await saveStudentProfile({
        student_id: activeUserId,
        class_level: INDIVIDUAL_CLASSES.find((c) => c.id === selectedClass)?.label || selectedClass,
        board: EDUCATION_BOARDS.find((b) => b.id === selectedBoard)?.label || selectedBoard,
        learning_language: TEACHING_LANGUAGES.find((l) => l.id === preferredLanguage)?.label || preferredLanguage,
        subjects: selectedSubjects,
        learning_goals: learningGoals.trim() || undefined,
        guardian_phone: guardianPhone ? `+91 ${guardianPhone.trim()}` : undefined,
        guardian_consent: guardianConsent,
      });

      if (studentErr) {
        setError(studentErr);
        setIsSubmitting(false);
        return;
      }

      navigate('/student/dashboard', { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#EEF4FA]">
      <Header
        title="Student Registration"
        subtitle={`Step ${currentStep + 1} of ${STEPS.length}: ${STEPS[currentStep].label}`}
        onBack={handlePrev}
      />
      <SetupNotice />

      <main className="flex-1 max-w-xl mx-auto w-full px-4 sm:px-6 py-6 flex flex-col justify-between">
        <div className="mb-4">
          <ProgressBar
            steps={STEPS}
            currentStep={currentStep}
            onStepClick={(idx) => setCurrentStep(idx)}
            allowStepClick={true}
          />
        </div>

        <ClayCard className="p-6 sm:p-8 space-y-6 flex-1 flex flex-col justify-between">
          {error && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 0: Student Account & Guardian Consent */}
          {currentStep === 0 && (
            <div className="space-y-4 animate-fade-in text-left">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Student Account</h3>
                <p className="text-xs text-slate-500 font-kannada">
                  ವಿದ್ಯಾರ್ಥಿಯ ವಿವರಗಳು • Safe and simple student registration
                </p>
              </div>

              <ClayInput
                label="Student's Full Name"
                kannadaLabel="ವಿದ್ಯಾರ್ಥಿಯ ಪೂರ್ಣ ಹೆಸರು"
                required
                placeholder="e.g. Ananya Rao"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                icon={<User className="w-4 h-4" />}
              />

              <ClayInput
                label="Email Address (Student or Guardian)"
                kannadaLabel="ಇಮೇಲ್ ವಿಳಾಸ"
                type="email"
                required
                placeholder="student@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail className="w-4 h-4" />}
                hint="Used to sign in and receive tutor response notifications."
              />

              <PhoneInput
                id="student-phone-input"
                label="Student / Family Mobile Number"
                kannadaLabel="ಸಂಪರ್ಕ ಸಂಖ್ಯೆ"
                required
                value={studentPhone}
                onChange={setStudentPhone}
                hint="10-digit mobile number for communication."
              />

              {!user && (
                <>
                  <PasswordInput
                    label="Account Password"
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

              {/* Child Safety & Guardian Details */}
              <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-100 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>Child Privacy & Guardian Safeguards</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Shikshan is designed for school-age students. We minimize data collection and do not expose children&apos;s contact numbers publicly.
                </p>

                <PhoneInput
                  id="guardian-phone-input"
                  label="Parent / Guardian Alternate Mobile (Optional)"
                  kannadaLabel="ಪಾಲಕರ ಮೊಬೈಲ್"
                  required={false}
                  value={guardianPhone}
                  onChange={setGuardianPhone}
                  hint="Optional secondary family phone for guardian updates."
                />

                <label className="flex items-start gap-2.5 pt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={guardianConsent}
                    onChange={(e) => setGuardianConsent(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded text-blue-600 focus:ring-0"
                  />
                  <span className="text-xs font-semibold text-slate-800 leading-snug">
                    Parent / Guardian confirms consent for learning and tutor discovery on Shikshan.
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* STEP 1: Academic Profile */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-fade-in text-left">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Academic Details</h3>
                <p className="text-xs text-slate-500 font-kannada">
                  ತರಗತಿ ಮತ್ತು ಪಠ್ಯಕ್ರಮ • Tell us what you want to learn
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="student-class-select" className="text-sm font-semibold text-slate-800 flex justify-between">
                  <span>Current Class (Classes 1–10) <span className="text-red-500">*</span></span>
                  <span className="text-xs font-normal text-slate-500 font-kannada">ತರಗತಿ</span>
                </label>
                <select
                  id="student-class-select"
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="clay-input"
                >
                  {INDIVIDUAL_CLASSES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="student-board-select" className="text-sm font-semibold text-slate-800 flex justify-between">
                  <span>School Board / Curriculum <span className="text-red-500">*</span></span>
                  <span className="text-xs font-normal text-slate-500 font-kannada">ಪಠ್ಯಕ್ರಮ ಮಂಡಳಿ</span>
                </label>
                <select
                  id="student-board-select"
                  value={selectedBoard}
                  onChange={(e) => setSelectedBoard(e.target.value)}
                  className="clay-input"
                >
                  {EDUCATION_BOARDS.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="student-lang-select" className="text-sm font-semibold text-slate-800 flex justify-between">
                  <span>Preferred Learning Language <span className="text-red-500">*</span></span>
                  <span className="text-xs font-normal text-slate-500 font-kannada">ಕಲಿಕೆಯ ಮಾಧ್ಯಮ</span>
                </label>
                <select
                  id="student-lang-select"
                  value={preferredLanguage}
                  onChange={(e) => setPreferredLanguage(e.target.value)}
                  className="clay-input"
                >
                  {TEACHING_LANGUAGES.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subjects requiring support */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-800 flex justify-between">
                  <span>Subjects You Need Help With <span className="text-red-500">*</span></span>
                  <span className="text-xs font-normal text-slate-500 font-kannada">ಸಹಾಯ ಬೇಕಿರುವ ವಿಷಯಗಳು</span>
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

              {/* Optional Learning Goals */}
              <div className="space-y-1">
                <label htmlFor="student-goals-input" className="text-sm font-semibold text-slate-800 block">
                  Learning Goals & Specific Difficulties (Optional)
                </label>
                <textarea
                  id="student-goals-input"
                  rows={2}
                  maxLength={300}
                  placeholder="e.g. Need help with SSLC algebra formulas, geometry theorems, and English grammar..."
                  value={learningGoals}
                  onChange={(e) => setLearningGoals(e.target.value)}
                  className="clay-input text-xs"
                />
              </div>
            </div>
          )}

          {/* Navigation Controls */}
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
                onClick={handleSubmit}
              >
                Complete Registration
              </ClayButton>
            )}
          </div>
        </ClayCard>
      </main>
    </div>
  );
};
