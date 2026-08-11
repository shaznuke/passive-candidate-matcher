'use client';

import React, { useState, useEffect } from 'react';
import { X, Sparkles, Copy, Download, Check, FileText, ArrowRight, ShieldAlert, RefreshCw } from 'lucide-react';
import { JobMatch, TailoredResume } from '@/lib/types';

interface ResumeTailorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  match: JobMatch | null;
}

export const ResumeTailorDrawer: React.FC<ResumeTailorDrawerProps> = ({
  isOpen,
  onClose,
  match,
}) => {
  const [tailoredData, setTailoredData] = useState<TailoredResume | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'bullets' | 'full'>('bullets');

  useEffect(() => {
    if (isOpen && match) {
      if (match.tailored_resume_cache) {
        setTailoredData(match.tailored_resume_cache);
      } else {
        generateTailoredResume();
      }
    }
  }, [isOpen, match]);

  if (!isOpen || !match || !match.job) return null;

  const job = match.job;

  const generateTailoredResume = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('/api/jobs/tailor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId: match.id, jobId: job.id }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to tailor resume');

      setTailoredData(data.tailoredResume);
    } catch (err: any) {
      setError(err.message || 'Error generating tailored resume');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyMarkdown = () => {
    if (!tailoredData) return;
    navigator.clipboard.writeText(tailoredData.full_tailored_markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadText = () => {
    if (!tailoredData) return;
    const blob = new Blob([tailoredData.full_tailored_markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Tailored_Resume_${job.company.replace(/\s+/g, '_')}_${job.title.replace(/\s+/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-sm animate-fade-in flex justify-end">
      <div className="bg-[#0f172a] border-l border-slate-800 w-full max-w-2xl h-full flex flex-col shadow-2xl">
        
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400 bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 rounded">
                  Gemini Tailor Engine
                </span>
              </div>
              <h2 className="text-base font-bold text-white mt-0.5">
                Tailored Resume for {job.title}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-6 pt-3 gap-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('bullets')}
            className={`pb-3 border-b-2 transition-all ${
              activeTab === 'bullets'
                ? 'border-teal-400 text-teal-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Bullet-by-Bullet Comparison
          </button>
          <button
            onClick={() => setActiveTab('full')}
            className={`pb-3 border-b-2 transition-all ${
              activeTab === 'full'
                ? 'border-teal-400 text-teal-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Full Tailored Resume (Markdown)
          </button>
        </div>

        {/* Drawer Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {isLoading ? (
            <div className="h-64 flex flex-col items-center justify-center space-y-3">
              <RefreshCw className="w-8 h-8 text-teal-400 animate-spin" />
              <p className="text-xs text-slate-300 font-medium">Reframing bullet points for {job.title} with Gemini API...</p>
              <p className="text-[11px] text-slate-500">Strictly truth-bound. Emphasizing transferable impact metrics.</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-rose-950/40 border border-rose-800 text-rose-300 text-xs rounded-xl space-y-2">
              <p className="font-semibold">Error generating tailored resume:</p>
              <p>{error}</p>
              <button
                onClick={generateTailoredResume}
                className="px-3 py-1.5 bg-rose-900 hover:bg-rose-800 text-white rounded-lg font-medium text-xs mt-2"
              >
                Retry
              </button>
            </div>
          ) : tailoredData ? (
            activeTab === 'bullets' ? (
              <div className="space-y-6">
                
                {/* Executive Summary */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-2">
                  <h3 className="text-xs font-bold text-teal-400 uppercase tracking-wider">
                    Targeted Executive Summary
                  </h3>
                  <p className="text-xs text-slate-200 leading-relaxed italic">
                    "{tailoredData.executive_summary}"
                  </p>
                </div>

                {/* Highlighted Skills */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Role-Specific Skills Highlighted
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {tailoredData.highlighted_skills.map((skill, idx) => (
                      <span key={idx} className="bg-teal-500/10 text-teal-300 border border-teal-500/20 text-xs px-2 py-0.5 rounded font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bullet Reframing Comparisons */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Bullet Point Reframing (Before vs After)
                  </h3>

                  {tailoredData.tailored_bullets.map((bullet, idx) => (
                    <div key={idx} className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 space-y-3">
                      
                      {/* Original */}
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-bold text-slate-500">Original Resume Bullet</span>
                        <p className="text-xs text-slate-400 line-through decoration-slate-600 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/40">
                          {bullet.original}
                        </p>
                      </div>

                      {/* Tailored */}
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-bold text-teal-400 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          Tailored Bullet Point
                        </span>
                        <p className="text-xs text-teal-200 font-semibold bg-teal-500/10 p-2.5 rounded-lg border border-teal-500/30 leading-relaxed">
                          {bullet.tailored}
                        </p>
                      </div>

                      {/* Rationale */}
                      <div className="text-[11px] text-slate-400 bg-slate-950/60 p-2 rounded-md italic border-l-2 border-teal-500">
                        <span className="font-semibold text-slate-300">Why this was changed: </span>
                        {bullet.rationale}
                      </div>

                    </div>
                  ))}
                </div>

              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Complete Tailored Resume (Markdown)
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyMarkdown}
                      className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied!' : 'Copy'}</span>
                    </button>
                    <button
                      onClick={handleDownloadText}
                      className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-teal-500/20 text-teal-300 hover:bg-teal-500/30 border border-teal-500/30 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download .md</span>
                    </button>
                  </div>
                </div>

                <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed max-h-[500px] overflow-y-auto">
                  {tailoredData.full_tailored_markdown}
                </pre>
              </div>
            )
          ) : null}
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <button
            onClick={handleCopyMarkdown}
            disabled={!tailoredData}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors disabled:opacity-50"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied to Clipboard' : 'Copy Resume Markdown'}</span>
          </button>

          <button
            onClick={handleDownloadText}
            disabled={!tailoredData}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/20 transition-all disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>Download Tailored Resume</span>
          </button>
        </div>

      </div>
    </div>
  );
};
