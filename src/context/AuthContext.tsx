import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api, setAuthToken, getAuthToken } from '../lib/api';
import {
  UserProfile,
  TutorApplication,
  StudentProfile,
  TutorRequest,
  TutorRequestStatus,
  AuthState,
} from '../types';

interface AuthContextType extends AuthState {
  signUp: (
    email: string,
    password: string,
    name?: string,
    phone?: string,
    role?: 'student' | 'tutor' | 'admin'
  ) => Promise<{ userId: string | null; error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null; user?: UserProfile }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: string | null }>;
  refreshProfile: () => Promise<void>;
  createProfile: (profile: Omit<UserProfile, 'created_at' | 'updated_at'>) => Promise<{ error: string | null }>;
  saveTutorApplication: (
    appData: any
  ) => Promise<{ application: TutorApplication | null; error: string | null }>;
  saveStudentProfile: (
    studentData: any
  ) => Promise<{ error: string | null }>;
  // Marketplace Features
  getApprovedTutors: (params?: { subject?: string; classLevel?: string; search?: string }) => Promise<TutorApplication[]>;
  createTutorRequest: (request: {
    tutorId: string;
    batchId?: string;
    batchName?: string;
    batchTime?: string;
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
  uploadPhoto: (photoData: string) => Promise<{ success: boolean; photoUrl?: string; error?: string | null }>;
  removePhoto: () => Promise<{ success: boolean; error?: string | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [tutorApplication, setTutorApplication] = useState<TutorApplication | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize session on mount
  const refreshProfile = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setUser(null);
      setProfile(null);
      setStudentProfile(null);
      setTutorApplication(null);
      setIsLoading(false);
      return;
    }

    try {
      const { user: currentUser } = await api.getMe();
      if (currentUser) {
        setUser(currentUser);
        setProfile({
          id: currentUser.id,
          email: currentUser.email,
          role: currentUser.role,
          name: currentUser.name,
          phone: currentUser.phone,
          photo_url: currentUser.photo_url,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        // Load role specific profile
        if (currentUser.role === 'student') {
          try {
            const { profile: sp } = await api.getStudentProfile();
            setStudentProfile(sp);
          } catch (e) {}
        } else if (currentUser.role === 'tutor') {
          try {
            const { application: ta } = await api.getTutorMyStatus();
            setTutorApplication(ta);
          } catch (e) {}
        }
      } else {
        setAuthToken(null);
        setUser(null);
        setProfile(null);
      }
    } catch (err) {
      console.warn('Session expired or server unreachable:', err);
      if (err instanceof Error && (err.message.includes('401') || err.message.includes('token'))) {
        setAuthToken(null);
        setUser(null);
        setProfile(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const signIn = async (email: string, password: string): Promise<{ error: string | null; user?: UserProfile }> => {
    try {
      const res = await api.login({ email, password });
      setAuthToken(res.token);
      setUser(res.user);
      const userProfile: UserProfile = {
        id: res.user.id,
        email: res.user.email,
        role: res.user.role,
        name: res.user.name,
        phone: res.user.phone,
        photo_url: res.user.photo_url,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setProfile(userProfile);

      // Load role specific data
      if (res.user.role === 'student') {
        const { profile: sp } = await api.getStudentProfile().catch(() => ({ profile: null }));
        setStudentProfile(sp);
      } else if (res.user.role === 'tutor') {
        const { application: ta } = await api.getTutorMyStatus().catch(() => ({ application: null }));
        setTutorApplication(ta);
      }

      return { error: null, user: userProfile };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Sign in failed. Check server connection.' };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    name?: string,
    phone?: string,
    role: 'student' | 'tutor' | 'admin' = 'student'
  ): Promise<{ userId: string | null; error: string | null }> => {
    try {
      const res = await api.register({
        email,
        password,
        name: name || 'User',
        phone: phone || '9999999999',
        role,
      });

      setAuthToken(res.token);
      setUser(res.user);
      setProfile({
        id: res.user.id,
        email: res.user.email,
        role: res.user.role,
        name: res.user.name,
        phone: res.user.phone,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      return { userId: res.user.id, error: null };
    } catch (err) {
      return { userId: null, error: err instanceof Error ? err.message : 'Registration failed.' };
    }
  };

  const signOut = async () => {
    setAuthToken(null);
    setUser(null);
    setProfile(null);
    setStudentProfile(null);
    setTutorApplication(null);
  };

  const resetPassword = async (_email: string) => {
    return { error: 'Please contact administrator to reset your local database password.' };
  };

  const updatePassword = async (_newPassword: string) => {
    return { error: 'Password update is handled via profile settings.' };
  };

  const createProfile = async (newProfile: Omit<UserProfile, 'created_at' | 'updated_at'>) => {
    setProfile({
      ...newProfile,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    return { error: null };
  };

  const saveStudentProfile = async (studentData: any) => {
    try {
      await api.saveStudentProfile(studentData);
      setStudentProfile(studentData);
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Failed to save student profile' };
    }
  };

  const saveTutorApplication = async (appData: any) => {
    try {
      await api.saveTutorProfile(appData);
      const { application } = await api.getTutorMyStatus();
      setTutorApplication(application);
      return { application, error: null };
    } catch (err) {
      return { application: null, error: err instanceof Error ? err.message : 'Failed to save tutor profile' };
    }
  };

  // Real Marketplace Data from MySQL
  const getApprovedTutors = async (params?: { subject?: string; classLevel?: string; search?: string }): Promise<TutorApplication[]> => {
    try {
      const res = await api.getApprovedTutors(params);
      return res.tutors || [];
    } catch (err) {
      console.error('Failed to fetch tutors from MySQL:', err);
      return [];
    }
  };

  const createTutorRequest = async (request: {
    tutorId: string;
    batchId?: string;
    batchName?: string;
    batchTime?: string;
    subject: string;
    classLevel: string;
    learningNeeds: string;
    preferredSchedule?: string;
    guardianPhone?: string;
  }): Promise<{ request: TutorRequest | null; error: string | null }> => {
    try {
      const res = await api.createTutorRequest({
        tutor_id: request.tutorId,
        batch_id: request.batchId,
        batch_name: request.batchName,
        batch_time: request.batchTime,
        subject: request.subject,
        class_level: request.classLevel,
        learning_needs: request.learningNeeds,
        preferred_schedule: request.preferredSchedule,
        guardian_phone: request.guardianPhone,
      });

      const newReq: TutorRequest = {
        id: res.requestId,
        student_id: user?.id || '',
        tutor_id: request.tutorId,
        batch_id: request.batchId,
        batch_name: request.batchName,
        batch_time: request.batchTime,
        subject: request.subject,
        class_level: request.classLevel,
        learning_needs: request.learningNeeds,
        preferred_schedule: request.preferredSchedule,
        guardian_phone: request.guardianPhone,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      return { request: newReq, error: null };
    } catch (err) {
      return { request: null, error: err instanceof Error ? err.message : 'Failed to create request' };
    }
  };

  const getStudentRequests = async (): Promise<TutorRequest[]> => {
    try {
      const res = await api.getStudentRequests();
      return res.requests || [];
    } catch (err) {
      return [];
    }
  };

  const getTutorRequests = async (): Promise<TutorRequest[]> => {
    try {
      const res = await api.getTutorRequests();
      return res.requests || [];
    } catch (err) {
      return [];
    }
  };

  const updateTutorRequestStatus = async (
    requestId: string,
    status: TutorRequestStatus,
    responseMessage?: string
  ): Promise<{ error: string | null }> => {
    try {
      await api.updateRequestStatus(requestId, status, responseMessage);
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Failed to update request' };
    }
  };

  const toggleFavoriteTutor = async (tutorId: string): Promise<{ isFavorite: boolean }> => {
    try {
      const res = await api.toggleFavorite(tutorId);
      return { isFavorite: res.favorited };
    } catch (err) {
      return { isFavorite: false };
    }
  };

  const getFavoriteTutorIds = async (): Promise<string[]> => {
    try {
      const res = await api.getFavorites();
      return res.favorites || [];
    } catch (err) {
      return [];
    }
  };

  const uploadPhoto = async (photoData: string): Promise<{ success: boolean; photoUrl?: string; error?: string | null }> => {
    try {
      const res = await api.uploadPhoto(photoData);
      if (res.success && res.photo_url) {
        setUser((prev: any) => (prev ? { ...prev, photo_url: res.photo_url } : null));
        setProfile((prev: any) => (prev ? { ...prev, photo_url: res.photo_url } : null));
        setStudentProfile((prev: any) => (prev ? { ...prev, photo_url: res.photo_url } : null));
        setTutorApplication((prev: any) => (prev ? { ...prev, photo_url: res.photo_url } : null));
        return { success: true, photoUrl: res.photo_url };
      }
      return { success: false, error: 'Upload failed' };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Photo upload failed' };
    }
  };

  const removePhoto = async (): Promise<{ success: boolean; error?: string | null }> => {
    try {
      const res = await api.removePhoto();
      if (res.success) {
        setUser((prev: any) => (prev ? { ...prev, photo_url: undefined } : null));
        setProfile((prev: any) => (prev ? { ...prev, photo_url: undefined } : null));
        setStudentProfile((prev: any) => (prev ? { ...prev, photo_url: undefined } : null));
        setTutorApplication((prev: any) => (prev ? { ...prev, photo_url: undefined } : null));
        return { success: true };
      }
      return { success: false, error: 'Remove failed' };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Photo removal failed' };
    }
  };

  const value: AuthContextType = {
    user,
    profile,
    studentProfile,
    tutorApplication,
    isLoading,
    isAuthenticated: Boolean(user),
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
    uploadPhoto,
    removePhoto,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
