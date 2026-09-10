import React from 'react';
import { Profile } from '../types';
import { LogOut } from 'lucide-react';

interface HeaderProps {
  currentUser: Profile | null;
  onOpenAuth: (mode: 'login' | 'signup') => void;
  onSelectProfile: (username: string, section?: string) => void;
  onGoHome: () => void;
  onGoFeed: () => void;
  onOpenLegal?: (tab: 'content-policy' | 'terms' | 'privacy' | 'monetization') => void;
  onLogout: () => void;
  activeView?: 'home' | 'profile';
  activeSection?: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onOpenAuth,
  onSelectProfile,
  onGoHome,
  onGoFeed,
  onOpenLegal,
  onLogout,
}) => {
  return (
    <header className="w-full max-w-[1280px] mx-auto px-5 md:px-10 py-5 flex items-center justify-between z-40 relative">
      
      {/* Brand Logo & Nav */}
      <div className="flex items-center gap-6">
        <button
          onClick={onGoHome}
          className="flex items-center gap-2 group cursor-pointer focus:outline-none bg-transparent border-none text-left p-0"
        >
          <div className="flex items-center">
            <span className="font-extrabold text-3xl tracking-tighter text-black">
              yo<span className="text-[#FF2D55]">.</span>star
            </span>
            <span className="ml-2 text-[10px] uppercase font-bold tracking-widest bg-black text-white px-2 py-0.5 rounded-full hidden sm:inline-block">
              Creator
            </span>
          </div>
        </button>

        <button 
          onClick={onGoFeed}
          className="text-gray-500 hover:text-black font-bold text-sm cursor-pointer border-none bg-transparent"
        >
          Feed
        </button>

        {onOpenLegal && (
          <button 
            onClick={() => onOpenLegal('content-policy')}
            className="text-gray-500 hover:text-black font-bold text-sm cursor-pointer border-none bg-transparent hidden sm:inline-block"
          >
            Policy & Terms
          </button>
        )}
      </div>


      {/* Header Actions */}
      <div className="flex items-center gap-4">
        {currentUser ? (
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => onSelectProfile(currentUser.username, 'profile')}
              className="flex items-center gap-2 pl-2 pr-4 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full transition cursor-pointer border-none"
            >
              <img
                src={currentUser.avatar_url}
                alt={currentUser.username}
                className="w-8 h-8 rounded-full object-cover border border-white shadow-xs"
                referrerPolicy="no-referrer"
              />
              <span className="font-bold text-sm text-black">@{currentUser.username}</span>
            </button>

            <button
              onClick={onLogout}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition cursor-pointer border-none bg-transparent"
              title="Log Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenAuth('login')}
              className="px-4 py-2 font-bold text-sm text-black hover:bg-black/5 rounded-full transition cursor-pointer border-none"
            >
              Log In
            </button>
            <button
              onClick={() => onOpenAuth('signup')}
              className="px-5 py-2.5 bg-black hover:bg-gray-800 text-white font-bold text-sm rounded-full transition cursor-pointer shadow-md border-none"
            >
              Sign Up
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
