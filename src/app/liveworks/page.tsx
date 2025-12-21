'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { getUserPortfolios, createPortfolio } from '@/lib/database-tools';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Briefcase, Code, Palette, TrendingUp, Users, DollarSign, Clock, Star, Plus, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';


interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  budget: string;
  duration: string;
  skills: string[];
  client: string;
  status: 'Open' | 'In Progress' | 'Completed';
  applicants: number;
  featured: boolean;
}

interface Portfolio {
  id: string;
  title: string;
  description: string;
  links?: any;
  created_at: string;
  status: 'Draft' | 'Published';
}

const MOCK_PROJECTS: Project[] = [
  {
    id: '1',
    title: 'E-commerce Website Redesign',
    description: 'Modernize an existing e-commerce site with improved UX and mobile responsiveness. Includes payment integration and admin dashboard.',
    category: 'Web Development',
    difficulty: 'Intermediate',
    budget: '$2,000 - $3,500',
    duration: '4-6 weeks',
    skills: ['React', 'Node.js', 'MongoDB', 'Stripe API'],
    client: 'Fashion Retail Co.',
    status: 'Open',
    applicants: 12,
    featured: true
  },
  {
    id: '2',
    title: 'Mobile App for Fitness Tracking',
    description: 'Build a cross-platform mobile app for fitness enthusiasts to track workouts, nutrition, and progress with social features.',
    category: 'Mobile Development',
    difficulty: 'Advanced',
    budget: '$4,000 - $6,000',
    duration: '8-10 weeks',
    skills: ['React Native', 'Firebase', 'Health APIs', 'UI/UX Design'],
    client: 'FitLife Inc.',
    status: 'Open',
    applicants: 8,
    featured: false
  },
  {
    id: '3',
    title: 'Data Visualization Dashboard',
    description: 'Create an interactive dashboard for business analytics with real-time data visualization and custom reporting features.',
    category: 'Data Science',
    difficulty: 'Intermediate',
    budget: '$1,500 - $2,500',
    duration: '3-4 weeks',
    skills: ['Python', 'D3.js', 'SQL', 'Tableau'],
    client: 'Analytics Corp',
    status: 'In Progress',
    applicants: 15,
    featured: true
  },
  {
    id: '4',
    title: 'Brand Identity & Logo Design',
    description: 'Complete brand identity package including logo, color palette, typography, and brand guidelines for a tech startup.',
    category: 'Design',
    difficulty: 'Beginner',
    budget: '$800 - $1,200',
    duration: '2-3 weeks',
    skills: ['Adobe Creative Suite', 'Brand Strategy', 'Typography'],
    client: 'TechStart Inc.',
    status: 'Open',
    applicants: 6,
    featured: false
  }
];

