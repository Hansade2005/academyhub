'use client';

import { useAuth } from '@/lib/auth-context';
import { useEffect, useState } from 'react';
import { getUserSimulations, createSimulation, getUserSkillPassports } from '@/lib/database-tools';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Code,
  MessageSquare,
  Users,
  Lightbulb,
  Target,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  Zap,
  ChevronRight,
  RotateCcw
} from 'lucide-react';

interface Simulation {
  id: string;
  simulation_type: string;
  score: number;
  completed_at: string;
  results: any;
}

interface Question {
  id: string;
  type: 'multiple-choice' | 'scenario' | 'coding' | 'essay' | 'rating';
  question: string;
  options?: string[];
  correctAnswer?: string | number;
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
}

interface AssessmentState {
  currentQuestion: number;
  answers: Record<string, any>;
  startTime: Date;
  timeSpent: number;
  score: number;
  completed: boolean;
}

const SIMULATION_TYPES = [
  {
    id: 'technical-coding',
    title: 'Technical Coding Assessment',
    description: 'Test your programming skills with real coding challenges',
    duration: '25-35 minutes',
    difficulty: 'Advanced',
    color: 'bg-blue-500',
    icon: Code,
    questions: 8,
    categories: ['JavaScript', 'Problem Solving', 'Algorithms']
  },
  {
    id: 'communication-skills',
    title: 'Communication & Writing',
    description: 'Evaluate your written communication and professional writing skills',
    duration: '15-20 minutes',
    difficulty: 'Intermediate',
    color: 'bg-green-500',
    icon: MessageSquare,
    questions: 6,
    categories: ['Business Writing', 'Email Communication', 'Presentation Skills']
  },
  {
    id: 'leadership-scenarios',
    title: 'Leadership Scenarios',
    description: 'Navigate complex team and leadership situations',
    duration: '20-30 minutes',
    difficulty: 'Advanced',
    color: 'bg-purple-500',
    icon: Users,
    questions: 7,
    categories: ['Team Management', 'Conflict Resolution', 'Decision Making']
  },
  {
    id: 'problem-solving',
    title: 'Analytical Problem Solving',
    description: 'Solve complex business and technical problems',
    duration: '18-25 minutes',
    difficulty: 'Intermediate',
    color: 'bg-orange-500',
    icon: Lightbulb,
    questions: 6,
    categories: ['Data Analysis', 'Logical Reasoning', 'Strategic Thinking']
  },
  {
    id: 'adaptability-learning',
    title: 'Adaptability & Learning',
    description: 'Demonstrate your ability to learn and adapt to new situations',
    duration: '12-18 minutes',
    difficulty: 'Beginner',
    color: 'bg-teal-500',
    icon: Zap,
    questions: 5,
    categories: ['Learning Agility', 'Change Management', 'Growth Mindset']
  },
  {
    id: 'project-management',
    title: 'Project Management',
    description: 'Test your project planning and execution abilities',
    duration: '22-28 minutes',
    difficulty: 'Intermediate',
    color: 'bg-indigo-500',
    icon: Target,
    questions: 7,
    categories: ['Planning', 'Risk Management', 'Resource Allocation']
  }
];

