import { SupabaseClient } from '@supabase/supabase-js';

// Clean IP helper to handle IPv6-mapped IPv4 addresses (like ::ffff:192.168.1.1)
export function cleanIp(ip: string): string {
  let cleaned = ip.trim();
  if (cleaned.startsWith('::ffff:')) {
    cleaned = cleaned.substring(7);
  }
  return cleaned;
}

// Convert IPv4 string to 32-bit unsigned integer
export function ipToInt(ip: string): number {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some(isNaN)) return 0;
  return ((parts[0] << 24) >>> 0) + (parts[1] << 16) + (parts[2] << 8) + parts[3];
}

interface CIDR {
  base: number;
  mask: number;
  original: string;
}

// Parse CIDR string into integer base and mask
export function parseCidr(cidr: string): CIDR | null {
  const parts = cidr.trim().split('/');
  if (parts.length !== 2) return null;
  const base = ipToInt(parts[0]);
  const bits = parseInt(parts[1], 10);
  if (isNaN(bits) || bits < 0 || bits > 32) return null;
  
  const mask = bits === 0 ? 0 : (~((1 << (32 - bits)) - 1)) >>> 0;
  return { base, mask, original: cidr };
}

// Check if IP integer is in a parsed CIDR range
export function isIpInCidr(ipInt: number, cidr: CIDR): boolean {
  return (ipInt & cidr.mask) === (cidr.base & cidr.mask);
}

// 1. In-Memory Stores
const loadedCidrs: CIDR[] = [];
const torExitNodes = new Set<string>();
const blacklistedIpsMemory = new Set<string>();

// Pre-baked major datacenter CIDR blocks as high-certainty offline fallback
const preBakedCidrs = [
  // Hetzner
  '116.203.0.0/16', '95.216.0.0/15', '78.46.0.0/15', '88.198.0.0/15', '176.9.0.0/16', '136.243.0.0/16',
  // DigitalOcean
  '104.248.0.0/16', '138.197.0.0/15', '159.203.0.0/16', '159.65.0.0/16', '165.227.0.0/16', '167.99.0.0/16', '206.189.0.0/16', '46.101.0.0/16', '134.209.0.0/16', '178.62.0.0/16',
  // Linode / Akamai
  '172.104.0.0/15', '139.162.0.0/16', '45.79.0.0/16', '45.33.0.0/16', '192.155.0.0/16',
  // OVH / Contabo / Scaleway
  '5.9.0.0/16', '144.76.0.0/16', '148.251.0.0/16', '195.201.0.0/16', '162.55.0.0/16', '213.239.128.0/17', '185.244.192.0/22', '178.32.0.0/15', '51.254.0.0/15', '149.202.0.0/16', '51.89.0.0/16', '178.254.0.0/16',
  // Google Cloud (GCP)
  '34.80.0.0/12', '35.184.0.0/13', '35.200.0.0/13', '104.196.0.0/14', '104.154.0.0/15', '130.211.0.0/16',
  // Microsoft Azure
  '13.64.0.0/11', '23.96.0.0/13', '40.76.0.0/14', '40.112.0.0/13', '52.136.0.0/13', '52.145.0.0/16', '52.146.0.0/15',
  // Render.com Hosting ranges / datacenter blocks
  '216.24.57.0/24', '159.203.0.0/16', '143.198.0.0/16', '146.190.0.0/16', '164.92.64.0/18'
];

// Load pre-baked CIDRs first
for (const cidrStr of preBakedCidrs) {
  const parsed = parseCidr(cidrStr);
  if (parsed) loadedCidrs.push(parsed);
}

// 2. Fetcher functions to keep ranges fresh
async function fetchTorExitNodes() {
  try {
    const res = await fetch('https://check.torproject.org/torbulkexitlist');
    if (res.ok) {
      const text = await res.text();
      const ips = text.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('#'));
      for (const ip of ips) {
        torExitNodes.add(ip);
      }
      console.log(`[VPN Blocker] Loaded ${torExitNodes.size} Tor exit nodes successfully.`);
    }
  } catch (err) {
    console.error('[VPN Blocker] Error fetching Tor exit nodes, falling back to pre-cached ranges.', err);
  }
}

