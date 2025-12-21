'use client';

import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { getTheme, type ThemeName } from '@/lib/themes';

interface SkillDetail {
  skill: string;
  score: number;
  level: string;
  weight: number;
  method: string;
  application: string;
}

interface SkillPassportData {
  name: string;
  roleSeeking: string;
  locationPreference: string;
  hardSkillsScore: number;
  softSkillsScore: number;
  languages: { language: string; proficiency: string }[];
  availability: string;
  readinessTier: string;
  passportId: string;
  passportStatus?: string;
  lastUpdated: string;
  careerHighlights: string[];
  hardSkills: SkillDetail[];
  softSkills: SkillDetail[];
  growthInsight?: string;
  educationAndWorkHistory?: string;
  certificationTrail?: string;
  education?: { degree: string; institution: string; year: string }[];
  experience?: { position: string; company: string; duration: string; description: string }[];
}

interface SkillPassportDisplayProps {
  data: SkillPassportData;
  themeName?: ThemeName;
}

export default function SkillPassportDisplay({ data, themeName = 'default' }: SkillPassportDisplayProps) {
  const theme = getTheme(themeName);
  const passportRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const downloadPDF = async () => {
    if (!passportRef.current) return;

    try {
      // Hide the download button during capture
      if (buttonRef.current) {
        buttonRef.current.style.display = 'none';
      }

      const canvas = await html2canvas(passportRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: theme.colors.background,
      });

      // Show the button again
      if (buttonRef.current) {
        buttonRef.current.style.display = 'flex';
      }

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');

      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if needed
      while (heightLeft > 0) {
        position -= pageHeight; // Move up by page height for next page
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${data.name}_Skill_Passport.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to download PDF. Please try again.');
    }
  };

  return (
    <div
      ref={passportRef}
      className={`max-w-4xl mx-auto ${theme.colors.background} ${theme.shadow} ${theme.borderRadius} ${theme.spacing.cardPadding} font-['Poppins']`}
      style={{
        backgroundColor: theme.colors.background,
        color: theme.colors.text,
        borderColor: theme.colors.border,
      }}
    >
      <div className="text-center mb-8">
        <h1
          className={`${theme.fonts.heading} mb-2`}
          style={{ color: theme.colors.primary }}
        >
          3 a Skill Passport
        </h1>
        <div
          className="w-16 h-1 mx-auto"
          style={{ backgroundColor: theme.colors.primary }}
        ></div>
        <button
          ref={buttonRef}
          onClick={downloadPDF}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2 mx-auto"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Download PDF
        </button>
      </div>

      <section className={theme.spacing.sectionGap}>
        <h2 className={`${theme.fonts.heading} mb-4 flex items-center`} style={{ color: theme.colors.text }}>
          <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
          </svg>
          CANDIDATE BACKGROUND
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p style={{ color: theme.colors.text }}><strong>Name:</strong> {data.name}</p>
            <p style={{ color: theme.colors.text }}><strong>Role Seeking:</strong> {data.roleSeeking}</p>
            <p style={{ color: theme.colors.text }}><strong>Location Preference:</strong> {data.locationPreference}</p>
          </div>
          <div>
            <p style={{ color: theme.colors.text }}><strong>Hard Skills Score:</strong> {data.hardSkillsScore.toFixed(1)}%</p>
            <div className="progress-bar mt-1 mb-4" style={{ height: '12px', borderColor: theme.colors.border, backgroundColor: theme.colors.surface }}>
              <div
                className="progress-fill"
                style={{ width: `${data.hardSkillsScore}%`, height: '100%', backgroundColor: theme.colors.primary, maxWidth: '100%' }}
              ></div>
            </div>
            <p style={{ color: theme.colors.text }}><strong>Soft Skills Score:</strong> {data.softSkillsScore.toFixed(1)}%</p>
            <div className="progress-bar mt-1 mb-4" style={{ height: '12px', borderColor: theme.colors.border, backgroundColor: theme.colors.surface }}>
              <div
                className="progress-fill"
                style={{ width: `${data.softSkillsScore}%`, height: '100%', backgroundColor: theme.colors.accent, maxWidth: '100%' }}
              ></div>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <p style={{ color: theme.colors.text }}>
            <strong>Languages:</strong> {data.languages.map(l => `${l.language} (${l.proficiency})`).join(', ') || 'Not specified'}
          </p>
          <p style={{ color: theme.colors.text }}><strong>Availability:</strong> {data.availability}</p>
          <p style={{ color: theme.colors.text }}><strong>Readiness Tier:</strong> {data.readinessTier}</p>
        </div>
        <div
          className="mt-4 p-4 rounded-lg"
          style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border }}
        >
          <p style={{ color: theme.colors.text }}>
            <strong>3 a Skill Passport Status:</strong> {data.passportId} {data.passportStatus ? `| ${data.passportStatus}` : '| Verified & Active'} | Last Updated: {data.lastUpdated}
          </p>
        </div>
      </section>

      <section className={theme.spacing.sectionGap}>
        <h2 className={`${theme.fonts.heading} mb-4 flex items-center`} style={{ color: theme.colors.text }}>
          <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd"></path>
          </svg>
          TOP SKILLS – VERIFIED, RANKED & WEIGHTED
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200" style={{ borderColor: theme.colors.border }}>
            <thead style={{ backgroundColor: theme.colors.surface }}>
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Skill</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weight (%)</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method of Verification</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Application</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200" style={{ backgroundColor: theme.colors.background, borderColor: theme.colors.border }}>
              {data.hardSkills.map((skill, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap" style={{ color: theme.colors.text }}>{skill.skill}</td>
                  <td className="px-6 py-4 whitespace-nowrap" style={{ color: theme.colors.text }}>{skill.score}</td>
                  <td className="px-6 py-4 whitespace-nowrap" style={{ color: theme.colors.text }}>{skill.level}</td>
                  <td className="px-6 py-4 whitespace-nowrap" style={{ color: theme.colors.text }}>{skill.weight}%</td>
                  <td className="px-6 py-4 whitespace-nowrap" style={{ color: theme.colors.text }}>{skill.method}</td>
                  <td className="px-6 py-4 whitespace-nowrap" style={{ color: theme.colors.text }}>{skill.application}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 text-sm" style={{ color: theme.colors.text }}>
          <p><strong>Overall Score:</strong> {data.hardSkillsScore.toFixed(1)}. Readiness Tier: {data.readinessTier} with Supervision</p>
          <p><strong>Weighted Confidence:</strong> 100% — All hard skill areas verified through experience or simulation</p>
          <p className="mt-2">3a Skill Passport™ is issued by the 3rd Academy. Verified using standardized protocols and evidence logs. © 2025 The 3rd Academy. All rights reserved</p>
        </div>
      </section>

      <section className={theme.spacing.sectionGap}>
        <h2 className={`${theme.fonts.heading} mb-4 flex items-center`} style={{ color: theme.colors.text }}>
          <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd"></path>
          </svg>
          SOFT SKILLS – WORKPLACE STRENGTHS
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200" style={{ borderColor: theme.colors.border }}>
            <thead style={{ backgroundColor: theme.colors.surface }}>
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Soft Skill</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weight (%)</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method of Verification</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Application</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200" style={{ backgroundColor: theme.colors.background, borderColor: theme.colors.border }}>
              {data.softSkills.map((skill, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap" style={{ color: theme.colors.text }}>{skill.skill}</td>
                  <td className="px-6 py-4 whitespace-nowrap" style={{ color: theme.colors.text }}>{skill.score}</td>
                  <td className="px-6 py-4 whitespace-nowrap" style={{ color: theme.colors.text }}>{skill.level}</td>
                  <td className="px-6 py-4 whitespace-nowrap" style={{ color: theme.colors.text }}>{skill.weight}%</td>
                  <td className="px-6 py-4 whitespace-nowrap" style={{ color: theme.colors.text }}>{skill.method}</td>
                  <td className="px-6 py-4 whitespace-nowrap" style={{ color: theme.colors.text }}>{skill.application}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 text-sm" style={{ color: theme.colors.text }}>
          <p><strong>Overall Soft Skills Score:</strong> {data.softSkillsScore.toFixed(1)}. Readiness Tier: {data.readinessTier}</p>
          <p><strong>Confidence:</strong> Fully Verified — Inputs: logs, peer feedback, simulation</p>
          <p className="mt-2">3a Skill Passport™ is issued by the 3rd Academy. Verified using standardized protocols and evidence logs. © 2025 The 3rd Academy. All rights reserved</p>
        </div>
      </section>

      {data.growthInsight && (
        <section className={theme.spacing.sectionGap}>
          <h2 className={`${theme.fonts.heading} mb-4 flex items-center`} style={{ color: theme.colors.text }}>
            <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd"></path>
            </svg>
            GROWTH INSIGHT
          </h2>
          <p style={{ color: theme.colors.text }}>{data.growthInsight}</p>
        </section>
      )}

      {data.educationAndWorkHistory && (
        <section className={theme.spacing.sectionGap}>
          <h2 className={`${theme.fonts.heading} mb-4 flex items-center`} style={{ color: theme.colors.text }}>
            <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.84L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.84l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"></path>
            </svg>
            EDUCATION & WORK HISTORY
          </h2>
          <p style={{ color: theme.colors.text }}>{data.educationAndWorkHistory}</p>
        </section>
      )}

      {data.certificationTrail && (
        <section className={theme.spacing.sectionGap}>
          <h2 className={`${theme.fonts.heading} mb-4 flex items-center`} style={{ color: theme.colors.text }}>
            <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd"></path>
            </svg>
            CERTIFICATION TRAIL
          </h2>
          <p style={{ color: theme.colors.text }}>{data.certificationTrail}</p>
        </section>
      )}

      <section>
        <h2 className={`${theme.fonts.heading} mb-4 flex items-center`} style={{ color: theme.colors.text }}>
          <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd"></path>
          </svg>
          CAREER HIGHLIGHTS
        </h2>
        <ul className="space-y-2">
          {data.careerHighlights.map((highlight, index) => (
            <li key={index} className="flex items-start" style={{ color: theme.colors.text }}>
              <span className="mr-2" style={{ color: theme.colors.primary }}>•</span>{highlight}
            </li>
          ))}
        </ul>
      </section>

      <style jsx>{`
        .progress-bar {
          height: 12px;
          background-color: ${theme.colors.surface};
          border-radius: 6px;
          overflow: hidden;
          border: 1px solid ${theme.colors.border};
        }
        .progress-fill {
          height: 100%;
          transition: width 0.3s ease;
          border-radius: 5px;
        }
      `}</style>
    </div>
  );
}