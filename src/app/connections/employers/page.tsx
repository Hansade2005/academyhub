'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { getUserApplications } from '@/lib/database-tools';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Users, MessageSquare, Eye, Clock, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface EmployerConnection {
  id: string;
  name: string;
  company: string;
  avatar?: string;
  lastInteraction: string;
  status: 'connected' | 'pending' | 'interested';
  applications: number;
  views: number;
}

interface Application {
  id: string;
  job_id: string;
  applied_at: string;
  status: string;
}

const MOCK_EMPLOYERS: EmployerConnection[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    company: 'TechCorp Inc.',
    avatar: 'https://api.a0.dev/assets/image?text=SJ&aspect=1:1&seed=employer1',
    lastInteraction: '2025-12-15',
    status: 'connected',
    applications: 2,
    views: 5
  },
  {
    id: '2',
    name: 'Michael Chen',
    company: 'StartupXYZ',
    avatar: 'https://api.a0.dev/assets/image?text=MC&aspect=1:1&seed=employer2',
    lastInteraction: '2025-12-10',
    status: 'interested',
    applications: 1,
    views: 3
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    company: 'Global Solutions',
    avatar: 'https://api.a0.dev/assets/image?text=ER&aspect=1:1&seed=employer3',
    lastInteraction: '2025-12-08',
    status: 'pending',
    applications: 0,
    views: 1
  }
];

export default function EmployerConnectionsPage() {
  const { user } = useAuth();
  const [connections, setConnections] = useState<EmployerConnection[]>(MOCK_EMPLOYERS);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadApplications();
    }
  }, [user]);

  const loadApplications = async () => {
    try {
      const apps = await getUserApplications(user!.id);
      setApplications((apps as any).data || []);
    } catch (error) {
      console.error('Error loading applications:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-800';
      case 'interested': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="h-4 w-4" />;
      case 'interested': return <Eye className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
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
        <h1 className="text-3xl font-bold mb-2">Employer Connections</h1>
        <p className="text-muted-foreground">
          Manage your relationships with potential employers
        </p>
      </div>

      <Tabs defaultValue="connections" className="space-y-6">
        <TabsList>
          <TabsTrigger value="connections">My Connections</TabsTrigger>
          <TabsTrigger value="applications">Application History</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="connections" className="space-y-6">
          <div className="grid gap-4">
            {connections.map((employer) => (
              <Card key={employer.id} className="bg-gradient-to-br from-indigo-600/20 to-blue-600/20 backdrop-blur-xl border border-white/10 hover:from-indigo-600/30 hover:to-blue-600/30 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={employer.avatar} alt={employer.name} />
                        <AvatarFallback>
                          {employer.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-lg text-gray-300">{employer.name}</h3>
                        <p className="text-gray-400">{employer.company}</p>
                        <p className="text-sm text-gray-400">
                          Last interaction: {new Date(employer.lastInteraction).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-primary">{employer.applications}</p>
                        <p className="text-sm text-muted-foreground">Applications</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-primary">{employer.views}</p>
                        <p className="text-sm text-muted-foreground">Profile Views</p>
                      </div>

                      <Badge className={getStatusColor(employer.status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(employer.status)}
                          {employer.status.charAt(0).toUpperCase() + employer.status.slice(1)}
                        </div>
                      </Badge>

                      <Button variant="outline" size="sm">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Message
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {connections.length === 0 && (
            <Card className="bg-gradient-to-br from-gray-600/20 to-slate-600/20 backdrop-blur-xl border border-white/10">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-300 mb-2">No employer connections yet</h3>
                <p className="text-gray-400 text-center mb-4">
                  Start applying to jobs to build connections with employers
                </p>
                <Button asChild>
                  <a href="/talent-exchange">Browse Jobs</a>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="applications" className="space-y-6">
          <div className="grid gap-4">
            {applications.length === 0 ? (
              <Card className="bg-gradient-to-br from-gray-600/20 to-slate-600/20 backdrop-blur-xl border border-white/10">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-300 mb-2">No applications yet</h3>
                  <p className="text-gray-400 text-center mb-4">
                    Your job applications will appear here
                  </p>
                  <Button asChild>
                    <a href="/talent-exchange">Find Jobs</a>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              applications.map((application) => (
                <Card key={application.id} className="bg-gradient-to-br from-emerald-600/20 to-teal-600/20 backdrop-blur-xl border border-white/10">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-300">Application #{application.id.slice(0, 8)}</h3>
                        <p className="text-sm text-gray-400">
                          Applied: {new Date(application.applied_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={
                        application.status === 'pending' ? 'secondary' :
                        application.status === 'accepted' ? 'default' : 'destructive'
                      }>
                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Profile Views</CardTitle>
                <CardDescription>Employers who viewed your profile</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">12</div>
                <p className="text-sm text-muted-foreground">+3 from last week</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Applications Sent</CardTitle>
                <CardDescription>Jobs you've applied to</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{applications.length}</div>
                <p className="text-sm text-muted-foreground">This month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Response Rate</CardTitle>
                <CardDescription>Employers who responded</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">25%</div>
                <p className="text-sm text-muted-foreground">Industry average: 15%</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Connection Tips</CardTitle>
              <CardDescription>Improve your employer connections</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Complete Your TalentVisa</p>
                    <p className="text-sm text-muted-foreground">
                      Employers are 3x more likely to respond to verified candidates
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Build Your Confidence Score™</p>
                    <p className="text-sm text-muted-foreground">
                      Higher scores attract more employer interest
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Apply Strategically</p>
                    <p className="text-sm text-muted-foreground">
                      Focus on roles that match your verified skills
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <Footer />
    </div>
  );
}