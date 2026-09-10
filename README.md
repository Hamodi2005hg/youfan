# YoFan Alternative Platform

A web platform alternative to **YoFan** for sharing visual content and stories, with integrated **Google AdSense 70/30 revenue sharing**, dynamic **`/ads.txt`** for Render hosting, and **Supabase PostgreSQL** backend storage with 24-hour IP anti-fraud view tracking.

---

## 🌟 Key Features

1. **YoFan Design & Aesthetics:**
   - Exact YoFan layout with trending posts marquee carousel, verified creators counter, earnings calculator, and basic vs. verified tiers.
   - Creator profiles with custom avatars, publications grid, bio, and engagement statistics.

2. **Google AdSense Revenue Sharing (70% Creator / 30% Platform):**
   - Implemented via a random weighted distribution function (`Math.random() < 0.7`):
     - **70% of impressions** serve the creator's `adsense_pub_id`.
     - **30% of impressions** serve the platform owner's `PLATFORM_ADSENSE_PUB_ID`.
   - Real-time tester in the UI allowing instant reroll verification.

3. **Dynamic `/ads.txt` for Render Hosting:**
   - Dedicated backend Express route at `/ads.txt`.
   - Generates plain text dynamically by querying Supabase for all verified creators who met monetization criteria:
     ```
     google.com, pub-xxxxxxxxxxxxxxxx, DIRECT, f08c47fec0942fa0
     ```
   - Platform master AdSense ID is always listed at the top.

4. **Account Protection & Monetization Milestones:**
   - Creators can only unlock and configure their `adsense_pub_id` after reaching:
     - **At least 10 publications**.
     - **At least 1,000 verified profile views**.
   - **Anti-Fraud 24-Hour IP Protection:** Repeated visits from the same IP address within 24 hours are discarded to protect advertiser traffic quality and prevent artificial view inflation.

5. **Supabase PostgreSQL Integration:**
   - Tables: `profiles`, `posts`, and `profile_views_log`.
   - SQL schema provided in `supabase_schema.sql` for 1-click execution in Supabase SQL Editor.
   - Resilient dual-cache architecture ensuring zero downtime.

---

## 🚀 Deployment on Render

### Step 1: Environment Variables on Render
Configure the following environment variables in your Render Web Service dashboard:
```env
PORT=3000
NODE_ENV=production
SUPABASE_URL=https://xhgfzmsegirflfyumkdd.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
PLATFORM_ADSENSE_PUB_ID=pub-1082649182374652
```

### Step 2: Build & Start Commands
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start` (runs `node dist/server.cjs` on port 3000)

---

## 🗄️ Database Setup (Supabase)

Run the SQL script found in `supabase_schema.sql` inside your **Supabase Dashboard -> SQL Editor**:

```sql
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  bio TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  adsense_pub_id TEXT DEFAULT '',
  views_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.posts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  views_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.profile_views_log (
  id BIGSERIAL PRIMARY KEY,
  profile_id TEXT NOT NULL,
  viewer_ip TEXT NOT NULL,
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 💻 Local Development

```bash
# Install dependencies
npm install

# Run full-stack dev server (Express + Vite)
npm run dev

# Open http://localhost:3000 in your browser
```
