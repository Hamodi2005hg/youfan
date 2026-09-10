import React, { useState, useEffect } from 'react';
import { Profile, Post } from './types';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { TrendingPosts } from './components/TrendingPosts';
import { StatsSection } from './components/StatsSection';
import { EarnInfoSection } from './components/EarnInfoSection';
import { TrendingProfiles } from './components/TrendingProfiles';
import { GlobalFeedView } from './components/GlobalFeedView';
import { CalculatorSection } from './components/CalculatorSection';
import { TierListSection } from './components/TierListSection';
import { Footer } from './components/Footer';
import { ProfileView } from './components/ProfileView';
import { PostDetailModal } from './components/PostDetailModal';
import { CreatePostModal } from './components/CreatePostModal';
import { AuthModal } from './components/AuthModal';
import { AdsTxtModal } from './components/AdsTxtModal';
import { SupabaseModal } from './components/SupabaseModal';
import { AdminPanel } from './components/AdminPanel';

export default function App() {
  const [activeView, setActiveView] = useState<'home' | 'profile' | 'feed' | 'admin'>('home');
  const [selectedUsername, setSelectedUsername] = useState<string | null>(null);
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
  const [profilePosts, setProfilePosts] = useState<Post[]>([]);

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
  const [adsTxtOpen, setAdsTxtOpen] = useState(false);
  const [supabaseModalOpen, setSupabaseModalOpen] = useState(false);

  // Extract custom username from URL path/query/hash
  const getProfileFromUrl = () => {
    const path = window.location.pathname;
    const params = new URLSearchParams(window.location.search);
    const hash = window.location.hash;

    const queryUser = params.get('user') || params.get('u') || params.get('profile');
    if (queryUser) return queryUser.replace('@', '');

    if (hash) {
      const cleanHash = hash.replace('#', '').replace('/', '');
      if (cleanHash && !['home', 'feed', 'profile'].includes(cleanHash)) {
        return cleanHash.replace('@', '');
      }
    }

    if (path && path !== '/') {
      const parts = path.split('/').filter(Boolean);
      if (parts.length > 0) {
        const first = parts[0];
        if (first.startsWith('@')) {
          return first.slice(1);
        }
        if ((first === 'u' || first === 'user' || first === 'profile') && parts[1]) {
          return parts[1];
        }
        if (parts.length === 1 && !['api', 'home', 'feed', 'profile', 'index.html'].includes(first)) {
          return first;
        }
      }
    }
    return null;
  };

  // Load initial posts and profiles from server
  const loadData = async () => {
    try {
      const [postsRes, profilesRes, sessionRes] = await Promise.all([
        fetch('/api/posts'),
        fetch('/api/profiles'),
        fetch('/api/auth/session'),
      ]);
      if (postsRes.ok) {
        const postsData = await postsRes.json();
        setAllPosts(postsData);
      }
      if (profilesRes.ok) {
        const profilesData = await profilesRes.json();
        setAllProfiles(profilesData);
      }
      if (sessionRes.ok) {
        const sessionData = await sessionRes.json();
        if (sessionData.user) {
          setCurrentUser(sessionData.user);
        } else {
          setCurrentUser(null);
        }
      }
    } catch (err) {
      console.error('Error loading initial data:', err);
    }
  };

  useEffect(() => {
    const initApp = async () => {
      try {
        const [postsRes, profilesRes, sessionRes] = await Promise.all([
          fetch('/api/posts'),
          fetch('/api/profiles'),
          fetch('/api/auth/session'),
        ]);

        let fetchedUser: Profile | null = null;
        if (sessionRes.ok) {
          const sessionData = await sessionRes.json();
          fetchedUser = sessionData.user || null;
          setCurrentUser(fetchedUser);
        }

        let fetchedProfiles: Profile[] = [];
        if (profilesRes.ok) {
          const profilesData = await profilesRes.json();
          setAllProfiles(profilesData);
          fetchedProfiles = profilesData;
        }

        if (postsRes.ok) {
          const postsData = await postsRes.json();
          setAllPosts(postsData);
        }

        const targetUser = getProfileFromUrl();
        if (targetUser === 'admin' || window.location.pathname.toLowerCase().includes('admin') || window.location.hash.toLowerCase().includes('admin')) {
          setActiveView('admin');
        } else if (targetUser) {
          handleSelectProfile(targetUser);
        } else {
          // No profile in URL -> Show the website's main landing/home interface!
          setActiveView('home');
          setSelectedUsername(null);
          setCurrentProfile(null);
        }
      } catch (err) {
        console.error('Error in initApp:', err);
      }
    };
    initApp();
  }, []);

  // Fetch single profile details and posts
  const fetchProfileDetails = async (username: string) => {
    if (!username) return;
    try {
      const [pRes, postsRes] = await Promise.all([
        fetch(`/api/profile/${username}`),
        fetch(`/api/profile/${username}/posts`),
      ]);

      if (pRes.ok) {
        try {
          const pData = await pRes.json();
          setCurrentProfile(pData);
        } catch (e) {}
      } else {
        // If profile not found, go back home and show alert
        alert(`Profile @${username} not found.`);
        handleGoHome();
        return;
      }
      if (postsRes.ok) {
        try {
          const postsData = await postsRes.json();
          setProfilePosts(postsData);
        } catch (e) {}
      }
    } catch (e) {
      console.error('Error loading profile:', e);
    }
  };

  const handleVoteSuccess = () => {
    loadData();
    if (selectedUsername) {
      fetchProfileDetails(selectedUsername);
    }
  };

  const [activeSection, setActiveSection] = useState<string | undefined>(undefined);

  const handleSelectProfile = (username: string, section?: string) => {
    const cleanUsername = username.replace('@', '');
    if (cleanUsername === 'admin') {
      setActiveView('admin');
      window.history.pushState(null, '', '/admin');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (currentProfile?.username !== cleanUsername) {
      setCurrentProfile(null); // Clear to show loading state
    }
    setSelectedUsername(cleanUsername);
    setActiveSection(section);
    setActiveView('profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Update URL bar dynamically
    window.history.pushState(null, '', `/@${cleanUsername}`);
    
    fetchProfileDetails(cleanUsername);
  };

  const handleGoHome = () => {
    setActiveView('home');
    setActiveSection(undefined);
    setSelectedUsername(null);
    setCurrentProfile(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Update URL to home
    window.history.pushState(null, '', '/');
    
    loadData();
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    setCurrentUser(null);
    setActiveView('home');
    setSelectedUsername(null);
    setCurrentProfile(null);
    window.history.pushState(null, '', '/');
  };

  const handleSelectSessionUser = async (profileId: string | null) => {
    try {
      const res = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileId }),
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        if (data.user) {
          handleSelectProfile(data.user.username, 'global_feed');
        } else {
          setActiveView('home');
          setSelectedUsername(null);
          setCurrentProfile(null);
        }
      }
    } catch (e) {
      console.error('Error selecting session user:', e);
    }
  };

  const handleStartEarning = () => {
    if (currentUser) {
      handleSelectProfile(currentUser.username);
    } else {
      setAuthModal({ open: true, mode: 'signup' });
    }
  };

  const handleUpdateAdSense = async (pubId: string): Promise<boolean> => {
    if (!currentProfile) return false;
    try {
      const res = await fetch('/api/profile/update-adsense', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: currentProfile.username,
          adsense_pub_id: pubId,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentProfile(data.profile);
        if (currentUser?.username === currentProfile.username) {
          setCurrentUser(data.profile);
        }
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const handleSimulateMilestones = async () => {
    if (!currentProfile) return;
    try {
      const res = await fetch('/api/simulate-milestone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: currentProfile.username }),
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentProfile(data.profile);
        fetchProfileDetails(currentProfile.username);
        loadData();
      }
    } catch {}
  };

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
      
      <Header
        currentUser={currentUser}
        onOpenAuth={(mode) => setAuthModal({ open: true, mode })}
        onSelectProfile={handleSelectProfile}
        onGoHome={handleGoHome}
        onGoFeed={() => { setSelectedUsername(null); setActiveView('feed'); }}
        onLogout={handleLogout}
        activeView={activeView}
        activeSection={activeSection}
      />


      {/* Content Router */}
      <main className="flex-1 w-full">
        {activeView === 'admin' ? (
          <AdminPanel onGoHome={handleGoHome} />
        ) : activeView === 'home' ? (
          <div>
            {/* 1. Hero Section */}
            <HeroSection
              onGetStarted={(username) => {
                setAuthModal({ open: true, mode: 'signup', suggested: username });
              }}
            />

            {/* 2. Trending Posts Carousel */}
            <TrendingPosts
              posts={allPosts}
              onSelectPost={(post) => setSelectedPost(post)}
              onSelectProfile={handleSelectProfile}
            />

            {/* 3. Earn with Ease Details */}
            <EarnInfoSection />

            {/* 4. Trending Profiles Carousel */}
            <TrendingProfiles
              profiles={allProfiles}
              onSelectProfile={handleSelectProfile}
            />

            {/* 5. Basic vs Verified Tiers with Milestones */}
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
              initialSection={activeSection}
              onOpenCreatePost={() => setCreatePostOpen(true)}
              onSelectPost={(post) => setSelectedPost(post)}
              onBackHome={handleGoHome}
              onUpdateAdSense={handleUpdateAdSense}
              onSimulateMilestones={handleSimulateMilestones}
              onOpenAdsTxt={() => setAdsTxtOpen(true)}
              onLogout={handleLogout}
              onVoteSuccess={handleVoteSuccess}
              onSelectProfile={handleSelectProfile}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-32">
              <div className="animate-spin w-10 h-10 border-4 border-white/20 border-t-[#FF2D55] rounded-full mb-4"></div>
              <p className="text-gray-400 font-medium">Loading profile...</p>
            </div>
          )
        )}
      </main>

      {/* Global Footer */}
      <Footer
        onOpenAdsTxt={() => setAdsTxtOpen(true)}
        onOpenSupabaseModal={() => setSupabaseModalOpen(true)}
      />

      {/* Post Detail Modal with 70/30 AdSense Banner */}
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
            document.cookie = `yostar_session=${profile.username}; path=/; max-age=31536000`;
            handleSelectProfile(profile.username, 'global_feed');
            loadData();
          }}
        />
      )}

      {/* Dynamic ads.txt Route Viewer Modal */}
      {adsTxtOpen && <AdsTxtModal onClose={() => setAdsTxtOpen(false)} />}

      {/* Supabase Schema & Setup Modal */}
      {supabaseModalOpen && <SupabaseModal onClose={() => setSupabaseModalOpen(false)} />}
    </div>
  );
}
