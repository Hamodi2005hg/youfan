import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Supabase client configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://xhgfzmsegirflfyumkdd.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhoZ2Z6bXNlZ2lyZmxmeXVta2RkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg4NzY3MDgsImV4cCI6MjEwNDQ1MjcwOH0.cw7X7D2JMV0EULCgfsH4plGpdt8E0nu66BqFnogPbiI';
const PLATFORM_ADSENSE_PUB_ID = process.env.PLATFORM_ADSENSE_PUB_ID || 'pub-1082649182374652';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Google Cloud Vision API Safety Check
async function checkImageSafety(imageBuffer: Buffer): Promise<void> {
  const apiKey = process.env.GOOGLE_VISION_API_KEY || 'AIzaSyB66Y-lnCNZYRLa_ZDd5twlEgAMT5wGFsk';
  if (!apiKey) return;

  const base64Image = imageBuffer.toString('base64');
  const url = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;

  const payload = {
    requests: [
      {
        image: {
          content: base64Image
        },
        features: [
          {
            type: 'SAFE_SEARCH_DETECTION'
          }
        ]
      }
    ]
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error('Google Vision API error:', errText);
    return;
  }

  const data = await response.json();
  const safeSearch = data.responses?.[0]?.safeSearchAnnotation;

  if (safeSearch) {
    const { adult, violence, racy } = safeSearch;
    const restricted = ['LIKELY', 'VERY_LIKELY'];
    if (
      restricted.includes(adult) ||
      restricted.includes(violence) ||
      restricted.includes(racy)
    ) {
      throw new Error('عذراً، المحتوى يخالف معايير المجتمع');
    }
  }
}

async function validateImageUrlSafety(imageUrl: string): Promise<void> {
  if (!imageUrl) return;
  let buffer: Buffer;
  if (imageUrl.startsWith('data:')) {
    const base64Part = imageUrl.split(',')[1];
    if (base64Part) {
      buffer = Buffer.from(base64Part, 'base64');
      await checkImageSafety(buffer);
    }
  } else if (imageUrl.startsWith('http') && !imageUrl.includes('unsplash.com') && !imageUrl.includes('dicebear.com')) {
    try {
      const imgRes = await fetch(imageUrl);
      const arrayBuf = await imgRes.arrayBuffer();
      buffer = Buffer.from(arrayBuf);
      await checkImageSafety(buffer);
    } catch (e) {
      // Ignore network errors on external URLs
    }
  }
}

async function validateLinkSafety(uri: string): Promise<void> {
  if (!uri) return;
  const apiKey = 'AIzaSyBjxOtFf780GJ2rFAgbkNezQjtgIO-sKrk';
  const url = `https://webrisk.googleapis.com/v1/uris:search?threatTypes=MALWARE&threatTypes=SOCIAL_ENGINEERING&threatTypes=UNWANTED_SOFTWARE&uri=${encodeURIComponent(uri)}&key=${apiKey}`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error('Web Risk API response status:', res.status);
      return; // Fail-safe
    }
    const data = await res.json();
    if (data && data.match) {
      throw new Error('عذراً، هذا الرابط غير آمن ويخالف شروط وأحكام Google AdSense لسلامة الروابط (Web Risk API).');
    }
  } catch (err: any) {
    if (err.message && err.message.includes('Web Risk API')) {
      throw err;
    }
    // Fail-safe for network/unexpected errors
  }
}

