'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Twitter, Linkedin, Github, Share2 } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <motion.footer
      className="relative py-20 overflow-hidden border-t border-white/10"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black via-indigo-950/50 to-black" />
      <div className="absolute inset-0 opacity-5">
        <motion.div
          className="absolute inset-0"
          style={{
            backgroundImage: `url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')`
          }}
          animate={{ x: [0, -100, 0], y: [0, 50, 0] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid md:grid-cols-5 gap-12 mb-12">
          <div className="md:col-span-2">
            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">The 3rd Academy™</h3>
            <p className="text-gray-400 mb-6 leading-relaxed">Revolutionizing workforce development with AI-powered skill validation.</p>
            <div className="flex space-x-4">
              {[
                { icon: <Twitter size={20} />, color: 'hover:bg-blue-500' },
                { icon: <Linkedin size={20} />, color: 'hover:bg-blue-600' },
                { icon: <Github size={20} />, color: 'hover:bg-gray-700' },
                { icon: <Share2 size={20} />, color: 'hover:bg-purple-600' }
              ].map((social, i) => (
                <motion.button
                  key={i}
                  className={`p-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full ${social.color} transition-all duration-300`}
                  whileHover={{ scale: 1.2, y: -5 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {social.icon}
                </motion.button>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-bold mb-6 text-white text-lg">Products</h4>
            <ul className="space-y-3 text-gray-400">
              {['3a Skill Passport™', 'TalentVisa™', 'T3X Talent Exchange'].map((item, i) => (
                <motion.li key={i} whileHover={{ x: 5, color: '#fff' }}>
                  <a href="#" className="hover:text-white transition-colors">{item}</a>
                </motion.li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6 text-white text-lg">Company</h4>
            <ul className="space-y-3 text-gray-400">
              {[
                { name: 'About Us', href: '/about' },
                { name: 'Careers', href: '/careers' },
                { name: 'Contact', href: '/contact' },
                { name: 'Skill Passport', href: '/skill-passport' },
                { name: 'FAQ', href: '/#faq' }
              ].map((item, i) => (
                <motion.li key={i} whileHover={{ x: 5, color: '#fff' }}>
                  <Link href={item.href} className="hover:text-white transition-colors">{item.name}</Link>
                </motion.li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6 text-white text-lg">Legal</h4>
            <ul className="space-y-3 text-gray-400">
              {[
                { name: 'Privacy Policy', href: '/privacy-policy' },
                { name: 'Terms of Service', href: '/terms-of-service' }
              ].map((item, i) => (
                <motion.li key={i} whileHover={{ x: 5, color: '#fff' }}>
                  <Link href={item.href} className="hover:text-white transition-colors">{item.name}</Link>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 pt-12 text-center">
          <p className="mt-8 text-gray-500">© 2025 The 3rd Academy™. All rights reserved.</p>
        </div>
      </div>
    </motion.footer>
  );
}