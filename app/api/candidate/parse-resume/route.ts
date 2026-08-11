import { NextRequest, NextResponse } from 'next/server';
import { parseResumeWithGemini, parsePdfResumeWithGemini } from '@/lib/gemini';
import { updateCandidateProfile } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      const text = formData.get('resumeText') as string | null;

      if (file && file.type === 'application/pdf') {
        const arrayBuffer = await file.arrayBuffer();
        const base64Data = Buffer.from(arrayBuffer).toString('base64');
        const parsedProfile = await parsePdfResumeWithGemini(base64Data);
        const updated = await updateCandidateProfile(parsedProfile);
        return NextResponse.json({ success: true, candidate: updated });
      }

      if (text) {
        const parsedProfile = await parseResumeWithGemini(text);
        const updated = await updateCandidateProfile(parsedProfile);
        return NextResponse.json({ success: true, candidate: updated });
      }

      return NextResponse.json({ error: 'No valid file or text provided' }, { status: 400 });
    }

    // JSON Body fallback
    const body = await req.json();
    const { resumeText, pdfBase64 } = body;

    if (pdfBase64) {
      const parsedProfile = await parsePdfResumeWithGemini(pdfBase64);
      const updated = await updateCandidateProfile(parsedProfile);
      return NextResponse.json({ success: true, candidate: updated });
    }

    if (resumeText && typeof resumeText === 'string') {
      const parsedProfile = await parseResumeWithGemini(resumeText);
      const updated = await updateCandidateProfile(parsedProfile);
      return NextResponse.json({ success: true, candidate: updated });
    }

    return NextResponse.json({ error: 'resumeText or pdfBase64 is required' }, { status: 400 });
  } catch (error: any) {
    console.error('API /api/candidate/parse-resume Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to parse resume' }, { status: 500 });
  }
}
