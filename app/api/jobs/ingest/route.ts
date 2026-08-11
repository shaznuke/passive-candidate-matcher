import { NextRequest, NextResponse } from 'next/server';
import { analyzeJobMatchWithGemini } from '@/lib/gemini';
import { fetchCurrentCandidate, saveJobAndMatch } from '@/lib/supabase';
import { sendHighMatchAlert } from '@/lib/alerts';
import { IngestJobItem } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    // 1. Authorization check if INGEST_SECRET_TOKEN is set
    const configuredSecret = process.env.INGEST_SECRET_TOKEN;
    if (configuredSecret && configuredSecret !== 'my-super-secret-ingest-token-123') {
      const headerSecret = req.headers.get('x-ingest-secret') || req.headers.get('authorization')?.replace('Bearer ', '');
      if (headerSecret !== configuredSecret) {
        return NextResponse.json({ error: 'Unauthorized. Invalid x-ingest-secret header.' }, { status: 401 });
      }
    }

    const body = await req.json();
    const jobItems: IngestJobItem[] = Array.isArray(body) ? body : (body.jobs || [body]);

    if (jobItems.length === 0) {
      return NextResponse.json({ error: 'No job payloads provided.' }, { status: 400 });
    }

    const candidate = await fetchCurrentCandidate();
    const processedMatches = [];
    const origin = req.nextUrl.origin;

    for (const rawJob of jobItems) {
      if (!rawJob.title || !rawJob.company || !rawJob.description) {
        continue;
      }

      const jobPayload = {
        title: rawJob.title,
        company: rawJob.company,
        location: rawJob.location || 'Remote / Flexible',
        salary_range: rawJob.salary_range || 'Competitive',
        job_type: rawJob.job_type || 'Full-time',
        description: rawJob.description,
        raw_url: rawJob.raw_url || '#',
        source: rawJob.source || 'apify_webhook',
        external_id: rawJob.external_id || `ext-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
      };

      // Compute transferable fit analysis using Gemini
      const matchAnalysis = await analyzeJobMatchWithGemini(candidate, {
        id: '',
        ...jobPayload,
        created_at: new Date().toISOString()
      });

      // Save to DB
      const savedMatch = await saveJobAndMatch(jobPayload, matchAnalysis);

      // Trigger Alert if score >= 80%
      let alertResult = null;
      if (savedMatch.match_score >= 80) {
        alertResult = await sendHighMatchAlert(savedMatch, origin);
      }

      processedMatches.push({
        match: savedMatch,
        alertDispatched: alertResult
      });
    }

    return NextResponse.json({
      success: true,
      ingestedCount: processedMatches.length,
      results: processedMatches
    });
  } catch (error: any) {
    console.error('API /api/jobs/ingest Error:', error);
    return NextResponse.json({ error: error.message || 'Job ingestion failed' }, { status: 500 });
  }
}
