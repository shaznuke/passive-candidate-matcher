'use client';

import React, { useState } from 'react';
import { X, Upload, Sparkles, CheckCircle2, RotateCcw, ShieldCheck, Briefcase, FileCheck, FileText } from 'lucide-react';
import { CandidateProfile } from '@/lib/types';
import { DEFAULT_MOCK_PROFILE } from '@/lib/mockData';

interface ProfileManagerProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: CandidateProfile;
  onProfileUpdated: (newProfile: CandidateProfile) => void;
  defaultTab?: 'upload' | 'view';
}

export const ProfileManager: React.FC<ProfileManagerProps> = ({
  isOpen,
  onClose,
  candidate,
  onProfileUpdated,
  defaultTab = 'upload',
}) => {
  const [activeTab, setActiveTab] = useState<'view' | 'upload'>(defaultTab);
  const [rawResumeText, setRawResumeText] = useState(candidate.raw_resume_text || '');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parseSuccess, setParseSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleParseSubmit = async () => {
    if (!selectedFile && (!rawResumeText || rawResumeText.trim().length < 20)) {
      setErrorMessage('Please choose a Word document (.docx/.doc), PDF, or paste resume text.');
      return;
    }

    setIsParsing(true);
    setErrorMessage('');
    setParseSuccess(false);

    try {
      let res;
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        res = await fetch('/api/candidate/parse-resume', {
          method: 'POST',
          body: formData,
        });
      } else {
        res = await fetch('/api/candidate/parse-resume', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resumeText: rawResumeText }),
        });
      }

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

    setSelectedFile(file);
    const fileName = file.name.toLowerCase();

    if (!fileName.endsWith('.pdf') && !fileName.endsWith('.docx') && !fileName.endsWith('.doc')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setRawResumeText(content);
      };
      reader.readAsText(file);
    }
  };

  const handleResetToDefault = () => {
    onProfileUpdated(DEFAULT_MOCK_PROFILE);
    setRawResumeText(DEFAULT_MOCK_PROFILE.raw_resume_text);
    setSelectedFile(null);
    setActiveTab('upload');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Upload Your Resume</h2>
              <p className="text-xs text-slate-400">Supports Microsoft Word (.docx / .doc), PDF (.pdf), and Text files</p>
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
            onClick={() => setActiveTab('upload')}
            className={`pb-3 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'upload'
                ? 'border-teal-400 text-teal-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-4 h-4" />
            Upload File (Word / PDF / Text)
          </button>
          <button
            onClick={() => setActiveTab('view')}
            className={`pb-3 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'view'
                ? 'border-teal-400 text-teal-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Current Profile View
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'upload' ? (
            <div className="space-y-5">
              
              {/* Big File Upload Dropzone */}
              <div className="border-2 border-dashed border-teal-500/40 hover:border-teal-400 rounded-2xl p-8 text-center transition-all bg-gradient-to-b from-teal-950/20 to-slate-900/60 shadow-lg">
                <div className="w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center mx-auto mb-3 text-teal-400">
                  <FileCheck className="w-7 h-7" />
                </div>
                
                <h3 className="text-base font-bold text-white mb-1">
                  Upload Word Document (.docx / .doc) or PDF (.pdf)
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Gemini AI will automatically extract your work experience, skills, and leadership competencies.
                </p>

                <div className="mt-4 flex justify-center">
                  <label className="cursor-pointer px-6 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/20 transition-all flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    <span>Choose Word (.docx) or PDF File</span>
                    <input
                      type="file"
                      accept=".docx,.doc,.pdf,.txt,.md,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword,application/pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {selectedFile && (
                  <div className="mt-4 p-3 bg-teal-500/15 border border-teal-500/30 rounded-xl text-xs text-teal-200 font-bold flex items-center justify-center gap-2 max-w-sm mx-auto">
                    <FileText className="w-4 h-4 text-teal-400 shrink-0" />
                    <span className="truncate">Selected File: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                  </div>
                )}
              </div>

              {/* Textarea Fallback */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Or Paste Resume Text</span>
                  <span className="text-[10px] text-slate-400 font-mono">{rawResumeText.length} chars</span>
                </label>
                <textarea
                  rows={5}
                  value={rawResumeText}
                  onChange={(e) => {
                    setRawResumeText(e.target.value);
                    setSelectedFile(null);
                  }}
                  placeholder="Paste candidate resume text or markdown here..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 font-sans focus:outline-none focus:border-teal-500"
                />
              </div>

              {errorMessage && (
                <p className="text-xs text-rose-400 bg-rose-950/40 border border-rose-800/50 p-3 rounded-xl font-medium">
                  {errorMessage}
                </p>
              )}

              {parseSuccess && (
                <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 p-3 rounded-xl font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  Successfully extracted document text with AI! Updating profile...
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleParseSubmit}
                  disabled={isParsing}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-teal-500/20 transition-all disabled:opacity-50"
                >
                  <Sparkles className={`w-4 h-4 ${isParsing ? 'animate-spin' : ''}`} />
                  <span>{isParsing ? 'Extracting & Parsing with AI...' : 'Parse Resume & Update Profile'}</span>
                </button>
              </div>

            </div>
          ) : (
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
                    Reset Profile
                  </button>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed italic border-l-2 border-teal-500 pl-3 py-1 bg-slate-950/40 rounded-r-lg">
                  "{candidate.summary}"
                </p>
              </div>

              {/* Transferable Skills */}
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

            </div>
          )}
        </div>

      </div>
    </div>
  );
};
