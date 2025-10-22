'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const getNavLink = (section: string) => {
    if (pathname === '/') {
      return `#${section}`;
    }
    return `/#${section}`;
  };

  return (
    <motion.header
      className="bg-black/70 backdrop-blur-md shadow-lg sticky top-0 z-50"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4 md:py-6">
          <Link href="/" className="flex items-center">
            <motion.div className="flex items-center" whileHover={{ scale: 1.05 }}>
              <img
                src="https://api.a0.dev/assets/image?text=Futuristic AI-powered academy logo with glowing blue circuit patterns and neural networks&aspect=1:1&seed=academy_logo"
                alt="The 3rd Academy Logo"
                className="h-12 w-12 mr-3 rounded-full shadow-lg"
              />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                The 3rd Academy™
              </h1>
            </motion.div>
          </Link>
          <nav className="hidden md:flex space-x-8 items-center">
            {['about', 'how', 'features', 'passport', 'testimonials', 'faq'].map((section) => (
              <motion.a
                key={section}
                href={getNavLink(section)}
                className="text-gray-300 hover:text-indigo-400 transition-colors duration-300 font-medium"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {section.charAt(0).toUpperCase() + section.slice(1)}
              </motion.a>
            ))}
            <motion.button
              className="text-gray-300 hover:text-indigo-400 transition-colors duration-300 font-medium"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              Login
            </motion.button>
            <motion.button
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg font-medium transition-colors duration-300 shadow-lg shadow-indigo-600/30"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              Sign Up
            </motion.button>
          </nav>
          {/* --- Animated Mobile Menu Toggler --- */}
          <motion.button
            className="md:hidden p-2 text-gray-300 z-50"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {/* Burger Icon logic */}
            <motion.div
              className="w-6 h-0.5 bg-gray-300"
              animate={{
                rotate: isMenuOpen ? 45 : 0,
                y: isMenuOpen ? 4 : 0
              }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              style={{ y: -4 }}
            />
            <motion.div
              className="w-6 h-0.5 bg-gray-300 my-1.5"
              animate={{
                opacity: isMenuOpen ? 0 : 1
              }}
              transition={{ duration: 0.1 }}
            />
            <motion.div
              className="w-6 h-0.5 bg-gray-300"
              animate={{
                rotate: isMenuOpen ? -45 : 0,
                y: isMenuOpen ? -4 : 0
              }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              style={{ y: 4 }}
            />
          </motion.button>
        </div>
        <AnimatePresence>
          {isMenuOpen && (
            <motion.nav
              className="md:hidden fixed top-0 left-0 w-full h-screen bg-black/95 pt-28 p-8 flex flex-col space-y-4"
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              {['about', 'how', 'features', 'passport', 'testimonials', 'faq'].map((section) => (
                <motion.a
                  key={section}
                  href={getNavLink(section)}
                  className="text-gray-300 hover:text-indigo-400 transition-colors duration-300 font-medium py-3 text-2xl"
                  onClick={() => setIsMenuOpen(false)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + 0.05 * (['about', 'how', 'features', 'passport', 'testimonials', 'faq'].indexOf(section)) }}
                >
                  {section.charAt(0).toUpperCase() + section.slice(1)}
                </motion.a>
              ))}
              <motion.button
                className="text-gray-300 hover:text-indigo-400 transition-colors duration-300 font-medium py-3 text-2xl text-left"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                Login
              </motion.button>
              <motion.button
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-4 rounded-lg font-medium transition-colors duration-300 text-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
              >
                Sign Up
              </motion.button>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}