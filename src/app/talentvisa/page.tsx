'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { getUserSkillPassports, getUserProgress, getUserSimulations, calculateConfidenceScore } from '@/lib/database-tools';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { CheckCircle, XCircle, Clock, Award, TrendingUp, Users, Briefcase } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface TalentVisaStatus {
  isEligible: boolean;
  confidenceScore: number;
  requirements: {
    skillPassport: boolean;
    simulations: boolean;
    progressTracking: boolean;
    mentorFeedback: boolean;
  };
  issuedDate?: string;
  expiresDate?: string;
}

export default function TalentVisaPage() {
  const { user } = useAuth();
  const [visaStatus, setVisaStatus] = useState<TalentVisaStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [issuing, setIssuing] = useState(false);

  useEffect(() => {
    if (user) {
      checkVisaEligibility();
    }
  }, [user]);

  const checkVisaEligibility = async () => {
    try {
      // Get user's data to determine eligibility
      const [passports, progress, simulations] = await Promise.all([
        getUserSkillPassports(user!.id),
        getUserProgress(user!.id),
        getUserSimulations(user!.id)
      ]);

      const confidenceScore = await calculateConfidenceScore(user!.id);

      // Check requirements
      const requirements = {
        skillPassport: passports.data && passports.data.length > 0,
        simulations: simulations.data && simulations.data.length >= 3,
        progressTracking: progress.data && progress.data.length >= 5,
        mentorFeedback: false // TODO: implement mentor feedback check
      };

      const isEligible = Object.values(requirements).every(req => req) && confidenceScore >= 70;

      setVisaStatus({
        isEligible,
        confidenceScore,
        requirements,
        issuedDate: isEligible ? new Date().toISOString() : undefined,
        expiresDate: isEligible ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() : undefined
      });
    } catch (error) {
      console.error('Error checking visa eligibility:', error);
      toast.error('Failed to check eligibility');
    } finally {
      setLoading(false);
    }
  };

  const issueTalentVisa = async () => {
    if (!visaStatus?.isEligible || !user) return;

    setIssuing(true);
    try {
      // In a real implementation, this would create a verifiable credential
      // For now, we'll just update the status
      toast.success('TalentVisa issued successfully!');
      await checkVisaEligibility(); // Refresh status
    } catch (error) {
      console.error('Error issuing visa:', error);
      toast.error('Failed to issue TalentVisa');
    } finally {
      setIssuing(false);
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
        <h1 className="text-3xl font-bold mb-2">TalentVisa Center</h1>
        <p className="text-muted-foreground">
          Your verified credential for job market readiness
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Status Card */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-6 w-6" />
                TalentVisa Status
              </CardTitle>
              <CardDescription>
                A verifiable credential that proves your job market readiness
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Confidence Score */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Confidence Score™</span>
                    <span className="text-2xl font-bold text-primary">
                      {visaStatus?.confidenceScore.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={visaStatus?.confidenceScore || 0} className="h-3" />
                  <p className="text-sm text-muted-foreground mt-1">
                    Based on consistency, trend, and depth of your skill development
                  </p>
                </div>

                {/* Eligibility Status */}
                <div className="flex items-center gap-3 p-4 rounded-lg border">
                  {visaStatus?.isEligible ? (
                    <>
                      <CheckCircle className="h-8 w-8 text-green-500" />
                      <div>
                        <h3 className="font-semibold text-green-700">Eligible for TalentVisa</h3>
                        <p className="text-sm text-muted-foreground">
                          You meet all requirements for job market readiness verification
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <Clock className="h-8 w-8 text-yellow-500" />
                      <div>
                        <h3 className="font-semibold text-yellow-700">Working Towards TalentVisa</h3>
                        <p className="text-sm text-muted-foreground">
                          Complete the requirements below to become eligible
                        </p>
                      </div>
                    </>
                  )}
                </div>

                {/* Issue Button */}
                {visaStatus?.isEligible && !visaStatus.issuedDate && (
                  <Button
                    onClick={issueTalentVisa}
                    disabled={issuing}
                    className="w-full"
                    size="lg"
                  >
                    {issuing ? 'Issuing...' : 'Issue My TalentVisa'}
                  </Button>
                )}

                {/* Issued Status */}
                {visaStatus?.issuedDate && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="h-5 w-5 text-green-600" />
                      <span className="font-semibold text-green-800">TalentVisa Issued</span>
                    </div>
                    <p className="text-sm text-green-700">
                      Issued: {new Date(visaStatus.issuedDate).toLocaleDateString()}
                    </p>
                    {visaStatus.expiresDate && (
                      <p className="text-sm text-green-700">
                        Expires: {new Date(visaStatus.expiresDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Requirements Sidebar */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Requirements</CardTitle>
              <CardDescription>
                Complete these to earn your TalentVisa
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  {visaStatus?.requirements.skillPassport ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <div>
                    <p className="font-medium">Skill Passport</p>
                    <p className="text-sm text-muted-foreground">
                      Generate at least one skill passport
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {visaStatus?.requirements.simulations ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <div>
                    <p className="font-medium">AI Assessments</p>
                    <p className="text-sm text-muted-foreground">
                      Complete 3+ simulation assessments
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {visaStatus?.requirements.progressTracking ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <div>
                    <p className="font-medium">Progress Tracking</p>
                    <p className="text-sm text-muted-foreground">
                      Record 5+ progress entries
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {visaStatus?.requirements.mentorFeedback ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <div>
                    <p className="font-medium">Mentor Feedback</p>
                    <p className="text-sm text-muted-foreground">
                      Receive feedback from mentors
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="/skill-passport">
                    <Award className="h-4 w-4 mr-2" />
                    Create Skill Passport
                  </a>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="/simulations">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Take Assessment
                  </a>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="/talent-exchange">
                    <Briefcase className="h-4 w-4 mr-2" />
                    Browse Jobs
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Benefits Section */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>What is TalentVisa?</CardTitle>
          <CardDescription>
            A verifiable credential that signals your job market readiness to employers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Verified Skills</h3>
              <p className="text-sm text-muted-foreground">
                AI-verified proof of your capabilities through assessments and projects
              </p>
            </div>
            <div className="text-center">
              <TrendingUp className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Confidence Score™</h3>
              <p className="text-sm text-muted-foreground">
                Quantified measure of your skill development consistency and growth
              </p>
            </div>
            <div className="text-center">
              <Users className="h-12 w-12 text-purple-500 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Employer Trust</h3>
              <p className="text-sm text-muted-foreground">
                Signals to employers that you're ready for professional opportunities
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Footer />
    </div>
  );
}