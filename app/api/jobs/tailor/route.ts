import { NextRequest, NextResponse } from 'next/server';
import { tailorResumeWithGemini } from '@/lib/gemini';
import { fetchAllMatches, fetchCurrentCandidate, inMemoryStore, supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { jobId, matchId } = body;

    if (!jobId && !matchId) {
      return NextResponse.json({ error: 'jobId or matchId is required' }, { status: 400 });
    }

    const matches = await fetchAllMatches();
    const targetMatch = matches.find(m => m.id === matchId || m.job_id === jobId || m.job?.id === jobId);

    if (!targetMatch || !targetMatch.job) {
      return NextResponse.json({ error: 'Job match record not found' }, { status: 404 });
    }

    // Return cached tailored resume if available
    if (targetMatch.tailored_resume_cache) {
      return NextResponse.json({
        success: true,
        tailoredResume: targetMatch.tailored_resume_cache,
        cached: true
      });
    }

    const candidate = await fetchCurrentCandidate();
    const tailoredResult = await tailorResumeWithGemini(candidate, targetMatch.job);

    // Save to cache
    if (supabase) {
      await supabase
        .from('job_matches')
        .update({ tailored_resume_cache: tailoredResult })
        .eq('id', targetMatch.id);
    } else {
      inMemoryStore.saveTailoredResume(targetMatch.id, tailoredResult);
    }

    return NextResponse.json({
      success: true,
      tailoredResume: tailoredResult,
      cached: false
    });
  } catch (error: any) {
    console.error('API /api/jobs/tailor Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to tailor resume' }, { status: 500 });
  }
}
