import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Eye, Lock, Database, UserCheck, FileText } from 'lucide-react';
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

  const privacyCards = [
    {
      icon: <Eye className="text-indigo-400" size={32} />,
      title: "Data Transparency",
      description: "We clearly explain what data we collect and how we use it."
    },
    {
      icon: <Lock className="text-purple-400" size={32} />,
      title: "Security First",
      description: "Your data is protected with industry-standard security measures."
    },
    {
      icon: <UserCheck className="text-pink-400" size={32} />,
      title: "User Control",
      description: "You have control over your data and privacy preferences."
    },
    {
      icon: <Database className="text-green-400" size={32} />,
      title: "Minimal Collection",
      description: "We only collect the data necessary to provide our services."
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
            Privacy Policy
          </motion.h1>
          <motion.p
            className="text-xl md:text-2xl mb-8 opacity-90 max-w-4xl mx-auto"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Your privacy and data security are our top priorities at The 3rd Academy.
          </motion.p>
        </div>
      </motion.section>

      {/* Privacy Overview Cards */}
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
            Privacy Overview
          </motion.h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
            {privacyCards.map((card, index) => (
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

      {/* Privacy Policy Content */}
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
                Complete Privacy Policy
              </h2>
            </div>

            <div className="space-y-8 text-gray-300 leading-relaxed">
              <div>
                <h3 className="text-2xl font-bold text-white mb-4">1. Information We Collect</h3>
                <p className="mb-4">
                  We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support. This may include:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 text-gray-400">
                  <li>Name, email address, and contact information</li>
                  <li>Profile information and skill assessment data</li>
                  <li>Communication preferences and feedback</li>
                  <li>Usage data and interaction with our platform</li>
                </ul>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white mb-4">2. How We Use Your Information</h3>
                <p className="mb-4">
                  We use the information we collect to:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 text-gray-400">
                  <li>Provide, maintain, and improve our services</li>
                  <li>Process transactions and send related information</li>
                  <li>Send technical notices and support messages</li>
                  <li>Communicate with you about products, services, and promotions</li>
                  <li>Monitor and analyze usage patterns and trends</li>
                </ul>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white mb-4">3. Information Sharing and Disclosure</h3>
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
                <h3 className="text-2xl font-bold text-white mb-4">4. Data Security</h3>
                <p className="text-gray-400">
                  We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes encryption, secure servers, and regular security assessments.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white mb-4">5. Your Rights and Choices</h3>
                <p className="mb-4">
                  You have the following rights regarding your personal information:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 text-gray-400">
                  <li>Access and update your personal information</li>
                  <li>Request deletion of your data</li>
                  <li>Opt out of marketing communications</li>
                  <li>Request data portability</li>
                  <li>Object to certain data processing activities</li>
                </ul>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white mb-4">6. Cookies and Tracking</h3>
                <p className="text-gray-400">
                  We use cookies and similar technologies to enhance your experience, analyze usage, and assist in our marketing efforts. You can control cookie preferences through your browser settings.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white mb-4">7. International Data Transfers</h3>
                <p className="text-gray-400">
                  Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your data during such transfers.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white mb-4">8. Children's Privacy</h3>
                <p className="text-gray-400">
                  Our services are not intended for children under 13. We do not knowingly collect personal information from children under 13. If we become aware that we have collected such information, we will delete it immediately.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white mb-4">9. Changes to This Policy</h3>
                <p className="text-gray-400">
                  We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white mb-4">10. Contact Us</h3>
                <p className="text-gray-400 mb-4">
                  If you have any questions about this Privacy Policy, please contact us at:
                </p>
                <div className="bg-black/30 p-4 rounded-xl border border-white/10">
                  <p className="text-indigo-400 font-semibold">privacy@3rdacademy.com</p>
                  <p className="text-gray-400 text-sm mt-2">The 3rd Academy Privacy Team</p>
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