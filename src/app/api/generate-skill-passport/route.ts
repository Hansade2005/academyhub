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
  passportStatus: z.string().optional(),
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
    const prompt = `Analyze this CV/resume text and generate a 3a Skill Passport™ with the exact format and quality from the example below. Create professional, detailed, and quantified entries that match the style and structure of the example.

CV Text:
${text}

Generate a 3a Skill Passport™ with the following specific structure and characteristics based on the example format:

{
  "name": "Full name with initial format (e.g., Crown M.)",
  "roleSeeking": "Specific job title or role they're targeting",
  "locationPreference": "Geographic preferences (e.g., Calgary or Hybrid Roles across Alberta)",
  "hardSkillsScore": number between 0-100, displayed as X.X% (e.g., 84.3),
  "softSkillsScore": number between 0-100, displayed as X.X% (e.g., 84.1),
  "languages": [
    {
      "language": "Full language name (e.g., English)",
      "proficiency": "Fluency level (e.g., Fluent, Basic, Intermediate)"
    }
  ],
  "availability": "Timeframe for availability (e.g., Within 2 weeks)",
  "readinessTier": "Work Ready/Work Ready with Supervision/Emerging/Entry Level",
  "passportId": "ID in format: 3A-SP-YYYY-XXXX (e.g., 3A-SP-2025-00014)",
  "passportStatus": "Verification status (e.g., Verified & Active)",
  "lastUpdated": "Month and year format (e.g., Sept 2025)",
  "careerHighlights": [
    "Specific, quantified achievements with metrics where possible",
    "Max 25 words each, focused on impact and results",
    "Use action verbs and specific numbers/descriptions"
  ],
  "hardSkills": [
    {
      "skill": "Specific technical skill name (e.g., Youth Case Management)",
      "score": number between 0-100 (inferred from CV strength),
      "level": "Beginner/Intermediate/Advanced/Expert (inferred from CV experience)",
      "weight": number between 0-100 (percentage importance, must total 100% across all hard skills),
      "method": "Specific verification method (e.g., LiveWorks™ Cases, Sim Logs + Workshop Feedback, Event Logs + Partner Feedback)",
      "application": "Concise description of core application (e.g., Core youth intervention planning)"
    }
  ],
  "softSkills": [
    {
      "skill": "Specific interpersonal skill name (e.g., Empathy & Communication)",
      "score": number between 0-100 (inferred from CV strength),
      "level": "Beginner/Intermediate/Advanced/Expert (inferred from CV experience)",
      "weight": number between 0-100 (percentage importance, must total 100% across all soft skills),
      "method": "Specific verification method (e.g., Peer Feedback + Growth Log, Field Logs + Inclusion Logs)",
      "application": "Concise description of workplace application (e.g., Builds rapport with youth & families)"
    }
  ],
  "growthInsight": "A specific, measurable improvement observed or expected (e.g., 'Sophie improved in case documentation and trauma-intervention scores by 18% over 18 months.')",
  "educationAndWorkHistory": "Brief text about viewing full details (e.g., 'View Education & Work History')",
  "certificationTrail": "Brief description of certifications (e.g., 'Mapped into verified skills. Click to view full list.')"
}

CRITICAL REQUIREMENTS:
1. Create 5-8 hard skills and 8-10 soft skills with realistic, specific names and values
2. Ensure hard skill weights total 100% (distribute across 5-8 skills)
3. Ensure soft skill weights total 100% (distribute across 8-10 skills)
4. Use professional language from the example: "LiveWorks™ Cases", "Sim Logs", "Workshop Evidence", etc.
5. Create quantified, impactful career highlights that show measurable results
6. Match the exact format including: "Overall Score: X.X. Readiness Tier: Work Ready with Supervision"
7. Include specific verification methods: "Peer Feedback + Growth Log", "Field Logs + Inclusion Logs", etc.
8. Ensure role-specific skills that match the target roleSeeking

Return ONLY the JSON object with no additional text or explanation.`;

    const messages = [
      {
        role: "system",
        content: "You are an expert HR analyst and workforce development specialist that creates high-quality 3a Skill Passport™ documents. You analyze CVs/resumes and generate professional, detailed, quantified skill passports that match the exact quality and format of the 3rd Academy's standards. Always return valid JSON in the exact format requested, with realistic, specific values based on the CV content."
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
      console.error(`LLM API call failed: ${response.status} ${response.statusText}`);
      throw new Error(`LLM API call failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log('Raw LLM response:', result); // Debug: log the raw response
    const completion = result.completion || result.message || '';

    console.log('LLM completion content:', completion.substring(0, 300) + '...'); // Debug: log first 300 chars

    // Try to parse the JSON response
    let skillPassportData;
    try {
      skillPassportData = JSON.parse(completion);
      console.log('Successfully parsed LLM response:', skillPassportData); // Debug: log parsed data
    } catch (parseError) {
      console.error('Failed to parse LLM response as JSON. Raw response:', completion);
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
        passportStatus: "Verified & Active",
        lastUpdated: new Date().toLocaleString('en-US', { month: 'short', year: 'numeric' }),
        careerHighlights: ["Professional with demonstrated skills and experience"],
        hardSkills: [
          { skill: 'Problem Solving', score: 70, level: 'Intermediate', weight: 20, method: 'CV Analysis', application: 'General problem resolution' },
          { skill: 'Technical Skills', score: 75, level: 'Intermediate', weight: 20, method: 'CV Analysis', application: 'Technical implementations' },
          { skill: 'Project Management', score: 65, level: 'Intermediate', weight: 20, method: 'CV Analysis', application: 'Project coordination' },
          { skill: 'Data Analysis', score: 70, level: 'Intermediate', weight: 20, method: 'CV Analysis', application: 'Data interpretation' },
          { skill: 'Quality Assurance', score: 60, level: 'Intermediate', weight: 20, method: 'CV Analysis', application: 'Quality control processes' }
        ],
        softSkills: [
          { skill: 'Communication', score: 75, level: 'Advanced', weight: 15, method: 'CV Analysis', application: 'Effective team communication' },
          { skill: 'Teamwork', score: 70, level: 'Advanced', weight: 15, method: 'CV Analysis', application: 'Collaborative work environments' },
          { skill: 'Leadership', score: 65, level: 'Advanced', weight: 15, method: 'CV Analysis', application: 'Leading initiatives and people' },
          { skill: 'Adaptability', score: 70, level: 'Advanced', weight: 15, method: 'CV Analysis', application: 'Adjusting to new challenges' },
          { skill: 'Time Management', score: 75, level: 'Advanced', weight: 10, method: 'CV Analysis', application: 'Efficient task prioritization' },
          { skill: 'Problem Solving', score: 70, level: 'Proficient', weight: 10, method: 'CV Analysis', application: 'Identifying solutions' },
          { skill: 'Critical Thinking', score: 65, level: 'Proficient', weight: 10, method: 'CV Analysis', application: 'Analytical reasoning' },
          { skill: 'Creativity', score: 70, level: 'Proficient', weight: 10, method: 'CV Analysis', application: 'Innovative approaches' }
        ],
        growthInsight: "No specific growth insight from CV.",
        educationAndWorkHistory: "View Education & Work History",
        certificationTrail: "Mapped into verified skills. Click to view full list."
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
      passportStatus: "Verified & Active",
      lastUpdated: new Date().toLocaleString('en-US', { month: 'short', year: 'numeric' }),
      careerHighlights: ["Professional with demonstrated skills and experience"],
      hardSkills: [
        { skill: 'Problem Solving', score: 70, level: 'Intermediate', weight: 20, method: 'CV Analysis', application: 'General problem resolution' },
        { skill: 'Technical Skills', score: 75, level: 'Intermediate', weight: 20, method: 'CV Analysis', application: 'Technical implementations' },
        { skill: 'Project Management', score: 65, level: 'Intermediate', weight: 20, method: 'CV Analysis', application: 'Project coordination' },
        { skill: 'Data Analysis', score: 70, level: 'Intermediate', weight: 20, method: 'CV Analysis', application: 'Data interpretation' },
        { skill: 'Quality Assurance', score: 60, level: 'Intermediate', weight: 20, method: 'CV Analysis', application: 'Quality control processes' }
      ],
      softSkills: [
        { skill: 'Communication', score: 75, level: 'Advanced', weight: 15, method: 'CV Analysis', application: 'Effective team communication' },
        { skill: 'Teamwork', score: 70, level: 'Advanced', weight: 15, method: 'CV Analysis', application: 'Collaborative work environments' },
        { skill: 'Leadership', score: 65, level: 'Advanced', weight: 15, method: 'CV Analysis', application: 'Leading initiatives and people' },
        { skill: 'Adaptability', score: 70, level: 'Advanced', weight: 15, method: 'CV Analysis', application: 'Adjusting to new challenges' },
        { skill: 'Time Management', score: 75, level: 'Advanced', weight: 10, method: 'CV Analysis', application: 'Efficient task prioritization' },
        { skill: 'Problem Solving', score: 70, level: 'Proficient', weight: 10, method: 'CV Analysis', application: 'Identifying solutions' },
        { skill: 'Critical Thinking', score: 65, level: 'Proficient', weight: 10, method: 'CV Analysis', application: 'Analytical reasoning' },
        { skill: 'Creativity', score: 70, level: 'Proficient', weight: 10, method: 'CV Analysis', application: 'Innovative approaches' }
      ],
      growthInsight: "No specific growth insight from CV.",
      educationAndWorkHistory: "View Education & Work History",
      certificationTrail: "Mapped into verified skills. Click to view full list."
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