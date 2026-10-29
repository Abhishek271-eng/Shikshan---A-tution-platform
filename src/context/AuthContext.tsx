import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  UserProfile,
  TutorApplication,
  StudentProfile,
  TutorRequest,
  TutorRequestStatus,
  AuthState,
} from '../types';

interface AuthContextType extends AuthState {
  signUp: (email: string, password: string) => Promise<{ userId: string | null; error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: string | null }>;
  refreshProfile: () => Promise<void>;
  createProfile: (profile: Omit<UserProfile, 'created_at' | 'updated_at'>) => Promise<{ error: string | null }>;
  saveTutorApplication: (
    appData: Omit<TutorApplication, 'id' | 'created_at' | 'updated_at' | 'submitted_at' | 'reviewed_at' | 'applicant_message'>
  ) => Promise<{ application: TutorApplication | null; error: string | null }>;
  saveStudentProfile: (
    studentData: Omit<StudentProfile, 'id' | 'created_at' | 'updated_at'>
  ) => Promise<{ error: string | null }>;
  // Marketplace Features
  getApprovedTutors: () => Promise<TutorApplication[]>;
  createTutorRequest: (request: {
    tutorId: string;
    subject: string;
    classLevel: string;
    learningNeeds: string;
    preferredSchedule?: string;
    guardianPhone?: string;
  }) => Promise<{ request: TutorRequest | null; error: string | null }>;
  getStudentRequests: () => Promise<TutorRequest[]>;
  getTutorRequests: () => Promise<TutorRequest[]>;
  updateTutorRequestStatus: (
    requestId: string,
    status: TutorRequestStatus,
    responseMessage?: string
  ) => Promise<{ error: string | null }>;
  toggleFavoriteTutor: (tutorId: string) => Promise<{ isFavorite: boolean }>;
  getFavoriteTutorIds: () => Promise<string[]>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// High-quality initial approved tutors for instant interactive discovery
// Used when Supabase has no data or is in local demo preview
const DEFAULT_APPROVED_TUTORS: TutorApplication[] = [
  {
    id: 'app-tutor-1',
    tutor_id: 'tutor-usr-1',
    education_level: 'Graduate (B.Sc Mathematics)',
    course_qualification: 'B.Sc Mathematics & Statistics',
    institution_name: 'Bangalore University',
    subjects: ['mathematics', 'science'],
    class_levels: ['class_6', 'class_7', 'class_8', 'class_9', 'class_10'],
    subject_class_pairs: [
      { subject: 'Mathematics', classLevelRange: 'Classes 6–10' },
      { subject: 'Science', classLevelRange: 'Classes 6–8' },
    ],
    board_familiarity: ['karnataka_state_board', 'cbse'],
    teaching_languages: ['Kannada', 'English', 'Bilingual (Kannada + English)'],
    bio_intro: 'Passionate math mentor dedicated to helping rural Karnataka students conquer math anxiety through step-by-step bilingual explanations and practical examples.',
    teaching_experience: '3+ years tutoring SSLC students in Kannada medium with 95% pass rate.',
    available_days: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat'],
    time_windows: ['evening_prime', 'morning_early'],
    hours_per_day: 2,
    fee_amount: 350,
    fee_unit: 'per_hour',
    proposed_rate: 350,
    status: 'approved',
    submitted_at: '2026-10-15T10:00:00Z',
    reviewed_at: '2026-10-16T11:00:00Z',
    created_at: '2026-10-15T10:00:00Z',
    updated_at: '2026-10-16T11:00:00Z',
    tutor_profile: {
      id: 'tutor-usr-1',
      role: 'tutor',
      name: 'Anand Kumar Hegde',
      email: 'anand.hegde@shikshan.org',
      phone: '+91 9845012345',
      created_at: '2026-10-15T10:00:00Z',
      updated_at: '2026-10-16T11:00:00Z',
    },
  },
  {
    id: 'app-tutor-2',
    tutor_id: 'tutor-usr-2',
    education_level: 'Professional / Certified Teacher (B.Ed / D.Ed)',
    course_qualification: 'B.Sc Physics, B.Ed Physical Sciences',
    institution_name: 'Kuvempu University, Shivamogga',
    subjects: ['science', 'mathematics'],
    class_levels: ['class_5', 'class_6', 'class_7', 'class_8', 'class_9'],
    subject_class_pairs: [
      { subject: 'Science', classLevelRange: 'Classes 5–9' },
      { subject: 'Mathematics', classLevelRange: 'Classes 5–8' },
    ],
    board_familiarity: ['karnataka_state_board'],
    teaching_languages: ['Kannada', 'Bilingual (Kannada + English)'],
    bio_intro: 'School teacher with deep knowledge of Karnataka State Board syllabus. Special emphasis on conceptual clarity in physics and chemistry.',
    teaching_experience: '5 years teaching experience in high schools across Malnad region.',
    available_days: ['mon', 'wed', 'fri', 'sat', 'sun'],
    time_windows: ['evening_prime', 'afternoon'],
    hours_per_day: 2,
    fee_amount: 1400,
    fee_unit: 'per_month',
    proposed_rate: 1400,
    status: 'approved',
    submitted_at: '2026-10-18T09:30:00Z',
    reviewed_at: '2026-10-19T14:20:00Z',
    created_at: '2026-10-18T09:30:00Z',
    updated_at: '2026-10-19T14:20:00Z',
    tutor_profile: {
      id: 'tutor-usr-2',
      role: 'tutor',
      name: 'Dr. Savitha Murthy',
      email: 'savitha.m@shikshan.org',
      phone: '+91 9480123456',
      created_at: '2026-10-18T09:30:00Z',
      updated_at: '2026-10-19T14:20:00Z',
    },
  },
  {
    id: 'app-tutor-3',
    tutor_id: 'tutor-usr-3',
    education_level: 'Current College / University Student',
    course_qualification: 'B.A. English Literature & Journalism',
    institution_name: 'Mysore University',
    subjects: ['english', 'kannada', 'social_science'],
    class_levels: ['class_4', 'class_5', 'class_6', 'class_7', 'class_8'],
    subject_class_pairs: [
      { subject: 'English', classLevelRange: 'Classes 4–8' },
      { subject: 'Kannada', classLevelRange: 'Classes 4–8' },
    ],
    board_familiarity: ['karnataka_state_board', 'cbse'],
    teaching_languages: ['Kannada', 'English'],
    bio_intro: 'Patient and encouraging English language mentor helping students build reading habits, grammar mastery, and speaking confidence.',
    teaching_experience: 'Active volunteer tutor for rural student batches over 2 years.',
    available_days: ['tue', 'thu', 'sat', 'sun'],
    time_windows: ['evening_prime', 'morning_early'],
    hours_per_day: 1.5,
    fee_amount: 250,
    fee_unit: 'per_session',
    proposed_rate: 250,
    status: 'approved',
    submitted_at: '2026-10-20T11:00:00Z',
    reviewed_at: '2026-10-21T10:15:00Z',
    created_at: '2026-10-20T11:00:00Z',
    updated_at: '2026-10-21T10:15:00Z',
    tutor_profile: {
      id: 'tutor-usr-3',
      role: 'tutor',
      name: 'Rohan Deshmukh',
      email: 'rohan.d@shikshan.org',
      phone: '+91 9900112233',
      created_at: '2026-10-20T11:00:00Z',
      updated_at: '2026-10-21T10:15:00Z',
    },
  },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [tutorApplication, setTutorApplication] = useState<TutorApplication | null>(null);
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error] = useState<string | null>(null);

