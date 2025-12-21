import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const SkillPassportSchema = z.object({
  name: z.string(),
  roleSeeking: z.string(),
  locationPreference: z.string(),
  hardSkillsScore: z.number().min(0).max(100),
  softSkillsScore: z.number().min(0).max(100),
  languages: z.array(z.object({
    language: z.string(),
    proficiency: z.string(),
  })),
  availability: z.string(),
  readinessTier: z.string(),
  passportId: z.string(),
  lastUpdated: z.string(),
  careerHighlights: z.array(z.string()),
  hardSkills: z.array(z.object({
    skill: z.string(),
    score: z.number().min(0).max(100),
    level: z.string(),
    weight: z.number().min(0).max(100),
    method: z.string(),
    application: z.string(),
  })),
  softSkills: z.array(z.object({
    skill: z.string(),
    score: z.number().min(0).max(100),
    level: z.string(),
    weight: z.number().min(0).max(100),
    method: z.string(),
    application: z.string(),
  })),
  growthInsight: z.string().optional(),
  educationAndWorkHistory: z.string().optional(),
  certificationTrail: z.string().optional(),
});

type SkillPassportData = z.infer<typeof SkillPassportSchema>;

// Simple text analysis function to extract basic info
const extractBasicInfo = (text: string) => {
  const lines = text.split('\n').filter(line => line.trim().length > 0);

  // Try to extract name (usually first line or line with email-like pattern)
  let name = 'Unknown';
  for (const line of lines.slice(0, 5)) {
    if (line.length > 2 && line.length < 50 && !line.includes('@') && !line.includes('http')) {
      name = line.trim();
      break;
    }
  }

  // Basic skill extraction
  const textLower = text.toLowerCase();
  const hardSkills = [];
  const softSkills = [];

  if (textLower.includes('javascript') || textLower.includes('js')) hardSkills.push('JavaScript');
  if (textLower.includes('python')) hardSkills.push('Python');
  if (textLower.includes('react')) hardSkills.push('React');
  if (textLower.includes('node')) hardSkills.push('Node.js');
  if (textLower.includes('typescript') || textLower.includes('ts')) hardSkills.push('TypeScript');
  if (textLower.includes('html')) hardSkills.push('HTML');
  if (textLower.includes('css')) hardSkills.push('CSS');
  if (textLower.includes('sql')) hardSkills.push('SQL');

  if (textLower.includes('communication')) softSkills.push('Communication');
  if (textLower.includes('leadership')) softSkills.push('Leadership');
  if (textLower.includes('team')) softSkills.push('Teamwork');
  if (textLower.includes('problem')) softSkills.push('Problem Solving');
  if (textLower.includes('project')) softSkills.push('Project Management');

  return { name, hardSkills, softSkills };
};

