'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Clock, Send, MessageSquare, Users, Headphones } from 'lucide-react';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

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

  const contactInfo = [
    {
      icon: <MessageSquare className="text-indigo-400" size={32} />,
      title: "General Inquiries",
      contact: "hello@3rdacademy.com",
      description: "For general questions about our platform"
    },
    {
      icon: <Users className="text-purple-400" size={32} />,
      title: "Partnerships",
      contact: "partnerships@3rdacademy.com",
      description: "Business partnerships and collaborations"
    },
    {
      icon: <Headphones className="text-pink-400" size={32} />,
      title: "Support",
      contact: "support@3rdacademy.com",
      description: "Technical support and account help"
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
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
            Get In Touch
          </motion.h1>
          <motion.p
            className="text-xl md:text-2xl mb-8 opacity-90 max-w-4xl mx-auto"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Have questions about The 3rd Academy? We're here to help you succeed.
          </motion.p>
        </div>
      </motion.section>

      {/* Contact Info Cards */}
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
            Contact Information
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {contactInfo.map((info, index) => (
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
                  {info.icon}
                </motion.div>
                <h3 className="text-2xl font-bold mb-4 text-white">{info.title}</h3>
                <p className="text-indigo-400 font-semibold mb-2">{info.contact}</p>
                <p className="text-gray-400">{info.description}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div variants={itemVariants} className="space-y-6">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10">
                <MapPin className="text-indigo-400" size={24} />
                <div>
                  <h4 className="font-semibold text-white">Location</h4>
                  <p className="text-gray-400">Virtual First - Global Operations</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10">
                <Clock className="text-purple-400" size={24} />
                <div>
                  <h4 className="font-semibold text-white">Response Time</h4>
                  <p className="text-gray-400">Within 24 hours for all inquiries</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10">
                <Phone className="text-pink-400" size={24} />
                <div>
                  <h4 className="font-semibold text-white">Phone</h4>
                  <p className="text-gray-400">Available via appointment</p>
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl opacity-20 group-hover:opacity-40 blur-2xl transition-all duration-500" />
              <motion.img
                src="https://api.a0.dev/assets/image?text=Professional contact center with modern communication tools and global connectivity&aspect=4:3&seed=contact_center"
                alt="Contact Center"
                className="relative rounded-3xl shadow-2xl border border-white/10"
                whileHover={{ scale: 1.02, rotateY: 5, rotateX: 5 }}
                transition={{ duration: 0.5 }}
                style={{ transformStyle: 'preserve-3d' }}
              />
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Contact Form */}
      <motion.section
        className="py-32 relative overflow-hidden"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-950/30 to-black" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.h2
            className="text-4xl md:text-6xl font-bold text-center mb-20 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
            variants={itemVariants}
          >
            Send Us a Message
          </motion.h2>
          <motion.form
            onSubmit={handleSubmit}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12"
            variants={itemVariants}
          >
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-black/50 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-black/50 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="your.email@example.com"
                />
              </div>
            </div>
            <div className="mb-6">
              <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-2">
                Subject *
              </label>
              <select
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-black/50 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Select a subject</option>
                <option value="general">General Inquiry</option>
                <option value="partnership">Partnership Opportunity</option>
                <option value="support">Technical Support</option>
                <option value="press">Press/Media Inquiry</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="mb-8">
              <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                Message *
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={6}
                className="w-full px-4 py-3 bg-black/50 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                placeholder="Tell us how we can help you..."
              />
            </div>
            <motion.button
              type="submit"
              className="w-full py-4 px-8 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3"
              whileHover={{ scale: 1.02, boxShadow: "0 25px 50px -12px rgba(139, 92, 246, 0.4)" }}
              whileTap={{ scale: 0.98 }}
            >
              <Send size={20} />
              Send Message
            </motion.button>
          </motion.form>
        </div>
      </motion.section>

      <Footer />
    </div>
  );
}