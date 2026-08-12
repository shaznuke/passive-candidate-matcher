'use client';

import React from 'react';
import { Sparkles, UserCheck, Bot, Bell, RefreshCw, PlusCircle, Upload } from 'lucide-react';
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
          
          {/* Prominent Upload Resume Button */}
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-extrabold bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-md shadow-teal-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Resume (.docx / .pdf)</span>
          </button>

          {/* Add Job Button */}
          <button
            onClick={onOpenIngestSimulator}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5 text-teal-400" />
            <span className="hidden sm:inline">Add Job to Match</span>
          </button>

          {/* Test Notification Button */}
          <button
            onClick={onOpenAlertTest}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-amber-400 transition-colors"
            title="Test Alert Notifications"
          >
            <Bell className="w-4 h-4 text-amber-400" />
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

        </div>
      </div>
    </header>
  );
};
