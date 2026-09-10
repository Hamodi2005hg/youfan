import React, { useState, useEffect } from 'react';
import { Database, CheckCircle2, Copy, ExternalLink, X, AlertTriangle } from 'lucide-react';

interface SupabaseModalProps {
  onClose: () => void;
}

const SQL_SCHEMA = `-- 1. Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT DEFAULT '',
  bio TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  category TEXT DEFAULT 'General',
  adsense_pub_id TEXT DEFAULT '',
  views_count INT DEFAULT 0,
  is_banned BOOLEAN DEFAULT false,
  last_ip TEXT DEFAULT '',
  social_links JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Optional: If table already exists, add missing columns safely
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'General';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_ip TEXT DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}'::jsonb;

-- 2. Posts table
CREATE TABLE IF NOT EXISTS public.posts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  link_url TEXT DEFAULT '',
  upvotes INT DEFAULT 0,
  downvotes INT DEFAULT 0,
  views_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Profile views log for 24-hour IP fraud protection
CREATE TABLE IF NOT EXISTS public.profile_views_log (
  id BIGSERIAL PRIMARY KEY,
  profile_id TEXT NOT NULL,
  viewer_ip TEXT NOT NULL,
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_views_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert profiles" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update profiles" ON public.profiles FOR UPDATE USING (true);

CREATE POLICY "Public posts are viewable by everyone" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Anyone can insert posts" ON public.posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update posts" ON public.posts FOR UPDATE USING (true);
CREATE POLICY "Public views log is viewable" ON public.profile_views_log FOR ALL USING (true);`;

export const SupabaseModal: React.FC<SupabaseModalProps> = ({ onClose }) => {
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState<any>(null);

  useEffect(() => {
    fetch('/api/status')
      .then((r) => r.json())
      .then((d) => setStatus(d))
      .catch(() => {});
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(SQL_SCHEMA);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-gray-100 animate-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-[#3ECF8E]">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-black">Supabase PostgreSQL Integration</h3>
                <span className="text-[11px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  Connected
                </span>
              </div>
              <p className="text-xs text-gray-500 truncate max-w-md font-mono">
                {status?.supabaseUrl || 'https://xhgfzmsegirflfyumkdd.supabase.co'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-black font-bold p-1 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status info */}
        <div className="my-4 space-y-3">
          <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-100 text-xs text-emerald-900 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Supabase API Client Configured & Live</p>
              <p className="text-emerald-700 mt-0.5">
                Your credentials are active. To initialize the tables in your Supabase project, copy and run the SQL below in your{' '}
                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold underline"
                >
                  Supabase SQL Editor
                </a>
                .
              </p>
            </div>
          </div>
        </div>

        {/* SQL Code Box */}
        <div className="relative flex-1 min-h-[220px] bg-gray-950 text-gray-200 rounded-2xl p-4 font-mono text-xs overflow-y-auto border border-gray-800">
          <pre className="whitespace-pre-wrap">{SQL_SCHEMA}</pre>
        </div>

        {/* Actions */}
        <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-black hover:bg-gray-800 text-white text-xs font-bold rounded-full transition cursor-pointer"
          >
            {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'SQL Copied to Clipboard!' : 'Copy SQL Schema'}</span>
          </button>

          <a
            href="https://supabase.com/dashboard/project/xhgfzmsegirflfyumkdd/sql"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-xs font-semibold text-gray-700 hover:text-black"
          >
            <span>Open Supabase SQL Editor</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
