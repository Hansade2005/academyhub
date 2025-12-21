// PiPilot DB Integration using SDK
import PiPilot from 'pipilot-sdk';

// Define interfaces for our data types
export interface SkillPassport {
  id: string;
  user_id: string;
  title: string;
  content: any;
  confidence_score?: number;
  created_at: string;
  updated_at: string;
}

export interface ProgressEntry {
  id: string;
  user_id: string;
  skill: string;
  level: string;
  score: number;
  date: string;
}

export interface Simulation {
  id: string;
  user_id: string;
  simulation_type: string;
  results: any;
  score: number;
  completed_at: string;
}

export interface MentorFeedback {
  id: string;
  user_id: string;
  mentor_id: string;
  feedback: string;
  rating: number;
  date: string;
}

// Initialize PiPilot client
const pipilot = new PiPilot('sk_live_db3a12d669e420721b56a98ba13924d5815f6e349bbeb44b1725acd252dae5a2', '41', {
  maxRetries: 3,
  retryDelay: 1000
});

// Table IDs (from created tables)
export const TABLE_IDS = {
  users: '180',
  posts: '181',
  comments: '190',
  skill_passports: '225',
  progress_tracking: '226',
  analytics: '227',
  simulations: '228',
  mentor_feedback: '229',
  job_postings: '230',
  applications: '231',
  portfolios: '232',
  credentials: '233',
  files: '234',
  projects: '235',
  user_analytics_profiles: '236'
};

// Generic functions for database operations
export const fetchTableRecords = async (tableId: string) => {
  return await pipilot.fetchTableRecords(tableId);
};

export const insertTableRecord = async (tableId: string, data: any) => {
  return await pipilot.insertTableRecord(tableId, data);
};

export const updateTableRecord = async (tableId: string, recordId: string, data: any) => {
  return await pipilot.updateTableRecord(tableId, recordId, data);
};

export const deleteTableRecord = async (tableId: string, recordId: string) => {
  return await pipilot.deleteTableRecord(tableId, recordId);
};

export const queryTable = async (tableId: string, options: any) => {
  return await pipilot.queryTable(tableId, options);
};

export const listTables = async (options?: any) => {
  return await pipilot.listTables(options);
};

export const readTable = async (tableId: string, options?: any) => {
  return await pipilot.readTable(tableId, options);
};

export const uploadFile = async (file: File, isPublic: boolean = true, metadata?: any) => {
  return await pipilot.uploadFile(file, isPublic, metadata);
};

// Specific functions for The 3rd Academy
export const getUserSkillPassports = async (userId: string) => {
  const response = await queryTable(TABLE_IDS.skill_passports, {
    where: { user_id: userId },
    orderBy: { field: 'created_at', direction: 'DESC' }
  });
  return { ...response, data: response.data as unknown as SkillPassport[] };
};

export const createSkillPassport = async (userId: string, title: string, content: any, confidenceScore?: number) => {
  // If confidence score not provided, calculate it
  if (confidenceScore === undefined) {
    confidenceScore = await calculateConfidenceScore(userId);
  }

  return await insertTableRecord(TABLE_IDS.skill_passports, {
    user_id: userId,
    title,
    content,
    confidence_score: confidenceScore
  });
};
export const getUserProgress = async (userId: string) => {
  const response = await queryTable(TABLE_IDS.progress_tracking, {
    where: { user_id: userId },
    orderBy: { field: 'date', direction: 'DESC' }
  });
  return { ...response, data: response.data as unknown as ProgressEntry[] };
};

export const addProgressEntry = async (userId: string, skill: string, level: string, score: number) => {
  return await insertTableRecord(TABLE_IDS.progress_tracking, {
    user_id: userId,
    skill,
    level,
    score
  });
};

export const logAnalyticsEvent = async (userId: string | null, eventType: string, data: any) => {
  return await insertTableRecord(TABLE_IDS.analytics, {
    user_id: userId,
    event_type: eventType,
    data
  });
};

export const getUserSimulations = async (userId: string) => {
  const response = await queryTable(TABLE_IDS.simulations, {
    where: { user_id: userId },
    orderBy: { field: 'completed_at', direction: 'DESC' }
  });
  return { ...response, data: response.data as unknown as Simulation[] };
};

export const createSimulation = async (userId: string, simulationType: string, results: any, score: number) => {
  return await insertTableRecord(TABLE_IDS.simulations, {
    user_id: userId,
    simulation_type: simulationType,
    results,
    score
  });
};

export const getJobPostings = async (filters?: any) => {
  const options: any = { orderBy: { field: 'created_at', direction: 'DESC' } };
  if (filters) {
    options.whereConditions = [];
    if (filters.status) options.whereConditions.push({ field: 'status', operator: '=', value: filters.status });
  }
  return await queryTable(TABLE_IDS.job_postings, options);
};

export const createJobPosting = async (employerId: string, title: string, description: string, requirements: any) => {
  return await insertTableRecord(TABLE_IDS.job_postings, {
    employer_id: employerId,
    title,
    description,
    requirements
  });
};

