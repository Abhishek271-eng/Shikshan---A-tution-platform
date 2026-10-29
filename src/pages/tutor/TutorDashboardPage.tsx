import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HeartHandshake,
  CheckCircle,
} from 'lucide-react';
import { Header } from '../../components/common/Header';
import { ClayCard } from '../../components/common/ClayCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { TutorApplication } from '../../types';

export const TutorDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [application, setApplication] = useState<TutorApplication | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadApplication = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      if (!isSupabaseConfigured) {
        setApplication({
          id: 'demo-app-1',
          tutor_id: user.id,
          education_level: 'Graduate (B.Sc Mathematics)',
          subjects: ['mathematics', 'science'],
          class_levels: ['classes_6_8'],
          subject_class_pairs: [{ subject: 'Mathematics', classLevelRange: 'Classes 6–8' }],
          teaching_languages: ['Kannada', 'English'],
          commitment_months: 6,
          available_days: ['mon', 'tue', 'wed', 'thu', 'fri'],
          time_windows: ['evening_prime'],
          hours_per_day: 2,
          proposed_rate: 1800,
          status: 'approved',
          submitted_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        setIsLoading(false);
        return;
      }

      try {
        const { data } = await supabase
          .from('tutor_applications')
          .select('*')
          .eq('tutor_id', user.id)
          .maybeSingle();

        if (data) {
          if (data.status !== 'approved') {
            navigate('/tutor/status', { replace: true });
            return;
          }
          setApplication(data as TutorApplication);
        } else {
          navigate('/tutor/register', { replace: true });
        }
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadApplication();
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-[#EEF4FA]">
      <Header title="Tutor Dashboard" subtitle="Verified Educator Portal" />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-6 space-y-5">
        {isLoading ? (
          <ClayCard className="p-8 text-center space-y-3">
            <div className="w-10 h-10 rounded-full border-4 border-blue-600 border-t-transparent animate-spin mx-auto" />
            <p className="text-xs font-semibold text-slate-600">Loading tutor dashboard...</p>
          </ClayCard>
        ) : (
          <>
            {/* Welcome Banner */}
        <ClayCard className="p-6 sm:p-8 space-y-4 text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                Approved Educator
              </span>
              <h2 className="text-2xl font-black text-slate-900 mt-0.5">
                Namaskara, {profile?.name || user?.email}!
              </h2>
              <p className="text-xs text-slate-500 mt-0.5 font-kannada">
                ಶಿಕ್ಷಣ ವೇದಿಕೆಗೆ ಸ್ವಾಗತ. ನಿಮ್ಮ ಬೋಧನಾ ಪ್ರೊಫೈಲ್ ಸಕ್ರಿಯವಾಗಿದೆ.
              </p>
            </div>
            <StatusBadge status="approved" size="md" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
            <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-100">
              <span className="text-slate-500 block text-[11px]">Commitment</span>
              <span className="font-extrabold text-blue-900 text-sm">
                {application?.commitment_months || 3} Months
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-100">
              <span className="text-slate-500 block text-[11px]">Hours / Day</span>
              <span className="font-extrabold text-blue-900 text-sm">
                {application?.hours_per_day || 2} hrs
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-100">
              <span className="text-slate-500 block text-[11px]">Language</span>
              <span className="font-extrabold text-blue-900 text-sm">
                {application?.teaching_languages?.join(', ') || 'Kannada, English'}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-100">
              <span className="text-slate-500 block text-[11px]">Review Check</span>
              <span className="font-extrabold text-emerald-800 text-sm flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                Verified
              </span>
            </div>
          </div>
        </ClayCard>

        {/* Long-Term Mentoring Principles */}
        <ClayCard className="p-6 text-left space-y-3">
          <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm">
            <HeartHandshake className="w-4 h-4 text-blue-600" />
            <span>Shikshan Educator Principles</span>
          </div>

          <div className="space-y-2 text-xs text-slate-600 leading-relaxed">
            <p className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />
              <span><strong>Consistent Regular Guidance:</strong> Support students systematically across their 3 or 6 months term rather than isolated sessions.</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />
              <span><strong>Kannada-Medium Empathy:</strong> Many students transition between Kannada and English terminology. Explain concepts with patience and local context.</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />
              <span><strong>Child Safety & Professionalism:</strong> All interactions must prioritize child safety and respectful academic encouragement.</span>
            </p>
          </div>
        </ClayCard>

        {/* Student Matching Status */}
        <ClayCard className="p-6 text-left space-y-3 border-2 border-blue-100 bg-gradient-to-br from-white to-blue-50/40">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-900">Student Cohort Matching</h3>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
              Cohort Allocation Pending
            </span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Your verification has been completed. The Shikshan team is currently matching student requests from Karnataka State Board and rural schools based on your selected subjects and availability windows. You will be notified when your student cohort is confirmed.
          </p>
        </ClayCard>
          </>
        )}
      </main>
    </div>
  );
};
