const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const authEndpoint = `
// Google Auth Endpoint
app.post('/api/auth/google', async (req, res) => {
  const { email, username, isSignup } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  const cleanEmail = email.toLowerCase().trim();

  if (isSignup) {
    if (!username) return res.status(400).json({ error: 'Username is required for signup' });
    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    const id = \`prof_\${cleanUsername}\`;
    
    // Check if username already exists
    let exists = memoryProfiles.has(cleanUsername);
    if (!exists) {
      try {
        const { data } = await supabase.from('profiles').select('id').eq('username', cleanUsername).single();
        if (data) exists = true;
      } catch {}
    }
    if (exists) return res.status(400).json({ error: 'Username already taken' });

    const newProfile = {
      id,
      username: cleanUsername,
      bio: 'Verified Creator authenticated via Google',
      avatar_url: \`https://api.dicebear.com/7.x/avataaars/svg?seed=\${cleanUsername}\`,
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
    let foundProfile = null;
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
          const match = data.find((p: any) => p.social_links && p.social_links.email === cleanEmail);
          if (match) {
            foundProfile = match;
            memoryProfiles.set(foundProfile.username, foundProfile);
          }
        }
      } catch {}
    }

    if (!foundProfile) {
       const prefix = cleanEmail.split('@')[0].toLowerCase().replace(/[^a-z0-9_-]/g, '');
       let p = memoryProfiles.get(prefix);
       if (!p) {
         try {
           const { data } = await supabase.from('profiles').select('*').eq('username', prefix).single();
           if (data) p = data;
         } catch {}
       }
       if (p) foundProfile = p;
    }

    if (foundProfile) {
      return res.status(200).json(foundProfile);
    } else {
      return res.status(404).json({ error: 'Account not found. Please sign up first.' });
    }
  }
});
`;

code = code.replace("// Get single profile", authEndpoint + "\n// Get single profile");
fs.writeFileSync('server.ts', code);
