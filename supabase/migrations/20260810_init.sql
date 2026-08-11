-- =========================================================================
-- Passive Candidate Job Board & Matcher - Supabase Migration Script
-- PostgreSQL + pgvector Schema setup
-- =========================================================================

-- 1. Enable vector extension for embedding search
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Candidates Table
CREATE TABLE IF NOT EXISTS public.candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT 'Passive Candidate',
  email TEXT,
  title TEXT NOT NULL DEFAULT 'Operations & Strategy Leader',
  summary TEXT,
  core_skills JSONB DEFAULT '[]'::jsonb,
  leadership_experience JSONB DEFAULT '[]'::jsonb,
  domain_expertise JSONB DEFAULT '[]'::jsonb,
  transferable_skills JSONB DEFAULT '[]'::jsonb,
  raw_resume_text TEXT,
  embedding vector(768), -- Google Gemini text-embedding-004 output dimension
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Jobs Ingestion Table
CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT DEFAULT 'Remote / Flexible',
  salary_range TEXT DEFAULT 'Competitive',
  job_type TEXT DEFAULT 'Full-time',
  description TEXT NOT NULL,
  raw_url TEXT,
  source TEXT DEFAULT 'apify_scraper',
  external_id TEXT UNIQUE,
  embedding vector(768),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for searching external job deduplication
CREATE INDEX IF NOT EXISTS idx_jobs_external_id ON public.jobs(external_id);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON public.jobs(created_at DESC);

-- 4. Job Matches Table
CREATE TABLE IF NOT EXISTS public.job_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  match_score INT NOT NULL CHECK (match_score >= 0 AND match_score <= 100),
  match_category TEXT NOT NULL CHECK (match_category IN ('Direct Fit', 'High Transferable Potential', 'Stretch Target')),
  fit_reasons JSONB DEFAULT '[]'::jsonb,
  transferable_skills_mapping JSONB DEFAULT '{}'::jsonb,
  tailored_resume_cache JSONB,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'saved', 'applied', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(job_id, candidate_id)
);

CREATE INDEX IF NOT EXISTS idx_matches_score ON public.job_matches(match_score DESC);
CREATE INDEX IF NOT EXISTS idx_matches_category ON public.job_matches(match_category);

-- 5. Helper Function for Vector Similarity Job Search (pgvector)
CREATE OR REPLACE FUNCTION match_jobs_by_vector (
  query_embedding vector(768),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  company TEXT,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    jobs.id,
    jobs.title,
    jobs.company,
    1 - (jobs.embedding <=> query_embedding) AS similarity
  FROM jobs
  WHERE 1 - (jobs.embedding <=> query_embedding) > match_threshold
  ORDER BY jobs.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 6. Enable Row Level Security (RLS)
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_matches ENABLE ROW LEVEL SECURITY;

-- Allow public read/write access for demo serverless setup
CREATE POLICY "Allow public select on candidates" ON public.candidates FOR SELECT USING (true);
CREATE POLICY "Allow public update on candidates" ON public.candidates FOR UPDATE USING (true);
CREATE POLICY "Allow public insert on candidates" ON public.candidates FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public select on jobs" ON public.jobs FOR SELECT USING (true);
CREATE POLICY "Allow public insert on jobs" ON public.jobs FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public select on job_matches" ON public.job_matches FOR SELECT USING (true);
CREATE POLICY "Allow public insert on job_matches" ON public.job_matches FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on job_matches" ON public.job_matches FOR UPDATE USING (true);
