// Supabase Database Integration
import { supabase, handleSupabaseError, formatSupabaseResponse } from './supabase-client'
import type {
  SkillPassport,
  ProgressEntry,
  Simulation,
  MentorFeedback,
  JobPosting,
  Application,
  Portfolio,
  Credential,
  FileRecord,
  Project,
  UserAnalyticsProfile,
  AnalyticsEvent
} from './supabase-client'

// Generic functions for database operations
export const fetchTableRecords = async (tableName: string, queryParams?: any) => {
  let query = supabase.from(tableName).select('*')

  // Apply query parameters if provided
  if (queryParams) {
    // Handle filters
    if (queryParams.filters) {
      for (const [field, value] of Object.entries(queryParams.filters)) {
        query = query.eq(field, value)
      }
    }

    // Handle ordering
    if (queryParams.orderBy) {
      query = query.order(queryParams.orderBy.field, queryParams.orderBy.direction || 'asc')
    }

    // Handle pagination
    if (queryParams.limit) {
      query = query.limit(queryParams.limit)
    }

    if (queryParams.offset) {
      query = query.range(queryParams.offset, queryParams.offset + (queryParams.limit || 10) - 1)
    }
  }

  const { data, error } = await query

  if (error) {
    return formatSupabaseResponse({ error }, [])
  }

  return formatSupabaseResponse({ error: null }, data)
}

export const insertTableRecord = async (tableName: string, data: any) => {
  const { data: insertedData, error } = await supabase
    .from(tableName)
    .insert(data)
    .select()
    .single()

  if (error) {
    return formatSupabaseResponse({ error }, null)
  }

  return formatSupabaseResponse({ error: null }, insertedData)
}

export const updateTableRecord = async (tableName: string, recordId: string, data: any) => {
  const { data: updatedData, error } = await supabase
    .from(tableName)
    .update(data)
    .eq('id', recordId)
    .select()
    .single()

  if (error) {
    return formatSupabaseResponse({ error }, null)
  }

  return formatSupabaseResponse({ error: null }, updatedData)
}

export const deleteTableRecord = async (tableName: string, recordId: string) => {
  const { error } = await supabase
    .from(tableName)
    .delete()
    .eq('id', recordId)

  if (error) {
    return formatSupabaseResponse({ error }, null)
  }

  return formatSupabaseResponse({ error: null }, { success: true })
}

export const queryTable = async (tableName: string, options: any = {}) => {
  let query = supabase.from(tableName).select('*')

  // Apply filters
  if (options.where) {
    for (const [field, value] of Object.entries(options.where)) {
      query = query.eq(field, value)
    }
  }

  // Apply ordering
  if (options.orderBy) {
    query = query.order(options.orderBy.field, options.orderBy.direction || 'asc')
  }

  // Apply pagination
  if (options.limit) {
    query = query.limit(options.limit)
  }

  if (options.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
  }

  const { data, error } = await query

  if (error) {
    return formatSupabaseResponse({ error }, [])
  }

  return formatSupabaseResponse({ error: null }, data)
}

// Specific functions for The 3rd Academy
/**
 * Get all skill passports for a user
 */
export const getUserSkillPassports = async (userId: string): Promise<{ data: SkillPassport[]; success: boolean; message: string }> => {
  try {
    const { data, error } = await supabase
      .from('skill_passports')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      return formatSupabaseResponse({ error }, [])
    }

    return formatSupabaseResponse({ error: null }, data)
  } catch (error) {
    console.error('Error in getUserSkillPassports:', error)
    return { data: [], success: false, message: 'Failed to load skill passport data' }
  }
}

/**
 * Create a new skill passport
 */
export const createSkillPassport = async (userId: string, title: string, content: any, confidenceScore?: number) => {
  try {
    // If confidence score not provided, calculate it
    if (confidenceScore === undefined) {
      confidenceScore = await calculateConfidenceScore(userId)
    }

    const { data, error } = await supabase
      .from('skill_passports')
      .insert({
        user_id: userId,
        title,
        content,
        confidence_score: confidenceScore
      })
      .select()
      .single()

    if (error) {
      return formatSupabaseResponse({ error }, null)
    }

    return formatSupabaseResponse({ error: null }, data)
  } catch (error) {
    console.error('Error creating skill passport:', error)
    return { data: null, success: false, message: 'Failed to create skill passport' }
  }
}

/**
 * Get user progress entries
 */
