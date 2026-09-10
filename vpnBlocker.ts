import { SupabaseClient } from '@supabase/supabase-js';

// Clean IP helper to handle IPv6-mapped IPv4 addresses (like ::ffff:192.168.1.1)
export function cleanIp(ip: string): string {
  let cleaned = ip.trim();
  if (cleaned.startsWith('::ffff:')) {
    cleaned = cleaned.substring(7);
  }
  return cleaned;
}

// In-Memory Stores
const blacklistedIpsMemory = new Set<string>();

// Behavioral Monitoring Cache Stores
export interface UserBehavior {
  lastIp: string;
  lastCountry: string;
  lastActiveTime: number;
}

export const profileBehaviorStore = new Map<string, UserBehavior>();
export const ipBehaviorStore = new Map<string, { requestTimestamps: number[] }>();

// Sync permanently blacklisted IPs from Supabase into memory for fast O(1) checks
export async function syncBlacklistedIps(supabase: SupabaseClient) {
  try {
    const { data, error } = await supabase.from('blacklisted_ips').select('ip');
    if (error) {
      console.error('[VPN Blocker] Error fetching blacklisted_ips from DB:', error);
      return;
    }
    if (data) {
      blacklistedIpsMemory.clear();
      for (const row of data) {
        if (row.ip) {
          blacklistedIpsMemory.add(cleanIp(row.ip));
        }
      }
      console.log(`[VPN Blocker] Synced ${blacklistedIpsMemory.size} blacklisted IPs from database.`);
    }
  } catch (err) {
    console.error('[VPN Blocker] Error syncing blacklisted IPs from DB:', err);
  }
}

// Main Init Function Called at Server Boot
export async function initializeVpnBlocker(supabase: SupabaseClient) {
  console.log('[VPN Blocker] Initializing IPinfo security engine...');
  await syncBlacklistedIps(supabase);
}

// Check if IP is blacklisted in local memory cache
export function isIpBlacklisted(ip: string): boolean {
  const cleaned = cleanIp(ip);
  return blacklistedIpsMemory.has(cleaned);
}

// IPinfo API Client Integration with Token: d5ebb545f92ee7
export async function checkIpInfo(ip: string): Promise<{ vpn: boolean; country: string; org: string }> {
  const cleaned = cleanIp(ip);

  // Skip local development or internal IPs
  if (cleaned === '127.0.0.1' || cleaned === 'localhost' || cleaned === '::1') {
    return { vpn: false, country: 'US', org: 'Local Loopback' };
  }

  try {
    const token = 'd5ebb545f92ee7';
    const url = `https://ipinfo.io/${cleaned}/json?token=${token}`;
    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });

    if (!res.ok) {
      console.error(`[IPinfo API] Failed to fetch IPinfo for ${cleaned}. Status: ${res.status}`);
      return { vpn: false, country: '', org: '' };
    }

    const data = await res.json();
    console.log(`[IPinfo API] Successfully verified IP ${cleaned}:`, JSON.stringify(data));

    let isVpn = false;

    // 1. Check direct IPinfo privacy endpoints block
    if (data.privacy) {
      isVpn = !!(data.privacy.vpn || data.privacy.proxy || data.privacy.tor || data.privacy.relay || data.privacy.hosting);
    } else {
      // Check for anonymous or hosting flags in standard metadata
      if (data.is_anonymous || data.is_hosting) {
        isVpn = true;
      }
    }

    // 2. Extra ASN & Organization validation (Fallback and hosting centers)
    const org = (data.org || '').toLowerCase();
    const datacenterKeywords = [
      'amazon', 'google', 'microsoft', 'digitalocean', 'hetzner', 'ovh', 'linode', 'contabo', 
      'leaseweb', 'datacenter', 'hosting', 'server', 'vultr', 'choopa', 'm27', 'selectel', 
      'fastly', 'cloudflare', 'akamai', 'scrypt', 'vpn', 'proxy', 'tor-exit', 'node', 'server'
    ];

    if (!isVpn && org) {
      for (const keyword of datacenterKeywords) {
        if (org.includes(keyword)) {
          isVpn = true;
          console.log(`[IPinfo API] Flagged ${cleaned} as VPN/Proxy because org name "${org}" matches datacenter keyword.`);
          break;
        }
      }
    }

    return {
      vpn: isVpn,
      country: data.country || '',
      org: data.org || ''
    };
  } catch (err) {
    console.error(`[IPinfo API] Error fetching IPinfo for ${cleaned}:`, err);
    return { vpn: false, country: '', org: '' };
  }
}

