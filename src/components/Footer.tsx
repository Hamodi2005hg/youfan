import React from 'react';
import { ShieldCheck, FileText, Lock } from 'lucide-react';

interface FooterProps {
  onOpenLegal: (tab: 'content-policy' | 'terms' | 'privacy') => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenLegal,
}) => {
  return (
    <footer className="w-full bg-black text-white pt-16 pb-20 px-5 md:px-10 mt-auto border-t border-white/10">
      <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
        {/* Logo & Copyright */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="font-extrabold text-3xl tracking-tighter text-white">
              yo<span className="text-[#FFFB93]">.</span>star
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest bg-white/20 text-white px-2.5 py-1 rounded-full">
              Creator Hub & Network
            </span>
          </div>
          <p className="text-xs text-gray-400">
            YoStar Network LTD © 2026. All rights reserved. Secure Creator Platform.
          </p>
        </div>

        {/* Links Navigation */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onOpenLegal('content-policy')}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition cursor-pointer border-none"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#FF2D55]" />
            Content Policy
          </button>
          <button
            onClick={() => onOpenLegal('terms')}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition cursor-pointer border-none"
          >
            <FileText className="w-3.5 h-3.5 text-[#30D158]" />
            Terms of Service
          </button>
          <button
            onClick={() => onOpenLegal('privacy')}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition cursor-pointer border-none"
          >
            <Lock className="w-3.5 h-3.5 text-[#007AFF]" />
            Privacy Policy
          </button>
        </div>
      </div>
    </footer>
  );
};
