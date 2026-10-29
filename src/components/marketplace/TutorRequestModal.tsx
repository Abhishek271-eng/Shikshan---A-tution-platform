import React, { useState } from 'react';
import { X, Send, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { ClayButton } from '../common/ClayButton';
import { ClayInput } from '../common/ClayInput';
import { PhoneInput } from '../common/PhoneInput';
import { TutorApplication } from '../../types';
import { SCHOOL_SUBJECTS, INDIVIDUAL_CLASSES } from '../../config/options';
import { useAuth } from '../../context/AuthContext';

interface TutorRequestModalProps {
  tutor: TutorApplication | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const TutorRequestModal: React.FC<TutorRequestModalProps> = ({
  tutor,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { createTutorRequest, studentProfile } = useAuth();

  const [subject, setSubject] = useState(tutor?.subjects[0] || 'mathematics');
  const [classLevel, setClassLevel] = useState(studentProfile?.class_level || 'Class 8');
  const [learningNeeds, setLearningNeeds] = useState(studentProfile?.learning_goals || '');
  const [preferredSchedule, setPreferredSchedule] = useState('Evening (5:00 PM – 7:00 PM)');
  const [guardianPhone, setGuardianPhone] = useState(
    studentProfile?.guardian_phone?.replace('+91', '').trim() || ''
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen || !tutor) return null;

  const tutorName = tutor.tutor_profile?.name || 'Verified Educator';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!learningNeeds.trim() || learningNeeds.trim().length < 10) {
      setError('Please provide a brief description of your learning needs or doubts (at least 10 characters).');
      return;
    }

    if (guardianPhone && (guardianPhone.length !== 10 || !/^[6-9]\d{9}$/.test(guardianPhone))) {
      setError('Guardian phone must be a valid 10-digit Indian mobile number.');
      return;
    }

    setIsSubmitting(true);

    try {
      const { request, error: reqErr } = await createTutorRequest({
        tutorId: tutor.tutor_id,
        subject,
        classLevel,
        learningNeeds: learningNeeds.trim(),
        preferredSchedule: preferredSchedule.trim() || undefined,
        guardianPhone: guardianPhone ? `+91 ${guardianPhone.trim()}` : undefined,
      });

      if (reqErr) {
        setError(reqErr);
        setIsSubmitting(false);
        return;
      }

      if (request) {
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
          onSuccess();
          onClose();
        }, 1800);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to submit tutor request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-[#DFD8F3] overflow-hidden flex flex-col max-h-[90vh] animate-fade-in"
        role="dialog"
        aria-modal="true"
        aria-label="Request Tutor"
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-[#DFD8F3] flex items-center justify-between bg-[#F4F1FA]">
          <div>
            <h3 className="font-extrabold text-lg text-[#1C1938]">
              Request Tutor: {tutorName}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Submit your learning request directly to this verified educator.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-[#1C1938] hover:bg-[#DFD8F3]/50 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-left">
          {isSuccess ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-[#EBF3E8] text-[#3B522F] border border-[#3B522F]/20 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="font-extrabold text-lg text-[#1C1938]">
                Tutor Request Submitted!
              </h4>
              <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">
                Your request has been delivered to <strong>{tutorName}</strong>. You can track this request under &apos;My Requests&apos;.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
                  <span>{error}</span>
                </div>
              )}

              {/* Subject Selection */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="tutor-req-subject-select" className="text-sm font-semibold text-[#1C1938]">
                  Subject for Tutoring <span className="text-red-500">*</span>
                </label>
                <select
                  id="tutor-req-subject-select"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="clay-input"
                >
                  {tutor.subjects.map((subId) => {
                    const subObj = SCHOOL_SUBJECTS.find((s) => s.id === subId);
                    return (
                      <option key={subId} value={subId}>
                        {subObj?.label || subId}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Class Selection */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="tutor-req-class-select" className="text-sm font-semibold text-[#1C1938]">
                  Student&apos;s Class <span className="text-red-500">*</span>
                </label>
                <select
                  id="tutor-req-class-select"
                  value={classLevel}
                  onChange={(e) => setClassLevel(e.target.value)}
                  className="clay-input"
                >
                  {INDIVIDUAL_CLASSES.map((cls) => (
                    <option key={cls.id} value={cls.label}>
                      {cls.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Learning Needs */}
              <div className="space-y-1">
                <label htmlFor="tutor-req-learning-needs" className="text-sm font-semibold text-[#1C1938] flex justify-between">
                  <span>Learning Needs / Topics <span className="text-red-500">*</span></span>
                  <span className="text-xs text-slate-400 font-normal">{learningNeeds.length}/300</span>
                </label>
                <textarea
                  id="tutor-req-learning-needs"
                  required
                  rows={3}
                  maxLength={300}
                  placeholder="e.g. Need assistance with Mathematics algebra and science physics formulas for SSLC exam preparation in Kannada medium..."
                  value={learningNeeds}
                  onChange={(e) => setLearningNeeds(e.target.value)}
                  className="clay-input text-xs"
                />
              </div>

              {/* Preferred Schedule */}
              <ClayInput
                label="Preferred Days & Time"
                placeholder="e.g. Mon, Wed, Fri (5:00 PM – 7:00 PM)"
                value={preferredSchedule}
                onChange={(e) => setPreferredSchedule(e.target.value)}
                icon={<Clock className="w-4 h-4 text-[#4136CA]" />}
                hint="Tutor will review and confirm their availability."
              />

              {/* Guardian Phone */}
              <PhoneInput
                id="request-guardian-phone"
                label="Parent / Guardian Contact Mobile (Optional)"
                kannadaLabel="ಪಾಲಕರ ಮೊಬೈಲ್"
                required={false}
                value={guardianPhone}
                onChange={setGuardianPhone}
                hint="Used for parent updates regarding tutoring sessions."
              />

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-[#DFD8F3] flex items-center justify-end gap-3">
                <ClayButton
                  type="button"
                  variant="secondary"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </ClayButton>
                <ClayButton
                  type="submit"
                  variant="primary"
                  isLoading={isSubmitting}
                  icon={<Send className="w-4 h-4" />}
                >
                  Submit Request
                </ClayButton>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
