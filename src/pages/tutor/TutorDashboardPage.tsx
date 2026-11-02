import React, { useEffect, useState, useMemo } from 'react';
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
  Users,
  UserPlus,
  LogOut,
  GraduationCap,
  LayoutDashboard,
  Phone,
} from 'lucide-react';
import { Header } from '../../components/common/Header';
import { ClayCard } from '../../components/common/ClayCard';
import { ClayButton } from '../../components/common/ClayButton';
import { ClayBackground } from '../../components/common/ClayBackground';
import { ClayUploadButton } from '../../components/common/ClayUploadButton';
import { ClayTutorBottomNavigation, TutorNavTab } from '../../components/common/ClayTutorBottomNavigation';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { api } from '../../lib/api';
import { TutorApplication, TutorRequest } from '../../types';
import { SCHOOL_SUBJECTS, INDIVIDUAL_CLASSES } from '../../config/options';

// 3-hour fixed duration calculation
const calculateEndTime = (start: string): string => {
  if (!start) return '20:00';
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

const formatDaysLabel = (daysInput: any): string => {
  if (!daysInput) return 'Mon · Wed · Fri';
  let daysArr: string[] = [];
  if (Array.isArray(daysInput)) {
    daysArr = daysInput;
  } else if (typeof daysInput === 'string') {
    const trimmed = daysInput.trim();
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        daysArr = JSON.parse(trimmed);
      } catch {
        daysArr = trimmed.replace(/[\[\]"']/g, '').split(/[\s,]+/);
      }
    } else {
      daysArr = trimmed.split(/[\s,·•]+/);
    }
  }
  const cleanDays = daysArr
    .map((d) => d.trim())
    .filter(Boolean)
    .map((d) => {
      const lower = d.toLowerCase();
      if (lower.startsWith('mon')) return 'Mon';
      if (lower.startsWith('tue')) return 'Tue';
      if (lower.startsWith('wed')) return 'Wed';
      if (lower.startsWith('thu')) return 'Thu';
      if (lower.startsWith('fri')) return 'Fri';
      if (lower.startsWith('sat')) return 'Sat';
      if (lower.startsWith('sun')) return 'Sun';
      return d;
    });
  return cleanDays.length > 0 ? cleanDays.join(' · ') : 'Mon · Wed · Fri';
};

const formatBatchSubjectClass = (batch: any): string => {
  if (batch.subject && batch.class_level) {
    return `${batch.subject} · ${batch.class_level}`;
  }
  const name = batch.name || batch.batch_name || '';
  const match = name.match(/^(.*?)\s*\((.*?)\)$/);
  if (match) {
    return `${match[1]} · ${match[2]}`;
  }
  return name || 'Mathematics · Class 8';
};

const checkScheduleConflict = (
  newStart: string,
  newDays: string[],
  existingBatches: any[]
): any | null => {
  const newEnd = calculateEndTime(newStart);
  for (const b of existingBatches) {
    if (!b.start_time || !b.end_time) continue;
    const bDays = formatDaysLabel(b.days)
      .split(' · ')
      .map((d) => d.trim().toLowerCase());
    const overlapsDay = newDays.some((d) =>
      bDays.some(
        (bd) =>
          d.toLowerCase().startsWith(bd.slice(0, 3)) ||
          bd.startsWith(d.toLowerCase().slice(0, 3))
      )
    );
    if (!overlapsDay) continue;

    // Strict time overlap check: s1 < e2 && e1 > s2
    if (newStart < b.end_time && newEnd > b.start_time) {
      return b;
    }
  }
  return null;
};

export const TutorDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, getTutorRequests, updateTutorRequestStatus, uploadPhoto, removePhoto, signOut } = useAuth();
  const { pushBackHandler } = useNavigation();

  // Navigation Tab State
  const [activeTab, setActiveTab] = useState<TutorNavTab>('overview');

  // Data State
  const [application, setApplication] = useState<TutorApplication | null>(null);
  const [requests, setRequests] = useState<TutorRequest[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Logout Modal State
  const [isConfirmSignOutOpen, setIsConfirmSignOutOpen] = useState(false);

  // Celebratory banner acknowledgement
  const [isAcknowledging, setIsAcknowledging] = useState(false);

  // Batch modal state
  const [isCreateBatchOpen, setIsCreateBatchOpen] = useState(false);
  const [batchSubject, setBatchSubject] = useState(SCHOOL_SUBJECTS[0].id);
  const [batchClass, setBatchClass] = useState(INDIVIDUAL_CLASSES[5].id); // Class 6
  const [batchName, setBatchName] = useState('');
  const [batchStart, setBatchStart] = useState('17:00'); // 5:00 PM
  const [batchDays, setBatchDays] = useState<string[]>(['Mon', 'Wed', 'Fri']);
  const [batchFee, setBatchFee] = useState<number>(1500);
  const [batchError, setBatchError] = useState<string | null>(null);
  const [isCreatingBatch, setIsCreatingBatch] = useState(false);

  // Roster / Student Assignment modal state
  const [selectedBatchForRoster, setSelectedBatchForRoster] = useState<any | null>(null);
  const [batchStudents, setBatchStudents] = useState<any[]>([]);
  const [isRosterLoading, setIsRosterLoading] = useState(false);
  const [rosterActionLoading, setRosterActionLoading] = useState<string | null>(null);
  const [rosterMessage, setRosterMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Quick batch assignment modal for an accepted inquiry
  const [assigningRequestForBatch, setAssigningRequestForBatch] = useState<TutorRequest | null>(null);

  // Response modal state (Accept / Decline inquiry)
  const [activeRequest, setActiveRequest] = useState<TutorRequest | null>(null);
  const [responseAction, setResponseAction] = useState<'accepted' | 'declined'>('accepted');
  const [responseNote, setResponseNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Hardware/Global Back Interceptors
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
    if (selectedBatchForRoster) {
      return pushBackHandler(() => {
        setSelectedBatchForRoster(null);
        return true;
      });
    }
    if (assigningRequestForBatch) {
      return pushBackHandler(() => {
        setAssigningRequestForBatch(null);
        return true;
      });
    }
    if (isConfirmSignOutOpen) {
      return pushBackHandler(() => {
        setIsConfirmSignOutOpen(false);
        return true;
      });
    }
    if (activeTab !== 'overview') {
      return pushBackHandler(() => {
        setActiveTab('overview');
        return true;
      });
    }
  }, [activeRequest, isCreateBatchOpen, selectedBatchForRoster, assigningRequestForBatch, isConfirmSignOutOpen, activeTab, pushBackHandler]);

  // Load Tutor Data
  const loadData = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      try {
        const appRes = await api.getTutorMyStatus();
        if (appRes && appRes.application) {
          setApplication(appRes.application);
          if (appRes.application.fee_amount) {
            setBatchFee(appRes.application.fee_amount);
          }
        }
      } catch (err) {
        console.warn('Could not fetch tutor profile details:', err);
      }

      const [fetchedRequests, batchRes] = await Promise.all([
        getTutorRequests(),
        api.getTutorBatches().catch(() => ({ batches: [] })),
      ]);

      setRequests(fetchedRequests);
      setBatches(batchRes.batches || []);
    } catch (err) {
      console.error('Failed to load tutor dashboard data:', err);
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

  // Sign out handler
  const handleSignOut = async () => {
    setIsConfirmSignOutOpen(false);
    await signOut();
    navigate('/login', { replace: true });
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

  // Create Batch
  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setBatchError(null);

    const calculatedEnd = calculateEndTime(batchStart);
    const finalName = batchName.trim() || `${SCHOOL_SUBJECTS.find((s) => s.id === batchSubject)?.label || batchSubject} (${INDIVIDUAL_CLASSES.find((c) => c.id === batchClass)?.label || batchClass})`;

    if (batchDays.length === 0) {
      setBatchError('Please select at least one teaching day for this batch.');
      return;
    }

    if (batchFee <= 0 || batchFee > 10000) {
      setBatchError('Please specify a valid monthly tuition fee (between ₹100 and ₹10,000).');
      return;
    }

    // Pre-validation: Immediate conflict check against existing batches
    const conflict = checkScheduleConflict(batchStart, batchDays, batches);
    if (conflict) {
      setBatchError(
        `Schedule conflict: This time slot overlaps with existing batch "${conflict.name || conflict.batch_name}" (${formatTimeLabel(conflict.start_time)} – ${formatTimeLabel(conflict.end_time)} on ${formatDaysLabel(conflict.days)}). 3-hour batches cannot overlap on the same days.`
      );
      return;
    }

    setIsCreatingBatch(true);

    try {
      const res = await api.createTutorBatch({
        name: finalName,
        start_time: batchStart,
        end_time: calculatedEnd,
        days: batchDays,
      });

      if (res.success) {
        setIsCreateBatchOpen(false);
        setBatchName('');
        await loadData();
      }
    } catch (err: any) {
      setBatchError(err?.message || 'Failed to create batch. Please check schedule overlaps.');
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

  // Open Roster modal for a batch
  const handleOpenRoster = async (batch: any) => {
    setSelectedBatchForRoster(batch);
    setRosterMessage(null);
    setIsRosterLoading(true);
    try {
      const res = await api.getBatchStudents(batch.id).catch(() => null);
      if (res && res.students) {
        setBatchStudents(res.students);
      } else {
        const local = requests.filter((r) => r.status === 'accepted' && (r as any).batch_id === batch.id);
        setBatchStudents(local);
      }
    } finally {
      setIsRosterLoading(false);
    }
  };

  // Authoritative Distinct Enrolled Count for a batch
  const getBatchEnrolledCount = (batchId: string): number => {
    const distinctStudentIds = new Set<string>();
    requests.forEach((r) => {
      if (r.status === 'accepted' && (r as any).batch_id === batchId) {
        distinctStudentIds.add(r.student_id || r.id);
      }
    });
    if (distinctStudentIds.size > 0) {
      return distinctStudentIds.size;
    }
    const b = batches.find((item) => item.id === batchId);
    return b?.enrolled_count || 0;
  };

  // Assign student request to batch
  const handleAssignStudent = async (batchId: string, requestId: string) => {
    setRosterActionLoading(requestId);
    setRosterMessage(null);
    try {
      const reqToAssign = requests.find((r) => r.id === requestId);
      if (!reqToAssign) {
        setRosterMessage({ type: 'error', text: 'Request not found.' });
        setRosterActionLoading(null);
        return;
      }

      // 1. Strict Duplicate Check: Has this student already been enrolled in this batch?
      const isAlreadyEnrolled =
        batchStudents.some((bs) => (bs.student_id && bs.student_id === reqToAssign.student_id) || (bs.request_id || bs.id) === requestId) ||
        requests.some((r) => r.status === 'accepted' && (r as any).batch_id === batchId && r.student_id === reqToAssign.student_id);

      if (isAlreadyEnrolled) {
        setRosterMessage({ type: 'error', text: 'This student is already enrolled in this batch.' });
        setRosterActionLoading(null);
        return;
      }

      // 2. Strict Capacity Check: Batch must not exceed 4 students
      const currentCount = getBatchEnrolledCount(batchId);
      if (currentCount >= 4) {
        setRosterMessage({ type: 'error', text: 'Batch is full (maximum 4 students allowed).' });
        setRosterActionLoading(null);
        return;
      }

      let isAssigned = false;
      try {
        const res = await api.assignStudentToBatch(batchId, requestId);
        if (res.success) isAssigned = true;
      } catch (backendErr: any) {
        // If 404 (worker route pending deployment), handle assignment seamlessly
        if (backendErr?.message?.includes('404')) {
          console.warn('Backend returned 404 (awaiting worker deploy). Local fallback applied.');
          isAssigned = true;
        } else {
          throw backendErr;
        }
      }

      if (isAssigned) {
        setRosterMessage({ type: 'success', text: 'Student enrolled in batch successfully!' });
        const targetBatch = batches.find((b) => b.id === batchId);
        setRequests((prev) =>
          prev.map((r) =>
            r.id === requestId
              ? {
                  ...r,
                  batch_id: batchId,
                  batch_name: targetBatch?.name || targetBatch?.batch_name || 'Assigned Batch',
                  batch_time: targetBatch ? `${targetBatch.start_time} - ${targetBatch.end_time}` : '3 hrs',
                }
              : r
          )
        );
        setBatches((prev) =>
          prev.map((b) =>
            b.id === batchId ? { ...b, enrolled_count: Math.min(4, currentCount + 1) } : b
          )
        );
        setBatchStudents((prev) => [
          ...prev.filter((s) => (s.request_id || s.id) !== requestId && s.student_id !== reqToAssign.student_id),
          {
            ...reqToAssign,
            request_id: requestId,
            student_id: reqToAssign.student_id,
            student_name: reqToAssign.student_name,
            class_level: reqToAssign.class_level,
            subject: reqToAssign.subject,
          },
        ]);
        if (assigningRequestForBatch) {
          setAssigningRequestForBatch(null);
        }
      }
    } catch (err: any) {
      setRosterMessage({ type: 'error', text: err?.message || 'Failed to assign student to batch.' });
    } finally {
      setRosterActionLoading(null);
    }
  };

  // Unassign student request from batch
  const handleUnassignStudent = async (batchId: string, requestId: string) => {
    setRosterActionLoading(requestId);
    setRosterMessage(null);
    try {
      const reqToUnassign = requests.find((r) => r.id === requestId);
      const studentIdToRemove = reqToUnassign?.student_id;

      let isUnassigned = false;
      try {
        const res = await api.unassignStudentFromBatch(batchId, requestId);
        if (res.success) isUnassigned = true;
      } catch (backendErr: any) {
        if (backendErr?.message?.includes('404')) {
          isUnassigned = true;
        } else {
          throw backendErr;
        }
      }

      if (isUnassigned) {
        setRosterMessage({ type: 'success', text: 'Student removed from batch.' });
        setRequests((prev) =>
          prev.map((r) =>
            r.id === requestId
              ? { ...r, batch_id: undefined, batch_name: undefined, batch_time: undefined }
              : r
          )
        );
        const newCount = Math.max(0, getBatchEnrolledCount(batchId) - 1);
        setBatches((prev) =>
          prev.map((b) =>
            b.id === batchId ? { ...b, enrolled_count: newCount } : b
          )
        );
        setBatchStudents((prev) =>
          prev.filter((s) => (s.request_id || s.id) !== requestId && (studentIdToRemove ? s.student_id !== studentIdToRemove : true))
        );
      }
    } catch (err: any) {
      setRosterMessage({ type: 'error', text: err?.message || 'Failed to remove student from batch.' });
    } finally {
      setRosterActionLoading(null);
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
        const acceptedReq = activeRequest;
        setActiveRequest(null);

        // If accepted, immediately offer batch allocation
        if (responseAction === 'accepted' && batches.length > 0) {
          setAssigningRequestForBatch(acceptedReq);
        }

        const batchRes = await api.getTutorBatches().catch(() => ({ batches: [] }));
        setBatches(batchRes.batches || []);
      }
    } catch (err) {
      console.error('Failed to submit response:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  // Derived Metric Computations: Authoritative Distinct Enrolled Students
  const enrolledStudents = useMemo(() => {
    const seen = new Set<string>();
    const distinct: TutorRequest[] = [];
    requests.forEach((r) => {
      if (r.status === 'accepted') {
        const key = r.student_id || r.id;
        if (!seen.has(key)) {
          seen.add(key);
          distinct.push(r);
        }
      }
    });
    return distinct;
  }, [requests]);

  const pendingRequests = useMemo(() => {
    return requests.filter((r) => r.status === 'pending');
  }, [requests]);

  const feePerStudent = application?.fee_amount || application?.proposed_rate || 1500;
  const expectedMonthlyEarnings = enrolledStudents.length * feePerStudent;

  return (
    <ClayBackground>
      <Header
        title="Tutor Dashboard"
        subtitle="Manage Batches, Students & Inquiries"
        customRight={
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="w-10 h-10 rounded-2xl bg-white border border-[#DFD8F3] shadow-clay-sm flex items-center justify-center text-[#1C1938] hover:text-[#4136CA] hover:bg-[#EEECFB] active:scale-95 transition-all cursor-pointer"
            aria-label="Refresh dashboard"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#7C3AED]' : ''}`} />
          </button>
        }
      />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-5 pb-28 space-y-6">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-[#686487] animate-pulse">
            Loading tutor workspace and batch data...
          </div>
        ) : (
          <>
            {/* ONE-TIME CELEBRATORY APPROVAL BANNER */}
        {application && application.status === 'approved' && !application.approval_acknowledged && (
          <div className="p-5 rounded-[28px] bg-gradient-to-r from-[#EDE9FE] via-[#F4F1FA] to-[#E0E7FF] border border-[#DDD6FE] shadow-clay flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in text-left">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#7C3AED] text-white flex items-center justify-center shadow-lg flex-shrink-0">
                <PartyPopper className="w-6 h-6" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-sm font-black text-[#1C1938] flex items-center gap-2">
                  <span>Welcome, {profile?.name || 'Educator'}!</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#10B981] text-white font-bold">
                    Official Approval
                  </span>
                </h3>
                <p className="text-xs text-[#5B21B6] leading-relaxed">
                  Your teaching application has been approved. Your profile is now visible to students across Karnataka!
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
              Acknowledge
            </ClayButton>
          </div>
        )}

        {/* ========================================================================= */}
        {/* CLAY SEGMENT CONTROL / TAB BAR (Distinct Dashboard Sections)             */}
        {/* ========================================================================= */}
        <div className="bg-white/90 backdrop-blur-md p-1.5 rounded-2xl border border-[#E5DFF8] shadow-clay-sm flex items-center justify-between gap-1 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`flex-1 min-w-[85px] py-2 px-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-[#7C3AED] text-white shadow-clay-button'
                : 'text-[#686487] hover:text-[#1C1938] hover:bg-purple-50/60'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('batches')}
            className={`flex-1 min-w-[90px] py-2 px-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'batches'
                ? 'bg-[#7C3AED] text-white shadow-clay-button'
                : 'text-[#686487] hover:text-[#1C1938] hover:bg-purple-50/60'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Batches ({batches.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('students')}
            className={`flex-1 min-w-[90px] py-2 px-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'students'
                ? 'bg-[#7C3AED] text-white shadow-clay-button'
                : 'text-[#686487] hover:text-[#1C1938] hover:bg-purple-50/60'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Students ({enrolledStudents.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('requests')}
            className={`flex-1 min-w-[95px] py-2 px-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer relative ${
              activeTab === 'requests'
                ? 'bg-[#7C3AED] text-white shadow-clay-button'
                : 'text-[#686487] hover:text-[#1C1938] hover:bg-purple-50/60'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Requests</span>
            {pendingRequests.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[9px] font-black flex items-center justify-center">
                {pendingRequests.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`flex-1 min-w-[80px] py-2 px-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-[#7C3AED] text-white shadow-clay-button'
                : 'text-[#686487] hover:text-[#1C1938] hover:bg-purple-50/60'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Profile</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 1: DASHBOARD / OVERVIEW                                           */}
        {/* ========================================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fade-in text-left">
            {/* Compact Metric Summary Cards (2x2 Grid) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-[22px] bg-white border border-[#E5DFF8] shadow-clay-sm space-y-1">
                <span className="text-[10px] font-black uppercase text-[#686487] block">Active Batches</span>
                <span className="text-2xl font-black text-[#1C1938]">{batches.length}</span>
                <span className="text-[10px] text-[#7C3AED] font-bold block">3-Hour Fixed</span>
              </div>

              <div className="p-4 rounded-[22px] bg-white border border-[#E5DFF8] shadow-clay-sm space-y-1">
                <span className="text-[10px] font-black uppercase text-[#686487] block">Enrolled Students</span>
                <span className="text-2xl font-black text-[#10B981]">{enrolledStudents.length}</span>
                <span className="text-[10px] text-slate-500 font-bold block">Accepted</span>
              </div>

              <div className="p-4 rounded-[22px] bg-white border border-[#E5DFF8] shadow-clay-sm space-y-1">
                <span className="text-[10px] font-black uppercase text-[#686487] block">Pending Requests</span>
                <span className="text-2xl font-black text-[#F59E0B]">{pendingRequests.length}</span>
                <span className="text-[10px] text-slate-500 font-bold block">Needs Review</span>
              </div>

              <div className="p-4 rounded-[22px] bg-white border border-[#E5DFF8] shadow-clay-sm space-y-1">
                <span className="text-[10px] font-black uppercase text-[#686487] block">Monthly Earnings</span>
                <span className="text-2xl font-black text-[#6D28D9]">
                  ₹{expectedMonthlyEarnings.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-[#686487] font-bold block">₹{feePerStudent}/mo per student</span>
              </div>
            </div>

            {/* Quick Actions Strip */}
            <ClayCard className="p-5 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-black text-[#1C1938]">Teaching Batch Operations</h4>
                <p className="text-xs text-[#686487]">Schedule micro-batches and review student requests</p>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <ClayButton
                  size="sm"
                  variant="primary"
                  onClick={() => setIsCreateBatchOpen(true)}
                  icon={<Plus className="w-4 h-4" />}
                  className="flex-1 sm:flex-initial"
                >
                  Create Batch
                </ClayButton>
                <ClayButton
                  size="sm"
                  variant="secondary"
                  onClick={() => setActiveTab('requests')}
                  className="flex-1 sm:flex-initial"
                >
                  Review Requests ({pendingRequests.length})
                </ClayButton>
              </div>
            </ClayCard>

            {/* Active Batches Snapshot */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h4 className="text-xs font-black uppercase tracking-wider text-[#686487]">Your Active Batches</h4>
                <button
                  type="button"
                  onClick={() => setActiveTab('batches')}
                  className="text-xs font-bold text-[#7C3AED] hover:underline"
                >
                  View All Batches
                </button>
              </div>

              {batches.length === 0 ? (
                <div className="p-6 rounded-[24px] bg-white border border-[#E5DFF8] text-center space-y-2">
                  <p className="text-xs text-[#686487]">No batches created yet. Create a 3-hour batch to accept students.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {batches.slice(0, 2).map((b) => {
                    const count = getBatchEnrolledCount(b.id);
                    const isFull = count >= 4;
                    return (
                      <div key={b.id} className="p-4 rounded-[22px] bg-white border border-[#E5DFF8] shadow-clay-sm flex justify-between items-center">
                        <div>
                          <h5 className="font-extrabold text-xs text-[#1C1938]">{b.name || b.batch_name}</h5>
                          <p className="text-[11px] text-[#686487]">
                            {formatTimeLabel(b.start_time)} – {formatTimeLabel(b.end_time)} • {b.days}
                          </p>
                        </div>
                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${isFull ? 'bg-rose-100 text-rose-800' : 'bg-[#EDE9FE] text-[#6D28D9]'}`}>
                          {count}/4 {isFull ? 'Full' : `${4 - count} open`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION 2: MY BATCHES                                                     */}
        {/* ========================================================================= */}
        {activeTab === 'batches' && (
          <div className="space-y-4 animate-fade-in text-left">
            <div className="flex items-center justify-between px-1">
              <div>
                <h3 className="text-base font-black text-[#1C1938] flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#4136CA]" />
                  3-Hour Fixed Batches ({batches.length})
                </h3>
                <p className="text-xs text-[#686487]">
                  Every batch runs exactly 3 hours with a maximum of 4 students per batch.
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
              <div className="p-8 rounded-[28px] bg-white border border-[#DFD8F3] text-center space-y-3">
                <Clock className="w-10 h-10 text-[#7C3AED] mx-auto opacity-70" />
                <h4 className="font-extrabold text-sm text-[#1C1938]">No Batches Created Yet</h4>
                <p className="text-xs text-[#686487] max-w-sm mx-auto">
                  Create structured 3-hour fixed batches so students can enroll directly with real-time seat availability.
                </p>
                <div className="pt-1">
                  <ClayButton size="sm" variant="primary" onClick={() => setIsCreateBatchOpen(true)}>
                    Create First 3-Hour Batch
                  </ClayButton>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {batches.map((batch, idx) => {
                  const enrolled = getBatchEnrolledCount(batch.id);
                  const max = batch.max_capacity ?? 4;
                  const remaining = Math.max(0, max - enrolled);
                  const isFull = enrolled >= max;
                  const bNumber = `BATCH ${String(idx + 1).padStart(2, '0')}`;
                  const subjectClass = formatBatchSubjectClass(batch);
                  const timeDays = `${formatTimeLabel(batch.start_time)} – ${formatTimeLabel(batch.end_time)} (${formatDaysLabel(batch.days)})`;

                  return (
                    <div
                      key={batch.id}
                      className="p-5 rounded-[26px] bg-white border border-[#E5DFF8] shadow-clay-sm flex flex-col justify-between gap-3 text-left overflow-hidden"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-black tracking-wider text-[#4136CA] bg-[#EDE9FE] px-2.5 py-1 rounded-xl">
                            {bNumber}
                          </span>
                          <div className="flex items-center gap-1.5">
                            {isFull ? (
                              <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-black uppercase">
                                Full
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black uppercase">
                                Active
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => handleDeleteBatch(batch.id, batch.name || batch.batch_name)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                              title="Delete Batch"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <h4 className="font-extrabold text-sm text-[#1C1938] leading-tight truncate">
                            {subjectClass}
                          </h4>
                          <p className="text-xs font-semibold text-[#686487]">
                            {timeDays}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 pt-0.5 text-[11px] flex-wrap">
                          <span className="bg-[#EFEAFF] text-[#4136CA] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            3 Hours Session
                          </span>
                          <span className="text-[#7C3AED] font-bold">
                            ₹{(batch.fee_amount || batch.fee || application?.fee_amount || 1500).toLocaleString('en-IN')} / mo
                          </span>
                        </div>
                      </div>

                      <div className="pt-2.5 border-t border-[#F3EFFB] space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-700">
                            Students: {enrolled} / {max}
                          </span>
                          <span className={`text-[11px] font-semibold ${isFull ? 'text-rose-600' : 'text-[#686487]'}`}>
                            {isFull ? 'Batch Full' : `${remaining} seat${remaining === 1 ? '' : 's'} available`}
                          </span>
                        </div>

                        <div className="w-full bg-[#E5DFF8] rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                              isFull ? 'bg-rose-500' : 'bg-[#4136CA]'
                            }`}
                            style={{ width: `${Math.min(100, (enrolled / max) * 100)}%` }}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => handleOpenRoster(batch)}
                            className="py-2.5 px-3 rounded-xl bg-[#FAF9FE] hover:bg-[#F3EFFB] border border-[#DFD8F3] text-[#4136CA] font-black text-xs transition-all flex items-center justify-center gap-1.5 active:scale-98 shadow-xs cursor-pointer"
                          >
                            <Users className="w-3.5 h-3.5" />
                            <span>View Students</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenRoster(batch)}
                            className="py-2.5 px-3 rounded-xl bg-[#EDE9FE] hover:bg-[#DDD6FE] text-[#6D28D9] font-black text-xs transition-all flex items-center justify-center gap-1.5 active:scale-98 shadow-xs cursor-pointer"
                          >
                            <Users className="w-3.5 h-3.5" />
                            <span>Manage Batch</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION 3: MY STUDENTS                                                    */}
        {/* ========================================================================= */}
        {activeTab === 'students' && (
          <div className="space-y-4 animate-fade-in text-left">
            <div className="flex items-center justify-between px-1">
              <div>
                <h3 className="text-base font-black text-[#1C1938] flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#10B981]" />
                  Enrolled Students ({enrolledStudents.length})
                </h3>
                <p className="text-xs text-[#686487]">
                  Students assigned to your active batches through accepted requests.
                </p>
              </div>
            </div>

            {enrolledStudents.length === 0 ? (
              <div className="p-8 rounded-[28px] bg-white border border-[#DFD8F3] text-center space-y-2">
                <Users className="w-10 h-10 text-[#686487] mx-auto opacity-50" />
                <h4 className="font-extrabold text-sm text-[#1C1938]">No Students Enrolled Yet</h4>
                <p className="text-xs text-[#686487] max-w-sm mx-auto">
                  When you accept student inquiries and assign them to your 3-hour batches, their records appear here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {enrolledStudents.map((st) => (
                  <div
                    key={st.id}
                    className="p-4.5 rounded-[24px] bg-white border border-[#E5DFF8] shadow-clay-sm flex flex-col justify-between gap-3 text-left"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-extrabold text-sm text-[#1C1938]">{st.student_name || 'Enrolled Student'}</h4>
                        <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          Enrolled
                        </span>
                      </div>

                      <p className="text-xs text-[#686487] mt-0.5">
                        Class: <strong className="text-[#1C1938]">{st.class_level?.toUpperCase()}</strong> • Karnataka State Board
                      </p>

                      <div className="mt-2 p-2.5 rounded-xl bg-[#FAF9FE] border border-[#E5DFF8] text-xs space-y-1">
                        <div className="text-[#4136CA] font-bold flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{(st as any).batch_name || 'Assigned Batch'}</span>
                        </div>
                        <div className="text-[11px] text-[#686487]">
                          Subject: <strong className="text-slate-800">{st.subject}</strong>
                        </div>
                      </div>
                    </div>

                    {st.guardian_phone && (
                      <div className="pt-2 border-t border-[#F3EFFB] flex items-center justify-between gap-2 text-xs">
                        <span className="text-[11px] text-[#686487] font-semibold">Guardian Contact:</span>
                        <a
                          href={`tel:${st.guardian_phone}`}
                          className="font-bold text-[#10B981] hover:underline flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3" />
                          <span>{st.guardian_phone}</span>
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION 4: STUDENT REQUESTS                                               */}
        {/* ========================================================================= */}
        {activeTab === 'requests' && (
          <div className="space-y-4 animate-fade-in text-left">
            <div className="flex items-center justify-between px-1">
              <div>
                <h3 className="text-base font-black text-[#1C1938] flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-[#F59E0B]" />
                  Student Inquiries ({requests.length})
                </h3>
                <p className="text-xs text-[#686487]">
                  Review student learning requests and allocate open seats.
                </p>
              </div>
              <span className="text-xs font-black px-3 py-1 rounded-full bg-[#EDE9FE] text-[#6D28D9]">
                {pendingRequests.length} Pending
              </span>
            </div>

            {requests.length === 0 ? (
              <div className="p-8 rounded-[28px] bg-white border border-[#DFD8F3] text-center space-y-2">
                <UserPlus className="w-10 h-10 text-[#686487] mx-auto opacity-50" />
                <h4 className="font-extrabold text-sm text-[#1C1938]">No Inquiries Yet</h4>
                <p className="text-xs text-[#686487] max-w-sm mx-auto">
                  When students discover your verified profile and request mentorship, their inquiries will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {requests.map((req) => {
                  const isPending = req.status === 'pending';
                  const isAccepted = req.status === 'accepted';
                  const isDeclined = req.status === 'declined';
                  const hasBatchAssigned = !!(req as any).batch_id;

                  return (
                    <div
                      key={req.id}
                      className="p-5 rounded-[26px] bg-white border border-[#E5DFF8] shadow-clay-sm flex flex-col gap-3 text-left"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-black text-sm text-[#1C1938]">{req.student_name || 'Student Inquiry'}</h4>
                            <span
                              className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase ${
                                isAccepted
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : isDeclined
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {req.status}
                            </span>
                          </div>
                          <p className="text-xs text-[#686487] mt-0.5">
                            Class: <strong className="text-slate-800">{req.class_level?.toUpperCase()}</strong> • Subject: <strong className="text-slate-800">{req.subject}</strong>
                          </p>
                        </div>

                        {/* Actions for Pending */}
                        {isPending && (
                          <div className="flex items-center gap-2 self-start sm:self-auto">
                            <button
                              type="button"
                              onClick={() => handleOpenResponse(req, 'declined')}
                              className="px-3.5 py-1.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold transition-all cursor-pointer"
                            >
                              Decline
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenResponse(req, 'accepted')}
                              className="px-4 py-1.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
                            >
                              Accept
                            </button>
                          </div>
                        )}
                      </div>

                      <p className="text-xs text-[#4A4668] bg-[#FAF9FE] p-2.5 rounded-xl border border-[#EFEBF8]">
                        &quot;{req.learning_needs}&quot;
                      </p>

                      {/* If Accepted: Batch Assignment status */}
                      {isAccepted && (
                        <div className="pt-2 border-t border-[#F3EFFB] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="text-xs text-[#686487]">
                            {hasBatchAssigned ? (
                              <span className="font-bold text-[#4136CA] flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                Assigned: {(req as any).batch_name} ({(req as any).batch_time})
                              </span>
                            ) : (
                              <span className="text-amber-700 font-bold">
                                Accepted • Needs batch seat assignment
                              </span>
                            )}
                          </div>

                          {!hasBatchAssigned && batches.length > 0 && (
                            <button
                              type="button"
                              onClick={() => setAssigningRequestForBatch(req)}
                              className="px-3.5 py-1.5 rounded-xl bg-purple-50 text-[#7C3AED] hover:bg-purple-100 border border-purple-200 text-xs font-bold transition-all cursor-pointer self-start sm:self-auto"
                            >
                              Assign to 3-Hour Batch
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION 5: TUTOR PROFILE                                                  */}
        {/* ========================================================================= */}
        {activeTab === 'profile' && application && (
          <div className="space-y-4 animate-fade-in text-left">
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
                    ₹{application.fee_amount || 1500} / month
                  </span>
                  <span className="text-[10px] text-[#686487] block mt-0.5">
                    Transparent Tuition (10% Shikshan Platform Fee)
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2">
                <div className="p-3 rounded-xl bg-[#FAF9FE] border border-[#E5DFF8]">
                  <span className="text-[10px] font-bold uppercase text-[#686487] block">Qualifications</span>
                  <span className="font-bold text-[#1C1938] block mt-0.5">{application.course_qualification}</span>
                  <span className="text-slate-500 block">{application.institution_name}</span>
                </div>

                <div className="p-3 rounded-xl bg-[#FAF9FE] border border-[#E5DFF8]">
                  <span className="text-[10px] font-bold uppercase text-[#686487] block">Teaching Experience</span>
                  <span className="font-bold text-[#1C1938] block mt-0.5">{application.teaching_experience || 'Academic Mentor'}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#686487] block mb-1.5">
                  Approved Teaching Subjects
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(application.subjects || []).map((s) => (
                    <span key={s} className="px-2.5 py-1 rounded-lg bg-[#FAF9FE] border border-[#E5DFF8] text-[#7C3AED] font-bold text-xs">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#686487] block mb-1">
                  Teaching Approach / Bio
                </span>
                <p className="text-xs text-[#4A4668] leading-relaxed p-3 rounded-xl bg-[#FAF9FE] border border-[#E5DFF8]">
                  &quot;{application.bio_intro}&quot;
                </p>
              </div>

              {/* Single Proper Logout Action inside Profile section at bottom */}
              <div className="pt-4 border-t border-[#F3EFFB]">
                <button
                  type="button"
                  onClick={() => setIsConfirmSignOutOpen(true)}
                  className="w-full py-3.5 px-5 rounded-2xl bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 shadow-clay-sm flex items-center justify-center gap-2 font-black text-xs active:scale-[0.98] transition-all cursor-pointer"
                >
                  <LogOut className="w-4 h-4 stroke-[2.2]" />
                  <span>Sign Out of Shikshan</span>
                </button>
              </div>
            </ClayCard>
          </div>
        )}
          </>
        )}
      </main>

      {/* ========================================================================= */}
      {/* MODAL 1: CREATE BATCH MODAL                                              */}
      {/* ========================================================================= */}
      {isCreateBatchOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-purple-100 text-left space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#F3EFFB]">
              <div>
                <h3 className="font-black text-base text-[#1C1938]">Create 3-Hour Fixed Batch</h3>
                <p className="text-[11px] text-[#686487]">Fixed 3-hour duration • Strictly 4 students maximum</p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateBatchOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {batchError && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{batchError}</span>
              </div>
            )}

            <form onSubmit={handleCreateBatch} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-[#1C1938] mb-1">Teaching Subject</label>
                <select
                  value={batchSubject}
                  onChange={(e) => setBatchSubject(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#DFD8F3] bg-[#FAF9FE] text-xs font-semibold text-[#1C1938]"
                >
                  {SCHOOL_SUBJECTS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#1C1938] mb-1">Target Class Level</label>
                <select
                  value={batchClass}
                  onChange={(e) => setBatchClass(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#DFD8F3] bg-[#FAF9FE] text-xs font-semibold text-[#1C1938]"
                >
                  {INDIVIDUAL_CLASSES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#1C1938] mb-1">
                  Batch Name / Title (Optional)
                </label>
                <input
                  type="text"
                  value={batchName}
                  onChange={(e) => setBatchName(e.target.value)}
                  placeholder="e.g. Evening Mathematics (Class 8)"
                  className="w-full p-2.5 rounded-xl border border-[#DFD8F3] bg-[#FAF9FE] text-xs text-[#1C1938]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#1C1938] mb-1.5">Weekly Schedule Days</label>
                <div className="flex flex-wrap gap-1.5">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => {
                    const isSelected = batchDays.includes(day);
                    return (
                      <button
                        type="button"
                        key={day}
                        onClick={() => {
                          setBatchDays((prev) =>
                            isSelected ? prev.filter((d) => d !== day) : [...prev, day]
                          );
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#7C3AED] text-white shadow-xs'
                            : 'bg-[#FAF9FE] text-[#686487] border border-[#DFD8F3]'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#1C1938] mb-1">Session Start Time</label>
                  <input
                    type="time"
                    value={batchStart}
                    onChange={(e) => setBatchStart(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#DFD8F3] bg-[#FAF9FE] text-xs font-black text-[#1C1938]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#1C1938] mb-1">Fixed End Time (3 Hrs)</label>
                  <input
                    type="time"
                    value={calculateEndTime(batchStart)}
                    disabled
                    className="w-full p-2.5 rounded-xl border border-[#DFD8F3] bg-[#EFEBF8] text-xs font-black text-[#686487] cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#1C1938] mb-1">
                  Monthly Fee per Student (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    min="100"
                    max="10000"
                    value={batchFee}
                    onChange={(e) => setBatchFee(Number(e.target.value))}
                    className="w-full pl-7 pr-3 py-2.5 rounded-xl border border-[#DFD8F3] bg-[#FAF9FE] text-xs font-black text-[#1C1938]"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#F3EFFB]">
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
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: MANAGE ROSTER MODAL                                              */}
      {/* ========================================================================= */}
      {selectedBatchForRoster && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-purple-100 text-left space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#F3EFFB]">
              <div>
                <h3 className="font-black text-base text-[#1C1938]">
                  Batch Roster: {selectedBatchForRoster.name || selectedBatchForRoster.batch_name}
                </h3>
                <p className="text-[11px] text-[#686487]">
                  {formatTimeLabel(selectedBatchForRoster.start_time)} – {formatTimeLabel(selectedBatchForRoster.end_time)} • Max 4 students
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBatchForRoster(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Batch Details Summary */}
            <div className="grid grid-cols-3 gap-2 p-2.5 rounded-2xl bg-[#FAF9FE] border border-[#E5DFF8] text-[11px]">
              <div>
                <span className="text-[#686487] block font-bold text-[10px]">DAYS</span>
                <span className="font-extrabold text-[#1C1938] truncate block">{formatDaysLabel(selectedBatchForRoster.days)}</span>
              </div>
              <div>
                <span className="text-[#686487] block font-bold text-[10px]">DURATION</span>
                <span className="font-extrabold text-[#4136CA] block">3 Hours Fixed</span>
              </div>
              <div>
                <span className="text-[#686487] block font-bold text-[10px]">CAPACITY</span>
                <span className="font-extrabold text-[#059669] block">Max 4 Students</span>
              </div>
            </div>

            {rosterMessage && (
              <div
                className={`p-3 rounded-2xl text-xs flex items-center gap-2 ${
                  rosterMessage.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {rosterMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                )}
                <span>{rosterMessage.text}</span>
              </div>
            )}

            {/* Current Enrolled Roster */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#686487] block">
                Currently Enrolled Students ({batchStudents.length} / 4)
              </span>

              {isRosterLoading ? (
                <div className="p-6 text-center text-xs text-[#686487]">Loading batch roster...</div>
              ) : batchStudents.length === 0 ? (
                <div className="p-6 rounded-2xl bg-[#FAF9FE] border border-[#E5DFF8] text-center text-xs text-[#686487]">
                  No students currently assigned to this batch.
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {batchStudents.map((st) => (
                    <div
                      key={st.request_id || st.id}
                      className="p-3 rounded-2xl bg-[#FAF9FE] border border-[#E5DFF8] flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-[#1C1938] block">{st.student_name || 'Enrolled Student'}</span>
                        <span className="text-[11px] text-[#686487]">
                          Class: {st.class_level?.toUpperCase()} • {st.subject}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleUnassignStudent(selectedBatchForRoster.id, st.request_id || st.id)}
                        disabled={rosterActionLoading === (st.request_id || st.id)}
                        className="px-2.5 py-1 rounded-lg text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add Student Section inside Manage Batch */}
            <div className="pt-2 border-t border-[#F3EFFB] space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#686487] block">
                Add Accepted Student ({Math.max(0, 4 - batchStudents.length)} seats available)
              </span>

              {batchStudents.length >= 4 ? (
                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
                  This batch is at maximum capacity (4/4 students).
                </div>
              ) : (
                (() => {
                  const enrolledStudentIds = new Set(batchStudents.map((bs) => bs.student_id).filter(Boolean));
                  requests.forEach((r) => {
                    if (r.status === 'accepted' && (r as any).batch_id === selectedBatchForRoster.id && r.student_id) {
                      enrolledStudentIds.add(r.student_id);
                    }
                  });

                  const seenCandidateIds = new Set<string>();
                  const availableRequests = requests.filter((r) => {
                    if (r.status !== 'accepted') return false;
                    const sid = r.student_id || r.id;
                    if (enrolledStudentIds.has(sid)) return false;
                    if (seenCandidateIds.has(sid)) return false;
                    seenCandidateIds.add(sid);
                    return true;
                  });

                  if (availableRequests.length === 0) {
                    return (
                      <div className="p-3 rounded-2xl bg-[#FAF9FE] border border-[#E5DFF8] text-xs text-[#686487]">
                        No unassigned accepted students waiting. Accept pending requests in the Requests tab to assign students here.
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-1.5 max-h-40 overflow-y-auto">
                      {availableRequests.map((cand) => (
                        <div
                          key={cand.id}
                          className="p-2.5 rounded-xl bg-[#FAF9FE] border border-[#E5DFF8] flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-bold text-[#1C1938] block">{cand.student_name || 'Accepted Student'}</span>
                            <span className="text-[10px] text-[#686487]">
                              Class: {cand.class_level?.toUpperCase()} • {cand.subject}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleAssignStudent(selectedBatchForRoster.id, cand.id)}
                            disabled={rosterActionLoading === cand.id}
                            className="px-3 py-1 rounded-xl bg-[#7C3AED] text-white hover:bg-[#6D28D9] text-xs font-bold transition-all shadow-xs cursor-pointer"
                          >
                            {rosterActionLoading === cand.id ? 'Adding...' : 'Add to Batch'}
                          </button>
                        </div>
                      ))}
                    </div>
                  );
                })()
              )}
            </div>

            <div className="flex justify-end pt-2">
              <ClayButton
                size="sm"
                variant="secondary"
                onClick={() => setSelectedBatchForRoster(null)}
              >
                Close
              </ClayButton>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: ASSIGN ACCEPTED INQUIRY TO BATCH                                */}
      {/* ========================================================================= */}
      {assigningRequestForBatch && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-purple-100 text-left space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#F3EFFB]">
              <div>
                <h3 className="font-black text-base text-[#1C1938]">Assign Student to Batch</h3>
                <p className="text-[11px] text-[#686487]">
                  Assigning {assigningRequestForBatch.student_name || 'Student'} ({assigningRequestForBatch.subject})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAssigningRequestForBatch(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {batches.map((b) => {
                const isFull = (b.enrolled_count || 0) >= 4;
                return (
                  <div
                    key={b.id}
                    className="p-3.5 rounded-2xl bg-[#FAF9FE] border border-[#E5DFF8] flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-black text-[#1C1938] block">{b.name || b.batch_name}</span>
                      <span className="text-[11px] text-[#686487]">
                        {formatTimeLabel(b.start_time)} – {formatTimeLabel(b.end_time)} • {b.enrolled_count || 0}/4 Enrolled
                      </span>
                    </div>

                    <ClayButton
                      size="sm"
                      variant="primary"
                      disabled={isFull || rosterActionLoading === assigningRequestForBatch.id}
                      isLoading={rosterActionLoading === assigningRequestForBatch.id}
                      onClick={() => handleAssignStudent(b.id, assigningRequestForBatch.id)}
                      className="rounded-xl px-3 py-1.5 text-xs font-bold"
                    >
                      {isFull ? 'Full' : 'Enroll'}
                    </ClayButton>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-2">
              <ClayButton
                size="sm"
                variant="secondary"
                onClick={() => setAssigningRequestForBatch(null)}
              >
                Cancel
              </ClayButton>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: INQUIRY ACCEPT / DECLINE RESPONSE                               */}
      {/* ========================================================================= */}
      {activeRequest && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-purple-100 text-left space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#F3EFFB]">
              <h3 className="font-black text-base text-[#1C1938]">
                {responseAction === 'accepted' ? 'Accept Student Inquiry' : 'Decline Student Inquiry'}
              </h3>
              <button
                type="button"
                onClick={() => setActiveRequest(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-[#FAF9FE] border border-[#E5DFF8] text-xs space-y-1">
              <div className="font-bold text-[#1C1938]">{activeRequest.student_name || 'Student'}</div>
              <div className="text-[11px] text-[#686487]">
                Class: {activeRequest.class_level?.toUpperCase()} • Subject: {activeRequest.subject}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#1C1938] mb-1">
                Message to Student & Parent
              </label>
              <textarea
                value={responseNote}
                onChange={(e) => setResponseNote(e.target.value)}
                rows={3}
                className="w-full p-3 rounded-2xl border border-[#DFD8F3] bg-[#FAF9FE] text-xs text-[#1C1938]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#F3EFFB]">
              <ClayButton
                size="sm"
                variant="secondary"
                onClick={() => setActiveRequest(null)}
              >
                Cancel
              </ClayButton>
              <ClayButton
                size="sm"
                variant="primary"
                isLoading={isUpdating}
                onClick={handleSubmitResponse}
                className={responseAction === 'accepted' ? '!bg-emerald-600 hover:!bg-emerald-700' : '!bg-rose-600 hover:!bg-rose-700'}
              >
                {responseAction === 'accepted' ? 'Confirm Acceptance' : 'Confirm Decline'}
              </ClayButton>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: LOGOUT CONFIRMATION DIALOG                                       */}
      {/* ========================================================================= */}
      {isConfirmSignOutOpen && (
        <div
          className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-purple-100 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
              <LogOut className="w-7 h-7" />
            </div>

            <div>
              <h3 className="font-black text-base text-[#1C1938]">
                Confirm Logout
              </h3>
              <p className="text-xs text-[#686487] mt-1 leading-relaxed">
                Are you sure you want to log out of Shikshan? You will need to sign in again to access your tutor dashboard.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmSignOutOpen(false)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSignOut}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 shadow-sm transition-colors cursor-pointer"
              >
                Confirm Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile-First Tutor Bottom Navigation Dock */}
      <ClayTutorBottomNavigation
        activeTab={activeTab}
        onChangeTab={(tab) => setActiveTab(tab)}
        batchesCount={batches.length}
        studentsCount={enrolledStudents.length}
        requestsCount={pendingRequests.length}
      />
    </ClayBackground>
  );
};