export const getUserProgress = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('progress_tracking')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })

    if (error) {
      return formatSupabaseResponse({ error }, [])
    }

    return formatSupabaseResponse({ error: null }, data)
  } catch (error) {
    console.error('Error in getUserProgress:', error)
    return { data: [], success: false, message: 'Failed to load progress data' }
  }
}

/**
 * Add a progress entry
 */
export const addProgressEntry = async (userId: string, skill: string, level: string, score: number) => {
  try {
    const { data, error } = await supabase
      .from('progress_tracking')
      .insert({
        user_id: userId,
        skill,
        level,
        score
      })
      .select()
      .single()

    if (error) {
      return formatSupabaseResponse({ error }, null)
    }

    return formatSupabaseResponse({ error: null }, data)
  } catch (error) {
    console.error('Error adding progress entry:', error)
    return { data: null, success: false, message: 'Failed to add progress entry' }
  }
}

/**
 * Log an analytics event
 */
export const logAnalyticsEvent = async (userId: string | null, eventType: string, data: any) => {
  try {
    const { data: eventData, error } = await supabase
      .from('analytics')
      .insert({
        user_id: userId,
        event_type: eventType,
        data
      })
      .select()
      .single()

    if (error) {
      return formatSupabaseResponse({ error }, null)
    }

    return formatSupabaseResponse({ error: null }, eventData)
  } catch (error) {
    console.error('Error logging analytics event:', error)
    return { data: null, success: false, message: 'Failed to log analytics event' }
  }
}

/**
 * Get user simulations
 */
export const getUserSimulations = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('simulations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      return formatSupabaseResponse({ error }, [])
    }

    return formatSupabaseResponse({ error: null }, data)
  } catch (error) {
    console.error('Error in getUserSimulations:', error)
    return { data: [], success: false, message: 'Failed to load simulation data' }
  }
}

/**
 * Create a simulation record
 */
export const createSimulation = async (userId: string, simulationType: string, results: any, score: number) => {
  try {
    const { data, error } = await supabase
      .from('simulations')
      .insert({
        user_id: userId,
        simulation_type: simulationType,
        results,
        score
      })
      .select()
      .single()

    if (error) {
      return formatSupabaseResponse({ error }, null)
    }

    return formatSupabaseResponse({ error: null }, data)
  } catch (error) {
    console.error('Error creating simulation:', error)
    return { data: null, success: false, message: 'Failed to create simulation' }
  }
}

/**
 * Get job postings
 */
export const getJobPostings = async (filters?: any) => {
  try {
    let query = supabase
      .from('job_postings')
      .select('*')
      .order('created_at', { ascending: false })

    // Apply filters
    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    if (filters?.employer_id) {
      query = query.eq('employer_id', filters.employer_id)
    }

    const { data, error } = await query

    if (error) {
      return formatSupabaseResponse({ error }, [])
    }

    return formatSupabaseResponse({ error: null }, data)
  } catch (error) {
    console.error('Error in getJobPostings:', error)
    return { data: [], success: false, message: 'Failed to load job postings' }
  }
}

/**
 * Create a job posting
 */
export const createJobPosting = async (employerId: string, title: string, description: string, requirements: any) => {
  try {
    const { data, error } = await supabase
      .from('job_postings')
      .insert({
        employer_id: employerId,
        title,
        description,
        requirements
      })
      .select()
      .single()

    if (error) {
      return formatSupabaseResponse({ error }, null)
    }

    return formatSupabaseResponse({ error: null }, data)
  } catch (error) {
    console.error('Error creating job posting:', error)
    return { data: null, success: false, message: 'Failed to create job posting' }
  }
}

/**
 * Get applications for an employer
 */
export const getApplicationsForEmployer = async (employerId: string) => {
  try {
    // Get employer's job IDs
    const jobsResponse = await getJobPostings({ employer_id: employerId })
    const employerJobIds = jobsResponse.data?.map((job: JobPosting) => job.id) || []

    // Get applications for those jobs
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .in('job_id', employerJobIds)
      .order('applied_at', { ascending: false })

    if (error) {
      return formatSupabaseResponse({ error }, [])
    }

    return formatSupabaseResponse({ error: null }, data)
  } catch (error) {
    console.error('Error in getApplicationsForEmployer:', error)
    return { data: [], success: false, message: 'Failed to load applications' }
  }
}

/**
 * Get user applications
 */