// AI-Generated Questions Database (simplified for demo)
const QUESTIONS_BANK: Record<string, Question[]> = {
  'technical-coding': [
    {
      id: 'tc-1',
      type: 'coding',
      question: 'Write a JavaScript function that reverses a string without using built-in reverse methods.',
      difficulty: 'medium',
      category: 'JavaScript'
    },
    {
      id: 'tc-2',
      type: 'multiple-choice',
      question: 'What is the time complexity of a binary search algorithm?',
      options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
      correctAnswer: 1,
      explanation: 'Binary search divides the search space in half each time, resulting in O(log n) time complexity.',
      difficulty: 'easy',
      category: 'Algorithms'
    },
    {
      id: 'tc-3',
      type: 'scenario',
      question: 'You\'re debugging a React component that\'s not re-rendering when props change. What\'s the most likely cause?',
      options: [
        'The component is using class-based syntax',
        'Props are being mutated directly',
        'The component is wrapped in React.memo unnecessarily',
        'The parent component is not using useState correctly'
      ],
      correctAnswer: 1,
      explanation: 'Directly mutating props breaks React\'s change detection. Always treat props as immutable.',
      difficulty: 'medium',
      category: 'Problem Solving'
    }
  ],
  'communication-skills': [
    {
      id: 'cs-1',
      type: 'essay',
      question: 'Write a professional email response to a client who is unhappy with a delayed project delivery. Explain the situation, apologize, and propose a solution.',
      difficulty: 'medium',
      category: 'Business Writing'
    },
    {
      id: 'cs-2',
      type: 'multiple-choice',
      question: 'Which of the following is the most effective opening for a presentation?',
      options: [
        'Today I\'m going to talk about something really important',
        'Let me show you some data that will blow your mind',
        'Based on our quarterly results, we\'ve identified key opportunities for growth',
        'I prepared 50 slides for this presentation'
      ],
      correctAnswer: 2,
      explanation: 'Effective presentation openings are specific, data-driven, and immediately establish credibility and relevance.',
      difficulty: 'easy',
      category: 'Presentation Skills'
    }
  ],
  'leadership-scenarios': [
    {
      id: 'ls-1',
      type: 'scenario',
      question: 'Your team member has been consistently missing deadlines. You\'ve noticed they seem overwhelmed. What\'s your first step?',
      options: [
        'Immediately escalate to HR for disciplinary action',
        'Have a private conversation to understand their challenges',
        'Reassign their work to other team members',
        'Document the issues and wait for performance review'
      ],
      correctAnswer: 1,
      explanation: 'Leadership involves understanding root causes before taking action. A supportive conversation often reveals underlying issues.',
      difficulty: 'medium',
      category: 'Team Management'
    },
    {
      id: 'ls-2',
      type: 'rating',
      question: 'Rate your confidence in handling team conflicts on a scale of 1-5 (1=Not confident, 5=Very confident)',
      difficulty: 'easy',
      category: 'Conflict Resolution'
    }
  ]
};

