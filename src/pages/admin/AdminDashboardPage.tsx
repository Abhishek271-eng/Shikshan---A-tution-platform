import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  Check,
  X,
  AlertCircle,
  Clock,
  FileText,
  ExternalLink,
  MessageSquare,
  Lock,
  RefreshCw,
} from 'lucide-react';
import { Header } from '../../components/common/Header';
import { ClayCard } from '../../components/common/ClayCard';
import { ClayButton } from '../../components/common/ClayButton';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { supabase, isSupabaseConfigured, getDocumentSignedUrl } from '../../lib/supabase';
import { TutorApplication, TutorApplicationStatus, TutorDocument, AdminReviewHistory } from '../../types';

export const AdminDashboardPage: React.FC = () => {
  const { user, profile } = useAuth();

  const [applications, setApplications] = useState<TutorApplication[]>([]);
  const [selectedApp, setSelectedApp] = useState<TutorApplication | null>(null);
  const [documents, setDocuments] = useState<TutorDocument[]>([]);
  const [reviewHistory, setReviewHistory] = useState<AdminReviewHistory[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'pending_review' | 'approved' | 'rejected'>('pending_review');

  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Review Form States
  const [internalNote, setInternalNote] = useState('');
  const [applicantMessage, setApplicantMessage] = useState('');

  // Check if current user is an admin
  const isAdmin = profile?.role === 'admin';

  if (isSupabaseConfigured && user && profile && !isAdmin) {
    return (
      <div className="min-h-screen flex flex-col bg-[#EEF4FA]">
        <Header title="Access Denied" subtitle="Administrator privileges required" />
        <main className="flex-1 max-w-md mx-auto w-full px-5 py-12 flex flex-col justify-center">
          <ClayCard className="p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-3xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Lock className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Administrator Access Required</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Your account ({user.email}) does not have administrative permissions. Tutor application review is restricted to verified administrators.
            </p>
          </ClayCard>
        </main>
      </div>
    );
  }

  const fetchApplications = async () => {
    setIsLoading(true);

    if (!isSupabaseConfigured) {
      // Demo applications for local testing without Supabase connection
      const demoApps: TutorApplication[] = [
        {
          id: 'demo-app-1',
          tutor_id: 'user-1',
          education_level: 'Graduate (B.Sc Mathematics)',
          course_qualification: 'B.Sc Mathematics',
          institution_name: 'Bangalore University',
          subjects: ['mathematics', 'science'],
          class_levels: ['classes_6_8', 'classes_9_10'],
          subject_class_pairs: [{ subject: 'Mathematics', classLevelRange: 'Classes 6–8' }],
          teaching_languages: ['Kannada', 'English'],
          marks_summary: '10th Maths: 94%, Science: 90% | PUC PCM: 88%',
          commitment_months: 6,
          available_days: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat'],
          time_windows: ['evening_prime'],
          hours_per_day: 2,
          proposed_rate: 1800,
          status: 'pending_review',
          submitted_at: new Date(Date.now() - 3600000 * 4).toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          tutor_profile: {
            id: 'user-1',
            role: 'tutor',
            name: 'Pooja Hegde',
            email: 'pooja.h@example.com',
            phone: '+91 9876543210',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        },
        {
          id: 'demo-app-2',
          tutor_id: 'user-2',
          education_level: 'Qualified Teacher (B.Ed)',
          course_qualification: 'B.Ed Physical Science',
          institution_name: 'Mysore University',
          subjects: ['science', 'kannada'],
          class_levels: ['classes_1_5', 'classes_6_8'],
          subject_class_pairs: [{ subject: 'Science', classLevelRange: 'Classes 1–5' }],
          teaching_languages: ['Kannada'],
          marks_summary: 'B.Ed: 82% First Class with Distinction',
          commitment_months: 3,
          available_days: ['mon', 'wed', 'fri'],
          time_windows: ['evening_early'],
          hours_per_day: 1.5,
          proposed_rate: 1500,
          status: 'pending_review',
          submitted_at: new Date(Date.now() - 3600000 * 12).toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          tutor_profile: {
            id: 'user-2',
            role: 'tutor',
            name: 'Basavaraj Patil',
            email: 'basavaraj.p@example.com',
            phone: '+91 9845012345',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        },
      ];

      setApplications(demoApps);
      setSelectedApp(demoApps[0]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('tutor_applications')
        .select(`
          *,
          tutor_profile:profiles!tutor_applications_tutor_id_fkey(*)
        `)
        .order('submitted_at', { ascending: false });

      if (error) {
        console.error('Error fetching tutor applications:', error);
      }

      if (data) {
        setApplications(data as TutorApplication[]);
        if (data.length > 0 && !selectedApp) {
          setSelectedApp(data[0] as TutorApplication);
        }
      }
    } catch (err) {
      console.error('Failed to query applications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Load documents and audit history for selected application
  useEffect(() => {
    if (!selectedApp) return;

    const loadAppDetails = async () => {
      if (!isSupabaseConfigured) {
        setDocuments([
          {
            id: 'doc-1',
            tutor_id: selectedApp.tutor_id,
            application_id: selectedApp.id,
            file_path: 'demo/marksheet.pdf',
            file_name: '10th_and_PUC_marksheet.pdf',
            file_size: 1420500,
            mime_type: 'application/pdf',
            document_category: 'academic_marksheet',
            created_at: new Date().toISOString(),
          },
        ]);
        setReviewHistory([
          {
            id: 'hist-1',
            application_id: selectedApp.id,
            reviewer_id: 'admin-1',
            action: 'note_added',
            internal_note: 'Initial marks verified: 94% in Mathematics.',
            created_at: new Date(Date.now() - 1800000).toISOString(),
            reviewer_name: 'Founder Review',
          },
        ]);
        return;
      }

      // Fetch private documents
      const { data: docs } = await supabase
        .from('tutor_documents')
        .select('*')
        .eq('application_id', selectedApp.id);

      if (docs) setDocuments(docs as TutorDocument[]);

      // Fetch review history
      const { data: history } = await supabase
        .from('admin_review_history')
        .select('*')
        .eq('application_id', selectedApp.id)
        .order('created_at', { ascending: false });

      if (history) setReviewHistory(history as AdminReviewHistory[]);
    };

    loadAppDetails();
  }, [selectedApp]);

  useEffect(() => {
    fetchApplications();
  }, [user]);

  // Handle Review Decisions: Approve, Reject, Needs Info
  const handleReviewAction = async (newStatus: TutorApplicationStatus) => {
    if (!selectedApp) return;
    setIsProcessing(true);
    setStatusMessage(null);

    try {
      if (isSupabaseConfigured) {
        // 1. Update application status
        const { error: updateErr } = await supabase
          .from('tutor_applications')
          .update({
            status: newStatus,
            applicant_message: applicantMessage.trim() || null,
            reviewed_at: new Date().toISOString(),
          })
          .eq('id', selectedApp.id);

        if (updateErr) {
          setStatusMessage(`Update error: ${updateErr.message}`);
          setIsProcessing(false);
          return;
        }

        // 2. Insert internal audit record
        if (user) {
          await supabase.from('admin_review_history').insert({
            application_id: selectedApp.id,
            reviewer_id: user.id,
            action: newStatus,
            internal_note: internalNote.trim() || `Application updated to ${newStatus}`,
            applicant_message: applicantMessage.trim() || null,
          });
        }
      }

      // Update local state
      setSelectedApp((prev) => (prev ? { ...prev, status: newStatus, applicant_message: applicantMessage } : null));
      setApplications((prev) =>
        prev.map((app) => (app.id === selectedApp.id ? { ...app, status: newStatus } : app))
      );

      setStatusMessage(`Application successfully marked as ${newStatus.replace('_', ' ')}.`);
      setInternalNote('');
      setApplicantMessage('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Review action failed.';
      setStatusMessage(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOpenDocument = async (filePath: string) => {
    if (!isSupabaseConfigured) {
      alert('In demo mode without cloud Supabase credentials. With Supabase connected, this generates an authenticated signed URL for private marksheets.');
      return;
    }

    const signedUrl = await getDocumentSignedUrl(filePath, 300);
    if (signedUrl) {
      window.open(signedUrl, '_blank', 'noopener,noreferrer');
    } else {
      alert('Could not generate secure viewing link for this document.');
    }
  };

  // Filtered applications list
  const filteredApps = applications.filter((app) => {
    if (activeTab === 'all') return true;
    return app.status === activeTab;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#EEF4FA]">
      <Header title="Founder Review Area" subtitle="Manual Tutor Assessment & Verification" />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
        {/* Top Overview Banner */}
        <ClayCard className="p-6 text-left flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-purple-600" />
              <h2 className="text-xl font-black text-slate-900">
                Tutor Eligibility Review Desk
              </h2>
            </div>
            <p className="text-xs text-slate-600 mt-1 max-w-xl">
              Manual assessment model: applications remain pending until the founder or trusted teachers review academic marksheets and verify teaching suitability.
            </p>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            <ClayButton
              variant="secondary"
              size="sm"
              onClick={fetchApplications}
              icon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Refresh
            </ClayButton>
          </div>
        </ClayCard>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 select-none">
          {(['pending_review', 'approved', 'rejected', 'all'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === tab
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {tab === 'pending_review'
                ? 'Pending Review'
                : tab === 'approved'
                ? 'Approved'
                : tab === 'rejected'
                ? 'Rejected'
                : 'All Applications'}
            </button>
          ))}
        </div>

        {/* Two-Column Review Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Applications List */}
          <div className="lg:col-span-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider text-left px-1">
              Applications ({filteredApps.length})
            </h3>

            {isLoading ? (
              <ClayCard className="p-6 text-center text-xs text-slate-500">
                Loading applications...
              </ClayCard>
            ) : filteredApps.length === 0 ? (
              <ClayCard className="p-6 text-center text-xs text-slate-500">
                No applications matching this filter.
              </ClayCard>
            ) : (
              filteredApps.map((app) => {
                const isSelected = selectedApp?.id === app.id;
                return (
                  <ClayCard
                    key={app.id}
                    interactive
                    onClick={() => setSelectedApp(app)}
                    className={`p-4 text-left transition-all ${
                      isSelected
                        ? 'border-2 border-blue-500 bg-blue-50/50 shadow-md ring-2 ring-blue-100'
                        : 'border border-slate-200/80 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900">
                          {app.tutor_profile?.name || 'Tutor Applicant'}
                        </h4>
                        <p className="text-[11px] text-slate-500 truncate">{app.tutor_profile?.email}</p>
                      </div>
                      <StatusBadge status={app.status} size="sm" />
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                      <span>{app.hours_per_day || 2} hr/day</span>
                      <span className="font-semibold text-slate-800">
                        {app.fee_amount ? `₹${app.fee_amount}` : app.proposed_rate ? `₹${app.proposed_rate}` : 'N/A'}
                      </span>
                    </div>
                  </ClayCard>
                );
              })
            )}
          </div>

          {/* Selected Application Inspector */}
          <div className="lg:col-span-7">
            {selectedApp ? (
              <ClayCard className="p-6 text-left space-y-6">
                {/* Header Info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="text-xl font-black text-slate-900">
                      {selectedApp.tutor_profile?.name || 'Applicant'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {selectedApp.tutor_profile?.email} • {selectedApp.tutor_profile?.phone || 'No phone'}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Submitted: {new Date(selectedApp.submitted_at).toLocaleString()}
                    </p>
                  </div>
                  <StatusBadge status={selectedApp.status} size="md" />
                </div>

                {statusMessage && (
                  <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{statusMessage}</span>
                  </div>
                )}

                {/* Academic & Teaching Details */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Academic Qualifications & Teaching Proposal
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Education Level</span>
                      <span className="font-semibold text-slate-800">{selectedApp.education_level}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px]">Course & Institution</span>
                      <span className="font-semibold text-slate-800">
                        {selectedApp.course_qualification || 'N/A'} {selectedApp.institution_name ? `(${selectedApp.institution_name})` : ''}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px]">Proposed Subjects</span>
                      <span className="font-semibold text-slate-800 capitalize">
                        {selectedApp.subjects?.join(', ')}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px]">Teaching Languages</span>
                      <span className="font-semibold text-slate-800 capitalize">
                        {selectedApp.teaching_languages?.join(', ')}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px]">Availability</span>
                      <span className="font-semibold text-slate-800">
                        {selectedApp.hours_per_day || 2} hrs/day ({selectedApp.available_days?.join(', ') || 'Flexible'})
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px]">Proposed Rate</span>
                      <span className="font-semibold text-slate-800">
                        ₹{selectedApp.fee_amount || selectedApp.proposed_rate || 'N/A'} {selectedApp.fee_unit ? `(${selectedApp.fee_unit})` : ''}
                      </span>
                    </div>

                    {selectedApp.marks_summary && (
                      <div className="sm:col-span-2 pt-1 border-t border-slate-200/60">
                        <span className="text-slate-400 block text-[11px]">Reported Marks</span>
                        <span className="font-medium text-slate-800">{selectedApp.marks_summary}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Private Academic Marksheets */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                    <span>Uploaded Academic Marksheets</span>
                    <span className="text-[11px] text-blue-700 flex items-center gap-1 font-semibold">
                      <Lock className="w-3 h-3" /> Private Storage
                    </span>
                  </h4>

                  {documents.length === 0 ? (
                    <p className="text-xs text-slate-500 italic bg-slate-50 p-3 rounded-xl border border-slate-100">
                      No in-app marksheets uploaded. Manual qualification review is conducted directly by founder/trustees outside the app.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="p-3 rounded-2xl bg-white border border-slate-200 flex items-center justify-between shadow-sm"
                        >
                          <div className="flex items-center gap-2.5">
                            <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
                            <div>
                              <p className="text-xs font-bold text-slate-900">{doc.file_name}</p>
                              <p className="text-[10px] text-slate-400">
                                {(doc.file_size / 1024 / 1024).toFixed(2)} MB • {doc.document_category}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleOpenDocument(doc.file_path)}
                            className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold flex items-center gap-1 transition-colors"
                          >
                            <span>Inspect</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Review Notes & Decision Controls */}
                <div className="pt-4 border-t border-slate-100 space-y-4">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Review Decision & Notes
                  </h4>

                  {/* Private Internal Note */}
                  <div className="space-y-1">
                    <label htmlFor="admin-internal-note" className="text-xs font-bold text-slate-800 flex items-center gap-1">
                      <Lock className="w-3 h-3 text-purple-600" />
                      <span>Internal Review Note (Confidential — Never shown to applicant)</span>
                    </label>
                    <textarea
                      id="admin-internal-note"
                      rows={2}
                      placeholder="e.g. Verified 10th maths marksheet with board roll number. Approved for high school maths."
                      value={internalNote}
                      onChange={(e) => setInternalNote(e.target.value)}
                      className="clay-input text-xs"
                    />
                  </div>

                  {/* Safe Applicant Message */}
                  <div className="space-y-1">
                    <label htmlFor="admin-applicant-message" className="text-xs font-bold text-slate-800 flex items-center gap-1">
                      <MessageSquare className="w-3 h-3 text-blue-600" />
                      <span>Applicant Message (Visible to tutor if more info needed or rejected)</span>
                    </label>
                    <input
                      id="admin-applicant-message"
                      type="text"
                      placeholder="e.g. Please upload a clear photo of your PUC marksheet."
                      value={applicantMessage}
                      onChange={(e) => setApplicantMessage(e.target.value)}
                      className="clay-input text-xs"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2.5 pt-2">
                    <ClayButton
                      variant="primary"
                      size="sm"
                      isLoading={isProcessing}
                      onClick={() => handleReviewAction('approved')}
                      icon={<Check className="w-4 h-4" />}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      Approve Tutor
                    </ClayButton>

                    <ClayButton
                      variant="secondary"
                      size="sm"
                      isLoading={isProcessing}
                      onClick={() => handleReviewAction('needs_info')}
                      icon={<Clock className="w-4 h-4" />}
                    >
                      Request More Info
                    </ClayButton>

                    <ClayButton
                      variant="danger"
                      size="sm"
                      isLoading={isProcessing}
                      onClick={() => handleReviewAction('rejected')}
                      icon={<X className="w-4 h-4" />}
                    >
                      Reject Application
                    </ClayButton>
                  </div>
                </div>

                {/* Audit History Timeline */}
                {reviewHistory.length > 0 && (
                  <div className="pt-4 border-t border-slate-100 space-y-2">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Application History
                    </h4>
                    <div className="space-y-2">
                      {reviewHistory.map((hist) => (
                        <div key={hist.id} className="p-3 rounded-2xl bg-slate-50 text-xs space-y-1">
                          <div className="flex justify-between font-bold text-slate-800">
                            <span className="capitalize">{hist.action.replace('_', ' ')}</span>
                            <span className="text-[10px] text-slate-400 font-normal">
                              {new Date(hist.created_at).toLocaleString()}
                            </span>
                          </div>
                          {hist.internal_note && (
                            <p className="text-slate-600 italic">
                              Internal: {hist.internal_note}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </ClayCard>
            ) : (
              <ClayCard className="p-8 text-center text-xs text-slate-500">
                Select an application from the left panel to review qualifications and marksheets.
              </ClayCard>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
