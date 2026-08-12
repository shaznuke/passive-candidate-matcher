import { NextRequest, NextResponse } from 'next/server';
import { parseResumeWithGemini } from '@/lib/gemini';
import { updateCandidateProfile } from '@/lib/supabase';
import JSZip from 'jszip';

const mammoth = require('mammoth');

function getPdfParser() {
  try {
    return require('pdf-parse');
  } catch (e) {
    console.warn('pdf-parse library module unavailable:', e);
    return null;
  }
}

// Pure JS zip extractor for .docx word files (word/document.xml)
async function extractDocxTextWithJSZip(buffer: Buffer): Promise<string> {
  try {
    const zip = await JSZip.loadAsync(buffer);
    const documentXmlFile = zip.file('word/document.xml');
    if (documentXmlFile) {
      const xmlText = await documentXmlFile.async('string');
      // Match all text inside Word <w:t> nodes
      const matches = xmlText.match(/<w:t[^>]*>(.*?)<\/w:t>/g);
      if (matches) {
        const text = matches
          .map((m) => m.replace(/<[^>]+>/g, ''))
          .join(' ')
          .trim();
        if (text.length > 10) {
          return text;
        }
      }
    }
  } catch (err) {
    console.warn('JSZip docx extraction failed:', err);
  }
  return '';
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

        // Magic byte detection
        const isDocxZip = buffer.length > 4 && buffer[0] === 0x50 && buffer[1] === 0x4B; // PK..
        const isPdf = buffer.length > 4 && buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46; // %PDF
        const isLegacyDoc = buffer.length > 4 && buffer[0] === 0xD0 && buffer[1] === 0xCF; // Compound binary

        if (isDocxZip || isLegacyDoc || fileName.endsWith('.docx') || fileName.endsWith('.doc') || file.type.includes('wordprocessingml') || file.type.includes('msword')) {
          // Try JSZip first for 100% clean <w:t> text node extraction
          extractedText = await extractDocxTextWithJSZip(buffer);

          if (!extractedText || extractedText.length < 10) {
            try {
              const mammothResult = await mammoth.extractRawText({ buffer });
              extractedText = mammothResult.value || '';
            } catch (docErr) {
              console.warn('mammoth word parsing error:', docErr);
              extractedText = '';
            }
          }
        } else if (isPdf || fileName.endsWith('.pdf') || file.type === 'application/pdf') {
          const pdfParse = getPdfParser();
          if (pdfParse) {
            try {
              const pdfData = await pdfParse(buffer);
              extractedText = pdfData.text || '';
            } catch (pdfErr) {
              console.warn('pdf-parse error:', pdfErr);
              extractedText = '';
            }
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
        const isDocxZip = buffer.length > 4 && buffer[0] === 0x50 && buffer[1] === 0x4B;
        if (isDocxZip) {
          extractedText = await extractDocxTextWithJSZip(buffer);
          if (!extractedText) {
            try {
              const mammothResult = await mammoth.extractRawText({ buffer });
              extractedText = mammothResult.value || '';
            } catch (err) {
              extractedText = '';
            }
          }
        } else {
          const pdfParse = getPdfParser();
          if (pdfParse) {
            try {
              const pdfData = await pdfParse(buffer);
              extractedText = pdfData.text || '';
            } catch (err) {
              extractedText = '';
            }
          }
        }
      } else if (resumeText) {
        extractedText = resumeText;
      }
    }

    // Sanitize extracted text: Strip any XML/ZIP leftover headers and non-printable chars
    extractedText = extractedText
      .replace(/PK![\s\S]*?\[Content_Types\]\.xml/gi, '')
      .replace(/_rels\/\.rels/gi, '')
      .replace(/word\/[a-zA-Z0-9_\.\/-]+/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!extractedText || extractedText.length < 15) {
      return NextResponse.json(
        { error: 'Could not extract readable text from document. Please ensure your Word (.docx) or PDF document contains select-able text.' },
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
