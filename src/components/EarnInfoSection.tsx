import React, { useState, useEffect } from 'react';
import { Sparkles, Share2, ThumbsUp, Link as LinkIcon, Award } from 'lucide-react';

export const EarnInfoSection: React.FC = () => {
  const [showcaseImg, setShowcaseImg] = useState('https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=80');

  useEffect(() => {
    fetch('/api/platform-settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.showcaseImageUrl) {
          setShowcaseImg(data.showcaseImageUrl);
        }
      })
      .catch(() => {});
  }, []);

  const steps = [
    {
      icon: Sparkles,
      title: 'Publish Unique Content',
      desc: 'Create beautiful visual posts and showcase all your social media links so your audience can interact directly with your content.',
    },
    {
      icon: ThumbsUp,
      title: 'Community Voting Boosts Rank',
      desc: 'The more upvotes and engagement your publications receive, the higher your posts rank in the global creator discovery feed.',
    },
    {
      icon: Share2,
      title: 'Share Your Unified Profile',
      desc: 'Share your single bio link across Instagram, WhatsApp, Telegram, YouTube, TikTok, and build your organic global audience.',
    },
    {
      icon: LinkIcon,
      title: 'Verified Social Integration',
      desc: 'Connect all your social accounts and custom links with automated verification ensuring security and authenticity.',
    },
  ];

  return (
    <section className="w-full max-w-[1280px] mx-auto px-5 md:px-10 mb-24 md:mb-36">
      <h3 className="text-3xl md:text-5xl font-extrabold text-black tracking-tight mb-12 md:mb-16">
        Climb to the Top through Community Votes with YoStar
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        {/* 4 Feature Points */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-8 md:gap-10">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div key={idx} className="flex flex-col">
                <div className="w-10 h-10 rounded-xl bg-[#FFFB93] flex items-center justify-center text-black mb-4 font-bold shadow-xs">
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="text-xl font-bold text-black mb-3">{step.title}</h4>
                <p className="text-sm md:text-base text-gray-600 leading-relaxed">{step.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Visual Showcase Card with Yellow Floating Badges */}
        <div className="lg:col-span-5 relative flex justify-center py-6">
          <div className="relative w-full max-w-[380px]">
            {/* Phone/Creator Mockup Card */}
            <div className="bg-white rounded-3xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.12)] border border-gray-100 overflow-hidden">
              <div className="relative h-[420px] rounded-2xl overflow-hidden">
                <img
                  src={showcaseImg}
                  alt="Creator profile showcase"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-white">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">@creativehub</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  </div>
                  <span className="text-xs font-semibold bg-white/20 backdrop-blur-xs px-2.5 py-1 rounded-full">
                    Creator Hub
                  </span>
                </div>
              </div>
            </div>

            {/* Floating Yellow Badge 1: Top Ranked */}
            <div className="absolute top-10 -right-4 sm:-right-8 bg-[#FFFB93] rounded-2xl px-5 py-3 shadow-xl border border-yellow-200/50 text-center z-10 animate-bounce [animation-duration:4s]">
              <p className="text-base sm:text-lg font-black text-black leading-none mb-1">Top Voted Post</p>
              <p className="text-xs font-semibold text-gray-800">Trending #1</p>
            </div>

            {/* Floating Yellow Badge 2: Verified */}
            <div className="absolute bottom-10 -left-4 sm:-left-8 bg-[#FFFB93] rounded-2xl px-5 py-3 shadow-xl border border-yellow-200/50 text-center z-10 animate-bounce [animation-duration:5s]">
              <p className="text-base sm:text-lg font-black text-black leading-none mb-1">Verified Hub</p>
              <p className="text-xs font-semibold text-gray-800">Safe & Authentic</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

