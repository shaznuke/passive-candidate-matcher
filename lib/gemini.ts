import { GoogleGenerativeAI } from '@google/generative-ai';
import { CandidateProfile, GeminiMatchAnalysis, Job, TailoredResume } from './types';
import { MOCK_TAILORED_RESUME } from './mockData';

const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenerativeAI | null = null;

if (apiKey && apiKey !== 'your_gemini_api_key_here') {
  try {
    aiClient = new GoogleGenerativeAI(apiKey);
  } catch (err) {
    console.warn('Failed to initialize Gemini AI client:', err);
  }
}

/**
 * Parses raw PDF resume base64 data natively using Gemini multimodal capability
 */
export async function parsePdfResumeWithGemini(pdfBase64: string): Promise<CandidateProfile> {
  if (!aiClient) {
    return {
      name: 'Uploaded PDF Candidate',
      title: 'Operations & Strategy Professional',
      summary: 'Candidate profile parsed from uploaded PDF document.',
      core_skills: ['Strategic Operations', 'Executive Alignment', 'Project Management'],
      leadership_experience: ['Led cross-functional operational teams'],
      domain_expertise: ['Enterprise Operations'],
      transferable_skills: ['Operations -> Chief of Staff / Business Operations'],
      raw_resume_text: 'PDF Resume Document'
    };
  }

  try {
    const prompt = `
You are an executive talent recruiter and AI resume analyst.
Parse the attached PDF resume into structured JSON with these exact fields:
- "name": candidate name (string)
- "title": primary professional title/headline (string)
- "summary": 2-3 sentence executive summary (string)
- "core_skills": array of 5-10 technical and functional skills (array of strings)
- "leadership_experience": array of 2-5 major team/people/budget leadership highlights (array of strings)
- "domain_expertise": array of 3-6 industry or domain fields (array of strings)
- "transferable_skills": array of 3-6 transferable skill mappings (array of strings)

Respond ONLY with valid JSON matching this schema. Do NOT include markdown wrapping like \`\`\`json.`;

    const model = aiClient.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const pdfPart = {
      inlineData: {
        data: pdfBase64,
        mimeType: 'application/pdf'
      }
    };

    const response = await model.generateContent([prompt, pdfPart]);
    const text = response.response.text() || '';
    const cleanedJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanedJson);

    return {
      name: parsed.name || 'PDF Candidate',
      title: parsed.title || 'Professional',
      summary: parsed.summary || 'PDF resume parsed via Gemini AI.',
      core_skills: parsed.core_skills || [],
      leadership_experience: parsed.leadership_experience || [],
      domain_expertise: parsed.domain_expertise || [],
      transferable_skills: parsed.transferable_skills || [],
      raw_resume_text: `PDF Resume extracted for ${parsed.name || 'Candidate'}`
    };
  } catch (error) {
    console.error('Error in parsePdfResumeWithGemini:', error);
    return {
      name: 'Uploaded PDF Candidate',
      title: 'Operations & Strategy Leader',
      summary: 'Parsed from PDF resume file.',
      core_skills: ['Operations', 'Leadership', 'Strategy'],
      leadership_experience: ['Cross-functional project leadership'],
      domain_expertise: ['Business Operations'],
      transferable_skills: ['Leadership -> Operations Management'],
      raw_resume_text: 'PDF Content'
    };
  }
}

/**
 * Parses raw resume text into structured CandidateProfile JSON
 */