export const getUserApplications = async (userId: string) => {
  const response = await queryTable(TABLE_IDS.applications, {
    where: { user_id: userId },
    orderBy: { field: 'applied_at', direction: 'DESC' }
  });
  return { ...response, data: response.data as unknown as any[] };
};

export const applyToJob = async (userId: string, jobId: string) => {
  return await insertTableRecord(TABLE_IDS.applications, {
    user_id: userId,
    job_id: jobId
  });
};

export const getUserPortfolios = async (userId: string) => {
  const response = await queryTable(TABLE_IDS.portfolios, {
    where: { user_id: userId },
    orderBy: { field: 'created_at', direction: 'DESC' }
  });
  return { ...response, data: response.data as unknown as any[] };
};

export const createPortfolio = async (userId: string, title: string, description: string, links?: any) => {
  return await insertTableRecord(TABLE_IDS.portfolios, {
    user_id: userId,
    title,
    description,
    links
  });
};

export const getUserCredentials = async (userId: string) => {
  return await queryTable(TABLE_IDS.credentials, {
    where: { user_id: userId },
    orderBy: { field: 'issued_at', direction: 'DESC' }
  });
};

export const issueCredential = async (userId: string, type: string, data: any, expiresAt?: string) => {
  return await insertTableRecord(TABLE_IDS.credentials, {
    user_id: userId,
    type,
    data,
    expires_at: expiresAt
  });
};

export const getUserFiles = async (userId: string) => {
  return await queryTable(TABLE_IDS.files, {
    where: { user_id: userId },
    orderBy: { field: 'uploaded_at', direction: 'DESC' }
  });
};

export const getUserProjects = async (userId: string) => {
  return await queryTable(TABLE_IDS.projects, {
    where: { user_id: userId },
    orderBy: { field: 'created_at', direction: 'DESC' }
  });
};

export const createProject = async (userId: string, title: string, description: string, contractValue?: number) => {
  return await insertTableRecord(TABLE_IDS.projects, {
    user_id: userId,
    title,
    description,
    contract_value: contractValue
  });
};

// Confidence Score™ calculation functions
export const calculateConfidenceScore = async (userId: string): Promise<number> => {
  try {
    // Get user's progress data
    const progressRes = await getUserProgress(userId);
    const simulationsRes = await getUserSimulations(userId);
    const passportsRes = await getUserSkillPassports(userId);

    if (!progressRes.success || !simulationsRes.success || !passportsRes.success) {
      return 0;
    }

    const progress = progressRes.data;
    const simulations = simulationsRes.data;
    const passports = passportsRes.data;

    // Factor 1: Consistency (how consistent are the scores over time)
    const consistencyScore = calculateConsistencyScore(progress);

    // Factor 2: Trend (is the user improving over time)
    const trendScore = calculateTrendScore(progress);

    // Factor 3: Depth (breadth and depth of skills demonstrated)
    const depthScore = calculateDepthScore(progress, simulations, passports);

    // Factor 4: Volume (amount of activity/proof)
    const volumeScore = calculateVolumeScore(progress, simulations, passports);

    // Weighted average (can be adjusted based on business logic)
    const confidenceScore = (
      consistencyScore * 0.25 +
      trendScore * 0.30 +
      depthScore * 0.25 +
      volumeScore * 0.20
    );

    return Math.round(Math.min(100, Math.max(0, confidenceScore)));
  } catch (error) {
    console.error('Error calculating confidence score:', error);
    return 0;
  }
};

const calculateConsistencyScore = (progress: ProgressEntry[]): number => {
  if (progress.length < 3) return 30; // Need minimum data

  const scores = progress.map(p => p.score);
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
  const variance = scores.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / scores.length;
  const stdDev = Math.sqrt(variance);

  // Lower standard deviation = higher consistency
  const consistency = Math.max(0, 100 - (stdDev * 2));
  return consistency;
};

const calculateTrendScore = (progress: ProgressEntry[]): number => {
  if (progress.length < 3) return 25;

  // Sort by date
  const sortedProgress = progress.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Calculate trend using linear regression
  const n = sortedProgress.length;
  const sumX = sortedProgress.reduce((sum, p, i) => sum + i, 0);
  const sumY = sortedProgress.reduce((sum, p) => sum + p.score, 0);
  const sumXY = sortedProgress.reduce((sum, p, i) => sum + (i * p.score), 0);
  const sumXX = sortedProgress.reduce((sum, p, i) => sum + (i * i), 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);

  // Positive slope = improvement trend
  return Math.min(100, Math.max(0, 50 + slope * 10));
};

const calculateDepthScore = (progress: ProgressEntry[], simulations: Simulation[], passports: SkillPassport[]): number => {
  const uniqueSkills = new Set(progress.map(p => p.skill)).size;
  const simulationTypes = new Set(simulations.map(s => s.simulation_type)).size;
  const passportCount = passports.length;

  // Score based on breadth of skills and assessment types
  let depthScore = 0;
  depthScore += Math.min(40, uniqueSkills * 8); // Max 40 points for skills
  depthScore += Math.min(30, simulationTypes * 15); // Max 30 points for simulation types
  depthScore += Math.min(30, passportCount * 6); // Max 30 points for passports

  return depthScore;
};

