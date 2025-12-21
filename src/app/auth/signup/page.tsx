'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, Loader2, ArrowLeft, ArrowRight, Check, MapPin, GraduationCap, Briefcase, Target, Lightbulb, ChevronLeft } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface AnalyticsData {
  demographics: {
    ageRange: string;
    location: string;
    educationLevel: string;
    gender?: string;
  };
  professionalBackground: {
    currentRole: string;
    industry: string;
    experienceLevel: string;
    currentSkills: string[];
    companySize?: string;
  };
  careerGoals: {
    primaryGoal: string;
    targetRole: string;
    timeFrame: string;
    motivationFactors: string[];
  };
  learningPreferences: {
    preferredFormat: string[];
    timeCommitment: string;
    learningStyle: string;
    interests: string[];
  };
  discoverySource: string;
  marketingConsent: boolean;
}

export default function SignupPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
  });

  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    demographics: {
      ageRange: '',
      location: '',
      educationLevel: '',
      gender: '',
    },
    professionalBackground: {
      currentRole: '',
      industry: '',
      experienceLevel: '',
      currentSkills: [],
      companySize: '',
    },
    careerGoals: {
      primaryGoal: '',
      targetRole: '',
      timeFrame: '',
      motivationFactors: [],
    },
    learningPreferences: {
      preferredFormat: [],
      timeCommitment: '',
      learningStyle: '',
      interests: [],
    },
    discoverySource: '',
    marketingConsent: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { signup, user } = useAuth();
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (localStorage.getItem('user')) {
      router.push('/');
    }
  }, [router]);

  const totalSteps = 5;

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAnalyticsChange = (section: keyof AnalyticsData, field: string, value: any) => {
    setAnalyticsData(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        [field]: value
      }
    }));
  };

  const handleTopLevelChange = (field: keyof Pick<AnalyticsData, 'discoverySource' | 'marketingConsent'>, value: any) => {
    setAnalyticsData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMultiSelect = (section: keyof AnalyticsData, field: string, value: string, checked: boolean) => {
    setAnalyticsData(prev => {
      const currentSection = prev[section] || {};
      const currentField = (currentSection as any)[field] || [];
      return {
        ...prev,
        [section]: {
          ...currentSection,
          [field]: checked
            ? [...currentField, value]
            : currentField.filter((item: string) => item !== value)
        }
      };
    });
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.email && formData.password && formData.confirmPassword && formData.fullName &&
               formData.password === formData.confirmPassword &&
               formData.password.length >= 8 &&
               /[A-Z]/.test(formData.password) &&
               /[a-z]/.test(formData.password) &&
               /[0-9]/.test(formData.password));
      case 2:
        return !!(analyticsData.demographics.ageRange && analyticsData.demographics.location && analyticsData.demographics.educationLevel);
      case 3:
        return !!(analyticsData.professionalBackground.currentRole && analyticsData.professionalBackground.industry && analyticsData.professionalBackground.experienceLevel);
      case 4:
        return !!(analyticsData.careerGoals.primaryGoal && analyticsData.careerGoals.targetRole && analyticsData.careerGoals.timeFrame);
      case 5:
        return !!(analyticsData.discoverySource && analyticsData.learningPreferences.preferredFormat.length > 0);
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep) && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(currentStep)) return;

    setIsLoading(true);
    setError('');

    try {
      // Create user account
      await signup(formData.email, formData.password, formData.fullName);

      // Store analytics data
      await fetch('/api/analytics/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user!.id,
          analyticsData
        })
      });

      // Also store in analytics table for general tracking
      await fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user!.id,
          eventType: 'user_registration_complete',
          data: {
            ...analyticsData,
            registrationMethod: 'multi_step_form',
            completionTime: new Date().toISOString()
          }
        })
      });

      router.push('/dashboard?welcome=true');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {Array.from({ length: totalSteps }, (_, i) => (
        <div key={i} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            i + 1 <= currentStep
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-200 text-gray-600'
          }`}>
            {i + 1 <= currentStep ? <Check size={16} /> : i + 1}
          </div>
          {i < totalSteps - 1 && (
            <div className={`w-12 h-0.5 mx-2 ${
              i + 1 < currentStep ? 'bg-indigo-600' : 'bg-gray-200'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Create Your Account</h3>
              <p className="text-gray-600">Let's start with the basics</p>
            </div>

            {/* Full Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="Create a password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Must contain uppercase, lowercase, and number
              </p>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="Confirm your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Tell Us About Yourself</h3>
              <p className="text-gray-600">Help us personalize your experience</p>
            </div>

            {/* Age Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Age Range
              </label>
              <div className="grid grid-cols-2 gap-3">
                {['18-24', '25-34', '35-44', '45-54', '55-64', '65+'].map((age) => (
                  <button
                    key={age}
                    type="button"
                    onClick={() => handleAnalyticsChange('demographics', 'ageRange', age)}
                    className={`p-3 border rounded-lg text-center transition-colors ${
                      analyticsData.demographics.ageRange === age
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {age}
                  </button>
                ))}
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={analyticsData.demographics.location}
                  onChange={(e) => handleAnalyticsChange('demographics', 'location', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="City, Province/State, Country"
                />
              </div>
            </div>

            {/* Education Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Education Level
              </label>
              <div className="space-y-2">
                {[
                  'High School',
                  'Some College/University',
                  'Bachelor\'s Degree',
                  'Master\'s Degree',
                  'Doctorate/PhD',
                  'Other'
                ].map((education) => (
                  <label key={education} className="flex items-center">
                    <input
                      type="radio"
                      name="education"
                      value={education}
                      checked={analyticsData.demographics.educationLevel === education}
                      onChange={(e) => handleAnalyticsChange('demographics', 'educationLevel', e.target.value)}
                      className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-gray-700">{education}</span>
                  </label>
                ))}
              </div>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Professional Background</h3>
              <p className="text-gray-600">Tell us about your current role and experience</p>
            </div>

            {/* Current Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Role/Job Title
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={analyticsData.professionalBackground.currentRole}
                  onChange={(e) => handleAnalyticsChange('professionalBackground', 'currentRole', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="e.g., Software Developer, Marketing Manager"
                />
              </div>
            </div>

            {/* Industry */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Industry
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  'Technology', 'Healthcare', 'Finance', 'Education',
                  'Manufacturing', 'Retail', 'Consulting', 'Other'
                ].map((industry) => (
                  <button
                    key={industry}
                    type="button"
                    onClick={() => handleAnalyticsChange('professionalBackground', 'industry', industry)}
                    className={`p-3 border rounded-lg text-center transition-colors ${
                      analyticsData.professionalBackground.industry === industry
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {industry}
                  </button>
                ))}
              </div>
            </div>

            {/* Experience Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Experience Level
              </label>
              <div className="space-y-2">
                {[
                  'Entry Level (0-2 years)',
                  'Mid Level (3-5 years)',
                  'Senior Level (6-10 years)',
                  'Executive/Leadership (10+ years)'
                ].map((level) => (
                  <label key={level} className="flex items-center">
                    <input
                      type="radio"
                      name="experience"
                      value={level}
                      checked={analyticsData.professionalBackground.experienceLevel === level}
                      onChange={(e) => handleAnalyticsChange('professionalBackground', 'experienceLevel', e.target.value)}
                      className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-gray-700">{level}</span>
                  </label>
                ))}
              </div>
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Career Goals & Learning</h3>
              <p className="text-gray-600">What are you looking to achieve?</p>
            </div>

            {/* Primary Goal */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Primary Learning Goal
              </label>
              <div className="space-y-2">
                {[
                  'Career Advancement',
                  'Skill Development',
                  'Career Change',
                  'Personal Growth',
                  'Entrepreneurship',
                  'Stay Current in Field'
                ].map((goal) => (
                  <label key={goal} className="flex items-center">
                    <input
                      type="radio"
                      name="goal"
                      value={goal}
                      checked={analyticsData.careerGoals.primaryGoal === goal}
                      onChange={(e) => handleAnalyticsChange('careerGoals', 'primaryGoal', e.target.value)}
                      className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-gray-700">{goal}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Target Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Role (if different from current)
              </label>
              <div className="relative">
                <Target className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={analyticsData.careerGoals.targetRole}
                  onChange={(e) => handleAnalyticsChange('careerGoals', 'targetRole', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="e.g., Senior Developer, Product Manager"
                />
              </div>
            </div>

            {/* Time Frame */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                When do you plan to achieve this goal?
              </label>
              <div className="space-y-2">
                {[
                  'Within 3 months',
                  'Within 6 months',
                  'Within 1 year',
                  'Within 2 years',
                  'More than 2 years'
                ].map((timeframe) => (
                  <label key={timeframe} className="flex items-center">
                    <input
                      type="radio"
                      name="timeframe"
                      value={timeframe}
                      checked={analyticsData.careerGoals.timeFrame === timeframe}
                      onChange={(e) => handleAnalyticsChange('careerGoals', 'timeFrame', e.target.value)}
                      className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-gray-700">{timeframe}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Learning Preferences */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Preferred Learning Formats
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  'Video Courses', 'Interactive Quizzes', 'Projects',
                  'Reading Materials', 'Live Sessions', 'Peer Learning'
                ].map((format) => (
                  <label key={format} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={analyticsData.learningPreferences.preferredFormat.includes(format)}
                      onChange={(e) => handleMultiSelect('learningPreferences', 'preferredFormat', format, e.target.checked)}
                      className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-gray-700">{format}</span>
                  </label>
                ))}
              </div>
            </div>
          </motion.div>
        );

      case 5:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Almost There!</h3>
              <p className="text-gray-600">Just a few final questions</p>
            </div>

            {/* How did you find us */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                How did you hear about The 3rd Academy?
              </label>
              <div className="space-y-2">
                {[
                  'Search Engine (Google, Bing, etc.)',
                  'Social Media (LinkedIn, Twitter, etc.)',
                  'Friend/Colleague Recommendation',
                  'Online Article/Blog',
                  'Advertisement',
                  'Other'
                ].map((source) => (
                  <label key={source} className="flex items-center">
                    <input
                      type="radio"
                      name="source"
                      value={source}
                      checked={analyticsData.discoverySource === source}
                      onChange={(e) => handleTopLevelChange('discoverySource', source)}
                      className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-gray-700">{source}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Marketing Consent */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="flex items-start">
                <input
                  type="checkbox"
                  checked={analyticsData.marketingConsent}
                  onChange={(e) => handleTopLevelChange('marketingConsent', e.target.checked)}
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 mt-0.5"
                />
                <span className="ml-2 text-sm text-gray-700">
                  I agree to receive marketing communications and updates about new courses, features, and opportunities from The 3rd Academy. You can unsubscribe at any time.
                </span>
              </label>
            </div>

            {/* Time Commitment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                How much time can you dedicate to learning per week?
              </label>
              <div className="space-y-2">
                {[
                  'Less than 2 hours',
                  '2-5 hours',
                  '5-10 hours',
                  '10-20 hours',
                  'More than 20 hours'
                ].map((time) => (
                  <label key={time} className="flex items-center">
                    <input
                      type="radio"
                      name="time"
                      value={time}
                      checked={analyticsData.learningPreferences.timeCommitment === time}
                      onChange={(e) => handleAnalyticsChange('learningPreferences', 'timeCommitment', e.target.value)}
                      className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-gray-700">{time}</span>
                  </label>
                ))}
              </div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Back to Home Link */}
        <Link
          href="/"
          className="inline-flex items-center text-gray-600 hover:text-indigo-600 transition-colors mb-8"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            className="flex items-center justify-center mb-6"
            whileHover={{ scale: 1.05 }}
          >
            <img
              src="https://api.a0.dev/assets/image?text=Futuristic AI-powered academy logo with glowing blue circuit patterns and neural networks&aspect=1:1&seed=academy_logo"
              alt="The 3rd Academy Logo"
              className="h-16 w-16 mr-4 rounded-full shadow-lg"
            />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              The 3rd Academy
            </h1>
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Join Our Learning Community</h2>
          <p className="text-gray-600">Step {currentStep} of {totalSteps}</p>
        </div>

        {/* Progress Indicator */}
        {renderStepIndicator()}

        {/* Form */}
        <motion.div
          className="bg-white rounded-2xl shadow-xl p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <motion.div
                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {error}
              </motion.div>
            )}

            <AnimatePresence mode="wait">
              {renderStepContent()}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex items-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft size={20} className="mr-2" />
                  Previous
                </button>
              )}

              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!validateStep(currentStep)}
                  className="flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg transition-colors ml-auto"
                >
                  Next
                  <ArrowRight size={20} className="ml-2" />
                </button>
              ) : (
                <motion.button
                  type="submit"
                  disabled={isLoading || !validateStep(currentStep)}
                  className="flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg transition-colors ml-auto"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={20} />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      Complete Registration
                      <Check size={20} className="ml-2" />
                    </>
                  )}
                </motion.button>
              )}
            </div>
          </form>
        </motion.div>

        {/* Switch to Login */}
        <div className="text-center mt-6">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link
              href="/auth/login"
              className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}