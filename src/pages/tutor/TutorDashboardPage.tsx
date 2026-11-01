import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RefreshCw,
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  PartyPopper,
} from 'lucide-react';
import { Header } from '../../components/common/Header';
import { ClayCard } from '../../components/common/ClayCard';
import { ClayButton } from '../../components/common/ClayButton';
import { ClayBackground } from '../../components/common/ClayBackground';
import { ClayUploadButton } from '../../components/common/ClayUploadButton';
import { ClayEmptyState } from '../../components/common/ClayEmptyState';
import { ClayInput } from '../../components/common/ClayInput';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { api } from '../../lib/api';
import { TutorApplication, TutorRequest } from '../../types';
import { SCHOOL_SUBJECTS } from '../../config/options';

// 3-hour calculation helper
const calculateEndTime = (start: string): string => {
  const [hStr, mStr] = start.split(':');
  const h = parseInt(hStr, 10) || 0;
  const m = parseInt(mStr, 10) || 0;
  const endH = (h + 3) % 24;
  return `${endH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

const formatTimeLabel = (timeStr: string): string => {
  if (!timeStr) return '';
  const [hStr, mStr] = timeStr.split(':');
  let h = parseInt(hStr, 10) || 0;
  const m = mStr || '00';
  const period = h >= 12 ? 'PM' : 'AM';
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  return `${h}:${m} ${period}`;
};

export const TutorDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, getTutorRequests, updateTutorRequestStatus, uploadPhoto, removePhoto } = useAuth();
  const { pushBackHandler } = useNavigation();

  const [application, setApplication] = useState<TutorApplication | null>(null);
  const [requests, setRequests] = useState<TutorRequest[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Celebratory banner acknowledgement
  const [isAcknowledging, setIsAcknowledging] = useState(false);

  // Batch modal state
  const [isCreateBatchOpen, setIsCreateBatchOpen] = useState(false);
  const [batchName, setBatchName] = useState('');
  const [batchStart, setBatchStart] = useState('17:00'); // 5:00 PM
  const [batchDays, setBatchDays] = useState<string[]>(['Mon', 'Wed', 'Fri']);
  const [batchError, setBatchError] = useState<string | null>(null);
  const [isCreatingBatch, setIsCreatingBatch] = useState(false);

  // Response modal state
  const [activeRequest, setActiveRequest] = useState<TutorRequest | null>(null);
  const [responseAction, setResponseAction] = useState<'accepted' | 'declined'>('accepted');
  const [responseNote, setResponseNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Navigation back interceptor for modals
  useEffect(() => {
    if (activeRequest) {
      return pushBackHandler(() => {
        setActiveRequest(null);
        return true;
      });
    }
    if (isCreateBatchOpen) {
      return pushBackHandler(() => {
        setIsCreateBatchOpen(false);
        return true;
      });
    }
  }, [activeRequest, isCreateBatchOpen, pushBackHandler]);

  const loadData = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      const res = await api.getTutorMyStatus();
      if (!res.application) {
        navigate('/tutor/register', { replace: true });
        return;
      }

      if (res.application.status !== 'approved') {
        navigate('/tutor/status', { replace: true });
        return;
      }

      setApplication(res.application);

      // Concurrently load inquiries and batches
      const [fetchedRequests, batchRes] = await Promise.all([
        getTutorRequests(),
        api.getTutorBatches().catch(() => ({ batches: [] })),
      ]);

      setRequests(fetchedRequests);
      setBatches(batchRes.batches || []);
    } catch (err) {
      console.error('Failed to load tutor dashboard data from MySQL:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
  };

  const handleAcknowledgeApproval = async () => {
    setIsAcknowledging(true);
    try {
      await api.acknowledgeTutorApproval();
      setApplication((prev) => (prev ? { ...prev, approval_acknowledged: 1 } : null));
    } catch (err) {
      console.error('Failed to acknowledge approval:', err);
    } finally {
      setIsAcknowledging(false);
    }
  };

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setBatchError(null);

    if (!batchName.trim()) {
      setBatchError('Please provide a descriptive name for this batch (e.g. Evening Mathematics).');
      return;
    }

    if (batchDays.length === 0) {
      setBatchError('Please select at least one teaching day for this batch.');
      return;
    }

    const calculatedEnd = calculateEndTime(batchStart);
    setIsCreatingBatch(true);

    try {
      const res = await api.createTutorBatch({
        name: batchName.trim(),
        start_time: batchStart,
        end_time: calculatedEnd,
        days: batchDays,
      });

      if (res.success) {
        setBatchName('');
        setIsCreateBatchOpen(false);
        const batchRes = await api.getTutorBatches();
        setBatches(batchRes.batches || []);
      }
    } catch (err: any) {
      setBatchError(err?.message || 'Failed to create 3-hour batch. Check for overlapping timings.');
    } finally {
      setIsCreatingBatch(false);
    }
  };

  const handleDeleteBatch = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete batch "${name}"? Only empty batches can be deleted.`)) {
      return;
    }

    try {
      await api.deleteTutorBatch(id);
      setBatches((prev) => prev.filter((b) => b.id !== id));
    } catch (err: any) {
      alert(err?.message || 'Failed to delete batch.');
    }
  };

  const handleOpenResponse = (req: TutorRequest, action: 'accepted' | 'declined') => {
    setActiveRequest(req);
    setResponseAction(action);
    setResponseNote(
      action === 'accepted'
        ? 'Namaskara! I am pleased to accept your request. We will coordinate session timing via mobile.'
        : 'Thank you for your interest. Unfortunately, my current schedule cannot accommodate additional hours.'
    );
  };

  const handleSubmitResponse = async () => {
    if (!activeRequest) return;
    setIsUpdating(true);

    try {
      const { error } = await updateTutorRequestStatus(
        activeRequest.id,
        responseAction,
        responseNote.trim() || undefined
      );

      if (!error) {
        setRequests((prev) =>
          prev.map((r) =>
            r.id === activeRequest.id
              ? { ...r, status: responseAction, response_message: responseNote.trim() }
              : r
          )
        );
        setActiveRequest(null);
        // Refresh batches to show updated enrollment counts
        const batchRes = await api.getTutorBatches().catch(() => ({ batches: [] }));
        setBatches(batchRes.batches || []);
      }
    } catch (err) {
      console.error('Failed to submit response:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const calculatedEnd = calculateEndTime(batchStart);

  return (
    <ClayBackground>
      <Header
        title="Tutor Dashboard"
        subtitle="Manage Teaching Profile, 3-Hour Batches & Inquiries"
        customRight={
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="w-10 h-10 rounded-2xl bg-white border border-[#DFD8F3] shadow-xs flex items-center justify-center text-[#1C1938] hover:text-[#4136CA] hover:bg-[#EEECFB] active:scale-95 transition-all cursor-pointer"
            aria-label="Refresh dashboard"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#7C3AED]' : ''}`} />
          </button>
        }
      />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 pb-28 space-y-6">
        {/* ONE-TIME CELEBRATORY APPROVAL BANNER */}
        {application && application.status === 'approved' && !application.approval_acknowledged && (
          <div className="p-6 rounded-[32px] bg-gradient-to-r from-[#EDE9FE] via-[#F4F1FA] to-[#E0E7FF] border border-[#DDD6FE] shadow-clay flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in text-left">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#7C3AED] text-white flex items-center justify-center shadow-lg flex-shrink-0">
                <PartyPopper className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-black text-[#1C1938] flex items-center gap-2">
                  <span>Congratulations, {profile?.name || 'Educator'}!</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#10B981] text-white font-bold">
                    Official Approval
                  </span>
                </h3>
                <p className="text-xs text-[#5B21B6] leading-relaxed max-w-lg">
                  Your teaching application has been reviewed and approved by the Shikshan Administrator.
                  Your verified profile is now actively visible to students and parents across Karnataka!
                </p>
              </div>
            </div>
            <ClayButton
              size="sm"
              variant="primary"
              isLoading={isAcknowledging}
              onClick={handleAcknowledgeApproval}
              icon={<CheckCircle2 className="w-4 h-4" />}
            >
              Acknowledge & Continue
            </ClayButton>
          </div>
        )}

        {/* Tutor Profile Header Card with Real Photo Upload */}
        {application && (
          <ClayCard className="p-6 text-left border border-[#DFD8F3] shadow-clay bg-white space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <ClayUploadButton
                currentPhotoUrl={user?.photo_url || application.photo_url || application.tutor_profile?.photo_url}
                onPhotoSelected={async (data) => {
                  await uploadPhoto(data);
                }}
                onPhotoRemoved={async () => {
                  await removePhoto();
                }}
                label={profile?.name || application.tutor_profile?.name || 'Verified Tutor'}
                subLabel={`${application.course_qualification} • ${application.institution_name}`}
              />

              <div className="p-3.5 rounded-2xl bg-[#EDE9FE] border border-[#DDD6FE] text-left shadow-xs">
                <span className="text-[10px] font-bold uppercase text-[#6D28D9] block">Approved Monthly Fee</span>
                <span className="text-base font-black text-[#1C1938]">
                  ₹{application.fee_amount || (application as any).approved_fee || 1500} / month
                </span>
                <span className="text-[10px] text-[#686487] block mt-0.5">
                  Controlled by Admin (₹3,000 max cap)
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-[#F3EFFB] flex flex-wrap gap-2 text-xs">
              <span className="text-[#686487] font-semibold">Subjects:</span>
              {(application.subjects || []).map((s) => (
                <span key={s} className="px-2.5 py-0.5 rounded-lg bg-[#FAF9FE] border border-[#E5DFF8] text-[#7C3AED] font-bold">
                  {s}
                </span>
              ))}
            </div>
          </ClayCard>
        )}

        {/* SECTION 2: 3-HOUR FIXED BATCHES (MAX 4 STUDENTS) */}
        <div className="space-y-4 text-left">
          <div className="flex items-center justify-between px-1">
            <div>
              <h3 className="text-lg font-black text-[#1C1938] flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#4136CA]" />
                3-Hour Fixed Batches ({batches.length})
              </h3>
              <p className="text-xs text-[#686487]">
                Every batch runs exactly 3 hours with a strict limit of 4 students per batch.
              </p>
            </div>
            <ClayButton
              size="sm"
              variant="primary"
              onClick={() => setIsCreateBatchOpen(true)}
              icon={<Plus className="w-4 h-4" />}
            >
              New Batch
            </ClayButton>
          </div>

          {batches.length === 0 ? (
            <div className="p-6 rounded-[28px] bg-white border border-[#DFD8F3] text-center space-y-2">
              <Clock className="w-8 h-8 text-[#7C3AED] mx-auto opacity-70" />
              <h4 className="font-extrabold text-sm text-[#1C1938]">No Batches Created Yet</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Create structured 3-hour fixed batches so students can enroll directly with real-time seat availability.
              </p>
              <div className="pt-1">
                <ClayButton size="sm" variant="secondary" onClick={() => setIsCreateBatchOpen(true)}>
                  Create Your First Batch
                </ClayButton>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {batches.map((batch) => {
                const enrolled = batch.current_enrolled || 0;
                const max = batch.max_students || 4;
                const isFull = enrolled >= max;

                return (
                  <div
                    key={batch.id}
                    className="p-4 rounded-[24px] bg-white border border-[#DFD8F3] shadow-clay-sm flex flex-col justify-between gap-3 text-left"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-extrabold text-sm text-[#1C1938] truncate">{batch.batch_name}</h4>
                        <button
                          type="button"
                          onClick={() => handleDeleteBatch(batch.id, batch.batch_name)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete Batch"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="mt-1 flex items-center gap-2 text-xs text-[#686487]">
                        <span className="font-semibold text-[#4136CA]">
                          {formatTimeLabel(batch.start_time)} – {formatTimeLabel(batch.end_time)}
                        </span>
                        <span>•</span>
                        <span>{batch.days_of_week || 'Regular'}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#F3EFFB] flex items-center justify-between">
                      <span className="text-[11px] text-slate-500 font-medium">Batch Capacity:</span>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          isFull
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {enrolled} / {max} Students {isFull ? '(Full)' : `(${max - enrolled} open)`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* SECTION 3: STUDENT INQUIRIES DESK */}
        <div className="space-y-4 text-left">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-lg font-black text-[#1C1938]">
              Student Inquiries ({requests.length})
            </h3>
            <span className="text-xs text-[#686487]">Review student requests & allocate batch seats</span>
          </div>

          {isLoading ? (
            <div className="p-8 text-center text-xs text-[#686487]">Loading inquiries...</div>
          ) : requests.length === 0 ? (
            <ClayEmptyState
              title="No Student Inquiries Yet"
              subtitle="Your verified profile is active in the student marketplace. When students request academic guidance, their inquiries will appear here."
              onRefresh={handleRefresh}
            />
          ) : (
            <div className="space-y-4">
              {requests.map((req) => {
                const subjectName = SCHOOL_SUBJECTS.find((s) => s.id === req.subject)?.label || req.subject;
                const studentName = req.student_name || req.student_profile?.name || 'School Student';

                return (
                  <ClayCard key={req.id} className="p-5 border border-[#DFD8F3] bg-white space-y-3 shadow-clay-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-base text-[#1C1938]">{studentName}</h4>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                              req.status === 'accepted'
                                ? 'bg-emerald-100 text-emerald-800'
                                : req.status === 'declined'
                                ? 'bg-rose-100 text-rose-800'
                                : req.status === 'cancelled'
                                ? 'bg-slate-100 text-slate-600'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {req.status}
                          </span>
                        </div>
                        <p className="text-xs text-[#686487] mt-0.5">
                          Subject: <strong className="text-[#312E81]">{subjectName}</strong> • {req.class_level}
                          {(req as any).batch_name && (
                            <span className="ml-2 font-bold text-[#4136CA]">
                              • Batch: {(req as any).batch_name}
                            </span>
                          )}
                        </p>
                      </div>

                      <span className="text-[10px] text-[#A29EBE]">
                        {new Date(req.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#F8F7FD] border border-[#DFD8F3] text-xs space-y-1.5">
                      <p className="text-[#1C1938]">
                        <strong>Student Learning Need:</strong> {req.learning_needs}
                      </p>
                      {req.preferred_schedule && (
                        <p className="text-[#686487]">
                          <strong>Requested Schedule:</strong> {req.preferred_schedule}
                        </p>
                      )}
                      {req.response_message && (
                        <p className="text-[#4136CA] pt-1 border-t border-[#DFD8F3]">
                          <strong>Your Response:</strong> {req.response_message}
                        </p>
                      )}
                    </div>

                    {req.status === 'pending' && (
                      <div className="flex items-center justify-end gap-2 pt-2">
                        <ClayButton
                          size="sm"
                          variant="secondary"
                          onClick={() => handleOpenResponse(req, 'declined')}
                          className="rounded-full px-4 py-1.5 text-xs font-bold text-rose-600 border-rose-200 hover:bg-rose-50"
                        >
                          Decline
                        </ClayButton>
                        <ClayButton
                          size="sm"
                          variant="primary"
                          onClick={() => handleOpenResponse(req, 'accepted')}
                          className="rounded-full px-5 py-1.5 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white"
                        >
                          Accept Request
                        </ClayButton>
                      </div>
                    )}
                  </ClayCard>
                );
              })}
            </div>
          )}
        </div>

        {/* MODAL 1: CREATE 3-HOUR FIXED BATCH */}
        {isCreateBatchOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
            <ClayCard className="max-w-md w-full p-6 text-left space-y-4 bg-white border border-[#DFD8F3] shadow-2xl animate-scaleIn">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-black text-lg text-[#1C1938]">Create 3-Hour Fixed Batch</h3>
                  <p className="text-xs text-[#686487]">Every batch is fixed at 3 hours with max 4 students.</p>
                </div>
                <button
                  onClick={() => setIsCreateBatchOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {batchError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{batchError}</span>
                </div>
              )}

              <form onSubmit={handleCreateBatch} className="space-y-4">
                <ClayInput
                  label="Batch Name"
                  placeholder="e.g. Evening Mathematics Batch"
                  value={batchName}
                  onChange={(e) => setBatchName(e.target.value)}
                  required
                />

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#1C1938]">Start Time</label>
                  <input
                    type="time"
                    value={batchStart}
                    onChange={(e) => setBatchStart(e.target.value)}
                    className="clay-input w-full text-xs"
                    required
                  />
                  <div className="p-2.5 rounded-xl bg-[#EDE9FE] border border-[#DDD6FE] text-xs text-[#5B21B6] mt-1 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#7C3AED] flex-shrink-0" />
                    <span>
                      Duration: <strong>{formatTimeLabel(batchStart)}</strong> to{' '}
                      <strong>{formatTimeLabel(calculatedEnd)}</strong> (Exactly 3 Hours)
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#1C1938]">Days of Week</label>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => {
                      const selected = batchDays.includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => {
                            if (selected) {
                              setBatchDays(batchDays.filter((d) => d !== day));
                            } else {
                              setBatchDays([...batchDays, day]);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            selected
                              ? 'bg-[#7C3AED] text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                  <span>Student Limit:</span>
                  <span className="font-bold text-[#1C1938]">Strictly 4 Students Max</span>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-[#DFD8F3]">
                  <ClayButton
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsCreateBatchOpen(false)}
                  >
                    Cancel
                  </ClayButton>
                  <ClayButton
                    type="submit"
                    variant="primary"
                    size="sm"
                    isLoading={isCreatingBatch}
                  >
                    Save Batch
                  </ClayButton>
                </div>
              </form>
            </ClayCard>
          </div>
        )}

        {/* MODAL 2: INQUIRY RESPONSE MODAL */}
        {activeRequest && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
            <ClayCard className="max-w-md w-full p-6 text-left space-y-4 bg-white border border-[#DFD8F3] shadow-2xl animate-scaleIn">
              <h3 className="font-black text-lg text-[#1C1938]">
                {responseAction === 'accepted' ? 'Accept Student Inquiry' : 'Decline Student Inquiry'}
              </h3>
              <p className="text-xs text-[#686487]">
                Send an official message to the student regarding your availability.
              </p>

              <div>
                <label className="block text-xs font-bold text-[#1C1938] mb-1">Response Note</label>
                <textarea
                  rows={3}
                  value={responseNote}
                  onChange={(e) => setResponseNote(e.target.value)}
                  className="w-full p-3 rounded-xl border border-[#DFD8F3] text-xs text-[#1C1938] focus:outline-none focus:ring-2 focus:ring-[#312E81]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <ClayButton
                  variant="secondary"
                  size="sm"
                  onClick={() => setActiveRequest(null)}
                  className="rounded-full px-4 py-2 text-xs font-bold"
                >
                  Cancel
                </ClayButton>
                <ClayButton
                  variant="primary"
                  size="sm"
                  isLoading={isUpdating}
                  onClick={handleSubmitResponse}
                  className={`rounded-full px-5 py-2 text-xs font-bold text-white ${
                    responseAction === 'accepted' ? 'bg-emerald-700 hover:bg-emerald-800' : 'bg-rose-700 hover:bg-rose-800'
                  }`}
                >
                  Send Response
                </ClayButton>
              </div>
            </ClayCard>
          </div>
        )}
      </main>
    </ClayBackground>
  );
};