// Text Safety Check function (Checks against banned/inappropriate words in Arabic & English)
function checkTextSafety(text: string): void {
  if (!text || typeof text !== 'string') return;

  // Normalize text: lowercase, remove Arabic diacritics/tashkeel, unify alef, yee, teh marbuta
  const normalized = text
    .toLowerCase()
    .replace(/[\u064B-\u0652]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه');

  const bannedWords = [
    // English profanities & forbidden words
    'fuck', 'fucking', 'fucker', 'shit', 'bitch', 'asshole', 'bastard', 'cunt', 'dick', 'pussy',
    'cock', 'whore', 'slut', 'nigger', 'nigga', 'faggot', 'porn', 'porno', 'pornography', 'sex',
    'hentai', 'nude', 'naked', 'suicide', 'terrorist', 'terrorism',

    // Arabic profanities & forbidden words
    'كس', 'طيز', 'قحبة', 'قحبه', 'منيوك', 'شرموط', 'شرموطة', 'شرموطه', 'عرص', 'زق',
    'خنيث', 'ابن الكلب', 'ابن القحبة', 'ابن القحبه', 'زب', 'نيك', 'مناك', 'ديوث',
    'سكس', 'اباحي', 'اباحية', 'اباحيه', 'عاهر', 'عاهرة', 'عاهره', 'جنس', 'ممارسة الجنس',
    'ارهاب', 'ارهابي', 'انتحار', 'قتل نفسك', 'زبي', 'كسي'
  ];

  for (const word of bannedWords) {
    const normalizedWord = word
      .toLowerCase()
      .replace(/[\u064B-\u0652]/g, '')
      .replace(/[أإآ]/g, 'ا')
      .replace(/ى/g, 'ي')
      .replace(/ة/g, 'ه');

    const escaped = normalizedWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(?:^|\\s|\\b|\\W)${escaped}(?:$|\\s|\\b|\\W)`, 'i');

    if (regex.test(normalized) || normalized.includes(normalizedWord)) {
      throw new Error('عذراً، النص يحتوي على كلمات تخالف معايير المجتمع');
    }
  }
}

// Memory storage cache & fallback (used when Supabase schema is not yet applied, and for instant fast reads)
interface Profile {
  id: string;
  username: string;
  bio: string;
  avatar_url: string;
  adsense_pub_id: string;
  views_count: number;
  created_at: string;
  category?: string;
  social_links?: any;
}

interface Post {
  id: string;
  user_id: string;
  username?: string;
  user_avatar?: string;
  image_url: string;
  title: string;
  description: string;
  views_count: number;
  created_at: string;
  upvotes?: number;
  downvotes?: number;
  link_url?: string;
}

interface ViewLog {
  profile_id: string;
  viewer_ip: string;
  timestamp: number;
}

// Empty stores for real user-generated content and profiles
const memoryProfiles: Map<string, Profile> = new Map();
const memoryPosts: Post[] = [];

interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  username: string;
  user_avatar?: string;
  content: string;
  parent_id?: string | null;
  created_at: string;
}

const memoryComments: Comment[] = [];

// 24-hour IP view logs for anti-fraud
const viewLogs: ViewLog[] = [];

// Helper: check and record 24h IP view
function recordIpView(profileId: string, clientIp: string): boolean {
  const now = Date.now();
  const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000;

  // Clean old logs
  while (viewLogs.length > 0 && viewLogs[0].timestamp < twentyFourHoursAgo) {
    viewLogs.shift();
  }

  // Check if this IP viewed this profile in the last 24h
  const existing = viewLogs.find(
    (log) => log.profile_id === profileId && log.viewer_ip === clientIp && log.timestamp >= twentyFourHoursAgo
  );

  if (existing) {
    // Already viewed in the last 24h, do not count
    return false;
  }

  // Record new view
  viewLogs.push({
    profile_id: profileId,
    viewer_ip: clientIp,
    timestamp: now,
  });
  return true;
}

interface PostViewLog {
  post_id: string;
  viewer_ip: string;
  timestamp: number;
}

const postViewLogs: PostViewLog[] = [];

// Helper: check and record 24h IP post view
function recordPostIpView(postId: string, clientIp: string): boolean {
  const now = Date.now();
  const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000;

  // Clean old logs
  while (postViewLogs.length > 0 && postViewLogs[0].timestamp < twentyFourHoursAgo) {
    postViewLogs.shift();
  }

  // Check if this IP viewed this post in the last 24h
  const existing = postViewLogs.find(
    (log) => log.post_id === postId && log.viewer_ip === clientIp && log.timestamp >= twentyFourHoursAgo
  );

  if (existing) {
    // Already viewed in the last 24h, do not count
    return false;
  }

  // Record new view
  postViewLogs.push({
    post_id: postId,
    viewer_ip: clientIp,
    timestamp: now,
  });
  return true;
}

// Helper to get client IP
function getClientIp(req: express.Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.socket.remoteAddress || '127.0.0.1';
}

// =========================================================================
// 1. Dynamic /ads.txt Route (Required by Render & YoStar AdSense specifications)
// =========================================================================
app.get('/ads.txt', async (req, res) => {
  try {
    let qualifiedUsers: Array<{ adsense_pub_id: string; username: string }> = [];

    // Attempt to query Supabase first
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, username, adsense_pub_id');

      if (!error && profiles && profiles.length > 0) {
        for (const p of profiles) {
          if (!p.adsense_pub_id || !p.adsense_pub_id.startsWith('pub-')) continue;
          
          // Query posts and sum views_count
          const { data: userPosts } = await supabase
            .from('posts')
            .select('views_count')
            .eq('user_id', p.id);
          
          const totalPostViews = userPosts?.reduce((sum: number, post: any) => sum + (post.views_count || 0), 0) || 0;
          if (totalPostViews >= 5000) {
            qualifiedUsers.push({
              adsense_pub_id: p.adsense_pub_id,
              username: p.username,
            });
          }
        }
      }
    } catch {
      // Supabase table may not be ready yet, fall back to memory store
    }

    // Fall back to memory store if no Supabase data yet
    if (qualifiedUsers.length === 0) {
      for (const [, p] of memoryProfiles.entries()) {
        if (!p.adsense_pub_id) continue;
        const totalPostViews = memoryPosts
          .filter((post) => post.user_id === p.id)
          .reduce((sum, post) => sum + (post.views_count || 0), 0);
        if (totalPostViews >= 5000) {
          qualifiedUsers.push({
            adsense_pub_id: p.adsense_pub_id,
            username: p.username,
          });
        }
      }
    }

    // Generate ads.txt plain text
    let adsTxtContent = `# =====================================================================
# YoStar Creator Platform ads.txt
# Generated Dynamically for Render Hosting
# Direct Partnership with Google AdSense
# =====================================================================

# 1. Platform Master Account (YoStar Platform 30% Revenue Share)
google.com, ${PLATFORM_ADSENSE_PUB_ID}, DIRECT, f08c47fec0942fa0

# 2. Verified Monetized Creators (70% Creator Revenue Share)
# Criteria: >= 5,000 Verified Unique Publication Views
`;

    if (qualifiedUsers.length === 0) {
      adsTxtContent += `# No creators currently meet the milestone threshold.\n`;
    } else {
      for (const creator of qualifiedUsers) {
        adsTxtContent += `google.com, ${creator.adsense_pub_id}, DIRECT, f08c47fec0942fa0 # @${creator.username}\n`;
      }
    }

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=60'); // 1 minute cache
    return res.status(200).send(adsTxtContent);
  } catch (err: any) {
    console.error('Error generating ads.txt:', err);
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.status(200).send(`google.com, ${PLATFORM_ADSENSE_PUB_ID}, DIRECT, f08c47fec0942fa0\n`);
  }
});

// =========================================================================
// 2. API Routes
// =========================================================================

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Database & Supabase status
app.get('/api/status', async (req, res) => {
  let supabaseConnected = false;
  let tablesReady = false;
  let errorMessage: string | null = null;

  try {
    const { data, error } = await supabase.from('profiles').select('id').limit(1);
    if (!error) {
      supabaseConnected = true;
      tablesReady = true;
    } else {
      errorMessage = error.message;
      supabaseConnected = true; // URL/Key reached Supabase, table just needs creation
    }
  } catch (e: any) {
    errorMessage = e.message;
  }

  res.json({
    supabaseUrl: SUPABASE_URL,
    supabaseConnected,
    tablesReady,
    platformAdSenseId: PLATFORM_ADSENSE_PUB_ID,
    error: errorMessage,
  });
});

// Get all profiles for discovery/trending
app.get('/api/profiles', async (req, res) => {
  try {
    const { data: dbProfiles, error } = await supabase
      .from('profiles')
      .select('*')
      .order('views_count', { ascending: false });

    if (!error && dbProfiles && dbProfiles.length > 0) {
      return res.json(dbProfiles);
    }
  } catch {}

  // Fallback to memory
  const list = Array.from(memoryProfiles.values());
  res.json(list);
});

