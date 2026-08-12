'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from '@/components/Navbar';
import { ProfileManager } from '@/components/ProfileManager';
import { JobCard } from '@/components/JobCard';
import { MatchDetailModal } from '@/components/MatchDetailModal';
import { ResumeTailorDrawer } from '@/components/ResumeTailorDrawer';
import { CandidateProfile, JobMatch } from '@/lib/types';
import { DEFAULT_MOCK_PROFILE, MOCK_JOB_MATCHES } from '@/lib/mockData';
import { fetchAllMatches, fetchCurrentCandidate } from '@/lib/supabase';
import { Sparkles, Search, SlidersHorizontal, Bell, Briefcase, Globe, Loader2, Upload, Compass, UserCheck, ShieldCheck, Zap } from 'lucide-react';

export default function DashboardPage() {
  const [candidate, setCandidate] = useState<CandidateProfile>(DEFAULT_MOCK_PROFILE);
  const [matches, setMatches] = useState<JobMatch[]>(MOCK_JOB_MATCHES);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Live Web Search State
  const [liveSearchQuery, setLiveSearchQuery] = useState('');
  const [isSearchingLive, setIsSearchingLive] = useState(false);
  const [liveSearchSuccessText, setLiveSearchSuccessText] = useState<string | null>(null);

  // Modals & Drawers State
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedDetailMatch, setSelectedDetailMatch] = useState<JobMatch | null>(null);
  const [selectedTailorMatch, setSelectedTailorMatch] = useState<JobMatch | null>(null);
  const [alertNotificationText, setAlertNotificationText] = useState<string | null>(null);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [minMatchScore, setMinMatchScore] = useState<number>(60);

  // Initial Load
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsRefreshing(true);
    try {
      const activeCandidate = await fetchCurrentCandidate();
      setCandidate(activeCandidate);

      const matchData = await fetchAllMatches();
      if (matchData && matchData.length > 0) {
        setMatches(matchData);
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleTestAlert = async () => {
    try {
      const res = await fetch('/api/alerts/test', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setAlertNotificationText(`Test Notification Sent for ${data.testedMatch.title}! (${data.alertResult.message})`);
        setTimeout(() => setAlertNotificationText(null), 5000);
      }
    } catch (err) {
      console.error('Error triggering test alert:', err);
    }
  };

  const handleLiveWebSearch = async (queryToSearch?: string) => {
    const targetQuery = queryToSearch || liveSearchQuery || '';
    setIsSearchingLive(true);
    setLiveSearchSuccessText(null);

    try {
      const res = await fetch('/api/jobs/search-live', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: targetQuery }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Job search failed');

      if (data.matches && data.matches.length > 0) {
        setMatches((prev) => {
          const existingIds = new Set(prev.map((m) => m.id));
          const fresh = data.matches.filter((m: JobMatch) => !existingIds.has(m.id));
          return [...fresh, ...prev];
        });

        setLiveSearchSuccessText(`Scraped ${data.foundCount} active jobs from LinkedIn, Naukri & Indeed for your resume!`);
        setTimeout(() => setLiveSearchSuccessText(null), 6000);
      }
    } catch (err: any) {
      console.error('Error in handleLiveWebSearch:', err);
      setLiveSearchSuccessText(`Search info: ${err.message}`);
    } finally {
      setIsSearchingLive(false);
    }
  };

  const filteredMatches = useMemo(() => {
    return matches.filter((m) => {
      const job = m.job;
      if (!job) return false;

      if (selectedCategory !== 'All' && m.match_category !== selectedCategory) {
        return false;
      }

      if (m.match_score < minMatchScore) {
        return false;
      }

      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = job.title.toLowerCase().includes(q);
        const matchesCompany = job.company.toLowerCase().includes(q);
        const matchesReasons = m.fit_reasons.some((r) => r.toLowerCase().includes(q));
        if (!matchesTitle && !matchesCompany && !matchesReasons) {
          return false;
        }
      }

      return true;
    });
  }, [matches, selectedCategory, minMatchScore, searchQuery]);

  const totalCount = matches.length;
  const highTransferableCount = matches.filter((m) => m.match_score >= 80).length;
  const directFitCount = matches.filter((m) => m.match_category === 'Direct Fit').length;

  return (
    <div className="min-h-screen flex flex-col bg-[#090D16] text-slate-100 font-sans">
      
      {/* Top LinkedIn-Style Navigation */}
      <Navbar
        candidate={candidate}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenAlertTest={handleTestAlert}
        isRefreshing={isRefreshing}
        onRefresh={loadData}
      />

      {/* Toast notifications */}
      {alertNotificationText && (
        <div className="bg-teal-500/20 border-b border-teal-500/40 text-teal-300 text-xs px-4 py-2 text-center flex items-center justify-center gap-2 font-medium animate-fade-in">
          <Bell className="w-4 h-4 text-teal-400" />
          <span>{alertNotificationText}</span>
        </div>
      )}

      {liveSearchSuccessText && (
        <div className="bg-emerald-500/20 border-b border-emerald-500/40 text-emerald-300 text-xs px-4 py-2 text-center flex items-center justify-center gap-2 font-medium animate-fade-in">
          <Globe className="w-4 h-4 text-emerald-400" />
          <span>{liveSearchSuccessText}</span>
        </div>
      )}

      {/* Main 3-Column LinkedIn Executive Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Candidate Profile & Career Card */}
        <div className="lg:col-span-3 space-y-5">
          
          <div className="bg-[#0f172a]/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="h-16 bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-700 relative" />
            
            <div className="p-5 pt-0 space-y-4 relative">
              <div className="-mt-9 flex justify-between items-end">
                <div className="w-16 h-16 rounded-2xl bg-slate-900 border-2 border-teal-400 flex items-center justify-center font-bold text-teal-300 text-lg shadow-lg">
                  <UserCheck className="w-8 h-8" />
                </div>
                <span className="text-[10px] font-bold text-teal-400 bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 rounded-full uppercase">
                  Active Resume
                </span>
              </div>

              <div>
                <h3 className="text-base font-extrabold text-white leading-snug">{candidate.name}</h3>
                <p className="text-xs text-teal-400 font-semibold mt-0.5">{candidate.title}</p>
              </div>

              <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed italic bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                "{candidate.summary}"
              </p>

              <button
                onClick={() => setIsProfileOpen(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-extrabold shadow-md shadow-teal-500/20 transition-all"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Word (.docx) or PDF</span>
              </button>
            </div>
          </div>

          <div className="bg-[#0f172a]/90 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-xl">
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Transferable Competencies
            </h4>
            <div className="space-y-1.5">
              {candidate.transferable_skills.map((skill, idx) => (
                <div key={idx} className="bg-slate-950/60 border border-slate-800/80 p-2 rounded-lg text-xs text-slate-300 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0" />
                  <span className="leading-snug">{skill}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* CENTER COLUMN: Smart Job Feed & Search Controls */}
        <div className="lg:col-span-6 space-y-5">
          
          <div className="bg-[#0f172a]/90 border border-teal-500/30 p-5 rounded-2xl space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-teal-400" />
                <h3 className="text-sm font-extrabold text-white">Search LinkedIn, Naukri & Indeed</h3>
              </div>
              <span className="text-[10px] text-teal-400 font-mono">Live Web Scraper</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={liveSearchQuery}
                  onChange={(e) => setLiveSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLiveWebSearch()}
                  placeholder="Type title (e.g. Chief of Staff, Operations Lead)..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-teal-400"
                />
              </div>

              <button
                onClick={() => handleLiveWebSearch()}
                disabled={isSearchingLive}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-md shadow-teal-500/20 transition-all shrink-0 disabled:opacity-50"
              >
                {isSearchingLive ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                <span>{isSearchingLive ? 'Searching...' : 'Search Jobs'}</span>
              </button>
            </div>

            <button
              onClick={() => handleLiveWebSearch('')}
              disabled={isSearchingLive}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-slate-950 font-extrabold text-xs shadow-md shadow-teal-500/20 transition-all disabled:opacity-50"
            >
              {isSearchingLive ? <Loader2 className="w-4 h-4 animate-spin" /> : <Compass className="w-4 h-4" />}
              <span>{isSearchingLive ? 'Scraping Live Web Job Boards...' : 'Find Active Jobs for My Resume'}</span>
            </button>
          </div>

          <div className="bg-[#0f172a]/90 border border-slate-800 p-4 rounded-2xl space-y-3 shadow-xl">
            <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 text-xs">
              {['All', 'Direct Fit', 'High Transferable Potential', 'Stretch Target'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/60">
              <span className="text-slate-400 flex items-center gap-1">
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                <span>Min Match Score:</span>
                <strong className="text-teal-400 font-mono">{minMatchScore}%</strong>
              </span>

              <input
                type="range"
                min="50"
                max="95"
                step="5"
                value={minMatchScore}
                onChange={(e) => setMinMatchScore(Number(e.target.value))}
                className="w-32 accent-teal-500 cursor-pointer"
              />
            </div>
          </div>

          {filteredMatches.length > 0 ? (
            <div className="space-y-4">
              {filteredMatches.map((match) => (
                <JobCard
                  key={match.id}
                  match={match}
                  onOpenDetail={(m) => setSelectedDetailMatch(m)}
                  onOpenTailor={(m) => setSelectedTailorMatch(m)}
                />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center bg-[#0f172a]/40 border border-dashed border-slate-800 rounded-2xl space-y-4">
              <Briefcase className="w-10 h-10 text-slate-600 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-300">No jobs matching your filters</h3>
                <p className="text-xs text-slate-500">Click "Find Active Jobs for My Resume" above.</p>
              </div>
              <button
                onClick={() => handleLiveWebSearch('')}
                className="px-4 py-2 rounded-xl bg-teal-500/10 text-teal-300 border border-teal-500/30 text-xs font-bold hover:bg-teal-500/20 transition-all"
              >
                Find Active Jobs for My Resume
              </button>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: AI Career Intelligence & Alerts */}
        <div className="lg:col-span-3 space-y-5">
          
          <div className="bg-[#0f172a]/90 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              AI Match Intelligence
            </h4>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
                <span className="text-slate-400">Total Evaluated</span>
                <span className="font-mono font-bold text-white text-base">{totalCount}</span>
              </div>

              <div className="bg-teal-500/10 border border-teal-500/30 p-3 rounded-xl flex items-center justify-between">
                <span className="text-teal-300">High Fits (80%+)</span>
                <span className="font-mono font-bold text-teal-400 text-base">{highTransferableCount}</span>
              </div>

              <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-xl flex items-center justify-between">
                <span className="text-emerald-300">Direct Fits</span>
                <span className="font-mono font-bold text-emerald-400 text-base">{directFitCount}</span>
              </div>
            </div>
          </div>

          <div className="bg-[#0f172a]/90 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-teal-400" />
              Popular Job Portals
            </h4>
            <p className="text-[11px] text-slate-400">Scrape live job feeds on demand:</p>

            <div className="space-y-2">
              {[
                { label: 'LinkedIn Jobs', term: 'Chief of Staff' },
                { label: 'Naukri Stream', term: 'Operations Manager' },
                { label: 'Indeed Corporate', term: 'Product Operations' },
              ].map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setLiveSearchQuery(p.term);
                    handleLiveWebSearch(p.term);
                  }}
                  className="w-full text-left p-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-teal-500/40 text-xs text-slate-300 transition-all flex items-center justify-between"
                >
                  <span className="font-semibold">{p.label}</span>
                  <span className="text-[10px] text-teal-400 font-mono">+ Scrape</span>
                </button>
              ))}
            </div>
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-[#0b1329] py-6 text-center text-xs text-slate-500 mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 LINKEDAI — Passive Candidate Job Board & Matcher. Built with Next.js, Supabase, and Gemini AI.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-400 cursor-pointer" onClick={() => setIsProfileOpen(true)}>My Resume</span>
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <ProfileManager
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        candidate={candidate}
        onProfileUpdated={(newProf) => setCandidate(newProf)}
        defaultTab="upload"
      />

      <MatchDetailModal
        match={selectedDetailMatch}
        onClose={() => setSelectedDetailMatch(null)}
        onOpenTailor={(m) => setSelectedTailorMatch(m)}
      />

      <ResumeTailorDrawer
        isOpen={Boolean(selectedTailorMatch)}
        onClose={() => setSelectedTailorMatch(null)}
        match={selectedTailorMatch}
      />

    </div>
  );
}