export async function parseResumeWithGemini(rawText: string): Promise<CandidateProfile> {
  if (!aiClient || !rawText || rawText.trim().length < 20) {
    return {
      name: 'Parsed Candidate',
      title: 'Operations & Strategy Leader',
      summary: rawText.slice(0, 300) || 'Candidate profile parsed from uploaded resume.',
      core_skills: ['Operational Management', 'Strategic Execution', 'Cross-Functional Leadership'],
      leadership_experience: ['Led cross-functional teams to deliver key strategic outcomes.'],
      domain_expertise: ['Business Operations', 'Program Management'],
      transferable_skills: ['Strategic Operations -> Business Operations', 'Leadership -> PMO Director'],
      raw_resume_text: rawText
    };
  }

  try {
    const prompt = `
You are an executive talent recruiter and AI resume analyst.
Parse the following candidate resume into structured JSON with these exact fields:
- "name": candidate name (string)
- "title": primary professional title/headline (string)
- "summary": 2-3 sentence executive summary (string)
- "core_skills": array of 5-10 technical and functional skills (array of strings)
- "leadership_experience": array of 2-5 major team/people/budget leadership highlights (array of strings)
- "domain_expertise": array of 3-6 industry or domain fields (array of strings)
- "transferable_skills": array of 3-6 transferable skill mappings (e.g. "Military Command -> Operations Leadership", "Consulting -> Chief of Staff") (array of strings)

RESUME TEXT:
${rawText}

Respond ONLY with valid JSON. Do not include markdown code block formatting like \`\`\`json.`;

    const model = aiClient.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const response = await model.generateContent(prompt);
    const text = response.response.text() || '';
    const cleanedJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanedJson);

    return {
      name: parsed.name || 'Candidate',
      title: parsed.title || 'Professional',
      summary: parsed.summary || rawText.slice(0, 200),
      core_skills: parsed.core_skills || [],
      leadership_experience: parsed.leadership_experience || [],
      domain_expertise: parsed.domain_expertise || [],
      transferable_skills: parsed.transferable_skills || [],
      raw_resume_text: rawText
    };
  } catch (error) {
    console.error('Error in parseResumeWithGemini:', error);
    return {
      name: 'Uploaded Candidate',
      title: 'Operations & Strategy Professional',
      summary: rawText.slice(0, 300),
      core_skills: ['Operations', 'Leadership', 'Strategy'],
      leadership_experience: ['Cross-functional team leadership'],
      domain_expertise: ['Technology Operations'],
      transferable_skills: ['Leadership -> Operations Management'],
      raw_resume_text: rawText
    };
  }
}

/**
 * Calculates transferable skill match score and analysis using Gemini
 */
export async function analyzeJobMatchWithGemini(
  candidate: CandidateProfile,
  job: Job
): Promise<GeminiMatchAnalysis> {
  if (!aiClient) {
    const lowerDesc = (job.description + ' ' + job.title).toLowerCase();
    let score = 75;
    if (lowerDesc.includes('chief of staff') || lowerDesc.includes('operations')) score = 92;
    else if (lowerDesc.includes('product') || lowerDesc.includes('strategy')) score = 84;

    const category = score >= 85 ? (lowerDesc.includes('chief of staff') ? 'High Transferable Potential' : 'Direct Fit') : 'Stretch Target';

    return {
      match_score: score,
      match_category: category as any,
      fit_reasons: [
        `Candidate's background in ${candidate.title} provides strong strategic alignment for ${job.title}.`,
        `Demonstrated expertise in ${candidate.core_skills.slice(0, 3).join(', ')} transfers directly to key requirements.`,
        `Cross-functional leadership track record matches ${job.company}'s organizational mandate.`
      ],
      transferable_skills_mapping: candidate.transferable_skills.map(ts => ({
        skillRequested: job.title + ' Core Competency',
        transferableSkillPossessed: ts,
        alignmentReason: `Strong overlap between candidate's operational background and ${job.company} requirements.`
      }))
    };
  }

  try {
    const prompt = `
You are an elite executive talent matcher specializing in transferable skill evaluation.
Analyze the fit between the candidate profile and the target job description.

CRITICAL INSTRUCTIONS:
1. Do NOT limit fit to exact title or keyword overlaps.
2. Evaluate TRANSFERABLE SKILLS (e.g. military operations/command -> tech operations or chief of staff; management consulting/strategy -> business operations / PMO; engineering lead -> technical product ops).
3. Compute a match_score from 0 to 100 representing overall role viability.
4. Assign a match_category:
   - "Direct Fit" (80%+ direct skill & experience match)
   - "High Transferable Potential" (75%+ strong leadership, operational, or strategic transferability even with different domain backgrounds)
   - "Stretch Target" (50%-74% viable with domain onboarding)
5. Provide fit_reasons: array of 3 actionable bullet points explaining why it fits.
6. Provide transferable_skills_mapping: array of objects with keys {"skillRequested", "transferableSkillPossessed", "alignmentReason"}.

CANDIDATE PROFILE:
Title: ${candidate.title}
Summary: ${candidate.summary}
Core Skills: ${candidate.core_skills.join(', ')}
Leadership: ${candidate.leadership_experience.join('; ')}
Transferable Skills: ${candidate.transferable_skills.join('; ')}
Raw Resume: ${candidate.raw_resume_text.slice(0, 1000)}

JOB DETAILS:
Title: ${job.title}
Company: ${job.company}
Description: ${job.description}

Respond ONLY in valid JSON matching this schema:
{
  "match_score": number,
  "match_category": "Direct Fit" | "High Transferable Potential" | "Stretch Target",
  "fit_reasons": ["string"],
  "transferable_skills_mapping": [
    {
      "skillRequested": "string",
      "transferableSkillPossessed": "string",
      "alignmentReason": "string"
    }
  ]
}
Do NOT include markdown formatting like \`\`\`json.`;

    const model = aiClient.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const response = await model.generateContent(prompt);
    const text = response.response.text() || '';
    const cleanedJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanedJson);

    return {
      match_score: Math.min(100, Math.max(0, Number(parsed.match_score) || 75)),
      match_category: parsed.match_category || 'High Transferable Potential',
      fit_reasons: parsed.fit_reasons || [],
      transferable_skills_mapping: parsed.transferable_skills_mapping || []
    };
  } catch (error) {
    console.error('Error in analyzeJobMatchWithGemini:', error);
    return {
      match_score: 82,
      match_category: 'High Transferable Potential',
      fit_reasons: [
        'Candidate possesses strong transferable leadership and operational management skills relevant to this position.'
      ],
      transferable_skills_mapping: [
        {
          skillRequested: job.title,
          transferableSkillPossessed: candidate.title,
          alignmentReason: 'Transferable operational and strategic execution capacity.'
        }
      ]
    };
  }
}

