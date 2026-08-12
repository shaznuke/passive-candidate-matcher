'use client';

import React, { useState } from 'react';
import { X, PlusCircle, CheckCircle2, AlertTriangle, Code, Play, FileText } from 'lucide-react';
import { JobMatch } from '@/lib/types';

interface IngestSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJobIngested: (newMatch: JobMatch) => void;
}

const PRESET_SAMPLE_JOBS = [
  {
    name: 'Chief of Staff (High Strategic Fit)',
    job: {
      title: 'Chief of Staff to CEO',
      company: 'Quantum Scale AI',
      location: 'San Francisco, CA / Remote',
      salary_range: '$200,000 - $250,000 + Equity',
      job_type: 'Full-time',
      source: 'Greenhouse',
      external_id: 'gh-qs-99120',
      description: `Partner directly with CEO to drive strategic execution, cross-functional OKR alignment, and high-impact operational transformations. Lead company-wide QBR cadences and resolve complex organizational bottlenecks.`
    }
  },
  {
    name: 'VP of Special Operations (Direct Operations Fit)',
    job: {
      title: 'VP of Special Operations',
      company: 'Aether Logistics Tech',
      location: 'New York, NY / Remote',
      salary_range: '$220,000 - $270,000',
      job_type: 'Full-time',
      source: 'Lever',
      external_id: 'lev-ae-4401',
      description: `Lead rapid-deployment operational teams managing crisis response, global vendor SLAs, and $15M+ operational budgets. Standardize playbooks across global distribution nodes.`
    }
  },
  {
    name: 'Director of Product Strategy (Growth Role)',
    job: {
      title: 'Director of Product Strategy',
      company: 'MetaVerse Core',
      location: 'Austin, TX',
      salary_range: '$175,000 - $210,000',
      job_type: 'Full-time',
      source: 'LinkedIn',
      external_id: 'li-mv-1029',
      description: `Drive multi-year product roadmap vision, developer ecosystem monetization, and strategic API integrations. Requires deep developer relations and technical SDK background.`
    }
  }
];

export const IngestSimulatorModal: React.FC<IngestSimulatorModalProps> = ({
  isOpen,
  onClose,
  onJobIngested,
}) => {
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [customText, setCustomText] = useState('');
  const [useCustom, setUseCustom] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultMessage, setResultMessage] = useState<any>(null);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleIngest = async () => {
    setIsSubmitting(true);
    setError('');
    setResultMessage(null);

    let payload;
    if (useCustom) {
      if (!customText || customText.trim().length < 20) {
        setError('Please paste at least 20 characters of job description text.');
        setIsSubmitting(false);
        return;
      }
      payload = {
        title: 'Custom Added Job',
        company: 'Target Company',
        location: 'Remote / Flexible',
        salary_range: 'Competitive',
        description: customText.trim(),
        source: 'manual_input'
      };
    } else {
      payload = PRESET_SAMPLE_JOBS[selectedPreset].job;
    }

    try {
      const res = await fetch('/api/jobs/ingest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-ingest-secret': 'my-super-secret-ingest-token-123'
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add job');

      setResultMessage(data);
      if (data.results && data.results.length > 0) {
        const latestMatch = data.results[0].match;
        onJobIngested(latestMatch);
      }
    } catch (err: any) {
      setError(err.message || 'Error adding job');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl w-full max-w-2xl flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Add a Job to Match</h2>
              <p className="text-xs text-slate-400">Select a sample job posting or paste your own job description to score with AI</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          
          {/* Preset Buttons */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Choose Sample Role</label>
            <div className="grid grid-cols-1 gap-2">
              {PRESET_SAMPLE_JOBS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedPreset(idx);
                    setUseCustom(false);
                  }}
                  className={`p-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                    !useCustom && selectedPreset === idx
                      ? 'bg-teal-500/10 border-teal-500 text-teal-300 shadow-md'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <p className="font-bold">{preset.name}</p>
                    <p className="text-[11px] text-slate-400">{preset.job.company} • {preset.job.title}</p>
                  </div>
                  {!useCustom && selectedPreset === idx && (
                    <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Text Toggle */}
          <div className="space-y-2">
            <button
              onClick={() => setUseCustom(!useCustom)}
              className="text-xs text-teal-400 hover:underline font-semibold flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{useCustom ? '← Back to Sample Roles' : 'Or Paste Custom Job Description Text'}</span>
            </button>

            {useCustom && (
              <textarea
                rows={6}
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="Paste any job title or description here to score against your resume..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 font-sans focus:outline-none focus:border-teal-500"
              />
            )}
          </div>

          {error && (
            <div className="p-3 bg-rose-950/40 border border-rose-800 text-rose-300 text-xs rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {resultMessage && (
            <div className="p-4 bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs rounded-xl space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>Job Added & Evaluated!</span>
              </div>
              <p>AI Match Score: <span className="font-mono font-bold text-white">{resultMessage.results[0]?.match?.match_score}%</span> ({resultMessage.results[0]?.match?.match_category})</p>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200"
          >
            Close
          </button>
          <button
            onClick={handleIngest}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/20 transition-all disabled:opacity-50"
          >
            <Play className={`w-4 h-4 ${isSubmitting ? 'animate-spin' : ''}`} />
            <span>{isSubmitting ? 'Evaluating Fit with AI...' : 'Add Job & Calculate Match Score'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
