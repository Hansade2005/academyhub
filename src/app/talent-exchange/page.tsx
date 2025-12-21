'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { getJobPostings, applyToJob, getUserSkillPassports, getUserProgress, getUserSimulations, calculateConfidenceScore } from '@/lib/database-tools';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Search, MapPin, Clock, DollarSign, Users, Briefcase, Star, TrendingUp } from 'lucide-react';
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
  matchScore?: number;
  matchReasons?: string[];
}

interface UserProfile {
  skills: string[];
  confidenceScore: number;
  experience: string[];
  completedSimulations: number;
}

export default function TalentExchangePage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [applying, setApplying] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [sortBy, setSortBy] = useState<'relevance' | 'date' | 'salary'>('relevance');

  useEffect(() => {
    if (user) {
      loadUserProfile();
      loadJobs();
    }
  }, [user]);

  useEffect(() => {
    filterAndSortJobs();
  }, [jobs, searchTerm, sortBy]);

  const loadUserProfile = async () => {
    try {
      const [passports, progress, simulations] = await Promise.all([
        getUserSkillPassports(user!.id),
        getUserProgress(user!.id),
        getUserSimulations(user!.id)
      ]);

      const confidenceScore = await calculateConfidenceScore(user!.id);

      // Extract skills from passports and progress
      const skills = new Set<string>();
      passports.data?.forEach((passport: any) => {
        if (passport.content?.skills) {
          passport.content.skills.forEach((skill: string) => skills.add(skill));
        }
      });
      progress.data?.forEach((entry: any) => {
        skills.add(entry.skill);
      });

      setUserProfile({
        skills: Array.from(skills),
        confidenceScore,
        experience: progress.data?.map((entry: any) => entry.skill) || [],
        completedSimulations: simulations.data?.length || 0
      });
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const calculateJobMatches = (jobs: JobPosting[], profile: UserProfile): JobPosting[] => {
    return jobs.map(job => {
      let score = 0;
      const reasons: string[] = [];

      // Skills matching (40% weight)
      const jobSkills = job.requirements?.skills || [];
      const userSkills = profile.skills;
      const skillMatches = jobSkills.filter((skill: string) =>
        userSkills.some(userSkill => userSkill.toLowerCase().includes(skill.toLowerCase()) ||
                                   skill.toLowerCase().includes(userSkill.toLowerCase()))
      );

      if (skillMatches.length > 0) {
        score += (skillMatches.length / jobSkills.length) * 40;
        reasons.push(`${skillMatches.length}/${jobSkills.length} skills match`);
      }

      // Confidence score bonus (20% weight)
      if (profile.confidenceScore >= 80) {
        score += 20;
        reasons.push('High confidence score');
      } else if (profile.confidenceScore >= 60) {
        score += 10;
        reasons.push('Good confidence score');
      }

      // Experience matching (20% weight)
      const experienceMatches = profile.experience.length;
      if (experienceMatches >= 5) {
        score += 20;
        reasons.push('Extensive experience');
      } else if (experienceMatches >= 3) {
        score += 10;
        reasons.push('Good experience');
      }

      // Simulation completion (20% weight)
      if (profile.completedSimulations >= 5) {
        score += 20;
        reasons.push('Completed assessments');
      } else if (profile.completedSimulations >= 3) {
        score += 10;
        reasons.push('Some assessments completed');
      }

      return {
        ...job,
        matchScore: Math.min(100, Math.round(score)),
        matchReasons: reasons
      };
    });
  };

  const loadJobs = async () => {
    try {
      const jobData = await getJobPostings({ status: 'active' });
      const jobsList = (jobData as any)?.data || [];

      if (userProfile) {
        const matchedJobs = calculateJobMatches(jobsList, userProfile);
        setJobs(matchedJobs);
      } else {
        setJobs(jobsList);
      }
    } catch (error) {
      console.error('Error loading jobs:', error);
      toast.error('Failed to load job listings');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortJobs = () => {
    if (!jobs.length) return;

    let filtered = jobs;

    // Apply search filter
    if (searchTerm) {
      filtered = jobs.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (job.requirements?.skills && job.requirements.skills.some((skill: string) =>
          skill.toLowerCase().includes(searchTerm.toLowerCase())
        ))
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'relevance':
          return (b.matchScore || 0) - (a.matchScore || 0);
        case 'date':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'salary':
          // Simple salary comparison (this could be enhanced)
          return 0;
        default:
          return 0;
      }
    });

    setFilteredJobs(filtered);
  };

  const handleApply = async (jobId: string) => {
    if (!user) {
      toast.error('Please log in to apply for jobs');
      return;
    }

    setApplying(true);
    try {
      await applyToJob(user.id, jobId);
      toast.success('Application submitted successfully!');
      setSelectedJob(null);
    } catch (error) {
      console.error('Error applying to job:', error);
      toast.error('Failed to submit application');
    } finally {
      setApplying(false);
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Talent Exchange</h1>
        <p className="text-muted-foreground">
          Discover opportunities that match your verified skills and experience
        </p>
      </div>

      {/* Search and Filter Bar */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search jobs, skills, or companies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="relevance">Best Match</SelectItem>
            <SelectItem value="date">Most Recent</SelectItem>
            <SelectItem value="salary">Salary</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Job Listings */}
      <div className="grid gap-6">
        {filteredJobs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
              <p className="text-muted-foreground text-center">
                {searchTerm ? 'Try adjusting your search terms' : 'Check back later for new opportunities'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredJobs.map((job) => (
            <Card key={job.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl mb-2">{job.title}</CardTitle>
                    <CardDescription className="flex items-center gap-4 text-sm">
                      {job.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {job.location}
                        </span>
                      )}
                      {job.employment_type && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {job.employment_type}
                        </span>
                      )}
                      {job.salary_range && (
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          {job.salary_range}
                        </span>
                      )}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    {job.matchScore !== undefined && (
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="font-semibold">{job.matchScore}%</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          Match
                        </Badge>
                      </div>
                    )}
                    <Badge variant="secondary">
                      {new Date(job.created_at).toLocaleDateString()}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4 line-clamp-3">
                  {job.description}
                </p>

                {job.matchReasons && job.matchReasons.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-green-700 mb-2">Why this matches you:</p>
                    <div className="flex flex-wrap gap-2">
                      {job.matchReasons.map((reason, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {reason}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {job.requirements?.skills && (
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">Required Skills:</h4>
                    <div className="flex flex-wrap gap-2">
                      {job.requirements.skills.map((skill: string, index: number) => (
                        <Badge key={index} variant="outline">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>Employer ID: {job.employer_id}</span>
                  </div>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button onClick={() => setSelectedJob(job)}>
                        View Details & Apply
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>{job.title}</DialogTitle>
                        <DialogDescription>
                          Review the job details and submit your application
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">Job Description</h4>
                          <p className="text-muted-foreground">{job.description}</p>
                        </div>

                        {job.requirements && (
                          <div>
                            <h4 className="font-semibold mb-2">Requirements</h4>
                            <div className="space-y-2">
                              {job.requirements.experience && (
                                <p><strong>Experience:</strong> {job.requirements.experience}</p>
                              )}
                              {job.requirements.education && (
                                <p><strong>Education:</strong> {job.requirements.education}</p>
                              )}
                              {job.requirements.skills && (
                                <div>
                                  <strong>Skills:</strong>
                                  <div className="flex flex-wrap gap-2 mt-1">
                                    {job.requirements.skills.map((skill: string, index: number) => (
                                      <Badge key={index} variant="outline">
                                        {skill}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="flex justify-end gap-2 pt-4">
                          <Button variant="outline" onClick={() => setSelectedJob(null)}>
                            Cancel
                          </Button>
                          <Button
                            onClick={() => handleApply(job.id)}
                            disabled={applying}
                          >
                            {applying ? 'Applying...' : 'Apply Now'}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
      <Footer />
    </div>
  );
}