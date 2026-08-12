import { CandidateProfile, Job, JobMatch, TailoredResume } from './types';

export const DEFAULT_MOCK_PROFILE: CandidateProfile = {
  id: 'candidate-active',
  name: 'Your Profile',
  title: 'Upload Resume to Get Started',
  summary: 'Upload your Word document (.docx) or PDF resume to automatically extract your skills and score active job listings.',
  domain_expertise: ['Strategic Operations'],
  core_skills: ['Upload Resume to Extract Skills'],
  leadership_experience: ['Upload Resume to Extract Experience'],
  transferable_skills: ['Operations', 'Leadership', 'Strategic Execution'],
  raw_resume_text: ''
};

// Zero dummy jobs seeded by default
export const MOCK_JOBS: Job[] = [];
export const MOCK_JOB_MATCHES: JobMatch[] = [];

export const MOCK_TAILORED_RESUME: TailoredResume = {
  target_job_title: 'Target Position',
  company_name: 'Target Company',
  executive_summary: 'Strategic operations leader aligned for executive decision support.',
  highlighted_skills: ['Operations', 'Strategic Execution'],
  tailored_bullets: [
    {
      original: 'Led operations team.',
      tailored: 'Led cross-functional operational transformations driving 35% efficiency gains.',
      rationale: 'Emphasized measurable strategic impact.'
    }
  ],
  full_tailored_markdown: '# Tailored Resume\n\n- Led cross-functional operational transformations.'
};
