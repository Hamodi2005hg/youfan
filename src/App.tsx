import React, { useState, useEffect } from 'react';
import { Profile, Post } from './types';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { TrendingPosts } from './components/TrendingPosts';
import { StatsSection } from './components/StatsSection';
import { EarnInfoSection } from './components/EarnInfoSection';
import { TrendingProfiles } from './components/TrendingProfiles';
import { GlobalFeedView } from './components/GlobalFeedView';
import { TierListSection } from './components/TierListSection';
import { Footer } from './components/Footer';
import { ProfileView } from './components/ProfileView';
import { PostDetailModal } from './components/PostDetailModal';
import { CreatePostModal } from './components/CreatePostModal';
import { AuthModal } from './components/AuthModal';
<<<<<<< HEAD
=======
import { SupabaseModal } from './components/SupabaseModal';
>>>>>>> origin/main
import { AdminPanel } from './components/AdminPanel';
import { LegalModal, LegalTab } from './components/LegalModal';

export default function App() {
  const [activeView, setActiveView] = useState<'home' | 'profile' | 'feed' | 'admin'>('home');
  const [selectedUsername, setSelectedUsername] = useState<string | null>(null);
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
  const [profilePosts, setProfilePosts] = useState<Post[]>([]);
<<<<<<< HEAD
  const [loadingProfile, setLoadingProfile] = useState<boolean>(false);
=======
>>>>>>> origin/main

  // Platform Data
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);

  // Active User session
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);

  // Modals
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [authModal, setAuthModal] = useState<{ open: boolean; mode: 'login' | 'signup'; suggested?: string }>({
    open: false,
    mode: 'signup',
  });
  const [createPostOpen, setCreatePostOpen] = useState(false);
<<<<<<< HEAD
=======
  const [supabaseModalOpen, setSupabaseModalOpen] = useState(false);
>>>>>>> origin/main
  const [legalModal, setLegalModal] = useState<{ open: boolean; tab: LegalTab }>({
    open: false,
    tab: 'content-policy',
  });

  // Extract custom username from URL path/query/hash
  const getProfileFromUrl = () => {
    const path = window.location.pathname;
    const segments = path.split('/').filter(Boolean);
    if (segments.length > 0 && segments[0] !== 'api' && segments[0] !== 'feed' && segments[0] !== 'admin') {
      return segments[0];
    }
    const params = new URLSearchParams(window.location.search);
    const u = params.get('u') || params.get('profile');
    if (u) return u;
    const hash = window.location.hash.replace('#', '');
    if (hash && hash !== 'feed' && hash !== 'admin') return hash;
    return null;
  };

  const fetchProfileDetails = async (username: string) => {
<<<<<<< HEAD
    setLoadingProfile(true);
=======
>>>>>>> origin/main
    try {
      const res = await fetch(`/api/profile/${username}`);
      if (res.ok) {
        const data = await res.json();
        setCurrentProfile(data.profile);
        setProfilePosts(data.posts || []);
        setActiveView('profile');
      } else {
        setActiveView('home');
      }
    } catch {
      setActiveView('home');
<<<<<<< HEAD
    } finally {
      setLoadingProfile(false);
=======
>>>>>>> origin/main
    }
  };

  const loadData = async () => {
    try {
      const res = await fetch('/api/platform-data');
      if (res.ok) {
        const data = await res.json();
        setAllPosts(data.posts || []);
        setAllProfiles(data.profiles || []);
      }
    } catch {}
  };

  const checkSession = async () => {
    try {
      const match = document.cookie.match(/yostar_session=([^;]+)/);
      if (match && match[1]) {
        const username = match[1];
        const res = await fetch(`/api/profile/${username}`);
        if (res.ok) {
          const data = await res.json();
          setCurrentUser(data.profile);
        }
      }
    } catch {}
  };

  useEffect(() => {
    loadData();
    checkSession();
    const urlUser = getProfileFromUrl();
    if (urlUser) {
      setSelectedUsername(urlUser);
      fetchProfileDetails(urlUser);
    }
  }, []);

  const handleSelectProfile = (username: string, section?: string) => {
    setSelectedUsername(username);
    const newPath = `/${username}${section ? `?section=${section}` : ''}`;
    window.history.pushState({}, '', newPath);
    fetchProfileDetails(username);
  };

  const handleGoHome = () => {
    setSelectedUsername(null);
    setActiveView('home');
    window.history.pushState({}, '', '/');
    loadData();
  };

  const handleLogout = () => {
    document.cookie = 'yostar_session=; path=/; max-age=0';
    setCurrentUser(null);
<<<<<<< HEAD
    setCurrentProfile(null);
=======
>>>>>>> origin/main
    handleGoHome();
  };

  const handleVoteSuccess = () => {
    loadData();
    if (selectedUsername) {
      fetchProfileDetails(selectedUsername);
    }
  };

