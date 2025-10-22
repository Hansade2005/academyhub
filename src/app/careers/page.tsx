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

  const values = [
    {
      icon: <Users className="text-indigo-400" size={48} />,
      title: "Collaboration First",
      desc: "We believe in the power of diverse teams working together to solve complex problems."
    },
    {
      icon: <Target className="text-purple-400" size={48} />,
      title: "Innovation Driven",
      desc: "We're constantly pushing boundaries and exploring new ways to revolutionize workforce development."
    },
    {
      icon: <Zap className="text-pink-400" size={48} />,
      title: "Impact Focused",
      desc: "Every role at The 3rd Academy contributes to transforming how the world approaches career development."
    },
    {
      icon: <Heart className="text-red-400" size={48} />,
      title: "People Centered",
      desc: "We care about our team's growth, well-being, and creating a supportive work environment."
    }
  ];

  const openings = [
    {
      title: "AI/ML Engineer",
      department: "Engineering",
      location: "Remote",
      type: "Full-time",
      description: "Build cutting-edge AI systems that verify and develop workplace skills."
    },
    {
      title: "Product Manager",
      department: "Product",
      location: "Remote",
      type: "Full-time",
      description: "Lead product strategy for our skill verification platform."
    },
    {
      title: "UX/UI Designer",
      department: "Design",
      location: "Remote",
      type: "Full-time",
      description: "Create intuitive interfaces for our AI-powered learning experiences."
    },
    {
      title: "DevOps Engineer",
      department: "Engineering",
      location: "Remote",
      type: "Full-time",
      description: "Maintain and scale our cloud infrastructure serving millions of users."
    }
  ];

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
            Join Our Mission
          </motion.h1>
          <motion.p
            className="text-xl md:text-2xl mb-8 opacity-90 max-w-4xl mx-auto"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Help us revolutionize workforce development with AI-powered skill verification
          </motion.p>
        </div>
      </motion.section>

      {/* Values Section */}
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
            {values.map((value, index) => (
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

      {/* Why Join Us */}
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
            Why Join The 3rd Academy?
          </motion.h2>
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div variants={itemVariants} className="space-y-8">
              <div className="space-y-6">
                <h3 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  Shape the Future of Work
                </h3>
                <ul className="space-y-4">
                  {[
                    "Work on cutting-edge AI technology that transforms careers worldwide",
                    "Be part of a mission-driven company making real impact on global workforce development",
                    "Collaborate with talented individuals from diverse backgrounds and expertise",
                    "Enjoy competitive compensation, comprehensive benefits, and work-life balance",
                    "Continuous learning opportunities and professional development support"
                  ].map((item, index) => (
                    <motion.li
                      key={index}
                      className="flex items-start gap-4 p-4 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-indigo-500/50 transition-all duration-300"
                      initial={{ opacity: 0, x: -30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      viewport={{ once: true }}
                      whileHover={{ x: 10, backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
                    >
                      <div className="text-green-400 mt-1">✓</div>
                      <span className="text-gray-300 text-lg">{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>
            <motion.div variants={itemVariants} className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl opacity-20 group-hover:opacity-40 blur-2xl transition-all duration-500" />
              <motion.img
                src="https://api.a0.dev/assets/image?text=Modern office with diverse team collaborating on innovative AI projects&aspect=4:3&seed=team_collaboration"
                alt="Team Collaboration"
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
            {openings.map((opening, index) => (
              <motion.div
                key={index}
                className="relative group p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl"
                variants={itemVariants}
                whileHover={{ y: -10, borderColor: 'rgba(129, 140, 248, 0.5)' }}
              >
                <div className="absolute -top-1 -right-1 w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold mb-2 text-white">{opening.title}</h3>
                    <p className="text-indigo-400 font-semibold">{opening.department}</p>
                  </div>
                  <div className="text-right text-sm text-gray-400">
                    <div className="flex items-center gap-1 mb-1">
                      <MapPin size={14} />
                      {opening.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      {opening.type}
                    </div>
                  </div>
                </div>
                <p className="text-gray-400 mb-6 leading-relaxed">{opening.description}</p>
                <motion.button
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-indigo-600/30"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Apply Now →
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
            Join our talented team and help shape the future of workforce development.
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
            <motion.button
              className="border-2 border-white text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-white hover:text-indigo-900 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Send Us Your Resume
            </motion.button>
          </motion.div>
        </div>
      </motion.section>

      <Footer />
    </div>
  );
}