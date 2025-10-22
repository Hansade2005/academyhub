'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Award, Globe, Users, TrendingUp, Target, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default function About() {
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
            About The 3rd Academy™
          </motion.h1>
          <motion.p
            className="text-xl md:text-2xl mb-8 opacity-90 max-w-4xl mx-auto"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            The 3rd Layer of Workforce Development: Where Workplace Skills Are Developed and Verified Using Artificial Intelligence
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
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div variants={itemVariants} className="space-y-8">
              <div className="space-y-6">
                <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  Résumés Talk. Our Artificial Intelligence Proves Readiness.
                </h2>
                <p className="text-xl text-gray-300 leading-relaxed">
                  Not a school. Not a course site. A workplace readiness engine.
                </p>
                <p className="text-lg text-gray-400 leading-relaxed">
                  The 3rd Academy is a modern, virtual institution tailored for the Artificial Intelligence (AI) era, where workplace soft skills take priority, to complement machine automation. Distinct from traditional schools or course marketplaces, The 3rd Academy utilizes AI to develop and verify the human skills essential for modern workplaces, including critical thinking, collaboration, leadership, problem-solving, and communication.
                </p>
                <p className="text-lg text-gray-400 leading-relaxed">
                  Through immersive AI simulations, performance tracking, and mentorship-supported growth, the Academy delivers real, verifiable proof of workplace readiness. It does not issue degrees or certificates.
                </p>
              </div>
            </motion.div>
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
          </div>
        </div>
      </motion.section>

      {/* Lucy's Story */}
      <motion.section
        className="py-32 relative overflow-hidden"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-950/30 to-black" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.h2
            className="text-4xl md:text-6xl font-bold text-center mb-20 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
            variants={itemVariants}
          >
            Real Stories, Real Impact
          </motion.h2>
          <div className="max-w-4xl mx-auto">
            <motion.div
              className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12"
              variants={itemVariants}
            >
              <div className="flex flex-col md:flex-row items-center gap-8">
                <motion.img
                  src="https://api.a0.dev/assets/image?text=Professional woman in business attire smiling confidently after career success&aspect=1:1&seed=lucy_story"
                  alt="Lucy - Career Success Story"
                  className="w-32 h-32 rounded-full border-4 border-indigo-500/50 shadow-lg"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                />
                <div className="flex-1 space-y-6">
                  <h3 className="text-3xl font-bold text-white">Lucy's Journey</h3>
                  <div className="space-y-4 text-gray-300 leading-relaxed">
                    <p>
                      Consider Lucy, a professional who transitioned from retail management to a new career path. She transitioned into project management within the tech industry, initially facing challenges such as learning industry methodologies and adapting to virtual work.
                    </p>
                    <p>
                      Through The 3rd Academy, Lucy engaged in AI-driven simulations and received targeted mentorship, which helped her identify and address skill gaps in three months. With actionable feedback and practical experience, she successfully transitioned into her new role.
                    </p>
                    <p className="text-indigo-400 font-semibold">
                      This is the power of AI-verified workforce readiness. Not just claims on a resume, but proven capabilities in realistic scenarios.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Key Features */}
      <motion.section
        className="py-32 relative overflow-hidden"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black via-indigo-950/50 to-black" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.h2
            className="text-4xl md:text-6xl font-bold text-center mb-20 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
            variants={itemVariants}
          >
            What Makes Us Different
          </motion.h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Award className="text-indigo-400" size={48} />,
                title: "AI-Verified Skills",
                desc: "Our proprietary AI assesses and validates workplace competencies through immersive simulations."
              },
              {
                icon: <Globe className="text-purple-400" size={48} />,
                title: "Global Standards",
                desc: "Skills are mapped to international workplace standards, ensuring universal recognition."
              },
              {
                icon: <Users className="text-pink-400" size={48} />,
                title: "Mentorship-Driven",
                desc: "Human mentorship combined with AI insights creates personalized growth paths."
              },
              {
                icon: <TrendingUp className="text-green-400" size={48} />,
                title: "Performance Tracking",
                desc: "Continuous monitoring and feedback help users improve consistently over time."
              },
              {
                icon: <Target className="text-yellow-400" size={48} />,
                title: "Real-World Application",
                desc: "Focus on practical skills that directly translate to workplace success."
              },
              {
                icon: <CheckCircle className="text-blue-400" size={48} />,
                title: "Verifiable Proof",
                desc: "Digital credentials that employers can instantly verify and trust."
              }
            ].map((feature, index) => (
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
                  {feature.icon}
                </motion.div>
                <h3 className="text-2xl font-bold mb-4 text-white">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        className="py-32 relative overflow-hidden"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.h2
            className="text-4xl md:text-6xl font-bold mb-6 text-white"
            variants={itemVariants}
          >
            Ready to Prove Your Skills?
          </motion.h2>
          <motion.p
            className="text-xl md:text-2xl mb-12 text-gray-200"
            variants={itemVariants}
          >
            Join The 3rd Academy and transform how the world sees your workplace readiness.
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto"
            variants={itemVariants}
          >
            <motion.button
              className="bg-white text-indigo-900 px-10 py-4 rounded-xl font-bold text-lg shadow-2xl"
              whileHover={{ scale: 1.05, boxShadow: "0 25px 50px -12px rgba(255, 255, 255, 0.4)" }}
              whileTap={{ scale: 0.95 }}
            >
              Get Your Skill Passport
            </motion.button>
            <Link href="/">
              <motion.button
                className="border-2 border-white text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-white hover:text-indigo-900 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Learn More
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </motion.section>

      <Footer />
    </div>
  );
}