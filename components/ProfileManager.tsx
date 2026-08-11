'use client';

import React, { useState } from 'react';
import { X, Upload, Sparkles, FileText, CheckCircle2, RotateCcw, ShieldCheck, Briefcase } from 'lucide-react';
import { CandidateProfile } from '@/lib/types';
import { DEFAULT_MOCK_PROFILE } from '@/lib/mockData';

interface ProfileManagerProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: CandidateProfile;
  onProfileUpdated: (newProfile: CandidateProfile) => void;
}

export const ProfileManager: React.FC<ProfileManagerProps> = ({
  isOpen,
  onClose,
  candidate,
  onProfileUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<'view' | 'upload'>('view');
  const [rawResumeText, setRawResumeText] = useState(candidate.raw_resume_text || '');
  const [isParsing, setIsParsing] = useState(false);
  const [parseSuccess, setParseSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleParseSubmit = async () => {
    if (!rawResumeText || rawResumeText.trim().length < 20) {
      setErrorMessage('Please paste at least 20 characters of resume text or Markdown.');
      return;
    }

    setIsParsing(true);
    setErrorMessage('');
    setParseSuccess(false);

    try {
      const res = await fetch('/api/candidate/parse-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText: rawResumeText }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to parse resume');

      onProfileUpdated(data.candidate);
      setParseSuccess(true);
      setTimeout(() => {
        setActiveTab('view');
        setParseSuccess(false);
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error processing resume parser');
    } finally {
      setIsParsing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setRawResumeText(content);
    };
    reader.readAsText(file);
  };

  const handleResetToDefault = () => {
    onProfileUpdated(DEFAULT_MOCK_PROFILE);
    setRawResumeText(DEFAULT_MOCK_PROFILE.raw_resume_text);
    setActiveTab('view');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Passive Candidate Profile</h2>
              <p className="text-xs text-slate-400">Manage structured profile & Gemini transferable skills</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-6 pt-3 gap-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('view')}
            className={`pb-3 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'view'
                ? 'border-teal-400 text-teal-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Structured Profile
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`pb-3 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'upload'
                ? 'border-teal-400 text-teal-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-4 h-4" />
            Upload / Parse Resume (Gemini)
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'view' ? (
            <div className="space-y-6">
              
              {/* Header Details */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white">{candidate.name}</h3>
                    <p className="text-sm text-teal-400 font-medium">{candidate.title}</p>
                  </div>
                  <button
                    onClick={handleResetToDefault}
                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-teal-400 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 transition-all"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset to Mock
                  </button>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed italic border-l-2 border-teal-500 pl-3 py-1 bg-slate-950/40 rounded-r-lg">
                  "{candidate.summary}"
                </p>
              </div>

              {/* Transferable Skills Highlight */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-teal-400 mb-2 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  Identified Transferable Competency Mappings
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {candidate.transferable_skills.map((ts, idx) => (
                    <div key={idx} className="bg-slate-900/60 border border-slate-800/80 rounded-lg p-3 text-xs text-slate-200 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-teal-400" />
                      <span>{ts}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Core Skills */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Core Competencies</h4>
                <div className="flex flex-wrap gap-1.5">
                  {candidate.core_skills.map((skill, idx) => (
                    <span key={idx} className="bg-teal-500/10 text-teal-300 border border-teal-500/20 text-xs px-2.5 py-1 rounded-md font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Leadership Highlights */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Leadership Highlights</h4>
                <ul className="space-y-2 text-xs text-slate-300">
                  {candidate.leadership_experience.map((exp, idx) => (
                    <li key={idx} className="flex items-start gap-2 bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/60">
                      <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                      <span>{exp}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          ) : (
            <div className="space-y-5">
              
              {/* File upload prompt */}
              <div className="border-2 border-dashed border-slate-700 hover:border-teal-500/50 rounded-xl p-6 text-center transition-colors bg-slate-900/40">
                <Upload className="w-8 h-8 text-teal-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-200">Upload Resume File (.txt / .md)</p>
                <p className="text-xs text-slate-400 mt-1">Or paste structured text / markdown directly below</p>
                <input
                  type="file"
                  accept=".txt,.md,.markdown,.doc,.docx"
                  onChange={handleFileUpload}
                  className="mt-3 text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-teal-500/10 file:text-teal-400 hover:file:bg-teal-500/20 cursor-pointer mx-auto"
                />
              </div>

              {/* Raw Textarea */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Resume Text Payload</span>
                  <span className="text-[10px] text-slate-400 font-mono">{rawResumeText.length} chars</span>
                </label>
                <textarea
                  rows={8}
                  value={rawResumeText}
                  onChange={(e) => setRawResumeText(e.target.value)}
                  placeholder="Paste candidate resume text or markdown here..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 font-mono focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                />
              </div>

              {errorMessage && (
                <p className="text-xs text-rose-400 bg-rose-950/40 border border-rose-800/50 p-2.5 rounded-lg">
                  {errorMessage}
                </p>
              )}

              {parseSuccess && (
                <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 p-2.5 rounded-lg">
                  <CheckCircle2 className="w-4 h-4" />
                  Successfully parsed resume with Gemini API! Updating profile...
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setActiveTab('view')}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleParseSubmit}
                  disabled={isParsing}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/20 transition-all disabled:opacity-50"
                >
                  <Sparkles className={`w-4 h-4 ${isParsing ? 'animate-spin' : ''}`} />
                  {isParsing ? 'Parsing with Gemini API...' : 'Parse Resume & Update Profile'}
                </button>
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
};