export const getUserApplications = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .eq('user_id', userId)
      .order('applied_at', { ascending: false })

    if (error) {
      return formatSupabaseResponse({ error }, [])
    }

    return formatSupabaseResponse({ error: null }, data)
  } catch (error) {
    console.error('Error in getUserApplications:', error)
    return { data: [], success: false, message: 'Failed to load user applications' }
  }
}

/**
 * Apply to a job
 */
export const applyToJob = async (userId: string, jobId: string, coverLetter?: string) => {
  try {
    const { data, error } = await supabase
      .from('applications')
      .insert({
        user_id: userId,
        job_id: jobId,
        cover_letter: coverLetter
      })
      .select()
      .single()

    if (error) {
      return formatSupabaseResponse({ error }, null)
    }

    return formatSupabaseResponse({ error: null }, data)
  } catch (error) {
    console.error('Error applying to job:', error)
    return { data: null, success: false, message: 'Failed to apply to job' }
  }
}

/**
 * Get user portfolios
 */
export const getUserPortfolios = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('portfolios')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      return formatSupabaseResponse({ error }, [])
    }

    return formatSupabaseResponse({ error: null }, data)
  } catch (error) {
    console.error('Error in getUserPortfolios:', error)
    return { data: [], success: false, message: 'Failed to load portfolio data' }
  }
}

/**
 * Create a portfolio
 */
export const createPortfolio = async (userId: string, title: string, description: string, links?: any) => {
  try {
    const { data, error } = await supabase
      .from('portfolios')
      .insert({
        user_id: userId,
        title,
        description,
        links
      })
      .select()
      .single()

    if (error) {
      return formatSupabaseResponse({ error }, null)
    }

    return formatSupabaseResponse({ error: null }, data)
  } catch (error) {
    console.error('Error creating portfolio:', error)
    return { data: null, success: false, message: 'Failed to create portfolio' }
  }
}

/**
 * Get user credentials
 */
export const getUserCredentials = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('credentials')
      .select('*')
      .eq('user_id', userId)
      .order('issued_at', { ascending: false })

    if (error) {
      return formatSupabaseResponse({ error }, [])
    }

    return formatSupabaseResponse({ error: null }, data)
  } catch (error) {
    console.error('Error in getUserCredentials:', error)
    return { data: [], success: false, message: 'Failed to load credentials' }
  }
}

/**
 * Issue a credential
 */
export const issueCredential = async (userId: string, type: string, data: any, expiresAt?: string) => {
  try {
    const { data: credentialData, error } = await supabase
      .from('credentials')
      .insert({
        user_id: userId,
        type,
        data,
        expires_at: expiresAt
      })
      .select()
      .single()

    if (error) {
      return formatSupabaseResponse({ error }, null)
    }

    return formatSupabaseResponse({ error: null }, credentialData)
  } catch (error) {
    console.error('Error issuing credential:', error)
    return { data: null, success: false, message: 'Failed to issue credential' }
  }
}

/**
 * Get user files
 */
export const getUserFiles = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('files')
      .select('*')
      .eq('user_id', userId)
      .order('uploaded_at', { ascending: false })

    if (error) {
      return formatSupabaseResponse({ error }, [])
    }

    return formatSupabaseResponse({ error: null }, data)
  } catch (error) {
    console.error('Error in getUserFiles:', error)
    return { data: [], success: false, message: 'Failed to load files' }
  }
}

/**
 * Upload a file
 * Uses the 'files' bucket in Supabase Storage
 */
export const uploadFile = async (file: File, userId: string, isPublic: boolean = true, metadata?: any) => {
  try {
    // Sanitize filename and generate unique path
    const timestamp = Date.now()
    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filePath = `${userId}/${timestamp}_${sanitizedFilename}`

    // Upload file to Supabase Storage 'files' bucket
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('files')
      .upload(filePath, file, {
        upsert: false,
        contentType: file.type,
        cacheControl: '3600'
      })

    if (uploadError) {
      return formatSupabaseResponse({ error: uploadError }, null)
    }

    // Get public URL or signed URL based on isPublic flag
    let fileUrl: string
    if (isPublic) {
      const { data: urlData } = supabase
        .storage
        .from('files')
        .getPublicUrl(filePath)
      fileUrl = urlData.publicUrl
    } else {
      // Generate signed URL for private files (1 hour validity)
      const { data: signedData, error: signedError } = await supabase
        .storage
        .from('files')
        .createSignedUrl(filePath, 3600)
      fileUrl = signedData?.signedUrl || ''
    }

    // Save file record to database
    const { data: fileRecord, error: recordError } = await supabase
      .from('files')
      .insert({
        user_id: userId,
        filename: file.name,
        file_url: fileUrl,
        file_path: filePath,
        file_type: file.type,
        file_size: file.size,
        metadata
      })
      .select()
      .single()

    if (recordError) {
      return formatSupabaseResponse({ error: recordError }, null)
    }

    return formatSupabaseResponse({ error: null }, fileRecord)
  } catch (error) {
    console.error('Error uploading file:', error)
    return { data: null, success: false, message: 'Failed to upload file' }
  }
}

