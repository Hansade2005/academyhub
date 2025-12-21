'use client';

import { useState } from 'react';
import * as pdfjsLib from "pdfjs-dist";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SkillPassportDisplay from '@/components/SkillPassportDisplay';
import ThemeSelector from '@/components/ThemeSelector';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { motion } from 'framer-motion';
import type { ThemeName } from '@/lib/themes';
import { useAuth } from '@/lib/auth-context';
import { createSkillPassport } from '@/lib/database-tools';
import { pipilotAuthService } from '@/lib/pipilot-auth-service';

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
  const { user } = useAuth();
  const [preview, setPreview] = useState<string | null>(null);
  const [output, setOutput] = useState<string>("");
  const [result, setResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTheme, setSelectedTheme] = useLocalStorage<ThemeName>('skill-passport-theme', 'default');

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p>Please log in to generate skill passports.</p>
        </div>
      </div>
    );
  }

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
    if (!output.trim()) {
      setError('No text content found in PDF. Please try another PDF file.');
      return;
    }

    console.log('Sending text to API:', output.substring(0, 200) + '...'); // Debug: log first 200 chars
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('text', output);

      const { accessToken } = pipilotAuthService.retrieveTokens();

      const response = await fetch('/api/generate-skill-passport', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API response not ok:', errorData);
        throw new Error(errorData.error || 'Failed to generate skill passport');
      }

      const data = await response.json();
      console.log('Received data from API:', data); // Debug: log API response
      setResult(data);

      // Save to database
      if (data && user) {
        try {
          await createSkillPassport(user.id, `Skill Passport - ${new Date().toLocaleDateString()}`, data);
          console.log('Skill passport saved to database');
        } catch (dbError) {
          console.error('Failed to save to database:', dbError);
          // Don't fail the whole process if DB save fails
        }
      }
    } catch (err) {
      console.error('Error in handleSubmit:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while generating the skill passport');
    } finally {
      setLoading(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
  };

  return (
    <div className="min-h-screen bg-black text-gray-300 font-sans">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-900 rounded-full opacity-20 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-900 rounded-full opacity-20 blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <Header />

      {/* Hero Section */}
      <motion.section
        className="relative py-32 md:py-40 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-purple-950 to-black opacity-80" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.h1
            className="text-5xl md:text-7xl font-extrabold mb-6 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            3 a Skill Passport Generator
          </motion.h1>
          <motion.p
            className="text-xl md:text-2xl mb-8 opacity-90 max-w-4xl mx-auto"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Transform your CV/Resume into a verified, AI-powered skill passport that proves your workplace readiness.
          </motion.p>
        </div>
      </motion.section>

      {/* Main Content */}
      <motion.section
        className="py-32 relative overflow-hidden"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black via-indigo-950/30 to-black" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-2 gap-16">
            <motion.div variants={itemVariants} className="space-y-8">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Generate Your Skill Passport
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
                  <label htmlFor="file-upload" className="block mb-4 text-xl font-medium text-gray-300">
                    Upload your CV/Resume
                  </label>
                  <input
                    id="file-upload"
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="w-full p-3 bg-white/5 border border-white/20 rounded-xl text-gray-300"
                  />
                </div>

                {preview && (
                  <div className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
                    <h3 className="text-xl font-semibold mb-4 text-gray-300">Preview (Page 1)</h3>
                    <img
                      src={preview}
                      alt="PDF Preview"
                      className="w-full max-w-xs border border-white/20 rounded-lg"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!output.trim() || loading}
                  className={`w-full py-4 rounded-xl font-bold text-lg shadow-2xl transition-all duration-300 ${
                    loading
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700'
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                        Processing Document...
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-center gap-2">
                        🚀 Generate 3 a Skill Passport
                      </div>
                    </>
                  )}
                </button>

                <div className="p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
                  <ThemeSelector selectedTheme={selectedTheme} onThemeChange={setSelectedTheme} />
                </div>

                {error && (
                  <div className="p-4 bg-red-900/30 border border-red-500/50 rounded-xl">
                    <h3 className="text-lg font-semibold text-red-300">Processing Failed</h3>
                    <p className="text-red-200">{error}</p>
                  </div>
                )}
              </form>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-8">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Your Skill Passport
              </h2>

              <div className="p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl min-h-[600px]">
                {result ? (
                  <SkillPassportDisplay data={result.data} themeName={selectedTheme} />
                ) : (
                  <div className="flex items-center justify-center h-96 text-center text-gray-500">
                    <div>
                      <p>Your generated 3 a Skill Passport will appear here</p>
                      <p className="mt-4 text-lg">Upload a CV/Resume to get started</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      <Footer />
    </div>
  );
}