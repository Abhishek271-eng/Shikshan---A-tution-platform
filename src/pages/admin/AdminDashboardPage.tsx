import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Check,
  X,
  Lock,
  RefreshCw,
  Phone,
  Mail,
  Users,
  GraduationCap,
  Download,
  Calendar,
  BookOpen,
  Search,
  IndianRupee,
  Clock,
  FileText,
  Edit2,
  LayoutDashboard,
  ArrowRight,
  Send,
  ShieldCheck,
  LogOut,
  AlertCircle,
  UserMinus,
} from 'lucide-react';
import { Header } from '../../components/common/Header';
import { ClayCard } from '../../components/common/ClayCard';
import { ClayButton } from '../../components/common/ClayButton';
import { ClayBackground } from '../../components/common/ClayBackground';
import { ClayUploadButton } from '../../components/common/ClayUploadButton';
import { useAuth } from '../../context/AuthContext';
import { api, AdminBatchRecord } from '../../lib/api';
import { TutorApplication } from '../../types';

interface StudentRecord {
  id: string;
  email: string;
  name: string;
  phone: string;
  created_at: string;
  class_level?: string;
  board?: string;
  learning_language?: string;
  subjects?: string[];
  guardian_phone?: string;
  learning_goals?: string;
}

interface StudentRemovalTarget {
  requestId: string;
  studentName: string;
  tutorName: string;
  batchId: string;
  batchName: string;
}

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, uploadPhoto, removePhoto, signOut, isLoading: isAuthLoading } = useAuth();
  const [isConfirmSignOutOpen, setIsConfirmSignOutOpen] = useState(false);

  const handleSignOut = async () => {
    setIsConfirmSignOutOpen(false);
    await signOut();
    navigate('/login', { replace: true });
  };

  const [mainSection, setMainSection] = useState<
    'dashboard' | 'students' | 'tutors' | 'applications' | 'requests' | 'inquiries' | 'batches' | 'payments' | 'audit' | 'profile'
  >('applications');
  const [adminStats, setAdminStats] = useState<{
    total_students: number;
    approved_tutors: number;
    pending_applications: number;
    total_requests: number;
    active_batches: number;
    payment_interests: number;
  }>({
    total_students: 0,
    approved_tutors: 0,
    pending_applications: 0,
    total_requests: 0,
    active_batches: 0,
    payment_interests: 0,
  });
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [applications, setApplications] = useState<TutorApplication[]>([]);
  const [selectedApp, setSelectedApp] = useState<TutorApplication | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');

  // Students state
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);

  // Payments coordination state
  const [payments, setPayments] = useState<any[]>([]);
  const [isLoadingPayments, setIsLoadingPayments] = useState(false);
  const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null);
  const [paymentStatusUpdate, setPaymentStatusUpdate] = useState<string>('interest_expressed');
  const [paymentAmountUpdate, setPaymentAmountUpdate] = useState<string>('3000');
  const [paymentNotesUpdate, setPaymentNotesUpdate] = useState<string>('');

  // Requests state
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);

  // Audit logs state
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isLoadingAudit, setIsLoadingAudit] = useState(false);

  // Authoritative batches state
  const [batches, setBatches] = useState<AdminBatchRecord[]>([]);
  const [isLoadingBatches, setIsLoadingBatches] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Review Form States
  const [internalNote, setInternalNote] = useState('');
  const [applicantMessage, setApplicantMessage] = useState('');
  const [approvedFeeInput, setApprovedFeeInput] = useState('3000');
  const [isUpdatingFee, setIsUpdatingFee] = useState(false);

  // Admin-only Student Removal State
  const [studentRemovalTarget, setStudentRemovalTarget] = useState<StudentRemovalTarget | null>(null);
  const [selectedBatchModal, setSelectedBatchModal] = useState<any | null>(null);
  const [removalReason, setRemovalReason] = useState<'payment_not_completed' | 'administrative_removal' | 'other'>('payment_not_completed');
  const [removalNote, setRemovalNote] = useState<string>('');
  const [isRemovingStudent, setIsRemovingStudent] = useState<boolean>(false);

  const isAdmin = profile?.role === 'admin' || user?.role === 'admin';

  const fetchStats = async () => {
    try {
      const res = await api.getAdminStats();
      if (res?.stats) {
        setAdminStats(res.stats);
      }
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    }
  };

  const fetchApplications = async () => {
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const res = await api.getAdminApplications();
      const list = (res.applications || []).map((app: any) => ({
        ...app,
        status: app.status === 'pending' ? 'pending_review' : app.status,
      }));
      setApplications(list);
      if (list.length > 0) {
        setSelectedApp(list[0]);
        setApprovedFeeInput(String(list[0].fee_amount || 3000));
      } else {
        setSelectedApp(null);
      }
    } catch (err) {
      console.error('Failed to load applications:', err);
      setStatusMessage('Failed to load tutor applications from database.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStudents = async () => {
    setIsLoadingStudents(true);
    try {
      const res = await api.getAdminStudents(studentSearch);
      setStudents(res.students || []);
    } catch (err) {
      console.error('Failed to load students:', err);
    } finally {
      setIsLoadingStudents(false);
    }
  };

  const fetchPayments = async () => {
    setIsLoadingPayments(true);
    try {
      const res = await api.getAdminPayments();
      setPayments(res.payments || []);
    } catch (err) {
      console.error('Failed to load payments:', err);
    } finally {
      setIsLoadingPayments(false);
    }
  };

  const fetchRequests = async () => {
    setIsLoadingRequests(true);
    try {
      const res = await api.getAdminRequests();
      setRequests(res.requests || []);
    } catch (err) {
      console.error('Failed to load requests:', err);
    } finally {
      setIsLoadingRequests(false);
    }
  };

  const fetchAuditLogs = async () => {
    setIsLoadingAudit(true);
    try {
      const res = await api.getAdminAuditLogs();
      setAuditLogs(res.audit_logs || []);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setIsLoadingAudit(false);
    }
  };

  const fetchBatches = async () => {
    setIsLoadingBatches(true);
    try {
      const res = await api.getAdminBatches();
      setBatches(res.batches || []);
    } catch (err) {
      console.error('Failed to load authoritative admin batches:', err);
    } finally {
      setIsLoadingBatches(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchStats();
      fetchApplications();
      fetchStudents();
      fetchPayments();
      fetchRequests();
      fetchBatches();
      fetchAuditLogs();
    } else {
      setIsLoading(false);
    }
  }, [isAdmin]);

  const handleAdminPhotoUpload = async (base64Photo: string) => {
    setIsUploadingPhoto(true);
    setStatusMessage(null);
    try {
      const res = await uploadPhoto(base64Photo);
      if (res.success) {
        setStatusMessage('Admin profile photo updated successfully.');
      } else {
        setStatusMessage(res.error || 'Failed to update admin photo.');
      }
    } catch (err: unknown) {
      setStatusMessage(err instanceof Error ? err.message : 'Photo upload failed.');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleAdminPhotoRemove = async () => {
    setIsUploadingPhoto(true);
    setStatusMessage(null);
    try {
      const res = await removePhoto();
      if (res.success) {
        setStatusMessage('Admin profile photo removed.');
      } else {
        setStatusMessage(res.error || 'Failed to remove admin photo.');
      }
    } catch (err: unknown) {
      setStatusMessage(err instanceof Error ? err.message : 'Photo removal failed.');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const derivedBatches = React.useMemo(() => {
    const batchMap: Record<
      string,
      {
        id: string;
        name: string;
        tutorName: string;
        tutorPhone?: string;
        subject: string;
        classLevel: string;
        startTime?: string;
        endTime?: string;
        days?: string;
        enrolledCount: number;
        availableSeats: number;
        students: {
          id: string;
          requestId: string;
          studentId: string;
          name: string;
          email: string;
          phone?: string;
          status: string;
          classLevel?: string;
          subject?: string;
          batchId: string;
        }[];
      }
    > = {};

    requests.forEach((r) => {
      const key = r.batch_id || (r.batch_name ? `${r.tutor_id}-${r.batch_name}` : (r.status === 'accepted' ? `${r.tutor_id}-mentorship` : null));
      if (!key) return;
      if (!batchMap[key]) {
        batchMap[key] = {
          id: r.batch_id || key,
          name: r.batch_name || `${r.tutor_name || 'Academic Mentor'} Batch`,
          tutorName: r.tutor_name || 'Approved Mentor',
          tutorPhone: r.tutor_phone,
          subject: r.subject || 'Karnataka State Curriculum',
          classLevel: r.class_level || 'School Curriculum',
          startTime: r.batch_start_time || '16:00',
          endTime: r.batch_end_time || '19:00',
          days: 'Mon · Wed · Fri',
          enrolledCount: 0,
          availableSeats: 4,
          students: [],
        };
      }
      if (r.student_name && !batchMap[key].students.some((s) => s.id === r.id || s.name === r.student_name)) {
        batchMap[key].students.push({
          id: r.id,
          requestId: r.id,
          studentId: r.student_id,
          name: r.student_name,
          email: r.student_email,
          phone: r.student_phone,
          status: r.status,
          classLevel: r.class_level || 'Class 8',
          subject: r.subject || 'Karnataka State Curriculum',
          batchId: r.batch_id || key,
        });
        if (r.status === 'accepted') {
          batchMap[key].enrolledCount += 1;
          batchMap[key].availableSeats = Math.max(0, 4 - batchMap[key].enrolledCount);
        }
      }
    });

    return Object.values(batchMap);
  }, [requests]);

  const displayBatches = React.useMemo(() => {
    if (batches && batches.length > 0) {
      return batches.map((b) => ({
        id: b.id,
        name: b.name,
        tutorName: b.tutor_name,
        tutorPhone: b.tutor_phone,
        subject: b.subject,
        classLevel: b.class_level,
        startTime: b.start_time,
        endTime: b.end_time,
        days: b.days,
        enrolledCount: b.enrolled_count,
        availableSeats: b.available_seats !== undefined ? b.available_seats : Math.max(0, 4 - b.enrolled_count),
        students: (b.students || []).map((s) => ({
          id: s.requestId || s.id,
          requestId: s.requestId || s.id,
          studentId: s.studentId,
          name: s.name,
          email: s.email,
          phone: s.phone,
          status: s.status,
          classLevel: s.classLevel || (s as any).class_level || b.class_level || 'Class 8',
          subject: s.subject || b.subject || 'Karnataka State Curriculum',
          batchId: b.id,
        })),
      }));
    }
    return derivedBatches;
  }, [batches, derivedBatches]);

  // Admin-only Student Removal from Batch Enrollment
  const handleAdminRemoveStudent = async () => {
    if (!studentRemovalTarget) return;
    setIsRemovingStudent(true);
    setStatusMessage(null);

    const reasonLabels = {
      payment_not_completed: 'Payment not completed',
      administrative_removal: 'Administrative removal',
      other: 'Other',
    };

    try {
      const res = await api.adminRemoveStudentFromBatch(
        studentRemovalTarget.batchId,
        studentRemovalTarget.requestId,
        {
          reason: reasonLabels[removalReason],
          note: removalNote.trim() || undefined,
        }
      );

      if (res.success) {
        setStatusMessage(
          `Student "${studentRemovalTarget.studentName}" removed from "${studentRemovalTarget.batchName}". Seat released.`
        );
        // Update local batches state immediately
        setBatches((prev) =>
          prev.map((b) => {
            if (b.id === studentRemovalTarget.batchId) {
              const updatedStudents = (b.students || []).filter(
                (s) => s.requestId !== studentRemovalTarget.requestId && s.id !== studentRemovalTarget.requestId
              );
              const newEnrolled = updatedStudents.filter((s) => s.status === 'accepted' || s.status === 'Active' || s.status === 'active').length;
              return {
                ...b,
                students: updatedStudents,
                enrolled_count: newEnrolled,
                available_seats: Math.max(0, 4 - newEnrolled),
              };
            }
            return b;
          })
        );
        // Update selectedBatchModal state if open
        setSelectedBatchModal((prev: any) => {
          if (!prev || prev.id !== studentRemovalTarget.batchId) return prev;
          const updated = (prev.students || []).filter(
            (s: any) => s.requestId !== studentRemovalTarget.requestId && s.id !== studentRemovalTarget.requestId
          );
          return {
            ...prev,
            students: updated,
            enrolledCount: updated.length,
            availableSeats: Math.max(0, 4 - updated.length),
          };
        });
        // Update local requests state to clear batch assignment immediately
        setRequests((prev) =>
          prev.map((r) =>
            r.id === studentRemovalTarget.requestId
              ? { ...r, batch_id: null, batch_name: null, batch_time: null }
              : r
          )
        );
        setStudentRemovalTarget(null);
        setRemovalNote('');
        // Re-sync authoritative batches and requests in background
        fetchBatches();
        fetchRequests();
      } else {
        setStatusMessage(res.message || 'Failed to remove student from batch.');
      }
    } catch (err: any) {
      console.error('Error removing student:', err);
      setStatusMessage(err?.message || 'Failed to remove student from batch enrollment.');
    } finally {
      setIsRemovingStudent(false);
    }
  };

  const handleStatusUpdate = async (newStatus: 'approved' | 'rejected') => {
    if (!selectedApp) return;

    const feeNum = parseFloat(approvedFeeInput);
    if (newStatus === 'approved' && (isNaN(feeNum) || feeNum <= 0 || feeNum > 3000)) {
      setStatusMessage('Approved monthly fee must be between ₹100 and ₹3,000 (maximum allowed monthly cap).');
      return;
    }

    setIsProcessing(true);
    setStatusMessage(null);

    try {
      await api.updateApplicationStatus(selectedApp.id, {
        status: newStatus,
        approved_fee: newStatus === 'approved' ? feeNum : undefined,
        admin_notes: internalNote.trim() || undefined,
        reviewer_message: applicantMessage.trim() || undefined,
      });

      setStatusMessage(`Application for ${selectedApp.tutor_profile?.name || 'Tutor'} successfully ${newStatus}!`);

      // Update in local state
      setApplications((prev) =>
        prev.map((a) =>
          a.id === selectedApp.id ? { ...a, status: newStatus, fee_amount: feeNum } : a
        )
      );
      setSelectedApp((prev) => (prev ? { ...prev, status: newStatus, fee_amount: feeNum } : null));

      setInternalNote('');
      setApplicantMessage('');
    } catch (err: unknown) {
      setStatusMessage(err instanceof Error ? err.message : 'Action failed. Check server connection.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateApprovedFee = async () => {
    if (!selectedApp) return;
    const feeNum = parseFloat(approvedFeeInput);
    if (isNaN(feeNum) || feeNum <= 0 || feeNum > 3000) {
      setStatusMessage('Approved monthly fee must be between ₹100 and ₹3,000 (maximum allowed monthly cap).');
      return;
    }

    setIsUpdatingFee(true);
    try {
      await api.updateAdminTutorFee(selectedApp.tutor_id, feeNum);
      setStatusMessage(`Approved monthly fee for ${selectedApp.tutor_profile?.name || 'Tutor'} updated to ₹${feeNum}!`);
      setApplications((prev) =>
        prev.map((a) => (a.id === selectedApp.id ? { ...a, fee_amount: feeNum } : a))
      );
      setSelectedApp((prev) => (prev ? { ...prev, fee_amount: feeNum } : null));
    } catch (err: any) {
      setStatusMessage(err?.message || 'Failed to update fee.');
    } finally {
      setIsUpdatingFee(false);
    }
  };

  const handleSavePaymentCoordination = async (id: string) => {
    const amtNum = parseFloat(paymentAmountUpdate);
    try {
      await api.updateAdminPayment(id, {
        status: paymentStatusUpdate,
        amount_collected: isNaN(amtNum) ? undefined : amtNum,
        admin_notes: paymentNotesUpdate.trim() || undefined,
      });
      setStatusMessage('Payment coordination status updated successfully.');
      setEditingPaymentId(null);
      fetchPayments();
    } catch (err: any) {
      alert(err?.message || 'Failed to update payment status.');
    }
  };

  const exportStudentsCsv = () => {
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Class', 'Board', 'Language', 'Subjects', 'Guardian Phone', 'Joined Date'];
    const rows = students.map((s) => [
      s.id,
      `"${s.name}"`,
      s.email,
      s.phone,
      s.class_level || 'N/A',
      `"${s.board || 'N/A'}"`,
      s.learning_language || 'N/A',
      `"${(s.subjects || []).join(', ')}"`,
      s.guardian_phone || 'N/A',
      s.created_at || 'N/A',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `shikshan_students_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isAuthLoading) {
    return (
      <ClayBackground>
        <Header title="Admin Review Desk" subtitle="Authenticating Administrator..." />
        <main className="flex-1 max-w-md mx-auto w-full px-5 py-12 flex flex-col justify-center text-center">
          <ClayCard className="p-8 text-center text-xs text-[#686487] border border-[#DFD8F3]">
            Verifying administrator credentials...
          </ClayCard>
        </main>
      </ClayBackground>
    );
  }

  if (!isAdmin) {
    return (
      <ClayBackground>
        <Header title="Access Denied" subtitle="Administrator privileges required" />
        <main className="flex-1 max-w-md mx-auto w-full px-5 py-12 flex flex-col justify-center">
          <ClayCard className="p-8 text-center space-y-4 border border-[#DFD8F3]">
            <div className="w-14 h-14 rounded-3xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Lock className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Administrator Access Required</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Your account ({user?.email || 'Guest'}) does not have administrative permissions. Please log in with your configured admin credentials.
            </p>
          </ClayCard>
        </main>
      </ClayBackground>
    );
  }

  const filteredApps = applications.filter((app) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return app.status === 'pending' || app.status === 'pending_review';
    return app.status === activeTab;
  });

  return (
    <ClayBackground>
      <Header title="Admin Review Desk" subtitle="Manual Tutor Assessment & Platform Control" />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 pb-28 space-y-6">
        {/* Banner with Profile & Refresh */}
        <ClayCard className="p-6 text-left flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-[#DFD8F3] shadow-clay bg-white">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <ClayUploadButton
              currentPhotoUrl={user?.photo_url || profile?.photo_url}
              onPhotoSelected={async (url) => {
                await api.updateAdminProfile({ photo_url: url });
                if (user) user.photo_url = url;
              }}
              onPhotoRemoved={async () => {
                await api.updateAdminProfile({ photo_url: '' });
                if (user) user.photo_url = undefined;
              }}
              label={profile?.name || user?.name || 'Administrator'}
              subLabel={user?.email || 'System Founder Desk'}
            />
            <div className="border-t sm:border-t-0 sm:border-l border-slate-200 sm:pl-4 pt-2 sm:pt-0">
              <h2 className="text-lg font-black text-[#1C1938]">Tutor Eligibility Review Desk</h2>
              <p className="text-xs text-[#686487] mt-0.5 max-w-md">
                Manual verification: Review qualifications, degrees, and proposed monthly fees.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ClayButton
              variant="secondary"
              size="sm"
              onClick={() => {
                fetchStats();
                fetchApplications();
                fetchStudents();
                fetchPayments();
                fetchRequests();
                fetchBatches();
                fetchAuditLogs();
              }}
              isLoading={isLoading || isLoadingStudents || isLoadingPayments || isLoadingBatches}
              className="flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh All
            </ClayButton>
          </div>
        </ClayCard>

        {/* Section Navigation Tabs: 7 Organized Mobile-First Sections */}
        <div className="flex items-center gap-2 border-b border-[#DFD8F3] pb-3 overflow-x-auto select-none scrollbar-none">
          {/* 1. Overview */}
          <button
            type="button"
            onClick={() => setMainSection('dashboard')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              mainSection === 'dashboard'
                ? 'bg-[#312E81] text-white shadow-sm'
                : 'bg-white text-[#686487] border border-[#DFD8F3] hover:text-[#1C1938]'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Overview</span>
          </button>

          {/* 2. Students */}
          <button
            type="button"
            onClick={() => setMainSection('students')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              mainSection === 'students'
                ? 'bg-[#312E81] text-white shadow-sm'
                : 'bg-white text-[#686487] border border-[#DFD8F3] hover:text-[#1C1938]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Students ({students.length || adminStats.total_students})</span>
          </button>

          {/* 3. Tutors & Approvals */}
          <button
            type="button"
            onClick={() => setMainSection('applications')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              mainSection === 'applications' || mainSection === 'tutors'
                ? 'bg-[#312E81] text-white shadow-sm'
                : 'bg-white text-[#686487] border border-[#DFD8F3] hover:text-[#1C1938]'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Tutors & Approvals ({applications.length})</span>
          </button>

          {/* 4. Batch Management */}
          <button
            type="button"
            onClick={() => setMainSection('batches')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              mainSection === 'batches'
                ? 'bg-[#312E81] text-white shadow-sm'
                : 'bg-white text-[#686487] border border-[#DFD8F3] hover:text-[#1C1938]'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Batch Management (Batches) ({displayBatches.length || adminStats.active_batches})</span>
          </button>

          {/* 5. Enrollment Requests */}
          <button
            type="button"
            onClick={() => setMainSection('requests')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              mainSection === 'requests' || mainSection === 'inquiries'
                ? 'bg-[#312E81] text-white shadow-sm'
                : 'bg-white text-[#686487] border border-[#DFD8F3] hover:text-[#1C1938]'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Enrollment Requests ({requests.length || adminStats.total_requests})</span>
          </button>

          {/* 6. Payments */}
          <button
            type="button"
            onClick={() => setMainSection('payments')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              mainSection === 'payments'
                ? 'bg-[#312E81] text-white shadow-sm'
                : 'bg-white text-[#686487] border border-[#DFD8F3] hover:text-[#1C1938]'
            }`}
          >
            <IndianRupee className="w-4 h-4" />
            <span>Payments ({payments.length || adminStats.payment_interests})</span>
          </button>

          {/* 7. App Analytics */}
          <button
            type="button"
            onClick={() => setMainSection('audit')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              mainSection === 'audit'
                ? 'bg-[#312E81] text-white shadow-sm'
                : 'bg-white text-[#686487] border border-[#DFD8F3] hover:text-[#1C1938]'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>App Analytics & Audit ({auditLogs.length})</span>
          </button>
        </div>

        {statusMessage && (
          <div className="p-4 rounded-2xl bg-[#EEECFB] border border-[#A7AAE5] text-xs font-bold text-[#312E81] flex items-center gap-2">
            <Check className="w-4 h-4 text-[#4136CA]" />
            {statusMessage}
          </div>
        )}

        {/* SECTION 0: ADMINISTRATIVE OVERVIEW DASHBOARD */}
        {mainSection === 'dashboard' && (
          <div className="space-y-6 text-left">
            {/* 6 Real Summary Metric Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <ClayCard className="p-4 border border-[#DFD8F3] bg-white flex flex-col justify-between">
                <div className="flex items-center justify-between text-[#4136CA] mb-2">
                  <span className="text-[11px] font-bold text-[#686487]">Students</span>
                  <Users className="w-4 h-4" />
                </div>
                <div className="text-2xl font-black text-[#1C1938]">
                  {adminStats.total_students || students.length}
                </div>
                <span className="text-[10px] text-emerald-600 font-bold mt-1">Registered</span>
              </ClayCard>

              <ClayCard className="p-4 border border-[#DFD8F3] bg-white flex flex-col justify-between">
                <div className="flex items-center justify-between text-emerald-600 mb-2">
                  <span className="text-[11px] font-bold text-[#686487]">Tutors</span>
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div className="text-2xl font-black text-[#1C1938]">
                  {adminStats.approved_tutors || applications.filter((a) => a.status === 'approved').length}
                </div>
                <span className="text-[10px] text-emerald-600 font-bold mt-1">Verified</span>
              </ClayCard>

              <ClayCard className="p-4 border border-[#DFD8F3] bg-white flex flex-col justify-between">
                <div className="flex items-center justify-between text-amber-600 mb-2">
                  <span className="text-[11px] font-bold text-[#686487]">Pending</span>
                  <Clock className="w-4 h-4" />
                </div>
                <div className="text-2xl font-black text-[#1C1938]">
                  {adminStats.pending_applications ||
                    applications.filter((a) => a.status === 'pending' || a.status === 'pending_review').length}
                </div>
                <span className="text-[10px] text-amber-600 font-bold mt-1">Awaiting Review</span>
              </ClayCard>

              <ClayCard className="p-4 border border-[#DFD8F3] bg-white flex flex-col justify-between">
                <div className="flex items-center justify-between text-purple-600 mb-2">
                  <span className="text-[11px] font-bold text-[#686487]">Batches</span>
                  <BookOpen className="w-4 h-4" />
                </div>
                <div className="text-2xl font-black text-[#1C1938]">
                  {adminStats.active_batches || derivedBatches.length}
                </div>
                <span className="text-[10px] text-purple-600 font-bold mt-1">Max 4 / batch</span>
              </ClayCard>

              <ClayCard className="p-4 border border-[#DFD8F3] bg-white flex flex-col justify-between">
                <div className="flex items-center justify-between text-indigo-600 mb-2">
                  <span className="text-[11px] font-bold text-[#686487]">Inquiries</span>
                  <Send className="w-4 h-4" />
                </div>
                <div className="text-2xl font-black text-[#1C1938]">
                  {adminStats.total_requests || requests.length}
                </div>
                <span className="text-[10px] text-indigo-600 font-bold mt-1">Student Requests</span>
              </ClayCard>

              <ClayCard className="p-4 border border-[#DFD8F3] bg-white flex flex-col justify-between">
                <div className="flex items-center justify-between text-rose-600 mb-2">
                  <span className="text-[11px] font-bold text-[#686487]">Payments</span>
                  <IndianRupee className="w-4 h-4" />
                </div>
                <div className="text-2xl font-black text-[#1C1938]">
                  {adminStats.payment_interests || payments.length}
                </div>
                <span className="text-[10px] text-rose-600 font-bold mt-1">Coordination Desk</span>
              </ClayCard>
            </div>

            {/* Quick Action Navigation Desk Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ClayCard className="p-5 border border-[#DFD8F3] bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#EDE9FE] flex items-center justify-center text-[#4136CA]">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-[#1C1938]">Tutor Verification Desk</h3>
                      <p className="text-[11px] text-[#686487]">Vet tutor degrees, certificates & approve fees</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                    {applications.filter((a) => a.status === 'pending' || a.status === 'pending_review').length} Pending
                  </span>
                </div>
                <p className="text-xs text-[#4A4668]">
                  Review applicant degrees, institutional background, teaching subjects, and standardized monthly tuition.
                </p>
                <div className="pt-1">
                  <ClayButton
                    variant="primary"
                    size="sm"
                    onClick={() => setMainSection('applications')}
                    className="w-full flex items-center justify-center gap-1.5"
                  >
                    <span>Open Tutor Review Desk</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </ClayButton>
                </div>
              </ClayCard>

              <ClayCard className="p-5 border border-[#DFD8F3] bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
                      <IndianRupee className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-[#1C1938]">Manual Payments Desk</h3>
                      <p className="text-[11px] text-[#686487]">Guardian fee coordination & 10% platform fee</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold">
                    {payments.length} Records
                  </span>
                </div>
                <p className="text-xs text-[#4A4668]">
                  Verify direct guardian payment transfers, update settlement statuses, and log administrative audit trails.
                </p>
                <div className="pt-1">
                  <ClayButton
                    variant="secondary"
                    size="sm"
                    onClick={() => setMainSection('payments')}
                    className="w-full flex items-center justify-center gap-1.5"
                  >
                    <span>Open Payments Desk</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </ClayButton>
                </div>
              </ClayCard>

              <ClayCard className="p-5 border border-[#DFD8F3] bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-[#1C1938]">Batch Capacity & Schedules</h3>
                      <p className="text-[11px] text-[#686487]">Micro-batch rule enforcement (Max 4 students)</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold">
                    {derivedBatches.length || adminStats.active_batches} Batches
                  </span>
                </div>
                <p className="text-xs text-[#4A4668]">
                  Supervise active 3-hour study blocks (Mon · Wed · Fri / Tue · Thu · Sat) and student allocations.
                </p>
                <div className="pt-1">
                  <ClayButton
                    variant="secondary"
                    size="sm"
                    onClick={() => setMainSection('batches')}
                    className="w-full flex items-center justify-center gap-1.5"
                  >
                    <span>View Batch Capacity Monitor</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </ClayButton>
                </div>
              </ClayCard>

              <ClayCard className="p-5 border border-[#DFD8F3] bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-[#4136CA]">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-[#1C1938]">Student Registry & Export</h3>
                      <p className="text-[11px] text-[#686487]">Karnataka school students & curriculum boards</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-indigo-100 text-[#4136CA] text-[10px] font-bold">
                    {students.length} Registered
                  </span>
                </div>
                <p className="text-xs text-[#4A4668]">
                  Search student records by class (1–10), curriculum board, guardian contact, and export CSV rosters.
                </p>
                <div className="pt-1">
                  <ClayButton
                    variant="secondary"
                    size="sm"
                    onClick={() => setMainSection('students')}
                    className="w-full flex items-center justify-center gap-1.5"
                  >
                    <span>Open Student Directory</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </ClayButton>
                </div>
              </ClayCard>
            </div>
          </div>
        )}

        {/* SECTION: APPROVED TUTOR MANAGEMENT */}
        {mainSection === 'tutors' && (
          <div className="space-y-4 text-left">
            <ClayCard className="p-5 border border-[#DFD8F3] space-y-4 bg-white">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DFD8F3] pb-3">
                <div>
                  <h3 className="text-lg font-black text-[#1C1938] flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-[#4136CA]" />
                    Approved Tutor Management
                  </h3>
                  <p className="text-xs text-[#686487]">
                    Directory of verified educators mentoring Karnataka school students in 3-hour micro-batches.
                  </p>
                </div>
                <ClayButton
                  variant="secondary"
                  size="sm"
                  onClick={() => setMainSection('applications')}
                  className="flex items-center gap-1.5"
                >
                  <span>Review Applications ({applications.filter((a) => a.status === 'pending' || a.status === 'pending_review').length})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </ClayButton>
              </div>

              {applications.filter((a) => a.status === 'approved').length === 0 ? (
                <div className="p-8 text-center text-xs text-[#686487]">
                  No approved tutors currently active. Go to Applications tab to review and approve educators.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {applications
                    .filter((a) => a.status === 'approved')
                    .map((tutor) => (
                      <div
                        key={tutor.id}
                        className="p-4 rounded-2xl bg-[#F8F7FD] border border-[#DFD8F3] space-y-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="font-extrabold text-sm text-[#1C1938]">
                              {tutor.tutor_profile?.name || 'Verified Tutor'}
                            </h4>
                            <span className="text-xs font-semibold text-[#4136CA]">
                              {tutor.course_qualification || tutor.education_level}
                            </span>
                          </div>
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            Verified Mentor
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs bg-white p-2.5 rounded-xl border border-[#DFD8F3]">
                          <div>
                            <span className="text-[10px] text-[#686487] block">Monthly Fee</span>
                            <span className="font-bold text-[#1C1938]">
                              ₹{Number(tutor.fee_amount || 3000).toLocaleString('en-IN')}/mo
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-[#686487] block">Experience</span>
                            <span className="font-bold text-[#1C1938]">
                              {tutor.teaching_experience || 'Qualified Educator'}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-[#686487] block">Subjects</span>
                            <span className="font-bold text-[#1C1938] truncate block">
                              {(tutor.subjects || []).join(', ') || 'Core Subjects'}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-[#686487] block">Contact</span>
                            <span className="font-bold text-[#4136CA] truncate block">
                              {tutor.tutor_profile?.phone || tutor.tutor_profile?.email || 'N/A'}
                            </span>
                          </div>
                        </div>

                        <div className="pt-1 flex items-center justify-between text-[11px] text-[#686487]">
                          <span>Board: {(tutor.board_familiarity || ['Karnataka State Board']).join(', ')}</span>
                          <span className="text-emerald-700 font-bold">Approved Educator</span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </ClayCard>
          </div>
        )}

        {/* SECTION: TUTOR APPLICATIONS DESK */}
        {mainSection === 'applications' && (
          <div className="space-y-4">
            {/* Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 select-none">
              {(['pending', 'approved', 'rejected', 'all'] as const).map((tab) => {
                const count = applications.filter((a) => {
                  if (tab === 'all') return true;
                  if (tab === 'pending') return a.status === 'pending' || a.status === 'pending_review';
                  return a.status === tab;
                }).length;

                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
                      activeTab === tab
                        ? 'bg-[#312E81] text-white shadow-xs'
                        : 'bg-white text-[#4A4668] border border-[#DFD8F3] hover:border-[#A7AAE5]'
                    }`}
                  >
                    <span className="capitalize">{tab}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === tab ? 'bg-white/20' : 'bg-[#F3EFFB]'}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Split Desk Layout */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* Applications List */}
              <div className="md:col-span-5 space-y-3">
                {isLoading ? (
                  <div className="p-8 text-center text-xs text-[#686487]">Loading tutor applications...</div>
                ) : filteredApps.length === 0 ? (
                  <ClayCard className="p-8 text-center text-xs text-[#686487] border border-[#DFD8F3]">
                    No applications found in the &apos;{activeTab}&apos; tab.
                  </ClayCard>
                ) : (
                  filteredApps.map((app) => {
                    const isSelected = selectedApp?.id === app.id;
                    const isPending = app.status === 'pending' || app.status === 'pending_review';
                    const feeDisplay = Number(app.fee_amount || app.proposed_rate || 3000).toLocaleString('en-IN');
                    return (
                      <button
                        key={app.id}
                        type="button"
                        onClick={() => {
                          setSelectedApp(app);
                          setApprovedFeeInput(String(app.fee_amount || 3000));
                        }}
                        className={`w-full text-left p-4 rounded-2xl border transition-all ${
                          isSelected
                            ? 'bg-white border-[#312E81] shadow-clay ring-2 ring-[#312E81]/10'
                            : 'bg-white border-[#DFD8F3] hover:border-[#A7AAE5]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h4 className="font-extrabold text-sm text-[#1C1938] truncate">
                              {app.tutor_profile?.name || 'Tutor Applicant'}
                            </h4>
                            <p className="text-[11px] text-[#686487] truncate mt-0.5 font-medium">
                              {app.course_qualification || app.education_level}
                            </p>
                          </div>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                              app.status === 'approved'
                                ? 'bg-emerald-100 text-emerald-800'
                                : app.status === 'rejected'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {isPending ? 'Pending' : app.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[#F3EFFB] text-[10px] text-[#686487]">
                          <span>₹{feeDisplay} / month</span>
                          <span>•</span>
                          <span>{app.hours_per_day || 2} hrs/day</span>
                          <span>•</span>
                          <span className="truncate">{(app.subjects || []).join(', ')}</span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              {/* Application Detail & Decision Desk */}
              <div className="md:col-span-7">
                {selectedApp ? (
                  <ClayCard className="p-6 text-left space-y-5 border border-[#DFD8F3] shadow-clay bg-white">
                    <div className="flex items-start justify-between border-b border-[#E6E1F7] pb-4">
                      <div>
                        <h3 className="text-xl font-black text-[#1C1938]">
                          {selectedApp.tutor_profile?.name || 'Applicant Details'}
                        </h3>
                        <div className="flex items-center gap-3 mt-1 text-xs text-[#686487]">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5" />
                            {selectedApp.tutor_profile?.email || 'N/A'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5" />
                            {selectedApp.tutor_profile?.phone || 'N/A'}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
                          selectedApp.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : selectedApp.status === 'rejected'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {selectedApp.status === 'pending_review' ? 'Pending' : selectedApp.status}
                      </span>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-[#F8F7FD] border border-[#DFD8F3]">
                        <span className="text-[#686487] block text-[10px] font-bold uppercase">Qualification</span>
                        <span className="font-bold text-[#1C1938]">{selectedApp.course_qualification}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-[#F8F7FD] border border-[#DFD8F3]">
                        <span className="text-[#686487] block text-[10px] font-bold uppercase">Institution</span>
                        <span className="font-bold text-[#1C1938]">{selectedApp.institution_name}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-[#F8F7FD] border border-[#DFD8F3]">
                        <span className="text-[#686487] block text-[10px] font-bold uppercase">Subjects</span>
                        <span className="font-bold text-[#312E81]">{(selectedApp.subjects || []).join(', ')}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-[#F8F7FD] border border-[#DFD8F3]">
                        <span className="text-[#686487] block text-[10px] font-bold uppercase">Requested Fee</span>
                        <span className="font-bold text-[#312E81]">₹{Number(selectedApp.fee_amount || 3000).toLocaleString('en-IN')} / month</span>
                      </div>
                      <div className="p-3 rounded-xl bg-[#F8F7FD] border border-[#DFD8F3]">
                        <span className="text-[#686487] block text-[10px] font-bold uppercase">Daily Availability</span>
                        <span className="font-bold text-[#1C1938]">{selectedApp.hours_per_day || 2} hours/day</span>
                      </div>
                      <div className="p-3 rounded-xl bg-[#F8F7FD] border border-[#DFD8F3]">
                        <span className="text-[#686487] block text-[10px] font-bold uppercase">Experience</span>
                        <span className="font-bold text-[#1C1938]">{selectedApp.teaching_experience ? `${selectedApp.teaching_experience} years` : 'Fresh Educator'}</span>
                      </div>
                    </div>

                    {/* Bio / Approach */}
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#686487]">
                        Teaching Bio & Approach:
                      </span>
                      <p className="text-xs text-[#1C1938] leading-relaxed p-3.5 rounded-xl bg-[#F8F7FD] border border-[#DFD8F3]">
                        {selectedApp.bio_intro || 'No bio provided'}
                      </p>
                    </div>

                    {/* Monthly Fee Control */}
                    <div className="p-3.5 rounded-2xl bg-[#EDE9FE] border border-[#DDD6FE] space-y-2">
                      <label htmlFor="approved-fee-input" className="block text-xs font-bold text-[#5B21B6]">
                        Admin Approved Monthly Fee (₹)
                      </label>
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-2.5 text-xs text-slate-500 font-bold">₹</span>
                          <input
                            id="approved-fee-input"
                            type="number"
                            min="100"
                            max="3000"
                            step="100"
                            value={approvedFeeInput}
                            onChange={(e) => setApprovedFeeInput(e.target.value)}
                            className="clay-input pl-7 text-xs font-bold w-full"
                          />
                        </div>
                        {selectedApp.status === 'approved' && (
                          <ClayButton
                            size="sm"
                            variant="primary"
                            isLoading={isUpdatingFee}
                            onClick={handleUpdateApprovedFee}
                            icon={<Edit2 className="w-3.5 h-3.5" />}
                          >
                            Update Fee
                          </ClayButton>
                        )}
                      </div>
                    </div>

                    {/* Review Action Form */}
                    <div className="pt-2 border-t border-[#E6E1F7] space-y-3">
                      <div>
                        <label htmlFor="admin-feedback-msg" className="block text-[11px] font-bold text-[#4A4668] mb-1">
                          Applicant Message / Feedback
                        </label>
                        <textarea
                          id="admin-feedback-msg"
                          rows={2}
                          value={applicantMessage}
                          onChange={(e) => setApplicantMessage(e.target.value)}
                          placeholder="e.g. Approved with ₹3,000 monthly fee for State Board Classes 6-8."
                          className="w-full p-2.5 rounded-xl border border-[#DFD8F3] text-xs text-[#1C1938] focus:outline-none focus:ring-2 focus:ring-[#312E81]"
                        />
                      </div>

                      <div className="flex items-center gap-3 pt-2">
                        <ClayButton
                          type="button"
                          variant="primary"
                          size="md"
                          isLoading={isProcessing}
                          disabled={selectedApp.status === 'approved'}
                          onClick={() => handleStatusUpdate('approved')}
                          className="flex-1 flex items-center justify-center gap-1.5 rounded-full py-3 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white"
                        >
                          <Check className="w-4 h-4" />
                          Approve Application
                        </ClayButton>

                        <ClayButton
                          type="button"
                          variant="secondary"
                          size="md"
                          isLoading={isProcessing}
                          disabled={selectedApp.status === 'rejected'}
                          onClick={() => handleStatusUpdate('rejected')}
                          className="flex-1 flex items-center justify-center gap-1.5 rounded-full py-3 text-xs font-bold text-rose-700 border-rose-300 hover:bg-rose-50"
                        >
                          <X className="w-4 h-4" />
                          Reject Application
                        </ClayButton>
                      </div>
                    </div>
                  </ClayCard>
                ) : (
                  <div className="p-12 text-center text-xs text-[#686487] rounded-3xl bg-white border border-[#DFD8F3]">
                    Select an applicant from the list to review details and set verification status.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: MANUAL PAYMENT COORDINATION DESK */}
        {mainSection === 'payments' && (
          <div className="space-y-4 text-left">
            <ClayCard className="p-5 border border-[#DFD8F3] space-y-4 bg-white">
              <div className="flex items-center justify-between border-b border-[#DFD8F3] pb-3">
                <div>
                  <h3 className="text-lg font-black text-[#1C1938] flex items-center gap-2">
                    <IndianRupee className="w-5 h-5 text-[#7C3AED]" />
                    Manual Payment Coordination Desk
                  </h3>
                  <p className="text-xs text-[#686487]">
                    Students who clicked &quot;I&apos;m Interested in Proceeding with Payment&quot;. Verify and record manual payments.
                  </p>
                </div>
                <span className="text-xs font-bold text-[#7C3AED] bg-[#EDE9FE] px-3 py-1 rounded-full">
                  {payments.length} Records
                </span>
              </div>

              {isLoadingPayments ? (
                <div className="p-8 text-center text-xs text-[#686487]">Loading payment coordinations...</div>
              ) : payments.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#686487]">
                  No student payment interests recorded yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {payments.map((pay) => {
                    const isEditing = editingPaymentId === pay.id;

                    return (
                      <div
                        key={pay.id}
                        className="p-4 rounded-2xl bg-[#F8F7FD] border border-[#DFD8F3] space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <span className="text-sm font-black text-[#1C1938]">
                              Student: {pay.student_name}
                            </span>
                            <span className="text-xs text-[#686487] ml-2 font-semibold">
                              (Tutor: {pay.tutor_name})
                            </span>
                          </div>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase self-start sm:self-auto ${
                              pay.status === 'paid_verified'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : pay.status === 'contacted'
                                ? 'bg-blue-100 text-blue-800 border border-blue-300'
                                : 'bg-amber-100 text-amber-800 border border-amber-300'
                            }`}
                          >
                            {pay.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-[#4A4668]">
                          <div>
                            <span className="text-slate-500 block text-[10px] uppercase font-bold">Student Phone</span>
                            <a href={`tel:${pay.student_phone}`} className="font-bold text-[#4136CA]">
                              {pay.student_phone}
                            </a>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[10px] uppercase font-bold">Tutor Phone</span>
                            <a href={`tel:${pay.tutor_phone}`} className="font-bold text-[#4136CA]">
                              {pay.tutor_phone}
                            </a>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[10px] uppercase font-bold">Batch</span>
                            <span className="font-semibold">{pay.batch_name || 'Individual Session'}</span>
                          </div>
                        </div>

                        {isEditing ? (
                          <div className="p-3 rounded-xl bg-white border border-[#DFD8F3] space-y-3 mt-2">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[11px] font-bold text-[#1C1938] mb-1">Status</label>
                                <select
                                  value={paymentStatusUpdate}
                                  onChange={(e) => setPaymentStatusUpdate(e.target.value)}
                                  className="clay-input text-xs w-full"
                                >
                                  <option value="interest_expressed">Interest Expressed</option>
                                  <option value="contacted">Guardian Contacted</option>
                                  <option value="paid_verified">Paid & Verified</option>
                                  <option value="cancelled">Cancelled</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-[11px] font-bold text-[#1C1938] mb-1">
                                  Amount Collected (₹)
                                </label>
                                <input
                                  type="number"
                                  value={paymentAmountUpdate}
                                  onChange={(e) => setPaymentAmountUpdate(e.target.value)}
                                  className="clay-input text-xs w-full"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-[#1C1938] mb-1">Admin Notes</label>
                              <input
                                type="text"
                                placeholder="e.g. Guardian confirmed via phone; cash collected."
                                value={paymentNotesUpdate}
                                onChange={(e) => setPaymentNotesUpdate(e.target.value)}
                                className="clay-input text-xs w-full"
                              />
                            </div>

                            <div className="flex justify-end gap-2 pt-1">
                              <ClayButton
                                size="sm"
                                variant="secondary"
                                onClick={() => setEditingPaymentId(null)}
                              >
                                Cancel
                              </ClayButton>
                              <ClayButton
                                size="sm"
                                variant="primary"
                                onClick={() => handleSavePaymentCoordination(pay.id)}
                              >
                                Save Status
                              </ClayButton>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between pt-2 border-t border-[#DFD8F3]">
                            <div className="text-xs text-slate-600">
                              Amount: <strong>₹{pay.amount_collected || pay.fee || 3000}</strong>
                              {pay.admin_notes && (
                                <span className="ml-2 italic text-slate-500">• Note: {pay.admin_notes}</span>
                              )}
                            </div>
                            <ClayButton
                              size="sm"
                              variant="secondary"
                              onClick={() => {
                                setEditingPaymentId(pay.id);
                                setPaymentStatusUpdate(pay.status);
                                setPaymentAmountUpdate(String(pay.amount_collected || pay.fee || 3000));
                                setPaymentNotesUpdate(pay.admin_notes || '');
                              }}
                              icon={<Edit2 className="w-3.5 h-3.5" />}
                            >
                              Update
                            </ClayButton>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </ClayCard>
          </div>
        )}

        {/* SECTION 3: INQUIRIES & REQUESTS */}
        {(mainSection === 'requests' || mainSection === 'inquiries') && (
          <div className="space-y-4 text-left">
            <ClayCard className="p-5 border border-[#DFD8F3] space-y-4 bg-white">
              <div className="flex items-center justify-between border-b border-[#DFD8F3] pb-3">
                <div>
                  <h3 className="text-lg font-black text-[#1C1938] flex items-center gap-2">
                    <Clock className="w-5 h-5 text-[#4136CA]" />
                    All Platform Inquiries & Batch Allocations
                  </h3>
                  <p className="text-xs text-[#686487]">
                    Monitor student-to-tutor applications, subject alignment, and batch seat capacity.
                  </p>
                </div>
                <span className="text-xs font-bold text-[#4136CA] bg-[#EFEAFF] px-3 py-1 rounded-full">
                  {requests.length} Total
                </span>
              </div>

              {isLoadingRequests ? (
                <div className="p-8 text-center text-xs text-[#686487]">Loading inquiries...</div>
              ) : requests.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#686487]">No student requests recorded yet.</div>
              ) : (
                <div className="space-y-3">
                  {requests.map((req) => (
                    <div
                      key={req.id}
                      className="p-4 rounded-2xl bg-[#F8F7FD] border border-[#DFD8F3] space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-[#1C1938]">
                            {req.student_name} → {req.tutor_name}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
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
                        <span className="text-[10px] text-slate-400">
                          {new Date(req.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="text-xs text-slate-600 space-y-1">
                        <p>
                          <strong>Subject:</strong> {req.subject} • <strong>Class:</strong> {req.class_level}
                          {req.batch_name && (
                            <span className="ml-2 font-bold text-[#4136CA]">
                              • Batch: {req.batch_name} ({req.batch_time || '3 hrs'})
                            </span>
                          )}
                        </p>
                        <p className="p-2 rounded-xl bg-white border border-[#DFD8F3] text-slate-700">
                          &quot;{req.learning_needs}&quot;
                        </p>
                        {(req.batch_id || req.batch_name) && req.status === 'accepted' && (
                          <div className="pt-1 flex justify-end">
                            <button
                              type="button"
                              onClick={() => {
                                setStudentRemovalTarget({
                                  requestId: req.id,
                                  studentName: req.student_name,
                                  tutorName: req.tutor_name,
                                  batchId: req.batch_id || 'direct',
                                  batchName: req.batch_name || 'Academic Batch',
                                });
                                setRemovalReason('payment_not_completed');
                                setRemovalNote('');
                              }}
                              className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
                              title={`Remove ${req.student_name} from batch`}
                            >
                              <UserMinus className="w-3.5 h-3.5" />
                              Remove Student from Batch
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ClayCard>
          </div>
        )}

        {/* SECTION: BATCH CAPACITY MONITOR */}
        {mainSection === 'batches' && (
          <div className="space-y-4 text-left">
            <ClayCard className="p-5 border border-[#DFD8F3] space-y-4 bg-white">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DFD8F3] pb-3">
                <div>
                  <h3 className="text-lg font-black text-[#1C1938] flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-[#4136CA]" />
                    Academic Micro-Batches & Capacity
                  </h3>
                  <p className="text-xs text-[#686487]">
                    Monitoring 4-student maximum capacity, 3-hour fixed schedules, and verified tutor batch ownership.
                  </p>
                </div>
                <span className="text-xs font-bold text-[#4136CA] bg-[#EFEAFF] px-3 py-1 rounded-full self-start sm:self-auto">
                  {displayBatches.length} Monitored Batches
                </span>
              </div>

              {displayBatches.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#686487]">
                  No active student batch allocations found. When tutors create batches and accept students, they appear here.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {displayBatches.map((batch, idx) => {
                    const isFull = batch.enrolledCount >= 4;
                    const availableSeats = Math.max(0, 4 - batch.enrolledCount);
                    const bNumber = `BATCH ${String(idx + 1).padStart(2, '0')}`;
                    return (
                      <div
                        key={batch.id}
                        className="p-4 rounded-2xl bg-[#F8F7FD] border border-[#DFD8F3] space-y-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-black tracking-wider text-[#4136CA] bg-[#EDE9FE] px-2 py-0.5 rounded-lg">
                                {bNumber}
                              </span>
                              <h4 className="font-extrabold text-sm text-[#1C1938] truncate">{batch.name}</h4>
                            </div>
                            <p className="text-xs font-semibold text-[#4136CA] mt-0.5">
                              Mentor: {batch.tutorName}
                              {batch.tutorPhone && (
                                <span className="ml-1 text-[11px] text-[#686487]">({batch.tutorPhone})</span>
                              )}
                            </p>
                          </div>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              isFull
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {isFull ? 'Batch Full (4/4)' : `Active (${batch.enrolledCount}/4) · ${availableSeats} Available`}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs bg-white p-2.5 rounded-xl border border-[#DFD8F3]">
                          <div>
                            <span className="text-[10px] text-[#686487] block">Schedule</span>
                            <span className="font-bold text-[#1C1938]">{batch.days || 'Mon · Wed · Fri'}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-[#686487] block">Time & Duration</span>
                            <span className="font-bold text-[#1C1938]">
                              {batch.startTime || '16:00'} – {batch.endTime || '19:00'} (3 hrs)
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-[#686487] block">Subject</span>
                            <span className="font-bold text-[#1C1938]">{batch.subject}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-[#686487] block">Class Level</span>
                            <span className="font-bold text-[#1C1938]">{batch.classLevel}</span>
                          </div>
                        </div>

                        {/* Capacity Progress Bar */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-[#4A4668]">Seat Capacity</span>
                            <span className="font-bold text-[#1C1938]">
                              {batch.enrolledCount} of 4 seats filled ({availableSeats} available)
                            </span>
                          </div>
                          <div className="w-full bg-[#E5DFF8] rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${
                                isFull ? 'bg-rose-500' : 'bg-[#4136CA]'
                              }`}
                              style={{ width: `${Math.min(100, (batch.enrolledCount / 4) * 100)}%` }}
                            />
                          </div>
                        </div>

                        {/* Interactive Open Batch & Manage Students CTA */}
                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={() => setSelectedBatchModal(batch)}
                            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#EDE9FE] hover:bg-[#DDD6FE] text-[#4136CA] font-extrabold text-xs transition-colors cursor-pointer border border-[#DDD6FE]"
                          >
                            <span className="flex items-center gap-1.5">
                              <BookOpen className="w-4 h-4" />
                              Select / Open Batch ({batch.enrolledCount}/4 Enrolled)
                            </span>
                            <span className="text-[11px] font-bold underline">Manage Roster →</span>
                          </button>
                        </div>

                        {/* Students in Batch */}
                        {batch.students.length === 0 ? (
                          <div className="pt-2 border-t border-[#DFD8F3]">
                            <div className="p-2.5 text-center text-[11px] text-[#686487] bg-white rounded-xl border border-[#DFD8F3]">
                              No students currently enrolled in this batch. (4 seats available)
                            </div>
                          </div>
                        ) : (
                          <div className="pt-2 border-t border-[#DFD8F3] space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black uppercase tracking-wider text-[#686487]">
                                Enrolled Students ({batch.students.length})
                              </span>
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                                {batch.enrolledCount} Active
                              </span>
                            </div>
                            <div className="space-y-2">
                              {batch.students.map((st, idx) => (
                                <div
                                  key={st.id || idx}
                                  className="p-3 rounded-xl bg-white border border-[#DFD8F3] shadow-xs space-y-2 text-left"
                                >
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                                    <div className="space-y-1 text-xs min-w-0">
                                      <div className="flex items-center gap-2">
                                        <span className="text-[#686487] font-semibold text-[11px]">Student:</span>
                                        <span className="font-extrabold text-sm text-[#1C1938]">{st.name}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-[#686487] font-semibold text-[11px]">Class:</span>
                                        <span className="font-bold text-[#1C1938]">
                                          {st.classLevel || batch.classLevel || 'Class 8'}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-[#686487] font-semibold text-[11px]">Enrollment:</span>
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800">
                                          Active
                                        </span>
                                        {st.phone && <span className="text-[11px] text-[#686487]">({st.phone})</span>}
                                      </div>
                                    </div>

                                    {/* Prominent, unconditional Remove Student action */}
                                    <div className="flex items-center gap-2 pt-1 sm:pt-0">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setStudentRemovalTarget({
                                            requestId: st.requestId || st.id,
                                            studentName: st.name,
                                            tutorName: batch.tutorName,
                                            batchId: batch.id,
                                            batchName: batch.name,
                                          });
                                          setRemovalReason('payment_not_completed');
                                          setRemovalNote('');
                                        }}
                                        className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                                        aria-label={`Remove Student ${st.name}`}
                                      >
                                        <UserMinus className="w-3.5 h-3.5" />
                                        Remove Student
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </ClayCard>
          </div>
        )}

        {/* SECTION 4: REGISTERED STUDENTS LIST & EXPORT */}
        {mainSection === 'students' && (
          <div className="space-y-4 text-left">
            <ClayCard className="p-5 border border-[#DFD8F3] space-y-4 bg-white">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DFD8F3] pb-3">
                <div>
                  <h3 className="text-lg font-black text-[#1C1938]">Registered School Students</h3>
                  <p className="text-xs text-[#686487]">
                    Directory of registered students, classes, curriculum boards, and guardian contacts
                  </p>
                </div>
                <ClayButton
                  variant="secondary"
                  size="sm"
                  onClick={exportStudentsCsv}
                  className="flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export CSV
                </ClayButton>
              </div>

              {/* Search Bar */}
              <div className="flex items-center gap-2 bg-[#F8F7FD] border border-[#DFD8F3] rounded-2xl px-3 py-2">
                <Search className="w-4 h-4 text-[#8B5CF6]" />
                <input
                  type="text"
                  aria-label="Search students"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchStudents()}
                  placeholder="Filter by name, email, or phone..."
                  className="w-full bg-transparent text-xs font-semibold text-[#1C1938] focus:outline-none"
                />
              </div>

              {/* Students Grid */}
              {isLoadingStudents ? (
                <div className="p-8 text-center text-xs text-[#686487]">Loading registered students...</div>
              ) : students.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#686487]">No students found.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {students.map((student) => (
                    <div
                      key={student.id}
                      className="p-4 rounded-2xl bg-[#F8F7FD] border border-[#DFD8F3] space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-extrabold text-sm text-[#1C1938]">{student.name}</h4>
                          <span className="text-[11px] text-[#6D28D9] font-bold">
                            {student.class_level || 'School Student'} • {student.board || 'State Board'}
                          </span>
                        </div>
                        <span className="text-[10px] font-semibold text-[#686487] bg-white px-2 py-0.5 rounded-full border border-[#DFD8F3]">
                          {student.learning_language || 'Kannada'}
                        </span>
                      </div>

                      <div className="space-y-1 text-xs text-[#4A4668]">
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-[#8B5CF6]" />
                          <span>{student.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-[#8B5CF6]" />
                          <span>{student.phone}</span>
                          {student.guardian_phone && (
                            <span className="text-[10px] text-[#686487]">(Guardian: {student.guardian_phone})</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-3.5 h-3.5 text-[#8B5CF6]" />
                          <span className="font-medium truncate">Subjects: {(student.subjects || []).join(', ') || 'General'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-[#9CA3AF]">
                          <Calendar className="w-3 h-3" />
                          <span>Joined: {student.created_at ? new Date(student.created_at).toLocaleDateString() : 'Recent'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ClayCard>
          </div>
        )}

        {/* SECTION 5: AUDIT LOGS */}
        {mainSection === 'audit' && (
          <div className="space-y-4 text-left">
            <ClayCard className="p-5 border border-[#DFD8F3] space-y-4 bg-white">
              <div className="flex items-center justify-between border-b border-[#DFD8F3] pb-3">
                <div>
                  <h3 className="text-lg font-black text-[#1C1938] flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[#7C3AED]" />
                    Administrator Audit Trail
                  </h3>
                  <p className="text-xs text-[#686487]">
                    Immutable log of administrative actions, fee adjustments, and credential verifications.
                  </p>
                </div>
                <span className="text-xs font-bold text-[#7C3AED] bg-[#EDE9FE] px-3 py-1 rounded-full">
                  {auditLogs.length} Events
                </span>
              </div>

              {isLoadingAudit ? (
                <div className="p-8 text-center text-xs text-[#686487]">Loading audit logs...</div>
              ) : auditLogs.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#686487]">No audit logs recorded yet.</div>
              ) : (
                <div className="space-y-2.5">
                  {auditLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3.5 rounded-xl bg-[#F8F7FD] border border-[#DFD8F3] text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div className="space-y-0.5">
                        <span className="font-bold text-[#1C1938] capitalize">
                          {log.action?.replace(/_/g, ' ')}
                        </span>
                        <p className="text-slate-500 text-[11px]">
                          Target: <strong className="text-slate-700">{log.target_type}</strong> ({log.target_id})
                          {log.details && <span className="ml-2 font-medium">• {log.details}</span>}
                        </p>
                      </div>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </ClayCard>
          </div>
        )}

        {/* SECTION 6: GOVERNANCE & ADMIN PROFILE */}
        {mainSection === 'profile' && (
          <div className="space-y-6 text-left">
            {/* Admin Profile Card */}
            <ClayCard className="p-6 border border-[#DFD8F3] bg-white space-y-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#DFD8F3] pb-4">
                <div>
                  <h3 className="text-lg font-black text-[#1C1938] flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[#4136CA]" />
                    Administrator Profile & Governance Credentials
                  </h3>
                  <p className="text-xs text-[#686487]">
                    Platform management account with full authority to approve tutors and coordinate fees.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-[#EFEAFF] text-[#4136CA] text-xs font-bold">
                  System Admin
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <ClayUploadButton
                  currentPhotoUrl={profile?.photo_url || user?.photo_url}
                  onPhotoSelected={handleAdminPhotoUpload}
                  onPhotoRemoved={handleAdminPhotoRemove}
                  label="Admin Avatar"
                  subLabel="JPG or PNG (Max 4MB)"
                  size="lg"
                  isUploading={isUploadingPhoto}
                />

                <div className="flex-1 space-y-3 w-full">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-[#F8F7FD] border border-[#DFD8F3]">
                      <span className="text-[10px] text-[#686487] block font-bold">Name</span>
                      <span className="font-extrabold text-[#1C1938] text-sm">
                        {profile?.name || user?.name || 'Administrator'}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-[#F8F7FD] border border-[#DFD8F3]">
                      <span className="text-[10px] text-[#686487] block font-bold">Role</span>
                      <span className="font-extrabold text-[#4136CA] text-sm">
                        Platform Administrator
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-[#F8F7FD] border border-[#DFD8F3]">
                      <span className="text-[10px] text-[#686487] block font-bold">Official Email</span>
                      <span className="font-medium text-[#1C1938]">
                        {profile?.email || user?.email || 'admin@shikshan.org'}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-[#F8F7FD] border border-[#DFD8F3]">
                      <span className="text-[10px] text-[#686487] block font-bold">Official Contact</span>
                      <span className="font-medium text-[#1C1938]">
                        {profile?.phone || user?.phone || '+91 94821 00000'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Administrator Sign Out Action */}
              <div className="pt-4 border-t border-[#F3EFFB]">
                <button
                  type="button"
                  onClick={() => setIsConfirmSignOutOpen(true)}
                  className="w-full py-3.5 px-5 rounded-2xl bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 shadow-clay-sm flex items-center justify-center gap-2 font-black text-xs active:scale-[0.98] transition-all cursor-pointer"
                >
                  <LogOut className="w-4 h-4 stroke-[2.2]" />
                  <span>Sign Out of Shikshan Administration</span>
                </button>
              </div>
            </ClayCard>

            {/* Platform Governance Standards Card */}
            <ClayCard className="p-6 border border-[#DFD8F3] bg-white space-y-4">
              <h4 className="font-extrabold text-sm text-[#1C1938] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Shikshan Quality & Safety Charter (Karnataka)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-[#F8F7FD] border border-[#DFD8F3] space-y-1">
                  <div className="flex items-center gap-2 font-bold text-[#1C1938]">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Degree & Background Verification</span>
                  </div>
                  <p className="text-[11px] text-[#686487]">
                    100% manual check of academic qualifications, institutional enrollment, and ID proofs.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#F8F7FD] border border-[#DFD8F3] space-y-1">
                  <div className="flex items-center gap-2 font-bold text-[#1C1938]">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Standardized Monthly Tuition</span>
                  </div>
                  <p className="text-[11px] text-[#686487]">
                    Transparent rates reviewed and verified by platform administration to keep quality education accessible.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#F8F7FD] border border-[#DFD8F3] space-y-1">
                  <div className="flex items-center gap-2 font-bold text-[#1C1938]">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Strict 4-Student Micro-Batches</span>
                  </div>
                  <p className="text-[11px] text-[#686487]">
                    System enforces a maximum of 4 students per batch to guarantee individualized attention.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#F8F7FD] border border-[#DFD8F3] space-y-1">
                  <div className="flex items-center gap-2 font-bold text-[#1C1938]">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>3-Hour Structured Study Blocks</span>
                  </div>
                  <p className="text-[11px] text-[#686487]">
                    Alternating Mon · Wed · Fri / Tue · Thu · Sat evening schedules (4:00 PM – 7:00 PM).
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#F8F7FD] border border-[#DFD8F3] space-y-1">
                  <div className="flex items-center gap-2 font-bold text-[#1C1938]">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Transparent 10% Platform Fee</span>
                  </div>
                  <p className="text-[11px] text-[#686487]">
                    10% Shikshan platform fee supports operations, educator vetting, and technology infrastructure.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#F8F7FD] border border-[#DFD8F3] space-y-1">
                  <div className="flex items-center gap-2 font-bold text-[#1C1938]">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Guardian & Student Privacy Guard</span>
                  </div>
                  <p className="text-[11px] text-[#686487]">
                    Phone numbers are protected until a tutor explicitly reviews and accepts a learning request.
                  </p>
                </div>
              </div>
            </ClayCard>
          </div>
        )}
      </main>

      {/* Dedicated Open Batch Details & Enrolled Students Modal */}
      {selectedBatchModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-label="Batch Details and Enrolled Students"
        >
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-[#DFD8F3] text-left space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#F3EFFB]">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#EDE9FE] border border-[#DDD6FE] text-[#4136CA] flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-[#1C1938]">{selectedBatchModal.name}</h3>
                  <p className="text-[11px] text-[#686487]">
                    Mentor: {selectedBatchModal.tutorName} {selectedBatchModal.tutorPhone && `(${selectedBatchModal.tutorPhone})`}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBatchModal(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 cursor-pointer"
                aria-label="Close Batch Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Batch Overview Specs */}
            <div className="grid grid-cols-2 gap-2.5 text-xs bg-[#FAF9FE] p-3.5 rounded-2xl border border-[#DFD8F3]">
              <div>
                <span className="text-[10px] text-[#686487] block font-semibold">Subject & Class</span>
                <span className="font-bold text-[#1C1938]">{selectedBatchModal.subject} • {selectedBatchModal.classLevel}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#686487] block font-semibold">Fixed 3-Hour Schedule</span>
                <span className="font-bold text-[#1C1938]">{selectedBatchModal.days} ({selectedBatchModal.startTime} – {selectedBatchModal.endTime})</span>
              </div>
              <div className="col-span-2 pt-2 border-t border-[#E5DFF8]">
                <div className="flex justify-between items-center text-[11px] font-bold">
                  <span className="text-[#4A4668]">Batch Capacity</span>
                  <span className="text-[#1C1938]">
                    {selectedBatchModal.enrolledCount} of 4 seats filled ({selectedBatchModal.availableSeats} available)
                  </span>
                </div>
                <div className="w-full bg-[#E5DFF8] rounded-full h-2 mt-1.5 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      selectedBatchModal.enrolledCount >= 4 ? 'bg-rose-500' : 'bg-[#4136CA]'
                    }`}
                    style={{ width: `${Math.min(100, (selectedBatchModal.enrolledCount / 4) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Enrolled Students List */}
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider text-[#1C1938] flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-[#4136CA]" />
                  Enrolled Students ({selectedBatchModal.students.length})
                </h4>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                  {selectedBatchModal.enrolledCount} Active
                </span>
              </div>

              {selectedBatchModal.students.length === 0 ? (
                <div className="p-6 text-center text-xs text-[#686487] bg-[#F8F7FD] rounded-2xl border border-[#DFD8F3]">
                  No students currently enrolled in this batch. All 4 seats are available.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {selectedBatchModal.students.map((st: any, idx: number) => (
                    <div
                      key={st.id || idx}
                      className="p-3.5 rounded-2xl bg-white border border-[#DFD8F3] shadow-xs space-y-2 text-left"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1 text-xs min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[#686487] font-semibold text-[11px]">Student:</span>
                            <span className="font-extrabold text-sm text-[#1C1938]">{st.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[#686487] font-semibold text-[11px]">Class:</span>
                            <span className="font-bold text-[#1C1938]">{st.classLevel || selectedBatchModal.classLevel || 'Class 8'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[#686487] font-semibold text-[11px]">Enrollment:</span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800">
                              Active
                            </span>
                            {st.phone && <span className="text-[11px] text-[#686487]">({st.phone})</span>}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-1 sm:pt-0">
                          <button
                            type="button"
                            onClick={() => {
                              setStudentRemovalTarget({
                                requestId: st.requestId || st.id,
                                studentName: st.name,
                                tutorName: selectedBatchModal.tutorName,
                                batchId: selectedBatchModal.id,
                                batchName: selectedBatchModal.name,
                              });
                              setRemovalReason('payment_not_completed');
                              setRemovalNote('');
                            }}
                            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                            aria-label={`Remove Student ${st.name}`}
                          >
                            <UserMinus className="w-4 h-4" />
                            Remove Student
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-[#F3EFFB] flex justify-end">
              <ClayButton
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setSelectedBatchModal(null)}
              >
                Close
              </ClayButton>
            </div>
          </div>
        </div>
      )}

      {/* Admin Student Removal Confirmation Modal */}
      {studentRemovalTarget && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-label="Confirm Student Removal"
        >
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-rose-100 text-left space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#F3EFFB]">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-[#1C1938]">Remove Student from Batch</h3>
                  <p className="text-[11px] text-[#686487]">Administrator Enrollment Control</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStudentRemovalTarget(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FAF9FE] border border-[#E5DFF8] space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-[#686487] font-semibold">Student Name:</span>
                <span className="font-extrabold text-[#1C1938]">{studentRemovalTarget.studentName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#686487] font-semibold">Tutor Name:</span>
                <span className="font-extrabold text-[#4136CA]">{studentRemovalTarget.tutorName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#686487] font-semibold">Relevant Batch:</span>
                <span className="font-extrabold text-[#1C1938]">{studentRemovalTarget.batchName}</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <label className="block text-[11px] font-bold text-[#1C1938]">
                Reason for Removal:
              </label>
              <div className="space-y-1.5">
                <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-[#DFD8F3] hover:bg-slate-50 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="removalReason"
                    value="payment_not_completed"
                    checked={removalReason === 'payment_not_completed'}
                    onChange={() => setRemovalReason('payment_not_completed')}
                    className="text-[#7C3AED] focus:ring-purple-400"
                  />
                  <span className="font-semibold text-slate-800">Payment not completed</span>
                </label>
                <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-[#DFD8F3] hover:bg-slate-50 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="removalReason"
                    value="administrative_removal"
                    checked={removalReason === 'administrative_removal'}
                    onChange={() => setRemovalReason('administrative_removal')}
                    className="text-[#7C3AED] focus:ring-purple-400"
                  />
                  <span className="font-semibold text-slate-800">Administrative removal</span>
                </label>
                <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-[#DFD8F3] hover:bg-slate-50 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="removalReason"
                    value="other"
                    checked={removalReason === 'other'}
                    onChange={() => setRemovalReason('other')}
                    className="text-[#7C3AED] focus:ring-purple-400"
                  />
                  <span className="font-semibold text-slate-800">Other</span>
                </label>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#1C1938] mt-2 mb-1">
                  Additional Notes (Optional):
                </label>
                <textarea
                  value={removalNote}
                  onChange={(e) => setRemovalNote(e.target.value)}
                  placeholder="Reason details or adjustment notes..."
                  rows={2}
                  className="w-full p-2.5 rounded-xl border border-[#DFD8F3] bg-[#FAF9FE] text-xs text-[#1C1938] resize-none outline-none focus:border-purple-400"
                />
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
              <strong>Data Safety Guarantee:</strong> Removing the student releases 1 batch seat immediately. The student's account, tutor account, batch schedule, and historical payment records remain preserved.
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#F3EFFB]">
              <ClayButton
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setStudentRemovalTarget(null)}
                disabled={isRemovingStudent}
              >
                Cancel
              </ClayButton>
              <button
                type="button"
                onClick={handleAdminRemoveStudent}
                disabled={isRemovingStudent}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
              >
                {isRemovingStudent ? 'Removing...' : 'Confirm Removal'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Administrator Logout Confirmation Modal */}
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
                Are you sure you want to log out of the Shikshan administrator dashboard?
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmSignOutOpen(false)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
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
    </ClayBackground>
  );
};