// Google Auth Endpoint
app.post('/api/auth/google', async (req, res) => {
  const { email, username, isSignup } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  const cleanEmail = email.toLowerCase().trim();

  if (isSignup) {
    if (!username) return res.status(400).json({ error: 'Username is required for signup' });
    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    const id = `prof_${cleanUsername}`;
    
    // Check if username already exists
    let exists = memoryProfiles.has(cleanUsername);
    if (!exists) {
      try {
        const { data } = await supabase.from('profiles').select('id').eq('username', cleanUsername).maybeSingle();
        if (data) exists = true;
      } catch {}
    }
    if (exists) return res.status(400).json({ error: 'الاسم المستعار مستخدم بالفعل. الرجاء اختيار اسم آخر.' });

    const newProfile = {
      id,
      username: cleanUsername,
      bio: 'Verified Creator authenticated via Google',
      avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanUsername}`,
      adsense_pub_id: '',
      views_count: 0,
      created_at: new Date().toISOString(),
      social_links: { email: cleanEmail }
    };

    memoryProfiles.set(cleanUsername, newProfile as any);
    try {
      await supabase.from('profiles').upsert([newProfile]);
    } catch {}

    return res.status(201).json(newProfile);
  } else {
    // Login flow
    let foundProfile: any = null;
    for (const [uname, p] of memoryProfiles.entries()) {
      if (p.social_links && p.social_links.email === cleanEmail) {
        foundProfile = p;
        break;
      }
    }

    if (!foundProfile) {
      try {
        const { data } = await supabase.from('profiles').select('*');
        if (data) {
          const match = data.find((p: any) => {
            let emailInSocial = false;
            if (p.social_links) {
              if (typeof p.social_links === 'string') {
                try {
                  const parsed = JSON.parse(p.social_links);
                  emailInSocial = parsed.email === cleanEmail;
                } catch {}
              } else {
                emailInSocial = p.social_links.email === cleanEmail;
              }
            }
            return emailInSocial;
          });
          if (match) {
            foundProfile = match;
            memoryProfiles.set(foundProfile.username, foundProfile);
          }
        }
      } catch {}
    }

    // Fallback: search by prefix
    if (!foundProfile) {
       const prefix = cleanEmail.split('@')[0].toLowerCase().replace(/[^a-z0-9_-]/g, '');
       let p = memoryProfiles.get(prefix);
       if (!p) {
         try {
           const { data } = await supabase.from('profiles').select('*').eq('username', prefix).maybeSingle();
           if (data) p = data;
         } catch {}
       }
       if (p) foundProfile = p;
    }

    if (foundProfile) {
      return res.status(200).json(foundProfile);
    } else {
      return res.status(404).json({ error: 'الحساب غير موجود. الرجاء تسجيل حساب جديد أولاً.' });
    }
  }
});

// Get profile by username + 24h Anti-Fraud View Tracker
app.get('/api/profile/:username', async (req, res) => {
  const { username } = req.params;
  const clientIp = getClientIp(req);

  let profile: Profile | null = null;

  // Check Supabase
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .ilike('username', username)
      .single();

    if (!error && data) {
      profile = data as Profile;
    }
  } catch {}

  // Fallback to memory if not found
  if (!profile) {
    profile = memoryProfiles.get(username.toLowerCase()) || null;
  }

  if (!profile) {
    return res.status(404).json({ error: 'Profile not found' });
  }

  // Anti-fraud 24-hour IP view check
  const isEligibleForNewView = recordIpView(profile.id, clientIp);
  if (isEligibleForNewView) {
    profile.views_count = (profile.views_count || 0) + 1;

    // Update in Supabase if possible
    try {
      await supabase
        .from('profiles')
        .update({ views_count: profile.views_count })
        .eq('id', profile.id);

      await supabase.from('profile_views_log').insert({
        profile_id: profile.id,
        viewer_ip: clientIp,
      });
    } catch {}

    // Update memory
    memoryProfiles.set(profile.username.toLowerCase(), profile);
  }

  // Get user's post count
  let postCount = 0;
  try {
    const { count } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', profile.id);
    if (typeof count === 'number') {
      postCount = count;
    } else {
      postCount = memoryPosts.filter((p) => p.user_id === profile!.id).length;
    }
  } catch {
    postCount = memoryPosts.filter((p) => p.user_id === profile.id).length;
  }

  // Calculate sum of views of all the user's publications/posts
  let totalPostViews = 0;
  try {
    const { data: userPostsViews } = await supabase
      .from('posts')
      .select('views_count')
      .eq('user_id', profile.id);
    if (userPostsViews) {
      totalPostViews = userPostsViews.reduce((sum: number, post: any) => sum + (post.views_count || 0), 0);
    }
  } catch {}

  const memPostViews = memoryPosts
    .filter((p) => p.user_id === profile!.id)
    .reduce((sum, post) => sum + (post.views_count || 0), 0);

  totalPostViews = Math.max(totalPostViews, memPostViews);

  // Milestones verification (New: Unlocked at 5,000 views on posts)
  const meetsPostRequirement = postCount >= 1;
  const meetsViewRequirement = totalPostViews >= 5000;
  const isMonetizationQualified = meetsViewRequirement;

  res.json({
    ...profile,
    posts_count: postCount,
    milestones: {
      requiredPosts: 1,
      currentPosts: postCount,
      meetsPostRequirement,
      requiredViews: 5000,
      currentViews: totalPostViews,
      meetsViewRequirement,
      isMonetizationQualified,
      newViewCounted: isEligibleForNewView,
    },
  });
});

// Create or update profile
app.post('/api/profiles', async (req, res) => {
  const { username, bio, avatar_url } = req.body;
  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }

  const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
  const id = `prof_${cleanUsername}`;

  const newProfile: Profile = {
    id,
    username: cleanUsername,
    bio: bio || 'Content creator on YoFan',
    avatar_url: avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanUsername}`,
    adsense_pub_id: '',
    views_count: 0,
    created_at: new Date().toISOString(),
  };

  // Insert to Supabase
  try {
    await supabase.from('profiles').upsert([newProfile]);
  } catch {}

  memoryProfiles.set(cleanUsername, newProfile);
  res.status(201).json(newProfile);
});

