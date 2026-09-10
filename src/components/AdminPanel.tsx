import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Users, 
  Image as ImageIcon, 
  Search, 
  Ban, 
  CheckCircle, 
  Bell, 
  LogOut, 
  Save, 
  Sparkles, 
  Globe, 
  Mail, 
  Lock, 
  AlertCircle 
} from 'lucide-react';

interface UserItem {
  id: string;
  username: string;
  display_name?: string;
  avatar_url?: string;
  email?: string;
  created_at?: string;
  is_banned?: boolean;
  country?: string;
}

interface PlatformSettings {
  heroTitle: string;
  heroSub: string;
  showcaseImageUrl: string;
  activePublishersCount: number;
}

export const AdminPanel: React.FC<{ onGoHome: () => void }> = ({ onGoHome }) => {
  // Admin Auth State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('admin_session') === 'true';
  });
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Admin Dashboard State
  const [activeTab, setActiveTab] = useState<'users' | 'settings'>('users');
  const [users, setUsers] = useState<UserItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [usersLoading, setUsersLoading] = useState(false);

  // Settings State
  const [settings, setSettings] = useState<PlatformSettings>({
    heroTitle: '',
    heroSub: '',
    showcaseImageUrl: '',
    activePublishersCount: 3490,
  });
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState('');

  // Notification Modal State
  const [notifyModal, setNotifyModal] = useState<{ open: boolean; user?: UserItem; title: string; message: string }>({
    open: false,
    title: '',
    message: '',
  });
  const [notifyLoading, setNotifyLoading] = useState(false);
  const [notifySuccess, setNotifySuccess] = useState('');

  // Load data if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchUsers();
      fetchSettings();
    }
  }, [isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput, password: passwordInput }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsAuthenticated(true);
        localStorage.setItem('admin_session', 'true');
      } else {
        setLoginError(data.error || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setLoginError('Server connection error');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('admin_session');
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (e) {
      console.error('Error fetching admin users:', e);
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/platform-settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (e) {
      console.error('Error fetching settings:', e);
    }
  };

  const handleToggleBan = async (user: UserItem) => {
    const newStatus = !user.is_banned;
    const confirmMsg = newStatus 
      ? `Are you sure you want to ban user @${user.username}?` 
      : `Are you sure you want to unban user @${user.username}?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await fetch('/api/admin/ban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, isBanned: newStatus }),
      });

      if (res.ok) {
        setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_banned: newStatus } : u));
      } else {
        alert('An error occurred while updating ban status.');
      }
    } catch (e) {
      alert('Server connection failed.');
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsLoading(true);
    setSettingsSuccess('');

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        setSettingsSuccess('Platform settings and images saved successfully!');
        setTimeout(() => setSettingsSuccess(''), 4000);
      } else {
        alert('An error occurred while saving settings.');
      }
    } catch (e) {
      alert('Server connection failed.');
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifyModal.user || !notifyModal.title || !notifyModal.message) return;

    setNotifyLoading(true);
    setNotifySuccess('');

    try {
      const res = await fetch('/api/admin/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: notifyModal.user.id,
          title: notifyModal.title,
          message: notifyModal.message,
        }),
      });

      if (res.ok) {
        setNotifySuccess(`Notification sent successfully to @${notifyModal.user.username}`);
        setTimeout(() => {
          setNotifySuccess('');
          setNotifyModal({ open: false, title: '', message: '' });
        }, 2000);
      } else {
        alert('An error occurred while sending notification.');
      }
    } catch (e) {
      alert('Server connection failed.');
    } finally {
      setNotifyLoading(false);
    }
  };

  const filteredUsers = users.filter(u => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      u.username.toLowerCase().includes(q) ||
      (u.display_name && u.display_name.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.country && u.country.toLowerCase().includes(q))
    );
  });

  // Login View
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 font-sans text-white">
        <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF2D55]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#FF2D55]/10 border border-[#FF2D55]/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#FF2D55]">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white mb-2">Admin Dashboard</h1>
            <p className="text-sm text-gray-400">Sign in with authorized administrator credentials</p>
          </div>

          {loginError && (
            <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-gray-500 absolute left-4 top-3.5" />
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="admin@youfan.com"
                  className="w-full bg-gray-950 border border-gray-800 rounded-2xl pl-12 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#FF2D55] text-sm transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-gray-500 absolute left-4 top-3.5" />
                <input
                  type="password"
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-gray-950 border border-gray-800 rounded-2xl pl-12 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#FF2D55] text-sm transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3.5 px-6 bg-[#FF2D55] hover:bg-[#e02648] text-white font-bold rounded-2xl transition-all shadow-lg shadow-[#FF2D55]/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loginLoading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-800 text-center">
            <button
              onClick={onGoHome}
              className="text-xs text-gray-500 hover:text-white transition-colors cursor-pointer"
            >
              Back to Main Platform
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard View
  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans">
      {/* Admin Navbar */}
      <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#FF2D55] rounded-xl flex items-center justify-center text-white shadow-lg shadow-[#FF2D55]/20">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-black text-lg text-white leading-none">Executive Control Panel</h1>
              <p className="text-xs text-gray-400 mt-1">YoStar Admin Control Center</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onGoHome}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              View Platform
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-3 mb-8 border-b border-gray-800 pb-4">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-5 py-2.5 rounded-2xl font-bold text-sm transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'users'
                ? 'bg-[#FF2D55] text-white shadow-lg shadow-[#FF2D55]/20'
                : 'bg-gray-900 text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Users & Accounts</span>
            <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs font-mono">{users.length}</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-5 py-2.5 rounded-2xl font-bold text-sm transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-[#FF2D55] text-white shadow-lg shadow-[#FF2D55]/20'
                : 'bg-gray-900 text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Platform Landing & Images</span>
          </button>
        </div>

        {/* TAB 1: USERS MANAGEMENT & SEARCH */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Search Bar & Actions Header */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-900 p-4 rounded-3xl border border-gray-800">
              <div className="relative w-full sm:w-96">
                <Search className="w-5 h-5 text-gray-500 absolute left-4 top-3.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by username, email, or country..."
                  className="w-full bg-gray-950 border border-gray-800 rounded-2xl pl-12 pr-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#FF2D55]"
                />
              </div>

              <div className="text-xs text-gray-400 font-medium">
                Found: <span className="text-white font-bold">{filteredUsers.length}</span> users
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden shadow-xl">
              {usersLoading ? (
                <div className="p-12 text-center text-gray-400">Loading user registry...</div>
              ) : filteredUsers.length === 0 ? (
                <div className="p-12 text-center text-gray-500">No registered users matching search query.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-950/60 text-gray-400 text-xs font-bold uppercase tracking-wider border-b border-gray-800">
                      <tr>
                        <th className="px-6 py-4">User</th>
                        <th className="px-6 py-4">Email</th>
                        <th className="px-6 py-4">Country</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Admin Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/60">
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-800/40 transition-colors">
                          <td className="px-6 py-4 flex items-center gap-3">
                            <img
                              src={user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                              alt={user.username}
                              className="w-10 h-10 rounded-full object-cover border border-gray-700 shrink-0"
                            />
                            <div>
                              <div className="font-bold text-white">@{user.username}</div>
                              {user.display_name && (
                                <div className="text-xs text-gray-400">{user.display_name}</div>
                              )}
                            </div>
                          </td>

                          <td className="px-6 py-4 text-gray-300 font-mono text-xs">
                            {user.email || 'Unregistered'}
                          </td>

                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-800 text-gray-300 text-xs font-medium border border-gray-700">
                              <Globe className="w-3.5 h-3.5 text-[#FF2D55]" />
                              <span>{user.country || 'United States'}</span>
                            </span>
                          </td>

                          <td className="px-6 py-4">
                            {user.is_banned ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-bold">
                                <Ban className="w-3.5 h-3.5" />
                                <span>Banned</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span>Active</span>
                              </span>
                            )}
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {/* Ban/Unban Button */}
                              <button
                                onClick={() => handleToggleBan(user)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                                  user.is_banned
                                    ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
                                    : 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20'
                                }`}
                              >
                                <Ban className="w-3.5 h-3.5" />
                                <span>{user.is_banned ? 'Unban User' : 'Ban User'}</span>
                              </button>

                              {/* Notify Button */}
                              <button
                                onClick={() => setNotifyModal({ open: true, user, title: '', message: '' })}
                                className="px-3 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                              >
                                <Bell className="w-3.5 h-3.5" />
                                <span>Send Alert</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: PLATFORM INTERFACE & IMAGES SETTINGS */}
        {activeTab === 'settings' && (
          <div className="max-w-3xl mx-auto bg-gray-900 border border-gray-800 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-800">
              <div className="w-12 h-12 rounded-2xl bg-[#FF2D55]/10 border border-[#FF2D55]/20 flex items-center justify-center text-[#FF2D55]">
                <ImageIcon className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white">Platform Settings & Image Assets</h2>
                <p className="text-xs text-gray-400">Modify hero images and promotional homepage texts</p>
              </div>
            </div>

            {settingsSuccess && (
              <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-bold flex items-center gap-3">
                <CheckCircle className="w-5 h-5 shrink-0" />
                <span>{settingsSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                  Showcase Image URL
                </label>
                <input
                  type="url"
                  required
                  value={settings.showcaseImageUrl}
                  onChange={(e) => setSettings({ ...settings, showcaseImageUrl: e.target.value })}
                  className="w-full bg-gray-950 border border-gray-800 rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#FF2D55]"
                />
                
                {/* Image Live Preview */}
                {settings.showcaseImageUrl && (
                  <div className="mt-4 p-3 bg-gray-950 rounded-2xl border border-gray-800 flex items-center gap-4">
                    <img
                      src={settings.showcaseImageUrl}
                      alt="Preview"
                      className="w-20 h-24 object-cover rounded-xl border border-gray-700"
                    />
                    <div>
                      <p className="text-xs font-bold text-gray-300">Current Image Preview</p>
                      <p className="text-[11px] text-gray-500 truncate max-w-xs">{settings.showcaseImageUrl}</p>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                  Hero Title
                </label>
                <textarea
                  rows={2}
                  value={settings.heroTitle}
                  onChange={(e) => setSettings({ ...settings, heroTitle: e.target.value })}
                  className="w-full bg-gray-950 border border-gray-800 rounded-2xl p-4 text-white text-sm focus:outline-none focus:border-[#FF2D55]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                  Hero Subtitle
                </label>
                <textarea
                  rows={3}
                  value={settings.heroSub}
                  onChange={(e) => setSettings({ ...settings, heroSub: e.target.value })}
                  className="w-full bg-gray-950 border border-gray-800 rounded-2xl p-4 text-white text-sm focus:outline-none focus:border-[#FF2D55]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                  Active Publishers Count
                </label>
                <input
                  type="number"
                  value={settings.activePublishersCount}
                  onChange={(e) => setSettings({ ...settings, activePublishersCount: Number(e.target.value) })}
                  className="w-full bg-gray-950 border border-gray-800 rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#FF2D55]"
                />
              </div>

              <button
                type="submit"
                disabled={settingsLoading}
                className="w-full py-4 bg-[#FF2D55] hover:bg-[#e02648] text-white font-bold rounded-2xl transition-all shadow-lg shadow-[#FF2D55]/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                <span>{settingsLoading ? 'Saving...' : 'Save Settings'}</span>
              </button>
            </form>
          </div>
        )}
      </main>

      {/* NOTIFICATION MODAL */}
      {notifyModal.open && notifyModal.user && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 border-b border-gray-800 pb-4">
              <Bell className="w-6 h-6 text-blue-400" />
              <div>
                <h3 className="font-bold text-white text-base">Send Direct Notification</h3>
                <p className="text-xs text-gray-400">To User: @{notifyModal.user.username}</p>
              </div>
            </div>

            {notifySuccess && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-xl">
                {notifySuccess}
              </div>
            )}

            <form onSubmit={handleSendNotification} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1">Notification Title</label>
                <input
                  type="text"
                  required
                  value={notifyModal.title}
                  onChange={(e) => setNotifyModal({ ...notifyModal, title: e.target.value })}
                  placeholder="e.g. Important Admin Alert"
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1">Message Content</label>
                <textarea
                  rows={4}
                  required
                  value={notifyModal.message}
                  onChange={(e) => setNotifyModal({ ...notifyModal, message: e.target.value })}
                  placeholder="Enter notification text for the user..."
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setNotifyModal({ open: false, title: '', message: '' })}
                  className="px-4 py-2 bg-gray-800 text-gray-300 text-xs font-bold rounded-xl hover:bg-gray-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={notifyLoading}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                >
                  {notifyLoading ? 'Sending...' : 'Send Notification'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
