import React, { useState, useEffect } from 'react';
import { Profile, Post } from '../types';
import { FeedPostCard } from './FeedPostCard';
import { AdSenseUnit } from './AdSenseUnit';
import {
  ShieldCheck,
  Eye,
  Grid,
  Plus,
  Share2,
  Lock,
  Unlock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  FileText,
  Menu,
  X,
  Home,
  Bell,
  User,
  Link as LinkIcon,
  Users,
  Settings,
  LogOut,
  ExternalLink,
  Trash2,
  Globe,
  Instagram,
  Twitter,
  Youtube,
  Tv,
} from 'lucide-react';

interface ProfileViewProps {
  profile: Profile;
  posts: Post[];
  allPosts: Post[];
  currentUser: Profile | null;
  initialSection?: string;
  onOpenCreatePost: () => void;
  onSelectPost: (post: Post) => void;
  onBackHome: () => void;
  onUpdateAdSense: (pubId: string) => Promise<boolean>;
  onSimulateMilestones: () => Promise<void>;
  onOpenAdsTxt: () => void;
  onLogout: () => void;
  onVoteSuccess: () => void;
  onSelectProfile: (username: string) => void;
  onRequireAuth: () => void;
}

const CATEGORIES = [
  'General',
  'Travel & Adventure',
  'Fashion & Beauty',
  'Photography',
  'Gaming & Tech',
  'Music & Audio',
  'Fitness & Health',
  'Business & Finance',
  'Education',
  'Art & Design',
];