// Get posts for a user
app.get('/api/profile/:username/posts', async (req, res) => {
  const { username } = req.params;
  const cleanUsername = username.toLowerCase();

  // Find profile
  let profile = memoryProfiles.get(cleanUsername);
  let userId = profile ? profile.id : `prof_${cleanUsername}`;

  try {
    const { data: dbProfile } = await supabase
      .from('profiles')
      .select('id, username, avatar_url')
      .ilike('username', cleanUsername)
      .single();
    if (dbProfile) {
      userId = dbProfile.id;
      if (!profile) {
        profile = {
          id: dbProfile.id,
          username: dbProfile.username,
          bio: '',
          category: 'General',
          avatar_url: dbProfile.avatar_url || '',
          social_links: {},
          adsense_pub_id: '',
          views_count: 0,
          created_at: new Date().toISOString()
        };
        memoryProfiles.set(cleanUsername, profile);
      }
    }

    const { data: posts, error } = await supabase
      .from('posts')
      .select('*, profiles:user_id (username, avatar_url)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!error && posts && posts.length > 0) {
      const formatted = await Promise.all(posts.map(async (p: any) => {
        const profileData = Array.isArray(p.profiles) ? p.profiles[0] : p.profiles;
        const resolvedUsername = profileData?.username || dbProfile?.username || username;
        const resolvedAvatar = profileData?.avatar_url || dbProfile?.avatar_url || '';
        
        let upvotesCount = p.upvotes || 0;
        let downvotesCount = p.downvotes || 0;
        try {
          const { data: dbVotes } = await supabase
            .from('post_votes')
            .select('vote_type')
            .eq('post_id', p.id);
          if (dbVotes && dbVotes.length > 0) {
            upvotesCount = dbVotes.filter((v: any) => v.vote_type === 'up').length;
            downvotesCount = dbVotes.filter((v: any) => v.vote_type === 'down').length;
          }
        } catch {}

        return {
          ...p,
          username: resolvedUsername,
          user_avatar: resolvedAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${resolvedUsername}`,
          upvotes: upvotesCount,
          downvotes: downvotesCount,
        };
      }));
      return res.json(formatted);
    }
  } catch {}

  const userPosts = memoryPosts.filter(
    (p) => p.user_id === userId || p.username?.toLowerCase() === cleanUsername
  );
  const formattedUserPosts = userPosts.map(p => {
    const resolvedUsername = profile?.username || p.username || username;
    const resolvedAvatar = profile?.avatar_url || p.user_avatar || '';
    return {
      ...p,
      username: resolvedUsername,
      user_avatar: resolvedAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${resolvedUsername}`
    };
  });
  res.json(formattedUserPosts);
});

// Get trending / all posts
app.get('/api/posts', async (req, res) => {
  try {
    const { data: posts, error } = await supabase
      .from('posts')
      .select('*, profiles:user_id (username, avatar_url)')
      .order('created_at', { ascending: false })
      .limit(30);

    if (!error && posts && posts.length > 0) {
      const formatted = await Promise.all(posts.map(async (p: any) => {
        let username = 'creator';
        let user_avatar = '';

        const profileData = Array.isArray(p.profiles) ? p.profiles[0] : p.profiles;
        if (profileData?.username) {
          username = profileData.username;
          user_avatar = profileData.avatar_url || '';
        } else {
          const cached = Array.from(memoryProfiles.values()).find(x => x.id === p.user_id);
          if (cached) {
            username = cached.username;
            user_avatar = cached.avatar_url || '';
          } else {
            const { data: dbProf } = await supabase
              .from('profiles')
              .select('username, avatar_url')
              .eq('id', p.user_id)
              .maybeSingle();
            if (dbProf) {
              username = dbProf.username;
              user_avatar = dbProf.avatar_url || '';
            }
          }
        }

        let upvotesCount = p.upvotes || 0;
        let downvotesCount = p.downvotes || 0;
        try {
          const { data: dbVotes } = await supabase
            .from('post_votes')
            .select('vote_type')
            .eq('post_id', p.id);
          if (dbVotes && dbVotes.length > 0) {
            upvotesCount = dbVotes.filter((v: any) => v.vote_type === 'up').length;
            downvotesCount = dbVotes.filter((v: any) => v.vote_type === 'down').length;
          }
        } catch {}

        return {
          ...p,
          username,
          user_avatar: user_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
          upvotes: upvotesCount,
          downvotes: downvotesCount,
        };
      }));

      // Sort algorithm: Posts with net positive interaction (upvotes - downvotes) first
      formatted.sort((a: any, b: any) => {
        const scoreA = (a.upvotes || 0) - (a.downvotes || 0);
        const scoreB = (b.upvotes || 0) - (b.downvotes || 0);
        if (scoreB !== scoreA) {
          return scoreB - scoreA;
        }
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      return res.json(formatted);
    }
  } catch {}

  const sortedMemory = [...memoryPosts].sort((a, b) => {
    const scoreA = (a.upvotes || 0) - (a.downvotes || 0);
    const scoreB = (b.upvotes || 0) - (b.downvotes || 0);
    if (scoreB !== scoreA) {
      return scoreB - scoreA;
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
  const formattedMemory = sortedMemory.map(p => {
    const prof = Array.from(memoryProfiles.values()).find(x => x.id === p.user_id) || memoryProfiles.get(p.username?.toLowerCase() || '');
    return {
      ...p,
      username: prof?.username || p.username || 'creator',
      user_avatar: prof?.avatar_url || p.user_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.username || 'creator'}`
    };
  });
  res.json(formattedMemory);
});

// Create post
app.post('/api/posts', async (req, res) => {
  const { user_id, username, image_url, title, description, link_url } = req.body;
  if (!user_id || !title || (!image_url && !link_url)) {
    return res.status(400).json({ error: 'user_id, title, and either image_url or link_url are required' });
  }

  try {
    checkTextSafety(title);
    if (description) checkTextSafety(description);
    if (image_url) {
      await validateImageUrlSafety(image_url);
    }
    if (link_url) {
      await validateLinkSafety(link_url);
    }
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'عذراً، المحتوى يخالف معايير المجتمع' });
  }

  const profile = memoryProfiles.get(username?.toLowerCase()) || Array.from(memoryProfiles.values()).find(p => p.id === user_id);

  const finalImageUrl = image_url || 'https://images.unsplash.com/photo-1546074177-ffedd1d85d4b?w=800&auto=format&fit=crop&q=80';

  const newPost: Post = {
    id: `post-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    user_id,
    username: username || profile?.username || 'creator',
    user_avatar: profile?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    image_url: finalImageUrl,
    title,
    description: description || '',
    views_count: 0,
    created_at: new Date().toISOString(),
    link_url: link_url || undefined,
  };

  try {
    await supabase.from('posts').insert([
      {
        id: newPost.id,
        user_id: newPost.user_id,
        image_url: newPost.image_url,
        title: newPost.title,
        description: newPost.description,
        views_count: 0,
        // Since link_url may not be in the database columns, try-catch handles it cleanly
        link_url: newPost.link_url || null,
      },
    ]);
  } catch {}

  memoryPosts.unshift(newPost);
  res.status(201).json(newPost);
});

// Increment post view (with 24-hour IP view anti-fraud protection)
app.post('/api/posts/:id/view', async (req, res) => {
  const { id } = req.params;
  const clientIp = getClientIp(req);

  const isEligibleForNewView = recordPostIpView(id, clientIp);
  let finalViewsCount = 1;

  const post = memoryPosts.find((p) => p.id === id);

  if (isEligibleForNewView) {
    if (post) {
      post.views_count = (post.views_count || 0) + 1;
      finalViewsCount = post.views_count;
    }

    try {
      // Fetch current post views count
      const { data: dbPost } = await supabase
        .from('posts')
        .select('views_count')
        .eq('id', id)
        .single();
      
      const currentViews = dbPost?.views_count || 0;
      const newViews = currentViews + 1;
      finalViewsCount = Math.max(finalViewsCount, newViews);

      // Update in Supabase
      await supabase
        .from('posts')
        .update({ views_count: newViews })
        .eq('id', id);

      // Log the post view with client IP
      try {
        await supabase.from('post_views_log').insert({
          post_id: id,
          viewer_ip: clientIp,
        });
      } catch {
        // Table post_views_log might not exist yet, fallback gracefully
      }
    } catch {}
  } else {
    // If not eligible (already viewed from this IP in last 24h), just get current count
    if (post) {
      finalViewsCount = post.views_count;
    }
    try {
      const { data: dbPost } = await supabase
        .from('posts')
        .select('views_count')
        .eq('id', id)
        .single();
      if (dbPost) {
        finalViewsCount = Math.max(finalViewsCount, dbPost.views_count);
      }
    } catch {}
  }

  res.json({ success: true, views_count: finalViewsCount, newViewCounted: isEligibleForNewView });
});

// Vote on a post
app.post('/api/posts/:id/vote', async (req, res) => {
  const { id } = req.params;
  const { type, user_id } = req.body; // 'up' or 'down', and optional user_id for tracking

  if (type !== 'up' && type !== 'down') {
    return res.status(400).json({ error: 'Invalid vote type' });
  }

  const post = memoryPosts.find((p) => p.id === id);
  let up = post?.upvotes || 0;
  let down = post?.downvotes || 0;

  // If a authenticated user_id is provided, use the post_votes database table
  if (user_id) {
    try {
      // 1. Check if the user has already voted on this post
      const { data: existingVote, error: checkError } = await supabase
        .from('post_votes')
        .select('*')
        .eq('post_id', id)
        .eq('user_id', user_id)
        .maybeSingle();

      if (existingVote) {
        if (existingVote.vote_type === type) {
          // If user clicked the same vote, delete it (toggle off)
          await supabase
            .from('post_votes')
            .delete()
            .eq('id', existingVote.id);
        } else {
          // If user clicked the opposite vote, update it
          await supabase
            .from('post_votes')
            .update({ vote_type: type })
            .eq('id', existingVote.id);
        }
      } else {
        // Create new vote record
        await supabase
          .from('post_votes')
          .insert({
            post_id: id,
            user_id: user_id,
            vote_type: type
          });
      }

      // 2. Query all votes to calculate totals
      const { data: allVotes } = await supabase
        .from('post_votes')
        .select('vote_type')
        .eq('post_id', id);

      if (allVotes) {
        up = allVotes.filter(v => v.vote_type === 'up').length;
        down = allVotes.filter(v => v.vote_type === 'down').length;
      } else {
        // Fallback aggregate increments
        const { data: dbPost } = await supabase
          .from('posts')
          .select('upvotes, downvotes')
          .eq('id', id)
          .single();
        if (dbPost) {
          up = (dbPost.upvotes || 0) + (type === 'up' ? 1 : 0);
          down = (dbPost.downvotes || 0) + (type === 'down' ? 1 : 0);
        }
      }

      // 3. Update aggregate counters on posts table
      await supabase
        .from('posts')
        .update({ upvotes: up, downvotes: down })
        .eq('id', id);

    } catch (e) {
      console.error("Voting DB error:", e);
      // Fallback update memory state only if DB errors out
      if (post) {
        if (type === 'up') {
          post.upvotes = (post.upvotes || 0) + 1;
        } else {
          post.downvotes = (post.downvotes || 0) + 1;
        }
        up = post.upvotes;
        down = post.downvotes;
      }
    }
  } else {
    // Legacy fallback without user_id tracking
    if (post) {
      if (type === 'up') {
        post.upvotes = (post.upvotes || 0) + 1;
      } else {
        post.downvotes = (post.downvotes || 0) + 1;
      }
      up = post.upvotes;
      down = post.downvotes;
    }
    try {
      const { data: dbPost } = await supabase
        .from('posts')
        .select('upvotes, downvotes')
        .eq('id', id)
        .single();

      if (dbPost) {
        up = (dbPost.upvotes || 0) + (type === 'up' ? 1 : 0);
        down = (dbPost.downvotes || 0) + (type === 'down' ? 1 : 0);
        
        await supabase
          .from('posts')
          .update({ upvotes: up, downvotes: down })
          .eq('id', id);
      }
    } catch {}
  }

  // Update memory state to match DB state
  if (post) {
    post.upvotes = up;
    post.downvotes = down;
  }

  // Send notification for upvote
  if (post && user_id && user_id !== post.user_id && type === 'up') {
    let voterName = 'Someone';
    try {
      const { data: vProfile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user_id)
        .maybeSingle();
      if (vProfile?.username) {
        voterName = vProfile.username;
      }
    } catch {}
    
    await createNotification(
      post.user_id,
      'New Upvote! 👍',
      `@${voterName} upvoted your post: "${post.title}"`,
      'success'
    );
  }

  res.json({ success: true, upvotes: up, downvotes: down });
});

// Get comments for a post
app.get('/api/posts/:id/comments', async (req, res) => {
  const { id } = req.params;
  try {
    const { data: comments, error } = await supabase
      .from('post_comments')
      .select('*')
      .eq('post_id', id)
      .order('created_at', { ascending: true });

    if (!error && comments) {
      return res.json(comments);
    }
  } catch {}

  const filtered = memoryComments.filter((c) => c.post_id === id);
  res.json(filtered);
});

// Create a comment
app.post('/api/posts/:id/comments', async (req, res) => {
  const { id } = req.params;
  const { user_id, username, user_avatar, content, parent_id } = req.body;
  if (!user_id || !username || !content) {
    return res.status(400).json({ error: 'user_id, username and content are required' });
  }

  try {
    checkTextSafety(content);
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'عذراً، النص يحتوي على كلمات تخالف معايير المجتمع' });
  }

  const newComment = {
    id: `comment-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    post_id: id,
    user_id,
    username,
    user_avatar: user_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
    content,
    parent_id: parent_id || null,
    created_at: new Date().toISOString(),
  };

  try {
    await supabase.from('post_comments').insert([
      {
        id: newComment.id,
        post_id: newComment.post_id,
        user_id: newComment.user_id,
        username: newComment.username,
        user_avatar: newComment.user_avatar,
        content: newComment.content,
        parent_id: newComment.parent_id,
      },
    ]);
  } catch {}

  memoryComments.push(newComment);

  // Send notifications for comments or replies
  try {
    const post = memoryPosts.find(p => p.id === id) || (await supabase.from('posts').select('*').eq('id', id).maybeSingle()).data;
    if (post) {
      if (newComment.parent_id) {
        const parentComment = memoryComments.find(c => c.id === newComment.parent_id) || (await supabase.from('post_comments').select('*').eq('id', newComment.parent_id).maybeSingle()).data;
        if (parentComment && parentComment.user_id !== user_id) {
          await createNotification(
            parentComment.user_id,
            'New Reply! 💬',
            `@${username} replied to your comment on: "${post.title}"`,
            'info'
          );
        }
      } else {
        if (post.user_id !== user_id) {
          await createNotification(
            post.user_id,
            'New Comment! 💬',
            `@${username} commented on your post: "${post.title}"`,
            'info'
          );
        }
      }
    }
  } catch (err) {
    console.error("Error generating comment notification:", err);
  }

  res.status(201).json(newComment);
});

// =========================================================================
// 3. AdSense Revenue Sharing Logic (70% Creator / 30% Platform)
// =========================================================================
app.get('/api/ads-config/:username', async (req, res) => {
  const { username } = req.params;
  const cleanUsername = username.toLowerCase();

  let profile = memoryProfiles.get(cleanUsername);
  if (!profile) {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .ilike('username', cleanUsername)
        .single();
      if (data) profile = data as Profile;
    } catch {}
  }

  // Count user posts to verify milestone
  let postCount = 0;
  if (profile) {
    postCount = memoryPosts.filter((p) => p.user_id === profile!.id).length;
    try {
      const { count } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profile.id);
      if (typeof count === 'number') postCount = count;
    } catch {}
  }

  // Sum views of all publications of the user
  let totalPostViews = 0;
  if (profile) {
    try {
      const { data: userPostsViews } = await supabase
        .from('posts')
        .select('views_count')
        .eq('user_id', profile.id);
      if (userPostsViews) {
        totalPostViews = userPostsViews.reduce((sum: number, post: any) => sum + (post.views_count || 0), 0);
      }
    } catch {}

    const memPostViews = memoryPosts
      .filter((p) => p.user_id === profile!.id)
      .reduce((sum, post) => sum + (post.views_count || 0), 0);

    totalPostViews = Math.max(totalPostViews, memPostViews);
  }

  const isMonetized = Boolean(
    profile &&
    profile.adsense_pub_id &&
    profile.adsense_pub_id.startsWith('pub-') &&
    totalPostViews >= 5000
  );

  // Exact math.random implementation as requested:
  // Random number between 0 and 1
  const rand = Math.random();
  // If random < 0.7 (70% chance), display the user's AdSense ID (if qualified)
  // If random >= 0.7 (30% chance), or if user not qualified, display the platform AdSense ID
  let activePublisherId = PLATFORM_ADSENSE_PUB_ID;
  let revenueShareSource: 'creator' | 'platform' = 'platform';

  if (isMonetized && profile && rand < 0.7) {
    activePublisherId = profile.adsense_pub_id;
    revenueShareSource = 'creator';
  } else {
    activePublisherId = PLATFORM_ADSENSE_PUB_ID;
    revenueShareSource = 'platform';
  }

  res.json({
    username: cleanUsername,
    randomNumber: rand,
    threshold: 0.7,
    activePublisherId,
    revenueShareSource, // 'creator' (70%) or 'platform' (30%)
    creatorPubId: profile?.adsense_pub_id || null,
    platformPubId: PLATFORM_ADSENSE_PUB_ID,
    isMonetized,
    milestones: {
      currentPosts: postCount,
      requiredPosts: 1,
      currentViews: totalPostViews,
      requiredViews: 5000,
    },
  });
});

// Update user AdSense Publisher ID (Enforces Milestones)
app.post('/api/profile/update-adsense', async (req, res) => {
  const { username, adsense_pub_id } = req.body;
  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }

  const cleanUsername = username.toLowerCase();
  let profile = memoryProfiles.get(cleanUsername);

  try {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .ilike('username', cleanUsername)
      .single();
    if (data) profile = data as Profile;
  } catch {}

  if (!profile) {
    return res.status(404).json({ error: 'Profile not found' });
  }

  // Count user posts
  let postCount = memoryPosts.filter((p) => p.user_id === profile.id).length;
  try {
    const { count } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', profile.id);
    if (typeof count === 'number') postCount = count;
  } catch {}

  // Calculate sum of views of all the user's publications/posts
  let totalPostViews = 0;
  try {
    const { data: userPostsViews } = await supabase
      .from('posts')
      .select('views_count')
      .eq('user_id', profile.id);
    if (userPostsViews) {
      totalPostViews = userPostsViews.reduce((sum: number, post: any) => sum + (post.views_count || 0), 0);
    }
  } catch {}

  const memPostViews = memoryPosts
    .filter((p) => p.user_id === profile!.id)
    .reduce((sum, post) => sum + (post.views_count || 0), 0);

  totalPostViews = Math.max(totalPostViews, memPostViews);

  // Check Milestone Requirements: at least 5,000 verified unique views on publications
  if (totalPostViews < 5000) {
    return res.status(403).json({
      error: `Monetization Milestone Not Met! Required: 5,000 verified views on your publications. Current: ${totalPostViews}/5,000 views.`,
      currentPosts: postCount,
      requiredPosts: 1,
      currentViews: totalPostViews,
      requiredViews: 5000,
    });
  }

  // Format validation
  const cleanPubId = adsense_pub_id.trim();
  if (!cleanPubId.startsWith('pub-') || cleanPubId.length < 8) {
    return res.status(400).json({
      error: 'Invalid AdSense Publisher ID format. Must begin with "pub-" (e.g. pub-1234567890123456)',
    });
  }

  profile.adsense_pub_id = cleanPubId;
  memoryProfiles.set(cleanUsername, profile);

  try {
    await supabase
      .from('profiles')
      .update({ adsense_pub_id: cleanPubId })
      .eq('id', profile.id);
  } catch {}

  res.json({
    success: true,
    message: 'AdSense Publisher ID updated successfully! It will now be included in dynamic /ads.txt and 70% revenue sharing.',
    profile,
  });
});

// Milestone Simulator Helper for quick testing
app.post('/api/simulate-milestone', async (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: 'Username required' });

  const cleanUsername = username.toLowerCase();
  let profile = memoryProfiles.get(cleanUsername);

  if (!profile) {
    profile = {
      id: `prof_${cleanUsername}`,
      username: cleanUsername,
      bio: 'YoStar verified creator',
      avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanUsername}`,
      adsense_pub_id: 'pub-7778889991112223',
      views_count: 1050,
      created_at: new Date().toISOString(),
    };
    memoryProfiles.set(cleanUsername, profile);
  } else {
    profile.views_count = Math.max(profile.views_count, 1050);
  }

  // Ensure 10 posts exist with high view counts
  const existingCount = memoryPosts.filter((p) => p.user_id === profile!.id).length;
  for (let i = existingCount + 1; i <= 10; i++) {
    memoryPosts.push({
      id: `post-sim-${cleanUsername}-${i}`,
      user_id: profile.id,
      username: profile.username,
      user_avatar: profile.avatar_url,
      title: `Story Post #${i}`,
      description: 'Exclusive creator content shared on YoStar platform.',
      image_url: `https://images.unsplash.com/photo-${1510000000000 + i * 54321}?w=800&auto=format&fit=crop&q=80`,
      views_count: 650,
      created_at: new Date().toISOString(),
    });
  }

  try {
    await supabase.from('profiles').upsert([
      {
        id: profile.id,
        username: profile.username,
        bio: profile.bio,
        avatar_url: profile.avatar_url,
        adsense_pub_id: profile.adsense_pub_id,
        views_count: profile.views_count,
      },
    ]);

    // Insert simulated posts to Supabase if possible
    const simPosts = [];
    for (let i = 1; i <= 10; i++) {
      simPosts.push({
        id: `post-sim-${cleanUsername}-${i}`,
        user_id: profile.id,
        image_url: `https://images.unsplash.com/photo-${1510000000000 + i * 54321}?w=800&auto=format&fit=crop&q=80`,
        title: `Story Post #${i}`,
        description: 'Exclusive creator content shared on YoStar platform.',
        views_count: 650,
      });
    }
    await supabase.from('posts').upsert(simPosts);
  } catch {}

  res.json({
    success: true,
    message: `Milestones reached for @${cleanUsername}! (10 posts and 6,500 views simulated on publications). AdSense unlocked.`,
    profile,
  });
});

// Additional memory stores for real interactivity
interface Follower {
  follower_id: string;
  following_id: string;
}
interface LinkItem {
  id: string;
  user_id: string;
  title: string;
  url: string;
  icon: string;
  clicks_count: number;
}
interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

const memoryFollowers: Follower[] = [];
const memoryLinks: LinkItem[] = [
  { id: 'link-1', user_id: 'prof_yahyaabdo', title: 'My YouTube Vlog Channel', url: 'https://youtube.com', icon: 'youtube', clicks_count: 142 },
  { id: 'link-2', user_id: 'prof_yahyaabdo', title: 'Instagram Daily Travel Stories', url: 'https://instagram.com', icon: 'instagram', clicks_count: 350 },
];
const memoryNotifications: NotificationItem[] = [
  { id: 'notif-1', user_id: 'prof_yahyaabdo', title: 'Welcome to YoFan!', message: 'Your creator account is successfully verified and ready.', type: 'welcome', is_read: false, created_at: new Date().toISOString() }
];

async function createNotification(userId: string, title: string, message: string, type: string = 'info') {
  const notif: NotificationItem = {
    id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    user_id: userId,
    title,
    message,
    type,
    is_read: false,
    created_at: new Date().toISOString()
  };

  memoryNotifications.unshift(notif);

  try {
    await supabase.from('notifications').insert([
      {
        id: notif.id,
        user_id: notif.user_id,
        title: notif.title,
        message: notif.message,
        type: notif.type,
        is_read: false
      }
    ]);
  } catch (err) {
    console.error("Error creating notification in DB:", err);
  }
}

// Profile Update API
app.post('/api/profile/update', async (req, res) => {
  const { username, bio, category, avatar_url, social_links } = req.body;
  if (!username) return res.status(400).json({ error: 'Username required' });
  const cleanUsername = username.toLowerCase();
  let profile = memoryProfiles.get(cleanUsername);
  if (!profile) return res.status(404).json({ error: 'Profile not found' });

  if (avatar_url !== undefined && avatar_url) {
    try {
      await validateImageUrlSafety(avatar_url);
    } catch (err: any) {
      return res.status(400).json({ error: err.message || 'عذراً، المحتوى يخالف معايير المجتمع' });
    }
  }

  if (bio !== undefined && bio) {
    try {
      checkTextSafety(bio);
    } catch (err: any) {
      return res.status(400).json({ error: err.message || 'عذراً، النص يحتوي على كلمات تخالف معايير المجتمع' });
    }
  }

  if (bio !== undefined) profile.bio = bio;
  if (category !== undefined) (profile as any).category = category;
  if (avatar_url !== undefined) profile.avatar_url = avatar_url;
  if (social_links !== undefined) (profile as any).social_links = social_links;
  
  memoryProfiles.set(cleanUsername, profile);

  try {
    await supabase.from('profiles').update({
      bio: profile.bio,
      category: (profile as any).category,
      avatar_url: profile.avatar_url,
      social_links: (profile as any).social_links,
      updated_at: new Date().toISOString()
    }).eq('id', profile.id);
  } catch {}

  res.json({ success: true, profile });
});

// Follower / Subscriber API
app.post('/api/follow', async (req, res) => {
  const { follower_id, following_id } = req.body;
  if (!follower_id || !following_id) return res.status(400).json({ error: 'IDs required' });

  const existingIdx = memoryFollowers.findIndex(f => f.follower_id === follower_id && f.following_id === following_id);
  let isFollowing = false;
  if (existingIdx >= 0) {
    memoryFollowers.splice(existingIdx, 1);
    isFollowing = false;
  } else {
    memoryFollowers.push({ follower_id, following_id });
    isFollowing = true;
    // Add notification
    memoryNotifications.push({
      id: `notif-${Date.now()}`,
      user_id: following_id,
      title: 'New Follower',
      message: 'Someone started following your profile!',
      type: 'follow',
      is_read: false,
      created_at: new Date().toISOString()
    });
  }

  res.json({ success: true, isFollowing });
});

app.get('/api/followers/:userId', async (req, res) => {
  const { userId } = req.params;
  let followerList: any[] = [];

  try {
    const { data: dbFollowers, error } = await supabase
      .from('followers')
      .select('*, profiles:follower_id (id, username, avatar_url)')
      .eq('following_id', userId);

    if (!error && dbFollowers && dbFollowers.length > 0) {
      followerList = dbFollowers.map((f: any) => {
        const prof = Array.isArray(f.profiles) ? f.profiles[0] : f.profiles;
        let username = prof?.username;
        let avatar_url = prof?.avatar_url;

        if (!username) {
          const mem = Array.from(memoryProfiles.values()).find(p => p.id === f.follower_id);
          username = mem?.username || f.follower_id.replace('prof_', '');
          avatar_url = mem?.avatar_url || '';
        }

        return {
          ...f,
          username: username || f.follower_id.replace('prof_', ''),
          avatar_url: avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username || f.follower_id}`
        };
      });
      return res.json(followerList);
    }
  } catch {}

  const memFollowers = memoryFollowers.filter(f => f.following_id === userId);
  followerList = memFollowers.map(f => {
    const prof = Array.from(memoryProfiles.values()).find(p => p.id === f.follower_id);
    const username = prof?.username || f.follower_id.replace('prof_', '');
    const avatar_url = prof?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;
    return {
      ...f,
      username,
      avatar_url
    };
  });

  res.json(followerList);
});

// Custom Links API
app.get('/api/links/:userId', async (req, res) => {
  const { userId } = req.params;
  const userLinks = memoryLinks.filter(l => l.user_id === userId);
  res.json(userLinks);
});

app.post('/api/links', async (req, res) => {
  const { user_id, title, url, icon } = req.body;
  if (!user_id || !title || !url) return res.status(400).json({ error: 'Missing fields' });

  const newLink: LinkItem = {
    id: `link-${Date.now()}`,
    user_id,
    title,
    url,
    icon: icon || 'link',
    clicks_count: 0
  };
  memoryLinks.push(newLink);

  try {
    await supabase.from('links').insert([newLink]);
  } catch {}

  res.json({ success: true, link: newLink });
});

app.delete('/api/links/:id', async (req, res) => {
  const { id } = req.params;
  const idx = memoryLinks.findIndex(l => l.id === id);
  if (idx >= 0) memoryLinks.splice(idx, 1);

  try {
    await supabase.from('links').delete().eq('id', id);
  } catch {}

  res.json({ success: true });
});

// Notifications API
app.get('/api/notifications/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (!error && data && data.length > 0) {
      return res.json(data);
    }
  } catch (err) {
    console.error("Error fetching notifications from DB:", err);
  }

  const notifs = memoryNotifications.filter(n => n.user_id === userId);
  res.json(notifs);
});

// Platform summary statistics
app.get('/api/stats', (req, res) => {
  res.json({
    totalUsers: '2,907,974',
    totalPublications: '5,373,647',
    partnersEarnings: '$5,000,000+',
    platformName: 'YoFan',
    revenueShare: {
      creator: 70,
      platform: 30,
    },
  });
});

// =========================================================================
// 4. Start Server with Vite Middleware
// =========================================================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`YoFan Server running on http://0.0.0.0:${PORT}`);
    console.log(`Dynamic ads.txt live at http://0.0.0.0:${PORT}/ads.txt`);
  });
}

startServer();
