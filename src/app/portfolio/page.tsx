'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { getUserPortfolios, getUserSkillPassports, getUserProgress, getUserSimulations } from '@/lib/supabase-database-tools';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Briefcase, Code, Award, TrendingUp, ExternalLink, Github, Globe, Play, Star, Calendar, Target } from 'lucide-react';

interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  links?: any;
  created_at: string;
  status: string;
  category?: string;
  technologies?: string[];
}

interface SkillShowcase {
  skill: string;
  level: string;
  progress: number;
  projects: number;
  lastUpdated: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earnedDate: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
}

export default function PortfolioPage() {
  const { user } = useAuth();
  const [portfolios, setPortfolios] = useState<PortfolioItem[]>([]);
  const [skillPassports, setSkillPassports] = useState<any[]>([]);
  const [progress, setProgress] = useState<any[]>([]);
  const [simulations, setSimulations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadPortfolioData();
    }
  }, [user]);

  const loadPortfolioData = async () => {
    try {
      // Load data individually to prevent one failure from blocking others
      const portfolioPromise = getUserPortfolios(user!.id).catch(error => {
        console.error('Failed to load portfolios:', error);
        return { data: [] };
      });

      const passportPromise = getUserSkillPassports(user!.id).catch(error => {
        console.error('Failed to load skill passports:', error);
        return { data: [] };
      });

      const progressPromise = getUserProgress(user!.id).catch(error => {
        console.error('Failed to load progress:', error);
        return { data: [] };
      });

      const simulationPromise = getUserSimulations(user!.id).catch(error => {
        console.error('Failed to load simulations:', error);
        return { data: [] };
      });

      const [portfolioData, passportData, progressData, simulationData] = await Promise.all([
        portfolioPromise,
        passportPromise,
        progressPromise,
        simulationPromise
      ]);

      setPortfolios((portfolioData as any).data || []);
      setSkillPassports((passportData as any).data || []);
      setProgress((progressData as any).data || []);
      setSimulations((simulationData as any).data || []);
    } catch (error) {
      console.error('Error loading portfolio data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Generate skill showcase from progress data
  const skillShowcase: SkillShowcase[] = progress.reduce((acc: SkillShowcase[], entry: any) => {
    const existing = acc.find(s => s.skill === entry.skill);
    if (existing) {
      existing.projects += 1;
      existing.lastUpdated = entry.date > existing.lastUpdated ? entry.date : existing.lastUpdated;
    } else {
      acc.push({
        skill: entry.skill,
        level: entry.level,
        progress: Math.min(100, entry.score),
        projects: 1,
        lastUpdated: entry.date
      });
    }
    return acc;
  }, []);

  // Generate achievements based on accomplishments
  const achievements: Achievement[] = [];

  if (skillPassports.length > 0) {
    achievements.push({
      id: 'first-passport',
      title: 'First Passport',
      description: 'Created your first skill passport',
      icon: 'Award',
      earnedDate: skillPassports[0]?.created_at,
      rarity: 'Common'
    });
  }

  if (simulations.length >= 3) {
    achievements.push({
      id: 'assessment-master',
      title: 'Assessment Master',
      description: 'Completed 3+ AI assessments',
      icon: 'Target',
      earnedDate: simulations[simulations.length - 1]?.created_at,
      rarity: 'Rare'
    });
  }

  if (portfolios.length >= 2) {
    achievements.push({
      id: 'portfolio-builder',
      title: 'Portfolio Builder',
      description: 'Added 2+ projects to portfolio',
      icon: 'Briefcase',
      earnedDate: portfolios[portfolios.length - 1]?.created_at,
      rarity: 'Epic'
    });
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Common': return 'bg-gray-100 text-gray-800';
      case 'Rare': return 'bg-blue-100 text-blue-800';
      case 'Epic': return 'bg-purple-100 text-purple-800';
      case 'Legendary': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
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
      {/* Profile Header */}
      <div className="mb-8">
        <div className="flex items-center gap-6 mb-6">
          <Avatar className="h-24 w-24">
            <AvatarImage src={`https://api.a0.dev/assets/image?text=${user?.full_name?.charAt(0) || user?.email?.charAt(0)}&aspect=1:1&seed=portfolio`} />
            <AvatarFallback className="text-2xl">
              {user?.full_name?.charAt(0) || user?.email?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold mb-2">{user?.full_name || 'Portfolio'}</h1>
            <p className="text-muted-foreground mb-4">
              Full-Stack Developer | AI Enthusiast | Problem Solver
            </p>
            <div className="flex gap-4">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Star className="h-3 w-3" />
                {skillPassports.length} Skill Passports
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Briefcase className="h-3 w-3" />
                {portfolios.length} Projects
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Target className="h-3 w-3" />
                {simulations.length} Assessments
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="projects" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-gradient-to-br from-gray-800/20 to-gray-900/20 backdrop-blur-md border-white/10">
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Project Portfolio</h2>
            <Button asChild>
              <a href="/liveworks">Add New Project</a>
            </Button>
          </div>

          {portfolios.length === 0 ? (
            <Card className="bg-gradient-to-br from-gray-600/20 to-slate-600/20 backdrop-blur-xl border border-white/10">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Briefcase className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-300 mb-2">No projects yet</h3>
                <p className="text-gray-400 text-center mb-4">
                  Start building your portfolio by completing LiveWorks projects
                </p>
                <Button asChild>
                  <a href="/liveworks">Explore Projects</a>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {portfolios.map((project) => (
                <Card key={project.id} className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 backdrop-blur-xl border border-white/10 hover:from-indigo-600/30 hover:to-purple-600/30 transition-all duration-300">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl text-gray-300">{project.title}</CardTitle>
                        <CardDescription className="flex items-center gap-2 text-gray-400">
                          <Calendar className="h-4 w-4" />
                          {new Date(project.created_at).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <Badge variant={project.status === 'Published' ? 'default' : 'secondary'}>
                        {project.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{project.description}</p>

                    {project.links && (
                      <div className="flex flex-wrap gap-2">
                        {project.links.github && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={project.links.github} target="_blank" rel="noopener noreferrer">
                              <Github className="h-4 w-4 mr-2" />
                              GitHub
                            </a>
                          </Button>
                        )}
                        {project.links.live && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={project.links.live} target="_blank" rel="noopener noreferrer">
                              <Globe className="h-4 w-4 mr-2" />
                              Live Demo
                            </a>
                          </Button>
                        )}
                        {project.links.demo && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={project.links.demo} target="_blank" rel="noopener noreferrer">
                              <Play className="h-4 w-4 mr-2" />
                              Demo Video
                            </a>
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="skills" className="space-y-6">
          <h2 className="text-2xl font-semibold">Skills & Expertise</h2>

          {skillShowcase.length === 0 ? (
            <Card className="bg-gradient-to-br from-gray-800/20 to-gray-900/20 backdrop-blur-md border-white/10">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No skills tracked yet</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Complete assessments and track progress to showcase your skills
                </p>
                <Button asChild>
                  <a href="/simulations">Take Assessment</a>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {skillShowcase.map((skill, index) => (
                <Card key={index} className="bg-gradient-to-br from-gray-800/20 to-gray-900/20 backdrop-blur-md border-white/10">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">{skill.skill}</CardTitle>
                      <div className="text-right">
                        <Badge variant="outline" className="mb-1">{skill.level}</Badge>
                        <p className="text-sm text-muted-foreground">
                          {skill.projects} project{skill.projects !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Proficiency</span>
                        <span>{skill.progress}%</span>
                      </div>
                      <Progress value={skill.progress} className="h-2" />
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Last updated: {new Date(skill.lastUpdated).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <h2 className="text-2xl font-semibold">Achievements & Milestones</h2>

          {achievements.length === 0 ? (
            <Card className="bg-gradient-to-br from-gray-800/20 to-gray-900/20 backdrop-blur-md border-white/10">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Award className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No achievements yet</h3>
                <p className="text-muted-foreground text-center">
                  Keep learning and completing projects to unlock achievements
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {achievements.map((achievement) => (
                <Card key={achievement.id} className="border-l-4 border-l-yellow-400 bg-gradient-to-br from-gray-800/20 to-gray-900/20 backdrop-blur-md border-white/10">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-yellow-100 rounded-full">
                        <Award className="h-6 w-6 text-yellow-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg">{achievement.title}</h3>
                          <Badge className={getRarityColor(achievement.rarity)}>
                            {achievement.rarity}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground mb-2">{achievement.description}</p>
                        <p className="text-sm text-muted-foreground">
                          Earned {new Date(achievement.earnedDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <h2 className="text-2xl font-semibold">Recent Activity</h2>

          <div className="space-y-4">
            {skillPassports.slice(0, 5).map((passport: any, index: number) => (
              <Card key={passport.id} className="bg-gradient-to-br from-gray-800/20 to-gray-900/20 backdrop-blur-md border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <Award className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Generated Skill Passport: {passport.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(passport.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {simulations.slice(0, 3).map((simulation: any, index: number) => (
              <Card key={simulation.id} className="bg-gradient-to-br from-gray-800/20 to-gray-900/20 backdrop-blur-md border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-full">
                      <Target className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Completed {simulation.simulation_type} Assessment</p>
                      <p className="text-sm text-muted-foreground">
                        Score: {simulation.score}% • {new Date(simulation.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {progress.slice(0, 3).map((entry: any, index: number) => (
              <Card key={`${entry.skill}-${index}`} className="bg-gradient-to-br from-gray-800/20 to-gray-900/20 backdrop-blur-md border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-full">
                      <TrendingUp className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Updated {entry.skill} progress</p>
                      <p className="text-sm text-muted-foreground">
                        Level: {entry.level} • Score: {entry.score} • {new Date(entry.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {skillPassports.length === 0 && simulations.length === 0 && progress.length === 0 && (
            <Card className="bg-gradient-to-br from-gray-800/20 to-gray-900/20 backdrop-blur-md border-white/10">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No activity yet</h3>
                <p className="text-muted-foreground text-center">
                  Start your learning journey to see your activity here
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
      <Footer />
    </div>
  );
}