/**
 * Get user projects
 */
export const getUserProjects = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      return formatSupabaseResponse({ error }, [])
    }

    return formatSupabaseResponse({ error: null }, data)
  } catch (error) {
    console.error('Error in getUserProjects:', error)
    return { data: [], success: false, message: 'Failed to load projects' }
  }
}

/**
 * Create a project
 */
export const createProject = async (userId: string, title: string, description: string, contractValue?: number) => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .insert({
        user_id: userId,
        title,
        description,
        contract_value: contractValue
      })
      .select()
      .single()

    if (error) {
      return formatSupabaseResponse({ error }, null)
    }

    return formatSupabaseResponse({ error: null }, data)
  } catch (error) {
    console.error('Error creating project:', error)
    return { data: null, success: false, message: 'Failed to create project' }
  }
}

// Confidence Score™ calculation functions
export const calculateConfidenceScore = async (userId: string): Promise<number> => {
  try {
    // Get user's progress data
    const progressRes = await getUserProgress(userId)
    const simulationsRes = await getUserSimulations(userId)
    const passportsRes = await getUserSkillPassports(userId)

    if (!progressRes.success || !simulationsRes.success || !passportsRes.success) {
      return 0
    }

    const progress = progressRes.data
    const simulations = simulationsRes.data
    const passports = passportsRes.data

    // Factor 1: Consistency (how consistent are the scores over time)
    const consistencyScore = calculateConsistencyScore(progress)

    // Factor 2: Trend (is the user improving over time)
    const trendScore = calculateTrendScore(progress)

    // Factor 3: Depth (breadth and depth of skills demonstrated)
    const depthScore = calculateDepthScore(progress, simulations, passports)

    // Factor 4: Volume (amount of activity/proof)
    const volumeScore = calculateVolumeScore(progress, simulations, passports)

    // Weighted average (can be adjusted based on business logic)
    const confidenceScore = (
      consistencyScore * 0.25 +
      trendScore * 0.30 +
      depthScore * 0.25 +
      volumeScore * 0.20
    )

    return Math.round(Math.min(100, Math.max(0, confidenceScore)))
  } catch (error) {
    console.error('Error calculating confidence score:', error)
    return 0
  }
}

const calculateConsistencyScore = (progress: ProgressEntry[]): number => {
  if (progress.length < 3) return 30 // Need minimum data

  const scores = progress.map(p => p.score)
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length
  const variance = scores.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / scores.length
  const stdDev = Math.sqrt(variance)

  // Lower standard deviation = higher consistency
  const consistency = Math.max(0, 100 - (stdDev * 2))
  return consistency
}

const calculateTrendScore = (progress: ProgressEntry[]): number => {
  if (progress.length < 3) return 25

  // Sort by date
  const sortedProgress = [...progress].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  // Calculate trend using linear regression
  const n = sortedProgress.length
  const sumX = sortedProgress.reduce((sum, p, i) => sum + i, 0)
  const sumY = sortedProgress.reduce((sum, p) => sum + p.score, 0)
  const sumXY = sortedProgress.reduce((sum, p, i) => sum + (i * p.score), 0)
  const sumXX = sortedProgress.reduce((sum, p, i) => sum + (i * i), 0)

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)

  // Positive slope = improvement trend
  return Math.min(100, Math.max(0, 50 + slope * 10))
}

const calculateDepthScore = (progress: ProgressEntry[], simulations: Simulation[], passports: SkillPassport[]): number => {
  const uniqueSkills = new Set(progress.map(p => p.skill)).size
  const simulationTypes = new Set(simulations.map(s => s.simulation_type)).size
  const passportCount = passports.length

  // Score based on breadth of skills and assessment types
  let depthScore = 0
  depthScore += Math.min(40, uniqueSkills * 8) // Max 40 points for skills
  depthScore += Math.min(30, simulationTypes * 15) // Max 30 points for simulation types
  depthScore += Math.min(30, passportCount * 6) // Max 30 points for passports

  return depthScore
}

