'use client'
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useInView, animate, useMotionValue } from 'framer-motion';
import { Menu, X, Star, Mail, GraduationCap, Globe, ArrowRightLeft, Building, Zap, CheckCircle, Twitter, Linkedin, Github, Share2, Users, Award, TrendingUp, Target, UserPlus, Briefcase, ChevronDown } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Chatbot from '@/components/Chatbot';

// --- ACCORDION COMPONENT (Lifted outside main export) ---
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

// --- ANIMATED STAT COMPONENT (Lifted outside main export) ---
const AnimatedStat: React.FC<{ to: number }> = ({ to }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, latest => Math.round(latest));
  const ref = React.useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.1 });

  useEffect(() => {
    if (inView) {
      animate(count, to, { duration: 2, ease: "easeOut" });
    }
  }, [inView, count, to]);

  return <motion.span ref={ref}>{rounded}</motion.span>;
};


// --- Main Page Component (Exported as default Home) ---
export default function Home() {
  const { scrollYProgress } = useScroll();
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const [activeTab, setActiveTab] = useState('Students');

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

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Software Engineer",
      content: "The 3a Skill Passport transformed how employers view my skills. It's proof, not just claims!",
      rating: 5,
      image: "https://api.a0.dev/assets/image?text=Professional woman smiling&aspect=1:1&seed=sarah"
    },
    {
      name: "Marcus Johnson",
      role: "Project Manager",
      content: "Finally, a way to showcase real workplace readiness. The AI verification is game-changing.",
      rating: 5,
      image: "https://api.a0.dev/assets/image?text=Confident man in business attire&aspect=1:1&seed=marcus"
    },
    {
      name: "Emma Rodriguez",
      role: "UX Designer",
      content: "My confidence score helped me land my dream job. This is the future of talent validation.",
      rating: 5,
      image: "https://api.a0.dev/assets/image?text=Creative woman with design tools&aspect=1:1&seed=emma"
    }
  ];

  const stats = [
    { number: "10000+", label: "Skills Verified", icon: <CheckCircle size={32} className="text-green-500" /> },
    { number: "500+", label: "Partner Companies", icon: <Building size={32} className="text-blue-500" /> },
    { number: "95%", label: "Success Rate", icon: <TrendingUp size={32} className="text-purple-500" /> },
    { number: "50+", label: "Countries Reached", icon: <Globe size={32} className="text-indigo-500" /> }
  ];

  const howItWorksSteps = [
    { icon: <UserPlus size={40} className="text-indigo-400" />, title: "Sign Up", desc: "Create your secure profile in minutes." },
    { icon: <Target size={40} className="text-purple-400" />, title: "Assess Skills", desc: "Take AI-powered simulations and tests." },
    { icon: <CheckCircle size={40} className="text-green-400" />, title: "Get Verified", desc: "Earn your 3a Skill Passport™ with a Confidence Score." },
    { icon: <Briefcase size={40} className="text-pink-400" />, title: "Connect", desc: "Share your passport with employers and unlock opportunities." }
  ];

  const tabContent = {
    Students: {
      icon: <GraduationCap />,
      text: "Turn your academic projects and internships into verifiable proof of workplace readiness. Stand out to employers before you even graduate and land your dream job faster."
    },
    Professionals: {
      icon: <Briefcase />,
      text: "Showcase your real-world experience and upskilling efforts. Use your Skill Passport to validate your expertise, negotiate raises, and transition into new roles with confidence."
    },
    Employers: {
      icon: <Building />,
      text: "Hire with certainty. Move beyond resumes and interviews to see verified proof of a candidate's abilities. Reduce hiring risk, save time, and find the perfect fit, faster."
    }
  };

  const faqData = [
    { question: "What is the 3a Skill Passport™?", answer: "It's a verified, portable, digital profile issued by The 3rd Academy™. It uses AI-powered assessments and simulations to provide proof of your workplace skills, not just claims on a resume. It includes a unique 'Confidence Score™' to show employers your level of mastery." },
    { question: "How is this different from a resume or a course certificate?", answer: "A resume is a list of claims. A certificate proves you completed a course. The 3a Skill Passport™ proves you can *apply* your skills in realistic workplace scenarios. It's dynamic, tracks your growth, and is verified by an objective AI, making it far more powerful." },
    { question: "What is the Confidence Score™?", answer: "The Confidence Score™ is a proprietary metric that measures your workforce readiness. It's based on your performance, consistency, trend (improvement over time), and the depth of your skills shown in our assessments. A higher score gives employers strong confidence in your abilities." },
    { question: "Is The 3rd Academy™ an accredited institution?", answer: "We are a 'proof-based institution,' which is a new category. While we are not a traditional accredited university, our verification is trusted by a growing network of partner companies and hiring managers who value practical, demonstrated skill over traditional credentials alone." },
    { question: "How much does it cost?", answer: "We offer various tiers, including a free 'Passport-Lite' to get started. Full verification and access to premium assessments are part of our paid plans. We aim to keep it accessible for all individuals serious about their careers." }
  ];


  return (
    <>
      {/* Global style for smooth scrolling */}
      <style>{`
        html {
          scroll-behavior: smooth;
        }
      `}</style>
      <div className="min-h-screen bg-black text-gray-300 font-sans">
        {/* Animated Background Elements - More subtle on dark bg */}
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

        {/* Scroll Progress Bar */}
        <motion.div
          className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-600 to-purple-600 z-50 origin-left"
          style={{ scaleX }}
        />

        <Header />

        {/* Hero Section */}
        <motion.section
          className="relative text-white py-32 md:py-40 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          {/* Mobile Background Image */}
          <div
            className="md:hidden absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('https://api.a0.dev/assets/image?text=Magical mobile hero background with glowing futuristic particles, abstract AI neural networks, inspiring career success visualizations, soft tech waves and magical light effects for workforce development&aspect=16:9&seed=magical_mobile_hero')`
            }}
          />
          {/* Desktop Gradient Background */}
          <div className="hidden md:block absolute inset-0 bg-gradient-to-br from-indigo-950 via-purple-950 to-black opacity-80" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid md:grid-cols-2 gap-8 items-center">
            <div className="text-center md:text-left">
              <motion.h2
                className="text-4xl md:text-7xl font-extrabold mb-6 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1, delay: 0.2 }}
              >
                The 3rd Layer of Workforce Development
              </motion.h2>
              <motion.p
                className="text-xl md:text-2xl mb-8 opacity-90 max-w-2xl mx-auto md:mx-0"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Powered by AI, Driven by Humans. Develop, Test, and Prove Workplace Skills in a Virtual Proof-Based Institution.
              </motion.p>
              <motion.div
                className="flex flex-col sm:flex-row justify-center md:justify-start gap-4"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <motion.button
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 rounded-xl font-bold text-lg shadow-2xl shadow-indigo-600/40 transition-all duration-300"
                  whileHover={{ scale: 1.05, boxShadow: "0 25px 50px -12px rgba(99, 102, 241, 0.4)" }}
                  whileTap={{ scale: 0.95 }}
                >
                  Get Your Skill Passport
                </motion.button>
                <motion.button
                  className="border-2 border-white text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-white hover:text-indigo-900 transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Learn More
                </motion.button>
              </motion.div>
            </div>
            <motion.div 
              className="relative hidden md:block"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              <motion.img
                src="https://api.a0.dev/assets/image?text=Futuristic digital passport UI with glowing graphs and verification badges&aspect=3:4&seed=passport_mockup"
                alt="Skill Passport Mockup"
                className="rounded-2xl shadow-2xl border-4 border-indigo-500/30"
                animate={{
                  y: [-10, 10, -10],
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div className="absolute -top-8 -left-8 w-24 h-24 bg-purple-600/50 rounded-full blur-2xl" />
              <motion.div className="absolute -bottom-8 -right-8 w-24 h-24 bg-indigo-600/50 rounded-full blur-2xl" />
            </motion.div>
          </div>
        </motion.section>

        {/* How It Works Section */}
        <motion.section
          id="how"
          className="py-32 relative overflow-hidden"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black via-indigo-950/30 to-black" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.h2
              className="text-5xl md:text-7xl font-bold text-center mb-20 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
              variants={itemVariants}
            >
              How It Works
            </motion.h2>
            <div className="grid md:grid-cols-4 gap-8">
              {howItWorksSteps.map((step, index) => (
                <motion.div
                  key={index}
                  className="relative group p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl text-center"
                  variants={itemVariants}
                  whileHover={{ y: -10, borderColor: 'rgba(129, 140, 248, 0.5)' }}
                >
                  <div className="absolute -top-1 -right-1 w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
                  <motion.div 
                    className="mb-6 flex justify-center"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    {step.icon}
                  </motion.div>
                  <h3 className="text-2xl font-bold mb-3 text-white">{step.title}</h3>
                  <p className="text-gray-400">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* What is The 3rd Academy - Premium Design */}
        <motion.section
          id="about"
          className="py-32 relative overflow-hidden"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black via-indigo-950/50 to-black" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.h2
              className="text-5xl md:text-7xl font-bold text-center mb-20 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
              variants={itemVariants}
            >
              What Is The 3rd Academy?
            </motion.h2>
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <motion.div variants={itemVariants} className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl opacity-20 group-hover:opacity-40 blur-2xl transition-all duration-500" />
                <motion.img
                  src="https://api.a0.dev/assets/image?text=AI and human collaboration in futuristic virtual academy with holographic displays and neural networks&aspect=16:9&seed=collaboration_ai"
                  alt="AI and Human Collaboration"
                  className="relative rounded-3xl shadow-2xl border border-white/10"
                  whileHover={{ scale: 1.02, rotateY: 5, rotateX: 5 }}
                  transition={{ duration: 0.5 }}
                  style={{ transformStyle: 'preserve-3d' }}
                />
              </motion.div>
              <motion.div variants={itemVariants} className="space-y-8">
                <p className="text-xl md:text-2xl text-gray-300 leading-relaxed">
                  The 3rd Academy™ is a <span className="text-indigo-400 font-semibold">virtual institution</span> powered by AI, driven by humans. It's not a conventional school or course site—it's a{' '}
                  <span className="text-purple-400 font-semibold">proof-based institution</span> that prepares candidates for work and validates workplace readiness.
                </p>
                <ul className="space-y-6">
                  {[
                    { 
                      icon: <Award className="text-indigo-400" size={24} />,
                      text: "Issues the 3a Skill Passport™: A proof-based evolution of résumés"
                    },
                    {
                      icon: <Globe className="text-purple-400" size={24} />,
                      text: "Virtual platform for developing, testing, and proving workplace skills"
                    },
                    {
                      icon: <Users className="text-pink-400" size={24} />,
                      text: "Trusted by mentors, employers, and hiring managers worldwide"
                    }
                  ].map((item, index) => (
                    <motion.li
                      key={index}
                      className="flex items-start gap-4 p-4 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-indigo-500/50 transition-all duration-300 group"
                      initial={{ opacity: 0, x: -50 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.2 }}
                      viewport={{ once: true }}
                      whileHover={{ x: 10, backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
                    >
                      <motion.div
                        className="mt-1"
                        whileHover={{ scale: 1.2, rotate: 360 }}
                        transition={{ duration: 0.5 }}
                      >
                        {item.icon}
                      </motion.div>
                      <span className="text-gray-300 text-lg">{item.text}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </div>
        </motion.section>
        
        {/* Who Is It For? Section */}
        <motion.section
          id="features"
          className="py-32 relative overflow-hidden"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-950/30 to-black" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.h2
              className="text-5xl md:text-7xl font-bold text-center mb-20 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
              variants={itemVariants}
            >
              Who Is It For?
            </motion.h2>
            <div className="grid md:grid-cols-3 gap-8 items-center">
              {/* Tabs */}
              <motion.div className="flex md:flex-col gap-4" variants={itemVariants}>
                {Object.keys(tabContent).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`w-full p-6 rounded-2xl text-left transition-all duration-300 ${
                      activeTab === tab
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                        : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    <span className="text-2xl font-bold">{tab}</span>
                  </button>
                ))}
              </motion.div>

              {/* Tab Content */}
              <motion.div className="md:col-span-2 p-10 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/10 rounded-3xl min-h-[250px]"
                variants={itemVariants}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col md:flex-row items-center gap-6"
                  >
                    <div className="text-indigo-400 text-6xl">
                      {tabContent[activeTab as keyof typeof tabContent].icon}
                    </div>
                    <p className="text-xl md:text-2xl text-gray-300 leading-relaxed">
                      {tabContent[activeTab as keyof typeof tabContent].text}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            </div>
          </div>
        </motion.section>


        {/* Now Available - Ultra Modern Cards */}
        <motion.section
          id="available"
          className="py-32 relative overflow-hidden"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-950/30 to-black" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.h2
              className="text-5xl md:text-7xl font-bold text-center mb-20 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
              variants={itemVariants}
            >
              Now Available
            </motion.h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: "3a Skill Passport™",
                  desc: "Your verified, portable proof of skills. Offered in English and French.",
                  icon: <GraduationCap size={56} className="text-indigo-400" />,
                  gradient: "from-indigo-600/20 to-purple-600/20",
                  glow: "rgba(99, 102, 241, 0.3)"
                },
                {
                  title: "TalentVisa™",
                  desc: "Connect with global opportunities. Available in English and French.",
                  icon: <Globe size={56} className="text-purple-400" />,
                  gradient: "from-purple-600/20 to-pink-600/20",
                  glow: "rgba(168, 85, 247, 0.3)"
                },
                {
                  title: "T3X Talent Exchange",
                  desc: "Exchange talents and skills worldwide. Bilingual support.",
                  icon: <ArrowRightLeft size={56} className="text-pink-400" />,
                  gradient: "from-pink-600/20 to-indigo-600/20",
                  glow: "rgba(236, 72, 153, 0.3)"
                }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  className="relative group"
                  variants={itemVariants}
                  whileHover={{ y: -15 }}
                >
                  <motion.div
                    className="absolute -inset-1 bg-gradient-to-r opacity-0 group-hover:opacity-100 rounded-3xl blur-xl transition-all duration-500"
                    style={{ background: `radial-gradient(circle at center, ${item.glow}, transparent)` }}
                  />
                  <div className={`relative bg-gradient-to-br ${item.gradient} backdrop-blur-xl border border-white/10 p-10 rounded-3xl h-full group-hover:border-white/30 transition-all duration-500`}>
                    <motion.div 
                      className="mb-6 flex justify-center"
                      whileHover={{ scale: 1.2, rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      {item.icon}
                    </motion.div>
                    <h3 className="text-2xl md:text-3xl font-bold mb-4 text-white text-center">{item.title}</h3>
                    <p className="text-gray-300 text-lg text-center leading-relaxed">{item.desc}</p>
                    <motion.button
                      className="mt-6 w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold transition-all duration-300"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Learn More →
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Coming Soon - Animated Preview */}
        <motion.section
          id="coming"
          className="py-32 relative overflow-hidden"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black via-indigo-950/50 to-black" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.h2
              className="text-5xl md:text-7xl font-bold text-center mb-20 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
              variants={itemVariants}
            >
              Coming Soon
            </motion.h2>
            <div className="grid md:grid-cols-2 gap-10">
              {[
                {
                  title: "LiveWorks™ Studio",
                  desc: "Real-time collaborative workspace for skill development with AI assistance.",
                  gradient: "from-indigo-600/30 to-purple-600/30",
                  icon: <Building size={56} className="text-indigo-400" />,
                  features: ["AI-Powered Collaboration", "Real-time Feedback", "Project Simulations"]
                },
                {
                  title: "BridgeFast™ Pathways",
                  desc: "Accelerated career pathways powered by AI insights and mentorship.",
                  gradient: "from-purple-600/30 to-pink-600/30",
                  icon: <Zap size={56} className="text-purple-400" />,
                  features: ["Career Mapping", "AI Mentorship", "Fast-Track Programs"]
                }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  className="relative group"
                  variants={itemVariants}
                  whileHover={{ scale: 1.03 }}
                >
                  <div className="absolute -inset-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl opacity-20 group-hover:opacity-40 blur-2xl transition-all duration-500" />
                  <div className={`relative bg-gradient-to-br ${item.gradient} backdrop-blur-xl border border-white/10 p-10 rounded-3xl group-hover:border-white/30 transition-all duration-500`}>
                    <motion.div
                      className="mb-6 flex justify-center"
                      animate={{
                        y: [0, -10, 0],
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      {item.icon}
                    </motion.div>
                    <h3 className="text-3xl md:text-4xl font-bold mb-4 text-white">{item.title}</h3>
                    <p className="text-gray-300 text-lg mb-6 leading-relaxed">{item.desc}</p>
                    <div className="space-y-3 mb-6">
                      {item.features.map((feature, i) => (
                        <motion.div
                          key={i}
                          className="flex items-center gap-3 text-gray-400"
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                        >
                          <CheckCircle size={20} className="text-green-400" />
                          <span>{feature}</span>
                        </motion.div>
                      ))}
                    </div>
                    <motion.div 
                      className="inline-block px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full text-white font-semibold text-sm"
                      animate={{
                        boxShadow: [
                          '0 0 20px rgba(139, 92, 246, 0.3)',
                          '0 0 40px rgba(139, 92, 246, 0.6)',
                          '0 0 20px rgba(139, 92, 246, 0.3)',
                        ],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      Launching Q1 2026
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Meet the 3a Skill Passport - Immersive */}
        <motion.section
          id="passport"
          className="py-32 relative overflow-hidden"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-950/30 to-black" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.h2
              className="text-5xl md:text-7xl font-bold text-center mb-20 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
              variants={itemVariants}
            >
              Meet the 3a Skill Passport™
            </motion.h2>
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <motion.div variants={itemVariants} className="space-y-8 order-2 md:order-1">
                <p className="text-xl md:text-2xl text-gray-300 leading-relaxed">
                  Issued by The 3rd Academy™, a virtual institution focused on{' '}
                  <span className="text-indigo-400 font-semibold">AI-verification</span> of workforce readiness. 
                  It's a verified, portable profile that shows what you can{' '}
                  <span className="text-purple-400 font-semibold">actually do</span>—not what you claim.
                </p>
                <ul className="space-y-5">
                  {[
                    { icon: <TrendingUp />, text: "How you've grown in skills over time with visual progress charts" },
                    { icon: <Star />, text: "Real project outcomes and mentor ratings with detailed feedback" },
                    { icon: <Target />, text: "Simulation performance metrics and scenario-based assessments" },
                    { icon: <Award />, text: "Confidence Score™ based on consistency, trend, and depth" },
                    { icon: <CheckCircle />, text: "Skills mapped to industry standards and job requirements" }
                  ].map((item, index) => (
                    <motion.li
                      key={index}
                      className="flex items-start gap-4 p-4 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-purple-500/50 transition-all duration-300"
                      initial={{ opacity: 0, x: -30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      viewport={{ once: true }}
                      whileHover={{ x: 10, backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
                    >
                      <motion.div
                        className="text-green-400 mt-1"
                        whileHover={{ scale: 1.2, rotate: 360 }}
                        transition={{ duration: 0.5 }}
                      >
                        {item.icon}
                      </motion.div>
                      <span className="text-gray-300 text-lg">{item.text}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
              <motion.div variants={itemVariants} className="relative group order-1 md:order-2">
                <div className="absolute -inset-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl opacity-20 group-hover:opacity-40 blur-2xl transition-all duration-500" />
                <motion.img
                  src="https://api.a0.dev/assets/image?text=Digital skill passport hologram with glowing AI verification badges, progress charts, and neural network connections&aspect=4:3&seed=passport_hologram"
                  alt="3a Skill Passport Visualization"
                  className="relative rounded-3xl shadow-2xl border border-white/10"
                  whileHover={{ 
                    scale: 1.05,
                    rotateY: 10,
                    rotateX: 5,
                  }}
                  transition={{ duration: 0.6 }}
                  style={{ transformStyle: 'preserve-3d' }}
                />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-t from-purple-600/20 to-transparent rounded-3xl"
                  animate={{
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Stats Section - Dynamic */}
        <motion.section
          className="py-32 relative overflow-hidden"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/50 via-purple-900/50 to-pink-900/50" />
          <div className="absolute inset-0 backdrop-blur-sm" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.h2
              className="text-5xl md:text-7xl font-bold text-center mb-20 text-white"
              variants={itemVariants}
            >
              The 3rd Academy by Numbers
            </motion.h2>
            <div className="grid md:grid-cols-4 gap-8">
              {stats.map((stat, index) => {
                const num = parseInt(stat.number.replace('+', '').replace('%', ''));
                const suffix = stat.number.includes('+') ? '+' : (stat.number.includes('%') ? '%' : '');
                
                return (
                  <motion.div
                    key={index}
                    className="relative group"
                    variants={itemVariants}
                    whileHover={{ y: -10, scale: 1.05 }}
                  >
                    <div className="absolute -inset-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-50 blur-xl transition-all duration-500" />
                    <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 p-8 rounded-2xl text-center group-hover:border-white/30 transition-all duration-500">
                      <motion.div 
                        className="mb-4 flex justify-center"
                        whileHover={{ scale: 1.3, rotate: 360 }}
                        transition={{ duration: 0.6 }}
                      >
                        {stat.icon}
                      </motion.div>
                      <div
                        className="text-5xl md:text-6xl font-bold mb-2 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent"
                      >
                        <AnimatedStat to={num} />{suffix}
                      </div>
                      <p className="text-xl text-gray-300">{stat.label}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.section>

        {/* Testimonials - Premium 3D Cards */}
        <motion.section
          id="testimonials"
          className="py-32 relative overflow-hidden"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black via-indigo-950/30 to-black" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.h2
              className="text-5xl md:text-7xl font-bold text-center mb-20 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
              variants={itemVariants}
            >
              What Our Users Say
            </motion.h2>
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  className="relative group"
                  variants={itemVariants}
                  whileHover={{
                    y: -10,
                    rotateY: 5,
                    rotateX: 5,
                  }}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <div className="absolute -inset-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl opacity-0 group-hover:opacity-30 blur-xl transition-all duration-500" />
                  <div className="relative bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/10 p-8 rounded-3xl group-hover:border-white/30 transition-all duration-500 h-full">
                    <div className="flex items-center mb-6 gap-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.1 }}
                        >
                          <Star className="w-5 h-5 text-yellow-400 fill-current" />
                        </motion.div>
                      ))}
                    </div>
                    <p className="text-gray-300 mb-8 italic text-lg leading-relaxed">"{testimonial.content}"</p>
                    <div className="flex items-center gap-4 mt-auto">
                      <motion.img
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="w-14 h-14 rounded-full border-2 border-indigo-500/50 shadow-lg"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                      />
                      <div>
                        <h4 className="font-bold text-white text-lg">{testimonial.name}</h4>
                        <p className="text-indigo-400 text-sm">{testimonial.role}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* FAQ Section */}
        <motion.section
          id="faq"
          className="py-32 relative overflow-hidden"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black via-indigo-950/50 to-black" />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.h2
              className="text-5xl md:text-7xl font-bold text-center mb-20 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
              variants={itemVariants}
            >
              Frequently Asked Questions
            </motion.h2>
            <motion.div className="space-y-4" variants={itemVariants}>
              {faqData.map((faq, i) => (
                <AccordionItem key={i} question={faq.question} answer={faq.answer} />
              ))}
            </motion.div>
          </div>
        </motion.section>


        {/* Final CTA Section */}
        <motion.section
          className="py-32 relative overflow-hidden"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900" />
          <div className="absolute inset-0">
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1.5, 0],
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <motion.h2
              className="text-5xl md:text-7xl font-bold mb-6 text-white"
              variants={itemVariants}
            >
              Get Started on Your Future Today
            </motion.h2>
            <motion.p
              className="text-xl md:text-2xl mb-12 text-gray-200"
              variants={itemVariants}
            >
              Sign up for the 3a Skill Passport™ and get early access to new features, insights, and opportunities.
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto"
              variants={itemVariants}
            >
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-6 py-4 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-lg"
              />
              <motion.button
                className="bg-white text-indigo-900 px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 relative overflow-hidden group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Mail size={20} />
                  Subscribe
                </span>
              </motion.button>
            </motion.div>
          </div>
        </motion.section>

        {/* Floating CTA - Enhanced */}
        <Chatbot />

        <Footer />
      </div>
    </>
  );
};
