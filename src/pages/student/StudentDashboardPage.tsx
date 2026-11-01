import React, { useEffect, useState, useMemo } from 'react';
import {
  Compass,
  Send,
  Heart,
  RefreshCw,
  LogOut,
  Sparkles,
  ArrowRight,
  Phone,
  ShieldCheck,
  CheckCircle2,
  Clock,
  CreditCard,
  X,
  GraduationCap,
} from 'lucide-react';
import { Header } from '../../components/common/Header';
import { SetupNotice } from '../../components/common/SetupNotice';
import { TutorCard } from '../../components/marketplace/TutorCard';
import { TutorFilterBar, TutorFilters } from '../../components/marketplace/TutorFilterBar';
import { TutorProfileModal } from '../../components/marketplace/TutorProfileModal';
import { TutorRequestModal } from '../../components/marketplace/TutorRequestModal';
import { ClaySubjectIcon, ClayStudentStudyDesk } from '../../components/common/Clay3DIllustrations';
import { ClayBottomNavigation, BottomNavTab } from '../../components/common/ClayBottomNavigation';
import { ClayEmptyState } from '../../components/common/ClayEmptyState';
import { ClayButton } from '../../components/common/ClayButton';
import { ClayCard } from '../../components/common/ClayCard';
import { ClaySearchBar } from '../../components/common/ClaySearchBar';
import { ClayUploadButton } from '../../components/common/ClayUploadButton';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { api } from '../../lib/api';
import { TutorApplication, TutorRequest } from '../../types';
import { SCHOOL_SUBJECTS } from '../../config/options';

