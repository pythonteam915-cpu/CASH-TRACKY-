import React from 'react';
import { Calendar, LogOut, User as UserIcon, Globe, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  currentMonth: string;
  year: number;
  onOpenAuth?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentMonth, year, onOpenAuth }) => {
  const { currentUser, userProfile, activeCountry, activeCurrency, signOut, loading, authError, clearAuthError } = useAuth();

  const isUserAuthenticated = Boolean(currentUser || userProfile?.phone);

  return (
    <header className="pt-2 pb-3 px-1">
      {/* Top Branding & Auth Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {/* CASH TRACKY Prism Logo */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 via-blue-500 to-pink-500 rounded-2xl blur-xs opacity-75 group-hover:opacity-100 transition duration-300"></div>
            <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center shadow-md shadow-violet-500/20">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="transform group-hover:scale-110 transition-transform duration-300"
              >
                <path
                  d="M12 2L2 7L12 12L22 7L12 2Z"
                  fill="url(#prismGrad1)"
                  stroke="rgba(255,255,255,0.7)"
                  strokeWidth="0.8"
                />
                <path
                  d="M2 17L12 22L22 17"
                  stroke="url(#prismGrad2)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2 12L12 17L22 12"
                  stroke="url(#prismGrad3)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <defs>
                  <linearGradient id="prismGrad1" x1="2" y1="2" x2="22" y2="12" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#8B5CF6" />
                    <stop offset="0.5" stopColor="#3B82F6" />
                    <stop offset="1" stopColor="#EC4899" />
                  </linearGradient>
                  <linearGradient id="prismGrad2" x1="2" y1="17" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#60A5FA" />
                    <stop offset="1" stopColor="#A855F7" />
                  </linearGradient>
                  <linearGradient id="prismGrad3" x1="2" y1="12" x2="22" y2="17" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#38BDF8" />
                    <stop offset="1" stopColor="#F472B6" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-xl font-black tracking-tight text-slate-900">
                CASH <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">TRACKY</span>
              </h1>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-500 font-semibold tracking-wide">
              Smart Expense Tracker
            </p>
          </div>
        </div>

        {/* Right slot: Country/Currency Badge & Auth Button */}
        <div className="flex items-center gap-1.5">
          {/* Active Detected Country & Currency Pill */}
          <button
            type="button"
            onClick={onOpenAuth}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200/70 border border-slate-200 text-xs font-bold text-slate-700 transition-all cursor-pointer shadow-2xs"
            title={`Active Region: ${activeCountry.name} (${activeCountry.dialCode}) • Currency: ${activeCurrency.code} (${activeCurrency.symbol})`}
          >
            <span role="img" aria-label={activeCountry.name} className="text-sm">
              {activeCountry.flag}
            </span>
            <span className="text-[11px] font-black text-violet-700">
              {activeCurrency.code} ({activeCurrency.symbol})
            </span>
          </button>

          {isUserAuthenticated ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-slate-200 shadow-xs">
              {currentUser?.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || 'User'}
                  className="w-5 h-5 rounded-full object-cover border border-slate-200"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center text-[10px] font-bold">
                  {userProfile?.displayName ? userProfile.displayName.charAt(0) : 'U'}
                </div>
              )}
              <span className="text-xs font-bold text-slate-700 max-w-[70px] truncate hidden sm:inline">
                {userProfile?.displayName?.split(' ')[0] || currentUser?.displayName?.split(' ')[0] || 'Member'}
              </span>
              <button
                type="button"
                onClick={signOut}
                title="Sign out"
                className="text-slate-400 hover:text-rose-600 transition-colors ml-0.5 p-0.5"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenAuth}
              disabled={loading}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:brightness-105 text-white text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>

      {authError && (
        <div className="mt-2 p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs flex items-center justify-between">
          <span>{authError}</span>
          <button type="button" onClick={clearAuthError} className="text-rose-700 font-bold ml-2">
            ×
          </button>
        </div>
      )}

      {/* Section Sub-heading: This Month */}
      <div className="mt-4 flex items-baseline justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-violet-600 animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-violet-600">Overview</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 mt-0.5">
            This Month
          </h2>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200/90 text-xs font-semibold text-slate-600 shadow-xs">
          <Calendar className="w-3.5 h-3.5 text-violet-600" />
          <span>{currentMonth} {year}</span>
        </div>
      </div>
    </header>
  );
};
