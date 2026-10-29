import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  BookOpen,
  Languages,
  Clock,
  Calendar,
} from 'lucide-react';
import { Header } from '../../components/common/Header';
import { ClayCard } from '../../components/common/ClayCard';
import { useAuth } from '../../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { StudentProfile } from '../../types';
import { SCHOOL_SUBJECTS } from '../../config/options';

export const StudentDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      if (!isSupabaseConfigured) {
        // Fallback for demo when cloud credentials are not supplied
        setStudentProfile({
          id: 'demo-student-prof',
          student_id: user.id,
          class_level: 'Class 8',
          board: 'Karnataka State Board (KSEAB / SSLC)',
          learning_language: 'Kannada (ಕನ್ನಡ)',
          subjects: ['mathematics', 'science', 'english'],
          guardian_consent: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('student_profiles')
          .select('*')
          .eq('student_id', user.id)
          .maybeSingle();

        if (error) console.error('Error fetching student profile:', error);

        if (data) {
          setStudentProfile(data as StudentProfile);
        } else {
          // If no student profile yet, send to register
          navigate('/student/register', { replace: true });
        }
      } catch (err) {
        console.error('Failed to load student profile:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-[#EEF4FA]">
      <Header title="Student Dashboard" subtitle="Shikshan Academic Portal" />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-6 space-y-5">
        {isLoading ? (
          <ClayCard className="p-8 text-center space-y-3">
            <div className="w-10 h-10 rounded-full border-4 border-blue-600 border-t-transparent animate-spin mx-auto" />
            <p className="text-xs font-semibold text-slate-600">Loading student dashboard...</p>
          </ClayCard>
        ) : (
          <>
            {/* Welcoming Card */}
        <ClayCard className="p-6 sm:p-8 space-y-4 text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                Student Learning Portal
              </span>
              <h2 className="text-2xl font-black text-slate-900 mt-0.5">
                Namaskara, {profile?.name || user?.email}!
              </h2>
              <p className="text-xs text-slate-500 font-kannada">
                ನಿಮ್ಮ ಕಲಿಕಾ ಪ್ರೊಫೈಲ್ ಸಿದ್ಧವಾಗಿದೆ.
              </p>
            </div>
            <div className="px-3.5 py-1.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold self-start sm:self-auto">
              Active Student
            </div>
          </div>

          {/* Academic Snapshot */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
            <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100">
              <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-[11px] font-bold">Class & Board</span>
              </div>
              <p className="font-extrabold text-slate-900 text-sm">
                {studentProfile?.class_level || 'Class 8'}
              </p>
              <p className="text-[11px] text-slate-600 truncate mt-0.5">
                {studentProfile?.board || 'Karnataka State Board'}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100">
              <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                <Languages className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-[11px] font-bold">Learning Medium</span>
              </div>
              <p className="font-extrabold text-slate-900 text-sm">
                {studentProfile?.learning_language || 'Kannada'}
              </p>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Primary explanation
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100">
              <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-[11px] font-bold">Support Model</span>
              </div>
              <p className="font-extrabold text-slate-900 text-sm">
                3 or 6 Months
              </p>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Dedicated Tutor
              </p>
            </div>
          </div>
        </ClayCard>

        {/* Selected Subjects for Support */}
        <ClayCard className="p-6 text-left space-y-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-600" />
            <h3 className="font-extrabold text-sm text-slate-900">
              Subjects Requiring Support
            </h3>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {studentProfile?.subjects?.map((subId) => {
              const matched = SCHOOL_SUBJECTS.find((s) => s.id === subId);
              return (
                <div
                  key={subId}
                  className="px-3.5 py-2 rounded-2xl bg-white border border-slate-200/90 shadow-sm text-xs font-semibold text-slate-800 flex items-center gap-2"
                >
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span>{matched ? matched.label : subId}</span>
                </div>
              );
            })}
          </div>
        </ClayCard>

        {/* Honest Tutor Matching Status (No fake data or fake reviews) */}
        <ClayCard className="p-6 text-left space-y-4 border-2 border-blue-200/80 bg-gradient-to-br from-white to-blue-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <h3 className="font-extrabold text-sm text-slate-900">
                Tutor Allocation Status
              </h3>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-900">
              Matching Pending
            </span>
          </div>

          <div className="space-y-2 text-xs text-slate-600 leading-relaxed">
            <p>
              <strong>Honest Matching Process:</strong> Shikshan does not display fake tutor lists, instant bots, or unverified profiles. Tutors undergo manual qualification checks and marksheet verification by our founder and trusted teachers before receiving student allocations.
            </p>
            <p>
              Your academic profile is securely registered in our cloud system. When an approved tutor matching your curriculum ({studentProfile?.board}) and medium ({studentProfile?.learning_language}) becomes available for your 3 or 6 months term, our team will coordinate the match.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/90 border border-slate-200/80 flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700">Need immediate assistance or have questions?</span>
            <button
              onClick={() => navigate('/help')}
              className="font-bold text-blue-700 hover:underline"
            >
              Contact Support &rarr;
            </button>
          </div>
        </ClayCard>
          </>
        )}
      </main>
    </div>
  );
};
