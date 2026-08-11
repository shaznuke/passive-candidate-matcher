export type MatchCategory = 'Direct Fit' | 'High Transferable Potential' | 'Stretch Target';
export type MatchStatus = 'new' | 'saved' | 'applied' | 'archived';

export interface TransferableSkillMap {
  skillRequested: string;
  transferableSkillPossessed: string;
  alignmentReason: string;
}

export interface CandidateProfile {
  id?: string;
  name: string;
  email?: string;
  title: string;
  summary: string;
  core_skills: string[];
  leadership_experience: string[];
  domain_expertise: string[];
  transferable_skills: string[];
  raw_resume_text: string;
  updated_at?: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary_range: string;
  job_type: string;
  description: string;
  raw_url: string;
  source: string;
  external_id?: string;
  created_at: string;
}

export interface JobMatch {
  id: string;
  job_id: string;
  candidate_id: string;
  match_score: number; // 0 - 100
  match_category: MatchCategory;
  fit_reasons: string[];
  transferable_skills_mapping: TransferableSkillMap[];
  tailored_resume_cache?: TailoredResume | null;
  status: MatchStatus;
  created_at: string;
  job?: Job;
}

export interface TailoredBullet {
  original: string;
  tailored: string;
  rationale: string;
}

export interface TailoredResume {
  target_job_title: string;
  company_name: string;
  executive_summary: string;
  highlighted_skills: string[];
  tailored_bullets: TailoredBullet[];
  full_tailored_markdown: string;
}

export interface IngestJobItem {
  title: string;
  company: string;
  location?: string;
  salary_range?: string;
  job_type?: string;
  description: string;
  raw_url?: string;
  source?: string;
  external_id?: string;
}

export interface GeminiMatchAnalysis {
  match_score: number;
  match_category: MatchCategory;
  fit_reasons: string[];
  transferable_skills_mapping: TransferableSkillMap[];
}
