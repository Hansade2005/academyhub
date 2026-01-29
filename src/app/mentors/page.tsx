'use client';

import { useAuth } from '@/lib/auth-context';
import { useEffect, useState } from 'react';
import { getMentorFeedback, addMentorFeedback } from '@/lib/supabase-database-tools';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';


interface Mentor {
  id: string;
  name: string;
  title: string;
  company: string;
  expertise: string[];
  avatar?: string;
  rating: number;
  reviewCount: number;
  bio: string;
}

interface Feedback {
  id: string;
  mentor_id: string;
  feedback: string;
  rating: number;
  date: string;
}

const MOCK_MENTORS: Mentor[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    title: 'Senior Software Engineer',
    company: 'Google',
    expertise: ['React', 'TypeScript', 'System Design', 'Career Development'],
    rating: 4.9,
    reviewCount: 47,
    bio: '10+ years in full-stack development. Passionate about mentoring junior developers and helping with career growth.'
  },
  {
    id: '2',
    name: 'Marcus Johnson',
    title: 'Product Manager',
    company: 'Microsoft',
    expertise: ['Product Strategy', 'Agile', 'User Research', 'Leadership'],
    rating: 4.8,
    reviewCount: 32,
    bio: 'Former startup founder turned PM. Love helping people navigate product careers and build amazing products.'
  },
  {
    id: '3',
    name: 'Dr. Emily Rodriguez',
    title: 'Data Science Lead',
    company: 'Amazon',
    expertise: ['Machine Learning', 'Python', 'Statistics', 'AI Ethics'],
    rating: 4.9,
    reviewCount: 28,
    bio: 'PhD in Computer Science. Specializing in ML and AI. Committed to making AI accessible and ethical.'
  },
  {
    id: '4',
    name: 'David Kim',
    title: 'UX Design Director',
    company: 'Adobe',
    expertise: ['UX Design', 'Design Systems', 'User Research', 'Prototyping'],
    rating: 4.7,
    reviewCount: 41,
    bio: '15 years in design. Led design teams at multiple Fortune 500 companies. Love teaching design thinking.'
  },
  {
    id: '5',
    name: 'Lisa Thompson',
    title: 'DevOps Engineer',
    company: 'Netflix',
    expertise: ['AWS', 'Kubernetes', 'CI/CD', 'Cloud Architecture'],
    rating: 4.8,
    reviewCount: 35,
    bio: 'Cloud infrastructure expert. Helped scale systems serving millions of users. Always excited to share DevOps knowledge.'
  },
  {
    id: '6',
    name: 'James Wilson',
    title: 'Startup Advisor',
    company: 'Independent',
    expertise: ['Entrepreneurship', 'Fundraising', 'Business Strategy', 'Scaling'],
    rating: 4.6,
    reviewCount: 29,
    bio: 'Serial entrepreneur with 3 successful exits. Love mentoring founders and helping build great companies.'
  }
];