export const ProfileView: React.FC<ProfileViewProps> = ({
  profile,
  posts,
  allPosts,
  currentUser,
  initialSection,
  onOpenCreatePost,
  onSelectPost,
  onBackHome,
  onUpdateAdSense,
  onSimulateMilestones,
  onOpenAdsTxt,
  onLogout,
  onVoteSuccess,
  onSelectProfile,
  onRequireAuth,
}) => {
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [subscribersOpen, setSubscribersOpen] = useState(false);

  // React to initialSection changes
  useEffect(() => {
    if (initialSection) {
      if (initialSection === 'notifications') {
        setNotificationsOpen(true);
      } else if (initialSection === 'edit-profile') {
        setEditProfileOpen(true);
      } else if (initialSection === 'subscribers') {
        setSubscribersOpen(true);
      } else if (initialSection === 'settings') {
        setSettingsModalOpen(true);
      } else if (initialSection === 'links') {
        setActiveTab('links');
      } else if (initialSection === 'profile') {
        setActiveTab('feed');
      } else if (initialSection === 'global_feed') {
        setActiveTab('global_feed');
      }
    } else {
      setActiveTab('feed');
    }
  }, [initialSection, profile.id]);

  // Profile editable state
  const [bio, setBio] = useState(profile.bio || '');
  const [category, setCategory] = useState((profile as any).category || 'General');
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || '');
  const [socialLinks, setSocialLinks] = useState<{ instagram?: string; twitter?: string; youtube?: string; tiktok?: string }>(
    (profile as any).social_links || {}
  );
  const [savingProfile, setSavingProfile] = useState(false);

  // Links list state
  const [userLinks, setUserLinks] = useState<Array<{ id: string; title: string; url: string; icon: string }>>([]);
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkIcon, setNewLinkIcon] = useState('link');
  const [addingLink, setAddingLink] = useState(false);

  // Followers & Notifications state
  const [followers, setFollowers] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);

  const [inputPubId, setInputPubId] = useState(profile.adsense_pub_id || '');
  const [savingAdSense, setSavingAdSense] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'global_feed' | 'feed' | 'links'>('feed');

  const postsCount = posts.length;
  const postViewsCount = posts.reduce((sum, p) => sum + (p.views_count || 0), 0);

  const meetsViews = postViewsCount >= 5000;
  const isQualified = meetsViews;

  // Load custom links, followers, and notifications with real-time polling
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const [linksRes, followersRes, notifsRes] = await Promise.all([
          profile?.id ? fetch(`/api/links/${profile.id}`) : Promise.resolve(new Response('[]')),
          profile?.id ? fetch(`/api/followers/${profile.id}`) : Promise.resolve(new Response('[]')),
          (currentUser?.id || profile?.id) ? fetch(`/api/notifications/${currentUser?.id || profile?.id}`) : Promise.resolve(new Response('[]')),
        ]);
        
        if (linksRes.ok) {
          try { setUserLinks(await linksRes.json()); } catch (e) {}
        }
        if (followersRes.ok) {
          try {
            const fList = await followersRes.json();
            setFollowers(fList);
            if (currentUser) {
              setIsFollowing(fList.some((f: any) => f.follower_id === currentUser.id));
            }
          } catch (e) {}
        }
        if (notifsRes.ok) {
          try { setNotifications(await notifsRes.json()); } catch (e) {}
        }
      } catch (e) {
        console.error('Error loading extra user data:', e);
      }
    };
    loadUserData();

    // Real-time polling every 4 seconds to ensure notifications show up instantly without page refresh
    const interval = setInterval(loadUserData, 4000);
    return () => clearInterval(interval);
  }, [profile.id, currentUser]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: profile.username,
          bio,
          category,
          avatar_url: avatarUrl,
          social_links: socialLinks,
        }),
      });
      if (res.ok) {
        alert('Profile updated successfully!');
        setEditProfileOpen(false);
        window.location.reload();
      }
    } catch {
      alert('Error saving profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLinkTitle || !newLinkUrl) return;
    setAddingLink(true);
    try {
      const res = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: profile.id,
          title: newLinkTitle,
          url: newLinkUrl,
          icon: newLinkIcon,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setUserLinks((prev) => [...prev, data.link]);
        setNewLinkTitle('');
        setNewLinkUrl('');
      }
    } catch {} finally {
      setAddingLink(false);
    }
  };

  const handleDeleteLink = async (linkId: string) => {
    try {
      await fetch(`/api/links/${linkId}`, { method: 'DELETE' });
      setUserLinks((prev) => prev.filter((l) => l.id !== linkId));
    } catch {}
  };

  
  const handleToggleFollow = async () => {
    if (!currentUser) {
      onRequireAuth();
      return;
    }

    try {
      const res = await fetch('/api/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          follower_id: currentUser.id,
          following_id: profile.id,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setIsFollowing(data.isFollowing);
      }
    } catch {}
  };

  const handleSavePubId = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isQualified) return;
    setSavingAdSense(true);
    setFeedbackMsg(null);
    try {
      const ok = await onUpdateAdSense(inputPubId.trim());
      if (ok) {
        setFeedbackMsg({
          text: 'Google AdSense ID saved and activated! 70% revenue share is now running.',
          type: 'success',
        });
      } else {
        setFeedbackMsg({
          text: 'Failed to update. Make sure milestones are met.',
          type: 'error',
        });
      }
    } catch (err: any) {
      setFeedbackMsg({ text: err.message || 'Error updating ID', type: 'error' });
    } finally {
      setSavingAdSense(false);
    }
  };

  const profileShareUrl = `${window.location.origin}/@${profile.username}`;
  const handleShare = () => {
    navigator.clipboard.writeText(profileShareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#000000] text-white flex flex-col items-center">
      {/* Exact YoFan Authentic Header */}
      <header className="w-full max-w-[796px] h-[60px] md:h-[85px] px-4 md:px-10 flex items-center justify-between bg-black sticky top-0 z-50">
        <div
          onClick={onBackHome}
          className="flex items-center gap-2 cursor-pointer group"
          title="Back to Feed"
        >
          <span className="font-extrabold text-2xl tracking-tighter text-white">
            yo<span className="text-[#FF2D55]">.</span>fan
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Create Post / Add Button */}
          <button
            onClick={onOpenCreatePost}
            className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition shadow-md cursor-pointer"
            title="Create New Post"
          >
            <Plus className="w-5 h-5" />
          </button>

          {/* Burger Menu Button matching YoFan screenshot */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition cursor-pointer"
              title="Menu"
            >
              {menuOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
            </button>

            {/* Sliding Drawer Menu matching YoFan screenshot */}
            {menuOpen && (
              <div className="absolute right-0 top-12 w-72 bg-black/95 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-2xl z-50 flex flex-col gap-1.5 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <img
                      src={profile.avatar_url}
                      alt={profile.username}
                      className="w-9 h-9 rounded-full object-cover border border-white"
                    />
                    <div>
                      <p className="font-bold text-sm text-white">@{profile.username}</p>
                      <p className="text-[11px] text-gray-400">{category}</p>
                    </div>
                  </div>
                  <button onClick={() => setMenuOpen(false)} className="text-gray-400 hover:text-white p-1">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={() => {
                    setActiveTab('global_feed');
                    setMenuOpen(false);
                  }}
                  className={`flex items-center gap-3.5 p-3 rounded-xl hover:bg-white/10 text-sm font-medium transition cursor-pointer text-white w-full text-left ${
                    activeTab === 'global_feed' ? 'bg-white/10' : ''
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-gray-300" />
                  <span>Feed</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('feed');
                    setMenuOpen(false);
                  }}
                  className={`flex items-center gap-3.5 p-3 rounded-xl hover:bg-white/10 text-sm font-medium transition cursor-pointer text-white w-full text-left ${
                    activeTab === 'feed' ? 'bg-white/10' : ''
                  }`}
                >
                  <Home className="w-4 h-4 text-gray-300" />
                  <span>My Profile</span>
                </button>

                <button
                  onClick={() => {
                    setNotificationsOpen(true);
                    setMenuOpen(false);
                  }}
                  className="flex items-center gap-3.5 p-3 rounded-xl hover:bg-white/10 text-sm font-medium transition cursor-pointer text-white relative w-full text-left"
                >
                  <Bell className="w-4 h-4 text-gray-300" />
                  <span>Notifications</span>
                  {notifications.filter((n) => !n.is_read).length > 0 && (
                    <span className="ml-auto w-2 h-2 rounded-full bg-blue-500" />
                  )}
                </button>

                <button
                  onClick={() => {
                    setEditProfileOpen(true);
                    setMenuOpen(false);
                  }}
                  className="flex items-center gap-3.5 p-3 rounded-xl hover:bg-white/10 text-sm font-medium transition cursor-pointer text-white w-full text-left"
                >
                  <User className="w-4 h-4 text-gray-300" />
                  <span>Edit profile</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('links');
                    setMenuOpen(false);
                  }}
                  className={`flex items-center gap-3.5 p-3 rounded-xl hover:bg-white/10 text-sm font-medium transition cursor-pointer text-white w-full text-left ${
                    activeTab === 'links' ? 'bg-white/10' : ''
                  }`}
                >
                  <LinkIcon className="w-4 h-4 text-gray-300" />
                  <span>Links</span>
                </button>

                <button
                  onClick={() => {
                    setSubscribersOpen(true);
                    setMenuOpen(false);
                  }}
                  className="flex items-center gap-3.5 p-3 rounded-xl hover:bg-white/10 text-sm font-medium transition cursor-pointer text-white w-full text-left"
                >
                  <Users className="w-4 h-4 text-gray-300" />
                  <span>Subscribers</span>
                </button>

                <button
                  onClick={() => {
                    setSettingsModalOpen(true);
                    setMenuOpen(false);
                  }}
                  className="flex items-center gap-3.5 p-3 rounded-xl hover:bg-white/10 text-sm font-medium transition cursor-pointer text-white w-full text-left"
                >
                  <Settings className="w-4 h-4 text-gray-300" />
                  <span>Settings & AdSense</span>
                </button>

                <div className="pt-2 mt-1 border-t border-white/10">
                  <button
                    onClick={() => {
                      onLogout();
                      setMenuOpen(false);
                    }}
                    className="flex items-center gap-3.5 p-3 rounded-xl hover:bg-rose-500/20 text-rose-400 text-sm font-medium transition cursor-pointer w-full text-left border-none"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Profile Container matching YoFan 796px layout */}
      <main className="w-full max-w-[796px] pb-24">
        {activeTab === 'global_feed' ? (
          <div className="px-4 py-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
              <div>
                <h2 className="text-2xl font-black text-white flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-[#FF2D55] fill-[#FF2D55]/10 animate-pulse" />
                  <span>Creators Feed</span>
                </h2>
                <p className="text-xs text-gray-400 mt-1">Discover the freshest, highly engaging, and upvoted posts from creators.</p>
              </div>
            </div>

            {allPosts.length === 0 ? (
              <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10">
                <p className="text-[#B7B7B7]">There are currently no publications in the feed.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {allPosts.map((post) => (
                  <FeedPostCard
                    onRequireAuth={onRequireAuth}
                    key={post.id}
                    post={post}
                    currentUser={currentUser}
                    onVoteSuccess={onVoteSuccess}
                    onSelectProfile={onSelectProfile}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Profile Head Banner & Avatar */}
            <div className="relative w-full h-[320px] sm:h-[450px] overflow-hidden flex flex-col items-center justify-end z-10">
              <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black z-10" />
              <img
                src="https://yo.fan/assets/images/default-profile-background.png"
                alt="Profile Background"
                className="absolute inset-0 w-full h-full object-cover"
              />

              {/* Centered Avatar */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
                <img
                  src={profile.avatar_url}
                  alt={profile.username}
                  className="w-28 h-28 sm:w-[150px] sm:h-[150px] rounded-full object-cover border-2 border-white shadow-2xl bg-[#d9d9d9]"
                />
              </div>

              {/* Profile Name & Share */}
              <div className="relative z-20 pb-4 flex flex-col items-center gap-2">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-1">
                    <span>@</span>
                    {profile.username}
                  </h1>
                  <button onClick={handleShare} className="cursor-pointer hover:scale-110 transition p-1" title="Share Profile Link">
                    <Share2 className="w-5 h-5 text-white" />
                  </button>
                </div>
                {profile.bio && <p className="text-xs text-gray-300 max-w-md text-center px-4">{profile.bio}</p>}
                
                {/* Follow / Subscribe button if viewing someone else */}
                {currentUser && currentUser.id !== profile.id && (
                  <button
                    onClick={handleToggleFollow}
                    className={`mt-2 px-6 py-2 rounded-full font-bold text-xs transition cursor-pointer ${
                      isFollowing ? 'bg-white/20 text-white' : 'bg-white text-black hover:bg-gray-200'
                    }`}
                  >
                    {isFollowing ? 'Following' : 'Follow Creator'}
                  </button>
                )}

                {copiedLink && (
                  <span className="text-[11px] bg-emerald-500 text-black px-2.5 py-0.5 rounded-full font-bold animate-bounce">
                    Profile link copied to clipboard!
                  </span>
                )}
              </div>
            </div>

            {/* Stats Row */}
            <div className="flex w-full justify-around py-6 bg-black border-b border-white/10">
              <div className="flex flex-col items-center cursor-pointer">
                <span className="text-xl font-bold text-white">{postsCount}</span>
                <span className="text-xs text-[#B7B7B7]">Posts</span>
              </div>
              <div onClick={() => setSubscribersOpen(true)} className="flex flex-col items-center cursor-pointer">
                <span className="text-xl font-bold text-white">{followers.length}</span>
                <span className="text-xs text-[#B7B7B7]">Followers</span>
              </div>
              <div onClick={() => setActiveTab('links')} className="flex flex-col items-center cursor-pointer">
                <span className="text-xl font-bold text-white">{userLinks.length}</span>
                <span className="text-xs text-[#B7B7B7]">Links</span>
              </div>
            </div>

            {/* Auto AdSense Revenue Sharing Unit */}
            <div className="w-full px-4 mt-2">
              <AdSenseUnit profileOwner={profile} />
            </div>

            {/* Feed Switcher (Feed / Links) */}
            <div className="flex items-center justify-around h-[46px] border-b border-white/10 relative my-4">
              <button
                onClick={() => setActiveTab('feed')}
                className={`cursor-pointer transition ${activeTab === 'feed' ? 'text-white' : 'text-[#B7B7B7]'}`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <div className="absolute w-px h-5 bg-white/20 left-1/2 -translate-x-1/2" />
              <button
                onClick={() => setActiveTab('links')}
                className={`cursor-pointer transition ${activeTab === 'links' ? 'text-white' : 'text-[#B7B7B7]'}`}
              >
                <LinkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Content Tabs */}
            <div className="px-4">
              {activeTab === 'feed' ? (
                posts.length === 0 ? (
                  <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10">
                    <p className="text-[#B7B7B7] mb-4">No publications yet for @{profile.username}</p>
                    <button
                      onClick={onOpenCreatePost}
                      className="px-6 py-3 bg-white text-black font-bold text-sm rounded-full cursor-pointer hover:bg-gray-200 transition"
                    >
                      Create First Post
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {posts.map((post) => (
                      <FeedPostCard
                    onRequireAuth={onRequireAuth}
                        key={post.id}
                        post={post}
                        currentUser={currentUser}
                        onVoteSuccess={onVoteSuccess}
                        onSelectProfile={onSelectProfile}
                      />
                    ))}
                  </div>
                )
              ) : (
                <div className="space-y-4">
                  {currentUser && currentUser.id === profile.id && (
                    <form onSubmit={handleAddLink} className="bg-[#131313] p-4 rounded-2xl border border-white/10 space-y-3">
                      <h4 className="font-bold text-sm text-white">Add New Bio Link</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Link Title (e.g. YouTube Channel)"
                          value={newLinkTitle}
                          onChange={(e) => setNewLinkTitle(e.target.value)}
                          className="p-2.5 rounded-xl bg-black border border-white/20 text-xs text-white"
                          required
                        />
                        <input
                          type="url"
                          placeholder="URL (https://...)"
                          value={newLinkUrl}
                          onChange={(e) => setNewLinkUrl(e.target.value)}
                          className="p-2.5 rounded-xl bg-black border border-white/20 text-xs text-white"
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={addingLink}
                        className="w-full py-2 bg-white text-black font-bold rounded-xl text-xs hover:bg-gray-200 cursor-pointer"
                      >
                        {addingLink ? 'Adding...' : 'Add Link'}
                      </button>
                    </form>
                  )}

                  {userLinks.length === 0 ? (
                    <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/10">
                      <LinkIcon className="w-8 h-8 mx-auto text-gray-500 mb-2" />
                      <p className="text-sm font-bold text-gray-300">No links added yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {userLinks.map((link) => (
                        <div
                          key={link.id}
                          className="flex items-center justify-between p-4 bg-[#131313] rounded-2xl border border-white/10 hover:border-white/30 transition"
                        >
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-3 flex-1 font-bold text-sm text-white hover:underline"
                          >
                            <Globe className="w-4 h-4 text-blue-400" />
                            <span>{link.title}</span>
                            <ExternalLink className="w-3.5 h-3.5 text-gray-500 ml-auto" />
                          </a>
                          {currentUser && currentUser.id === profile.id && (
                            <button
                              onClick={() => handleDeleteLink(link.id)}
                              className="ml-3 p-2 text-rose-400 hover:bg-rose-500/10 rounded-lg cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* Edit Profile Modal (Includes Category Selection, Bio, Avatar, Social Links, and Shareable Profile Link) */}
      {editProfileOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#1a1a1a] text-white rounded-3xl p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">Edit Profile & Category</h3>
              <button onClick={() => setEditProfileOpen(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Shareable Link Box */}
              <div className="p-3 bg-black/60 rounded-2xl border border-white/10">
                <label className="block text-[11px] font-bold uppercase text-gray-400 mb-1">Your Shareable Profile Link</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={profileShareUrl}
                    readOnly
                    className="w-full p-2.5 bg-black border border-white/20 rounded-xl text-xs text-gray-300 font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleShare}
                    className="px-4 py-2.5 bg-white text-black font-bold text-xs rounded-xl hover:bg-gray-200 cursor-pointer"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Avatar Image URL</label>
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full p-3 rounded-xl bg-black border border-white/20 text-white text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Bio / About</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell your audience about yourself..."
                  className="w-full p-3 rounded-xl bg-black border border-white/20 text-white text-sm h-20 resize-none"
                />
              </div>

              {/* Category Selection Dropdown */}
              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Creator Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-3 rounded-xl bg-black border border-white/20 text-white text-sm cursor-pointer"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat} className="bg-black text-white">
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Social Media Links */}
              <div className="space-y-2 pt-2 border-t border-white/10">
                <label className="block text-xs font-bold uppercase text-gray-400">Social Media Links</label>
                <div className="flex items-center gap-2">
                  <Instagram className="w-5 h-5 text-pink-400 shrink-0" />
                  <input
                    type="text"
                    placeholder="Instagram Username or URL"
                    value={socialLinks.instagram || ''}
                    onChange={(e) => setSocialLinks({ ...socialLinks, instagram: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-black border border-white/20 text-xs text-white"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Twitter className="w-5 h-5 text-blue-400 shrink-0" />
                  <input
                    type="text"
                    placeholder="Twitter / X Handle or URL"
                    value={socialLinks.twitter || ''}
                    onChange={(e) => setSocialLinks({ ...socialLinks, twitter: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-black border border-white/20 text-xs text-white"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Youtube className="w-5 h-5 text-rose-500 shrink-0" />
                  <input
                    type="text"
                    placeholder="YouTube Channel URL"
                    value={socialLinks.youtube || ''}
                    onChange={(e) => setSocialLinks({ ...socialLinks, youtube: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-black border border-white/20 text-xs text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={savingProfile}
                className="w-full py-3 bg-white text-black font-bold rounded-xl text-sm hover:bg-gray-200 cursor-pointer mt-4"
              >
                {savingProfile ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Settings Modal (AdSense appears here ONLY when qualified) */}
      {settingsModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#1a1a1a] text-white rounded-3xl p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-[#FFFB93] flex items-center justify-center font-bold">
                  <Settings className="w-5 h-5 text-black" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Creator Settings & AdSense</h3>
                  <p className="text-xs text-gray-400">Manage account & 70/30 revenue share</p>
                </div>
              </div>
              <button
                onClick={() => setSettingsModalOpen(false)}
                className="text-gray-400 hover:text-white font-bold text-lg p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Milestones Progress Block */}
            <div className="bg-black/50 rounded-2xl p-5 mb-6 border border-white/10">
              <h4 className="text-xs uppercase font-extrabold tracking-wider text-gray-400 mb-4">
                Monetization Eligibility Milestones
              </h4>

              {/* Requirement: 5,000 Views on Publications */}
              <div className="mb-4">
                <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                  <span className="flex items-center gap-1.5 text-gray-200">
                    {meetsViews ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-400" />
                    )}
                    1. Minimum 5,000 Verified Post Views
                  </span>
                  <span className={meetsViews ? 'text-emerald-400' : 'text-gray-400'}>
                    {postViewsCount.toLocaleString()} / 5,000
                  </span>
                </div>
                <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      meetsViews ? 'bg-emerald-400' : 'bg-[#FFFB93]'
                    }`}
                    style={{ width: `${Math.min(100, (postViewsCount / 5000) * 100)}%` }}
                  />
                </div>
              </div>

              <p className="text-[11px] text-gray-400 leading-normal mt-2">
                🛡️ <strong>Anti-fraud security enabled:</strong> Repeated visits from the same IP within 24 hours are discarded.
              </p>

              {!isQualified && (
                <div className="mt-4 pt-3 border-t border-white/10 flex justify-between items-center">
                  <span className="text-xs text-gray-400">Want to test AdSense right away?</span>
                  <button
                    onClick={async () => {
                      await onSimulateMilestones();
                      setFeedbackMsg({
                        text: 'Milestones achieved! (10 posts & 6,500 post views simulated). AdSense input is now unlocked.',
                        type: 'success',
                      });
                    }}
                    className="px-3 py-1.5 bg-[#FFFB93] text-black text-xs font-bold rounded-lg hover:bg-[#FFF866] cursor-pointer"
                  >
                    Simulate Milestones
                  </button>
                </div>
              )}
            </div>

            {/* AdSense Publisher ID Input - Shown ONLY here in Settings, and enabled only when qualified */}
            {isQualified ? (
              <form onSubmit={handleSavePubId} className="space-y-4">
                <div className="p-4 bg-emerald-950/30 rounded-2xl border border-emerald-500/30 mb-2">
                  <p className="text-xs text-emerald-300 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    Congratulations! You have unlocked AdSense 70/30 monetization.
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                    Google AdSense Publisher ID
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={inputPubId}
                      onChange={(e) => setInputPubId(e.target.value)}
                      placeholder="pub-xxxxxxxxxxxxxxxx"
                      className="w-full p-3.5 rounded-2xl border font-mono text-sm focus:outline-none transition text-white bg-black border-white/20 focus:border-white"
                    />
                    <div className="absolute right-3.5 top-3.5">
                      <Unlock className="w-5 h-5 text-emerald-400" />
                    </div>
                  </div>
                </div>

                {feedbackMsg && (
                  <div
                    className={`p-3 rounded-xl text-xs font-medium ${
                      feedbackMsg.type === 'success'
                        ? 'bg-emerald-900/50 text-emerald-200 border border-emerald-700'
                        : 'bg-rose-950/50 text-rose-200 border border-rose-800'
                    }`}
                  >
                    {feedbackMsg.text}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={savingAdSense}
                  className="w-full py-3.5 rounded-2xl font-bold text-sm transition cursor-pointer flex items-center justify-center gap-2 bg-[#FFFB93] hover:bg-[#FFF866] text-black"
                >
                  {savingAdSense ? 'Saving...' : 'Save & Activate AdSense (70/30)'}
                </button>
              </form>
            ) : (
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-center">
                <Lock className="w-6 h-6 mx-auto text-gray-500 mb-2" />
                <p className="text-xs font-bold text-gray-300 mb-1">Google AdSense ID Input Locked</p>
                <p className="text-[11px] text-gray-500">
                  Complete the milestones above (10 posts and 1,000 views) or click "Simulate Milestones" to unlock your AdSense Publisher ID input field.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notifications Modal */}
      {notificationsOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#1a1a1a] text-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-white/10 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Notifications</h3>
              <button onClick={() => setNotificationsOpen(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>
            <div className="space-y-3 py-2">
              {notifications.length === 0 ? (
                <div className="text-center py-10">
                  <Bell className="w-10 h-10 mx-auto text-gray-600 mb-2" />
                  <p className="text-sm font-medium text-gray-300">No new notifications</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div key={n.id} className="p-3 bg-white/5 rounded-2xl border border-white/10">
                    <p className="font-bold text-xs text-white mb-1">{n.title}</p>
                    <p className="text-xs text-gray-300">{n.message}</p>
                    <span className="text-[10px] text-gray-500 mt-2 block">{new Date(n.created_at).toLocaleDateString()}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Subscribers Modal */}
      {subscribersOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#1a1a1a] text-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-white/10 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Followers & Subscribers ({followers.length})</h3>
              <button onClick={() => setSubscribersOpen(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>
            <div className="space-y-3 py-2">
              {followers.length === 0 ? (
                <div className="text-center py-10">
                  <Users className="w-10 h-10 mx-auto text-gray-600 mb-2" />
                  <p className="text-sm font-medium text-gray-300">No followers yet</p>
                  <p className="text-xs text-gray-500 mt-1">Share your profile link to grow your audience!</p>
                </div>
              ) : (
                followers.map((f, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      if (f.username) {
                        setSubscribersOpen(false);
                        onSelectProfile(f.username);
                      }
                    }}
                    className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 transition-all rounded-2xl border border-white/10 cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={f.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${f.username || 'user'}`}
                        alt={f.username || f.follower_id}
                        className="w-10 h-10 rounded-full object-cover border border-white/10 group-hover:border-white/40 transition-all"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <p className="font-bold text-sm text-white group-hover:text-[#FF2D55] transition-colors">
                          @{f.username || f.follower_id}
                        </p>
                        <p className="text-[10px] text-gray-400">YoStar Creator Subscriber</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400 group-hover:text-white font-medium">View Profile →</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
