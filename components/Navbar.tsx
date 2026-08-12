'use client';

import React from 'react';
import { Sparkles, UserCheck, Bot, Database, Bell, RefreshCw, PlusCircle } from 'lucide-react';
import { CandidateProfile } from '@/lib/types';

interface NavbarProps {
  candidate: CandidateProfile;
  onOpenProfile: () => void;
  onOpenIngestSimulator: () => void;
  onOpenAlertTest: () => void;
  isRefreshing: boolean;
  onRefresh: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  candidate,
  onOpenProfile,
  onOpenIngestSimulator,
  onOpenAlertTest,
  isRefreshing,
  onRefresh,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-[#090D16]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-400 p-0.5 shadow-lg shadow-teal-500/20">
            <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-teal-400 animate-pulse-glow" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg tracking-tight text-white">
                PASSIVE<span className="text-teal-400 font-extrabold">MATCH</span>
              </h1>
              <span className="bg-teal-500/10 text-teal-400 border border-teal-500/20 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                AI Career Engine
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium hidden sm:block">
              Transferable Skill Matching & Automated Job Alerts
            </p>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center gap-3">
          
          {/* Status Badges */}
          <div className="hidden lg:flex items-center gap-2 text-xs font-mono bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-lg">
            <div className="flex items-center gap-1.5 text-slate-300">
              <Bot className="w-3.5 h-3.5 text-cyan-400" />
              <span>Gemini AI Active</span>
            </div>
          </div>

          {/* Test Notification Button */}
          <button
            onClick={onOpenAlertTest}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60 transition-all hover:text-white"
            title="Test Telegram or Email notifications"
          >
            <Bell className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Test Alert</span>
          </button>

          {/* Add Job Button */}
          <button
            onClick={onOpenIngestSimulator}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white shadow-md shadow-teal-500/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add Job to Match</span>
          </button>

          {/* Refresh Data */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-teal-400 transition-colors"
            title="Refresh Job Feed"
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
            <div className="text-left hidden sm:block">
              <p className="text-xs font-semibold text-slate-200 group-hover:text-teal-300 transition-colors leading-tight">
                {candidate.name}
              </p>
              <p className="text-[10px] text-slate-400 truncate max-w-[120px]">
                {candidate.title}
              </p>
            </div>
          </button>

        </div>
      </div>
    </header>
  );
};
