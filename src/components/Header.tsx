'use client';

import React, { useState } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { Menu, X, User, LogOut, ChevronDown, Briefcase, BookOpen, Users, BarChart3, Target, Code, Palette } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPlatformMenuOpen, setIsPlatformMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout, loading } = useAuth();

  const getNavLink = (section: string) => {
    if (section === 'FAQ') {
      return '/faq';
    }
    if (pathname === '/') {
      return `/#${section}`;
    }
    return `/#${section}`;
  };

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  return (
    <Motion.header
      className="bg-black/70 backdrop-blur-md shadow-lg sticky top-0 z-50"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4 md:py-6">
          <Link href="/" className="flex items-center">
            <Motion.div className="flex items-center" whileHover={{ scale: 1.05 }}>
              <img
                src="https://api.a0.dev/assets/image?text=Futuristic AI-powered academy logo with glowing blue circuit patterns and neural networks&aspect=1:1&seed=academy_logo"
                alt="The 3rd Academy Logo"
                className="h-12 w-12 mr-3 rounded-full shadow-lg"
              />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                The 3rd Academy
              </h1>
            </Motion.div>
          </Link>
          <nav className="hidden lg:flex space-x-6 items-center">
            {/* Landing Page Links */}
            {pathname === '/' && (
              <>
                {['about', 'how', 'features', 'testimonials', 'FAQ'].map((section) => (
                  <Motion.a
                    key={section}
                    href={`#${section}`}
                    className="text-gray-300 hover:text-indigo-400 transition-colors duration-300 font-medium"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {section.charAt(0).toUpperCase() + section.slice(1)}
                  </Motion.a>
                ))}
              </>
            )}

            {/* Platform Features Dropdown */}
            {user && (
              <div className="relative">
                <Motion.button
                  onClick={() => setIsPlatformMenuOpen(!isPlatformMenuOpen)}
                  className="flex items-center space-x-1 text-gray-300 hover:text-indigo-400 transition-colors duration-300 font-medium"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>Platform</span>
                  <ChevronDown size={16} className={`transform transition-transform ${isPlatformMenuOpen ? 'rotate-180' : ''}`} />
                </Motion.button>

                <AnimatePresence>
                  {isPlatformMenuOpen && (
                    <Motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 mt-2 w-64 bg-gray-900/95 backdrop-blur-md rounded-lg shadow-xl border border-gray-700/50 py-2 z-50"
                    >
                      {/* Core Features */}
                      <div className="px-4 py-2 border-b border-gray-700/50">
                        <div className="flex items-center space-x-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                          <Target size={12} />
                          <span>Core Features</span>
                        </div>
                        <div className="space-y-1">
                          <Link href="/dashboard" onClick={() => setIsPlatformMenuOpen(false)}>
                            <Motion.div className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-300 hover:text-indigo-400 hover:bg-gray-800/50 rounded-md transition-colors" whileHover={{ x: 4 }}>
                              <BarChart3 size={14} />
                              <span>Dashboard</span>
                            </Motion.div>
                          </Link>
                          <Link href="/skill-passport" onClick={() => setIsPlatformMenuOpen(false)}>
                            <Motion.div className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-300 hover:text-indigo-400 hover:bg-gray-800/50 rounded-md transition-colors" whileHover={{ x: 4 }}>
                              <BookOpen size={14} />
                              <span>Skill Passport</span>
                            </Motion.div>
                          </Link>
                          <Link href="/analytics" onClick={() => setIsPlatformMenuOpen(false)}>
                            <Motion.div className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-300 hover:text-indigo-400 hover:bg-gray-800/50 rounded-md transition-colors" whileHover={{ x: 4 }}>
                              <BarChart3 size={14} />
                              <span>Analytics</span>
                            </Motion.div>
                          </Link>
                        </div>
                      </div>

                      {/* Learning & Skills */}
                      <div className="px-4 py-2 border-b border-gray-700/50">
                        <div className="flex items-center space-x-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                          <BookOpen size={12} />
                          <span>Learning & Skills</span>
                        </div>
                        <div className="space-y-1">
                          <Link href="/simulations" onClick={() => setIsPlatformMenuOpen(false)}>
                            <Motion.div className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-300 hover:text-indigo-400 hover:bg-gray-800/50 rounded-md transition-colors" whileHover={{ x: 4 }}>
                              <Target size={14} />
                              <span>AI Assessments</span>
                            </Motion.div>
                          </Link>
                          <Link href="/mentors" onClick={() => setIsPlatformMenuOpen(false)}>
                            <Motion.div className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-300 hover:text-indigo-400 hover:bg-gray-800/50 rounded-md transition-colors" whileHover={{ x: 4 }}>
                              <Users size={14} />
                              <span>Mentors</span>
                            </Motion.div>
                          </Link>
                        </div>
                      </div>

                      {/* Career & Work */}
                      <div className="px-4 py-2">
                        <div className="flex items-center space-x-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                          <Briefcase size={12} />
                          <span>Career & Work</span>
                        </div>
                        <div className="space-y-1">
                          <Link href="/talent-exchange" onClick={() => setIsPlatformMenuOpen(false)}>
                            <Motion.div className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-300 hover:text-indigo-400 hover:bg-gray-800/50 rounded-md transition-colors" whileHover={{ x: 4 }}>
                              <Users size={14} />
                              <span>Talent Exchange</span>
                            </Motion.div>
                          </Link>
                          <Link href="/liveworks" onClick={() => setIsPlatformMenuOpen(false)}>
                            <Motion.div className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-300 hover:text-indigo-400 hover:bg-gray-800/50 rounded-md transition-colors" whileHover={{ x: 4 }}>
                              <Code size={14} />
                              <span>LiveWorks</span>
                            </Motion.div>
                          </Link>
                          <Link href="/portfolio" onClick={() => setIsPlatformMenuOpen(false)}>
                            <Motion.div className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-300 hover:text-indigo-400 hover:bg-gray-800/50 rounded-md transition-colors" whileHover={{ x: 4 }}>
                              <Palette size={14} />
                              <span>Portfolio</span>
                            </Motion.div>
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Auth Buttons */}
            {!loading && (
              <>
                {user ? (
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 text-gray-300">
                      <User size={20} />
                      <span className="font-medium">
                        {user.full_name || user.email.split('@')[0]}
                      </span>
                    </div>
                    <Motion.button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 text-gray-300 hover:text-indigo-400 transition-colors duration-300 font-medium"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <LogOut size={18} />
                      <span>Logout</span>
                    </Motion.button>
                  </div>
                ) : (
                  <>
                    <Link href="/auth/login">
                      <Motion.button
                        className="text-gray-300 hover:text-indigo-400 transition-colors duration-300 font-medium"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Login
                      </Motion.button>
                    </Link>
                    <Link href="/auth/signup">
                      <Motion.button
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg font-medium transition-colors duration-300 shadow-lg shadow-indigo-600/30"
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Sign Up
                      </Motion.button>
                    </Link>
                  </>
                )}
              </>
            )}
          </nav>
          {/* --- Animated Mobile Menu Toggler --- */}
          <Motion.button
            className="lg:hidden p-2 text-gray-300 z-50"
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
            <Motion.nav
              className="lg:hidden fixed top-0 left-0 w-full h-screen bg-black/95 pt-28 p-8 flex flex-col space-y-4 overflow-y-auto"
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              {/* Landing Page Links */}
              {pathname === '/' && (
                <div className="space-y-2">
                  <h3 className="text-indigo-400 font-semibold text-lg mb-4">Navigation</h3>
                  {['about', 'how', 'features', 'testimonials', 'FAQ'].map((section, index) => (
                    <motion.a
                      key={section}
                      href={`#${section}`}
                      className="block text-gray-300 hover:text-indigo-400 transition-colors duration-300 font-medium py-3 text-xl"
                      onClick={() => setIsMenuOpen(false)}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                    >
                      {section.charAt(0).toUpperCase() + section.slice(1)}
                    </motion.a>
                  ))}
                </div>
              )}

              {!loading && user && (
                <div className="space-y-4">
                  <h3 className="text-indigo-400 font-semibold text-lg mb-4">Platform</h3>
                  
                  {/* Core Features */}
                  <div className="space-y-2">
                    <h4 className="text-gray-400 font-medium text-sm uppercase tracking-wider mb-2 flex items-center">
                      <Target size={14} className="mr-2" />
                      Core Features
                    </h4>
                    <Link href="/dashboard" onClick={() => setIsMenuOpen(false)}>
                      <Motion.button className="block w-full text-left text-gray-300 hover:text-indigo-400 transition-colors duration-300 font-medium py-2 text-lg" whileHover={{ x: 10 }}>
                        Dashboard
                      </Motion.button>
                    </Link>
                    <Link href="/skill-passport" onClick={() => setIsMenuOpen(false)}>
                      <Motion.button className="block w-full text-left text-gray-300 hover:text-indigo-400 transition-colors duration-300 font-medium py-2 text-lg" whileHover={{ x: 10 }}>
                        Skill Passport
                      </Motion.button>
                    </Link>
                    <Link href="/analytics" onClick={() => setIsMenuOpen(false)}>
                      <Motion.button className="block w-full text-left text-gray-300 hover:text-indigo-400 transition-colors duration-300 font-medium py-2 text-lg" whileHover={{ x: 10 }}>
                        Analytics
                      </Motion.button>
                    </Link>
                  </div>

                  {/* Learning & Skills */}
                  <div className="space-y-2">
                    <h4 className="text-gray-400 font-medium text-sm uppercase tracking-wider mb-2 flex items-center">
                      <BookOpen size={14} className="mr-2" />
                      Learning & Skills
                    </h4>
                    <Link href="/simulations" onClick={() => setIsMenuOpen(false)}>
                      <Motion.button className="block w-full text-left text-gray-300 hover:text-indigo-400 transition-colors duration-300 font-medium py-2 text-lg" whileHover={{ x: 10 }}>
                        AI Assessments
                      </Motion.button>
                    </Link>
                    <Link href="/mentors" onClick={() => setIsMenuOpen(false)}>
                      <Motion.button className="block w-full text-left text-gray-300 hover:text-indigo-400 transition-colors duration-300 font-medium py-2 text-lg" whileHover={{ x: 10 }}>
                        Mentors
                      </Motion.button>
                    </Link>
                  </div>

                  {/* Career & Work */}
                  <div className="space-y-2">
                    <h4 className="text-gray-400 font-medium text-sm uppercase tracking-wider mb-2 flex items-center">
                      <Briefcase size={14} className="mr-2" />
                      Career & Work
                    </h4>
                    <Link href="/talent-exchange" onClick={() => setIsMenuOpen(false)}>
                      <motion.button className="block w-full text-left text-gray-300 hover:text-indigo-400 transition-colors duration-300 font-medium py-2 text-lg" whileHover={{ x: 10 }}>
                        Talent Exchange
                      </motion.button>
                    </Link>
                    <Link href="/liveworks" onClick={() => setIsMenuOpen(false)}>
                      <Motion.button className="block w-full text-left text-gray-300 hover:text-indigo-400 transition-colors duration-300 font-medium py-2 text-lg" whileHover={{ x: 10 }}>
                        LiveWorks
                      </Motion.button>
                    </Link>
                    <Link href="/portfolio" onClick={() => setIsMenuOpen(false)}>
                      <Motion.button className="block w-full text-left text-gray-300 hover:text-indigo-400 transition-colors duration-300 font-medium py-2 text-lg" whileHover={{ x: 10 }}>
                        Portfolio
                      </Motion.button>
                    </Link>
                  </div>

                  {/* User Info & Logout */}
                  <div className="border-t border-gray-700 pt-4 mt-6">
                    <div className="flex items-center space-x-3 text-gray-300 py-3 mb-4">
                      <User size={24} />
                      <span className="font-medium text-xl">
                        {user.full_name || user.email.split('@')[0]}
                      </span>
                    </div>
                    <Motion.button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center space-x-3 text-gray-300 hover:text-indigo-400 transition-colors duration-300 font-medium py-3 text-xl"
                      whileHover={{ x: 10 }}
                    >
                      <LogOut size={20} />
                      <span>Logout</span>
                    </Motion.button>
                  </div>
                </div>
              )}

              {!loading && !user && (
                <div className="space-y-4">
                  <Link href="/auth/login" onClick={() => setIsMenuOpen(false)}>
                    <motion.button
                      className="block w-full text-left text-gray-300 hover:text-indigo-400 transition-colors duration-300 font-medium py-3 text-xl"
                      whileHover={{ x: 10 }}
                    >
                      Login
                    </motion.button>
                  </Link>
                  <Link href="/auth/signup" onClick={() => setIsMenuOpen(false)}>
                    <motion.button
                      className="block w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-300 shadow-lg shadow-indigo-600/30 text-xl"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Sign Up
                    </motion.button>
                  </Link>
                </div>
              )}
            </motion.nav>
          )}
        </AnimatePresence>
                        transition={{ delay: 0.4 }}
                      >
                        <LogOut size={24} />
                        <span>Logout</span>
                      </motion.button>
                    </>
                  ) : (
                    <>
                      <Link href="/auth/login" onClick={() => setIsMenuOpen(false)}>
                        <motion.button
                          className="text-gray-300 hover:text-indigo-400 transition-colors duration-300 font-medium py-3 text-2xl text-left"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 }}
                        >
                          Login
                        </motion.button>
                      </Link>
                      <Link href="/auth/signup" onClick={() => setIsMenuOpen(false)}>
                        <motion.button
                          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-4 rounded-lg font-medium transition-colors duration-300 text-xl"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.45 }}
                        >
                          Sign Up
                        </motion.button>
                      </Link>
                    </>
                  )}
                </>
              )}
            </motion.nav>
          )}
        </AnimatePresence>
      </div>


    </motion.header>
  );
}