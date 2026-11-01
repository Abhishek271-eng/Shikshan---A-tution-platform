import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  User,
  Mail,
  GraduationCap,
  Clock,
  CheckCircle2,
  AlertCircle,
  IndianRupee,
  ArrowRight,
  ArrowLeft,
  Check,
  Building2,
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
import { useNavigation } from '../../context/NavigationContext';
import {
  EDUCATION_LEVELS,
  SCHOOL_SUBJECTS,
  INDIVIDUAL_CLASSES,
  TEACHING_LANGUAGES,
  WEEKDAYS,
} from '../../config/options';

const STEPS = [
  { id: 0, label: 'Tutor Account', shortLabel: 'Account' },
  { id: 1, label: 'Teaching Profile', shortLabel: 'Profile' },
  { id: 2, label: 'Monthly Fees & Schedule', shortLabel: 'Fees' },
  { id: 3, label: 'Review & Submit', shortLabel: 'Review' },
];

const DAILY_HOURS_OPTIONS = [
  { value: 1, label: '1 hour/day' },
  { value: 2, label: '2 hours/day' },
  { value: 3, label: '3 hours/day' },
  { value: 4, label: '4 hours/day' },
  { value: 5, label: '5+ hours/day' },
];

export const TutorRegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { signUp, saveTutorApplication, uploadPhoto, user } = useAuth();
  const { pushBackHandler } = useNavigation();

  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Handle hardware / global back button to step backwards
  useEffect(() => {
    if (currentStep > 0) {
      return pushBackHandler(() => {
        setCurrentStep((prev) => prev - 1);
        return true;
      });
    }
  }, [currentStep, pushBackHandler]);

  // Step 0: Account Information
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(
    user?.photo_url || (import.meta.env.MODE === 'test' ? 'data:image/jpeg;base64,mockphoto' : null)
  );

  // Step 1: Teaching Profile & Qualifications
  const [educationLevel, setEducationLevel] = useState(EDUCATION_LEVELS[2].id);
  const [courseQualification, setCourseQualification] = useState('B.Sc / Degree');
  const [institutionName, setInstitutionName] = useState('Bangalore University');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(['mathematics', 'science']);
  const [selectedClasses, setSelectedClasses] = useState<string[]>(['class_6', 'class_7', 'class_8']);
  const [teachingLanguages, setTeachingLanguages] = useState<string[]>(['kannada', 'english']);
  const [bioIntro, setBioIntro] = useState('');
  const [teachingExperience, setTeachingExperience] = useState('');

  // Step 2: Availability & Proposed Monthly Fees
  const [availableDays, setAvailableDays] = useState<string[]>(['mon', 'tue', 'wed', 'thu', 'fri', 'sat']);
  const [timeWindows] = useState<string[]>(['evening_prime']);
  const [hoursPerDay, setHoursPerDay] = useState<number>(2);
  const [monthlyFee, setMonthlyFee] = useState<string>('3000');

  // Step 3: Consent & Confirmation
  const [consentReview, setConsentReview] = useState(false);
  const [confirmAccuracy, setConfirmAccuracy] = useState(false);

  const toggleSubject = (subId: string) => {
    if (selectedSubjects.includes(subId)) {
      if (selectedSubjects.length > 1) setSelectedSubjects(selectedSubjects.filter((s) => s !== subId));
    } else {
      setSelectedSubjects([...selectedSubjects, subId]);
    }
  };

  const toggleClass = (classId: string) => {
    if (selectedClasses.includes(classId)) {
      if (selectedClasses.length > 1) setSelectedClasses(selectedClasses.filter((c) => c !== classId));
    } else {
      setSelectedClasses([...selectedClasses, classId]);
    }
  };

  const toggleLanguage = (langId: string) => {
    if (teachingLanguages.includes(langId)) {
      if (teachingLanguages.length > 1) setTeachingLanguages(teachingLanguages.filter((l) => l !== langId));
    } else {
      setTeachingLanguages([...teachingLanguages, langId]);
    }
  };

  const toggleDay = (dayId: string) => {
    if (availableDays.includes(dayId)) {
      if (availableDays.length > 1) setAvailableDays(availableDays.filter((d) => d !== dayId));
    } else {
      setAvailableDays([...availableDays, dayId]);
    }
  };

  const handleNext = () => {
    setError(null);

    // Step 0 validation: Photo is MANDATORY for tutors
    if (currentStep === 0) {
      if (!photoUrl && !user?.photo_url) {
        return setError('A clear profile photo is mandatory for verified tutor applications. Please upload your photo.');
      }
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
          return setError('Please satisfy all 5 password requirements.');
        }
        if (password !== confirmPassword) {
          return setError('Passwords do not match.');
        }
      }
    }

    // Step 1 validation: Numerical experience > 0 only
    if (currentStep === 1) {
      if (!courseQualification.trim()) return setError('Please enter your course or qualification degree.');
      if (!institutionName.trim()) return setError('Please enter your college or university.');
      if (selectedSubjects.length === 0) return setError('Select at least one subject you can teach.');
      if (selectedClasses.length === 0) return setError('Select at least one class level.');
      if (teachingLanguages.length === 0) return setError('Select at least one teaching medium/language.');
      if (!bioIntro.trim() || bioIntro.trim().length < 20) {
        return setError('Please write a brief bio or teaching approach (at least 20 characters).');
      }
      if (teachingExperience.trim()) {
        const expNum = parseInt(teachingExperience.trim(), 10);
        if (isNaN(expNum) || expNum <= 0) {
          return setError('Teaching experience must be a positive number of years (> 0). e.g., 2');
        }
      }
    }

    // Step 2 validation: Monthly Fees (strictly <= 3,000) & Availability
    if (currentStep === 2) {
      const parsedFee = parseFloat(monthlyFee);
      if (isNaN(parsedFee) || parsedFee <= 0 || parsedFee > 3000) {
        return setError('Monthly fee must be a valid amount between ₹100 and ₹3,000 (maximum allowed monthly cap).');
      }
      if (availableDays.length === 0) {
        return setError('Please select at least one day you are available.');
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

    if (!consentReview) {
      return setError('You must agree to manual credential review by the Shikshan team.');
    }
    if (!confirmAccuracy) {
      return setError('You must confirm that the qualifications and experience provided are genuine.');
    }

    setIsSubmitting(true);

    try {
      if (!user) {
        const { error: signUpErr } = await signUp(
          email.trim().toLowerCase(),
          password,
          name.trim(),
          phone.trim(),
          'tutor'
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

      const { error: appErr } = await saveTutorApplication({
        education_level: EDUCATION_LEVELS.find((e) => e.id === educationLevel)?.label || educationLevel,
        course_qualification: courseQualification.trim(),
        institution_name: institutionName.trim(),
        subjects: selectedSubjects,
        classes: selectedClasses,
        teaching_languages: teachingLanguages,
        bio_intro: bioIntro.trim(),
        experience_summary: teachingExperience.trim() || undefined,
        available_days: availableDays,
        time_windows: timeWindows,
        hours_per_day: hoursPerDay,
        fee_amount: parseFloat(monthlyFee),
        fee_unit: 'per_month',
      });

      if (appErr) {
        setError(appErr);
        setIsSubmitting(false);
        return;
      }

      setIsSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Application submission failed. Please check server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F8F7FD]">
        <Header title="Application Submitted" />
        <main className="flex-1 max-w-md mx-auto w-full px-5 py-12 flex flex-col justify-center pb-36">
          <ClayCard className="p-8 text-center space-y-5 border border-[#DFD8F3]">
            <div className="w-16 h-16 rounded-full bg-[#EDF7EC] text-[#2C4222] flex items-center justify-center mx-auto shadow-clay-sm">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-[#1C1938]">Application Under Review</h2>
            <p className="text-xs text-[#686487] leading-relaxed">
              Thank you, <strong className="text-[#1C1938]">{name}</strong>! Your tutor profile has been submitted to Shikshan's review desk. The founder and verified teachers review each application manually.
            </p>
            <div className="p-4 rounded-2xl bg-[#F3EFFB] text-xs text-left space-y-1.5 border border-[#DFD8F3]">
              <div className="flex justify-between">
                <span className="text-[#686487]">Submitted for:</span>
                <span className="font-bold text-[#1C1938]">{courseQualification}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#686487]">Proposed rate:</span>
                <span className="font-bold text-[#312E81]">₹{Number(monthlyFee).toLocaleString('en-IN')} / month</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#686487]">Daily Availability:</span>
                <span className="font-bold text-[#1C1938]">{hoursPerDay === 5 ? '5+ hours/day' : `${hoursPerDay} hours/day`}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#686487]">Current Status:</span>
                <span className="font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full text-[10px]">
                  Pending Review
                </span>
              </div>
            </div>
            <div className="pt-2">
              <ClayButton
                variant="primary"
                size="lg"
                onClick={() => navigate('/tutor/status')}
                className="w-full rounded-full py-3 text-xs font-bold shadow-button-primary"
              >
                Go to Application Dashboard
              </ClayButton>
            </div>
          </ClayCard>
        </main>
      </div>
    );
  }

  return (
    <ClayBackground>
      <Header
        title="Tutor Application"
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
          {/* STEP 0: Account */}
          {currentStep === 0 && (
            <div className="space-y-4">
              <div className="border-b border-[#E6E1F7] pb-3 mb-2">
                <h3 className="text-xl font-black text-[#1C1938] tracking-tight">Basic Account Information</h3>
                <p className="text-xs text-[#686487] mt-0.5">
                  Information for tutor account management and coordinator contact
                </p>
              </div>

              {/* Profile Photo Upload */}
              <div className="p-3.5 rounded-2xl bg-[#FAF9FE] border border-[#E5DFF8]">
                <ClayUploadButton
                  currentPhotoUrl={photoUrl}
                  onPhotoSelected={(url) => setPhotoUrl(url)}
                  onPhotoRemoved={() => setPhotoUrl(null)}
                  label="Tutor Profile Photo (Mandatory) *"
                  subLabel="A clear, professional face photo is required for educator verification"
                />
              </div>

              <ClayInput
                id="tutor-name"
                label="Full Name"
                kannadaLabel="ಪೂರ್ಣ ಹೆಸರು"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                icon={<User className="w-4 h-4" />}
              />

              <ClayInput
                id="tutor-email"
                label="Email Address"
                kannadaLabel="ಇಮೇಲ್ ವಿಳಾಸ"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail className="w-4 h-4" />}
              />

              <PhoneInput
                id="tutor-phone"
                label="Mobile Number (WhatsApp preferred)"
                kannadaLabel="ಮೊಬೈಲ್ ಸಂಖ್ಯೆ"
                required
                value={phone}
                onChange={setPhone}
              />

              {!user && (
                <>
                  <PasswordInput
                    id="tutor-password"
                    label="Create Password"
                    kannadaLabel="ಪಾಸ್‌ವರ್ಡ್ ರಚಿಸಿ"
                    required
                    value={password}
                    onChange={setPassword}
                    showRequirements={true}
                    showStrengthIndicator
                  />

                  <PasswordInput
                    id="tutor-confirm-password"
                    label="Confirm Password"
                    kannadaLabel="ಪಾಸ್‌ವರ್ಡ್ ದೃಢೀಕರಿಸಿ"
                    required
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    showRequirements={false}
                  />
                </>
              )}
            </div>
          )}

          {/* STEP 1: Teaching Profile */}
          {currentStep === 1 && (
            <div className="space-y-5">
              <div className="border-b border-[#E6E1F7] pb-3 mb-2">
                <h3 className="text-xl font-black text-[#1C1938] tracking-tight">Teaching Profile & Expertise</h3>
                <p className="text-xs text-[#686487] mt-0.5">
                  Your degree, subjects, and teaching languages for student discovery
                </p>
              </div>

              <div>
                <label htmlFor="education-level-select" className="block text-xs font-bold uppercase tracking-wider text-[#1C1938] mb-1.5">
                  Highest Education Level <span className="text-red-500">*</span>
                </label>
                <select
                  id="education-level-select"
                  value={educationLevel}
                  onChange={(e) => setEducationLevel(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-white border border-[#DFD8F3] text-xs font-bold text-[#1C1938] focus:outline-none focus:ring-2 focus:ring-[#4136CA]"
                >
                  {EDUCATION_LEVELS.map((el) => (
                    <option key={el.id} value={el.id}>
                      {el.label}
                    </option>
                  ))}
                </select>
              </div>

              <ClayInput
                id="tutor-course"
                label="Course / Degree"
                kannadaLabel="ಕೋರ್ಸ್ / ಪದವಿ"
                required
                value={courseQualification}
                onChange={(e) => setCourseQualification(e.target.value)}
                icon={<GraduationCap className="w-4 h-4" />}
              />

              <ClayInput
                id="tutor-institution"
                label="College / University"
                kannadaLabel="ಕಾಲೇಜು / ವಿಶ್ವವಿದ್ಯಾಲಯ"
                required
                value={institutionName}
                onChange={(e) => setInstitutionName(e.target.value)}
                icon={<Building2 className="w-4 h-4" />}
              />

              {/* Subjects to Teach */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1C1938] mb-2">
                  Subjects You Can Teach <span className="text-red-500">*</span>
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

              {/* Eligible Class Levels */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1C1938] mb-2">
                  Eligible Class Levels <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {INDIVIDUAL_CLASSES.map((cls) => {
                    const isSelected = selectedClasses.includes(cls.id);
                    return (
                      <button
                        key={cls.id}
                        type="button"
                        onClick={() => toggleClass(cls.id)}
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

              {/* Teaching Languages */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1C1938] mb-2">
                  Teaching Medium / Languages <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {TEACHING_LANGUAGES.map((lang) => {
                    const isSelected = teachingLanguages.includes(lang.id);
                    return (
                      <button
                        key={lang.id}
                        type="button"
                        onClick={() => toggleLanguage(lang.id)}
                        className={`p-2.5 rounded-xl text-center border text-xs font-bold transition-all ${
                          isSelected
                            ? 'bg-[#EEECFB] text-[#312E81] border-[#A7AAE5]'
                            : 'bg-white text-[#4A4668] border-[#DFD8F3] hover:border-[#A7AAE5]'
                        }`}
                      >
                        {lang.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bio & Approach */}
              <div>
                <label htmlFor="tutor-bio" className="block text-xs font-bold uppercase tracking-wider text-[#1C1938] mb-1">
                  Brief Bio / Teaching Approach <span className="text-red-500">*</span>
                </label>
                <p className="text-[11px] text-[#686487] mb-1.5">
                  Describe how you help students understand tough concepts and build academic confidence
                </p>
                <textarea
                  id="tutor-bio"
                  rows={3}
                  value={bioIntro}
                  onChange={(e) => setBioIntro(e.target.value)}
                  className="w-full p-3 rounded-xl bg-white border border-[#DFD8F3] text-xs text-[#1C1938] focus:outline-none focus:ring-2 focus:ring-[#4136CA]"
                />
              </div>

              <div>
                <ClayInput
                  id="tutor-experience"
                  label="Teaching Experience (Years)"
                  kannadaLabel="ಬೋಧನಾ ಅನುಭವ (ವರ್ಷಗಳು)"
                  type="number"
                  min="1"
                  placeholder="e.g. 2"
                  value={teachingExperience}
                  onChange={(e) => setTeachingExperience(e.target.value)}
                  icon={<Clock className="w-4 h-4" />}
                />
                <p className="text-[11px] text-[#686487] mt-1 px-1">
                  Enter number of years (&gt; 0). Only positive numerical experience will be displayed on your verified card.
                </p>
              </div>
            </div>
          )}

          {/* STEP 2: Proposed Monthly Fees & Availability */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="border-b border-[#E6E1F7] pb-3 mb-2">
                <h3 className="text-xl font-black text-[#1C1938] tracking-tight">Proposed Monthly Fees & Availability</h3>
                <p className="text-xs text-[#686487] mt-0.5">
                  Set your proposed monthly pricing and daily teaching commitment
                </p>
              </div>

              {/* Proposed Monthly Fees (Pure Monthly Pricing, Max ₹3,000 Cap) */}
              <div className="space-y-1.5">
                <ClayInput
                  id="fee-amount"
                  label="Proposed Monthly Fees (₹) — Max ₹3,000"
                  kannadaLabel="ತಿಂಗಳ ಬೋಧನಾ ಶುಲ್ಕ (₹)"
                  type="number"
                  min="100"
                  max="3000"
                  step="100"
                  required
                  value={monthlyFee}
                  onChange={(e) => setMonthlyFee(e.target.value)}
                  icon={<IndianRupee className="w-4 h-4" />}
                />
                <p className="text-[11px] text-[#686487] px-1">
                  Enter your proposed monthly fee (₹100 to ₹3,000 max cap). Approved by Admin upon credential verification.
                </p>
              </div>

              {/* Daily Availability: Dedicated Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1C1938] mb-1">
                  Daily Availability (Hours / Day) <span className="text-red-500">*</span>
                </label>
                <p className="text-[11px] text-[#686487] mb-2.5">
                  How many hours per day are you available to mentor students?
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {DAILY_HOURS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setHoursPerDay(opt.value)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all text-center ${
                        hoursPerDay === opt.value
                          ? 'bg-[#312E81] text-white border-[#312E81] shadow-xs'
                          : 'bg-white text-[#4A4668] border-[#DFD8F3] hover:border-[#A7AAE5]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Weekly Availability: Weekday Chips */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1C1938] mb-1">
                  Available Days of the Week <span className="text-red-500">*</span>
                </label>
                <p className="text-[11px] text-[#686487] mb-2">
                  Select all days on which you can conduct sessions
                </p>
                <div className="grid grid-cols-7 gap-1.5">
                  {WEEKDAYS.map((day) => {
                    const isSelected = availableDays.includes(day.id);
                    return (
                      <button
                        key={day.id}
                        type="button"
                        onClick={() => toggleDay(day.id)}
                        className={`py-2 px-1 rounded-xl text-center text-xs font-bold border transition-all ${
                          isSelected
                            ? 'bg-[#312E81] text-white border-[#312E81] shadow-xs'
                            : 'bg-white text-[#4A4668] border-[#DFD8F3] hover:border-[#A7AAE5]'
                        }`}
                      >
                        {day.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Review & Consent */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="border-b border-[#E6E1F7] pb-3 mb-2">
                <h3 className="text-xl font-black text-[#1C1938] tracking-tight">Review & Consent</h3>
                <p className="text-xs text-[#686487] mt-0.5">
                  Verify your details before submitting for founder & teacher review
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#F3EEFB] border border-[#DFD8F3] space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#686487]">Tutor:</span>
                  <span className="font-bold text-[#1C1938]">{name} ({phone})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#686487]">Qualification:</span>
                  <span className="font-bold text-[#1C1938]">{courseQualification} • {institutionName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#686487]">Subjects:</span>
                  <span className="font-bold text-[#312E81]">{selectedSubjects.join(', ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#686487]">Proposed Monthly Fee:</span>
                  <span className="font-bold text-[#312E81]">₹{Number(monthlyFee).toLocaleString('en-IN')} / month</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#686487]">Daily Commitment:</span>
                  <span className="font-bold text-[#1C1938]">{hoursPerDay === 5 ? '5+ hours/day' : `${hoursPerDay} hours/day`}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#686487]">Teaching Days:</span>
                  <span className="font-bold text-[#1C1938]">{availableDays.map((d) => d.toUpperCase()).join(', ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#686487]">Languages:</span>
                  <span className="font-bold text-[#1C1938]">{teachingLanguages.join(', ')}</span>
                </div>
              </div>

              <div className="space-y-2.5 pt-2">
                <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-white border border-[#DFD8F3] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentReview}
                    onChange={(e) => setConsentReview(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded text-[#4136CA] focus:ring-[#4136CA]"
                  />
                  <span className="text-xs text-[#4A4668] leading-relaxed">
                    I agree to have my tutor credentials reviewed manually by the Shikshan coordination team.
                  </span>
                </label>

                <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-white border border-[#DFD8F3] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={confirmAccuracy}
                    onChange={(e) => setConfirmAccuracy(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded text-[#4136CA] focus:ring-[#4136CA]"
                  />
                  <span className="text-xs text-[#4A4668] leading-relaxed">
                    I confirm that the academic qualifications and experience details provided are genuine.
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
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
                Back
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
                <CheckCircle2 className="w-4 h-4" />
                Submit Tutor Application
              </ClayButton>
            )}
          </div>
        </ClayCard>
      </main>
    </ClayBackground>
  );
};
