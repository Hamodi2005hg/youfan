import React, { useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

interface HeroSectionProps {
  onGetStarted: (username: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onGetStarted }) => {
  const [handle, setHandle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (handle.trim()) {
      onGetStarted(handle.trim());
    } else {
      onGetStarted('creator_' + Math.floor(Math.random() * 9000 + 1000));
    }
  };

  return (
    <section className="w-full max-w-[1280px] mx-auto px-5 md:px-10 pt-8 pb-16 md:pt-14 md:pb-24">
      <div className="max-w-4xl">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/5 text-black font-bold text-xs uppercase tracking-widest mb-6">
          <Sparkles className="w-3.5 h-3.5 text-[#FF2D55]" />
          <span>YoStar Creator Hub & Monetization Network</span>
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-[76px] font-black leading-[1.08] tracking-tight text-black mb-4">
          Empower your creative voice <br />
          & earn instantly.
        </h1>
        <h2 className="text-xl sm:text-2xl md:text-[26px] font-normal text-gray-700 mb-8 md:mb-12">
          Launch your publisher profile, publish captivating content, and unlock direct reader support and ad earnings.
        </h2>

        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-6">
          {/* Claim Username Input Card */}
          <form
            onSubmit={handleSubmit}
            className="flex items-center bg-white rounded-full p-2 pl-6 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 max-w-md w-full"
          >
            <span className="text-gray-400 font-medium text-base select-none">yo.star/@</span>
            <input
              id="hero-username-input"
              type="text"
              value={handle}
              onChange={(e) => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
              placeholder="yourname"
              maxLength={20}
              className="flex-1 bg-transparent px-1 py-2 font-medium text-black focus:outline-none placeholder:text-gray-400 text-base"
            />
            <button
              id="hero-get-started-btn"
              type="submit"
              className="px-6 py-3 bg-black hover:bg-gray-800 text-white font-semibold text-sm rounded-full transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <span>Launch Hub</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Creators social proof badge */}
          <div className="flex items-center gap-3">
            <div className="flex -space-x-3 overflow-hidden">
              <img
                className="inline-block h-12 w-12 rounded-full ring-2 ring-white object-cover"
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80"
                alt="Creator avatar"
              />
              <img
                className="inline-block h-12 w-12 rounded-full ring-2 ring-white object-cover"
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80"
                alt="Creator avatar"
              />
              <img
                className="inline-block h-12 w-12 rounded-full ring-2 ring-white object-cover"
                src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=80"
                alt="Creator avatar"
              />
              <img
                className="inline-block h-12 w-12 rounded-full ring-2 ring-white object-cover"
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80"
                alt="Creator avatar"
              />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Publishers</p>
              <p className="text-2xl font-black text-black leading-none">+3,490</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
