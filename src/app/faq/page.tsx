'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// --- ACCORDION COMPONENT ---
const AccordionItem: React.FC<{ question: string; answer: string; }> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <motion.div
      className="border-b border-white/10"
      layout
    >
      <motion.button
        className="flex justify-between items-center w-full py-6 text-left"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ color: '#a78bfa' }} // lighter purple
      >
        <span className="text-lg md:text-xl font-medium text-white">{question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown size={24} />
        </motion.div>
      </motion.button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="pb-6 text-gray-400 text-base md:text-lg"
          >
            {answer}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// --- FAQ Data ---
const faqData = [
  { question: "I’m a fresh graduate. I don’t have much work experience. Why should I use a 3a Skill Passport™?", answer: "That’s exactly why you should. The 3a Skill Passport™ helps you showcase what you can do, not just where you’ve worked. We assess your practical strengths like adaptability, critical thinking, teamwork, leadership, and technical skills and give you proof to show employers you’re ready, even without years of experience." },
  { question: "I’m a mid-career professional changing fields. How does this help me?", answer: "If you're switching careers, you need to prove transferable skills. The 3a Skill Passport™ helps you highlight your core competencies — like project management, communication, or problem-solving — in the new context you're targeting. It helps you say: \"I’ve done it before, and I can do it again — here’s proof.\"" },
  { question: "I’m an HR manager. Why should I ask candidates for 3a Skill Passports?", answer: "Because it saves you time, reduces bad hires, and gives you real performance data before the interview. Instead of screening based on buzzwords or formatting, you can filter based on: • Scenario scores • Confidence indicators • Verified soft skills • Growth over time It’s smarter hiring, made simple." },
  { question: "I work at a university/college. Why should we integrate 3a Skill Passports into our graduate support?", answer: "Because your graduates need more than transcripts. They need tools that translate academic knowledge into job-readiness. By partnering with The 3rd Academy, your institution can: • Offer verified 3a Skill Passports at graduation • Improve graduate employability • Help students build performance portfolios before they even apply for jobs" },
  { question: "I’m a career counsellor or mentor. How do I use this to support my clients?", answer: "3a Skill Passports give you a clear, visual way to coach. You can use it to: • Identify real skill gaps • Track growth over time • Recommend targeted upskilling • Advocate for your mentees with verified data It becomes your most powerful coaching tool." },
  { question: "I’m an internationally trained professional. Can this help me re-enter the workforce?", answer: "Yes. This is one of the 3a Skill Passport’s most powerful use cases. While you work toward local licensing, you can use your 3a Skill Passport™ to: • Show what you can already do • Gain visibility with employers • Get interim roles as a trainer, assistant, or supervisor • Stay confident and credible in the job market" },
  { question: "Can government or public employment agencies use this?", answer: "Yes. The 3a Skill Passport™ is ideal for public programs focused on: • Youth employment • Workforce transition • Immigrant integration • Reskilling and upskilling It provides data-driven, bias-aware profiling that can complement job matching and training referrals." },
  { question: "Is this useful for people without formal education?", answer: "Absolutely. Even without a degree, you may have skills gained through work, self-learning, or life. We help you prove those skills through simulations, not credentials. Many of our users are skilled tradespeople, freelancers, or self-taught professionals." },
  { question: "Can I use this alongside my LinkedIn profile?", answer: "Yes, and you should. Think of your 3a Skill Passport™ as the proof layer behind your LinkedIn claims. You can link it in your headline, bio, or even attach it to job applications. It instantly boosts your credibility." },
  { question: "How do employers receive the 3a Skill Passport™?", answer: "Each 3a Skill Passport™ can be: • Shared as a secure link • Downloaded as a PDF • Embedded in an application portal • Verified via QR code for authenticity Employers get a visual, scored breakdown of what the candidate can do — with no fluff." },
  { question: "How do I get a 3a Skill Passport™?", answer: "You start by signing up on The 3rd Academy platform. From there, you'll select your focus area (e.g. customer service, welding, data entry, leadership, etc.), and complete: 1. A short readiness survey 2. One or more scenario-based simulations 3. A final mentor-reviewed reflection Your 3a Skill Passport™ is issued once all layers are complete." },
  { question: "How long does it take to get one?", answer: "It depends on the role and level. Most 3a Skill Passports can be completed in 1–3 hours, with mentor finalization within 2–5 business days. You’ll receive an email and dashboard notification when your 3a Skill Passport™ is verified and ready to share." },
  { question: "Do I need to pass to get one?", answer: "Not necessarily. Your 3a Skill Passport™ isn’t pass/fail — it’s evidence-based. You’ll receive: • Scores across key skills • A growth rating • A readiness tier (e.g. Ready, Emerging, Needs Support) Everyone gets feedback, and your results are recorded in your Growth Log." },
  { question: "Can I retake an assessment to improve my score?", answer: "Yes — and that’s encouraged. You can retake after a 2-week cooling period (or sooner if you complete a guided upskilling activity). Each new attempt adds a timestamped entry to your Growth Log, so employers can see how you're improving." },
  { question: "How is my Growth Log shown to employers?", answer: "Your Growth Log is a toggleable section on your 3a Skill Passport™. It shows: • Skill scores over time • Badges earned (e.g. “Most Improved”) • Milestones (e.g. simulation level unlocked, mentor commendation) It’s a story of your learning — not just a snapshot." },
  { question: "Is the 3a Skill Passport™ recognized by employers?", answer: "Yes, and recognition is growing rapidly. The 3a Skill Passport™ is already being used by: • Hiring managers who want performance proof • Career mentors supporting re-entry • Government reskilling agencies • Post-secondary transition programs We’re also integrating it into job boards and applications." },
  { question: "How long is my 3a Skill Passport™ valid for?", answer: "Each 3a Skill Passport™ includes a validity window (typically 12 months). You can refresh it anytime through a light re-assessment or live task demo — and update your Growth Log with new scores." },
  { question: "Can I have multiple 3a Skill Passports?", answer: "Yes. You can build a portfolio of 3a Skill Passports across different domains (e.g. soft skills, technical skills, sector-specific roles). Each one is stored in your dashboard and can be shared independently or as a collection." },
  { question: "Can I link it to my resume, website, or LinkedIn?", answer: "Absolutely. Each 3a Skill Passport™ has: • A unique shareable link • A QR code for printed CVs • An option to embed in digital portfolios or job applications You control your visibility — always." },
  { question: "What happens if I lose access or change careers?", answer: "Your 3a Skill Passport™ is stored in your personal dashboard — even if you change roles, email, or industries. You can always: • Download it as a PDF • Update your focus • Build a new 3a Skill Passport™ for your next step Your Growth Log remains intact, showing your evolution over time." },
  { question: "Does the 3a Skill Passport™ still include my education and work history?", answer: "Yes, but in a more innovative way. Your education, work history, certifications, and affiliations are still included in your 3a Skill Passport™, just not in the spotlight. They're placed in a toggleable section, so they’re visible when needed, but no longer the center of your credibility." },
  { question: "Why is work history hidden by default?", answer: "Because in modern hiring, what you can do now matters more than where you worked before. The 3a Skill Passport™ puts your skills, readiness, and growth first. Work history is still accessible, but no longer used as a shortcut for assuming competence." },
  { question: "Can I still use the 3a Skill Passport™ like a CV?", answer: "Yes, and better. You can: • Download a printable version • Share it like a portfolio • Link it in applications • Embed it in your LinkedIn or website And unlike a traditional CV, it’s scored, verified, and evidence-based." },
  { question: "What if an employer still wants to see my job titles or companies?", answer: "They can, instantly. The 3a Skill Passport™ has a “View Background” toggle, which reveals: • Past employers • Roles and durations • Academic qualifications All in a clean, collapsible section — without overshadowing your proven abilities." },
  { question: "Why does The 3rd Academy prioritize skills over work history?", answer: "Because skills are transferable. Work history is about where you've been. Skills show what you can bring today, especially for: • Career switchers • Graduates • Gig workers • International professionals • Returnees and re-entrants The 3a Skill Passport™ is designed to elevate ability, not just autobiography." },
  { question: "Does the 3a Skill Passport™ still show my major career accomplishments?", answer: "Yes — proudly and prominently. Your key achievements appear early in your 3a Skill Passport™ under a section called “Career Highlights”. They are short, high-impact proof points — just like your resume, but framed around results, not roles." },
  { question: "Where do these highlights come from?", answer: "You can enter them manually, just like a resume. Or — if you completed assessments or projects through The 3rd Academy — we’ll auto-suggest highlights based on your Transcript™, including: • Leadership examples • Quantified outcomes • Certifications • System builds • Promotions You always have final control over what shows." },
  { question: "Can I highlight accomplishments even if I haven’t held many formal jobs?", answer: "Absolutely. The 3a Skill Passport™ celebrates: • Volunteer work • School projects • Side gigs • Technical builds • Online certifications As long as they demonstrate real ability, you can highlight them here." },
  { question: "How many career highlights can I include?", answer: "You can include up to 6 core highlights, each limited to 25 words. These are curated to keep your Abstract sharp and focused, just enough to impress quickly and credibly." },
  { question: "What makes this different from a standard resume bullet list?", answer: "Two big things: 1. These are verified — either through skills assessment, mentor validation, or linked proof. 2. They’re framed as part of a proof-first story, not just job title filler. It’s not just: “Worked at Company X.” It’s: “Installed 120 kW of rooftop solar across 3 regions with 98% uptime.” That’s what hiring managers want to see." },
  { question: "Is there a cost to get my 3a Skill Passport™?", answer: "Yes. There's a small fee to access the full process, which includes guided skill identification, AI- assisted testing, mentor-reviewed scoring, and the official 3a Skill Passport™ you can share. Think of it like paying for a certification or exam — but faster and more useful." },
  { question: "How much does it cost?", answer: "Right now, the early launch price is under $50 CAD. This covers the full process: skill assessment, human review, growth log, and an exportable 3a Skill Passport™. Pricing tiers may evolve as we introduce more features like mock interviews, career tracks, or portfolio reviews." },
  { question: "Why should I pay when job boards are free?", answer: "Because job boards list jobs. They don’t prove your readiness. The 3a Skill Passport™ actually shows what you can do — verified. It gives you a credibility boost that gets hiring managers to notice you faster. You’re not paying to “find a job.” You’re paying to stand out." },
  { question: "Do I have to pay again if I want to update my 3a Skill Passport™ later?", answer: "No. Minor updates, such as refreshing your portfolio or growth log, are free for 12 months. If you want a full reassessment or new 3a Skill Passport™ based on new skill tracks, there's a small retesting fee usually half the original cost." },
  { question: "Is there a money-back guarantee?", answer: "Yes, if you don’t receive your verified 3a Skill Passport™ within 10 days of completing your assessment, or if you’re unsatisfied with the process, we offer a full refund. But this is subject to our terms and Conditions. We’re building trust, not barriers." },
  { question: "Do employers have to pay to view a 3a Skill Passport™?", answer: "No. 3a Skill Passports™ are shareable. Candidates can send you their unique URL or QR code. You view it just like a resume — but with proof, rankings, and links." },
  { question: "What if we want to request 3a Skill Passports™ from candidates ourselves?", answer: "Then yes — there’s a business account option. You’ll get a dashboard to: • Request assessments from applicants • View all abstracts in one place • Compare skill maps Pricing starts from $49/month (pilot pricing)." },
  { question: "What’s the ROI for hiring managers?", answer: "You save hours of screening, reduce the risk of hiring unproven candidates, and increase team fit. It’s like seeing inside the candidate’s actual performance before you hire them. That’s priceless." },
  { question: "Can we bulk-assess multiple candidates?", answer: "Yes. You can send bulk 3a Skill Passport™ invites and track their status. Ideal for internships, junior hires, or retraining programs." },
  { question: "Is there a discount for nonprofits or workforce programs?", answer: "Yes. The 3rd Academy offers social-impact licensing, with reduced fees for: • Nonprofits • Governments • Bridging and upskilling programs • Public institutions We’re here to democratize access, not gatekeep it." },
  { question: "Who owns my data — and is it secure?", answer: "You own your data. All 3a Skill Passports™, transcripts, and test records are securely encrypted and stored using industry-grade protocols. We never sell or share your personal data. You control who sees your 3a Skill Passport, and can toggle sensitive details on or off at any time." },
  { question: "Isn't AI scoring still biased?", answer: "We agree: AI alone isn’t enough. Our process uses AI only for performance classification, i.e detecting skill indicators and scenario outcomes. But final scores are reviewed and validated by trained human assessors who take context, growth, and real-world factors into account. We also monitor scoring patterns for bias across gender, location, and background." },
  { question: "Is the 3a Skill Passport™ accessible and available in other languages?", answer: "For now, 3a Skill Passports™ are in English, but designed with simple, global clarity. Multilingual versions are coming soon. We’re also working toward accessibility compliance, including support for screen readers, dyslexia-friendly options, and mobile-first experiences." },
  { question: "How do you prevent cheating in the assessments?", answer: "Every 3a Skill Passport™ is built on interactive simulations, not memorized answers. Tasks are randomized, time-bound, and require real-time decisions which can’t be Googled. For high-trust assessments, AI proctoring (via webcam or behaviour tracking) ensures integrity without stress." },
  { question: "Does a 3a Skill Passport™ expire? How do I update it?", answer: "It never “expires” — but we recommend retesting or updating every 6–12 months. Your growth log tracks improvements, and you can retest specific skills as you learn more. The system will nudge you when your 3a Skill Passport™ becomes outdated based on employer expectations or scoring changes." },
  { question: "Are you working with employers, schools, or government bodies?", answer: "Yes. The 3rd Academy is building partnerships with: • Hiring managers (to embed 3a Skill Passports into their screening) • Tertiary institutions (to issue 3a Skill Passports alongside transcripts) • Public workforce agencies (for re-entry, newcomers, and veterans) These partnerships build credibility and increase adoption across sectors." },
  { question: "Is the 3a Skill Passport replacing the résumé?", answer: "No. It’s designed to complement the résumé, not replace it. Candidates are advised to submit both their résumé and 3a Skill Passport together." },
  { question: "Can I upload it to any job board or ATS?", answer: "Yes. The 3a Skill Passport is formatted to be ATS-compliant: • Clean text • No images or columns • Compatible file formats (.pdf, .docx)" },
  { question: "What does the QR code and link do?", answer: "The QR code and link both point to the candidate’s full 3a Skill Passport — a secure online profile that shows all verified skills, simulation logs, growth scores, and mentor feedback." },
  { question: "Who verifies the information in the 3a Skill Passport?", answer: "All content is verified by The 3rd Academy using: • AI-assisted simulations • Structured feedback from mentors • Performance trend data over time" },
  { question: "What if my employer doesn’t understand what this is?", answer: "Each 3a Skill Passport includes a footer link to an HR-facing FAQ page explaining what it is, how to read it, and why it matters in hiring." },
  { question: "How do I get my own 3a Skill Passport?", answer: "Log in to your 3rd Academy profile, complete your Skill Passport, then click “Download 3a Skill Passport.” You can choose between: • Standalone 3a Skill Passport. • Résumé + 3rd academy Skill Abstract combo • Lite version (for mobile upload)" },
  { question: "How often should I update my 3a Skill Passport?", answer: "We recommend updating it every 60–90 days — especially after completing new simulations or receiving new mentor feedback." },
  { question: "Is this document recognized by employers?", answer: "Yes. It’s already being used by employers seeking proof-based hiring signals. As hiring evolves, documents like the 3a 3a Skill Passport are becoming a trusted supplement to traditional résumés." },
  { question: "How much does a 3a Skill Passport cost?", answer: "Pricing is simple. Starter/Core/Pro tiers under $50 CAD are available, plus employer licenses. Student/non-profit discounts can apply. (You’ll choose a tier at checkout.)" },
  { question: "What’s included in the price?", answer: "• Your 3a Skill Passport (ATS-friendly, 1 page) • Link + QR to your full 3a Skill Passport • Verified badge and issue timestamp • One refresh/update within 60–90 days after new proof is added" },
  { question: "Do I pay again when I update it?", answer: "Your plan includes at least one refresh after you add new simulations or mentor reviews. Heavy users can upgrade for unlimited refreshes." },
  { question: "Can I try it first?", answer: "Yes. A Lite preview shows your layout and sections. It’s watermarked “Preview- Not Verified.” You upgrade to publish the verified version." },
  { question: "Do employers pay anything to view it?", answer: "No. Employers view for free. If they want bulk dashboards or API access, that’s on an employer plan." },
  { question: "What if I don’t have simulations yet?", answer: "Run a quick starter simulation or request a mentor review. That gives you verified evidence. Without it, you’ll only get a Preview version." },
  { question: "Will it work with job boards and ATS?", answer: "Yes. It’s ATS-compatible: clean text, single column, accessible fonts, no heavy graphics. Upload it alongside your résumé." },
  { question: "What’s in it for hiring managers?", answer: "• Deeper signal before interviews • A link to the full 3a Skill Passport (evidence, logs, trends) • Defensible decisions supported by structured assessments" },
  { question: "Is it secure and auditable?", answer: "Yes. Links are tokenized, QR points to a secure page, and each Abstract carries an issue timestamp. The candidate can revoke access." }
];

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-black text-gray-300 font-sans">
      <Header />
      <section
        id="faq-page"
        className="py-32 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black via-indigo-950/50 to-black" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h1
            className="text-5xl md:text-7xl font-bold text-center mb-20 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
          >
            Frequently Asked Questions
          </h1>
          <div className="space-y-4">
            {faqData.map((faq, i) => (
              <AccordionItem key={i} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
