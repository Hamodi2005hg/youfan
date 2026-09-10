import React from 'react';

interface FooterProps {
  onOpenAdsTxt: () => void;
  onOpenSupabaseModal: () => void;
}

export const Footer: React.FC<FooterProps> = () => {
  return (
    <footer className="w-full bg-black text-white pt-16 pb-20 px-5 md:px-10 mt-auto">
      <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
        {/* Logo & Copyright */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="font-extrabold text-3xl tracking-tighter text-white">
              yo<span className="text-[#FFFB93]">.</span>star
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest bg-white/20 text-white px-2 py-0.5 rounded-full">
              Creator Hub & Network
            </span>
          </div>
          <p className="text-xs text-gray-400">YoStar Network © 2026. All rights reserved.</p>
        </div>

        {/* Links Navigation */}
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition cursor-pointer"
          >
            Partner Earning Program
          </button>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition cursor-pointer"
          >
            Creator Guidelines
          </button>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition cursor-pointer"
          >
            Terms of Service
          </button>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition cursor-pointer"
          >
            Privacy Policy
          </button>
        </div>
      </div>
    </footer>
  );
};
