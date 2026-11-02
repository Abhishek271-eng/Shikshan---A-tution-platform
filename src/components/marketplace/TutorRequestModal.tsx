import React, { useState, useEffect } from 'react';
import { X, Send, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { ClayButton } from '../common/ClayButton';
import { ClayInput } from '../common/ClayInput';
import { PhoneInput } from '../common/PhoneInput';
import { TutorApplication, TutorRequest } from '../../types';
import { SCHOOL_SUBJECTS, INDIVIDUAL_CLASSES } from '../../config/options';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { api } from '../../lib/api';

interface TutorRequestModalProps {
  tutor: TutorApplication | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  existingRequests?: TutorRequest[];
}

export const TutorRequestModal: React.FC<TutorRequestModalProps> = ({
  tutor,
  isOpen,
  onClose,
  onSuccess,
  existingRequests,
}) => {
  const { createTutorRequest, studentProfile, getStudentRequests } = useAuth();
  const { pushBackHandler } = useNavigation();

  const [subject, setSubject] = useState(tutor?.subjects[0] || 'mathematics');
  const [classLevel, setClassLevel] = useState(studentProfile?.class_level || 'Class 8');
  const [learningNeeds, setLearningNeeds] = useState(studentProfile?.learning_goals || '');
  const [preferredSchedule, setPreferredSchedule] = useState('Evening (5:00 PM – 8:00 PM)');
  const [guardianPhone, setGuardianPhone] = useState(
    studentProfile?.guardian_phone?.replace('+91', '').trim() || ''
  );

  const [batches, setBatches] = useState<any[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState<string>('');
  const [isLoadingBatches, setIsLoadingBatches] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [hasExistingRequest, setHasExistingRequest] = useState<boolean>(false);

  // Register hardware/global back handler when modal is open
  useEffect(() => {
    if (!isOpen) return;
    const unregister = pushBackHandler(() => {
      onClose();
      return true;
    });
    return unregister;
  }, [isOpen, pushBackHandler, onClose]);

  // Check if student already requested this tutor
  useEffect(() => {
    if (!isOpen || !tutor) return;
    let isMounted = true;

    const checkRequests = (reqs: TutorRequest[]) => {
      if (!isMounted) return;
      const active = (reqs || []).find(
        (r) => r.tutor_id === tutor.tutor_id && (r.status === 'pending' || r.status === 'accepted')
      );
      if (active) {
        setHasExistingRequest(true);
        if (active.status === 'pending') {
          setError('You have already requested this tutor. Please wait for the response.');
        } else {
          setError('You have already been accepted by this tutor.');
        }
      } else {
        setHasExistingRequest(false);
      }
    };

    if (existingRequests && existingRequests.length > 0) {
      checkRequests(existingRequests);
    } else {
      getStudentRequests()
        .then((reqs) => checkRequests(reqs))
        .catch(() => {});
    }

    return () => {
      isMounted = false;
    };
  }, [isOpen, tutor, existingRequests, getStudentRequests]);

  // Load batches for this tutor
  useEffect(() => {
    if (!isOpen || !tutor) return;
    let isMounted = true;
    setIsLoadingBatches(true);

    api.getPublicTutorBatches(tutor.tutor_id)
      .then((res) => {
        if (isMounted) {
          const list = res.batches || [];
          setBatches(list);
          // Pre-select first batch with available seats if any
          const available = list.find((b: any) => (b.current_enrolled || 0) < (b.max_students || 4));
          if (available) {
            setSelectedBatchId(available.id);
          }
        }
      })
      .catch((err) => {
        console.warn('Could not load tutor batches:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingBatches(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, tutor]);

  if (!isOpen || !tutor) return null;

  const tutorName = tutor.tutor_profile?.name || 'Verified Educator';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent rapid duplicate taps

    if (hasExistingRequest) {
      setError('You have already requested this tutor. Please wait for the response.');
      return;
    }

    setError(null);

    // Rule: Allow short topic/learning needs (min 2 chars)
    if (!learningNeeds.trim() || learningNeeds.trim().length < 2) {
      setError('Please specify what you would like to learn (at least 2 characters).');
      return;
    }

    if (guardianPhone && (guardianPhone.length !== 10 || !/^[6-9]\d{9}$/.test(guardianPhone))) {
      setError('Guardian phone must be a valid 10-digit Indian mobile number.');
      return;
    }

    const selectedBatch = batches.find((b) => b.id === selectedBatchId);
    if (selectedBatch && (selectedBatch.current_enrolled || 0) >= (selectedBatch.max_students || 4)) {
      setError('This batch is full. Please choose another available batch.');
      return;
    }

    setIsSubmitting(true);

    try {
      const { request, error: reqErr } = await createTutorRequest({
        tutorId: tutor.tutor_id,
        batchId: selectedBatch?.id,
        batchName: selectedBatch?.batch_name,
        batchTime: selectedBatch
          ? `${selectedBatch.start_time} – ${selectedBatch.end_time} (${selectedBatch.days_of_week || 'Mon-Fri'})`
          : undefined,
        subject,
        classLevel,
        learningNeeds: learningNeeds.trim(),
        preferredSchedule: selectedBatch
          ? `${selectedBatch.batch_name}: ${selectedBatch.start_time} – ${selectedBatch.end_time}`
          : preferredSchedule.trim() || undefined,
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
              Submit your inquiry directly to this verified educator.
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
                <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2 shadow-sm animate-shake">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
                  <span className="font-medium">{error}</span>
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

              {/* 3-Hour Fixed Batch Selection (Max 4 students) */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#1C1938] flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[#4136CA]" />
                    Select Batch (3-Hour Fixed Session)
                  </span>
                  <span className="text-[11px] font-medium text-slate-500">Max 4 students</span>
                </label>

                {isLoadingBatches ? (
                  <div className="p-3 text-xs text-slate-500 bg-[#F4F1FA] rounded-xl text-center">
                    Loading tutor&apos;s available batches...
                  </div>
                ) : batches.length > 0 ? (
                  <div className="space-y-2">
                    {batches.map((b) => {
                      const enrolled = b.current_enrolled || 0;
                      const max = b.max_students || 4;
                      const isFull = enrolled >= max;
                      const isSelected = selectedBatchId === b.id;

                      return (
                        <div
                          key={b.id}
                          onClick={() => {
                            if (!isFull) setSelectedBatchId(b.id);
                          }}
                          className={`p-3 rounded-2xl border transition-all text-left flex items-center justify-between cursor-pointer ${
                            isFull
                              ? 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'
                              : isSelected
                              ? 'bg-[#EFEAFF] border-[#4136CA] shadow-sm'
                              : 'bg-white border-[#DFD8F3] hover:border-[#4136CA]/50'
                          }`}
                        >
                          <div className="space-y-0.5">
                            <div className="font-bold text-xs text-[#1C1938] flex items-center gap-2">
                              <span>{b.batch_name}</span>
                              {isSelected && !isFull && (
                                <span className="text-[10px] bg-[#4136CA] text-white px-1.5 py-0.5 rounded-full font-bold">
                                  Selected
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-600 flex items-center gap-2">
                              <span>{b.start_time} – {b.end_time} (3 hrs)</span>
                              <span>•</span>
                              <span>{b.days_of_week || 'Regular'}</span>
                            </div>
                          </div>

                          <div className="text-right">
                            {isFull ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                                Batch Full (4/4)
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EBF3E8] text-[#3B522F]">
                                {max - enrolled} seat{max - enrolled === 1 ? '' : 's'} left ({enrolled}/{max})
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    <div
                      onClick={() => setSelectedBatchId('')}
                      className={`p-2.5 rounded-xl border text-xs cursor-pointer text-center transition-all ${
                        selectedBatchId === ''
                          ? 'bg-[#EFEAFF] border-[#4136CA] font-bold text-[#4136CA]'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Other / Flexible Schedule (Discuss with Tutor)
                    </div>
                  </div>
                ) : (
                  <div className="p-3 text-xs text-slate-500 bg-[#F4F1FA] rounded-2xl border border-[#DFD8F3]">
                    No fixed batches listed yet. Enter your preferred timing below.
                  </div>
                )}
              </div>

              {/* If no batch selected, show preferred schedule input */}
              {selectedBatchId === '' && (
                <ClayInput
                  label="Preferred Days & Time"
                  placeholder="e.g. Mon, Wed, Fri (5:00 PM – 8:00 PM)"
                  value={preferredSchedule}
                  onChange={(e) => setPreferredSchedule(e.target.value)}
                  icon={<Clock className="w-4 h-4 text-[#4136CA]" />}
                  hint="Tutor will review and confirm their 3-hour availability."
                />
              )}

              {/* Learning Needs */}
              <div className="space-y-1">
                <label htmlFor="tutor-req-learning-needs" className="text-sm font-semibold text-[#1C1938] flex justify-between">
                  <span>Learning Needs / Topics <span className="text-red-500">*</span></span>
                  <span className="text-xs text-slate-400 font-normal">{learningNeeds.length}/300</span>
                </label>
                <textarea
                  id="tutor-req-learning-needs"
                  required
                  rows={2}
                  maxLength={300}
                  placeholder="e.g. Maths algebra, science formulas, or English doubts"
                  value={learningNeeds}
                  onChange={(e) => setLearningNeeds(e.target.value)}
                  className="clay-input text-xs"
                />
                <p className="text-[11px] text-slate-500">
                  Short topics or doubts are welcome (minimum 2 characters).
                </p>
              </div>

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
                  disabled={isSubmitting || hasExistingRequest}
                  icon={<Send className="w-4 h-4" />}
                >
                  {hasExistingRequest ? 'Already Requested' : 'Submit Request'}
                </ClayButton>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};