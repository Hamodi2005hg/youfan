import React, { useEffect, useState, useRef } from 'react';
import { Profile } from '../types';

interface AdSenseUnitProps {
  profileOwner: Profile;
}

export function AdSenseUnit({ profileOwner }: AdSenseUnitProps) {
  const [adConfig, setAdConfig] = useState<{ pubId: string; type: 'creator' | 'platform' } | null>(null);
  const initialized = useRef(false);

  useEffect(() => {
    // Only run this logic once per component mount
    if (initialized.current) return;
    initialized.current = true;

    // Platform's Publisher ID (used for the 30% revenue share)
    const PLATFORM_PUB_ID = 'pub-1082649182374652';

    // 1. Math.random() logic for 70/30 revenue share
    const rand = Math.random();
    let selectedPubId = PLATFORM_PUB_ID;
    let type: 'creator' | 'platform' = 'platform';

    // Check if creator is qualified (has provided adsense ID)
    const hasAdsenseId = profileOwner.adsense_pub_id && profileOwner.adsense_pub_id.startsWith('pub-');
    
    // Revenue share logic
    if (hasAdsenseId && rand < 0.7) {
      // 70% of the time: show the creator's ad
      selectedPubId = profileOwner.adsense_pub_id;
      type = 'creator';
    } else {
      // 30% of the time (or if creator is not qualified): show platform ad
      selectedPubId = PLATFORM_PUB_ID;
      type = 'platform';
    }

    setAdConfig({ pubId: selectedPubId, type });
  }, [profileOwner]);

  useEffect(() => {
    if (adConfig) {
      try {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.error('AdSense push error:', e);
      }
    }
  }, [adConfig]);

  if (!adConfig) return null;

  return (
    <div className="w-full my-6 flex flex-col items-center justify-center min-h-[100px] bg-white/5 border border-white/10 rounded-xl p-4 overflow-hidden">
      <div className="text-[10px] uppercase tracking-wider font-bold text-gray-500 mb-4 flex items-center justify-between w-full">
        <span>Advertisement</span>
        {adConfig.type === 'creator' ? (
          <span className="text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-500/20">Creator Ad (70%)</span>
        ) : (
          <span className="text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded border border-blue-500/20">Platform Ad (30%)</span>
        )}
      </div>

      <ins
        className="adsbygoogle w-full"
        style={{ display: 'block', textAlign: 'center' }}
        data-ad-client={adConfig.pubId}
        data-ad-slot="1234567890" // Placeholder ad slot
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
    </div>
  );
}