const callLLM = async (text: string): Promise<SkillPassportData> => {
  try {
    const prompt = `Analyze this CV/resume text and generate a 3 a skill passport in the exact JSON format shown below. Infer detailed skill attributes and generate summaries for insights based on the CV content.

CV Text:
${text}

Generate a 3 a skill passport with this exact structure:
{
  "name": "Person's full name (e.g., Crown M.)",
  "roleSeeking": "Job title they're seeking (e.g., Community Support & Youth Services Coordinator)",
  "locationPreference": "Location preferences mentioned (e.g., Calgary or Hybrid Roles across Alberta)",
  "hardSkillsScore": number between 0-100 based on technical skills strength,
  "softSkillsScore": number between 0-100 based on soft skills strength,
  "languages": [
    {"language": "Language name", "proficiency": "Fluent/Basic/Intermediate"}
  ],
  "availability": "When they're available to start (e.g., Within 2 weeks)",
  "readinessTier": "Work Ready/Emerging/Entry Level",
  "passportId": "Generate unique ID like 3A-SP-2025-XXXX",
  "lastUpdated": "Current month and year (e.g., Sept 2025)",
  "careerHighlights": [
    "3-5 concise, high-impact achievements from their career (max 25 words each)"
  ],
  "hardSkills": [
    {
      "skill": "Specific hard skill name (e.g., Youth Case Management)",
      "score": number between 0-100 (inferred from CV strength),
      "level": "Beginner/Intermediate/Advanced/Expert (inferred from CV experience)",
      "weight": number between 0-100 (inferred importance for roleSeeking),
      "method": "Method of verification (e.g., CV Analysis, Project Experience, LiveWorks Cases, Sim Logs)",
      "application": "Brief description of skill application in context"
    }
  ],
  "softSkills": [
    {
      "skill": "Specific soft skill name (e.g., Empathy & Communication)",
      "score": number between 0-100 (inferred from CV strength),
      "level": "Beginner/Intermediate/Advanced/Expert (inferred from CV experience)",
      "weight": number between 0-100 (inferred importance for roleSeeking),
      "method": "Method of verification (e.g., CV Analysis, Peer Feedback, Sim Logs)",
      "application": "Brief description of skill application in context"
    }
  ],
  "growthInsight": "A concise summary of growth or improvement observed in the CV (e.g., 'Sophie improved in case documentation and trauma-intervention scores by 18% over 18 months.')",
  "educationAndWorkHistory": "A brief summary or statement about viewing education and work history (e.g., 'View Education & Work History')",
  "certificationTrail": "A brief summary or statement about certifications (e.g., 'Mapped into verified skills. Click to view full list.')"
}

Return ONLY the JSON object, no additional text or explanation.`;

    const messages = [
      {
        role: "system",
        content: "You are an expert HR analyst that extracts structured information from CVs and resumes. You always return valid JSON in the exact format requested."
      },
      {
        role: "user",
        content: prompt
      }
    ];

    const response = await fetch('https://api.a0.dev/ai/llm', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages }),
    });

    if (!response.ok) {
      throw new Error(`LLM API call failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    const completion = result.completion || result.message || '';

    // Try to parse the JSON response
    let skillPassportData;
    try {
      skillPassportData = JSON.parse(completion);
    } catch (parseError) {
      console.error('Failed to parse LLM response as JSON:', completion);
      // Fallback to basic extraction if JSON parsing fails
      const { name, hardSkills, softSkills } = extractBasicInfo(text);
      skillPassportData = {
        name,
        roleSeeking: 'Professional Role',
        locationPreference: 'Not specified',
        hardSkillsScore: 75,
        softSkillsScore: 80,
        languages: [{ language: "English", proficiency: "Fluent" }],
        availability: "Within 2 weeks",
        readinessTier: "Work Ready",
        passportId: `3A-SP-2025-${Date.now().toString().slice(-4)}`,
        lastUpdated: new Date().toLocaleString('en-US', { month: 'short', year: 'numeric' }),
        careerHighlights: ["Professional with demonstrated skills and experience"],
        hardSkills: hardSkills.length > 0 ? hardSkills.map(s => ({ skill: s, score: 70, level: 'Intermediate', weight: 10, method: 'CV Analysis', application: 'General' })) : [{ skill: 'Problem Solving', score: 70, level: 'Intermediate', weight: 10, method: 'CV Analysis', application: 'General' }],
        softSkills: softSkills.length > 0 ? softSkills.map(s => ({ skill: s, score: 75, level: 'Intermediate', weight: 10, method: 'CV Analysis', application: 'General' })) : [{ skill: 'Communication', score: 75, level: 'Intermediate', weight: 10, method: 'CV Analysis', application: 'General' }],
        growthInsight: "No specific growth insight from CV.",
        educationAndWorkHistory: "No detailed education/work history from CV.",
        certificationTrail: "No specific certifications from CV."
      };
    }

    // Validate against schema
    const validatedData = SkillPassportSchema.parse(skillPassportData);
    return validatedData;

  } catch (error) {
    console.error('LLM API call failed:', error);
    // Fallback to basic extraction
    const { name, hardSkills, softSkills } = extractBasicInfo(text);
    const skillPassport: SkillPassportData = {
      name,
      roleSeeking: 'Professional Role',
      locationPreference: 'Not specified',
      hardSkillsScore: 70,
      softSkillsScore: 75,
      languages: [{ language: "English", proficiency: "Fluent" }],
      availability: "Within 2 weeks",
      readinessTier: "Work Ready",
      passportId: `3A-SP-2025-${Date.now().toString().slice(-4)}`,
      lastUpdated: new Date().toLocaleString('en-US', { month: 'short', year: 'numeric' }),
      careerHighlights: ["Professional with demonstrated skills and experience"],
      hardSkills: hardSkills.length > 0 ? hardSkills.map(s => ({ skill: s, score: 70, level: 'Intermediate', weight: 10, method: 'CV Analysis', application: 'General' })) : [{ skill: 'Problem Solving', score: 70, level: 'Intermediate', weight: 10, method: 'CV Analysis', application: 'General' }],
      softSkills: softSkills.length > 0 ? softSkills.map(s => ({ skill: s, score: 75, level: 'Intermediate', weight: 10, method: 'CV Analysis', application: 'General' })) : [{ skill: 'Communication', score: 75, level: 'Intermediate', weight: 10, method: 'CV Analysis', application: 'General' }],
      growthInsight: "No specific growth insight from CV.",
      educationAndWorkHistory: "No detailed education/work history from CV.",
      certificationTrail: "No specific certifications from CV."
    };
    return skillPassport;
  }
};



export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const text = formData.get('text') as string;

    if (!text) {
      return NextResponse.json({ error: 'No text provided.' }, { status: 400 });
    }

    if (!text.trim()) {
      return NextResponse.json({ error: 'No text content found in PDF. The PDF may be image-based or corrupted.' }, { status: 400 });
    }

    const structuredData = await callLLM(text);

    return NextResponse.json({ data: structuredData });
  } catch (err: any) {
    console.error('Error generating skill passport:', err);
    return NextResponse.json({ error: 'Failed to generate 3 a skill passport.' }, { status: 500 });
  }
}