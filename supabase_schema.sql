-- =========================================================================
-- YoFan Comprehensive Database Schema for Supabase (PostgreSQL)
-- Execute this script in your Supabase Dashboard -> SQL Editor
-- =========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles table (with category and social links)
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  bio TEXT DEFAULT '',
  category TEXT DEFAULT 'General',
  avatar_url TEXT DEFAULT '',
  social_links JSONB DEFAULT '{}'::jsonb,
  adsense_pub_id TEXT DEFAULT '',
  views_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Posts table
CREATE TABLE IF NOT EXISTS public.posts (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  views_count INT DEFAULT 0,
  upvotes INT DEFAULT 0,
  downvotes INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Profile views log for 24-hour IP fraud protection
CREATE TABLE IF NOT EXISTS public.profile_views_log (
  id BIGSERIAL PRIMARY KEY,
  profile_id TEXT NOT NULL,
  viewer_ip TEXT NOT NULL,
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Followers table (For user-to-user follows)
CREATE TABLE IF NOT EXISTS public.followers (
  id BIGSERIAL PRIMARY KEY,
  follower_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_follower_following UNIQUE (follower_id, following_id)
);

-- 5. Links table (Custom bio links added by the user)
CREATE TABLE IF NOT EXISTS public.links (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  icon TEXT DEFAULT 'link',
  clicks_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Post views log for 24-hour IP fraud protection on publications
CREATE TABLE IF NOT EXISTS public.post_views_log (
  id BIGSERIAL PRIMARY KEY,
  post_id TEXT NOT NULL,
  viewer_ip TEXT NOT NULL,
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indices for performance
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON public.posts(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_views_log ON public.profile_views_log(profile_id, viewer_ip, viewed_at);
CREATE INDEX IF NOT EXISTS idx_followers_following ON public.followers(following_id);
CREATE INDEX IF NOT EXISTS idx_links_user ON public.links(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_post_views_log ON public.post_views_log(post_id, viewer_ip, viewed_at);

-- Row Level Security (RLS) policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_views_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_views_log ENABLE ROW LEVEL SECURITY;

-- Allow public access policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert profiles" ON public.profiles;
CREATE POLICY "Users can insert profiles" ON public.profiles FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update profiles" ON public.profiles;
CREATE POLICY "Users can update profiles" ON public.profiles FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public posts are viewable by everyone" ON public.posts;
CREATE POLICY "Public posts are viewable by everyone" ON public.posts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can insert posts" ON public.posts;
CREATE POLICY "Anyone can insert posts" ON public.posts FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update posts" ON public.posts;
CREATE POLICY "Anyone can update posts" ON public.posts FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public views log is viewable" ON public.profile_views_log;
CREATE POLICY "Public views log is viewable" ON public.profile_views_log FOR ALL USING (true);

DROP POLICY IF EXISTS "Followers table access" ON public.followers;
CREATE POLICY "Followers table access" ON public.followers FOR ALL USING (true);

DROP POLICY IF EXISTS "Links table access" ON public.links;
CREATE POLICY "Links table access" ON public.links FOR ALL USING (true);

DROP POLICY IF EXISTS "Notifications table access" ON public.notifications;
CREATE POLICY "Notifications table access" ON public.notifications FOR ALL USING (true);

DROP POLICY IF EXISTS "Public post views log is viewable" ON public.post_views_log;
CREATE POLICY "Public post views log is viewable" ON public.post_views_log FOR ALL USING (true);

-- 8. Post Comments table
CREATE TABLE IF NOT EXISTS public.post_comments (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  post_id TEXT NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  user_avatar TEXT,
  content TEXT NOT NULL,
  parent_id TEXT REFERENCES public.post_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS and index
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON public.post_comments(post_id);

DROP POLICY IF EXISTS "Public post comments are viewable by everyone" ON public.post_comments;
CREATE POLICY "Public post comments are viewable by everyone" ON public.post_comments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can insert comments" ON public.post_comments;
CREATE POLICY "Anyone can insert comments" ON public.post_comments FOR INSERT WITH CHECK (true);


-- 9. Post Votes Table for live tracking
CREATE TABLE IF NOT EXISTS public.post_votes (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  post_id TEXT NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  vote_type TEXT NOT NULL, -- 'up' or 'down'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_post_user_vote UNIQUE (post_id, user_id)
);

-- Enable RLS for post_votes
ALTER TABLE public.post_votes ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_post_votes_post ON public.post_votes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_votes_user ON public.post_votes(user_id);

DROP POLICY IF EXISTS "Public post votes are viewable by everyone" ON public.post_votes;
CREATE POLICY "Public post votes are viewable by everyone" ON public.post_votes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can insert votes" ON public.post_votes;
CREATE POLICY "Anyone can insert votes" ON public.post_votes FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update votes" ON public.post_votes;
CREATE POLICY "Anyone can update votes" ON public.post_votes FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Anyone can delete votes" ON public.post_votes;
CREATE POLICY "Anyone can delete votes" ON public.post_votes FOR DELETE USING (true);

