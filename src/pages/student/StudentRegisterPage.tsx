import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  User,
  Mail,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Check,
} from 'lucide-react';
import { Header } from '../../components/common/Header';
import { ClayCard } from '../../components/common/ClayCard';
import { ClayInput } from '../../components/common/ClayInput';
import { ClayButton } from '../../components/common/ClayButton';
import { ClayBackground } from '../../components/common/ClayBackground';
import { ClayUploadButton } from '../../components/common/ClayUploadButton';
import { PhoneInput } from '../../components/common/PhoneInput';
import { PasswordInput, validatePasswordStrength } from '../../components/common/PasswordInput';
import { ProgressBar } from '../../components/common/ProgressBar';
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
  const { signUp, saveStudentProfile, uploadPhoto, user } = useAuth();

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
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  // Step 1: Academic Profile
  const [selectedClass, setSelectedClass] = useState(INDIVIDUAL_CLASSES[7].id); // default Class 8
  const [selectedBoard, setSelectedBoard] = useState(EDUCATION_BOARDS[0].id); // Karnataka State Board
  const [preferredLanguage, setPreferredLanguage] = useState(TEACHING_LANGUAGES[0].id); // Kannada
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(['mathematics', 'science']);
  const [learningGoals, setLearningGoals] = useState('');

  const toggleSubject = (subId: string) => {
    if (selectedSubjects.includes(subId)) {
      if (selectedSubjects.length > 1) {
        setSelectedSubjects(selectedSubjects.filter((s) => s !== subId));
      }
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
          return setError('Please satisfy all password requirements.');
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
      if (!user) {
        const { error: signUpErr } = await signUp(
          email.trim().toLowerCase(),
          password,
          studentName.trim(),
          studentPhone.trim(),
          'student'
        );

        if (signUpErr) {
          setError(signUpErr);
          setIsSubmitting(false);
          return;
        }

        if (photoUrl) {
          await uploadPhoto(photoUrl).catch(() => {});
        }
      } else if (photoUrl) {
        await uploadPhoto(photoUrl).catch(() => {});
      }

      const { error: studentErr } = await saveStudentProfile({
        class_level: INDIVIDUAL_CLASSES.find((c) => c.id === selectedClass)?.label || selectedClass,
        board: EDUCATION_BOARDS.find((b) => b.id === selectedBoard)?.label || selectedBoard,
        learning_language: TEACHING_LANGUAGES.find((l) => l.id === preferredLanguage)?.label || preferredLanguage,
        subjects: selectedSubjects,
        learning_goals: learningGoals.trim() || undefined,
        guardian_phone: guardianPhone ? `+91 ${guardianPhone.trim()}` : undefined,
      });

      if (studentErr) {
        setError(studentErr);
        setIsSubmitting(false);
        return;
      }

      navigate('/student/dashboard', { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please check server connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ClayBackground>
      <Header
        title="Student Registration"
        subtitle={`Step ${currentStep + 1} of ${STEPS.length}: ${STEPS[currentStep].label}`}
        onBack={handlePrev}
      />

      <main className="flex-1 max-w-lg mx-auto w-full px-4 sm:px-6 py-6 pb-36">
        {/* Step Indicator */}
        <div className="mb-6">
          <ProgressBar currentStep={currentStep} steps={STEPS} />
        </div>

        {/* Error Alert */}
        {error && (
          <div
            role="alert"
            className="mb-6 p-4 rounded-2xl bg-[#FEF2F2] border border-[#FECACA] flex items-start gap-3 text-xs text-[#991B1B] font-medium"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#DC2626]" />
            <p className="leading-relaxed">{error}</p>
          </div>
        )}

        <ClayCard className="p-6 sm:p-8 space-y-6 shadow-clay border border-[#DFD8F3]">
          {/* STEP 0: Account Details */}
          {currentStep === 0 && (
            <div className="space-y-4">
              <div className="border-b border-[#E6E1F7] pb-3 mb-2">
                <h3 className="text-xl font-black text-[#1C1938] tracking-tight">Student Account</h3>
                <p className="text-xs text-[#686487] mt-0.5">
                  Child Privacy & Guardian Safeguards
                </p>
              </div>

              {/* Profile Photo Upload */}
              <div className="p-3.5 rounded-2xl bg-[#FAF9FE] border border-[#E5DFF8]">
                <ClayUploadButton
                  currentPhotoUrl={photoUrl}
                  onPhotoSelected={(url) => setPhotoUrl(url)}
                  onPhotoRemoved={() => setPhotoUrl(null)}
                  label="Student Photo (Optional)"
                  subLabel="Add a photo to personalize student profile"
                />
              </div>

              <ClayInput
                id="student-name"
                label="Student's Full Name"
                kannadaLabel="ವಿದ್ಯಾರ್ಥಿಯ ಪೂರ್ಣ ಹೆಸರು"
                required
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                icon={<User className="w-4 h-4" />}
              />

              <ClayInput
                id="student-email"
                label="Email Address"
                kannadaLabel="ಇಮೇಲ್ ವಿಳಾಸ"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail className="w-4 h-4" />}
              />

              <PhoneInput
                id="student-phone"
                label="Mobile Number"
                kannadaLabel="ಮೊಬೈಲ್ ಸಂಖ್ಯೆ"
                required
                value={studentPhone}
                onChange={setStudentPhone}
              />

              {!user && (
                <>
                  <PasswordInput
                    id="student-password"
                    label="Account Password"
                    kannadaLabel="ಪಾಸ್‌ವರ್ಡ್ ರಚಿಸಿ"
                    required
                    value={password}
                    onChange={setPassword}
                    showRequirements={true}
                    showStrengthIndicator
                  />

                  <PasswordInput
                    id="student-confirm-password"
                    label="Confirm Password"
                    kannadaLabel="ಪಾಸ್‌ವರ್ಡ್ ದೃಢೀಕರಿಸಿ"
                    required
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    showRequirements={false}
                  />
                </>
              )}

              <PhoneInput
                id="guardian-phone"
                label="Parent / Guardian Mobile (Optional)"
                kannadaLabel="ಪೋಷಕರ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ"
                value={guardianPhone}
                onChange={setGuardianPhone}
                hint="For SMS updates regarding tutor connections and sessions"
              />

              <div className="pt-2">
                <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#F3EEFB] border border-[#DFD8F3] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={guardianConsent}
                    onChange={(e) => setGuardianConsent(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded text-[#4136CA] focus:ring-[#4136CA]"
                  />
                  <span className="text-xs text-[#4A4668] leading-relaxed">
                    Parent / Guardian confirms consent for school student enrollment.
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* STEP 1: Academic Details */}
          {currentStep === 1 && (
            <div className="space-y-5">
              <div className="border-b border-[#E6E1F7] pb-3 mb-2">
                <h3 className="text-xl font-black text-[#1C1938] tracking-tight">Academic Details</h3>
                <p className="text-xs text-[#686487] mt-0.5">
                  Select your current school class and subjects to discover matched tutors
                </p>
              </div>

              {/* Class Selection Chips */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1C1938] mb-2.5">
                  Select Current Class <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {INDIVIDUAL_CLASSES.map((cls) => {
                    const isSelected = selectedClass === cls.id;
                    return (
                      <button
                        key={cls.id}
                        type="button"
                        onClick={() => setSelectedClass(cls.id)}
                        className={`py-2 px-1 rounded-xl text-xs font-bold transition-all text-center border ${
                          isSelected
                            ? 'bg-[#312E81] text-white border-[#312E81] shadow-xs'
                            : 'bg-white text-[#4A4668] border-[#DFD8F3] hover:border-[#A7AAE5]'
                        }`}
                      >
                        {cls.label.replace('Class ', 'C-')}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Education Board & Language */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label htmlFor="board-select" className="block text-xs font-bold uppercase tracking-wider text-[#1C1938] mb-1.5">
                    School Board / Curriculum
                  </label>
                  <select
                    id="board-select"
                    value={selectedBoard}
                    onChange={(e) => setSelectedBoard(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl bg-white border border-[#DFD8F3] text-xs font-bold text-[#1C1938] focus:outline-none focus:ring-2 focus:ring-[#4136CA]"
                  >
                    {EDUCATION_BOARDS.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="language-select" className="block text-xs font-bold uppercase tracking-wider text-[#1C1938] mb-1.5">
                    Preferred Learning Language / Medium
                  </label>
                  <select
                    id="language-select"
                    value={preferredLanguage}
                    onChange={(e) => setPreferredLanguage(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl bg-white border border-[#DFD8F3] text-xs font-bold text-[#1C1938] focus:outline-none focus:ring-2 focus:ring-[#4136CA]"
                  >
                    {TEACHING_LANGUAGES.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Subjects to Learn */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1C1938] mb-2.5">
                  Subjects You Need Help With <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {SCHOOL_SUBJECTS.map((sub) => {
                    const isSelected = selectedSubjects.includes(sub.id);
                    return (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => toggleSubject(sub.id)}
                        className={`p-2.5 rounded-xl text-left border flex items-center justify-between text-xs font-bold transition-all ${
                          isSelected
                            ? 'bg-[#EEECFB] text-[#312E81] border-[#A7AAE5]'
                            : 'bg-white text-[#4A4668] border-[#DFD8F3] hover:border-[#A7AAE5]'
                        }`}
                      >
                        <span className="truncate">{sub.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#312E81] flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Learning Goals (Optional) */}
              <div>
                <label htmlFor="learning-goals" className="block text-xs font-bold uppercase tracking-wider text-[#1C1938] mb-1">
                  Specific Learning Goals (Optional)
                </label>
                <p className="text-[11px] text-[#686487] mb-1.5">
                  Describe what you want to achieve or improve in school (e.g. board exam preparation or topic mastery)
                </p>
                <textarea
                  id="learning-goals"
                  rows={2}
                  value={learningGoals}
                  onChange={(e) => setLearningGoals(e.target.value)}
                  className="w-full p-3 rounded-xl bg-white border border-[#DFD8F3] text-xs text-[#1C1938] focus:outline-none focus:ring-2 focus:ring-[#4136CA]"
                />
              </div>
            </div>
          )}

          {/* Bottom Actions */}
          <div className="pt-4 border-t border-[#E6E1F7] flex items-center justify-between gap-3">
            {currentStep > 0 ? (
              <ClayButton
                type="button"
                variant="secondary"
                size="md"
                onClick={handlePrev}
                className="flex items-center gap-1.5 rounded-full px-5 py-2.5 text-xs font-bold"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Previous
              </ClayButton>
            ) : (
              <Link
                to="/login"
                className="text-xs font-bold text-[#4136CA] hover:text-[#3128A3] py-2"
              >
                Already registered? Sign in
              </Link>
            )}

            {currentStep < STEPS.length - 1 ? (
              <ClayButton
                type="button"
                variant="primary"
                size="md"
                onClick={handleNext}
                className="ml-auto flex items-center gap-2 rounded-full px-6 py-2.5 text-xs font-bold shadow-button-primary"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </ClayButton>
            ) : (
              <ClayButton
                type="button"
                variant="primary"
                size="md"
                isLoading={isSubmitting}
                onClick={handleSubmit}
                className="ml-auto flex items-center gap-2 rounded-full px-7 py-2.5 text-xs font-bold shadow-button-primary"
              >
                <ShieldCheck className="w-4 h-4" />
                Complete Registration
              </ClayButton>
            )}
          </div>
        </ClayCard>
      </main>
    </ClayBackground>
  );
};
