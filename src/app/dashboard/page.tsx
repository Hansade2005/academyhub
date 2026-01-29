'use client';

import { useAuth } from '@/lib/auth-context';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  getUserSkillPassports,
  getUserProgress,
  getUserSimulations,
  getUserPortfolios,
  getUserApplications,
  calculateConfidenceScore,
  getUserAchievements
} from '@/lib/supabase-database-tools';
import Link from 'next/link';
import {
  Award,
  TrendingUp,
  Target,
  Calendar,
  Bell,
  Star,
  BookOpen,
  Briefcase,
  Users,
  Trophy,
  Zap,
  ChevronRight,
  BarChart3,
  PieChart,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Rocket,
  Brain,
  Code,
  Palette,
  Database,
  Globe
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { motion, AnimatePresence } from 'framer-motion';


interface DashboardStats {
  passports: number;
  progressEntries: number;
  simulations: number;
  portfolios: number;
  applications: number;
  confidenceScore: number;
  recentActivity: any[];
  achievements: any[];
  goals: any[];
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earned: boolean;
  progress: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export default function Dashboard() {
  const { user, loading } = useAuth();
  const searchParams = useSearchParams();
  const isNewUser = searchParams.get('welcome') === 'true';
  const [stats, setStats] = useState<DashboardStats>({
    passports: 0,
    progressEntries: 0,
    simulations: 0,
    portfolios: 0,
    applications: 0,
    confidenceScore: 0,
    recentActivity: [],
    achievements: [],
    goals: []
  });
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      const [
        passportsRes,
        progressRes,
        simRes,
        portfoliosRes,
        applicationsRes,
        achievements
      ] = await Promise.all([
        getUserSkillPassports(user!.id),
        getUserProgress(user!.id),
        getUserSimulations(user!.id),
        getUserPortfolios(user!.id),
        getUserApplications(user!.id),
        getUserAchievements(user!.id)
      ]);

      const confidenceScore = await calculateConfidenceScore(user!.id);

      // Generate recent activity
      const recentActivity = [
        ...(passportsRes.data?.slice(0, 2).map((p: any) => ({
          type: 'passport',
          title: `Generated "${p.title}" passport`,
          time: p.created_at,
          icon: '📄'
        })) || []),
        ...(simRes.data?.slice(0, 2).map((s: any) => ({
          type: 'simulation',
          title: `Completed ${s.simulation_type} assessment`,
          time: s.created_at,
          icon: '🎯'
        })) || [])
      ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

      setStats({
        passports: passportsRes.data?.length || 0,
        progressEntries: progressRes.data?.length || 0,
        simulations: simRes.data?.length || 0,
        portfolios: portfoliosRes.data?.length || 0,
        applications: applicationsRes.data?.length || 0,
        confidenceScore,
        recentActivity,
        achievements,
        goals: []
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'from-gray-400 to-gray-600';
      case 'rare': return 'from-blue-400 to-blue-600';
      case 'epic': return 'from-purple-400 to-purple-600';
      case 'legendary': return 'from-yellow-400 to-yellow-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Card className="bg-gradient-to-br from-red-600/20 to-orange-600/20 backdrop-blur-xl border border-white/10">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-300 mb-4">Access Required</h2>
            <p className="text-gray-400 mb-6">Please log in to access your dashboard</p>
            <Button asChild>
              <Link href="/auth/login">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
      
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between">
            <div>
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="text-4xl font-bold text-white mb-2"
              >
                {isNewUser ? `Welcome to The 3rd Academy, ${user.full_name?.split(' ')[0] || 'Explorer'}! 🎉` : `Welcome back, ${user.full_name?.split(' ')[0] || 'Explorer'}! 👋`}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="text-xl text-white/80"
              >
                {isNewUser ? 'Your learning journey begins now. Let\'s create your first skill passport!' : 'Your learning journey continues. Let\'s build something amazing today.'}
              </motion.p>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="hidden md:block"
            >
              <Avatar className="h-20 w-20 ring-4 ring-white/20">
                <AvatarImage src={`https://api.a0.dev/assets/image?text=${user.full_name?.charAt(0) || 'U'}&aspect=1:1&seed=dashboard`} />
                <AvatarFallback className="text-2xl bg-gradient-to-br from-purple-500 to-blue-500 text-white">
                  {user.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* New User Welcome Banner */}
      {isNewUser && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8"
        >
          <Card className="bg-gradient-to-br from-emerald-600/20 to-teal-600/20 backdrop-blur-xl border border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-emerald-500/20 rounded-full">
                    <Sparkles className="h-6 w-6 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-300">Welcome to Your Learning Dashboard! 🎊</h3>
                    <p className="text-gray-400">Get started by creating your first skill passport to showcase your expertise.</p>
                  </div>
                </div>
                <Button asChild className="bg-green-600 hover:bg-green-700">
                  <Link href="/skill-passport">
                    Create Skill Passport
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 bg-gradient-to-br from-gray-800/20 to-gray-900/20 backdrop-blur-md border-white/10">
            <TabsTrigger value="overview" className="data-[state=active]:bg-white/20">Overview</TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-white/20">Analytics</TabsTrigger>
            <TabsTrigger value="achievements" className="data-[state=active]:bg-white/20">Achievements</TabsTrigger>
            <TabsTrigger value="activity" className="data-[state=active]:bg-white/20">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            {/* Key Metrics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-md border-white/20 hover:from-blue-500/30 hover:to-blue-600/30 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-200 text-sm font-medium">Skill Passports</p>
                      <p className="text-3xl font-bold text-white">{stats.passports}</p>
                    </div>
                    <Award className="h-8 w-8 text-blue-400" />
                  </div>
                  <div className="mt-4">
                    <Progress value={(stats.passports / 10) * 100} className="h-2" />
                    <p className="text-xs text-blue-200 mt-1">Next: {10 - stats.passports} more</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-md border-white/20 hover:from-green-500/30 hover:to-green-600/30 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-200 text-sm font-medium">Confidence Score</p>
                      <p className="text-3xl font-bold text-white">{stats.confidenceScore.toFixed(1)}%</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-400" />
                  </div>
                  <div className="mt-4">
                    <Progress value={stats.confidenceScore} className="h-2" />
                    <p className="text-xs text-green-200 mt-1">
                      {stats.confidenceScore >= 80 ? 'Excellent!' : stats.confidenceScore >= 60 ? 'Good progress' : 'Keep learning'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-md border-white/20 hover:from-purple-500/30 hover:to-purple-600/30 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-200 text-sm font-medium">Simulations</p>
                      <p className="text-3xl font-bold text-white">{stats.simulations}</p>
                    </div>
                    <Target className="h-8 w-8 text-purple-400" />
                  </div>
                  <div className="mt-4">
                    <Progress value={(stats.simulations / 5) * 100} className="h-2" />
                    <p className="text-xs text-purple-200 mt-1">Next: {5 - stats.simulations} more</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 backdrop-blur-md border-white/20 hover:from-orange-500/30 hover:to-orange-600/30 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-200 text-sm font-medium">Portfolio</p>
                      <p className="text-3xl font-bold text-white">{stats.portfolios}</p>
                    </div>
                    <Briefcase className="h-8 w-8 text-orange-400" />
                  </div>
                  <div className="mt-4">
                    <Progress value={(stats.portfolios / 3) * 100} className="h-2" />
                    <p className="text-xs text-orange-200 mt-1">Next: {3 - stats.portfolios} more</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Actions Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-gradient-to-br from-gray-800/20 to-gray-900/20 backdrop-blur-md border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Quick Actions
                  </CardTitle>
                  <CardDescription className="text-white/70">
                    Jump into your next learning milestone
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Link href="/skill-passport">
                        <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-500/30 hover:from-blue-500/30 hover:to-blue-600/30 transition-all duration-300 cursor-pointer">
                          <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                              <div className="p-3 bg-blue-500/20 rounded-lg">
                                <Award className="h-6 w-6 text-blue-400" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-white">Generate Passport</h3>
                                <p className="text-sm text-blue-200">Create skill verification</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Link href="/simulations">
                        <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border-purple-500/30 hover:from-purple-500/30 hover:to-purple-600/30 transition-all duration-300 cursor-pointer">
                          <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                              <div className="p-3 bg-purple-500/20 rounded-lg">
                                <Brain className="h-6 w-6 text-purple-400" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-white">AI Assessment</h3>
                                <p className="text-sm text-purple-200">Test your skills</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Link href="/talent-exchange">
                        <Card className="bg-gradient-to-br from-green-500/20 to-green-600/20 border-green-500/30 hover:from-green-500/30 hover:to-green-600/30 transition-all duration-300 cursor-pointer">
                          <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                              <div className="p-3 bg-green-500/20 rounded-lg">
                                <Briefcase className="h-6 w-6 text-green-400" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-white">Find Jobs</h3>
                                <p className="text-sm text-green-200">Explore opportunities</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Link href="/liveworks">
                        <Card className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 border-orange-500/30 hover:from-orange-500/30 hover:to-orange-600/30 transition-all duration-300 cursor-pointer">
                          <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                              <div className="p-3 bg-orange-500/20 rounded-lg">
                                <Code className="h-6 w-6 text-orange-400" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-white">LiveWorks</h3>
                                <p className="text-sm text-orange-200">Real project work</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Link href="/portfolio">
                        <Card className="bg-gradient-to-br from-pink-500/20 to-pink-600/20 border-pink-500/30 hover:from-pink-500/30 hover:to-pink-600/30 transition-all duration-300 cursor-pointer">
                          <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                              <div className="p-3 bg-pink-500/20 rounded-lg">
                                <Palette className="h-6 w-6 text-pink-400" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-white">Portfolio</h3>
                                <p className="text-sm text-pink-200">Showcase your work</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Link href="/mentors">
                        <Card className="bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 border-cyan-500/30 hover:from-cyan-500/30 hover:to-cyan-600/30 transition-all duration-300 cursor-pointer">
                          <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                              <div className="p-3 bg-cyan-500/20 rounded-lg">
                                <Users className="h-6 w-6 text-cyan-400" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-white">Find Mentors</h3>
                                <p className="text-sm text-cyan-200">Get expert guidance</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-gradient-to-br from-gray-800/20 to-gray-900/20 backdrop-blur-md border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription className="text-white/70">
                    Your latest learning milestones
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.recentActivity.length > 0 ? (
                      stats.recentActivity.map((activity, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * index }}
                          className="flex items-center gap-4 p-4 bg-white/5 rounded-lg"
                        >
                          <div className="text-2xl">{activity.icon}</div>
                          <div className="flex-1">
                            <p className="text-white font-medium">{activity.title}</p>
                            <p className="text-white/60 text-sm">
                              {new Date(activity.time).toLocaleDateString()}
                            </p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-white/40" />
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <Activity className="h-12 w-12 text-white/40 mx-auto mb-4" />
                        <p className="text-white/60">No recent activity. Start your learning journey!</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-gradient-to-br from-gray-800/20 to-gray-900/20 backdrop-blur-md border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Learning Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-white/80">Overall Progress</span>
                        <span className="text-white">{Math.round((stats.passports + stats.simulations + stats.portfolios) / 12 * 100)}%</span>
                      </div>
                      <Progress value={(stats.passports + stats.simulations + stats.portfolios) / 12 * 100} className="h-3" />
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-blue-400">{stats.passports}</p>
                        <p className="text-xs text-white/60">Passports</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-purple-400">{stats.simulations}</p>
                        <p className="text-xs text-white/60">Assessments</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-orange-400">{stats.portfolios}</p>
                        <p className="text-xs text-white/60">Projects</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-gray-800/20 to-gray-900/20 backdrop-blur-md border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Skill Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-white/80">Technical Skills</span>
                      <span className="text-white font-medium">75%</span>
                    </div>
                    <Progress value={75} className="h-2" />

                    <div className="flex justify-between items-center">
                      <span className="text-white/80">Soft Skills</span>
                      <span className="text-white font-medium">60%</span>
                    </div>
                    <Progress value={60} className="h-2" />

                    <div className="flex justify-between items-center">
                      <span className="text-white/80">Industry Knowledge</span>
                      <span className="text-white font-medium">45%</span>
                    </div>
                    <Progress value={45} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stats.achievements.map((achievement, index) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <Card className={`bg-gradient-to-br ${getRarityColor(achievement.rarity)} backdrop-blur-md border-white/20 ${achievement.earned ? 'ring-2 ring-white/50' : 'opacity-60'}`}>
                    <CardContent className="p-6 text-center">
                      <div className="text-4xl mb-4">{achievement.icon}</div>
                      <h3 className="font-bold text-white mb-2">{achievement.title}</h3>
                      <p className="text-white/80 text-sm mb-4">{achievement.description}</p>
                      <div className="space-y-2">
                        <Progress value={achievement.progress} className="h-2" />
                        <p className="text-xs text-white/60">{achievement.progress}% complete</p>
                      </div>
                      {achievement.earned && (
                        <Badge className="mt-3 bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                          <Trophy className="h-3 w-3 mr-1" />
                          Earned
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-8">
            <Card className="bg-gradient-to-br from-gray-800/20 to-gray-900/20 backdrop-blur-md border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Activity Timeline</CardTitle>
                <CardDescription className="text-white/70">
                  Your complete learning journey
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <div className="w-0.5 h-16 bg-white/20"></div>
                    </div>
                    <div className="flex-1 pb-6">
                      <div className="flex items-center gap-2 mb-2">
                        <Award className="h-4 w-4 text-blue-400" />
                        <span className="text-white font-medium">Joined The 3rd Academy</span>
                        <Badge variant="outline" className="text-xs">Welcome</Badge>
                      </div>
                      <p className="text-white/60 text-sm">Started your proof-based learning journey</p>
                      <p className="text-white/40 text-xs mt-1">2 weeks ago</p>
                    </div>
                  </div>

                  {stats.passports > 0 && (
                    <div className="flex items-start gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <div className="w-0.5 h-16 bg-white/20"></div>
                      </div>
                      <div className="flex-1 pb-6">
                        <div className="flex items-center gap-2 mb-2">
                          <Award className="h-4 w-4 text-green-400" />
                          <span className="text-white font-medium">First Skill Passport</span>
                          <Badge variant="outline" className="text-xs">Milestone</Badge>
                        </div>
                        <p className="text-white/60 text-sm">Generated your first verified skill credential</p>
                        <p className="text-white/40 text-xs mt-1">1 week ago</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <div className="w-0.5 h-16 bg-white/20"></div>
                    </div>
                    <div className="flex-1 pb-6">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="h-4 w-4 text-purple-400" />
                        <span className="text-white font-medium">Assessment Completed</span>
                        <Badge variant="outline" className="text-xs">Progress</Badge>
                      </div>
                      <p className="text-white/60 text-sm">Successfully completed AI-powered skill assessment</p>
                      <p className="text-white/40 text-xs mt-1">3 days ago</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Briefcase className="h-4 w-4 text-orange-400" />
                        <span className="text-white font-medium">LiveWorks Project</span>
                        <Badge variant="outline" className="text-xs">Achievement</Badge>
                      </div>
                      <p className="text-white/60 text-sm">Started working on real-world project opportunity</p>
                      <p className="text-white/40 text-xs mt-1">Today</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
}