  // Local state for in-memory fallback during preview or test runs
  const [inMemoryRequests, setInMemoryRequests] = useState<TutorRequest[]>([]);
  const [inMemoryFavorites, setInMemoryFavorites] = useState<string[]>([]);

  // Load user profile and related role entities from cloud database
  const loadUserData = useCallback(async (userId: string, userEmail: string) => {
    if (!isSupabaseConfigured) {
      setUser({ id: userId, email: userEmail });
      setIsLoading(false);
      return;
    }

    try {
      setUser({ id: userId, email: userEmail });

      const { data: profileData, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profileErr) console.error('Error fetching profile:', profileErr);

      if (profileData) {
        setProfile(profileData as UserProfile);

        if (profileData.role === 'tutor') {
          const { data: tutorApp, error: tutorErr } = await supabase
            .from('tutor_applications')
            .select('*')
            .eq('tutor_id', userId)
            .order('submitted_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (tutorErr) console.error('Error fetching tutor application:', tutorErr);
          if (tutorApp) setTutorApplication(tutorApp as TutorApplication);
        } else if (profileData.role === 'student') {
          const { data: studentData, error: studentErr } = await supabase
            .from('student_profiles')
            .select('*')
            .eq('student_id', userId)
            .maybeSingle();

          if (studentErr) console.error('Error fetching student profile:', studentErr);
          if (studentData) setStudentProfile(studentData as StudentProfile);
        }
      } else {
        setProfile(null);
      }
    } catch (err) {
      console.error('Unexpected error loading user data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return;
      if (session?.user) {
        loadUserData(session.user.id, session.user.email || '');
      } else {
        setIsLoading(false);
      }
    }).catch((err) => {
      console.error('Session retrieval error:', err);
      if (isMounted) setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      if (event === 'SIGNED_IN' && session?.user) {
        await loadUserData(session.user.id, session.user.email || '');
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        setTutorApplication(null);
        setStudentProfile(null);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [loadUserData]);

  const refreshProfile = useCallback(async () => {
    if (user) {
      await loadUserData(user.id, user.email);
    }
  }, [user, loadUserData]);

  const signUp = async (email: string, password: string): Promise<{ userId: string | null; error: string | null }> => {
    if (!isSupabaseConfigured) {
      const demoId = 'usr-' + Date.now();
      setUser({ id: demoId, email });
      return { userId: demoId, error: null };
    }

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) return { userId: null, error: authError.message };

      if (data.user) {
        setUser({ id: data.user.id, email: data.user.email || email });
        return { userId: data.user.id, error: null };
      }

      return { userId: null, error: 'Registration failed. Please check credentials.' };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration request failed.';
      return { userId: null, error: msg };
    }
  };

  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    if (!isSupabaseConfigured) {
      const demoId = 'usr-' + Date.now();
      setUser({ id: demoId, email });
      return { error: null };
    }

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) return { error: authError.message };

      if (data.user) {
        await loadUserData(data.user.id, data.user.email || email);
      }

      return { error: null };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sign in request failed.';
      return { error: msg };
    }
  };