// Permanently blacklist IP address in memory and Supabase database
export async function blacklistIp(supabase: SupabaseClient, ip: string, reason: string = 'VPN/Proxy Detected') {
  const cleaned = cleanIp(ip);
  blacklistedIpsMemory.add(cleaned);
  try {
    await supabase.from('blacklisted_ips').upsert([{ ip: cleaned, reason }]);
    console.log(`[VPN Blocker] IP ${cleaned} added to Supabase blacklist. Reason: ${reason}`);
  } catch (err) {
    console.error(`[VPN Blocker] Failed to insert blacklisted IP ${cleaned} to Supabase:`, err);
  }
}

/**
 * localBehaviorMonitor
 * Fully local and free behavioral check that analyzes requests to detect anomaly triggers.
 * Returns true if the user must be banned / blocked.
 */
export async function handleBehavioralCheck(
  supabase: SupabaseClient, 
  ip: string, 
  profileId: string | null
): Promise<{ isBlocked: boolean; reason: string }> {
  const cleanedIp = cleanIp(ip);

  // 1. Rapid View/Refresh behavioral doubt check
  const now = Date.now();
  let ipInfo = ipBehaviorStore.get(cleanedIp);
  if (!ipInfo) {
    ipInfo = { requestTimestamps: [] };
    ipBehaviorStore.set(cleanedIp, ipInfo);
  }

  // Record timestamp and clean stamps older than 60 seconds
  ipInfo.requestTimestamps.push(now);
  ipInfo.requestTimestamps = ipInfo.requestTimestamps.filter(t => now - t < 60000);

  if (ipInfo.requestTimestamps.length > 10) {
    console.log(`[Local Monitor] Trigger doubt on IP ${cleanedIp}: Rapid requests (${ipInfo.requestTimestamps.length} views/min)`);
    // Rapid views suspected! Query IPinfo immediately to verify if VPN/Proxy
    const verification = await checkIpInfo(cleanedIp);
    if (verification.vpn) {
      await blacklistIp(supabase, cleanedIp, `Banned for rapid views on VPN: ${verification.org}`);
      return { isBlocked: true, reason: 'Rapid view traffic using VPN' };
    }
  }

  // 2. Sudden location / travel speed doubt check
  if (profileId) {
    const lastBehavior = profileBehaviorStore.get(profileId);
    if (lastBehavior) {
      // If IP has changed
      if (lastBehavior.lastIp !== cleanedIp) {
        const timeElapsed = now - lastBehavior.lastActiveTime; // in milliseconds
        
        // If IP changed in less than 30 minutes, it is highly suspicious (possible teleportation)
        if (timeElapsed < 1800000) {
          console.log(`[Local Monitor] Trigger doubt on User ${profileId}: Sudden IP changed from ${lastBehavior.lastIp} to ${cleanedIp} in ${Math.round(timeElapsed / 1000)}s`);
          
          // Verify the new IP location using IPinfo API
          const verification = await checkIpInfo(cleanedIp);
          
          if (verification.vpn) {
            await blacklistIp(supabase, cleanedIp, `Suspicious instant IP change on VPN/Proxy: ${verification.org}`);
            return { isBlocked: true, reason: 'Sudden location change on VPN/Proxy' };
          }

          // If different countries in less than 30 minutes (impossible travel)
          if (lastBehavior.lastCountry && verification.country && lastBehavior.lastCountry !== verification.country) {
            console.log(`[Local Monitor] Ban user ${profileId} for impossible travel: ${lastBehavior.lastCountry} to ${verification.country}`);
            await blacklistIp(supabase, cleanedIp, `Impossible travel detected from ${lastBehavior.lastCountry} to ${verification.country}`);
            return { isBlocked: true, reason: `Impossible travel from ${lastBehavior.lastCountry} to ${verification.country}` };
          }
        }
      }
    }

    // Update behavioral store for the user session
    // If we don't have country cached, we can fetch it once or preserve previous
    let currentCountry = lastBehavior?.lastCountry || '';
    if (!lastBehavior || lastBehavior.lastIp !== cleanedIp) {
      const info = await checkIpInfo(cleanedIp);
      currentCountry = info.country;
    }

    profileBehaviorStore.set(profileId, {
      lastIp: cleanedIp,
      lastCountry: currentCountry,
      lastActiveTime: now
    });
  }

  return { isBlocked: false, reason: '' };
}
