'use client';

import React from 'react';
import { ExternalLink, Sparkles, FileEdit, ArrowRight, Building2, MapPin, DollarSign, Clock, ShieldAlert, CheckCircle2 } from 'lucide-react';
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

  // Color mappings based on match category and score
  const scoreColor =
    score >= 85
      ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10 shadow-emerald-500/10'
      : score >= 75
      ? 'border-cyan-500 text-cyan-400 bg-cyan-500/10 shadow-cyan-500/10'
      : 'border-amber-500 text-amber-400 bg-amber-500/10 shadow-amber-500/10';

  const categoryBadge =
    category === 'Direct Fit'
      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
      : category === 'High Transferable Potential'
      ? 'bg-teal-500/15 text-teal-300 border-teal-500/30'
      : 'bg-amber-500/15 text-amber-300 border-amber-500/30';

  return (
    <div className="glass-panel glass-panel-hover rounded-2xl p-6 flex flex-col justify-between space-y-5 relative overflow-hidden group">
      
      {/* Top Header */}
      <div className="flex items-start justify-between gap-4">
        
        <div className="space-y-1 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${categoryBadge}`}>
              {category}
            </span>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
              {job.source || 'Scraper'}
            </span>
          </div>

          <h3 className="text-lg font-bold text-white group-hover:text-teal-300 transition-colors leading-snug">
            {job.title}
          </h3>

          <div className="flex items-center gap-4 text-xs text-slate-400 pt-1 flex-wrap">
            <div className="flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-semibold text-slate-300">{job.company}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span>{job.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-slate-500" />
              <span>{job.salary_range}</span>
            </div>
          </div>
        </div>

        {/* Quantitative Match Score Ring */}
        <div className={`w-16 h-16 rounded-2xl border-2 flex flex-col items-center justify-center shrink-0 shadow-lg ${scoreColor}`}>
          <span className="text-xl font-extrabold font-mono leading-none">{score}%</span>
          <span className="text-[9px] uppercase font-bold tracking-wider mt-0.5 opacity-80">Match</span>
        </div>

      </div>

      {/* Transferable Skill Rationale Summary */}
      <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Gemini Transferable Fit Analysis
          </span>
          <span className="text-[10px] text-slate-500">
            {match.transferable_skills_mapping?.length || 0} skills mapped
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

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 gap-2">
        <button
          onClick={() => onOpenDetail(match)}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-teal-400 transition-colors"
        >
          <span>Deep Fit Analysis</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-center gap-2">
          {job.raw_url && (
            <a
              href={job.raw_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-all"
              title="View Raw Job Post"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}

          <button
            onClick={() => onOpenTailor(match)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-bold transition-all shadow-sm"
          >
            <FileEdit className="w-3.5 h-3.5" />
            <span>Tailor Resume</span>
          </button>
        </div>
      </div>

    </div>
  );
};
