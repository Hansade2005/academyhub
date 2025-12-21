'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { createJobPosting, getJobPostings, getUserApplications } from '@/lib/database-tools';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Plus, Briefcase, Users, Eye, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';


interface JobPosting {
  id: string;
  employer_id: string;
  title: string;
  description: string;
  requirements: any;
  location?: string;
  salary_range?: string;
  employment_type?: string;
  created_at: string;
  status: string;
}

interface Application {
  id: string;
  user_id: string;
  job_id: string;
  applied_at: string;
  status: string;
}

export default function EmployerDashboard() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Form state
  const [jobForm, setJobForm] = useState({
    title: '',
    description: '',
    location: '',
    salary_range: '',
    employment_type: 'Full-time',
    requirements: {
      experience: '',
      education: '',
      skills: [] as string[]
    }
  });

  useEffect(() => {
    if (user) {
      loadEmployerData();
    }
  }, [user]);

  const loadEmployerData = async () => {
    try {
      // Load jobs posted by this employer
      const employerJobs = await getJobPostings();
      const filteredJobs = (employerJobs as any)?.data?.filter((job: JobPosting) => job.employer_id === user?.id) || [];
      setJobs(filteredJobs);

      // Load all applications (in a real app, you'd filter by employer's jobs)
      // For now, we'll show a sample
      setApplications([]);
    } catch (error) {
      console.error('Error loading employer data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJob = async () => {
    if (!user) {
      toast.error('Please log in to post jobs');
      return;
    }

    if (!jobForm.title || !jobForm.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    setPosting(true);
    try {
      await createJobPosting(
        user.id,
        jobForm.title,
        jobForm.description,
        {
          ...jobForm.requirements,
          location: jobForm.location,
          salary_range: jobForm.salary_range,
          employment_type: jobForm.employment_type
        }
      );

      toast.success('Job posted successfully!');
      setIsCreateDialogOpen(false);
      setJobForm({
        title: '',
        description: '',
        location: '',
        salary_range: '',
        employment_type: 'Full-time',
        requirements: {
          experience: '',
          education: '',
          skills: []
        }
      });
      loadEmployerData();
    } catch (error) {
      console.error('Error creating job:', error);
      toast.error('Failed to post job');
    } finally {
      setPosting(false);
    }
  };

  const addSkill = (skill: string) => {
    if (skill && !jobForm.requirements.skills.includes(skill)) {
      setJobForm(prev => ({
        ...prev,
        requirements: {
          ...prev.requirements,
          skills: [...prev.requirements.skills, skill]
        }
      }));
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setJobForm(prev => ({
      ...prev,
      requirements: {
        ...prev.requirements,
        skills: prev.requirements.skills.filter(skill => skill !== skillToRemove)
      }
    }));
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Employer Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your job postings and review applications
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jobs.filter(job => job.status === 'active').length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{applications.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="jobs" className="space-y-6">
        <TabsList>
          <TabsTrigger value="jobs">My Job Postings</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Job Postings</h2>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Post New Job
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Post New Job</DialogTitle>
                  <DialogDescription>
                    Create a new job posting to attract qualified candidates
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Job Title *</Label>
                    <Input
                      id="title"
                      value={jobForm.title}
                      onChange={(e) => setJobForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g. Senior Software Engineer"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Job Description *</Label>
                    <Textarea
                      id="description"
                      value={jobForm.description}
                      onChange={(e) => setJobForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe the role, responsibilities, and what you're looking for..."
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={jobForm.location}
                        onChange={(e) => setJobForm(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="e.g. New York, NY or Remote"
                      />
                    </div>
                    <div>
                      <Label htmlFor="salary">Salary Range</Label>
                      <Input
                        id="salary"
                        value={jobForm.salary_range}
                        onChange={(e) => setJobForm(prev => ({ ...prev, salary_range: e.target.value }))}
                        placeholder="e.g. $80,000 - $120,000"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="employment_type">Employment Type</Label>
                    <select
                      id="employment_type"
                      value={jobForm.employment_type}
                      onChange={(e) => setJobForm(prev => ({ ...prev, employment_type: e.target.value }))}
                      className="w-full p-2 border border-input bg-background rounded-md"
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Freelance">Freelance</option>
                    </select>
                  </div>

                  <div>
                    <Label>Requirements</Label>
                    <div className="space-y-2">
                      <Input
                        placeholder="Experience level (e.g. 3+ years)"
                        value={jobForm.requirements.experience}
                        onChange={(e) => setJobForm(prev => ({
                          ...prev,
                          requirements: { ...prev.requirements, experience: e.target.value }
                        }))}
                      />
                      <Input
                        placeholder="Education requirements"
                        value={jobForm.requirements.education}
                        onChange={(e) => setJobForm(prev => ({
                          ...prev,
                          requirements: { ...prev.requirements, education: e.target.value }
                        }))}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Skills</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {jobForm.requirements.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeSkill(skill)}>
                          {skill} ×
                        </Badge>
                      ))}
                    </div>
                    <Input
                      placeholder="Add a skill (press Enter)"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const skill = e.currentTarget.value.trim();
                          if (skill) {
                            addSkill(skill);
                            e.currentTarget.value = '';
                          }
                        }
                      }}
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateJob} disabled={posting}>
                      {posting ? 'Posting...' : 'Post Job'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {jobs.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No job postings yet</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Create your first job posting to start attracting qualified candidates
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Post Your First Job
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {jobs.map((job) => (
                <Card key={job.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{job.title}</CardTitle>
                        <CardDescription>
                          Posted {new Date(job.created_at).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <Badge variant={job.status === 'active' ? 'default' : 'secondary'}>
                        {job.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{job.description}</p>
                    <div className="flex justify-between items-center">
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        {job.location && <span>📍 {job.location}</span>}
                        {job.employment_type && <span>💼 {job.employment_type}</span>}
                        {job.salary_range && <span>💰 {job.salary_range}</span>}
                      </div>
                      <Button variant="outline" size="sm">
                        View Applications
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="applications" className="space-y-6">
          <h2 className="text-2xl font-semibold">Applications</h2>

          {applications.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No applications yet</h3>
                <p className="text-muted-foreground text-center">
                  Applications will appear here once candidates apply to your jobs
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {/* Application cards would go here */}
            </div>
          )}
        </TabsContent>
      </Tabs>
      <Footer />
    </div>
  );
}