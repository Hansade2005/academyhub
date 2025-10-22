import React from 'react';
import { motion } from 'framer-motion';
import { FileText, CheckCircle, AlertTriangle, Scale, Users, Shield } from 'lucide-react';
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

  const termsCards = [
    {
      icon: <CheckCircle className="text-green-400" size={32} />,
      title: "Clear Usage Rights",
      description: "Understand exactly how you can use our platform and services."
    },
    {
      icon: <Shield className="text-indigo-400" size={32} />,
      title: "Your Data Protection",
      description: "We protect your data and respect your privacy rights."
    },
    {
      icon: <Users className="text-purple-400" size={32} />,
      title: "Community Guidelines",
      description: "Help us maintain a respectful and productive environment."
    },
    {
      icon: <Scale className="text-pink-400" size={32} />,
      title: "Fair Terms",
      description: "Transparent terms designed to protect both users and the platform."
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
            Terms of Service
          </motion.h1>
          <motion.p
            className="text-xl md:text-2xl mb-8 opacity-90 max-w-4xl mx-auto"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            The rules and guidelines for using The 3rd Academy platform.
          </motion.p>
        </div>
      </motion.section>

      {/* Terms Overview Cards */}
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
            Terms Overview
          </motion.h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
            {termsCards.map((card, index) => (
              <motion.div
                key={index}
                className="relative group p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl text-center"
                variants={itemVariants}
                whileHover={{ y: -10, borderColor: 'rgba(129, 140, 248, 0.5)' }}
              >
                <div className="absolute -top-1 -right-1 w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
                <motion.div
                  className="mb-4 flex justify-center"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  {card.icon}
                </motion.div>
                <h3 className="text-xl font-bold mb-3 text-white">{card.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{card.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Terms of Service Content */}
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
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12"
            variants={itemVariants}
          >
            <div className="flex items-center gap-4 mb-8">
              <FileText className="text-indigo-400" size={32} />
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Complete Terms of Service
              </h2>
            </div>

            <div className="space-y-8 text-gray-300 leading-relaxed">
              <div>
                <h3 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h3>
                <p className="text-gray-400">
                  By accessing and using The 3rd Academy platform, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white mb-4">2. Description of Service</h3>
                <p className="text-gray-400">
                  The 3rd Academy provides AI-powered workforce development services, including skill assessment, verification, and career development tools. Our services are designed to help users demonstrate their workplace readiness through verified skill passports.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white mb-4">3. User Accounts</h3>
                <p className="mb-4 text-gray-400">
                  To use our services, you must create an account. You are responsible for:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 text-gray-400">
                  <li>Maintaining the confidentiality of your account credentials</li>
                  <li>All activities that occur under your account</li>
                  <li>Notifying us immediately of any unauthorized use</li>
                  <li>Providing accurate and complete information</li>
                </ul>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white mb-4">4. Acceptable Use</h3>
                <p className="mb-4 text-gray-400">
                  You agree to use our services only for lawful purposes and in accordance with these terms. You shall not:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 text-gray-400">
                  <li>Use the service for any illegal or unauthorized purpose</li>
                  <li>Attempt to gain unauthorized access to our systems</li>
                  <li>Transmit harmful or malicious code</li>
                  <li>Interfere with the proper functioning of the platform</li>
                  <li>Share your account credentials with others</li>
                </ul>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white mb-4">5. Intellectual Property</h3>
                <p className="mb-4 text-gray-400">
                  The 3rd Academy platform and its content are protected by intellectual property laws. This includes:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 text-gray-400">
                  <li>Our proprietary AI algorithms and assessment methods</li>
                  <li>The 3a Skill Passport™ brand and related trademarks</li>
                  <li>Platform design, code, and user interface</li>
                  <li>Educational content and assessment materials</li>
                </ul>
                <p className="text-gray-400 mt-4">
                  You retain ownership of your personal data and content, but grant us a license to use it for providing our services.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white mb-4">6. Privacy and Data</h3>
                <p className="text-gray-400">
                  Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy, which is incorporated into these Terms by reference. By using our services, you consent to the collection and use of your information as outlined in our Privacy Policy.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white mb-4">7. Payment Terms</h3>
                <p className="mb-4 text-gray-400">
                  Some services may require payment. By purchasing services:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 text-gray-400">
                  <li>You agree to pay all applicable fees</li>
                  <li>Payments are non-refundable unless otherwise stated</li>
                  <li>We may change pricing with 30 days notice</li>
                  <li>Failed payments may result in service suspension</li>
                </ul>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white mb-4">8. Disclaimers</h3>
                <p className="text-gray-400">
                  Our services are provided "as is" without warranties of any kind. We do not guarantee that our services will be uninterrupted, error-free, or meet your specific requirements. We are not liable for any indirect, incidental, or consequential damages.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white mb-4">9. Limitation of Liability</h3>
                <p className="text-gray-400">
                  In no event shall The 3rd Academy be liable for any damages arising out of or related to your use of our services, whether based on contract, tort, or any other legal theory, except where prohibited by law.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white mb-4">10. Termination</h3>
                <p className="text-gray-400">
                  We may terminate or suspend your account and access to our services immediately, without prior notice, for any reason, including breach of these terms. Upon termination, your right to use our services will cease immediately.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white mb-4">11. Governing Law</h3>
                <p className="text-gray-400">
                  These Terms shall be governed by and construed in accordance with applicable laws. Any disputes arising from these terms shall be resolved through binding arbitration in accordance with the rules of the appropriate arbitration association.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white mb-4">12. Changes to Terms</h3>
                <p className="text-gray-400">
                  We reserve the right to modify these Terms at any time. We will notify users of significant changes via email or platform notification. Continued use of our services after changes constitutes acceptance of the new terms.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white mb-4">13. Contact Information</h3>
                <p className="text-gray-400 mb-4">
                  If you have questions about these Terms, please contact us at:
                </p>
                <div className="bg-black/30 p-4 rounded-xl border border-white/10">
                  <p className="text-indigo-400 font-semibold">legal@3rdacademy.com</p>
                  <p className="text-gray-400 text-sm mt-2">The 3rd Academy Legal Team</p>
                </div>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-white/10">
              <p className="text-gray-500 text-sm text-center">
                Last updated: October 2025
              </p>
            </div>
          </motion.div>
        </div>
      </motion.section>

      <Footer />
    </div>
  );
}