import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle,
  XCircle,
  Clock,
  HeartHandshake,
  Send,
  RefreshCw,
} from 'lucide-react';
import { Header } from '../../components/common/Header';
import { ClayCard } from '../../components/common/ClayCard';
import { ClayButton } from '../../components/common/ClayButton';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { TutorApplication, TutorRequest } from '../../types';
import { SCHOOL_SUBJECTS, FEE_UNITS } from '../../config/options';

export const TutorDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, getTutorRequests, updateTutorRequestStatus } = useAuth();

  const [application, setApplication] = useState<TutorApplication | null>(null);
  const [requests, setRequests] = useState<TutorRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Response modal state
  const [activeRequest, setActiveRequest] = useState<TutorRequest | null>(null);
  const [responseAction, setResponseAction] = useState<'accepted' | 'declined'>('accepted');
  const [responseNote, setResponseNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const loadData = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      if (!isSupabaseConfigured) {
        setApplication({
          id: 'demo-app-1',
          tutor_id: user.id,
          education_level: 'Graduate (B.Sc Mathematics)',
          course_qualification: 'B.Sc Mathematics',
          institution_name: 'Bangalore University',
          subjects: ['mathematics', 'science'],
          class_levels: ['class_6', 'class_7', 'class_8', 'class_9'],
          subject_class_pairs: [{ subject: 'Mathematics', classLevelRange: 'Classes 6–9' }],
          teaching_languages: ['Kannada', 'English', 'Bilingual'],
          bio_intro: 'Helping school students achieve conceptual clarity in Mathematics & Science with bilingual Kannada and English guidance.',
          available_days: ['mon', 'tue', 'wed', 'thu', 'fri'],
          time_windows: ['evening_prime'],
          hours_per_day: 2,
          fee_amount: 350,
          fee_unit: 'per_hour',
          status: 'approved',
          submitted_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        // Provide a sample student request for testing
        const sampleRequests: TutorRequest[] = [
          {
            id: 'sample-req-1',
            student_id: 'student-demo-1',
            tutor_id: user.id,
            subject: 'mathematics',
            class_level: 'Class 8',
            learning_needs: 'Need help understanding algebra factorization formulas and Kannada-medium geometry theorems.',
            preferred_schedule: 'Mon, Wed, Fri (6:00 PM – 7:30 PM)',
            status: 'pending',
            created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
            updated_at: new Date().toISOString(),
            student_profile: {
              id: 'student-demo-1',
              role: 'student',
              name: 'Ananya Rao',
              email: 'ananya.rao@example.com',
              phone: '+91 9900112233',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          },
        ];
        setRequests(sampleRequests);
      } else {
        const { data: appData } = await supabase
          .from('tutor_applications')
          .select('*')
          .eq('tutor_id', user.id)
          .maybeSingle();

        if (appData) {
          if (appData.status !== 'approved') {
            navigate('/tutor/status', { replace: true });
            return;
          }
          setApplication(appData as TutorApplication);
        } else {
          navigate('/tutor/register', { replace: true });
          return;
        }

        const reqs = await getTutorRequests();
        setRequests(reqs);
      }
    } catch (err) {
      console.error('Failed to load tutor dashboard:', err);
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

  const handleOpenResponse = (req: TutorRequest, action: 'accepted' | 'declined') => {
    setActiveRequest(req);
    setResponseAction(action);
    setResponseNote(
      action === 'accepted'
        ? 'Thank you for reaching out! I would be glad to tutor you. I am available during your preferred hours.'
        : 'Thank you for your interest. Unfortunately, my current schedule cannot accommodate this time slot.'
    );
  };

  const handleConfirmResponse = async () => {
    if (!activeRequest) return;
    setIsUpdating(true);

    try {
      await updateTutorRequestStatus(activeRequest.id, responseAction, responseNote.trim());
      setRequests((prev) =>
        prev.map((r) =>
          r.id === activeRequest.id
            ? { ...r, status: responseAction, response_message: responseNote.trim() }
            : r
        )
      );
      setActiveRequest(null);
    } catch (err) {
      console.error('Response failed:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const feeUnitLabel = FEE_UNITS.find((u) => u.id === application?.fee_unit)?.label || 'Per Month';
  const pendingRequests = requests.filter((r) => r.status === 'pending');

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F6FC]">
      <Header
        title="Tutor Dashboard"
        subtitle="Verified Educator Portal"
        customRight={
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="w-10 h-10 rounded-2xl bg-white border border-[#DFD8F3] shadow-sm flex items-center justify-center text-[#1C1938] hover:text-[#4136CA] hover:bg-[#F4F1FA] active:scale-95 transition-all"
            title="Refresh Requests"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#4136CA]' : ''}`} />
          </button>
        }
      />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-6 pb-24 space-y-6">
        {isLoading ? (
          <ClayCard className="p-8 text-center space-y-3 border-[#DFD8F3] shadow-clay-card bg-white">
            <div className="w-10 h-10 rounded-full border-4 border-[#4136CA] border-t-transparent animate-spin mx-auto" />
            <p className="text-xs font-semibold text-slate-600">Loading tutor dashboard...</p>
          </ClayCard>
        ) : (
          <>
            {/* Educator Profile Overview Banner */}
            <ClayCard className="p-6 text-left space-y-4 border border-[#DFD8F3] shadow-clay-card bg-gradient-to-br from-white to-[#F4F1FA]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#DFD8F3]">
                <div>
                  <span className="text-xs font-bold text-[#4136CA] uppercase tracking-wider">
                    Verified Shikshan Educator
                  </span>
                  <h2 className="text-2xl font-black text-[#1C1938] mt-0.5">
                    Namaskara, {profile?.name || user?.email}!
                  </h2>
                  <p className="text-xs text-slate-500 font-kannada">
                    ನಿಮ್ಮ ಪ್ರೊಫೈಲ್ ಸಕ್ರಿಯವಾಗಿದೆ • Your tutor profile is discoverable by students.
                  </p>
                </div>
                <StatusBadge status="approved" size="md" />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-xs">
                <div className="p-3 rounded-2xl bg-white border border-[#DFD8F3] shadow-sm">
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">Proposed Rate</span>
                  <span className="font-extrabold text-[#4136CA] text-sm">
                    ₹{application?.fee_amount || application?.proposed_rate || 350} {feeUnitLabel}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-white border border-[#DFD8F3] shadow-sm">
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">Daily Hours</span>
                  <span className="font-extrabold text-[#4136CA] text-sm">
                    {application?.hours_per_day || 2} hrs/day
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-white border border-[#DFD8F3] shadow-sm">
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">Languages</span>
                  <span className="font-extrabold text-[#1C1938] text-sm truncate block">
                    {application?.teaching_languages?.join(', ') || 'Kannada'}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-white border border-[#DFD8F3] shadow-sm">
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">New Requests</span>
                  <span className="font-extrabold text-[#3B522F] text-sm flex items-center gap-1">
                    <Send className="w-3.5 h-3.5" />
                    {pendingRequests.length} Pending
                  </span>
                </div>
              </div>
            </ClayCard>

            {/* Incoming Student Requests Section */}
            <div className="space-y-3 text-left">
              <div className="flex items-center justify-between px-1">
                <h3 className="font-extrabold text-base text-[#1C1938] flex items-center gap-2">
                  <Send className="w-4 h-4 text-[#4136CA]" />
                  <span>Student Requests Received ({requests.length})</span>
                </h3>
                <span className="text-xs text-slate-500">
                  {pendingRequests.length} awaiting your response
                </span>
              </div>

              {requests.length === 0 ? (
                <ClayCard className="p-8 text-center space-y-2 border-[#DFD8F3] shadow-clay-card bg-white">
                  <div className="w-12 h-12 rounded-2xl bg-[#DFD8F3]/60 text-[#4136CA] flex items-center justify-center mx-auto border border-[#DFD8F3]">
                    <Clock className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-sm text-[#1C1938]">No Student Requests Yet</h4>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    Students from Karnataka schools are currently browsing verified tutors. You will receive notifications here when a student submits a request.
                  </p>
                </ClayCard>
              ) : (
                <div className="space-y-3">
                  {requests.map((req) => {
                    const studentName = req.student_profile?.name || 'School Student';
                    const subjectName =
                      SCHOOL_SUBJECTS.find((s) => s.id === req.subject)?.label || req.subject;

                    return (
                      <ClayCard key={req.id} className="p-5 text-left space-y-3 bg-white border-[#DFD8F3] shadow-clay-card">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#DFD8F3] text-[#4136CA] flex items-center justify-center font-bold text-sm border border-[#A7AAE5]/50">
                              {studentName[0]?.toUpperCase() || 'S'}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-extrabold text-sm text-[#1C1938]">{studentName}</h4>
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                                    req.status === 'accepted'
                                      ? 'bg-[#EBF3E8] text-[#3B522F] border border-[#3B522F]/20'
                                      : req.status === 'declined'
                                      ? 'bg-rose-50 text-rose-800 border border-rose-200'
                                      : 'bg-[#DFD8F3]/70 text-[#4136CA] border border-[#A7AAE5]/50'
                                  }`}
                                >
                                  {req.status}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500">
                                Class: <strong className="text-[#1C1938]">{req.class_level}</strong> • Subject: <strong className="text-[#1C1938]">{subjectName}</strong>
                              </p>
                            </div>
                          </div>
                          <span className="text-[10px] text-slate-400">
                            {new Date(req.created_at).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="p-3 rounded-2xl bg-[#F4F1FA] border border-[#DFD8F3] text-xs space-y-1">
                          <p className="text-slate-800">
                            <strong>Student Note:</strong> {req.learning_needs}
                          </p>
                          {req.preferred_schedule && (
                            <p className="text-slate-500 text-[11px]">
                              <strong>Preferred Timing:</strong> {req.preferred_schedule}
                            </p>
                          )}
                          {req.response_message && (
                            <p className="pt-1.5 border-t border-[#DFD8F3] text-[#4136CA] font-semibold">
                              <strong>Your Response:</strong> {req.response_message}
                            </p>
                          )}
                        </div>

                        {req.status === 'pending' && (
                          <div className="flex items-center justify-end gap-2 pt-1 border-t border-[#DFD8F3]">
                            <button
                              type="button"
                              onClick={() => handleOpenResponse(req, 'declined')}
                              className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold transition-colors"
                            >
                              Decline
                            </button>
                            <ClayButton
                              type="button"
                              size="sm"
                              variant="primary"
                              onClick={() => handleOpenResponse(req, 'accepted')}
                              icon={<CheckCircle className="w-3.5 h-3.5" />}
                              className="bg-[#3B522F] hover:bg-[#3B522F]/90"
                            >
                              Accept Student
                            </ClayButton>
                          </div>
                        )}
                      </ClayCard>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Educator Teaching Values Card */}
            <ClayCard className="p-5 text-left space-y-2 border border-[#DFD8F3] bg-[#F4F1FA]">
              <div className="flex items-center gap-2 font-bold text-xs text-[#4136CA]">
                <HeartHandshake className="w-4 h-4 text-[#4136CA]" />
                <span>Mentoring Standards for Rural & Kannada-Medium Students</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Remember to explain technical scientific and mathematical terms with patience in Kannada alongside English. Many students are transitioning to higher classes and benefit immensely from encouraging, consistent guidance.
              </p>
            </ClayCard>
          </>
        )}
      </main>

      {/* Response Action Modal */}
      {activeRequest && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-[#DFD8F3] space-y-4 text-left animate-fade-in">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-[#1C1938] capitalize">
                {responseAction} Request from {activeRequest.student_profile?.name || 'Student'}
              </h3>
              <button
                onClick={() => setActiveRequest(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-[#1C1938]"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1.5 text-xs">
              <label htmlFor="tutor-resp-textarea" className="font-bold text-[#1C1938] block">
                Message to Student (Visible on their dashboard)
              </label>
              <textarea
                id="tutor-resp-textarea"
                rows={3}
                value={responseNote}
                onChange={(e) => setResponseNote(e.target.value)}
                className="clay-input text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <ClayButton
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setActiveRequest(null)}
              >
                Cancel
              </ClayButton>
              <ClayButton
                type="button"
                variant="primary"
                size="sm"
                isLoading={isUpdating}
                onClick={handleConfirmResponse}
                className={responseAction === 'accepted' ? 'bg-[#3B522F]' : 'bg-rose-600'}
              >
                Confirm {responseAction === 'accepted' ? 'Acceptance' : 'Decline'}
              </ClayButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