<<<<<<< HEAD
=======
  const handleStartEarning = () => {
    if (currentUser) {
      handleSelectProfile(currentUser.username);
    } else {
      setAuthModal({ open: true, mode: 'signup' });
    }
  };

>>>>>>> origin/main
  const handlePostCreated = (newPost: Post) => {
    setAllPosts((prev) => [newPost, ...prev]);
    setProfilePosts((prev) => [newPost, ...prev]);
    if (currentProfile) {
      setCurrentProfile((prev) => (prev ? { ...prev, posts_count: (prev.posts_count || 0) + 1 } : prev));
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#ffffff] text-[#111111] selection:bg-[#FFFB93] selection:text-black">
      {/* Main Navigation Header */}
<<<<<<< HEAD
=======
      
>>>>>>> origin/main
      <Header
        currentUser={currentUser}
        onOpenAuth={(mode) => setAuthModal({ open: true, mode })}
        onSelectProfile={handleSelectProfile}
        onGoHome={handleGoHome}
        onGoFeed={() => { setSelectedUsername(null); setActiveView('feed'); }}
        onOpenLegal={(tab) => setLegalModal({ open: true, tab })}
        onLogout={handleLogout}
        activeView={activeView}
      />

<<<<<<< HEAD
=======

>>>>>>> origin/main
      {/* Content Router */}
      <main className="flex-1 w-full">
        {activeView === 'admin' ? (
          <AdminPanel onGoHome={handleGoHome} />
        ) : activeView === 'home' ? (
          <div>
<<<<<<< HEAD
=======
            {/* 1. Hero Section */}
>>>>>>> origin/main
            <HeroSection
              onGetStarted={(username) => {
                setAuthModal({ open: true, mode: 'signup', suggested: username });
              }}
            />
<<<<<<< HEAD
=======

            {/* 2. Trending Posts Carousel */}
>>>>>>> origin/main
            <TrendingPosts
              posts={allPosts}
              onSelectPost={(post) => setSelectedPost(post)}
              onSelectProfile={handleSelectProfile}
            />
<<<<<<< HEAD
            <EarnInfoSection />
=======

            {/* 3. Earn with Ease Details */}
            <EarnInfoSection />

            {/* 4. Trending Profiles Carousel */}
>>>>>>> origin/main
            <TrendingProfiles
              profiles={allProfiles}
              onSelectProfile={handleSelectProfile}
            />
<<<<<<< HEAD
=======

            {/* 5. Basic vs Verified Tiers with Milestones */}
>>>>>>> origin/main
            <TierListSection
              onCreateProfile={() => setAuthModal({ open: true, mode: 'signup' })}
            />
          </div>
        ) : activeView === 'feed' ? (
          <GlobalFeedView 
            posts={allPosts} 
            currentUser={currentUser}
            onSelectPost={(post) => setSelectedPost(post)}
            onSelectProfile={handleSelectProfile}
            onRequireAuth={() => setAuthModal({ open: true, mode: 'login' })}
          />
        ) : (
          currentProfile ? (
            <ProfileView
              onRequireAuth={() => setAuthModal({ open: true, mode: 'login' })}
              key={currentProfile.id}
              profile={currentProfile}
              posts={profilePosts}
              allPosts={allPosts}
              currentUser={currentUser}
              onOpenCreatePost={() => setCreatePostOpen(true)}
              onSelectPost={(post) => setSelectedPost(post)}
              onBackHome={handleGoHome}
              onLogout={handleLogout}
              onVoteSuccess={handleVoteSuccess}
              onSelectProfile={handleSelectProfile}
            />
<<<<<<< HEAD
          ) : loadingProfile ? (
            <div className="flex-1 flex flex-col items-center justify-center py-32">
              <div className="animate-spin w-10 h-10 border-4 border-gray-200 border-t-black rounded-full mb-4"></div>
              <p className="text-gray-600 font-medium">Loading profile...</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-32 px-4 text-center">
              <h3 className="text-xl font-bold text-black mb-2">Profile not found</h3>
              <p className="text-gray-500 mb-6 text-sm">The profile @{selectedUsername} could not be loaded or does not exist.</p>
              <button
                onClick={handleGoHome}
                className="px-6 py-3 bg-black text-white font-bold rounded-2xl cursor-pointer"
              >
                Return to Home
              </button>
=======
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-32">
              <div className="animate-spin w-10 h-10 border-4 border-white/20 border-t-[#FF2D55] rounded-full mb-4"></div>
              <p className="text-gray-400 font-medium">Loading profile...</p>
>>>>>>> origin/main
            </div>
          )
        )}
      </main>

      {/* Global Footer */}
      <Footer
        onOpenLegal={(tab) => setLegalModal({ open: true, tab })}
<<<<<<< HEAD
=======
        onOpenSupabaseModal={() => setSupabaseModalOpen(true)}
>>>>>>> origin/main
      />

      {/* Post Detail Modal */}
      {selectedPost && (
        <PostDetailModal
          post={selectedPost}
          authorProfile={
            allProfiles.find((p) => p.username.toLowerCase() === selectedPost.username?.toLowerCase()) || null
          }
          currentUser={currentUser}
          onRequireAuth={() => setAuthModal({ open: true, mode: 'login' })}
          onClose={() => setSelectedPost(null)}
          onSelectProfile={handleSelectProfile}
          onVoteSuccess={handleVoteSuccess}
        />
      )}

      {/* Create Post Modal */}
      {createPostOpen && currentUser && (
        <CreatePostModal
          currentUser={currentUser}
          onClose={() => setCreatePostOpen(false)}
          onPostCreated={handlePostCreated}
        />
      )}

      {/* Creator Auth Modal */}
      {authModal.open && (
        <AuthModal
          initialMode={authModal.mode}
          suggestedUsername={authModal.suggested}
          onClose={() => setAuthModal({ open: false, mode: 'signup' })}
          onSuccess={(profile) => {
            setCurrentUser(profile);
<<<<<<< HEAD
            setCurrentProfile(profile);
            document.cookie = `yostar_session=${profile.username}; path=/; max-age=31536000`;
            setSelectedUsername(profile.username);
            setActiveView('profile');
            window.history.pushState({}, '', `/${profile.username}`);
            fetchProfileDetails(profile.username);
=======
            document.cookie = `yostar_session=${profile.username}; path=/; max-age=31536000`;
            handleSelectProfile(profile.username, 'global_feed');
>>>>>>> origin/main
            loadData();
          }}
        />
      )}

<<<<<<< HEAD
=======
      {/* Supabase Schema & Setup Modal */}
      {supabaseModalOpen && <SupabaseModal onClose={() => setSupabaseModalOpen(false)} />}

>>>>>>> origin/main
      {/* Legal, Content Policy, Terms & Privacy Modal */}
      {legalModal.open && (
        <LegalModal
          initialTab={legalModal.tab}
          onClose={() => setLegalModal({ open: false, tab: 'content-policy' })}
        />
      )}
    </div>
  );
}
