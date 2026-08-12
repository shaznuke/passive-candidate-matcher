import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CandidateProfile, Job, JobMatch } from './types';
import { DEFAULT_MOCK_PROFILE, MOCK_JOBS, MOCK_JOB_MATCHES } from './mockData';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseKey &&
  supabaseUrl !== 'https://your-project-id.supabase.co' &&
  !supabaseUrl.includes('your-project-id')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseKey!)
  : null;

// =========================================================================
// IN-MEMORY FALLBACK STORE FOR ZERO-CONFIG DEMO MODE
// =========================================================================
class InMemoryDb {
  private candidate: CandidateProfile = { ...DEFAULT_MOCK_PROFILE };
  private jobs: Job[] = [...MOCK_JOBS];
  private matches: JobMatch[] = [...MOCK_JOB_MATCHES];

  getCandidate(): CandidateProfile {
    return { ...this.candidate };
  }

  updateCandidate(updates: Partial<CandidateProfile>): CandidateProfile {
    this.candidate = {
      ...this.candidate,
      ...updates,
      updated_at: new Date().toISOString()
    };
    return { ...this.candidate };
  }

  getJobs(): Job[] {
    return [...this.jobs];
  }

  addJob(job: Omit<Job, 'id' | 'created_at'> & { id?: string }): Job {
    const newJob: Job = {
      id: job.id || `job-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title: job.title,
      company: job.company,
      location: job.location || 'Remote / Flexible',
      salary_range: job.salary_range || 'Competitive',
      job_type: job.job_type || 'Full-time',
      description: job.description,
      raw_url: job.raw_url || '#',
      source: job.source || 'web_scraper',
      external_id: job.external_id || `ext-${Date.now()}`,
      created_at: new Date().toISOString()
    };

    const existingIdx = this.jobs.findIndex(j => j.external_id === newJob.external_id);
    if (existingIdx >= 0) {
      this.jobs[existingIdx] = newJob;
      return newJob;
    }

    this.jobs.unshift(newJob);
    return newJob;
  }

  getMatches(): JobMatch[] {
    return [...this.matches].sort((a, b) => b.match_score - a.match_score);
  }

  upsertMatch(match: Omit<JobMatch, 'id' | 'created_at'> & { id?: string }): JobMatch {
    const existingIndex = this.matches.findIndex(m => m.job_id === match.job_id);
    const relatedJob = match.job || this.jobs.find(j => j.id === match.job_id);

    const matchRecord: JobMatch = {
      id: match.id || (existingIndex >= 0 ? this.matches[existingIndex].id : `match-${Date.now()}`),
      job_id: match.job_id,
      candidate_id: match.candidate_id || this.candidate.id || 'cand-mock-001',
      match_score: match.match_score,
      match_category: match.match_category,
      fit_reasons: match.fit_reasons,
      transferable_skills_mapping: match.transferable_skills_mapping,
      tailored_resume_cache: match.tailored_resume_cache || null,
      status: match.status || 'new',
      created_at: new Date().toISOString(),
      job: relatedJob
    };

    if (existingIndex >= 0) {
      this.matches[existingIndex] = matchRecord;
    } else {
      this.matches.unshift(matchRecord);
    }

    return matchRecord;
  }

  updateMatchStatus(matchId: string, status: JobMatch['status']): JobMatch | null {
    const target = this.matches.find(m => m.id === matchId);
    if (target) {
      target.status = status;
      return { ...target };
    }
    return null;
  }

  saveTailoredResume(matchId: string, tailored: JobMatch['tailored_resume_cache']): void {
    const target = this.matches.find(m => m.id === matchId);
    if (target) {
      target.tailored_resume_cache = tailored;
    }
  }
}

export const inMemoryStore = new InMemoryDb();

// =========================================================================
// DATA ACCESS SERVICE HELPERS
// =========================================================================

export async function fetchCurrentCandidate(): Promise<CandidateProfile> {
  if (supabase) {
    const { data, error } = await supabase
      .from('candidates')
      .select('*')
      .limit(1)
      .single();

    if (!error && data) {
      // Override legacy Alex Vance seed profile from Supabase DB
      if (data.name === 'Alex Vance') {
        data.name = 'Your Profile';
        data.title = 'Upload Resume to Get Started';
        data.summary = 'Upload your Word document (.docx) or PDF resume to automatically extract your skills and score active job listings.';
      }
      return data as CandidateProfile;
    }
  }
  return inMemoryStore.getCandidate();
}

export async function updateCandidateProfile(profileData: Partial<CandidateProfile>): Promise<CandidateProfile> {
  if (supabase) {
    const current = await fetchCurrentCandidate();
    if (current.id) {
      const { data, error } = await supabase
        .from('candidates')
        .update({ ...profileData, updated_at: new Date().toISOString() })
        .eq('id', current.id)
        .select()
        .single();

      if (!error && data) return data as CandidateProfile;
    } else {
      const { data, error } = await supabase
        .from('candidates')
        .insert([{ ...profileData }])
        .select()
        .single();

      if (!error && data) return data as CandidateProfile;
    }
  }
  return inMemoryStore.updateCandidate(profileData);
}

export async function fetchAllMatches(): Promise<JobMatch[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from('job_matches')
      .select(`
        *,
        job:jobs(*)
      `)
      .order('match_score', { ascending: false });

    if (!error && data && data.length > 0) {
      // Filter out legacy sample jobs from database
      const realMatches = data.filter((m: any) => {
        const company = m.job?.company || '';
        return company !== 'Quantum Scale AI' && company !== 'Aether Logistics Tech' && company !== 'MetaVerse Core';
      });
      return realMatches as JobMatch[];
    }
  }
  return inMemoryStore.getMatches();
}

export async function saveJobAndMatch(jobData: Omit<Job, 'id' | 'created_at'>, matchAnalysis: any) {
  if (supabase) {
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .upsert(jobData, { onConflict: 'external_id' })
      .select()
      .single();

    if (!jobError && job) {
      const candidate = await fetchCurrentCandidate();
      const matchRecord = {
        job_id: job.id,
        candidate_id: candidate.id || 'cand-mock-001',
        match_score: matchAnalysis.match_score,
        match_category: matchAnalysis.match_category,
        fit_reasons: matchAnalysis.fit_reasons,
        transferable_skills_mapping: matchAnalysis.transferable_skills_mapping,
        status: 'new'
      };

      const { data: match, error: matchError } = await supabase
        .from('job_matches')
        .upsert(matchRecord, { onConflict: 'job_id,candidate_id' })
        .select(`*, job:jobs(*)`)
        .single();

      if (!matchError && match) return match as JobMatch;
    }
  }

  const newJob = inMemoryStore.addJob(jobData);
  const candidate = inMemoryStore.getCandidate();

  return inMemoryStore.upsertMatch({
    job_id: newJob.id,
    candidate_id: candidate.id!,
    match_score: matchAnalysis.match_score,
    match_category: matchAnalysis.match_category,
    fit_reasons: matchAnalysis.fit_reasons,
    transferable_skills_mapping: matchAnalysis.transferable_skills_mapping,
    status: 'new',
    job: newJob
  });
}
