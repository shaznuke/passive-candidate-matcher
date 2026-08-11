import { NextRequest, NextResponse } from 'next/server';
import { sendHighMatchAlert } from '@/lib/alerts';
import { fetchAllMatches } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const matches = await fetchAllMatches();
    const highMatch = matches.find(m => m.match_score >= 80) || matches[0];

    if (!highMatch) {
      return NextResponse.json({ error: 'No job matches available to alert' }, { status: 400 });
    }

    const origin = req.nextUrl.origin;
    const alertResult = await sendHighMatchAlert(highMatch, origin);

    return NextResponse.json({
      success: true,
      alertResult,
      testedMatch: {
        title: highMatch.job?.title,
        company: highMatch.job?.company,
        score: highMatch.match_score
      }
    });
  } catch (error: any) {
    console.error('API /api/alerts/test Error:', error);
    return NextResponse.json({ error: error.message || 'Alert test failed' }, { status: 500 });
  }
}