export default function SimulationsPage() {
  const { user } = useAuth();
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSimulation, setSelectedSimulation] = useState<string | null>(null);
  const [assessmentState, setAssessmentState] = useState<AssessmentState | null>(null);
  const [currentQuestions, setCurrentQuestions] = useState<Question[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [assessmentResults, setAssessmentResults] = useState<any>(null);

  useEffect(() => {
    if (user) {
      loadSimulations();
    }
  }, [user]);

  const loadSimulations = async () => {
    try {
      const response = await getUserSimulations(user!.id);
      if (response.success) {
        setSimulations(response.data);
      }
    } catch (error) {
      console.error('Failed to load simulations:', error);
    } finally {
      setLoading(false);
    }
  };

// AI service functions using the same a0.dev LLM API
const callLLM = async (messages: any[]): Promise<string> => {
  try {
    const response = await fetch('https://api.a0.dev/ai/llm', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages }),
    });

    if (!response.ok) {
      throw new Error(`LLM API call failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return result.completion || result.message || '';
  } catch (error) {
    console.error('LLM API call failed:', error);
    throw error;
  }
};

const generateAIQuestions = async (simulationType: string): Promise<Question[]> => {
  try {
    const simType = SIMULATION_TYPES.find(s => s.id === simulationType);
    if (!simType) throw new Error('Invalid simulation type');

    const prompt = `Generate ${simType.questions} assessment questions for a "${simType.title}" evaluation.

Requirements:
- Create ${simType.questions} questions total
- Mix question types: multiple-choice, scenario-based, essay, coding challenges, and rating questions
- Questions should be appropriate for ${simType.difficulty} level
- Focus on these categories: ${simType.categories.join(', ')}
- Each question should have realistic difficulty and practical application

Return a JSON array in this exact format:
[
  {
    "id": "unique-id-1",
    "type": "multiple-choice|scenario|essay|coding|rating",
    "question": "The question text",
    "options": ["Option A", "Option B", "Option C", "Option D"], // only for multiple-choice and scenario
    "correctAnswer": 0, // index for multiple-choice/scenario, or null for others
    "explanation": "Brief explanation of the correct answer", // only for multiple-choice/scenario
    "difficulty": "easy|medium|hard",
    "category": "One of the categories listed above"
  }
]

Guidelines:
- Multiple-choice: 4 options, one correct answer, include explanation
- Scenario: Similar to multiple-choice but with situational context
- Essay: Open-ended questions requiring detailed responses
- Coding: Practical programming challenges
- Rating: Self-assessment questions (1-5 scale)
- Ensure questions are professional and relevant to the assessment type
- Balance difficulty levels across questions

Return ONLY the JSON array with no additional text.`;

    const messages = [
      {
        role: "system",
        content: "You are an expert assessment designer who creates high-quality, professional skill evaluation questions. Generate realistic, practical questions that accurately test the specified competencies at the appropriate difficulty level."
      },
      {
        role: "user",
        content: prompt
      }
    ];

    const completion = await callLLM(messages);

    try {
      const questions = JSON.parse(completion);
      return questions.map((q: any, index: number) => ({
        ...q,
        id: q.id || `${simulationType}-q${index + 1}`
      }));
    } catch (parseError) {
      console.error('Failed to parse AI-generated questions:', completion);
      // Fallback to basic questions if AI fails
      return QUESTIONS_BANK[simulationType] || [];
    }
  } catch (error) {
    console.error('Failed to generate AI questions:', error);
    // Fallback to predefined questions
    return QUESTIONS_BANK[simulationType] || [];
  }
};

  const startAssessment = async (simulationType: string) => {
    const questions = await generateAIQuestions(simulationType);

    setCurrentQuestions(questions);
    setSelectedSimulation(simulationType);
    setAssessmentState({
      currentQuestion: 0,
      answers: {},
      startTime: new Date(),
      timeSpent: 0,
      score: 0,
      completed: false
    });
    setShowResults(false);
  };

  const answerQuestion = (questionId: string, answer: any) => {
    if (!assessmentState) return;

    const newAnswers = { ...assessmentState.answers, [questionId]: answer };
    setAssessmentState({
      ...assessmentState,
      answers: newAnswers
    });
  };

  const nextQuestion = () => {
    if (!assessmentState || !currentQuestions.length) return;

    if (assessmentState.currentQuestion < currentQuestions.length - 1) {
      setAssessmentState({
        ...assessmentState,
        currentQuestion: assessmentState.currentQuestion + 1
      });
    } else {
      completeAssessment();
    }
  };

  const previousQuestion = () => {
    if (!assessmentState) return;

    if (assessmentState.currentQuestion > 0) {
      setAssessmentState({
        ...assessmentState,
        currentQuestion: assessmentState.currentQuestion - 1
      });
    }
  };

  const calculateScore = (answers: Record<string, any>, questions: Question[]): number => {
    let correct = 0;
    let total = 0;

    questions.forEach(question => {
      const answer = answers[question.id];
      if (question.type === 'multiple-choice' || question.type === 'scenario') {
        total += 1;
        if (answer === question.correctAnswer) correct += 1;
      } else if (question.type === 'rating') {
        total += 1;
        // Rating questions are subjective, give points based on response
        correct += (answer || 1) / 5; // Normalize to 0-1
      } else if (question.type === 'essay' || question.type === 'coding') {
        total += 1;
        // For essay/coding, assume completion gives partial credit
        correct += answer && answer.length > 10 ? 0.8 : 0.3;
      }
    });

    return total > 0 ? Math.round((correct / total) * 100) : 0;
  };

  const generateFeedback = async (score: number, answers: Record<string, any>, questions: Question[], simulationType: string) => {
    try {
      const simType = SIMULATION_TYPES.find(s => s.id === simulationType);
      const questionDetails = questions.map((q, index) => ({
        number: index + 1,
        type: q.type,
        question: q.question,
        answer: answers[q.id],
        correctAnswer: q.correctAnswer,
        category: q.category
      }));

      const prompt = `Analyze this assessment performance and provide detailed, personalized feedback.

Assessment Type: ${simType?.title}
Overall Score: ${score}%
Questions Answered: ${questions.length}

Question Details:
${JSON.stringify(questionDetails, null, 2)}

Provide a comprehensive analysis in the following JSON format:
{
  "overallScore": ${score},
  "performanceLevel": "Excellent/Good/Satisfactory/Needs Improvement",
  "strengths": ["3-5 specific strengths based on performance"],
  "improvements": ["3-5 areas for improvement with actionable advice"],
  "detailedFeedback": ["2-3 detailed insights about patterns or specific skills"],
  "recommendations": ["3-5 personalized recommendations for skill development"],
  "timeSpent": 0,
  "categoryAnalysis": {
    "bestPerforming": "name of best category",
    "needsWork": "name of category needing most improvement",
    "balanced": "assessment of overall balance across categories"
  },
  "nextSteps": ["2-3 immediate actionable next steps"],
  "motivationalMessage": "An encouraging message based on their performance"
}

Guidelines:
- Be specific and reference actual questions/answers where relevant
- Provide constructive, actionable feedback
- Consider the assessment type and difficulty level
- Focus on growth and development opportunities
- Keep recommendations practical and achievable
- Analyze patterns across question categories

Return ONLY the JSON object with no additional text.`;

      const messages = [
        {
          role: "system",
          content: "You are an expert career coach and assessment analyst who provides detailed, personalized feedback on skill assessments. Give constructive, actionable advice that helps individuals improve their professional competencies."
        },
        {
          role: "user",
          content: prompt
        }
      ];

      const completion = await callLLM(messages);

      try {
        const aiFeedback = JSON.parse(completion);
        return {
          ...aiFeedback,
          timeSpent: assessmentState ? Math.floor((Date.now() - assessmentState.startTime.getTime()) / 1000) : 0
        };
      } catch (parseError) {
        console.error('Failed to parse AI feedback:', completion);
        // Fallback to basic feedback generation
        return generateBasicFeedback(score, answers, questions);
      }
    } catch (error) {
      console.error('Failed to generate AI feedback:', error);
      // Fallback to basic feedback
      return generateBasicFeedback(score, answers, questions);
    }
  };

  const generateBasicFeedback = (score: number, answers: Record<string, any>, questions: Question[]) => {
    const strengths: string[] = [];
    const improvements: string[] = [];
    const detailedFeedback: string[] = [];

    // Analyze performance patterns
    if (score >= 80) {
      strengths.push('Excellent overall performance');
      strengths.push('Strong grasp of core concepts');
    } else if (score >= 60) {
      strengths.push('Good foundational knowledge');
      improvements.push('Focus on advanced concepts');
    } else {
      improvements.push('Consider additional training');
      improvements.push('Practice fundamental concepts');
    }

    // Category-specific feedback
    const categories = Array.from(new Set(questions.map(q => q.category)));
    categories.forEach(category => {
      const categoryQuestions = questions.filter(q => q.category === category);
      const categoryCorrect = categoryQuestions.filter(q => {
        const answer = answers[q.id];
        return (q.type === 'multiple-choice' || q.type === 'scenario') && answer === q.correctAnswer;
      }).length;

      const categoryScore = categoryQuestions.length > 0 ? (categoryCorrect / categoryQuestions.length) * 100 : 0;

      if (categoryScore >= 80) {
        strengths.push(`Strong performance in ${category}`);
      } else if (categoryScore >= 60) {
        detailedFeedback.push(`Good foundation in ${category}, room for improvement`);
      } else {
        improvements.push(`Additional focus needed in ${category}`);
      }
    });

    return {
      overallScore: score,
      performanceLevel: score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : 'Needs Improvement',
      strengths,
      improvements,
      detailedFeedback,
      recommendations: generateRecommendations(score, strengths, improvements),
      timeSpent: assessmentState ? Math.floor((Date.now() - assessmentState.startTime.getTime()) / 1000) : 0,
      categoryAnalysis: {
        bestPerforming: categories[0] || 'General',
        needsWork: categories[categories.length - 1] || 'General',
        balanced: 'Analysis not available'
      },
      nextSteps: ['Continue practicing', 'Seek feedback from peers', 'Take additional courses'],
      motivationalMessage: 'Keep up the great work and continue learning!'
    };
  };

  const generateRecommendations = (score: number, strengths: string[], improvements: string[]) => {
    const recommendations = [];

    if (score < 70) {
      recommendations.push('Consider taking foundational courses in key areas');
      recommendations.push('Practice with similar assessment questions');
    } else if (score < 85) {
      recommendations.push('Focus on advanced topics and real-world applications');
      recommendations.push('Seek mentorship in areas of interest');
    } else {
      recommendations.push('Consider leadership or specialized roles');
      recommendations.push('Mentor others in your areas of expertise');
    }

    if (improvements.some(i => i.includes('communication'))) {
      recommendations.push('Join Toastmasters or presentation skills workshops');
    }

    if (improvements.some(i => i.includes('technical'))) {
      recommendations.push('Complete coding challenges on platforms like LeetCode');
    }

    return recommendations;
  };

  const completeAssessment = async () => {
    if (!assessmentState || !selectedSimulation || !user) return;

    const finalScore = calculateScore(assessmentState.answers, currentQuestions);
    const feedback = await generateFeedback(finalScore, assessmentState.answers, currentQuestions, selectedSimulation);

    const results = {
      ...feedback,
      answers: assessmentState.answers,
      questions: currentQuestions.length,
      completedAt: new Date().toISOString(),
      simulationType: selectedSimulation
    };

    try {
      await createSimulation(user.id, selectedSimulation, results, finalScore);
      await loadSimulations();

      setAssessmentResults(results);
      setShowResults(true);
      setAssessmentState(null);
      setSelectedSimulation(null);
    } catch (error) {
      console.error('Failed to save assessment:', error);
      alert('Failed to save assessment results');
    }
  };

  const resetAssessment = () => {
    setSelectedSimulation(null);
    setAssessmentState(null);
    setCurrentQuestions([]);
    setShowResults(false);
    setAssessmentResults(null);
  };

  const getSimulationStatus = (type: string) => {
    const completedSim = simulations.find(s => s.simulation_type === type);
    return completedSim ? {
      completed: true,
      score: completedSim.score,
      date: completedSim.completed_at,
      results: completedSim.results
    } : null;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Advanced': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const renderQuestion = (question: Question) => {
    const currentAnswer = assessmentState?.answers[question.id];

    switch (question.type) {
      case 'multiple-choice':
      case 'scenario':
        return (
          <div className="space-y-4">
            <p className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              {question.question}
            </p>
            <div className="space-y-3">
              {question.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800">
                  <input
                    type="radio"
                    id={`option-${question.id}-${index}`}
                    name={`question-${question.id}`}
                    value={index.toString()}
                    checked={currentAnswer?.toString() === index.toString()}
                    onChange={(e) => answerQuestion(question.id, parseInt(e.target.value))}
                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <Label htmlFor={`option-${question.id}-${index}`} className="flex-1 cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
            {question.explanation && currentAnswer !== undefined && (
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Explanation:</strong> {question.explanation}
                </p>
              </div>
            )}
          </div>
        );

      case 'essay':
        return (
          <div className="space-y-4">
            <p className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              {question.question}
            </p>
            <Textarea
              value={currentAnswer || ''}
              onChange={(e) => answerQuestion(question.id, e.target.value)}
              placeholder="Write your response here..."
              className="min-h-[200px] resize-none"
            />
            <p className="text-sm text-gray-500">
              {currentAnswer?.length || 0} characters
            </p>
          </div>
        );

      case 'coding':
        return (
          <div className="space-y-4">
            <p className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              {question.question}
            </p>
            <Textarea
              value={currentAnswer || ''}
              onChange={(e) => answerQuestion(question.id, e.target.value)}
              placeholder="Write your code solution here..."
              className="min-h-[300px] font-mono text-sm resize-none"
            />
            <p className="text-sm text-gray-500">
              {currentAnswer?.length || 0} characters
            </p>
          </div>
        );

      case 'rating':
        return (
          <div className="space-y-4">
            <p className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              {question.question}
            </p>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => answerQuestion(question.id, rating)}
                  className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-colors ${
                    currentAnswer === rating
                      ? 'bg-blue-500 border-blue-500 text-white'
                      : 'border-gray-300 hover:border-blue-300 text-gray-600'
                  }`}
                >
                  {rating}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Not confident</span>
              <span>Very confident</span>
            </div>
          </div>
        );

      default:
        return <p>Unsupported question type</p>;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Access Required</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Please log in to access AI-powered assessments</p>
            <Button asChild>
              <a href="/auth/login">Sign In</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your assessment history...</p>
        </div>
      </div>
    );
  }

  if (showResults && assessmentResults) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Assessment Complete! 🎉
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Here's your detailed performance analysis
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Overall Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-6xl font-bold text-blue-600 mb-2">
                    {assessmentResults.overallScore}%
                  </div>
                  <Progress value={assessmentResults.overallScore} className="h-3 mb-4" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {assessmentResults.overallScore >= 90 ? 'Outstanding!' :
                     assessmentResults.overallScore >= 80 ? 'Excellent work!' :
                     assessmentResults.overallScore >= 70 ? 'Good performance!' :
                     assessmentResults.overallScore >= 60 ? 'Solid foundation' :
                     'Room for growth'}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Assessment Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Time Spent</span>
                  <span className="font-medium">{Math.floor(assessmentResults.timeSpent / 60)}m {assessmentResults.timeSpent % 60}s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Questions</span>
                  <span className="font-medium">{assessmentResults.questions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Completed</span>
                  <span className="font-medium">{new Date(assessmentResults.completedAt).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="feedback" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="feedback">AI Feedback</TabsTrigger>
              <TabsTrigger value="strengths">Strengths</TabsTrigger>
              <TabsTrigger value="improvements">Growth Areas</TabsTrigger>
              <TabsTrigger value="analysis">Category Analysis</TabsTrigger>
              <TabsTrigger value="nextsteps">Next Steps</TabsTrigger>
            </TabsList>

            <TabsContent value="feedback">
              <Card>
                <CardHeader>
                  <CardTitle>Personalized Recommendations</CardTitle>
                  <CardDescription>AI-generated suggestions based on your performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {assessmentResults.recommendations.map((rec: string, index: number) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                        <p className="text-blue-800 dark:text-blue-200">{rec}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="strengths">
              <Card>
                <CardHeader>
                  <CardTitle className="text-green-700 dark:text-green-400">Your Strengths</CardTitle>
                  <CardDescription>Areas where you excel</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {assessmentResults.strengths.map((strength: string, index: number) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <Star className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <p className="text-green-800 dark:text-green-200">{strength}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="improvements">
              <Card>
                <CardHeader>
                  <CardTitle className="text-orange-700 dark:text-orange-400">Growth Opportunities</CardTitle>
                  <CardDescription>Areas for focused development</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {assessmentResults.improvements.map((improvement: string, index: number) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                        <Lightbulb className="h-5 w-5 text-orange-500 flex-shrink-0" />
                        <p className="text-orange-800 dark:text-orange-200">{improvement}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analysis">
              <Card>
                <CardHeader>
                  <CardTitle className="text-purple-700 dark:text-purple-400">Category Performance Analysis</CardTitle>
                  <CardDescription>Detailed breakdown by skill category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">Best Performing</h4>
                        <p className="text-green-700 dark:text-green-300">{assessmentResults.categoryAnalysis?.bestPerforming || 'N/A'}</p>
                      </div>
                      <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                        <h4 className="font-semibold text-orange-800 dark:text-orange-200 mb-2">Needs Work</h4>
                        <p className="text-orange-700 dark:text-orange-300">{assessmentResults.categoryAnalysis?.needsWork || 'N/A'}</p>
                      </div>
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Overall Balance</h4>
                        <p className="text-blue-700 dark:text-blue-300">{assessmentResults.categoryAnalysis?.balanced || 'N/A'}</p>
                      </div>
                    </div>
                    {assessmentResults.detailedFeedback && assessmentResults.detailedFeedback.length > 0 && (
                      <div className="mt-6">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Detailed Insights</h4>
                        <div className="space-y-2">
                          {assessmentResults.detailedFeedback.map((feedback: string, index: number) => (
                            <p key={index} className="text-gray-700 dark:text-gray-300 italic">• {feedback}</p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="nextsteps">
              <Card>
                <CardHeader>
                  <CardTitle className="text-indigo-700 dark:text-indigo-400">Immediate Next Steps</CardTitle>
                  <CardDescription>Actionable steps to accelerate your growth</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {assessmentResults.nextSteps && assessmentResults.nextSteps.map((step: string, index: number) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                        <div className="w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                          {index + 1}
                        </div>
                        <p className="text-indigo-800 dark:text-indigo-200">{step}</p>
                      </div>
                    ))}
                    {assessmentResults.motivationalMessage && (
                      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center gap-2 mb-2">
                          <Star className="h-5 w-5 text-yellow-500" />
                          <h4 className="font-semibold text-gray-900 dark:text-white">Motivational Message</h4>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 italic">{assessmentResults.motivationalMessage}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="text-center mt-8">
            <Button onClick={resetAssessment} size="lg">
              <RotateCcw className="h-4 w-4 mr-2" />
              Take Another Assessment
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (selectedSimulation && assessmentState && currentQuestions.length > 0) {
    const currentQuestion = currentQuestions[assessmentState.currentQuestion];
    const progress = ((assessmentState.currentQuestion + 1) / currentQuestions.length) * 100;

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {SIMULATION_TYPES.find(s => s.id === selectedSimulation)?.title}
              </h1>
              <Button variant="outline" onClick={resetAssessment}>
                Exit Assessment
              </Button>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Question {assessmentState.currentQuestion + 1} of {currentQuestions.length}</span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </div>

          {/* Question Card */}
          <Card className="mb-8">
            <CardContent className="p-8">
              {renderQuestion(currentQuestion)}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={previousQuestion}
              disabled={assessmentState.currentQuestion === 0}
            >
              Previous
            </Button>

            <Button
              onClick={nextQuestion}
              disabled={!assessmentState.answers[currentQuestion.id]}
            >
              {assessmentState.currentQuestion === currentQuestions.length - 1 ? 'Complete Assessment' : 'Next'}
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI-Powered Skill Assessments</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Take interactive assessments to validate your skills and get personalized AI feedback
          </p>
        </div>

        {/* Available Assessments */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {SIMULATION_TYPES.map((simulation) => {
            const status = getSimulationStatus(simulation.id);
            const IconComponent = simulation.icon;

            return (
              <motion.div
                key={simulation.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 rounded-lg ${simulation.color} flex items-center justify-center`}>
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                      {status && (
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          Score: {status.score}%
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-xl">{simulation.title}</CardTitle>
                    <CardDescription className="text-base">{simulation.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Duration</p>
                          <p className="font-medium">{simulation.duration}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Questions</p>
                          <p className="font-medium">{simulation.questions}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <Badge className={getDifficultyColor(simulation.difficulty)}>
                          {simulation.difficulty}
                        </Badge>
                        <div className="text-sm text-gray-500">
                          {simulation.categories.join(', ')}
                        </div>
                      </div>

                      {status ? (
                        <div className="space-y-2">
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Last completed: {new Date(status.date).toLocaleDateString()}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => startAssessment(simulation.id)}
                              className="flex-1"
                              variant="outline"
                            >
                              Retake
                            </Button>
                            <Button
                              onClick={() => {
                                setAssessmentResults(status.results);
                                setShowResults(true);
                              }}
                              variant="outline"
                              size="sm"
                            >
                              View Results
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          onClick={() => startAssessment(simulation.id)}
                          className="w-full"
                        >
                          Start Assessment
                          <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Assessment History */}
        {simulations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Assessment History</CardTitle>
              <CardDescription>Your recent assessment performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {simulations.slice(0, 5).map((sim) => {
                  const simType = SIMULATION_TYPES.find(s => s.id === sim.simulation_type);
                  const IconComponent = simType?.icon || Brain;

                  return (
                    <div key={sim.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-lg ${simType?.color || 'bg-gray-500'} flex items-center justify-center`}>
                          <IconComponent className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {simType?.title || sim.simulation_type}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(sim.completed_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-2xl font-bold ${
                          sim.score >= 80 ? 'text-green-600' :
                          sim.score >= 60 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {sim.score}%
                        </p>
                        <p className="text-xs text-gray-500">
                          {sim.score >= 80 ? 'Excellent' :
                           sim.score >= 60 ? 'Good' : 'Needs Improvement'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}