async function fetchCloudflareIps() {
  try {
    const res = await fetch('https://www.cloudflare.com/ips-v4');
    if (res.ok) {
      const text = await res.text();
      const ranges = text.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('#'));
      let count = 0;
      for (const r of ranges) {
        const parsed = parseCidr(r);
        if (parsed) {
          loadedCidrs.push(parsed);
          count++;
        }
      }
      console.log(`[VPN Blocker] Loaded ${count} Cloudflare ranges dynamically.`);
    }
  } catch (err) {
    console.error('[VPN Blocker] Error fetching Cloudflare IPs.', err);
  }
}

async function fetchAwsIps() {
  try {
    const res = await fetch('https://ip-ranges.amazonaws.com/ip-ranges.json');
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.prefixes)) {
        let count = 0;
        for (const prefix of data.prefixes) {
          if (prefix.ip_prefix) {
            const parsed = parseCidr(prefix.ip_prefix);
            if (parsed) {
              loadedCidrs.push(parsed);
              count++;
            }
          }
        }
        console.log(`[VPN Blocker] Loaded ${count} AWS hosting ranges dynamically.`);
      }
    }
  } catch (err) {
    console.error('[VPN Blocker] Error fetching AWS IP ranges.', err);
  }
}

// Sync already blacklisted IPs from Supabase into memory for instant O(1) checks
async function syncBlacklistedIps(supabase: SupabaseClient) {
  try {
    const { data, error } = await supabase.from('blacklisted_ips').select('ip');
    if (error) {
      console.error('[VPN Blocker] Error fetching blacklisted_ips from DB:', error);
      return;
    }
    if (data) {
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

// 3. Main Init Function
export async function initializeVpnBlocker(supabase: SupabaseClient) {
  console.log('[VPN Blocker] Initializing offline security engine...');
  
  // Sync DB blacklist
  await syncBlacklistedIps(supabase);
  
  // Asynchronously fetch dynamic external ranges to avoid blocking server boot
  Promise.all([
    fetchTorExitNodes(),
    fetchCloudflareIps(),
    fetchAwsIps()
  ]).catch(err => {
    console.error('[VPN Blocker] Error in asynchronous IP updates:', err);
  });
}

// 4. Verification Checkers
export function isIpBlacklisted(ip: string): boolean {
  const cleaned = cleanIp(ip);
  return blacklistedIpsMemory.has(cleaned);
}

export function isVpnOrProxy(ip: string): boolean {
  const cleaned = cleanIp(ip);
  
  // Check 1: Is it a known Tor Exit Node?
  if (torExitNodes.has(cleaned)) {
    return true;
  }
  
  // Check 2: Is it within AWS/GCP/Azure/Cloudflare/Hetzner/DO CIDR ranges?
  const ipInt = ipToInt(cleaned);
  if (ipInt === 0) return false;
  
  for (const cidr of loadedCidrs) {
    if (isIpInCidr(ipInt, cidr)) {
      return true;
    }
  }
  
  return false;
}

// 5. Blacklisting implementation
export async function blacklistIp(supabase: SupabaseClient, ip: string, reason: string = 'VPN/Proxy Detected') {
  const cleaned = cleanIp(ip);
  blacklistedIpsMemory.add(cleaned);
  try {
    await supabase.from('blacklisted_ips').upsert([{ ip: cleaned, reason }]);
    console.log(`[VPN Blocker] Added IP ${cleaned} to Supabase blacklist. Reason: ${reason}`);
  } catch (err) {
    console.error(`[VPN Blocker] Failed to insert blacklisted IP ${cleaned} to Supabase:`, err);
  }
}