/**
 * Generates a targeted resume variant for a specific job using Gemini
 */
export async function tailorResumeWithGemini(
  candidate: CandidateProfile,
  job: Job
): Promise<TailoredResume> {
  if (!aiClient) {
    return {
      ...MOCK_TAILORED_RESUME,
      target_job_title: job.title,
      company_name: job.company
    };
  }

  try {
    const prompt = `
You are an executive resume coach and career ghostwriter.
Tailor the candidate's resume for the specific job position below.

CRITICAL CONSTRAINTS:
1. STRICT TRUTHFULNESS: Do NOT invent false companies, fake dates, or unearned credentials. Reframe and emphasize existing achievements, metrics, and transferable skills to align with the target role.
2. Produce a targeted executive summary.
3. Highlight 5 core skills most relevant to this job.
4. Select 3 key bullet points from the candidate's experience and provide a tailored version that highlights alignment with the job description, along with a brief rationale for the change.
5. Provide a complete markdown output formatted professionally.

CANDIDATE RESUME:
${candidate.raw_resume_text}

TARGET JOB:
Title: ${job.title}
Company: ${job.company}
Description: ${job.description}

Respond ONLY in valid JSON matching this schema:
{
  "target_job_title": "${job.title}",
  "company_name": "${job.company}",
  "executive_summary": "string",
  "highlighted_skills": ["string"],
  "tailored_bullets": [
    {
      "original": "string",
      "tailored": "string",
      "rationale": "string"
    }
  ],
  "full_tailored_markdown": "string"
}
Do NOT include markdown wrapping like \`\`\`json.`;

    const model = aiClient.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const response = await model.generateContent(prompt);
    const text = response.response.text() || '';
    const cleanedJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanedJson);

    return {
      target_job_title: job.title,
      company_name: job.company,
      executive_summary: parsed.executive_summary || candidate.summary,
      highlighted_skills: parsed.highlighted_skills || candidate.core_skills,
      tailored_bullets: parsed.tailored_bullets || [],
      full_tailored_markdown: parsed.full_tailored_markdown || candidate.raw_resume_text
    };
  } catch (error) {
    console.error('Error in tailorResumeWithGemini:', error);
    return {
      ...MOCK_TAILORED_RESUME,
      target_job_title: job.title,
      company_name: job.company
    };
  }
}
