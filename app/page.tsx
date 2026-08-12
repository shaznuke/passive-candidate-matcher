'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from '@/components/Navbar';
import { ProfileManager } from '@/components/ProfileManager';
import { JobCard } from '@/components/JobCard';
import { MatchDetailModal } from '@/components/MatchDetailModal';
import { ResumeTailorDrawer } from '@/components/ResumeTailorDrawer';
import { IngestSimulatorModal } from '@/components/IngestSimulatorModal';
import { CandidateProfile, JobMatch } from '@/lib/types';
import { DEFAULT_MOCK_PROFILE, MOCK_JOB_MATCHES } from '@/lib/mockData';
import { fetchAllMatches, fetchCurrentCandidate } from '@/lib/supabase';
import { Sparkles, Search, SlidersHorizontal, Bell, Briefcase, Globe, Loader2, Upload, Compass } from 'lucide-react';

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
  const [isIngestOpen, setIsIngestOpen] = useState(false);
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

  const handleJobIngested = (newMatch: JobMatch) => {
    setMatches((prev) => {
      const exists = prev.some((m) => m.id === newMatch.id || m.job_id === newMatch.job_id);
      if (exists) {
        return prev.map((m) => (m.id === newMatch.id || m.job_id === newMatch.job_id ? newMatch : m));
      }
      return [newMatch, ...prev];
    });
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
    <div className="min-h-screen flex flex-col bg-[#090D16] text-slate-100">
      
      {/* Top Navigation */}
      <Navbar
        candidate={candidate}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenIngestSimulator={() => setIsIngestOpen(true)}
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

      {/* Hero Section */}
      <div className="border-b border-slate-800/60 bg-gradient-to-b from-slate-950 to-[#090D16] py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="bg-teal-500/10 text-teal-400 border border-teal-500/20 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  AI Transferable Skill Matcher
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Passive Candidate Job Board
              </h2>
              <p className="text-sm text-slate-400 max-w-2xl">
                Upload your resume to automatically scrape and match active job postings across LinkedIn, Naukri, Indeed, and enterprise job boards.
              </p>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-3 shrink-0">
              <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl text-center">
                <span className="text-2xl font-extrabold text-white font-mono">{totalCount}</span>
                <span className="text-[10px] text-slate-400 block uppercase font-bold mt-0.5">Total Jobs</span>
              </div>

              <div className="bg-teal-500/10 border border-teal-500/30 p-3.5 rounded-xl text-center">
                <span className="text-2xl font-extrabold text-teal-400 font-mono">{highTransferableCount}</span>
                <span className="text-[10px] text-teal-300 block uppercase font-bold mt-0.5">High Matches (80%+)</span>
              </div>

              <div className="bg-emerald-500/10 border border-emerald-500/30 p-3.5 rounded-xl text-center">
                <span className="text-2xl font-extrabold text-emerald-400 font-mono">{directFitCount}</span>
                <span className="text-[10px] text-emerald-300 block uppercase font-bold mt-0.5">Direct Fits</span>
              </div>
            </div>

          </div>

          {/* Active Candidate Headline + Auto Scrape Button */}
          <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-xl flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400 font-bold text-xs">
                Active Resume
              </div>
              <div>
                <p className="text-sm font-bold text-slate-200">{candidate.name} — <span className="text-teal-400">{candidate.title}</span></p>
                <p className="text-xs text-slate-400 line-clamp-1">{candidate.transferable_skills.join(' • ')}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleLiveWebSearch('')}
                disabled={isSearchingLive}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 text-xs font-extrabold shadow-md shadow-teal-500/20 transition-all disabled:opacity-50"
              >
                {isSearchingLive ? <Loader2 className="w-4 h-4 animate-spin" /> : <Compass className="w-4 h-4" />}
                <span>{isSearchingLive ? 'Scraping LinkedIn/Naukri/Indeed...' : 'Find Active Jobs for My Resume'}</span>
              </button>

              <button
                onClick={() => setIsProfileOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
              >
                <Upload className="w-3.5 h-3.5 text-teal-400" />
                <span>Upload Resume (.docx / .pdf)</span>
              </button>
            </div>
          </div>

          {/* Live Web Job Search Bar */}
          <div className="bg-gradient-to-r from-teal-950/40 via-slate-900/80 to-slate-950 border border-teal-500/30 p-4 rounded-2xl space-y-3">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-teal-400" />
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Live Web Job Scraper (LinkedIn, Naukri, Indeed)
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Scrape live job portals & calculate AI match scores against your resume</p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={liveSearchQuery}
                onChange={(e) => setLiveSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLiveWebSearch()}
                placeholder="Type role to search online (e.g. Chief of Staff, Operations Lead, Product Ops)..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-teal-400 font-medium"
              />
              <button
                onClick={() => handleLiveWebSearch()}
                disabled={isSearchingLive}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/20 transition-all shrink-0 disabled:opacity-50"
              >
                {isSearchingLive ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                <span>{isSearchingLive ? 'Scraping Live Web...' : 'Search Jobs Now'}</span>
              </button>
            </div>

            {/* Quick Search Chips */}
            <div className="flex items-center gap-2 flex-wrap text-xs pt-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Popular Portals:</span>
              {['LinkedIn - Chief of Staff', 'Naukri - Operations Lead', 'Indeed - Product Operations', 'Glassdoor - Strategic Projects'].map((chip) => {
                const keyword = chip.split(' - ')[1] || chip;
                return (
                  <button
                    key={chip}
                    onClick={() => {
                      setLiveSearchQuery(keyword);
                      handleLiveWebSearch(keyword);
                    }}
                    className="bg-slate-900 hover:bg-slate-800 border border-slate-700/60 text-slate-300 text-[11px] px-2.5 py-1 rounded-lg font-medium transition-colors"
                  >
                    + {chip}
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      {/* Main Dashboard Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        
        {/* Search & Filter Controls */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
          
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by title or company..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 text-xs">
            {['All', 'Direct Fit', 'High Transferable Potential', 'Stretch Target'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-teal-500 text-slate-950 font-bold shadow-md shadow-teal-500/20'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Score Threshold Slider */}
          <div className="flex items-center gap-3 text-xs w-full md:w-auto justify-end">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-slate-400 whitespace-nowrap">Min Match Score: <strong className="text-teal-400 font-mono">{minMatchScore}%</strong></span>
            <input
              type="range"
              min="50"
              max="95"
              step="5"
              value={minMatchScore}
              onChange={(e) => setMinMatchScore(Number(e.target.value))}
              className="w-24 accent-teal-500 cursor-pointer"
            />
          </div>

        </div>

        {/* Job Match Grid */}
        {filteredMatches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          <div className="py-16 text-center bg-slate-900/30 border border-dashed border-slate-800 rounded-2xl space-y-4">
            <Briefcase className="w-10 h-10 text-slate-600 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-300">No jobs matching your filters</h3>
              <p className="text-xs text-slate-500">Try searching for a role above or click "Find Active Jobs for My Resume".</p>
            </div>
            <button
              onClick={() => handleLiveWebSearch('')}
              className="px-4 py-2 rounded-xl bg-teal-500/10 text-teal-300 border border-teal-500/30 text-xs font-bold hover:bg-teal-500/20 transition-all"
            >
              Find Active Jobs for My Resume
            </button>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 Passive Candidate Job Board & Matcher. Built with Next.js, Supabase, and Gemini AI.</p>
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

      <IngestSimulatorModal
        isOpen={isIngestOpen}
        onClose={() => setIsIngestOpen(false)}
        onJobIngested={handleJobIngested}
      />

    </div>
  );
}
