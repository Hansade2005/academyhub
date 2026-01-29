'use client';

import { useAuth } from '@/lib/auth-context';
import { useEffect, useState } from 'react';
import { getUserSkillPassports } from '@/lib/supabase-database-tools';
import type { SkillPassport } from '@/lib/supabase-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function PassportsPage() {
  const { user } = useAuth();
  const [passports, setPassports] = useState<SkillPassport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadPassports();
    }
  }, [user]);

  const loadPassports = async () => {
    try {
      const response = await getUserSkillPassports(user!.id);
      if (response.success) {
        setPassports(response.data);
      }
    } catch (error) {
      console.error('Failed to load passports:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div className="flex justify-center items-center min-h-screen">Please log in to view your passports.</div>;
  }

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading your skill passports...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Skill Passports</h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Your collection of verified skill documents
              </p>
            </div>
            <Link href="/skill-passport">
              <Button>Generate New Passport</Button>
            </Link>
          </div>
        </div>

        {passports.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <span className="text-4xl">📄</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No skill passports yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Generate your first skill passport by uploading your CV or resume.
            </p>
            <Link href="/skill-passport">
              <Button>Get Started</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {passports.map((passport) => (
              <Card key={passport.id} className="bg-gradient-to-br from-indigo-600/20 to-blue-600/20 backdrop-blur-xl border border-white/10 hover:from-indigo-600/30 hover:to-blue-600/30 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-300">{passport.title}</CardTitle>
                  <CardDescription className="text-gray-400">
                    Created on {new Date(passport.created_at).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {passport.confidence_score && (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">Confidence Score:</span>
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${passport.confidence_score}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{passport.confidence_score}%</span>
                      </div>
                    )}

                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        View
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        Download
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}