export default function LiveWorksPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [isCreatePortfolioOpen, setIsCreatePortfolioOpen] = useState(false);

  // Portfolio form state
  const [portfolioForm, setPortfolioForm] = useState({
    title: '',
    description: '',
    githubUrl: '',
    liveUrl: '',
    demoUrl: ''
  });

  useEffect(() => {
    if (user) {
      loadPortfolios();
    }
  }, [user]);

  const loadPortfolios = async () => {
    try {
      const portfolioData = await getUserPortfolios(user!.id);
      setPortfolios((portfolioData as any).data || []);
    } catch (error) {
      console.error('Error loading portfolios:', error);
    }
  };

  const filteredProjects = projects.filter(project => {
    const categoryMatch = selectedCategory === 'All' || project.category === selectedCategory;
    const difficultyMatch = selectedDifficulty === 'All' || project.difficulty === selectedDifficulty;
    return categoryMatch && difficultyMatch;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Web Development': return <Code className="h-5 w-5" />;
      case 'Mobile Development': return <Briefcase className="h-5 w-5" />;
      case 'Data Science': return <TrendingUp className="h-5 w-5" />;
      case 'Design': return <Palette className="h-5 w-5" />;
      default: return <Briefcase className="h-5 w-5" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCreatePortfolio = async () => {
    if (!user || !portfolioForm.title || !portfolioForm.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const links = {
        github: portfolioForm.githubUrl,
        live: portfolioForm.liveUrl,
        demo: portfolioForm.demoUrl
      };

      await createPortfolio(user.id, portfolioForm.title, portfolioForm.description, links);
      toast.success('Portfolio created successfully!');
      setIsCreatePortfolioOpen(false);
      setPortfolioForm({
        title: '',
        description: '',
        githubUrl: '',
        liveUrl: '',
        demoUrl: ''
      });
      loadPortfolios();
    } catch (error) {
      console.error('Error creating portfolio:', error);
      toast.error('Failed to create portfolio');
    } finally {
      setLoading(false);
    }
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">LiveWorks Studio</h1>
        <p className="text-muted-foreground">
          Apply your skills to real projects, build your portfolio, and earn while you learn
        </p>
      </div>

      <Tabs defaultValue="projects" className="space-y-6">
        <TabsList>
          <TabsTrigger value="projects">Available Projects</TabsTrigger>
          <TabsTrigger value="portfolio">My Portfolio</TabsTrigger>
          <TabsTrigger value="applications">My Applications</TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Categories</SelectItem>
                <SelectItem value="Web Development">Web Development</SelectItem>
                <SelectItem value="Mobile Development">Mobile Development</SelectItem>
                <SelectItem value="Data Science">Data Science</SelectItem>
                <SelectItem value="Design">Design</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Levels</SelectItem>
                <SelectItem value="Beginner">Beginner</SelectItem>
                <SelectItem value="Intermediate">Intermediate</SelectItem>
                <SelectItem value="Advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Featured Projects */}
          {filteredProjects.some(p => p.featured) && (
            <div>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <Star className="h-6 w-6 text-yellow-500" />
                Featured Projects
              </h2>
              <div className="grid gap-6">
                {filteredProjects.filter(p => p.featured).map((project) => (
                  <Card key={project.id} className="border-2 border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          {getCategoryIcon(project.category)}
                          <div>
                            <CardTitle className="text-xl">{project.title}</CardTitle>
                            <CardDescription className="flex items-center gap-2">
                              <span>{project.client}</span>
                              <Badge className={getDifficultyColor(project.difficulty)}>
                                {project.difficulty}
                              </Badge>
                            </CardDescription>
                          </div>
                        </div>
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                          Featured
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">{project.description}</p>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium">{project.budget}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-blue-600" />
                          <span className="text-sm">{project.duration}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-purple-600" />
                          <span className="text-sm">{project.applicants} applicants</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-orange-600" />
                          <span className="text-sm">{project.category}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {project.skills.map((skill, index) => (
                          <Badge key={index} variant="outline">
                            {skill}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex justify-between items-center">
                        <Badge variant={project.status === 'Open' ? 'default' : 'secondary'}>
                          {project.status}
                        </Badge>
                        <Button>Apply Now</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* All Projects */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">All Projects</h2>
            <div className="grid gap-6">
              {filteredProjects.map((project) => (
                <Card key={project.id} className="bg-gradient-to-br from-indigo-600/20 to-blue-600/20 backdrop-blur-xl border border-white/10 hover:from-indigo-600/30 hover:to-blue-600/30 transition-all duration-300">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        {getCategoryIcon(project.category)}
                        <div>
                          <CardTitle className="text-xl text-gray-300">{project.title}</CardTitle>
                          <CardDescription className="flex items-center gap-2 text-gray-400">
                            <span>{project.client}</span>
                            <Badge className={getDifficultyColor(project.difficulty)}>
                              {project.difficulty}
                            </Badge>
                          </CardDescription>
                        </div>
                      </div>
                      <Badge variant={project.status === 'Open' ? 'default' : 'secondary'}>
                        {project.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{project.description}</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">{project.budget}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">{project.duration}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-purple-600" />
                        <span className="text-sm">{project.applicants} applicants</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-orange-600" />
                        <span className="text-sm">{project.category}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.skills.map((skill, index) => (
                        <Badge key={index} variant="outline">
                          {skill}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex justify-end">
                      <Button disabled={project.status !== 'Open'}>
                        {project.status === 'Open' ? 'Apply Now' : 'Not Available'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="portfolio" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">My Portfolio</h2>
            <Dialog open={isCreatePortfolioOpen} onOpenChange={setIsCreatePortfolioOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Project
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add Portfolio Project</DialogTitle>
                  <DialogDescription>
                    Showcase your work and build your professional portfolio
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Project Title *</label>
                    <Input
                      value={portfolioForm.title}
                      onChange={(e) => setPortfolioForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g. E-commerce Website"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Description *</label>
                    <Textarea
                      value={portfolioForm.description}
                      onChange={(e) => setPortfolioForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe the project, your role, and technologies used..."
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium">GitHub URL</label>
                      <Input
                        value={portfolioForm.githubUrl}
                        onChange={(e) => setPortfolioForm(prev => ({ ...prev, githubUrl: e.target.value }))}
                        placeholder="https://github.com/..."
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Live Demo</label>
                      <Input
                        value={portfolioForm.liveUrl}
                        onChange={(e) => setPortfolioForm(prev => ({ ...prev, liveUrl: e.target.value }))}
                        placeholder="https://..."
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Demo Video</label>
                      <Input
                        value={portfolioForm.demoUrl}
                        onChange={(e) => setPortfolioForm(prev => ({ ...prev, demoUrl: e.target.value }))}
                        placeholder="https://..."
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setIsCreatePortfolioOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreatePortfolio} disabled={loading}>
                      {loading ? 'Creating...' : 'Add Project'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {portfolios.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No portfolio projects yet</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Start building your portfolio by adding your completed projects
                </p>
                <Button onClick={() => setIsCreatePortfolioOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Project
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {portfolios.map((portfolio) => (
                <Card key={portfolio.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{portfolio.title}</CardTitle>
                        <CardDescription>
                          Added {new Date(portfolio.created_at).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <Badge variant={portfolio.status === 'Published' ? 'default' : 'secondary'}>
                        {portfolio.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{portfolio.description}</p>

                    {portfolio.links && (
                      <div className="flex gap-2">
                        {portfolio.links.github && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={portfolio.links.github} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4 mr-2" />
                              GitHub
                            </a>
                          </Button>
                        )}
                        {portfolio.links.live && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={portfolio.links.live} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Live Demo
                            </a>
                          </Button>
                        )}
                        {portfolio.links.demo && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={portfolio.links.demo} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4 mr-2" />
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

        <TabsContent value="applications" className="space-y-6">
          <h2 className="text-2xl font-semibold">My Applications</h2>

          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No applications yet</h3>
              <p className="text-muted-foreground text-center">
                Your project applications will appear here once you start applying to LiveWorks projects
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <Footer />
    </div>
  );
}