import React, { useState, useEffect } from 'react';
import { DollarSign, Sparkles, Share2, Link as LinkIcon } from 'lucide-react';

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
      title: 'Publish original content',
      desc: 'Create immersive story-like posts or add rich link collections. Your audience can browse your professional profile and interact instantly.',
    },
    {
      icon: Share2,
      title: 'Distribute your profile link',
      desc: 'Share your YoStar link across all your social channels—Instagram, TikTok, X, and YouTube—to drive direct traffic and build community.',
    },
    {
      icon: DollarSign,
      title: 'Earn from Google AdSense (70/30)',
      desc: 'Generate passive revenue from automated AdSense impressions displayed alongside your articles and photo stories.',
    },
    {
      icon: LinkIcon,
      title: 'Monetize external assets',
      desc: 'Promote your merchandise, digital products, newsletters, or affiliate recommendations directly from your hub.',
    },
  ];

  return (
    <section className="w-full max-w-[1280px] mx-auto px-5 md:px-10 mb-24 md:mb-36">
      <h3 className="text-3xl md:text-5xl font-extrabold text-black tracking-tight mb-12 md:mb-16">
        Grow and monetize with YoStar
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

        {/* Visual Showcase Card with Authentic Yellow Floating Badges */}
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
                    Pro Hub
                  </span>
                </div>
              </div>
            </div>

            {/* Floating Yellow Badge 1: Earnings */}
            <div className="absolute top-10 -right-4 sm:-right-8 bg-[#FFFB93] rounded-2xl px-6 py-4 shadow-xl border border-yellow-200/50 text-center z-10 animate-bounce [animation-duration:4s]">
              <p className="text-2xl sm:text-3xl font-black text-black leading-none mb-1">$94,120</p>
              <p className="text-xs sm:text-sm font-semibold text-gray-800">Monthly revenue</p>
            </div>

            {/* Floating Yellow Badge 2: Followers */}
            <div className="absolute bottom-10 -left-4 sm:-left-8 bg-[#FFFB93] rounded-2xl px-6 py-4 shadow-xl border border-yellow-200/50 text-center z-10 animate-bounce [animation-duration:5s]">
              <p className="text-2xl sm:text-3xl font-black text-black leading-none mb-1">8,400</p>
              <p className="text-xs sm:text-sm font-semibold text-gray-800">new subscribers</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
