'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Eye, Lock, Database, Users, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default function PrivacyPolicy() {
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
            Privacy Policy
          </motion.h1>
          <motion.p
            className="text-xl md:text-2xl mb-8 opacity-90 max-w-4xl mx-auto"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Your privacy and data security are our top priorities
          </motion.p>
        </div>
      </motion.section>

      {/* Overview Cards */}
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
            Privacy at a Glance
          </motion.h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Shield className="text-indigo-400" size={48} />,
                title: "Data Protection",
                desc: "We implement industry-leading security measures to protect your personal information."
              },
              {
                icon: <Eye className="text-purple-400" size={48} />,
                title: "Transparency",
                desc: "We clearly explain what data we collect and how we use it."
              },
              {
                icon: <Lock className="text-pink-400" size={48} />,
                title: "Your Control",
                desc: "You have full control over your data and can request deletion at any time."
              },
              {
                icon: <Database className="text-green-400" size={48} />,
                title: "Minimal Collection",
                desc: "We only collect the data necessary to provide our services."
              },
              {
                icon: <Users className="text-yellow-400" size={48} />,
                title: "No Sharing",
                desc: "We never sell your personal data to third parties."
              },
              {
                icon: <AlertTriangle className="text-blue-400" size={48} />,
                title: "Compliance",
                desc: "We comply with GDPR, CCPA, and other privacy regulations."
              }
            ].map((item, index) => (
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
                  {item.icon}
                </motion.div>
                <h3 className="text-2xl font-bold mb-4 text-white">{item.title}</h3>
                <p className="text-gray-400 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Detailed Policy */}
      <motion.section
        className="py-32 relative overflow-hidden"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-950/30 to-black" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12"
            variants={itemVariants}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-white">Detailed Privacy Policy</h2>

            <div className="space-y-8 text-gray-300 leading-relaxed">
              <div>
                <h3 className="text-2xl font-bold mb-4 text-indigo-400">1. Information We Collect</h3>
                <p className="mb-4">
                  We collect information you provide directly to us, such as when you create an account, participate in our AI skill assessments, or contact us for support. This may include:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 text-gray-400">
                  <li>Name, email address, and contact information</li>
                  <li>Profile information and professional background</li>
                  <li>Skill assessment responses and performance data</li>
                  <li>Communication preferences and feedback</li>
                </ul>
              </div>

              <div>
                <h3 className="text-2xl font-bold mb-4 text-indigo-400">2. How We Use Your Information</h3>
                <p className="mb-4">
                  We use the information we collect to:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 text-gray-400">
                  <li>Provide, maintain, and improve our AI-powered skill development platform</li>
                  <li>Personalize your learning experience and skill recommendations</li>
                  <li>Generate AI-verified skill credentials and assessments</li>
                  <li>Communicate with you about our services and updates</li>
                  <li>Ensure platform security and prevent fraud</li>
                </ul>
              </div>

              <div>
                <h3 className="text-2xl font-bold mb-4 text-indigo-400">3. Information Sharing and Disclosure</h3>
                <p className="mb-4">
                  We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 text-gray-400">
                  <li>With service providers who assist us in operating our platform</li>
                  <li>When required by law or to protect our rights</li>
                  <li>In connection with a business transfer or acquisition</li>
                  <li>With your explicit consent for specific purposes</li>
                </ul>
              </div>

              <div>
                <h3 className="text-2xl font-bold mb-4 text-indigo-400">4. Data Security</h3>
                <p className="text-gray-400">
                  We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes encryption, secure servers, and regular security assessments.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-bold mb-4 text-indigo-400">5. Your Rights</h3>
                <p className="mb-4">
                  Depending on your location, you may have the following rights regarding your personal information:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 text-gray-400">
                  <li>Access: Request a copy of the personal information we hold about you</li>
                  <li>Rectification: Request correction of inaccurate or incomplete data</li>
                  <li>Erasure: Request deletion of your personal information</li>
                  <li>Portability: Request transfer of your data to another service</li>
                  <li>Restriction: Request limitation of how we process your data</li>
                  <li>Objection: Object to our processing of your personal information</li>
                </ul>
              </div>

              <div>
                <h3 className="text-2xl font-bold mb-4 text-indigo-400">6. Cookies and Tracking</h3>
                <p className="text-gray-400">
                  We use cookies and similar technologies to enhance your experience on our platform. You can control cookie settings through your browser preferences. We use analytics tools to understand how our platform is used and to improve our services.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-bold mb-4 text-indigo-400">7. International Data Transfers</h3>
                <p className="text-gray-400">
                  Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your data during such transfers, in compliance with applicable data protection laws.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-bold mb-4 text-indigo-400">8. Children's Privacy</h3>
                <p className="text-gray-400">
                  Our services are not intended for children under 13. We do not knowingly collect personal information from children under 13. If we become aware that we have collected personal information from a child under 13, we will take steps to delete such information.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-bold mb-4 text-indigo-400">9. Changes to This Policy</h3>
                <p className="text-gray-400">
                  We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date. We encourage you to review this policy periodically.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-bold mb-4 text-indigo-400">10. Contact Us</h3>
                <p className="text-gray-400 mb-4">
                  If you have any questions about this Privacy Policy or our data practices, please contact us:
                </p>
                <div className="bg-black/50 p-4 rounded-xl border border-white/10">
                  <p className="text-indigo-400">Email: privacy@the3rdacademy.com</p>
                  <p className="text-indigo-400">Address: The 3rd Academy™ Privacy Team, [Company Address]</p>
                </div>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-white/10">
              <p className="text-sm text-gray-500">Last updated: October 22, 2025</p>
            </div>
          </motion.div>
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
            Questions About Privacy?
          </motion.h2>
          <motion.p
            className="text-xl md:text-2xl mb-12 text-gray-200"
            variants={itemVariants}
          >
            We're here to help you understand how we protect your data.
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
              Contact Privacy Team
            </motion.button>
            <Link href="/">
              <motion.button
                className="border-2 border-white text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-white hover:text-indigo-900 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Back to Home
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </motion.section>

      <Footer />
    </div>
  );
}