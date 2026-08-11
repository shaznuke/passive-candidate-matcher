'use client';

import React from 'react';
import { X, Sparkles, CheckCircle2, ArrowRight, Building2, MapPin, DollarSign, FileEdit, ExternalLink, ShieldCheck } from 'lucide-react';
import { JobMatch } from '@/lib/types';

interface MatchDetailModalProps {
  match: JobMatch | null;
  onClose: () => void;
  onOpenTailor: (match: JobMatch) => void;
}

export const MatchDetailModal: React.FC<MatchDetailModalProps> = ({
  match,
  onClose,
  onOpenTailor,
}) => {
  if (!match || !match.job) return null;

  const job = match.job;
  const score = match.match_score;
  const category = match.match_category;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/30 flex flex-col items-center justify-center font-mono">
              <span className="text-lg font-bold text-teal-400 leading-none">{score}%</span>
              <span className="text-[8px] text-teal-300 font-sans uppercase">Score</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  {category}
                </span>
                <span className="text-xs text-slate-400 font-mono">{job.company}</span>
              </div>
              <h2 className="text-xl font-bold text-white mt-0.5">{job.title}</h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Scroll Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* Metadata Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Building2 className="w-4 h-4 text-teal-400" />
              <div>
                <span className="text-[10px] text-slate-400 block">Company</span>
                <span className="font-semibold">{job.company}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <MapPin className="w-4 h-4 text-teal-400" />
              <div>
                <span className="text-[10px] text-slate-400 block">Location</span>
                <span className="font-semibold">{job.location}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <DollarSign className="w-4 h-4 text-teal-400" />
              <div>
                <span className="text-[10px] text-slate-400 block">Salary Range</span>
                <span className="font-semibold">{job.salary_range}</span>
              </div>
            </div>
          </div>

          {/* Gemini Fit Rationale */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-teal-400 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Why It Fits (Transferable Skill Rationale)
            </h3>
            <div className="space-y-2">
              {match.fit_reasons.map((reason, idx) => (
                <div key={idx} className="flex items-start gap-3 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/80 text-xs text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">{reason}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Transferable Skills Mapping Table */}
          {match.transferable_skills_mapping && match.transferable_skills_mapping.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-400" />
                Transferable Skill Mapping Matrix
              </h3>
              <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950/40">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 font-semibold">
                    <tr>
                      <th className="p-3">Job Requirement</th>
                      <th className="p-3">Transferable Skill Possessed</th>
                      <th className="p-3">Alignment Rationale</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {match.transferable_skills_mapping.map((ts, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                        <td className="p-3 font-semibold text-white">{ts.skillRequested}</td>
                        <td className="p-3 font-mono text-teal-300">{ts.transferableSkillPossessed}</td>
                        <td className="p-3 text-slate-400 leading-relaxed">{ts.alignmentReason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Original Job Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Raw Job Description</h3>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 whitespace-pre-wrap font-sans leading-relaxed max-h-60 overflow-y-auto">
              {job.description}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between">
          {job.raw_url ? (
            <a
              href={job.raw_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
            >
              <span>View Job URL</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                onOpenTailor(match);
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/20 transition-all"
            >
              <FileEdit className="w-4 h-4" />
              <span>Tailor Resume for this Job</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
