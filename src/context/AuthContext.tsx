import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { UserProfile, TutorApplication, StudentProfile, AuthState } from '../types';

interface AuthContextType extends AuthState {
  signUp: (email: string, password: string) => Promise<{ userId: string | null; error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: string | null }>;
  refreshProfile: () => Promise<void>;
  createProfile: (profile: Omit<UserProfile, 'created_at' | 'updated_at'>) => Promise<{ error: string | null }>;
  saveTutorApplication: (appData: Omit<TutorApplication, 'id' | 'created_at' | 'updated_at' | 'submitted_at' | 'reviewed_at' | 'applicant_message'>) => Promise<{ application: TutorApplication | null; error: string | null }>;
  saveStudentProfile: (studentData: Omit<StudentProfile, 'id' | 'created_at' | 'updated_at'>) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [tutorApplication, setTutorApplication] = useState<TutorApplication | null>(null);
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error] = useState<string | null>(null);

  // Load user profile and related role entities from cloud database
  const loadUserData = useCallback(async (userId: string, userEmail: string) => {
    if (!isSupabaseConfigured) {
      setUser({ id: userId, email: userEmail });
      setIsLoading(false);
      return;
    }

    try {
      setUser({ id: userId, email: userEmail });

      // 1. Fetch user profile
      const { data: profileData, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profileErr) {
        console.error('Error fetching profile:', profileErr);
      }

      if (profileData) {
        setProfile(profileData as UserProfile);

        // 2. Fetch role-specific record
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

  // Initialize auth session and listen for changes
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    // Check existing active session
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

    // Listen to Supabase auth events
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
      } else if (event === 'PASSWORD_RECOVERY') {
        // Handled in reset password component
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
      return { userId: null, error: 'Database service is currently pending setup. Please check configuration.' };
    }

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        return { userId: null, error: authError.message };
      }

      if (data.user) {
        setUser({ id: data.user.id, email: data.user.email || email });
        return { userId: data.user.id, error: null };
      }

      return { userId: null, error: 'An unexpected issue occurred during account creation. Please try again.' };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration request failed.';
      return { userId: null, error: msg };
    }
  };

  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    if (!isSupabaseConfigured) {
      return { error: 'Database service is currently pending setup. Please check configuration.' };
    }

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        return { error: authError.message };
      }

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
    if (!isSupabaseConfigured) {
      return { error: 'Database service is currently pending setup.' };
    }

    try {
      const redirectUrl = `${window.location.origin}/update-password`;
      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (resetErr) {
        return { error: resetErr.message };
      }

      return { error: null };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Password reset failed.';
      return { error: msg };
    }
  };

  const updatePassword = async (newPassword: string): Promise<{ error: string | null }> => {
    if (!isSupabaseConfigured) {
      return { error: 'Database service is currently pending setup.' };
    }

    try {
      const { error: updateErr } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateErr) {
        return { error: updateErr.message };
      }

      return { error: null };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update password.';
      return { error: msg };
    }
  };

  const createProfile = async (
    profileData: Omit<UserProfile, 'created_at' | 'updated_at'>
  ): Promise<{ error: string | null }> => {
    if (!isSupabaseConfigured) {
      return { error: 'Database connection is not configured.' };
    }

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

      if (insertErr) {
        return { error: insertErr.message };
      }

      setProfile(data as UserProfile);
      return { error: null };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save profile.';
      return { error: msg };
    }
  };

  const saveTutorApplication = async (
    appData: Omit<TutorApplication, 'id' | 'created_at' | 'updated_at' | 'submitted_at' | 'reviewed_at' | 'applicant_message'>
  ): Promise<{ application: TutorApplication | null; error: string | null }> => {
    if (!isSupabaseConfigured) {
      return { application: null, error: 'Database connection is not configured.' };
    }

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
          teaching_languages: appData.teaching_languages,
          marks_summary: appData.marks_summary,
          commitment_months: appData.commitment_months,
          available_days: appData.available_days,
          time_windows: appData.time_windows,
          hours_per_day: appData.hours_per_day,
          proposed_rate: appData.proposed_rate,
          status: 'pending_review',
        })
        .select()
        .single();

      if (insertErr) {
        return { application: null, error: insertErr.message };
      }

      const createdApp = data as TutorApplication;
      setTutorApplication(createdApp);
      return { application: createdApp, error: null };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save application.';
      return { application: null, error: msg };
    }
  };

  const saveStudentProfile = async (
    studentData: Omit<StudentProfile, 'id' | 'created_at' | 'updated_at'>
  ): Promise<{ error: string | null }> => {
    if (!isSupabaseConfigured) {
      return { error: 'Database connection is not configured.' };
    }

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
            guardian_phone: studentData.guardian_phone,
            guardian_consent: studentData.guardian_consent,
          },
          { onConflict: 'student_id' }
        )
        .select()
        .single();

      if (insertErr) {
        return { error: insertErr.message };
      }

      setStudentProfile(data as StudentProfile);
      return { error: null };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save academic profile.';
      return { error: msg };
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
