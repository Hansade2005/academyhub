import { NextRequest, NextResponse } from 'next/server';
import formidable from 'formidable';
import fs from 'fs';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';

export const config = {
  api: {
    bodyParser: false,
  },
};

interface SkillPassportData {
  name: string;
  roleSeeking: string;
  locationPreference: string;
  hardSkillsScore: number;
  softSkillsScore: number;
  languages: string[];
  availability: string;
  readinessTier: string;
  statusId: string;
  lastUpdated: string;
  careerHighlights: string[];
}

const extractTextFromPDF = async (buffer: Buffer): Promise<string> => {
  const data = await pdf(buffer);
  return data.text;
};

const extractTextFromDocx = async (buffer: Buffer): Promise<string> => {
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
};

const callLLM = async (text: string): Promise<SkillPassportData> => {
  const prompt = `Extract and structure the following CV text into a skill passport JSON. Use this schema:
{
  "name": "string",
  "roleSeeking": "string",
  "locationPreference": "string",
  "hardSkillsScore": number (percentage, e.g., 84.3),
  "softSkillsScore": number (percentage, e.g., 84.1),
  "languages": ["string"],
  "availability": "string",
  "readinessTier": "string",
  "statusId": "string (e.g., 3A-SP-2025-00014)",
  "lastUpdated": "string (e.g., Sept 2025)",
  "careerHighlights": ["string"]
}
If information is not available, infer reasonably or use defaults. Output only valid JSON.

CV Text:
${text}`;

  const response = await fetch('https://api.a0.dev/ai/llm', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages: [
        { role: 'system', content: 'You are an AI that extracts structured data from CVs for skill passports. Always output valid JSON.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.1,
      max_tokens: 1000
    })
  });

  if (!response.ok) {
    throw new Error('LLM API error');
  }

  const data = await response.json();
  const content = data.completion || '{}';
  try {
    return JSON.parse(content);
  } catch {
    // Fallback parsing
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : {
      name: 'Unknown',
      roleSeeking: 'Not specified',
      locationPreference: 'Not specified',
      hardSkillsScore: 0,
      softSkillsScore: 0,
      languages: [],
      availability: 'Not specified',
      readinessTier: 'Not specified',
      statusId: '3A-SP-2025-XXXX',
      lastUpdated: new Date().toLocaleString('en-US', { month: 'short', year: 'numeric' }),
      careerHighlights: []
    };
  }
};

const generatePassportHTML = (data: SkillPassportData): string => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Skill Passport - ${data.name}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Poppins', sans-serif; }
        .progress-bar { height: 8px; background: #e5e7eb; border-radius: 4px; overflow: hidden; }
        .progress-fill { height: 100%; background: linear-gradient(90deg, #4f46e5, #7c3aed); transition: width 0.5s ease; }
        .table { border-collapse: collapse; width: 100%; border-radius: 8px; overflow: hidden; }
        .table th, .table td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
        .table th { background: #f9fafb; font-weight: 600; }
    </style>
</head>
<body class="bg-gray-50 p-8">
    <div class="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-8">
        <div class="text-center mb-8">
            <h1 class="text-4xl font-bold text-indigo-600 mb-2">3a SKILL PASSPORT™</h1>
            <div class="w-16 h-1 bg-indigo-600 mx-auto"></div>
        </div>

        <section class="mb-8">
            <h2 class="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                <svg class="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path></svg>
                CANDIDATE BACKGROUND
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <p><strong>Name:</strong> ${data.name}</p>
                    <p><strong>Role Seeking:</strong> ${data.roleSeeking}</p>
                    <p><strong>Location Preference:</strong> ${data.locationPreference}</p>
                </div>
                <div>
                    <p><strong>Hard Skills Score:</strong> ${data.hardSkillsScore}%</p>
                    <div class="progress-bar mb-2">
                        <div class="progress-fill" style="width: ${data.hardSkillsScore}%"></div>
                    </div>
                    <p><strong>Soft Skills Score:</strong> ${data.softSkillsScore}%</p>
                    <div class="progress-bar mb-2">
                        <div class="progress-fill" style="width: ${data.softSkillsScore}%"></div>
                    </div>
                </div>
            </div>
            <div class="mt-4">
                <p><strong>Languages:</strong> ${data.languages.join(', ') || 'Not specified'}</p>
                <p><strong>Availability:</strong> ${data.availability}</p>
                <p><strong>Readiness Tier:</strong> ${data.readinessTier}</p>
            </div>
            <div class="mt-4 p-4 bg-indigo-50 rounded-lg">
                <p><strong>3a Kill Passport Status:</strong> ${data.statusId} | Verified & Active | Last Updated: ${data.lastUpdated}</p>
            </div>
        </section>

        <section>
            <h2 class="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                <svg class="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clip-rule="evenodd"></path></svg>
                CAREER HIGHLIGHTS
            </h2>
            <ul class="space-y-2">
                ${data.careerHighlights.map(highlight => `<li class="flex items-start"><span class="text-indigo-600 mr-2">•</span>${highlight}</li>`).join('')}
            </ul>
        </section>
    </div>
</body>
</html>`;
};

export async function POST(request: NextRequest) {
  try {
    const form = formidable({ multiples: false });

    const [fields, files] = await new Promise<[formidable.Fields, formidable.Files]>((resolve, reject) => {
      form.parse(request as any, (err, fields, files) => {
        if (err) reject(err);
        else resolve([fields, files]);
      });
    });

    let extractedText = '';

    if (files.file) {
      const file = Array.isArray(files.file) ? files.file[0] : files.file;
      const buffer = fs.readFileSync(file.filepath);

      if (file.mimetype === 'application/pdf') {
        extractedText = await extractTextFromPDF(buffer);
      } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        extractedText = await extractTextFromDocx(buffer);
      } else {
        return NextResponse.json({ error: 'Unsupported file type. Please upload PDF or DOCX.' }, { status: 400 });
      }
    } else if (fields.manualData) {
      extractedText = Array.isArray(fields.manualData) ? fields.manualData[0] : fields.manualData;
    } else {
      return NextResponse.json({ error: 'No CV file or manual data provided.' }, { status: 400 });
    }

    const structuredData = await callLLM(extractedText);
    const html = generatePassportHTML(structuredData);

    return NextResponse.json({ html, data: structuredData });
  } catch (error) {
    console.error('Error generating skill passport:', error);
    return NextResponse.json({ error: 'Failed to generate skill passport.' }, { status: 500 });
  }
}