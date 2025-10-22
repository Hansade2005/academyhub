'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Scale, Shield, AlertCircle, Users, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default function TermsOfService() {
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
            Terms of Service
          </motion.h1>
          <motion.p
            className="text-xl md:text-2xl mb-8 opacity-90 max-w-4xl mx-auto"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Clear guidelines for using The 3rd Academy™ platform
          </motion.p>
        </div>
      </motion.section>

      {/* Key Points Overview */}
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
            Terms at a Glance
          </motion.h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <FileText className="text-indigo-400" size={48} />,
                title: "Service Agreement",
                desc: "By using our platform, you agree to these terms and our commitment to AI-powered skill development."
              },
              {
                icon: <Scale className="text-purple-400" size={48} />,
                title: "Fair Usage",
                desc: "Use our services responsibly and in accordance with applicable laws and regulations."
              },
              {
                icon: <Shield className="text-pink-400" size={48} />,
                title: "Intellectual Property",
                desc: "Our AI technology and content are protected. Respect our intellectual property rights."
              },
              {
                icon: <AlertCircle className="text-green-400" size={48} />,
                title: "User Conduct",
                desc: "Maintain professional conduct and do not misuse our platform or interfere with others."
              },
              {
                icon: <Users className="text-yellow-400" size={48} />,
                title: "Account Responsibility",
                desc: "You are responsible for maintaining the security of your account and all activities under it."
              },
              {
                icon: <CheckCircle className="text-blue-400" size={48} />,
                title: "Service Availability",
                desc: "We strive for high availability but cannot guarantee uninterrupted service."
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

      {/* Detailed Terms */}
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
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-white">Complete Terms of Service</h2>

            <div className="space-y-8 text-gray-300 leading-relaxed">
              <div>
                <h3 className="text-2xl font-bold mb-4 text-indigo-400">1. Acceptance of Terms</h3>
                <p className="text-gray-400">
                  By accessing and using The 3rd Academy™ platform, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-bold mb-4 text-indigo-400">2. Description of Service</h3>
                <p className="text-gray-400">
                  The 3rd Academy™ provides AI-powered workforce skill development and verification services. Our platform uses artificial intelligence to assess, develop, and validate workplace competencies through immersive simulations and personalized learning experiences.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-bold mb-4 text-indigo-400">3. User Accounts</h3>
                <p className="mb-4 text-gray-400">
                  To access certain features of our platform, you must register for an account. You agree to:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 text-gray-400">
                  <li>Provide accurate and complete information during registration</li>
                  <li>Maintain the security of your password and account</li>
                  <li>Accept responsibility for all activities under your account</li>
                  <li>Notify us immediately of any unauthorized use</li>
                </ul>
              </div>

              <div>
                <h3 className="text-2xl font-bold mb-4 text-indigo-400">4. Acceptable Use Policy</h3>
                <p className="mb-4 text-gray-400">
                  You agree not to use our platform to:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 text-gray-400">
                  <li>Violate any applicable laws or regulations</li>
                  <li>Infringe on intellectual property rights</li>
                  <li>Transmit harmful, offensive, or inappropriate content</li>
                  <li>Interfere with or disrupt the platform's operation</li>
                  <li>Attempt to gain unauthorized access to our systems</li>
                  <li>Use the platform for any fraudulent or deceptive purposes</li>
                </ul>
              </div>

              <div>
                <h3 className="text-2xl font-bold mb-4 text-indigo-400">5. Intellectual Property</h3>
                <p className="text-gray-400">
                  All content, features, and functionality of The 3rd Academy™ platform, including but not limited to text, graphics, logos, icons, images, audio clips, digital downloads, and software, are the exclusive property of The 3rd Academy™ or its licensors and are protected by copyright, trademark, and other intellectual property laws.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-bold mb-4 text-indigo-400">6. Privacy and Data</h3>
                <p className="text-gray-400">
                  Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy, which is incorporated into these Terms by reference. By using our platform, you consent to the collection and use of your information as outlined in our Privacy Policy.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-bold mb-4 text-indigo-400">7. AI-Generated Content</h3>
                <p className="text-gray-400">
                  Our platform uses artificial intelligence to generate assessments, feedback, and learning content. While we strive for accuracy and quality, AI-generated content may not be perfect. You acknowledge that AI technology has limitations and agree to use your judgment when interpreting results.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-bold mb-4 text-indigo-400">8. Service Availability</h3>
                <p className="text-gray-400">
                  We strive to provide continuous availability of our platform, but we do not guarantee that the service will be uninterrupted or error-free. We reserve the right to modify, suspend, or discontinue the service with or without notice.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-bold mb-4 text-indigo-400">9. Limitation of Liability</h3>
                <p className="text-gray-400">
                  In no event shall The 3rd Academy™ be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of our platform.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-bold mb-4 text-indigo-400">10. Termination</h3>
                <p className="text-gray-400">
                  We may terminate or suspend your account and access to our platform immediately, without prior notice or liability, for any reason, including breach of these Terms. Upon termination, your right to use the platform will cease immediately.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-bold mb-4 text-indigo-400">11. Governing Law</h3>
                <p className="text-gray-400">
                  These Terms shall be interpreted and governed by the laws of [Jurisdiction], without regard to its conflict of law provisions. Any disputes arising from these Terms shall be resolved in the courts of [Jurisdiction].
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-bold mb-4 text-indigo-400">12. Changes to Terms</h3>
                <p className="text-gray-400">
                  We reserve the right to modify these Terms at any time. We will notify users of material changes via email or through our platform. Your continued use of the platform after such modifications constitutes acceptance of the updated Terms.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-bold mb-4 text-indigo-400">13. Contact Information</h3>
                <p className="text-gray-400 mb-4">
                  If you have any questions about these Terms of Service, please contact us:
                </p>
                <div className="bg-black/50 p-4 rounded-xl border border-white/10">
                  <p className="text-indigo-400">Email: legal@the3rdacademy.com</p>
                  <p className="text-indigo-400">Address: The 3rd Academy™ Legal Team, [Company Address]</p>
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
            Questions About Terms?
          </motion.h2>
          <motion.p
            className="text-xl md:text-2xl mb-12 text-gray-200"
            variants={itemVariants}
          >
            Our legal team is here to help clarify any questions you may have.
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
              Contact Legal Team
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