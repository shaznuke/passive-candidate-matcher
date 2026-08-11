import { NextRequest, NextResponse } from 'next/server';
import { analyzeJobMatchWithGemini } from '@/lib/gemini';
import { fetchCurrentCandidate, saveJobAndMatch } from '@/lib/supabase';
import { sendHighMatchAlert } from '@/lib/alerts';
import { IngestJobItem, Job } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const query = (body.query || 'operations').trim();

    const candidate = await fetchCurrentCandidate();
    const origin = req.nextUrl.origin;

    // Fetch live jobs from Remotive public web job API
    const liveJobs: IngestJobItem[] = [];

    try {
      const remotiveUrl = `https://remotive.com/api/remote-jobs?search=${encodeURIComponent(query)}&limit=8`;
      const res = await fetch(remotiveUrl, { next: { revalidate: 60 } });

      if (res.ok) {
        const data = await res.json();
        if (data.jobs && Array.isArray(data.jobs)) {
          for (const item of data.jobs.slice(0, 6)) {
            const cleanDesc = (item.description || '')
              .replace(/<[^>]*>?/gm, '')
              .replace(/\s+/g, ' ')
              .trim();

            liveJobs.push({
              title: item.title,
              company: item.company_name,
              location: item.candidate_required_location || 'Remote',
              salary_range: item.salary || 'Competitive',
              job_type: item.job_type || 'Full-time',
              description: cleanDesc.slice(0, 1200),
              raw_url: item.url || '#',
              source: 'remotive_live_web',
              external_id: `remotive-${item.id}`
            });
          }
        }
      }
    } catch (err) {
      console.warn('Live web fetch from Remotive failed:', err);
    }

    // Fallback/supplement with Arbeitnow public API if remotive returned few results
    if (liveJobs.length < 3) {
      try {
        const arbeitUrl = `https://www.arbeitnow.com/api/job-board-api`;
        const res = await fetch(arbeitUrl, { next: { revalidate: 60 } });
        if (res.ok) {
          const data = await res.json();
          if (data.data && Array.isArray(data.data)) {
            for (const item of data.data.slice(0, 5)) {
              const cleanDesc = (item.description || '')
                .replace(/<[^>]*>?/gm, '')
                .replace(/\s+/g, ' ')
                .trim();

              liveJobs.push({
                title: item.title,
                company: item.company_name,
                location: item.location || 'Remote / Flexible',
                salary_range: 'Competitive',
                job_type: item.job_types?.join(', ') || 'Full-time',
                description: cleanDesc.slice(0, 1200),
                raw_url: item.url || '#',
                source: 'arbeitnow_live_web',
                external_id: `arbeit-${item.slug}`
              });
            }
          }
        }
      } catch (err) {
        console.warn('Live web fetch from Arbeitnow failed:', err);
      }
    }

    if (liveJobs.length === 0) {
      return NextResponse.json({ error: `No live web jobs found for "${query}". Try another search term.` }, { status: 404 });
    }

    const newMatches = [];

    for (const rawJob of liveJobs) {
      const fullJob: Job = {
        id: `job-live-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title: rawJob.title,
        company: rawJob.company,
        location: rawJob.location || 'Remote',
        salary_range: rawJob.salary_range || 'Competitive',
        job_type: rawJob.job_type || 'Full-time',
        description: rawJob.description,
        raw_url: rawJob.raw_url || '#',
        source: rawJob.source || 'live_web',
        external_id: rawJob.external_id || `ext-${Date.now()}`,
        created_at: new Date().toISOString()
      };

      const matchAnalysis = await analyzeJobMatchWithGemini(candidate, fullJob);
      const savedMatch = await saveJobAndMatch(fullJob, matchAnalysis);

      let alertResult = null;
      if (savedMatch.match_score >= 80) {
        alertResult = await sendHighMatchAlert(savedMatch, origin);
      }

      newMatches.push(savedMatch);
    }

    return NextResponse.json({
      success: true,
      query,
      foundCount: liveJobs.length,
      matches: newMatches
    });
  } catch (error: any) {
    console.error('API /api/jobs/search-live Error:', error);
    return NextResponse.json({ error: error.message || 'Live web search failed' }, { status: 500 });
  }
}
