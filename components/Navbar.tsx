'use client';

import React from 'react';
import { Sparkles, UserCheck, Bell, RefreshCw, Upload } from 'lucide-react';
import { CandidateProfile } from '@/lib/types';

interface NavbarProps {
  candidate: CandidateProfile;
  onOpenProfile: () => void;
  onOpenAlertTest: () => void;
  isRefreshing: boolean;
  onRefresh: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  candidate,
  onOpenProfile,
  onOpenAlertTest,
  isRefreshing,
  onRefresh,
}) => {
  const isDefaultProfile = candidate.name === 'Your Profile' || candidate.name === 'Alex Vance';

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-[#0b1329]/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand & Title */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 via-teal-500 to-cyan-400 p-0.5 shadow-md shadow-blue-500/20">
            <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <span className="font-extrabold text-teal-400 text-sm tracking-tighter">in</span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-bold text-base tracking-tight text-white">
                LINKED<span className="text-teal-400 font-extrabold">AI</span>
              </h1>
              <span className="bg-teal-500/15 text-teal-300 border border-teal-500/30 text-[9px] font-bold px-1.5 py-0.2 rounded uppercase tracking-wider">
                Smart Career Feed
              </span>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center gap-3 shrink-0">
          
          {/* Simple Upload Resume Button */}
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 shadow-md shadow-teal-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Resume</span>
          </button>

          {/* Test Alert Button */}
          <button
            onClick={onOpenAlertTest}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-amber-400 transition-colors"
            title="Test Instant Job Alerts"
          >
            <Bell className="w-4 h-4 text-amber-400" />
          </button>

          {/* Refresh Feed */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-teal-400 transition-colors"
            title="Refresh Feed"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-teal-400' : ''}`} />
          </button>

          {/* Candidate Profile Pill */}
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-xl bg-slate-900 border border-slate-800 hover:border-teal-500/40 transition-all group"
          >
            <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold text-xs group-hover:bg-teal-500 group-hover:text-slate-950 transition-colors">
              <UserCheck className="w-4 h-4" />
            </div>
            <div className="text-left hidden md:block">
              <p className="text-xs font-bold text-slate-200 group-hover:text-teal-300 transition-colors leading-tight">
                {isDefaultProfile ? 'Upload Resume' : candidate.name}
              </p>
              <p className="text-[10px] text-slate-400 truncate max-w-[110px]">
                {isDefaultProfile ? 'My Profile' : candidate.title}
              </p>
            </div>
          </button>

        </div>
      </div>
    </header>
  );
};
