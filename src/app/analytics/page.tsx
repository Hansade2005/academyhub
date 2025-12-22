'use client';

import { useAuth } from '@/lib/auth-context';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { getUserProgress, getUserSimulations, getUserSkillPassports, ProgressEntry, Simulation, calculateConfidenceScore } from '@/lib/database-tools';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [progressData, setProgressData] = useState<ProgressEntry[]>([]);
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [passports, setPassports] = useState<any[]>([]);
  const [confidenceScore, setConfidenceScore] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadAnalytics();
    }
  }, [user]);

  const loadAnalytics = async () => {
    try {
      const [progressRes, simRes, passportRes] = await Promise.all([
        getUserProgress(user!.id),
        getUserSimulations(user!.id),
        getUserSkillPassports(user!.id)
      ]);

      if (progressRes.success) setProgressData(progressRes.data);
      if (simRes.success) setSimulations(simRes.data);
      if (passportRes.success) setPassports(passportRes.data);

      // Calculate confidence score
      const score = await calculateConfidenceScore(user!.id);
      setConfidenceScore(score);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div className="flex justify-center items-center min-h-screen">Please log in to view analytics.</div>;
  }

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading your analytics...</div>;
  }

  // Calculate metrics
  const totalSimulations = simulations.length;
  const averageSimulationScore = simulations.length > 0
    ? Math.round(simulations.reduce((sum, sim) => sum + sim.score, 0) / simulations.length)
    : 0;

  const skillsTracked = Array.from(new Set(progressData.map(p => p.skill))).length;
  const recentProgress = progressData.slice(0, 5);

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics & Insights</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Track your progress and skill development over time
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-600/20 to-indigo-600/20 backdrop-blur-xl border border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                Skill Passports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">{passports.length}</div>
              <p className="text-xs text-gray-400">Generated documents</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 backdrop-blur-xl border border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                Simulations Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">{totalSimulations}</div>
              <p className="text-xs text-gray-400">AI assessments taken</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-xl border border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                Average Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-400">{averageSimulationScore}%</div>
              <p className="text-xs text-gray-400">Across all simulations</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-600/20 to-red-600/20 backdrop-blur-xl border border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                Skills Tracked
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-400">{skillsTracked}</div>
              <p className="text-xs text-gray-400">Unique skills monitored</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-600/20 to-teal-600/20 backdrop-blur-xl border border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                Confidence Score™
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${confidenceScore >= 80 ? 'text-green-400' : confidenceScore >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                {confidenceScore}%
              </div>
              <p className="text-xs text-gray-400">Overall readiness</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Progress */}
          <Card className="bg-gradient-to-br from-gray-800/20 to-gray-900/20 backdrop-blur-md border-white/10">
            <CardHeader>
              <CardTitle>Recent Progress</CardTitle>
              <CardDescription>Your latest skill development entries</CardDescription>
            </CardHeader>
            <CardContent>
              {recentProgress.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No progress entries yet</p>
              ) : (
                <div className="space-y-4">
                  {recentProgress.map((entry, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{entry.skill}</p>
                        <p className="text-sm text-gray-500">{entry.level}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">{entry.score}%</p>
                        <p className="text-xs text-gray-500">
                          {new Date(entry.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Simulation Performance */}
          <Card className="bg-gradient-to-br from-gray-800/20 to-gray-900/20 backdrop-blur-md border-white/10">
            <CardHeader>
              <CardTitle>Simulation Performance</CardTitle>
              <CardDescription>Your assessment results over time</CardDescription>
            </CardHeader>
            <CardContent>
              {simulations.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No simulations completed yet</p>
              ) : (
                <div className="space-y-4">
                  {simulations.slice(0, 5).map((sim, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{sim.simulation_type}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(sim.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${sim.score >= 70 ? 'text-green-600' : sim.score >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {sim.score}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Skill Development Chart Placeholder */}
        <Card className="mt-8 bg-gradient-to-br from-gray-800/20 to-gray-900/20 backdrop-blur-md border-white/10">
          <CardHeader>
            <CardTitle>Skill Development Over Time</CardTitle>
            <CardDescription>Visual representation of your progress trends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from(new Set(progressData.map(p => p.skill))).map(skill => {
                const skillProgress = progressData
                  .filter(p => p.skill === skill)
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

                if (skillProgress.length < 2) return null;

                const latestScore = skillProgress[skillProgress.length - 1].score;
                const previousScore = skillProgress[skillProgress.length - 2].score;
                const trend = latestScore - previousScore;

                return (
                  <div key={skill} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">{skill}</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${latestScore}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          {latestScore}%
                        </span>
                      </div>
                    </div>
                    <div className="ml-4 text-right">
                      <div className={`text-sm font-medium ${trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                        {trend > 0 ? '+' : ''}{trend}%
                      </div>
                      <div className="text-xs text-gray-500">
                        {skillProgress.length} entries
                      </div>
                    </div>
                  </div>
                );
              })}
              {Array.from(new Set(progressData.map(p => p.skill))).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No skill progress data available yet.</p>
                  <p className="text-sm mt-1">Complete more assessments to see your development trends.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}