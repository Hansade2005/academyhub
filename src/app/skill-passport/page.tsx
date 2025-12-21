'use client';

import { useState } from 'react';
import * as pdfjsLib from "pdfjs-dist";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SkillPassportDisplay from '@/components/SkillPassportDisplay';
import ThemeSelector from '@/components/ThemeSelector';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import type { ThemeName } from '@/lib/themes';

// Configure worker
pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

const Logger = {
  log(type: string, message: string) {
    console.log(`[${type}] ${message}`);
  },
};

async function extractTextFromPDF(pdf: any): Promise<string> {
  Logger.log("TEXT_EXTRACTION_START", `Extracting ${pdf.numPages} pages`);

  let fullText = "";
  const tasks = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    tasks.push(
      pdf.getPage(i).then((page: any) =>
        page.getTextContent().then((content: any) => {
          const pageText = content.items.map((item: any) => item.str).join(" ");
          fullText += pageText + "\n";
          Logger.log("PAGE_PROCESSED", `Page ${i}/${pdf.numPages}`);
        })
      )
    );
  }

  await Promise.all(tasks);
  return fullText.trim();
}

export default function SkillPassportPage() {
  const [preview, setPreview] = useState<string | null>(null);
  const [output, setOutput] = useState<string>("");
  const [result, setResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTheme, setSelectedTheme] = useLocalStorage<ThemeName>('skill-passport-theme', 'default');

  async function processPDF(file: File) {
    try {
      Logger.log("PDF_ATTACHED", "Starting PDF processing");

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      // Render first page
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 0.3 });

      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d")!;

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({
        canvasContext: context,
        viewport: viewport,
      }).promise;

      const previewData = canvas.toDataURL();
      setPreview(previewData);

      // Extract text
      const text = await extractTextFromPDF(pdf);
      Logger.log("TEXT_EXTRACTION_COMPLETE", `${text.length} characters extracted`);

      setOutput(text);

      return { text, preview: previewData };
    } catch (error: any) {
      Logger.log("ERROR", error.message);
      alert("PDF processing failed: " + error.message);
      throw error;
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Please upload a PDF file.");
      return;
    }

    processPDF(file);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!output.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('text', output);

      const response = await fetch('/api/generate-skill-passport', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate skill passport');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div style={{ fontFamily: 'Arial', padding: 20 }}>
        <Header />
        <main>
          <h1>3 a Skill Passport Generator</h1>
          <form onSubmit={handleSubmit}>
            <div>
              <label htmlFor="file-upload">
                Upload your CV/Resume
              </label>
              <input
                id="file-upload"
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
              />
            </div>

            {preview && (
              <>
                <h3>Preview (Page 1)</h3>
                <img src={preview} alt="PDF Preview" style={{ maxWidth: 300, border: "1px solid #ccc" }} />
              </>
            )}

            <button
              type="submit"
              disabled={!output.trim() || loading}
              style={{
                background: loading ? '#ccc' : '#007bff',
                color: 'white',
                padding: '12px 24px',
                border: 'none',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: 'bold',
                transition: 'all 0.3s ease',
                marginTop: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {loading ? (
                <>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid #fff',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  Processing Document...
                </>
              ) : (
                <>
                  🚀 Generate 3 a Skill Passport
                </>
              )}
            </button>

            <style jsx>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </form>
          <ThemeSelector selectedTheme={selectedTheme} onThemeChange={setSelectedTheme} />
          {error && (
            <div style={{ background: '#fee', border: '1px solid #fcc', padding: 10, marginTop: 10 }}>
              <h3>Processing Failed</h3>
              <p>{error}</p>
            </div>
          )}
          {result && <SkillPassportDisplay data={result.data} themeName={selectedTheme} />}
        </main>
        <Footer />
      </div>
    </>
  );
}