const calculateVolumeScore = (progress: ProgressEntry[], simulations: Simulation[], passports: SkillPassport[]): number => {
  const totalActivities = progress.length + simulations.length + passports.length;

  // Score based on volume of proof/activities
  if (totalActivities >= 20) return 100;
  if (totalActivities >= 15) return 80;
  if (totalActivities >= 10) return 60;
  if (totalActivities >= 5) return 40;
  if (totalActivities >= 3) return 20;
  return 10;
};

export const getMentorFeedback = async (userId: string) => {
  const response = await queryTable(TABLE_IDS.mentor_feedback, {
    where: { user_id: userId },
    orderBy: { field: 'date', direction: 'DESC' }
  });
  return { ...response, data: response.data as unknown as MentorFeedback[] };
};

export const addMentorFeedback = async (userId: string, mentorId: string, feedback: string, rating: number) => {
  return await insertTableRecord(TABLE_IDS.mentor_feedback, {
    user_id: userId,
    mentor_id: mentorId,
    feedback,
    rating
  });
};

// User Analytics Profiles functions
export const createUserAnalyticsProfile = async (userId: string, analyticsData: any) => {
  return await insertTableRecord(TABLE_IDS.user_analytics_profiles, {
    user_id: userId,
    demographics: JSON.stringify(analyticsData.demographics),
    professional_background: JSON.stringify(analyticsData.professionalBackground),
    career_goals: JSON.stringify(analyticsData.careerGoals),
    learning_preferences: JSON.stringify(analyticsData.learningPreferences),
    discovery_source: analyticsData.discoverySource,
    marketing_consent: analyticsData.marketingConsent
  });
};

export const getUserAnalyticsProfile = async (userId: string) => {
  const response = await queryTable(TABLE_IDS.user_analytics_profiles, {
    where: { user_id: userId }
  });
  return response;
};

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earned: boolean;
  progress: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

// Achievement calculation functions
export const getUserAchievements = async (userId: string): Promise<Achievement[]> => {
  try {
    // Fetch all relevant data in parallel
    const [
      passportsRes,
      simulationsRes,
      portfoliosRes,
      confidenceScore
    ] = await Promise.all([
      getUserSkillPassports(userId),
      getUserSimulations(userId),
      getUserPortfolios(userId),
      calculateConfidenceScore(userId)
    ]);

    const passports = passportsRes.data || [];
    const simulations = simulationsRes.data || [];
    const portfolios = portfoliosRes.data || [];

    // Calculate achievement data
    const achievements: Achievement[] = [
      {
        id: 'first-steps',
        title: 'First Steps',
        description: 'Complete your first skill assessment',
        icon: '🚀',
        earned: simulations.length > 0 || passports.length > 0,
        progress: simulations.length > 0 || passports.length > 0 ? 100 : 0,
        rarity: 'common'
      },
      {
        id: 'skill-master',
        title: 'Skill Master',
        description: 'Earn 5 skill passports',
        icon: '🎯',
        earned: passports.length >= 5,
        progress: Math.min(100, (passports.length / 5) * 100),
        rarity: 'rare'
      },
      {
        id: 'portfolio-pro',
        title: 'Portfolio Pro',
        description: 'Build a portfolio with 3+ projects',
        icon: '💼',
        earned: portfolios.length >= 3,
        progress: Math.min(100, (portfolios.length / 3) * 100),
        rarity: 'epic'
      },
      {
        id: 'confidence-king',
        title: 'Confidence King',
        description: 'Achieve 90%+ confidence score',
        icon: '👑',
        earned: confidenceScore >= 90,
        progress: confidenceScore,
        rarity: 'legendary'
      }
    ];

    return achievements;
  } catch (error) {
    console.error('Error calculating user achievements:', error);
    // Return default achievements if calculation fails
    return [
      {
        id: 'first-steps',
        title: 'First Steps',
        description: 'Complete your first skill assessment',
        icon: '🚀',
        earned: false,
        progress: 0,
        rarity: 'common'
      },
      {
        id: 'skill-master',
        title: 'Skill Master',
        description: 'Earn 5 skill passports',
        icon: '🎯',
        earned: false,
        progress: 0,
        rarity: 'rare'
      },
      {
        id: 'portfolio-pro',
        title: 'Portfolio Pro',
        description: 'Build a portfolio with 3+ projects',
        icon: '💼',
        earned: false,
        progress: 0,
        rarity: 'epic'
      },
      {
        id: 'confidence-king',
        title: 'Confidence King',
        description: 'Achieve 90%+ confidence score',
        icon: '👑',
        earned: false,
        progress: 0,
        rarity: 'legendary'
      }
    ];
  }
};