const calculateVolumeScore = (progress: ProgressEntry[], simulations: Simulation[], passports: SkillPassport[]): number => {
  const totalActivities = progress.length + simulations.length + passports.length

  // Score based on volume of proof/activities
  if (totalActivities >= 20) return 100
  if (totalActivities >= 15) return 80
  if (totalActivities >= 10) return 60
  if (totalActivities >= 5) return 40
  if (totalActivities >= 3) return 20
  return 10
}

/**
 * Get mentor feedback for a user
 */
export const getMentorFeedback = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('mentor_feedback')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })

    if (error) {
      return formatSupabaseResponse({ error }, [])
    }

    return formatSupabaseResponse({ error: null }, data)
  } catch (error) {
    console.error('Error in getMentorFeedback:', error)
    return { data: [], success: false, message: 'Failed to load mentor feedback' }
  }
}

/**
 * Add mentor feedback
 */
export const addMentorFeedback = async (userId: string, mentorId: string, feedback: string, rating: number) => {
  try {
    const { data, error } = await supabase
      .from('mentor_feedback')
      .insert({
        user_id: userId,
        mentor_id: mentorId,
        feedback,
        rating
      })
      .select()
      .single()

    if (error) {
      return formatSupabaseResponse({ error }, null)
    }

    return formatSupabaseResponse({ error: null }, data)
  } catch (error) {
    console.error('Error adding mentor feedback:', error)
    return { data: null, success: false, message: 'Failed to add mentor feedback' }
  }
}

/**
 * Create user analytics profile
 */
export const createUserAnalyticsProfile = async (userId: string, analyticsData: any) => {
  try {
    const { data, error } = await supabase
      .from('user_analytics_profiles')
      .insert({
        user_id: userId,
        demographics: analyticsData.demographics,
        professional_background: analyticsData.professionalBackground,
        career_goals: analyticsData.careerGoals,
        learning_preferences: analyticsData.learningPreferences,
        discovery_source: analyticsData.discoverySource,
        marketing_consent: analyticsData.marketingConsent
      })
      .select()
      .single()

    if (error) {
      return formatSupabaseResponse({ error }, null)
    }

    return formatSupabaseResponse({ error: null }, data)
  } catch (error) {
    console.error('Error creating user analytics profile:', error)
    return { data: null, success: false, message: 'Failed to create analytics profile' }
  }
}

/**
 * Get user analytics profile
 */
export const getUserAnalyticsProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_analytics_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    if (error) {
      console.error('Error fetching analytics profile:', error)
      return formatSupabaseResponse({ error }, null)
    }

    return formatSupabaseResponse({ error: null }, data)
  } catch (error) {
    console.error('Error in getUserAnalyticsProfile:', error)
    return { data: null, success: false, message: 'Failed to load analytics profile' }
  }
}

/**
 * Update user analytics profile
 */
export const updateUserAnalyticsProfile = async (userId: string, analyticsData: any) => {
  try {
    // First get the existing profile to get the record ID
    const existing = await getUserAnalyticsProfile(userId)

    if (existing.data) {
      const { data, error } = await supabase
        .from('user_analytics_profiles')
        .update({
          demographics: analyticsData.demographics,
          professional_background: analyticsData.professionalBackground,
          career_goals: analyticsData.careerGoals,
          learning_preferences: analyticsData.learningPreferences,
          discovery_source: analyticsData.discoverySource,
          marketing_consent: analyticsData.marketingConsent,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.data.id)
        .select()
        .single()

      if (error) {
        return formatSupabaseResponse({ error }, null)
      }

      return formatSupabaseResponse({ error: null }, data)
    } else {
      // If no existing profile, create one
      return await createUserAnalyticsProfile(userId, analyticsData)
    }
  } catch (error) {
    console.error('Error updating user analytics profile:', error)
    return { data: null, success: false, message: 'Failed to update analytics profile' }
  }
}

// Achievement calculation functions
export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  earned: boolean
  progress: number
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

/**
 * Get user achievements
 */
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
    ])

    const passports = passportsRes.data || []
    const simulations = simulationsRes.data || []
    const portfolios = portfoliosRes.data || []

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
    ]

    return achievements
  } catch (error) {
    console.error('Error calculating user achievements:', error)
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
    ]
  }
}
