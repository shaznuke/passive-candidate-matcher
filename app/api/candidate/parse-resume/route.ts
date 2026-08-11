import { NextRequest, NextResponse } from 'next/server';
import { parseResumeWithGemini } from '@/lib/gemini';
import { updateCandidateProfile } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { resumeText } = body;

    if (!resumeText || typeof resumeText !== 'string') {
      return NextResponse.json({ error: 'resumeText is required' }, { status: 400 });
    }

    const parsedProfile = await parseResumeWithGemini(resumeText);
    const updated = await updateCandidateProfile(parsedProfile);

    return NextResponse.json({
      success: true,
      candidate: updated
    });
  } catch (error: any) {
    console.error('API /api/candidate/parse-resume Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to parse resume' }, { status: 500 });
  }
}
