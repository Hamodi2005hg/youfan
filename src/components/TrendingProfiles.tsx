import React from 'react';
import { Profile } from '../types';
import { UserCheck, Sparkles } from 'lucide-react';

interface TrendingProfilesProps {
  profiles: Profile[];
  onSelectProfile: (username: string) => void;
}

export const TrendingProfiles: React.FC<TrendingProfilesProps> = ({
  profiles,
  onSelectProfile,
}) => {
  // If no profiles yet
  if (profiles.length === 0) {
    return (
      <section className="w-full mb-24 md:mb-32 max-w-[1280px] mx-auto px-5 md:px-10">
        <h3 className="text-3xl md:text-5xl font-extrabold text-black tracking-tight mb-8">
          Trending creators
        </h3>
        <div className="bg-[#131313] text-white rounded-3xl p-8 md:p-12 text-center border border-white/10 shadow-xl max-w-2xl mx-auto">
          <div className="w-14 h-14 bg-[#FFFB93] rounded-2xl flex items-center justify-center text-black mx-auto mb-6">
            <Sparkles className="w-7 h-7" />
          </div>
          <h4 className="text-2xl font-black mb-3">Be the First Creator on YoStar!</h4>
          <p className="text-sm text-gray-400 max-w-md mx-auto mb-6 leading-relaxed">
            Create your personalized bio links, publish beautiful content, and unlock 70% Google AdSense revenue sharing today.
          </p>
        </div>
      </section>
    );
  }

  // Duplicate list to achieve continuous marquee
  const displayProfiles = [...profiles, ...profiles, ...profiles];

  return (
    <section className="w-full mb-24 md:mb-32 overflow-hidden">
      {/* Header */}
      <div className="max-w-[1280px] mx-auto px-5 md:px-10 flex items-center justify-between mb-8">
        <h3 className="text-3xl md:text-5xl font-extrabold text-black tracking-tight">
          Trending creators
        </h3>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#FFFB93] flex items-center justify-center text-black shadow-xs">
            <UserCheck className="w-6 h-6 text-black" />
          </div>
          <div className="text-left">
            <p className="text-xl md:text-2xl font-black text-black leading-none">+{profiles.length}</p>
            <p className="text-xs font-semibold text-gray-500">Active creators</p>
          </div>
        </div>
      </div>

      {/* Marquee Carousel of Profiles */}
      <div className="relative w-full overflow-x-auto pb-6 scrollbar-none">
        <div className="animate-profiles-move flex gap-6 px-5">
          {displayProfiles.map((prof, idx) => (
            <div
              key={`${prof.username}-${idx}`}
              onClick={() => onSelectProfile(prof.username)}
              className="relative w-44 sm:w-56 h-44 sm:h-56 rounded-full overflow-hidden shrink-0 group cursor-pointer shadow-lg transition-transform duration-300 hover:scale-110 hover:z-30 border-4 border-white"
            >
              <img
                src={prof.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${prof.username}`}
                alt={prof.username}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity p-4 text-center">
                <p className="text-sm sm:text-base font-bold text-[#FFFB93]">@{prof.username}</p>
                <p className="text-xs text-gray-300 mt-1 line-clamp-2">{prof.bio || 'Creator'}</p>
                <div className="mt-3 bg-white/20 backdrop-blur-xs px-3 py-1 rounded-full text-xs font-semibold">
                  <span>{(prof.views_count || 0).toLocaleString()} views</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
