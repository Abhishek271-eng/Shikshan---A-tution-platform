import React, { useEffect, useState } from 'react';
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
} from 'lucide-react';
import { Header } from '../../components/common/Header';
import { ClayCard } from '../../components/common/ClayCard';
import { ClayButton } from '../../components/common/ClayButton';
import { ClayBackground } from '../../components/common/ClayBackground';
import { ClayUploadButton } from '../../components/common/ClayUploadButton';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
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

export const AdminDashboardPage: React.FC = () => {
  const { user, profile } = useAuth();

  const [mainSection, setMainSection] = useState<'tutors' | 'students' | 'payments' | 'inquiries' | 'audit'>('tutors');
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

  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Review Form States
  const [internalNote, setInternalNote] = useState('');
  const [applicantMessage, setApplicantMessage] = useState('');
  const [approvedFeeInput, setApprovedFeeInput] = useState('3000');
  const [isUpdatingFee, setIsUpdatingFee] = useState(false);

  const isAdmin = profile?.role === 'admin' || user?.role === 'admin';

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

  useEffect(() => {
    if (isAdmin) {
      fetchApplications();
      fetchStudents();
      fetchPayments();
      fetchRequests();
      fetchAuditLogs();
    } else {
      setIsLoading(false);
    }
  }, [isAdmin]);

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
                fetchApplications();
                fetchStudents();
                fetchPayments();
                fetchRequests();
                fetchAuditLogs();
              }}
              isLoading={isLoading || isLoadingStudents || isLoadingPayments}
              className="flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh All
            </ClayButton>
          </div>
        </ClayCard>

        {/* Section Navigation Tabs: Tutors, Students, Payments, Inquiries, Audit */}
        <div className="flex items-center gap-2 border-b border-[#DFD8F3] pb-3 overflow-x-auto select-none">
          <button
            type="button"
            onClick={() => setMainSection('tutors')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
              mainSection === 'tutors'
                ? 'bg-[#312E81] text-white shadow-sm'
                : 'bg-white text-[#686487] border border-[#DFD8F3] hover:text-[#1C1938]'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Tutors ({applications.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setMainSection('payments')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
              mainSection === 'payments'
                ? 'bg-[#312E81] text-white shadow-sm'
                : 'bg-white text-[#686487] border border-[#DFD8F3] hover:text-[#1C1938]'
            }`}
          >
            <IndianRupee className="w-4 h-4" />
            <span>Payments Desk ({payments.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setMainSection('inquiries')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
              mainSection === 'inquiries'
                ? 'bg-[#312E81] text-white shadow-sm'
                : 'bg-white text-[#686487] border border-[#DFD8F3] hover:text-[#1C1938]'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Inquiries & Batches ({requests.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setMainSection('students')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
              mainSection === 'students'
                ? 'bg-[#312E81] text-white shadow-sm'
                : 'bg-white text-[#686487] border border-[#DFD8F3] hover:text-[#1C1938]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Students ({students.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setMainSection('audit')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
              mainSection === 'audit'
                ? 'bg-[#312E81] text-white shadow-sm'
                : 'bg-white text-[#686487] border border-[#DFD8F3] hover:text-[#1C1938]'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Audit Logs ({auditLogs.length})</span>
          </button>
        </div>

        {statusMessage && (
          <div className="p-4 rounded-2xl bg-[#EEECFB] border border-[#A7AAE5] text-xs font-bold text-[#312E81] flex items-center gap-2">
            <Check className="w-4 h-4 text-[#4136CA]" />
            {statusMessage}
          </div>
        )}

        {/* SECTION 1: TUTOR APPLICATIONS DESK */}
        {mainSection === 'tutors' && (
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

                    {/* Monthly Fee Control (Max ₹3,000) */}
                    <div className="p-3.5 rounded-2xl bg-[#EDE9FE] border border-[#DDD6FE] space-y-2">
                      <label htmlFor="approved-fee-input" className="block text-xs font-bold text-[#5B21B6]">
                        Admin Approved Monthly Fee (Max Cap ₹3,000)
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

        {/* SECTION 3: INQUIRIES & BATCH CAPACITY MONITOR */}
        {mainSection === 'inquiries' && (
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
                      </div>
                    </div>
                  ))}
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
      </main>
    </ClayBackground>
  );
};