export default function MentorsPage() {
  const { user } = useAuth();
  const [mentors] = useState<Mentor[]>(MOCK_MENTORS);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [rating, setRating] = useState(5);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadFeedback();
    }
  }, [user]);

  const loadFeedback = async () => {
    try {
      const feedbackData = await getMentorFeedback(user!.id);
      setFeedback((feedbackData as any).data || []);
    } catch (error) {
      console.error('Failed to load feedback:', error);
      setFeedback([]);
    }
  };

  const submitFeedback = async () => {
    if (!user || !selectedMentor || !feedbackText.trim()) return;

    setLoading(true);
    try {
      await addMentorFeedback(user.id, selectedMentor.id, feedbackText, rating);
      
      // Reload feedback after submission
      await loadFeedback();
      
      setFeedbackText('');
      setRating(5);
      setSelectedMentor(null);
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      alert('Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number, interactive = false, onRate?: (rating: number) => void) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating
            ? 'fill-yellow-400 text-yellow-400'
            : 'text-gray-300'
        } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
        onClick={interactive && onRate ? () => onRate(i + 1) : undefined}
      />
    ));
  };

  if (!user) {
    return <div className="flex justify-center items-center min-h-screen">Please log in to access mentors.</div>;
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Industry Mentors</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Connect with experienced professionals for guidance and feedback
          </p>
        </div>

        {/* Mentors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {mentors.map((mentor) => (
            <Card key={mentor.id} className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 backdrop-blur-xl border border-white/10 hover:from-indigo-600/30 hover:to-purple-600/30 transition-all duration-300">
              <CardHeader>
                <div className="flex items-start space-x-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={mentor.avatar} alt={mentor.name} />
                    <AvatarFallback>
                      {mentor.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-lg text-gray-300">{mentor.name}</CardTitle>
                    <CardDescription className="text-gray-400">
                      {mentor.title} at {mentor.company}
                    </CardDescription>
                    <div className="flex items-center space-x-2 mt-2">
                      <div className="flex items-center">
                        {renderStars(Math.floor(mentor.rating))}
                      </div>
                      <span className="text-sm text-gray-500">
                        {mentor.rating} ({mentor.reviewCount} reviews)
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                    {mentor.bio}
                  </p>

                  <div className="flex flex-wrap gap-1">
                    {mentor.expertise.slice(0, 3).map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {mentor.expertise.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{mentor.expertise.length - 3} more
                      </Badge>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="flex-1">
                          View Profile
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarImage src={mentor.avatar} alt={mentor.name} />
                              <AvatarFallback>
                                {mentor.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div>{mentor.name}</div>
                              <div className="text-sm font-normal text-gray-500">
                                {mentor.title} at {mentor.company}
                              </div>
                            </div>
                          </DialogTitle>
                          <DialogDescription>
                            {mentor.bio}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium mb-2">Expertise</h4>
                            <div className="flex flex-wrap gap-2">
                              {mentor.expertise.map((skill) => (
                                <Badge key={skill} variant="secondary">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm">Rating:</span>
                            <div className="flex items-center">
                              {renderStars(Math.floor(mentor.rating))}
                            </div>
                            <span className="text-sm text-gray-500">
                              {mentor.rating} ({mentor.reviewCount} reviews)
                            </span>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          className="flex-1"
                          onClick={() => setSelectedMentor(mentor)}
                        >
                          Request Feedback
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Request Feedback from {mentor.name}</DialogTitle>
                          <DialogDescription>
                            Share your goals and get personalized advice from {mentor.name}.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium">What would you like feedback on?</label>
                            <Textarea
                              placeholder="Describe your current project, career goals, or specific skills you'd like to develop..."
                              value={feedbackText}
                              onChange={(e) => setFeedbackText(e.target.value)}
                              className="mt-1"
                              rows={4}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Rate your current preparedness (1-5)</label>
                            <div className="flex items-center space-x-2 mt-1">
                              {renderStars(rating, true, setRating)}
                              <span className="text-sm text-gray-500">({rating}/5)</span>
                            </div>
                          </div>
                          <div className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={() => setSelectedMentor(null)}>
                              Cancel
                            </Button>
                            <Button onClick={submitFeedback} disabled={loading || !feedbackText.trim()}>
                              {loading ? 'Sending...' : 'Send Request'}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Feedback */}
        {feedback.length > 0 && (
          <Card className="bg-gradient-to-br from-emerald-600/20 to-teal-600/20 backdrop-blur-xl border border-white/10">
            <CardHeader>
              <CardTitle className="text-gray-300">Recent Feedback</CardTitle>
              <CardDescription className="text-gray-400">Advice and guidance from your mentors</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {feedback.map((item) => (
                  <div key={item.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">Mentor Feedback</span>
                        <div className="flex items-center">
                          {renderStars(item.rating)}
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(item.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">{item.feedback}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      <Footer />
    </div>
  );
}