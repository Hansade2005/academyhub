'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Users, Target, Zap, Heart, MapPin, Clock, DollarSign } from 'lucide-react';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default function Careers() {
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
            Join The 3rd Academy™
          </motion.h1>
          <motion.p
            className="text-xl md:text-2xl mb-8 opacity-90 max-w-4xl mx-auto"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Shape the future of workforce development with AI-powered innovation
          </motion.p>
        </div>
      </motion.section>

      {/* Our Values */}
      <motion.section
        className="py-32 relative overflow-hidden"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black via-indigo-950/30 to-black" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.h2
            className="text-4xl md:text-6xl font-bold text-center mb-20 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
            variants={itemVariants}
          >
            Our Values
          </motion.h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Users className="text-indigo-400" size={48} />,
                title: "Collaboration First",
                desc: "We believe in the power of teamwork and diverse perspectives to drive innovation."
              },
              {
                icon: <Target className="text-purple-400" size={48} />,
                title: "Impact Driven",
                desc: "Every decision we make is focused on creating meaningful change in workforce development."
              },
              {
                icon: <Zap className="text-pink-400" size={48} />,
                title: "Innovation Mindset",
                desc: "We embrace cutting-edge technology and creative solutions to solve complex problems."
              },
              {
                icon: <Heart className="text-green-400" size={48} />,
                title: "Human-Centric",
                desc: "People are at the heart of everything we do, from our products to our workplace culture."
              }
            ].map((value, index) => (
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
                  {value.icon}
                </motion.div>
                <h3 className="text-2xl font-bold mb-4 text-white">{value.title}</h3>
                <p className="text-gray-400 leading-relaxed">{value.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Team Culture */}
      <motion.section
        className="py-32 relative overflow-hidden"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-950/30 to-black" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div variants={itemVariants} className="space-y-8">
              <div className="space-y-6">
                <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  Life at The 3rd Academy
                </h2>
                <p className="text-xl text-gray-300 leading-relaxed">
                  We're building more than a company—we're creating a movement.
                </p>
                <p className="text-lg text-gray-400 leading-relaxed">
                  Our team is made up of passionate innovators, educators, and technologists who share a common vision: to revolutionize how the world develops and verifies workplace skills. We foster a culture of continuous learning, creativity, and collaboration where every voice matters and every idea has the potential to shape the future.
                </p>
                <p className="text-lg text-gray-400 leading-relaxed">
                  From flexible remote work arrangements to professional development opportunities, we ensure our team has everything they need to thrive both personally and professionally.
                </p>
              </div>
            </motion.div>
            <motion.div variants={itemVariants} className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl opacity-20 group-hover:opacity-40 blur-2xl transition-all duration-500" />
              <motion.img
                src="https://api.a0.dev/assets/image?text=Diverse team of professionals collaborating in modern office with AI technology and creative workspace&aspect=16:9&seed=team_culture"
                alt="Team Collaboration at The 3rd Academy"
                className="relative rounded-3xl shadow-2xl border border-white/10"
                whileHover={{ scale: 1.02, rotateY: 5, rotateX: 5 }}
                transition={{ duration: 0.5 }}
                style={{ transformStyle: 'preserve-3d' }}
              />
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Open Positions */}
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
            Open Positions
          </motion.h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: "Senior AI Engineer",
                type: "Full-time",
                location: "Remote",
                salary: "$120k - $160k",
                desc: "Lead the development of our AI-driven skill assessment platform. You'll work on cutting-edge machine learning models and collaborate with our product team to innovate new ways of measuring workplace competencies."
              },
              {
                title: "UX/UI Designer",
                type: "Full-time",
                location: "Remote",
                salary: "$80k - $110k",
                desc: "Design intuitive and beautiful interfaces for our platform. You'll work closely with users to understand their needs and create experiences that make skill development engaging and effective."
              },
              {
                title: "Product Manager",
                type: "Full-time",
                location: "Remote",
                salary: "$100k - $130k",
                desc: "Drive product strategy and roadmap for our AI-powered workforce development platform. You'll work with engineering, design, and business teams to bring innovative solutions to market."
              },
              {
                title: "Data Scientist",
                type: "Full-time",
                location: "Remote",
                salary: "$100k - $140k",
                desc: "Analyze user data and platform performance to drive insights and improvements. You'll work on predictive models and help optimize our AI algorithms for better skill assessment accuracy."
              },
              {
                title: "Educational Content Specialist",
                type: "Contract",
                location: "Remote",
                salary: "$50k - $70k",
                desc: "Develop engaging educational content and assessments for our platform. You'll work with subject matter experts to create materials that effectively teach workplace skills."
              },
              {
                title: "DevOps Engineer",
                type: "Full-time",
                location: "Remote",
                salary: "$110k - $140k",
                desc: "Build and maintain our cloud infrastructure. You'll ensure our platform scales reliably and securely, implementing best practices for deployment, monitoring, and automation."
              }
            ].map((job, index) => (
              <motion.div
                key={index}
                className="relative group p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl"
                variants={itemVariants}
                whileHover={{ y: -5, borderColor: 'rgba(129, 140, 248, 0.5)' }}
              >
                <div className="absolute -top-1 -right-1 w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold mb-2 text-white">{job.title}</h3>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <Clock size={16} />
                        {job.type}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin size={16} />
                        {job.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign size={16} />
                        {job.salary}
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-gray-400 mb-6 leading-relaxed">{job.desc}</p>
                <motion.button
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Apply Now
                </motion.button>
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
            Ready to Make an Impact?
          </motion.h2>
          <motion.p
            className="text-xl md:text-2xl mb-12 text-gray-200"
            variants={itemVariants}
          >
            Join our mission to transform workforce development through AI innovation.
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
              View All Openings
            </motion.button>
            <Link href="/">
              <motion.button
                className="border-2 border-white text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-white hover:text-indigo-900 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Learn About Us
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </motion.section>

      <Footer />
    </div>
  );
}