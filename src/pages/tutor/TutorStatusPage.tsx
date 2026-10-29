import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Calendar,
  BookOpen,
  IndianRupee,
  RefreshCw,
  ArrowRight,
  GraduationCap,
} from 'lucide-react';
import { Header } from '../../components/common/Header';
import { ClayCard } from '../../components/common/ClayCard';
import { ClayButton } from '../../components/common/ClayButton';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { TutorApplication } from '../../types';

export const TutorStatusPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [application, setApplication] = useState<TutorApplication | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchStatus = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    if (!isSupabaseConfigured) {
      // Demo preview status for unconfigured state
      setApplication({
        id: 'demo-app-1',
        tutor_id: user.id,
        education_level: 'College Student (B.Sc Mathematics)',
        subjects: ['mathematics', 'science'],
        class_levels: ['classes_6_8'],
        subject_class_pairs: [{ subject: 'Mathematics', classLevelRange: 'Classes 6–8' }],
        teaching_languages: ['Kannada', 'English'],
        commitment_months: 3,
        available_days: ['mon', 'tue', 'wed', 'thu', 'fri'],
        time_windows: ['evening_prime'],
        hours_per_day: 2,
        proposed_rate: 1500,
        status: 'pending_review',
        submitted_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('tutor_applications')
        .select('*')
        .eq('tutor_id', user.id)
        .order('submitted_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching application status:', error);
      }

      if (data) {
        setApplication(data as TutorApplication);
        // If already approved, can route directly to dashboard
        if (data.status === 'approved') {
          // Allow viewing or route to dashboard
        }
      }
    } catch (err) {
      console.error('Failed to fetch status:', err);
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

  return (
    <div className="min-h-screen flex flex-col bg-[#EEF4FA]">
      <Header
        title="Application Status"
        subtitle="Tutor Verification Tracking"
        customRight={
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="w-10 h-10 rounded-2xl bg-white/90 border border-slate-200/80 shadow-sm flex items-center justify-center text-slate-700 hover:text-blue-600 active:scale-95 transition-all"
            title="Refresh Status"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        }
      />

      <main className="flex-1 max-w-xl mx-auto w-full px-4 sm:px-6 py-6 flex flex-col justify-center">
        {isLoading ? (
          <ClayCard className="p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full border-4 border-blue-600 border-t-transparent animate-spin mx-auto" />
            <p className="text-sm font-semibold text-slate-700">Checking your application status...</p>
          </ClayCard>
        ) : !application ? (
          <ClayCard className="p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-3xl bg-blue-100 text-blue-700 flex items-center justify-center mx-auto shadow-inner">
              <GraduationCap className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">No Tutor Application Found</h2>
              <p className="text-xs text-slate-600 mt-1.5">
                You have not submitted a tutor application yet, or your application is linked to another email.
              </p>
            </div>
            <div className="pt-2">
              <ClayButton
                variant="primary"
                onClick={() => navigate('/tutor/register')}
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Start Tutor Application
              </ClayButton>
            </div>
          </ClayCard>
        ) : (
          <div className="space-y-4 animate-fade-in">
            {/* Main Status Hero Card */}
            <ClayCard className="p-6 sm:p-8 space-y-5 text-center">
              <div className="flex justify-center">
                <StatusBadge status={application.status} size="lg" />
              </div>

              {/* Status Specific Message */}
              {application.status === 'pending_review' && (
                <div className="space-y-2">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                    Application Under Review
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
                    “Your application is under review. You can return later to check your status.”
                  </p>
                  <p className="text-xs text-slate-500 font-medium">
                    Our founder and trusted teachers review academic marksheets manually to uphold safe, committed learning standards for students.
                  </p>
                </div>
              )}

              {application.status === 'approved' && (
                <div className="space-y-2">
                  <h2 className="text-xl sm:text-2xl font-black text-emerald-800">
                    Congratulations! You Are Approved
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
                    Your tutor application has been verified and approved by the Shikshan team. You are now eligible to take on 3 or 6 months student cohorts.
                  </p>
                  <div className="pt-3">
                    <ClayButton
                      variant="primary"
                      fullWidth
                      onClick={() => navigate('/tutor/dashboard')}
                      icon={<ArrowRight className="w-4 h-4" />}
                    >
                      Open Tutor Dashboard
                    </ClayButton>
                  </div>
                </div>
              )}

              {application.status === 'rejected' && (
                <div className="space-y-2">
                  <h2 className="text-xl sm:text-2xl font-black text-red-900">
                    Application Status: Closed
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
                    Thank you for your interest in teaching with Shikshan. After reviewing your submission, we are currently unable to proceed with your tutor profile at this time.
                  </p>
                  {application.applicant_message && (
                    <div className="p-3 rounded-2xl bg-slate-100 text-slate-800 text-xs text-left">
                      <strong>Reviewer Note:</strong> {application.applicant_message}
                    </div>
                  )}
                </div>
              )}

              {application.status === 'needs_info' && (
                <div className="space-y-2">
                  <h2 className="text-xl sm:text-2xl font-black text-blue-900">
                    More Information Required
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
                    Our reviewers need additional details to complete your application.
                  </p>
                  {application.applicant_message && (
                    <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 text-xs text-left">
                      <strong>Message from Reviewer:</strong> {application.applicant_message}
                    </div>
                  )}
                </div>
              )}
            </ClayCard>

            {/* Application Summary Card */}
            <ClayCard className="p-6 space-y-4 text-left">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-extrabold text-sm text-slate-900">Submitted Application Summary</h3>
                <span className="text-[11px] text-slate-400">
                  {new Date(application.submitted_at).toLocaleDateString()}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
                <div className="flex items-start gap-2.5">
                  <GraduationCap className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 block text-[11px]">Education Level</span>
                    <span className="font-semibold">{application.education_level}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Calendar className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 block text-[11px]">Commitment Period</span>
                    <span className="font-semibold">{application.commitment_months} Months ({application.hours_per_day} hrs/day)</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <BookOpen className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 block text-[11px]">Teaching Subjects</span>
                    <span className="font-semibold capitalize">{application.subjects?.join(', ')}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <IndianRupee className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 block text-[11px]">Proposed Monthly Rate</span>
                    <span className="font-semibold">₹{application.proposed_rate || 'N/A'} (pending review)</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Academic documents: Protected private storage</span>
                <Link to="/help" className="text-blue-700 font-semibold hover:underline">
                  Need Help?
                </Link>
              </div>
            </ClayCard>
          </div>
        )}
      </main>
    </div>
  );
};
