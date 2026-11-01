import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RefreshCw,
  ArrowRight,
  GraduationCap,
  Clock,
  CheckCircle2,
  XCircle,
  LogOut,
} from 'lucide-react';
import { Header } from '../../components/common/Header';
import { ClayCard } from '../../components/common/ClayCard';
import { ClayButton } from '../../components/common/ClayButton';
import { ClayBackground } from '../../components/common/ClayBackground';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { TutorApplication } from '../../types';

export const TutorStatusPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const [application, setApplication] = useState<TutorApplication | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isConfirmSignOutOpen, setIsConfirmSignOutOpen] = useState(false);

  const handleSignOut = async () => {
    setIsConfirmSignOutOpen(false);
    await signOut();
    navigate('/login', { replace: true });
  };

  const fetchStatus = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      const res = await api.getTutorMyStatus();
      if (res.application) {
        setApplication({
          ...res.application,
          status: res.application.status === 'pending' ? 'pending_review' : res.application.status,
        });
      } else {
        setApplication(null);
      }
    } catch (err) {
      console.error('Failed to fetch tutor status from MySQL:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [user]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchStatus();
  };

  const isApproved = application?.status === 'approved';
  const isRejected = application?.status === 'rejected';

  return (
    <ClayBackground>
      <Header
        title="Application Status"
        subtitle="Tutor Verification Tracking"
        customRight={
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="w-10 h-10 rounded-2xl bg-white border border-[#DFD8F3] shadow-xs flex items-center justify-center text-[#1C1938] hover:text-[#4136CA] hover:bg-[#EEECFB] active:scale-95 transition-all cursor-pointer"
            aria-label="Refresh status"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#7C3AED]' : ''}`} />
          </button>
        }
      />

      <main className="flex-1 max-w-lg mx-auto w-full px-4 sm:px-6 py-6 pb-28 space-y-6">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-[#686487]">Loading application status from MySQL...</div>
        ) : !application ? (
          <ClayCard className="p-8 text-center space-y-4 border border-[#DFD8F3]">
            <div className="w-16 h-16 rounded-full bg-[#EEECFB] text-[#312E81] flex items-center justify-center mx-auto">
              <GraduationCap className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-[#1C1938]">No Tutor Profile Found</h3>
            <p className="text-xs text-[#686487] leading-relaxed">
              You haven&apos;t submitted a tutor application yet. Create your teaching profile to start mentoring students.
            </p>
            <div className="pt-2">
              <ClayButton
                variant="primary"
                size="md"
                onClick={() => navigate('/tutor/register')}
                className="w-full rounded-full py-3 text-xs font-bold shadow-button-primary"
              >
                Complete Tutor Registration
              </ClayButton>
            </div>
          </ClayCard>
        ) : (
          <>
            {/* Status Hero Card */}
            <ClayCard className="p-6 text-center space-y-4 border border-[#DFD8F3] shadow-clay bg-white">
              <div className="mx-auto flex justify-center">
                {isApproved ? (
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                ) : isRejected ? (
                  <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center">
                    <XCircle className="w-10 h-10" />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
                    <Clock className="w-10 h-10" />
                  </div>
                )}
              </div>

              <div>
                <span
                  className={`text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-full ${
                    isApproved
                      ? 'bg-emerald-100 text-emerald-800'
                      : isRejected
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {isApproved ? 'Approved Educator' : isRejected ? 'Application Not Approved' : 'Under Review'}
                </span>

                <h2 className="text-xl font-black text-[#1C1938] mt-3">
                  {isApproved
                    ? 'Congratulations! You are Approved'
                    : isRejected
                    ? 'Application Review Completed'
                    : 'Application is Under Review'}
                </h2>

                <p className="text-xs text-[#686487] mt-1 max-w-sm mx-auto leading-relaxed">
                  {isApproved
                    ? 'Your tutor profile is now public! Karnataka school students can discover you and submit learning requests.'
                    : isRejected
                    ? 'Thank you for your interest. Unfortunately, your application does not meet current verification criteria.'
                    : 'The Shikshan founder and trusted teachers review each application manually. Your profile will be approved soon.'}
                </p>
              </div>

              {isApproved && (
                <div className="pt-2">
                  <ClayButton
                    variant="primary"
                    size="lg"
                    onClick={() => navigate('/tutor/dashboard')}
                    className="w-full flex items-center justify-center gap-2 rounded-full py-3.5 text-xs font-bold shadow-button-primary"
                  >
                    Go to Tutor Dashboard
                    <ArrowRight className="w-4 h-4" />
                  </ClayButton>
                </div>
              )}
            </ClayCard>

            {/* Submitted Information Card */}
            <ClayCard className="p-6 text-left space-y-4 border border-[#DFD8F3] bg-white">
              <h3 className="font-extrabold text-sm text-[#1C1938]">Submitted Profile Overview</h3>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-[#F8F7FD] border border-[#DFD8F3]">
                  <span className="text-[#686487] block text-[10px] font-bold uppercase">Qualification</span>
                  <span className="font-bold text-[#1C1938] truncate block">{application.course_qualification}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#F8F7FD] border border-[#DFD8F3]">
                  <span className="text-[#686487] block text-[10px] font-bold uppercase">Proposed Fee</span>
                  <span className="font-bold text-[#312E81]">₹{application.fee_amount || application.proposed_rate || 350} / hr</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#686487] block mb-1">
                  Teaching Subjects
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(application.subjects || []).map((sub) => (
                    <span key={sub} className="px-2.5 py-1 rounded-lg bg-[#EEECFB] text-[#312E81] text-xs font-bold">
                      {sub}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#686487] block mb-1">
                  Bio / Approach
                </span>
                <p className="text-xs text-[#4A4668] leading-relaxed p-3 rounded-xl bg-[#F8F7FD] border border-[#DFD8F3]">
                  {application.bio_intro}
                </p>
              </div>
            </ClayCard>
          </>
        )}

        {/* Mandatory Bottom Logout Button */}
        <div className="pt-4 pb-12">
          <button
            type="button"
            onClick={() => setIsConfirmSignOutOpen(true)}
            className="w-full py-3.5 px-4 rounded-2xl bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 shadow-clay-sm flex items-center justify-center gap-2 font-bold text-xs active:scale-[0.98] transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4 stroke-[2.2]" />
            <span>Sign Out of Shikshan</span>
          </button>
        </div>
      </main>

      {/* Logout Confirmation Dialog */}
      {isConfirmSignOutOpen && (
        <div
          className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-purple-100 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
              <LogOut className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-800">
                Confirm Logout
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Are you sure you want to log out of Shikshan? You will need to sign in again to access your account.
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
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 shadow-sm transition-colors"
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
