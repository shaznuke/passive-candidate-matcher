'use client';

import React from 'react';
import { ExternalLink, Sparkles, FileEdit, ArrowRight, Building2, MapPin, DollarSign, CheckCircle2, Bookmark, Share2 } from 'lucide-react';
import { JobMatch } from '@/lib/types';

interface JobCardProps {
  match: JobMatch;
  onOpenDetail: (match: JobMatch) => void;
  onOpenTailor: (match: JobMatch) => void;
}

export const JobCard: React.FC<JobCardProps> = ({
  match,
  onOpenDetail,
  onOpenTailor,
}) => {
  const job = match.job;
  if (!job) return null;

  const score = match.match_score;
  const category = match.match_category;

  const scoreColor =
    score >= 85
      ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10 shadow-emerald-500/20'
      : score >= 75
      ? 'border-cyan-500 text-cyan-400 bg-cyan-500/10 shadow-cyan-500/20'
      : 'border-amber-500 text-amber-400 bg-amber-500/10 shadow-amber-500/20';

  const categoryBadge =
    category === 'Direct Fit'
      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
      : category === 'High Transferable Potential'
      ? 'bg-teal-500/15 text-teal-300 border-teal-500/30'
      : 'bg-amber-500/15 text-amber-300 border-amber-500/30';

  const initials = job.company
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="bg-[#0f172a]/90 border border-slate-800 rounded-2xl p-5 hover:border-teal-500/40 transition-all duration-200 shadow-xl flex flex-col justify-between space-y-4 group">
      
      {/* Top Header: Company Avatar & Metadata */}
      <div className="flex items-start justify-between gap-3">
        
        <div className="flex items-start gap-3.5">
          {/* Company Logo Initials Avatar */}
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-slate-800 to-slate-900 border border-slate-700/80 flex items-center justify-center font-bold text-sm text-teal-400 shrink-0 shadow-md">
            {initials || 'CO'}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-xs text-slate-200">{job.company}</span>
              <span className="text-[10px] text-slate-400 font-mono">via {job.source || 'LinkedIn'}</span>
            </div>

            <h3 className="text-base font-extrabold text-white group-hover:text-teal-300 transition-colors leading-snug">
              {job.title}
            </h3>

            <div className="flex items-center gap-3 text-xs text-slate-400 pt-0.5 flex-wrap">
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-500" />
                <span>{job.location}</span>
              </div>
              <div className="flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-slate-500" />
                <span>{job.salary_range}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quantitative Match Score Ring */}
        <div className={`w-14 h-14 rounded-2xl border-2 flex flex-col items-center justify-center shrink-0 shadow-lg ${scoreColor}`}>
          <span className="text-lg font-extrabold font-mono leading-none">{score}%</span>
          <span className="text-[8px] uppercase font-bold tracking-wider mt-0.5 opacity-80">Match</span>
        </div>

      </div>

      {/* Category Pill */}
      <div>
        <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${categoryBadge}`}>
          {category}
        </span>
      </div>

      {/* AI Transferable Rationale Box */}
      <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5 space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            AI Transferable Skill Rationale
          </span>
        </div>

        <ul className="space-y-1.5 text-slate-300">
          {match.fit_reasons.slice(0, 2).map((reason, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
              <span className="line-clamp-2 leading-relaxed">{reason}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* LinkedIn-style Action Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 gap-2">
        <button
          onClick={() => onOpenDetail(match)}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-teal-400 transition-colors"
        >
          <span>Why You Fit</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-center gap-2">
          {job.raw_url && job.raw_url !== '#' && (
            <a
              href={job.raw_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-all flex items-center gap-1 text-xs"
              title="Apply on Job Portal"
            >
              <span>Apply</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}

          <button
            onClick={() => onOpenTailor(match)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-bold transition-all shadow-sm"
          >
            <FileEdit className="w-3.5 h-3.5" />
            <span>Tailor My Resume</span>
          </button>
        </div>
      </div>

    </div>
  );
};