export const StudentDashboardPage: React.FC = () => {
  const {
    user,
    profile,
    studentProfile,
    getApprovedTutors,
    getStudentRequests,
    toggleFavoriteTutor,
    getFavoriteTutorIds,
    updateTutorRequestStatus,
    uploadPhoto,
    removePhoto,
    signOut,
  } = useAuth();

  const { pushBackHandler } = useNavigation();

  const [activeTab, setActiveTab] = useState<BottomNavTab>('home');
  const [tutors, setTutors] = useState<TutorApplication[]>([]);
  const [myRequests, setMyRequests] = useState<TutorRequest[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [paymentRecords, setPaymentRecords] = useState<any[]>([]);
  const [submittingPaymentForReq, setSubmittingPaymentForReq] = useState<string | null>(null);
  const [paymentSuccessMessage, setPaymentSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modals state
  const [selectedTutorForProfile, setSelectedTutorForProfile] = useState<TutorApplication | null>(null);
  const [selectedTutorForRequest, setSelectedTutorForRequest] = useState<TutorApplication | null>(null);
  const [selectedReqForPayment, setSelectedReqForPayment] = useState<TutorRequest | null>(null);

  // Hardware/Global Back Interceptor for Tabs
  useEffect(() => {
    if (activeTab !== 'home') {
      const unregister = pushBackHandler(() => {
        setActiveTab('home');
        return true;
      });
      return unregister;
    }
  }, [activeTab, pushBackHandler]);

  // Filters State
  const [filters, setFilters] = useState<TutorFilters>({
    searchQuery: '',
    selectedSubject: '',
    selectedClass: '',
    selectedBoard: '',
    selectedLanguage: '',
    maxPrice: 5000,
  });

  const loadData = async () => {
    try {
      const [fetchedTutors, fetchedRequests, fetchedFavs, fetchedPayments] = await Promise.all([
        getApprovedTutors(),
        getStudentRequests(),
        getFavoriteTutorIds(),
        api.getStudentPaymentCoordinations().catch(() => ({ payments: [] })),
      ]);

      setTutors(fetchedTutors);
      setMyRequests(fetchedRequests);
      setFavoriteIds(fetchedFavs);
      setPaymentRecords(fetchedPayments.payments || []);
    } catch (err) {
      console.error('Failed to load marketplace data:', err);
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

  const handleToggleFavorite = async (tutorId: string) => {
    const { isFavorite } = await toggleFavoriteTutor(tutorId);
    if (isFavorite) {
      setFavoriteIds((prev) => [...prev, tutorId]);
    } else {
      setFavoriteIds((prev) => prev.filter((id) => id !== tutorId));
    }
  };

  const handleExpressPaymentInterest = async (req: TutorRequest) => {
    setSubmittingPaymentForReq(req.id);
    try {
      const res = await api.recordPaymentInterest({
        requestId: req.id,
        tutorId: req.tutor_id,
        batchId: (req as any).batch_id,
      });
      if (res.success) {
        setPaymentSuccessMessage(
          `Your interest for ${req.tutor_name || 'this tutor'} has been registered! Shikshan admin will coordinate enrollment & payment verification.`
        );
        const payRes = await api.getStudentPaymentCoordinations();
        setPaymentRecords(payRes.payments || []);
      }
    } catch (err: any) {
      alert(err?.message || 'Failed to record payment interest');
    } finally {
      setSubmittingPaymentForReq(null);
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    if (!confirm('Are you sure you want to cancel this tutor request?')) return;
    await updateTutorRequestStatus(requestId, 'cancelled');
    setMyRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'cancelled' } : r))
    );
  };

  // Filter logic
  const filteredTutors = useMemo(() => {
    return tutors.filter((tutor) => {
      if (tutor.status !== 'approved') return false;

      // Search query filter
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const tutorName = tutor.tutor_profile?.name?.toLowerCase() || (tutor as any).name?.toLowerCase() || '';
        const bio = tutor.bio_intro?.toLowerCase() || '';
        const subjects = (tutor.subjects || []).join(' ').toLowerCase();
        if (!tutorName.includes(query) && !bio.includes(query) && !subjects.includes(query)) {
          return false;
        }
      }

      // Subject filter
      if (filters.selectedSubject && !tutor.subjects?.includes(filters.selectedSubject)) {
        return false;
      }

      // Class level filter
      if (filters.selectedClass && !tutor.class_levels?.includes(filters.selectedClass)) {
        return false;
      }

      // Board familiarity filter
      if (
        filters.selectedBoard &&
        tutor.board_familiarity &&
        !tutor.board_familiarity.includes(filters.selectedBoard)
      ) {
        return false;
      }

      // Language filter
      if (
        filters.selectedLanguage &&
        !tutor.teaching_languages?.some((l) =>
          l.toLowerCase().includes(filters.selectedLanguage.toLowerCase())
        )
      ) {
        return false;
      }

      // Price filter
      const fee = tutor.fee_amount || tutor.proposed_rate || 0;
      if (fee > filters.maxPrice) {
        return false;
      }

      return true;
    });
  }, [tutors, filters]);

  const savedTutorsList = useMemo(() => {
    return tutors.filter((t) => favoriteIds.includes(t.tutor_id || t.id));
  }, [tutors, favoriteIds]);

  const studentDisplayName =
    profile?.name || (user as any)?.name || (profile as any)?.student_name || 'Student';

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F5FC] select-none pb-28">
      {/* Header with Title & Refresh */}
      <Header
        title="Shikshan"
        subtitle={`Namaskara, ${studentDisplayName}!`}
        customRight={
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white border border-[#E5DFF8] shadow-clay-sm flex items-center justify-center text-[#1C1938] hover:text-[#7C3AED] active:scale-95 transition-all cursor-pointer"
            title="Refresh Data"
            aria-label="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#7C3AED]' : ''}`} />
          </button>
        }
      />
      <SetupNotice />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-5 space-y-6">
        {/* ========================================================================= */}
        {/* VIEW 1: STUDENT HOME (Complete Redesign with Compact Welcome & Sections) */}
        {/* ========================================================================= */}
        {activeTab === 'home' && (
          <div className="space-y-6 animate-fade-in">
            {/* 1. Creative Educational Hero Section (Prominent 3D Clay Student Studying at Desk) */}
            <div className="overflow-hidden rounded-[28px] p-4 sm:p-5 bg-gradient-to-br from-white/95 via-[#FAF9FE]/95 to-[#F1EDFB]/95 border border-[#E5DFF8] shadow-clay text-left flex items-center justify-between gap-3 sm:gap-5">
              <div className="space-y-1.5 max-w-md">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EDE9FE] text-[#6D28D9] text-[10px] font-black">
                  <Sparkles className="w-3.5 h-3.5 text-[#7C3AED]" />
                  <span>Karnataka State Syllabus • Classes 1–10</span>
                </div>

                <div className="pt-0.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#7C3AED] block">
                    Academic Mentorship Platform
                  </span>
                  <h2 className="text-lg sm:text-xl font-black text-[#1C1938] tracking-tight">
                    Welcome, {studentDisplayName}
                  </h2>
                </div>

                <p className="text-xs sm:text-sm text-[#4A4668] font-medium leading-relaxed">
                  Master Karnataka curriculum topics with verified mentors in focused, 4-student batches.
                </p>

                {/* Browse Mentors button */}
                <div className="pt-1.5">
                  <ClayButton
                    variant="primary"
                    size="sm"
                    onClick={() => setActiveTab('discover')}
                    icon={<Compass className="w-4 h-4" />}
                    aria-label="Browse Mentors"
                  >
                    Browse Mentors
                  </ClayButton>
                </div>
              </div>

              {/* 3D Clay Student Studying at Desk Illustration */}
              <div className="flex-shrink-0 flex items-center justify-center">
                <ClayStudentStudyDesk size={105} className="sm:scale-105" />
              </div>
            </div>

            {/* 2. Find Tutors Discovery Card (Quick Search & Class Selector) */}
            <ClayCard className="space-y-2.5 p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5 text-left">
                  <h3 className="text-sm font-black text-[#1C1938] tracking-tight">
                    Search Mentors & Topics
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('discover')}
                  className="text-xs font-bold text-[#7C3AED] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>All Filters</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <ClaySearchBar
                value={filters.searchQuery}
                onChange={(query) => {
                  setFilters({ ...filters, searchQuery: query });
                }}
                placeholder="Search Mentors & Topics"
                onFilterClick={() => setActiveTab('discover')}
              />
            </ClayCard>

            {/* 3. Subject Categories (Interactive Clay Cards with Real Mentor Counts) */}
            <div className="space-y-3 text-left">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-[#1C1938] tracking-tight">
                    Explore Subjects
                  </h3>
                  <p className="text-[11px] text-[#686487] font-kannada">
                    ವಿಷಯವಾರು ಶಿಕ್ಷಕರನ್ನು ಹುಡುಕಿ
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFilters({ ...filters, selectedSubject: '' });
                    setActiveTab('discover');
                  }}
                  className="text-xs font-bold text-[#7C3AED] hover:underline"
                >
                  View All
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {SCHOOL_SUBJECTS.map((sub) => {
                  const isSelected = filters.selectedSubject === sub.id;
                  const mentorCount = tutors.filter((t) =>
                    t.subjects?.some((s) => s.toLowerCase().includes(sub.id.toLowerCase()))
                  ).length;

                  return (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => {
                        setFilters({ ...filters, selectedSubject: sub.id });
                        setActiveTab('discover');
                      }}
                      className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all active:scale-95 cursor-pointer shadow-clay-sm ${
                        isSelected
                          ? 'bg-[#EDE9FE] border-[#7C3AED] text-[#6D28D9]'
                          : 'bg-white hover:bg-[#FAF9FE] border-[#E5DFF8] text-[#1C1938]'
                      }`}
                    >
                      <ClaySubjectIcon subject={sub.id} size={38} />
                      <div className="min-w-0">
                        <span className="text-xs font-black block truncate">
                          {sub.label.split(' ')[0]}
                        </span>
                        <span className="text-[10px] text-[#686487] block font-kannada truncate">
                          {sub.kannadaLabel?.split(' ')[0]}
                        </span>
                        <span className="text-[9px] font-bold text-[#7C3AED] block mt-0.5">
                          {mentorCount > 0 ? `${mentorCount} Mentors` : 'Available'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Recommended / Available Tutors from Real Backend Data */}
            <div className="space-y-3 text-left">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-[#1C1938] tracking-tight">
                    Verified Mentors Online
                  </h3>
                  <p className="text-[11px] text-[#686487]">
                    Approved academic tutors ready for 3 or 6-month guidance
                  </p>
                </div>
                {tutors.length > 2 && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('discover')}
                    className="text-xs font-bold text-[#7C3AED] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>See All ({tutors.length})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {isLoading ? (
                <div className="py-8 text-center">
                  <div className="w-8 h-8 rounded-full border-2 border-[#7C3AED] border-t-transparent animate-spin mx-auto mb-2" />
                  <p className="text-xs text-[#686487] font-semibold">Loading verified educators...</p>
                </div>
              ) : filteredTutors.length === 0 ? (
                <ClayEmptyState
                  onExploreAll={() => {
                    setFilters({ ...filters, selectedSubject: '', searchQuery: '', selectedClass: '' });
                    setActiveTab('discover');
                  }}
                  onClearFilters={() => {
                    setFilters({
                      searchQuery: '',
                      selectedSubject: '',
                      selectedClass: '',
                      selectedBoard: '',
                      selectedLanguage: '',
                      maxPrice: 5000,
                    });
                  }}
                  onRefresh={handleRefresh}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredTutors.slice(0, 4).map((tutor) => (
                    <TutorCard
                      key={tutor.id}
                      tutor={tutor}
                      isFavorite={favoriteIds.includes(tutor.tutor_id || tutor.id)}
                      onToggleFavorite={handleToggleFavorite}
                      onViewProfile={(t) => setSelectedTutorForProfile(t)}
                      onRequestTutor={(t) => setSelectedTutorForRequest(t)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* 5. My Activity Status Card (Requests & Shortlist Preview) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => setActiveTab('requests')}
                aria-label="View learning requests"
                className="p-4 rounded-2xl bg-white border border-[#E5DFF8] shadow-clay-sm flex items-center justify-between text-left hover:border-[#C4B5FD] transition-all active:scale-95 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#EDE9FE] text-[#7C3AED] flex items-center justify-center">
                    <Send className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-[#1C1938]">Learning Requests</h4>
                    <p className="text-[11px] text-[#686487]">
                      {myRequests.length === 0 ? 'No active requests' : `${myRequests.length} inquiries sent`}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#7C3AED]" />
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('saved')}
                aria-label="View saved mentors"
                className="p-4 rounded-2xl bg-white border border-[#E5DFF8] shadow-clay-sm flex items-center justify-between text-left hover:border-[#C4B5FD] transition-all active:scale-95 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FEE2E2] text-[#EF4444] flex items-center justify-center">
                    <Heart className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-[#1C1938]">Saved Mentors</h4>
                    <p className="text-[11px] text-[#686487]">
                      {favoriteIds.length === 0 ? 'No mentors saved' : `${favoriteIds.length} saved mentors`}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#EF4444]" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: DISCOVER TUTORS (Full Marketplace Experience)                     */}
        {/* ========================================================================= */}
        {activeTab === 'discover' && (
          <div className="space-y-5 animate-fade-in">
            {/* Filter Bar with Pill Search and Subject Chips */}
            <TutorFilterBar
              filters={filters}
              onChange={setFilters}
              onReset={() =>
                setFilters({
                  searchQuery: '',
                  selectedSubject: '',
                  selectedClass: '',
                  selectedBoard: '',
                  selectedLanguage: '',
                  maxPrice: 5000,
                })
              }
              resultCount={filteredTutors.length}
            />

            {/* Tutor Cards List */}
            {isLoading ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-8 h-8 rounded-full border-2 border-[#7C3AED] border-t-transparent animate-spin mx-auto" />
                <p className="text-xs text-[#686487] font-semibold">Loading verified educators...</p>
              </div>
            ) : filteredTutors.length === 0 ? (
              <ClayEmptyState
                onExploreAll={() =>
                  setFilters({ ...filters, selectedSubject: '', searchQuery: '', selectedClass: '' })
                }
                onClearFilters={() =>
                  setFilters({
                    searchQuery: '',
                    selectedSubject: '',
                    selectedClass: '',
                    selectedBoard: '',
                    selectedLanguage: '',
                    maxPrice: 5000,
                  })
                }
                onRefresh={handleRefresh}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredTutors.map((tutor) => (
                  <TutorCard
                    key={tutor.id}
                    tutor={tutor}
                    isFavorite={favoriteIds.includes(tutor.tutor_id || tutor.id)}
                    onToggleFavorite={handleToggleFavorite}
                    onViewProfile={(t) => setSelectedTutorForProfile(t)}
                    onRequestTutor={(t) => setSelectedTutorForRequest(t)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 3: MY REQUESTS (Learning Inquiries)                                  */}
        {/* ========================================================================= */}
        {activeTab === 'requests' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between text-left">
              <div>
                <h3 className="text-base font-black text-[#1C1938]">Learning Inquiries</h3>
                <p className="text-xs text-[#686487]">Track status of requests sent to mentors</p>
              </div>
              <span className="text-xs font-bold text-[#7C3AED] bg-[#EDE9FE] px-3 py-1 rounded-full">
                {myRequests.length} Total
              </span>
            </div>

            {paymentSuccessMessage && (
              <div className="p-3.5 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46] text-xs flex items-center justify-between gap-2 shadow-sm animate-fade-in">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#059669] flex-shrink-0" />
                  <span className="font-semibold">{paymentSuccessMessage}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setPaymentSuccessMessage(null)}
                  className="text-xs font-bold text-[#065F46] hover:underline"
                >
                  Dismiss
                </button>
              </div>
            )}

            {myRequests.length === 0 ? (
              <div className="bg-white rounded-[32px] p-8 text-center border border-[#E5DFF8] shadow-clay space-y-3 max-w-md mx-auto my-6">
                <div className="w-12 h-12 rounded-full bg-[#EDE9FE] text-[#7C3AED] flex items-center justify-center mx-auto">
                  <Send className="w-6 h-6" />
                </div>
                <h3 className="text-base font-black text-[#1C1938]">No Requests Sent Yet</h3>
                <p className="text-xs text-[#686487] max-w-sm mx-auto leading-relaxed">
                  Browse verified educators in the Find Tutors tab and click "Request" to arrange long-term learning support.
                </p>
                <div className="pt-2">
                  <ClayButton
                    variant="primary"
                    size="sm"
                    onClick={() => setActiveTab('discover')}
                  >
                    Browse Mentors
                  </ClayButton>
                </div>
              </div>
            ) : (
              <div className="space-y-3.5 text-left">
                {myRequests.map((req) => {
                  const payCoord = paymentRecords.find((p) => p.request_id === req.id);
                  const tutorInfo = tutors.find((t) => (t.tutor_id || t.id) === req.tutor_id);
                  const tutorPhoto = tutorInfo?.photo_url || tutorInfo?.tutor_profile?.photo_url;
                  const tutorInitials = (req.tutor_name || 'Educator')
                    .split(' ')
                    .filter(Boolean)
                    .map((p) => p[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase();
                  const tutorQual = tutorInfo?.course_qualification || tutorInfo?.education_level;

                  return (
                    <div
                      key={req.id}
                      className="p-5 rounded-[28px] bg-white border border-[#E5DFF8] shadow-clay flex flex-col gap-3.5"
                    >
                      {/* Top Row: Tutor Identity + Status */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Tutor Photo / 3D Clay Monogram Fallback */}
                          <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-white shadow-clay-sm flex-shrink-0 bg-gradient-to-br from-[#EDE9FE] to-[#DDD6FE] flex items-center justify-center font-black text-[#6D28D9]">
                            {tutorPhoto ? (
                              <img src={tutorPhoto} alt={req.tutor_name || 'Tutor'} className="w-full h-full object-cover" />
                            ) : (
                              <span>{tutorInitials}</span>
                            )}
                          </div>

                          <div className="min-w-0 space-y-0.5">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4 className="text-sm font-black text-[#1C1938] leading-tight truncate">
                                {req.tutor_name || 'Verified Educator'}
                              </h4>
                              {req.status === 'accepted' && (
                                <span className="inline-flex items-center gap-0.5 text-[#10B981]" title="Verified Tutor">
                                  <ShieldCheck className="w-3.5 h-3.5" />
                                </span>
                              )}
                            </div>
                            {tutorQual && (
                              <p className="text-[11px] text-[#686487] font-semibold flex items-center gap-1 truncate">
                                <GraduationCap className="w-3 h-3 text-[#7C3AED]" />
                                <span>{tutorQual}</span>
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="flex flex-col items-end gap-1.5">
                          <span
                            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              req.status === 'accepted'
                                ? 'bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]'
                                : req.status === 'declined'
                                ? 'bg-[#FEF2F2] text-[#991B1B] border border-[#FECACA]'
                                : req.status === 'cancelled'
                                ? 'bg-[#F3F4F6] text-[#4B5563] border border-[#E5E7EB]'
                                : 'bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]'
                            }`}
                          >
                            {req.status}
                          </span>

                          {req.status === 'pending' && (
                            <button
                              type="button"
                              onClick={() => handleCancelRequest(req.id)}
                              className="text-[11px] font-bold text-[#DC2626] hover:underline cursor-pointer"
                            >
                              Cancel Request
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Subject & Class Details */}
                      <div className="flex items-center gap-2 flex-wrap text-xs text-[#686487]">
                        <span>
                          Subject:{' '}
                          <strong className="text-[#1C1938]">
                            {SCHOOL_SUBJECTS.find((s) => s.id === req.subject)?.label || req.subject}
                          </strong>
                        </span>
                        <span>•</span>
                        <span>
                          Class: <strong className="text-[#1C1938]">{req.class_level?.toUpperCase()}</strong>
                        </span>
                        {(req as any).batch_name && (
                          <>
                            <span>•</span>
                            <span className="inline-flex items-center gap-1 text-[#4136CA] font-bold bg-[#EFEAFF] px-2.5 py-0.5 rounded-lg text-[11px]">
                              <Clock className="w-3 h-3" />
                              {(req as any).batch_name} ({(req as any).batch_time || '3 hrs'})
                            </span>
                          </>
                        )}
                      </div>

                      {req.learning_needs && (
                        <p className="text-xs text-[#4A4668] bg-[#FAF9FE] p-2.5 rounded-xl border border-[#EFEBF8]">
                          &quot;{req.learning_needs}&quot;
                        </p>
                      )}

                      {/* TUTOR CONTACT PHONE (Revealed strictly on request acceptance) */}
                      {req.status === 'accepted' && (
                        <div className="mt-1 p-3.5 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
                          <div>
                            <span className="text-[10px] font-bold text-[#166534] uppercase tracking-wider block">
                              Verified Tutor Contact (Strictly after Acceptance)
                            </span>
                            <span className="text-sm font-black text-[#14532D]">
                              {req.tutor_phone || 'Phone verified with Shikshan'}
                            </span>
                            <p className="text-[11px] text-[#166534]">
                              Contact your tutor directly to align on batch schedule and learning targets.
                            </p>
                          </div>
                          {req.tutor_phone && (
                            <a
                              href={`tel:${req.tutor_phone}`}
                              className="px-4 py-2 rounded-xl bg-[#16A34A] text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#15803D] transition-colors shadow-sm self-start sm:self-auto cursor-pointer"
                            >
                              <Phone className="w-4 h-4" />
                              Call Tutor
                            </a>
                          )}
                        </div>
                      )}

                      {/* PAY FEES ACTION & COORDINATION STATUS (Strictly after Acceptance) */}
                      {req.status === 'accepted' && (
                        payCoord ? (
                          <div className="p-3.5 rounded-2xl bg-[#EDE9FE] border border-[#DDD6FE] text-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-[#5B21B6] flex items-center gap-1.5">
                                <ShieldCheck className="w-4 h-4 text-[#7C3AED]" />
                                Payment Coordination Status:
                              </span>
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#7C3AED] text-white">
                                {payCoord.status === 'paid_verified'
                                  ? 'Enrollment Confirmed'
                                  : payCoord.status === 'contacted'
                                  ? 'Admin Contacting'
                                  : 'Coordination Requested'}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#6D28D9] mt-1.5">
                              {payCoord.status === 'paid_verified'
                                ? `Monthly fee of ₹${payCoord.amount_collected || req.fee || 3000} verified by Shikshan Admin. Your 3-hour batch seat is officially confirmed.`
                                : 'Shikshan administrator is coordinating direct fee verification with your guardian. No payment gateways or transaction commissions.'}
                            </p>
                          </div>
                        ) : (
                          <div className="p-3.5 rounded-2xl bg-[#F4F1FA] border border-[#DFD8F3] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                              <p className="text-xs font-bold text-[#1C1938]">
                                Ready to confirm your batch seat with {req.tutor_name || 'this tutor'}?
                              </p>
                              <p className="text-[11px] text-[#686487]">
                                Fee capped at ₹3,000/month. Shikshan admin assists your family with direct seat verification.
                              </p>
                            </div>
                            <ClayButton
                              size="sm"
                              variant="primary"
                              onClick={() => setSelectedReqForPayment(req)}
                              icon={<CreditCard className="w-4 h-4" />}
                              className="self-start sm:self-auto"
                            >
                              Pay Fees
                            </ClayButton>
                          </div>
                        )
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 4: SHORTLIST (Saved Tutors)                                          */}
        {/* ========================================================================= */}
        {activeTab === 'saved' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between text-left">
              <div>
                <h3 className="text-base font-black text-[#1C1938]">Shortlisted Tutors</h3>
                <p className="text-xs text-[#686487]">Your bookmarked educators</p>
              </div>
              <span className="text-xs font-bold text-[#EF4444] bg-[#FEE2E2] px-3 py-1 rounded-full">
                {savedTutorsList.length} Saved
              </span>
            </div>

            {savedTutorsList.length === 0 ? (
              <div className="bg-white rounded-[32px] p-8 text-center border border-[#E5DFF8] shadow-clay space-y-3 max-w-md mx-auto my-6">
                <div className="w-12 h-12 rounded-full bg-[#FEE2E2] text-[#EF4444] flex items-center justify-center mx-auto">
                  <Heart className="w-6 h-6" />
                </div>
                <h3 className="text-base font-black text-[#1C1938]">No Tutors Shortlisted</h3>
                <p className="text-xs text-[#686487] max-w-sm mx-auto leading-relaxed">
                  Click the heart icon on any tutor card to save them to your shortlist for easy access later.
                </p>
                <div className="pt-2">
                  <ClayButton
                    variant="primary"
                    size="sm"
                    onClick={() => setActiveTab('discover')}
                  >
                    Find Tutors
                  </ClayButton>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {savedTutorsList.map((tutor) => (
                  <TutorCard
                    key={tutor.id}
                    tutor={tutor}
                    isFavorite={true}
                    onToggleFavorite={handleToggleFavorite}
                    onViewProfile={(t) => setSelectedTutorForProfile(t)}
                    onRequestTutor={(t) => setSelectedTutorForRequest(t)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 5: STUDENT PROFILE OVERVIEW                                          */}
        {/* ========================================================================= */}
        {activeTab === 'profile' && (
          <div className="space-y-5 text-left animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-[#1C1938]">Student Profile</h3>
                <p className="text-xs text-[#686487]">Your academic details and preferences</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#EDE9FE] text-[#7C3AED] text-xs font-black">
                {studentProfile?.class_level || 'Class 1–10'}
              </span>
            </div>

            {/* Profile Information & Photo Card */}
            <ClayCard className="space-y-4">
              <div className="pb-3 border-b border-[#EFEBF8]">
                <ClayUploadButton
                  currentPhotoUrl={user?.photo_url || profile?.photo_url || studentProfile?.photo_url}
                  onPhotoSelected={async (data) => {
                    await uploadPhoto(data);
                  }}
                  onPhotoRemoved={async () => {
                    await removePhoto();
                  }}
                  label={studentDisplayName}
                  subLabel={user?.email || 'Student Account'}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-[#FAF9FE] border border-[#EFEBF8]">
                  <span className="text-[#686487] block mb-0.5">Education Board</span>
                  <strong className="text-[#1C1938] font-bold">
                    {studentProfile?.board || 'Karnataka State Board'}
                  </strong>
                </div>
                <div className="p-3 rounded-xl bg-[#FAF9FE] border border-[#EFEBF8]">
                  <span className="text-[#686487] block mb-0.5">Learning Medium</span>
                  <strong className="text-[#1C1938] font-bold">
                    {studentProfile?.learning_language || 'Kannada & English'}
                  </strong>
                </div>
                <div className="p-3 rounded-xl bg-[#FAF9FE] border border-[#EFEBF8]">
                  <span className="text-[#686487] block mb-0.5">Student Mobile</span>
                  <strong className="text-[#1C1938] font-bold">
                    {user?.phone || 'Not provided'}
                  </strong>
                </div>
                <div className="p-3 rounded-xl bg-[#FAF9FE] border border-[#EFEBF8]">
                  <span className="text-[#686487] block mb-0.5">Guardian Contact</span>
                  <strong className="text-[#1C1938] font-bold">
                    {studentProfile?.guardian_phone || 'Verified by Parent'}
                  </strong>
                </div>
              </div>

              {studentProfile?.learning_goals && (
                <div className="pt-2">
                  <span className="text-xs font-bold text-[#1C1938] block mb-1">Learning Goals:</span>
                  <p className="text-xs text-[#4A4668] bg-[#FAF9FE] p-3 rounded-xl border border-[#EFEBF8] leading-relaxed">
                    "{studentProfile.learning_goals}"
                  </p>
                </div>
              )}
            </ClayCard>

            {/* Quick Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={() => signOut()}
                className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-[#FEE2E2] border border-[#FECACA] text-xs font-bold text-[#DC2626] hover:bg-red-100 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out of Shikshan</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Mobile-First Bottom Navigation Dock */}
      <ClayBottomNavigation
        activeTab={activeTab}
        onChangeTab={(tab) => setActiveTab(tab)}
        requestsCount={myRequests.length}
        savedCount={favoriteIds.length}
      />

      {/* Tutor Profile Modal */}
      <TutorProfileModal
        tutor={selectedTutorForProfile}
        isOpen={Boolean(selectedTutorForProfile)}
        onClose={() => setSelectedTutorForProfile(null)}
        onRequestTutor={(t) => {
          setSelectedTutorForProfile(null);
          setSelectedTutorForRequest(t);
        }}
        isFavorite={Boolean(
          selectedTutorForProfile &&
            favoriteIds.includes(selectedTutorForProfile.tutor_id || selectedTutorForProfile.id)
        )}
        onToggleFavorite={handleToggleFavorite}
      />

      {/* Tutor Request Modal */}
      <TutorRequestModal
        tutor={selectedTutorForRequest}
        isOpen={Boolean(selectedTutorForRequest)}
        onClose={() => setSelectedTutorForRequest(null)}
        onSuccess={() => {
          loadData();
          setActiveTab('requests');
        }}
      />

      {/* Fee Coordination / Pay Fees Modal */}
      {selectedReqForPayment && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-purple-100 text-left space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#F3EFFB]">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#EDE9FE] text-[#7C3AED] flex items-center justify-center shadow-xs">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-[#1C1938]">Shikshan Fee Coordination</h3>
                  <p className="text-[11px] text-[#686487]">Direct Tutor-Student Support</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReqForPayment(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF9FE] border border-[#E5DFF8] space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#686487]">Tutor:</span>
                <span className="font-black text-[#1C1938]">{selectedReqForPayment.tutor_name || 'Verified Educator'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#686487]">Subject & Class:</span>
                <span className="font-bold text-[#1C1938]">
                  {SCHOOL_SUBJECTS.find((s) => s.id === selectedReqForPayment.subject)?.label || selectedReqForPayment.subject} • Class {selectedReqForPayment.class_level?.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-[#EFEBF8] pt-2">
                <span className="text-[#686487]">Monthly Fee (Fixed Cap):</span>
                <span className="font-black text-sm text-[#7C3AED]">₹{selectedReqForPayment.fee || 3000} / month</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] space-y-1.5 text-xs">
              <div className="font-black text-[#14532D] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
                <span>Fair Direct Fee Guarantee</span>
              </div>
              <p className="text-[11px] text-[#166534] leading-relaxed">
                • Strictly capped at maximum ₹3,000/month. No platform commissions.<br />
                • Maximum 4 students in your child's 3-hour learning batch.<br />
                • Shikshan administrators assist your family with verified UPI/direct transfer to the tutor after seat confirmation.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#F3EFFB]">
              <ClayButton
                size="sm"
                variant="secondary"
                onClick={() => setSelectedReqForPayment(null)}
              >
                Close
              </ClayButton>
              <ClayButton
                size="sm"
                variant="primary"
                isLoading={submittingPaymentForReq === selectedReqForPayment.id}
                onClick={async () => {
                  const targetReq = selectedReqForPayment;
                  await handleExpressPaymentInterest(targetReq);
                  setSelectedReqForPayment(null);
                }}
                icon={<CheckCircle2 className="w-4 h-4" />}
              >
                Confirm Payment Interest
              </ClayButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
