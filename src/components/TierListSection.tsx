import React from 'react';
import { Check, ShieldCheck, Zap } from 'lucide-react';

interface TierListSectionProps {
  onCreateProfile: () => void;
}

export const TierListSection: React.FC<TierListSectionProps> = ({ onCreateProfile }) => {
  return (
    <section className="w-full max-w-[1280px] mx-auto px-5 md:px-10 mb-24 md:mb-32">
      <div className="grid grid-cols-1 md:grid-cols-2 rounded-3xl overflow-hidden border border-gray-200 shadow-sm">
        {/* Basic Tier */}
        <div className="p-8 sm:p-12 lg:p-16 bg-white flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h4 className="text-2xl sm:text-3xl font-bold text-black">Basic Creator Tier</h4>
            </div>
            <p className="text-base font-semibold text-gray-500 mb-8">Free for all users</p>

            <ul className="space-y-4 mb-10">
              <li className="flex items-center gap-3 text-sm sm:text-base font-medium text-gray-800">
                <Check className="w-5 h-5 text-black shrink-0" />
                <span>Publish posts and visual publications</span>
              </li>
              <li className="flex items-center gap-3 text-sm sm:text-base font-medium text-gray-800">
                <Check className="w-5 h-5 text-black shrink-0" />
                <span>Basic view & upvote analytics</span>
              </li>
              <li className="flex items-center gap-3 text-sm sm:text-base font-medium text-gray-800">
                <Check className="w-5 h-5 text-black shrink-0" />
                <span>Custom social media link profile</span>
              </li>
              <li className="flex items-center gap-3 text-sm sm:text-base font-medium text-gray-800">
                <Check className="w-5 h-5 text-black shrink-0" />
                <span>Community voting & interaction</span>
              </li>
            </ul>
          </div>

          <button
            id="tier-basic-cta"
            onClick={onCreateProfile}
            className="w-full sm:w-auto self-start px-8 py-4 bg-black hover:bg-gray-800 text-white font-bold text-base rounded-2xl transition cursor-pointer"
          >
            Create Creator Account
          </button>
        </div>

        {/* Verified Tier (Highlighted with YoStar Yellow) */}
        <div className="p-8 sm:p-12 lg:p-16 bg-[#FFFB93] flex flex-col justify-between border-t md:border-t-0 md:border-l border-yellow-200">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <h4 className="text-2xl sm:text-3xl font-bold text-black">Top Creator Tier</h4>
                <ShieldCheck className="w-6 h-6 text-black" />
              </div>
              <span className="text-xs uppercase tracking-wider font-bold bg-black text-white px-3 py-1 rounded-full">
                Priority Feed
              </span>
            </div>
            <p className="text-base font-semibold text-gray-800 mb-8">
              Verified badge and priority ranking in trending creator feeds
            </p>

            <ul className="space-y-4 mb-10">
              <li className="flex items-center gap-3 text-sm sm:text-base font-medium text-black">
                <Check className="w-5 h-5 text-black shrink-0" />
                <span>Verified Creator badge on your public profile</span>
              </li>
              <li className="flex items-center gap-3 text-sm sm:text-base font-medium text-black">
                <Check className="w-5 h-5 text-black shrink-0" />
                <span>Priority post placement upon organic upvoting</span>
              </li>
              <li className="flex items-center gap-3 text-sm sm:text-base font-medium text-black">
                <Check className="w-5 h-5 text-black shrink-0" />
                <span>Verified link integration for all social channels</span>
              </li>
              <li className="flex items-center gap-3 text-sm sm:text-base font-medium text-black">
                <Check className="w-5 h-5 text-black shrink-0" />
                <span>Real-time audience engagement stats</span>
              </li>
              <li className="flex items-center gap-3 text-sm sm:text-base font-black text-black bg-white/50 p-2.5 rounded-xl">
                <Zap className="w-5 h-5 text-black fill-black shrink-0" />
                <span>Top spot eligibility in global discovery trends</span>
              </li>
            </ul>
          </div>

          <button
            id="tier-verified-cta"
            onClick={onCreateProfile}
            className="w-full sm:w-auto self-start px-8 py-4 bg-black hover:bg-gray-800 text-white font-bold text-base rounded-2xl transition cursor-pointer shadow-sm"
          >
            Join YoStar Creators
          </button>
        </div>
      </div>
    </section>
  );
};

