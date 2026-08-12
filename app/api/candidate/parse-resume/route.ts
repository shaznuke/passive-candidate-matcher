import { NextRequest, NextResponse } from 'next/server';
import { parseResumeWithGemini } from '@/lib/gemini';
import { updateCandidateProfile } from '@/lib/supabase';

const mammoth = require('mammoth');

function getPdfParser() {
  try {
    return require('pdf-parse');
  } catch (e) {
    console.warn('pdf-parse library module unavailable:', e);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let extractedText = '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      const text = formData.get('resumeText') as string | null;

      if (file) {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const fileName = (file.name || '').toLowerCase();

        if (fileName.endsWith('.docx') || fileName.endsWith('.doc') || file.type.includes('wordprocessingml') || file.type.includes('msword')) {
          try {
            const mammothResult = await mammoth.extractRawText({ buffer });
            extractedText = mammothResult.value || '';
          } catch (docErr) {
            console.warn('mammoth word parsing failed, falling back to string conversion:', docErr);
            extractedText = buffer.toString('utf-8');
          }
        } else if (file.type === 'application/pdf' || fileName.endsWith('.pdf')) {
          const pdfParse = getPdfParser();
          if (pdfParse) {
            try {
              const pdfData = await pdfParse(buffer);
              extractedText = pdfData.text || '';
            } catch (pdfErr) {
              console.warn('pdf-parse parsing failed, attempting text buffer extraction:', pdfErr);
              extractedText = buffer.toString('utf-8');
            }
          } else {
            extractedText = buffer.toString('utf-8');
          }
        } else {
          extractedText = buffer.toString('utf-8');
        }
      } else if (text) {
        extractedText = text;
      }
    } else {
      const body = await req.json();
      const { resumeText, pdfBase64 } = body;

      if (pdfBase64) {
        const buffer = Buffer.from(pdfBase64, 'base64');
        const pdfParse = getPdfParser();
        if (pdfParse) {
          try {
            const pdfData = await pdfParse(buffer);
            extractedText = pdfData.text || '';
          } catch (err) {
            extractedText = buffer.toString('utf-8');
          }
        } else {
          extractedText = buffer.toString('utf-8');
        }
      } else if (resumeText) {
        extractedText = resumeText;
      }
    }

    // Clean up extracted text from control characters or binary noise
    extractedText = extractedText
      .replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!extractedText || extractedText.length < 15) {
      return NextResponse.json(
        { error: 'Could not extract readable text from resume document. Please ensure the file is not corrupted or paste text directly.' },
        { status: 400 }
      );
    }

    // Parse clean extracted text with Gemini AI
    const parsedProfile = await parseResumeWithGemini(extractedText);
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