  const signOut = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setProfile(null);
    setTutorApplication(null);
    setStudentProfile(null);
  };

  const resetPassword = async (email: string): Promise<{ error: string | null }> => {
    if (!isSupabaseConfigured) return { error: null };

    try {
      const redirectUrl = `${window.location.origin}/update-password`;
      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (resetErr) return { error: resetErr.message };
      return { error: null };
    } catch (err: unknown) {
      return { error: err instanceof Error ? err.message : 'Password reset failed.' };
    }
  };

  const updatePassword = async (newPassword: string): Promise<{ error: string | null }> => {
    if (!isSupabaseConfigured) return { error: null };

    try {
      const { error: updateErr } = await supabase.auth.updateUser({ password: newPassword });
      if (updateErr) return { error: updateErr.message };
      return { error: null };
    } catch (err: unknown) {
      return { error: err instanceof Error ? err.message : 'Failed to update password.' };
    }
  };

  const createProfile = async (
    profileData: Omit<UserProfile, 'created_at' | 'updated_at'>
  ): Promise<{ error: string | null }> => {
    const newProf: UserProfile = {
      ...profileData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setProfile(newProf);

    if (!isSupabaseConfigured) return { error: null };

    try {
      const { data, error: insertErr } = await supabase
        .from('profiles')
        .upsert(
          {
            id: profileData.id,
            role: profileData.role,
            name: profileData.name,
            email: profileData.email,
            phone: profileData.phone,
          },
          { onConflict: 'id' }
        )
        .select()
        .single();

      if (insertErr) return { error: insertErr.message };
      setProfile(data as UserProfile);
      return { error: null };
    } catch (err: unknown) {
      return { error: err instanceof Error ? err.message : 'Failed to save profile.' };
    }
  };

  const saveTutorApplication = async (
    appData: Omit<TutorApplication, 'id' | 'created_at' | 'updated_at' | 'submitted_at' | 'reviewed_at' | 'applicant_message'>
  ): Promise<{ application: TutorApplication | null; error: string | null }> => {
    const newApp: TutorApplication = {
      ...appData,
      id: 'app-' + Date.now(),
      status: 'pending_review',
      submitted_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setTutorApplication(newApp);

    if (!isSupabaseConfigured) return { application: newApp, error: null };

    try {
      const { data, error: insertErr } = await supabase
        .from('tutor_applications')
        .insert({
          tutor_id: appData.tutor_id,
          education_level: appData.education_level,
          course_qualification: appData.course_qualification,
          institution_name: appData.institution_name,
          subjects: appData.subjects,
          class_levels: appData.class_levels,
          subject_class_pairs: appData.subject_class_pairs,
          board_familiarity: appData.board_familiarity || [],
          teaching_languages: appData.teaching_languages,
          marks_summary: appData.marks_summary,
          bio_intro: appData.bio_intro,
          teaching_experience: appData.teaching_experience,
          commitment_months: appData.commitment_months || null,
          available_days: appData.available_days,
          time_windows: appData.time_windows,
          hours_per_day: appData.hours_per_day,
          proposed_rate: appData.fee_amount || appData.proposed_rate,
          fee_amount: appData.fee_amount || appData.proposed_rate,
          fee_unit: appData.fee_unit || 'per_month',
          status: 'pending_review',
        })
        .select()
        .single();

      if (insertErr) return { application: null, error: insertErr.message };
      const created = data as TutorApplication;
      setTutorApplication(created);
      return { application: created, error: null };
    } catch (err: unknown) {
      return { application: null, error: err instanceof Error ? err.message : 'Failed to save application.' };
    }
  };

  const saveStudentProfile = async (
    studentData: Omit<StudentProfile, 'id' | 'created_at' | 'updated_at'>
  ): Promise<{ error: string | null }> => {
    const newStud: StudentProfile = {
      ...studentData,
      id: 'stud-' + Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setStudentProfile(newStud);

    if (!isSupabaseConfigured) return { error: null };

    try {
      const { data, error: insertErr } = await supabase
        .from('student_profiles')
        .upsert(
          {
            student_id: studentData.student_id,
            class_level: studentData.class_level,
            board: studentData.board,
            learning_language: studentData.learning_language,
            subjects: studentData.subjects,
            learning_goals: studentData.learning_goals,
            guardian_phone: studentData.guardian_phone,
            guardian_consent: studentData.guardian_consent,
          },
          { onConflict: 'student_id' }
        )
        .select()
        .single();

      if (insertErr) return { error: insertErr.message };
      setStudentProfile(data as StudentProfile);
      return { error: null };
    } catch (err: unknown) {
      return { error: err instanceof Error ? err.message : 'Failed to save student profile.' };
    }
  };

  // --- MARKETPLACE QUERIES ---

  const getApprovedTutors = async (): Promise<TutorApplication[]> => {
    if (!isSupabaseConfigured) {
      return DEFAULT_APPROVED_TUTORS;
    }

    try {
      const { data, error: queryErr } = await supabase
        .from('tutor_applications')
        .select(`
          *,
          tutor_profile:profiles!tutor_applications_tutor_id_fkey(*)
        `)
        .eq('status', 'approved')
        .order('reviewed_at', { ascending: false });

      if (queryErr) {
        console.error('Error fetching approved tutors from database:', queryErr);
        return [];
      }

      // Return real database results (empty array if none have been approved yet)
      return (data || []) as TutorApplication[];
    } catch (err) {
      console.error('Failed to get approved tutors from database:', err);
      return [];
    }
  };

  const createTutorRequest = async (request: {
    tutorId: string;
    subject: string;
    classLevel: string;
    learningNeeds: string;
    preferredSchedule?: string;
    guardianPhone?: string;
  }): Promise<{ request: TutorRequest | null; error: string | null }> => {
    const studentId = user?.id || 'demo-student';

    // Check for duplicate pending requests
    if (!isSupabaseConfigured) {
      const duplicate = inMemoryRequests.find(
        (r) => r.student_id === studentId && r.tutor_id === request.tutorId && r.status === 'pending'
      );
      if (duplicate) {
        return { request: null, error: 'You already have an active pending request with this tutor.' };
      }

      const newReq: TutorRequest = {
        id: 'req-' + Date.now(),
        student_id: studentId,
        tutor_id: request.tutorId,
        subject: request.subject,
        class_level: request.classLevel,
        learning_needs: request.learningNeeds,
        preferred_schedule: request.preferredSchedule,
        guardian_phone: request.guardianPhone,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        tutor_application: DEFAULT_APPROVED_TUTORS.find((t) => t.tutor_id === request.tutorId),
      };

      setInMemoryRequests((prev) => [newReq, ...prev]);
      return { request: newReq, error: null };
    }

    try {
      // Duplicate check in database
      const { data: existing } = await supabase
        .from('tutor_requests')
        .select('id')
        .eq('student_id', studentId)
        .eq('tutor_id', request.tutorId)
        .eq('status', 'pending')
        .maybeSingle();

      if (existing) {
        return { request: null, error: 'You already have an active pending request with this tutor.' };
      }

      const { data, error: insertErr } = await supabase
        .from('tutor_requests')
        .insert({
          student_id: studentId,
          tutor_id: request.tutorId,
          subject: request.subject,
          class_level: request.classLevel,
          learning_needs: request.learningNeeds,
          preferred_schedule: request.preferredSchedule,
          guardian_phone: request.guardianPhone,
          status: 'pending',
        })
        .select(`
          *,
          tutor_profile:profiles!tutor_requests_tutor_id_fkey(*),
          tutor_application:tutor_applications!tutor_requests_tutor_id_fkey(*)
        `)
        .single();

      if (insertErr) return { request: null, error: insertErr.message };
      return { request: data as TutorRequest, error: null };
    } catch (err: unknown) {
      return { request: null, error: err instanceof Error ? err.message : 'Failed to submit request.' };
    }
  };

  const getStudentRequests = async (): Promise<TutorRequest[]> => {
    const studentId = user?.id || 'demo-student';

    if (!isSupabaseConfigured) {
      return inMemoryRequests.filter((r) => r.student_id === studentId);
    }

    try {
      const { data, error: queryErr } = await supabase
        .from('tutor_requests')
        .select(`
          *,
          tutor_profile:profiles!tutor_requests_tutor_id_fkey(*),
          tutor_application:tutor_applications!tutor_requests_tutor_id_fkey(*)
        `)
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });

      if (queryErr) {
        console.error('Error fetching student requests:', queryErr);
        return [];
      }

      return (data || []) as TutorRequest[];
    } catch (err) {
      console.error('Failed to get student requests:', err);
      return [];
    }
  };

  const getTutorRequests = async (): Promise<TutorRequest[]> => {
    const tutorId = user?.id || 'tutor-usr-1';

    if (!isSupabaseConfigured) {
      return inMemoryRequests.filter((r) => r.tutor_id === tutorId);
    }

    try {
      const { data, error: queryErr } = await supabase
        .from('tutor_requests')
        .select(`
          *,
          student_profile:profiles!tutor_requests_student_id_fkey(*),
          student_academic:student_profiles!tutor_requests_student_id_fkey(*)
        `)
        .eq('tutor_id', tutorId)
        .order('created_at', { ascending: false });

      if (queryErr) {
        console.error('Error fetching tutor requests:', queryErr);
        return [];
      }

      return (data || []) as TutorRequest[];
    } catch (err) {
      console.error('Failed to get tutor requests:', err);
      return [];
    }
  };

  const updateTutorRequestStatus = async (
    requestId: string,
    status: TutorRequestStatus,
    responseMessage?: string
  ): Promise<{ error: string | null }> => {
    if (!isSupabaseConfigured) {
      setInMemoryRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status, response_message: responseMessage } : r))
      );
      return { error: null };
    }

    try {
      const { error: updateErr } = await supabase
        .from('tutor_requests')
        .update({
          status,
          response_message: responseMessage,
          updated_at: new Date().toISOString(),
        })
        .eq('id', requestId);

      if (updateErr) return { error: updateErr.message };
      return { error: null };
    } catch (err: unknown) {
      return { error: err instanceof Error ? err.message : 'Failed to update request.' };
    }
  };

  const toggleFavoriteTutor = async (tutorId: string): Promise<{ isFavorite: boolean }> => {
    const studentId = user?.id || 'demo-student';

    if (!isSupabaseConfigured) {
      const exists = inMemoryFavorites.includes(tutorId);
      if (exists) {
        setInMemoryFavorites((prev) => prev.filter((id) => id !== tutorId));
        return { isFavorite: false };
      } else {
        setInMemoryFavorites((prev) => [...prev, tutorId]);
        return { isFavorite: true };
      }
    }

    try {
      const { data: existing } = await supabase
        .from('tutor_favorites')
        .select('id')
        .eq('student_id', studentId)
        .eq('tutor_id', tutorId)
        .maybeSingle();

      if (existing) {
        await supabase.from('tutor_favorites').delete().eq('id', existing.id);
        return { isFavorite: false };
      } else {
        await supabase.from('tutor_favorites').insert({
          student_id: studentId,
          tutor_id: tutorId,
        });
        return { isFavorite: true };
      }
    } catch (err) {
      console.error('Toggle favorite failed:', err);
      return { isFavorite: false };
    }
  };

  const getFavoriteTutorIds = async (): Promise<string[]> => {
    const studentId = user?.id || 'demo-student';

    if (!isSupabaseConfigured) {
      return inMemoryFavorites;
    }

    try {
      const { data, error: favErr } = await supabase
        .from('tutor_favorites')
        .select('tutor_id')
        .eq('student_id', studentId);

      if (favErr) return [];
      return (data || []).map((f) => f.tutor_id);
    } catch (err) {
      console.error('Get favorites failed:', err);
      return [];
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        tutorApplication,
        studentProfile,
        isLoading,
        isConfigured: isSupabaseConfigured,
        error,
        signUp,
        signIn,
        signOut,
        resetPassword,
        updatePassword,
        refreshProfile,
        createProfile,
        saveTutorApplication,
        saveStudentProfile,
        getApprovedTutors,
        createTutorRequest,
        getStudentRequests,
        getTutorRequests,
        updateTutorRequestStatus,
        toggleFavoriteTutor,
        getFavoriteTutorIds,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
