import React, { useEffect, useState, useMemo } from 'react';
import {
  BookOpen,
  Clock,
  Heart,
  Send,
  SlidersHorizontal,
  RefreshCw,
  User,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { Header } from '../../components/common/Header';
import { ClayCard } from '../../components/common/ClayCard';
import { ClayButton } from '../../components/common/ClayButton';
import { SetupNotice } from '../../components/common/SetupNotice';
import { TutorCard } from '../../components/marketplace/TutorCard';
import { TutorFilterBar, TutorFilters } from '../../components/marketplace/TutorFilterBar';
import { TutorProfileModal } from '../../components/marketplace/TutorProfileModal';
import { TutorRequestModal } from '../../components/marketplace/TutorRequestModal';
import { useAuth } from '../../context/AuthContext';
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
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'discover' | 'requests' | 'saved' | 'profile'>('discover');
  const [tutors, setTutors] = useState<TutorApplication[]>([]);
  const [myRequests, setMyRequests] = useState<TutorRequest[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modals state
  const [selectedTutorForProfile, setSelectedTutorForProfile] = useState<TutorApplication | null>(null);
  const [selectedTutorForRequest, setSelectedTutorForRequest] = useState<TutorApplication | null>(null);

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
      const [fetchedTutors, fetchedRequests, fetchedFavs] = await Promise.all([
        getApprovedTutors(),
        getStudentRequests(),
        getFavoriteTutorIds(),
      ]);

      setTutors(fetchedTutors);
      setMyRequests(fetchedRequests);
      setFavoriteIds(fetchedFavs);
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
      // Must be approved
      if (tutor.status !== 'approved') return false;

      // Search query
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const tutorName = tutor.tutor_profile?.name?.toLowerCase() || '';
        const bio = tutor.bio_intro?.toLowerCase() || '';
        const subjects = tutor.subjects.join(' ').toLowerCase();
        if (!tutorName.includes(query) && !bio.includes(query) && !subjects.includes(query)) {
          return false;
        }
      }

      // Subject filter
      if (filters.selectedSubject && !tutor.subjects.includes(filters.selectedSubject)) {
        return false;
      }

      // Class level filter
      if (filters.selectedClass && !tutor.class_levels.includes(filters.selectedClass)) {
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
        !tutor.teaching_languages.some((l) =>
          l.toLowerCase().includes(filters.selectedLanguage.toLowerCase())
        )
      ) {
        return false;
      }

      return true;
    });
  }, [tutors, filters]);

  const savedTutorsList = useMemo(() => {
    return tutors.filter((t) => favoriteIds.includes(t.tutor_id));
  }, [tutors, favoriteIds]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F6FC]">
      <Header
        title="Student Portal"
        subtitle={profile?.name ? `Namaskara, ${profile.name}` : 'Shikshan Learning Platform'}
        customRight={
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="w-10 h-10 rounded-2xl bg-white border border-[#DFD8F3] shadow-sm flex items-center justify-center text-[#1C1938] hover:text-[#4136CA] hover:bg-[#F4F1FA] active:scale-95 transition-all"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#4136CA]' : ''}`} />
          </button>
        }
      />
      <SetupNotice />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 pb-24 space-y-6">
        {/* Welcoming Academic Snapshot Banner */}
        <ClayCard className="p-5 sm:p-6 text-left border border-[#DFD8F3] shadow-clay-card bg-gradient-to-br from-white to-[#F4F1FA]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#DFD8F3]">
            <div>
              <span className="text-[11px] font-bold text-[#4136CA] uppercase tracking-wider">
                Student Learning Dashboard
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-[#1C1938] mt-0.5">
                Namaskara, {profile?.name || user?.email}!
              </h2>
              <p className="text-xs text-slate-500 font-kannada">
                ನಿಮ್ಮ ತರಗತಿಗೆ ಸೂಕ್ತವಾದ ಪರಿಶೀಲಿಸಿದ ಬೋಧಕರನ್ನು ಹುಡುಕಿ.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="px-3 py-1 rounded-full bg-[#DFD8F3]/60 text-[#4136CA] border border-[#A7AAE5]/50 text-xs font-bold">
                {studentProfile?.class_level || 'Class 8'} • {studentProfile?.board?.split(' ')[0] || 'KSEAB'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 text-xs">
            <div className="p-2.5 rounded-2xl bg-white border border-[#DFD8F3] shadow-sm">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Current Class</span>
              <span className="font-extrabold text-[#1C1938] text-sm">
                {studentProfile?.class_level || 'Class 8'}
              </span>
            </div>

            <div className="p-2.5 rounded-2xl bg-white border border-[#DFD8F3] shadow-sm">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Medium</span>
              <span className="font-extrabold text-[#1C1938] text-sm truncate block">
                {studentProfile?.learning_language || 'Kannada'}
              </span>
            </div>

            <div className="p-2.5 rounded-2xl bg-white border border-[#DFD8F3] shadow-sm">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Active Requests</span>
              <span className="font-extrabold text-[#4136CA] text-sm">
                {myRequests.filter((r) => r.status === 'pending').length} Pending
              </span>
            </div>

            <div className="p-2.5 rounded-2xl bg-white border border-[#DFD8F3] shadow-sm">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Shortlist</span>
              <span className="font-extrabold text-rose-600 text-sm">
                {favoriteIds.length} Saved
              </span>
            </div>
          </div>
        </ClayCard>

        {/* Navigation Tabs: Find Tutors, My Requests, Saved Tutors */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 select-none">
          <button
            onClick={() => setActiveTab('discover')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'discover'
                ? 'bg-[#4136CA] text-white shadow-clay-button border border-[#4136CA]'
                : 'bg-white text-[#1C1938] hover:bg-[#F4F1FA] border border-[#DFD8F3]'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Find Tutors</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
              activeTab === 'discover' ? 'bg-white/20 text-white' : 'bg-[#DFD8F3] text-[#4136CA]'
            }`}>
              {filteredTutors.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'requests'
                ? 'bg-[#4136CA] text-white shadow-clay-button border border-[#4136CA]'
                : 'bg-white text-[#1C1938] hover:bg-[#F4F1FA] border border-[#DFD8F3]'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>My Requests</span>
            {myRequests.length > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === 'requests' ? 'bg-white/20 text-white' : 'bg-[#DFD8F3] text-[#4136CA]'
              }`}>
                {myRequests.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('saved')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'saved'
                ? 'bg-[#4136CA] text-white shadow-clay-button border border-[#4136CA]'
                : 'bg-white text-[#1C1938] hover:bg-[#F4F1FA] border border-[#DFD8F3]'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>Shortlist ({favoriteIds.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'profile'
                ? 'bg-[#4136CA] text-white shadow-clay-button border border-[#4136CA]'
                : 'bg-white text-[#1C1938] hover:bg-[#F4F1FA] border border-[#DFD8F3]'
            }`}
          >
            <User className="w-4 h-4" />
            <span>My Profile</span>
          </button>
        </div>

        {/* TAB 1: DISCOVER TUTORS */}
        {activeTab === 'discover' && (
          <div className="space-y-4">
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

            {isLoading ? (
              <ClayCard className="p-12 text-center space-y-3 border-[#DFD8F3] shadow-clay-card bg-white">
                <div className="w-10 h-10 rounded-full border-4 border-[#4136CA] border-t-transparent animate-spin mx-auto" />
                <p className="text-xs font-semibold text-slate-600">Discovering verified tutors...</p>
              </ClayCard>
            ) : filteredTutors.length === 0 ? (
              <ClayCard className="p-8 text-center space-y-3 border-[#DFD8F3] shadow-clay-card bg-white">
                <div className="w-14 h-14 rounded-3xl bg-[#DFD8F3]/60 text-[#4136CA] flex items-center justify-center mx-auto border border-[#DFD8F3]">
                  <SlidersHorizontal className="w-7 h-7" />
                </div>
                <h3 className="font-extrabold text-base text-[#1C1938]">
                  No Tutors Matching Your Current Filters
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  We only display tutors whose qualifications have been manually reviewed and approved. Try clearing filters or searching for another subject.
                </p>
                <div className="pt-2">
                  <ClayButton
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      setFilters({
                        searchQuery: '',
                        selectedSubject: '',
                        selectedClass: '',
                        selectedBoard: '',
                        selectedLanguage: '',
                        maxPrice: 5000,
                      })
                    }
                  >
                    Reset All Filters
                  </ClayButton>
                </div>
              </ClayCard>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredTutors.map((tutor) => (
                  <TutorCard
                    key={tutor.id}
                    tutor={tutor}
                    isFavorite={favoriteIds.includes(tutor.tutor_id)}
                    onToggleFavorite={handleToggleFavorite}
                    onViewProfile={setSelectedTutorForProfile}
                    onRequestTutor={setSelectedTutorForRequest}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MY TUTOR REQUESTS */}
        {activeTab === 'requests' && (
          <div className="space-y-3 text-left">
            <div className="flex items-center justify-between px-1">
              <h3 className="font-extrabold text-sm text-[#1C1938]">
                Your Submitted Tutor Requests ({myRequests.length})
              </h3>
              <span className="text-[11px] text-slate-500">Track acceptance status in real time</span>
            </div>

            {myRequests.length === 0 ? (
              <ClayCard className="p-8 text-center space-y-3 border-[#DFD8F3] shadow-clay-card bg-white">
                <div className="w-14 h-14 rounded-3xl bg-[#DFD8F3]/60 text-[#4136CA] flex items-center justify-center mx-auto border border-[#DFD8F3]">
                  <Send className="w-6 h-6" />
                </div>
                <h4 className="font-extrabold text-base text-[#1C1938]">No Tutor Requests Yet</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Browse our approved educators and tap &apos;Request&apos; to arrange learning sessions.
                </p>
                <div className="pt-2">
                  <ClayButton size="sm" variant="primary" onClick={() => setActiveTab('discover')}>
                    Browse Approved Tutors
                  </ClayButton>
                </div>
              </ClayCard>
            ) : (
              <div className="space-y-3">
                {myRequests.map((req) => {
                  const tutorName = req.tutor_profile?.name || req.tutor_application?.tutor_profile?.name || 'Assigned Tutor';
                  const subjectName = SCHOOL_SUBJECTS.find((s) => s.id === req.subject)?.label || req.subject;

                  return (
                    <ClayCard key={req.id} className="p-4 sm:p-5 text-left space-y-3 bg-white border-[#DFD8F3] shadow-clay-card">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-extrabold text-base text-[#1C1938]">{tutorName}</h4>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold capitalize flex items-center gap-1 ${
                                req.status === 'accepted'
                                  ? 'bg-[#EBF3E8] text-[#3B522F] border border-[#3B522F]/20'
                                  : req.status === 'declined'
                                  ? 'bg-rose-50 text-rose-800 border border-rose-200'
                                  : req.status === 'cancelled'
                                  ? 'bg-slate-100 text-slate-600'
                                  : 'bg-[#DFD8F3]/70 text-[#4136CA] border border-[#A7AAE5]/50'
                              }`}
                            >
                              {req.status === 'accepted' && <CheckCircle className="w-3 h-3 text-[#3B522F]" />}
                              {req.status === 'declined' && <XCircle className="w-3 h-3 text-rose-600" />}
                              {req.status === 'pending' && <Clock className="w-3 h-3 text-[#4136CA]" />}
                              {req.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Subject: <strong className="text-[#1C1938]">{subjectName}</strong> ({req.class_level})
                          </p>
                        </div>
                        <span className="text-[11px] text-slate-400">
                          {new Date(req.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="p-3 rounded-2xl bg-[#F4F1FA] border border-[#DFD8F3] text-xs space-y-1">
                        <p className="text-slate-700">
                          <strong>Your Learning Note:</strong> {req.learning_needs}
                        </p>
                        {req.preferred_schedule && (
                          <p className="text-slate-500 text-[11px]">
                            <strong>Preferred Schedule:</strong> {req.preferred_schedule}
                          </p>
                        )}
                        {req.response_message && (
                          <p className="pt-1.5 border-t border-[#DFD8F3] font-semibold text-[#4136CA]">
                            <strong>Tutor Reply:</strong> {req.response_message}
                          </p>
                        )}
                      </div>

                      {req.status === 'pending' && (
                        <div className="flex justify-end pt-1">
                          <button
                            type="button"
                            onClick={() => handleCancelRequest(req.id)}
                            className="text-xs font-bold text-red-600 hover:underline"
                          >
                            Cancel Request
                          </button>
                        </div>
                      )}
                    </ClayCard>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SAVED TUTORS */}
        {activeTab === 'saved' && (
          <div className="space-y-3 text-left">
            <h3 className="font-extrabold text-sm text-slate-900 px-1">
              Shortlisted Tutors ({savedTutorsList.length})
            </h3>

            {savedTutorsList.length === 0 ? (
              <ClayCard className="p-8 text-center space-y-3">
                <div className="w-14 h-14 rounded-3xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
                  <Heart className="w-6 h-6" />
                </div>
                <h4 className="font-extrabold text-base text-slate-900">No Shortlisted Tutors</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Tap the heart icon on any tutor card to save them here for easy comparison.
                </p>
                <div className="pt-2">
                  <ClayButton size="sm" variant="primary" onClick={() => setActiveTab('discover')}>
                    Explore Tutors
                  </ClayButton>
                </div>
              </ClayCard>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {savedTutorsList.map((tutor) => (
                  <TutorCard
                    key={tutor.id}
                    tutor={tutor}
                    isFavorite={true}
                    onToggleFavorite={handleToggleFavorite}
                    onViewProfile={setSelectedTutorForProfile}
                    onRequestTutor={setSelectedTutorForRequest}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: MY ACADEMIC PROFILE */}
        {activeTab === 'profile' && (
          <ClayCard className="p-6 text-left space-y-4">
            <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">My Academic Settings</h3>
                <p className="text-xs text-slate-500">Your registered curriculum and subject preferences</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 space-y-1">
                <span className="text-slate-400 font-bold block text-[10px] uppercase">Student Name</span>
                <span className="font-extrabold text-slate-900 text-sm">{profile?.name || user?.email}</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 space-y-1">
                <span className="text-slate-400 font-bold block text-[10px] uppercase">Registered Class</span>
                <span className="font-extrabold text-slate-900 text-sm">{studentProfile?.class_level || 'Class 8'}</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 space-y-1">
                <span className="text-slate-400 font-bold block text-[10px] uppercase">School Curriculum</span>
                <span className="font-extrabold text-slate-900 text-sm">{studentProfile?.board || 'Karnataka State Board'}</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 space-y-1">
                <span className="text-slate-400 font-bold block text-[10px] uppercase">Learning Medium</span>
                <span className="font-extrabold text-slate-900 text-sm">{studentProfile?.learning_language || 'Kannada'}</span>
              </div>
            </div>

            <div className="pt-2">
              <span className="text-xs font-bold text-slate-700 block mb-2">Subjects Needing Support:</span>
              <div className="flex flex-wrap gap-1.5">
                {studentProfile?.subjects?.map((subId) => {
                  const sObj = SCHOOL_SUBJECTS.find((s) => s.id === subId);
                  return (
                    <span
                      key={subId}
                      className="px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-100 text-blue-900 font-semibold text-xs"
                    >
                      {sObj?.label || subId}
                    </span>
                  );
                })}
              </div>
            </div>
          </ClayCard>
        )}
      </main>

      {/* Full Tutor Profile Modal */}
      <TutorProfileModal
        tutor={selectedTutorForProfile}
        isOpen={Boolean(selectedTutorForProfile)}
        onClose={() => setSelectedTutorForProfile(null)}
        onRequestTutor={(t) => {
          setSelectedTutorForProfile(null);
          setSelectedTutorForRequest(t);
        }}
        isFavorite={selectedTutorForProfile ? favoriteIds.includes(selectedTutorForProfile.tutor_id) : false}
        onToggleFavorite={handleToggleFavorite}
      />

      {/* Tutor Request Submission Modal */}
      <TutorRequestModal
        tutor={selectedTutorForRequest}
        isOpen={Boolean(selectedTutorForRequest)}
        onClose={() => setSelectedTutorForRequest(null)}
        onSuccess={() => {
          loadData();
          setActiveTab('requests');
        }}
      />
    </div>
  );
};
