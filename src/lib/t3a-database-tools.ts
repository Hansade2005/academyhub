// ============================================================================
// THE 3RD ACADEMY - Database Tools & Helper Functions
// Implements business rules from Developer Guidelines
// ============================================================================

import { supabase, formatSupabaseResponse } from './supabase-client'
import type {
  UserRole,
  EndorsementDecision,
  RedirectType,
  VisaTier,
  ReadinessTier,
  MentorProfile,
  MentorAssignment,
  MentorEndorsement,
  GrowthLogEvent,
  UserSession,
  MentorDecisionPattern,
  BehavioralFingerprint,
  ResumeAnalysis,
  BasicProfile,
  LiveWorksProject,
  LiveWorksAssignment,
  TalentVisaNomination,
  TalentVisa,
  T3XListing,
  EmployerProfile,
  T3XConnectionRequest,
  HiringOutcome,
  RejectionTracking,
  BridgeFastModule,
  BridgeFastEnrollment,
  SkillPassportEligibility,
  TalentVisaEligibility,
  RejectionThresholdCheck,
  MentorCapacity,
  ObservationArea,
  T3AApiResponse
} from './t3a-types'

// ============================================================================
// MENTORLINK FUNCTIONS
// Business Rule: MANDATORY gate - no credential without mentor
// ============================================================================

/**
 * Get mentor profile by user ID
 */
export const getMentorProfileByUserId = async (userId: string): Promise<T3AApiResponse<MentorProfile>> => {
  try {
    const { data, error } = await supabase
      .from('mentor_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) return formatSupabaseResponse({ error }, null)
    return formatSupabaseResponse({ error: null }, data)
  } catch (error) {
    console.error('Error getting mentor profile:', error)
    return { data: null, success: false, message: 'Failed to get mentor profile' }
  }
}

/**
 * Get available mentors (for system assignment - NOT candidate selection)
 * Business Rule: Candidates cannot choose or request specific mentors
 */
export const getAvailableMentors = async (industry?: string): Promise<T3AApiResponse<MentorProfile[]>> => {
  try {
    let query = supabase
      .from('mentor_profiles')
      .select('*')
      .eq('is_active', true)
      .lt('current_mentee_count', supabase.rpc('get_max_mentees_column')) // Has capacity

    if (industry) {
      query = query.eq('industry', industry)
    }

    const { data, error } = await query.order('quality_score', { ascending: false })

    if (error) return formatSupabaseResponse({ error }, [])
    return formatSupabaseResponse({ error: null }, data || [])
  } catch (error) {
    console.error('Error getting available mentors:', error)
    return { data: [], success: false, message: 'Failed to get available mentors' }
  }
}

/**
 * Create mentor assignment (system assigns, no self-selection)
 */
export const createMentorAssignment = async (
  mentorId: string,
  candidateId: string,
  assignmentReason: string
): Promise<T3AApiResponse<MentorAssignment>> => {
  try {
    // Check mentor capacity first
    const capacity = await checkMentorCapacity(mentorId)
    if (!capacity.data?.can_accept_mentee) {
      return { data: null, success: false, message: 'Mentor at maximum capacity' }
    }

    const { data, error } = await supabase
      .from('mentor_assignments')
      .insert({
        mentor_id: mentorId,
        candidate_id: candidateId,
        assignment_reason: assignmentReason
      })
      .select()
      .single()

    if (error) return formatSupabaseResponse({ error }, null)
    return formatSupabaseResponse({ error: null }, data)
  } catch (error) {
    console.error('Error creating mentor assignment:', error)
    return { data: null, success: false, message: 'Failed to create mentor assignment' }
  }
}

/**
 * Get candidate's current mentor assignment
 */
export const getCandidateMentorAssignment = async (candidateId: string): Promise<T3AApiResponse<MentorAssignment>> => {
  try {
    const { data, error } = await supabase
      .from('mentor_assignments')
      .select('*')
      .eq('candidate_id', candidateId)
      .eq('status', 'active')
      .single()

    if (error && error.code !== 'PGRST116') return formatSupabaseResponse({ error }, null)
    return formatSupabaseResponse({ error: null }, data)
  } catch (error) {
    console.error('Error getting candidate assignment:', error)
    return { data: null, success: false, message: 'Failed to get mentor assignment' }
  }
}

/**
 * Record mentor endorsement (proceed / redirect / pause)
 * CRITICAL: Log every decision with timestamp for pattern tracking
 */
export const recordMentorEndorsement = async (
  assignmentId: string,
  mentorId: string,
  candidateId: string,
  decision: EndorsementDecision,
  context: {
    decision_context?: string
    observation_notes?: string
    behavioral_dimensions?: Record<string, number>
    redirect_to?: RedirectType
    redirect_reason?: string
    redirect_gap_areas?: string[]
    session_duration_minutes?: number
    observation_areas?: ObservationArea[]
  }
): Promise<T3AApiResponse<MentorEndorsement>> => {
  try {
    const { data, error } = await supabase
      .from('mentor_endorsements')
      .insert({
        assignment_id: assignmentId,
        mentor_id: mentorId,
        candidate_id: candidateId,
        decision,
        decision_context: context.decision_context,
        observation_notes: context.observation_notes,
        behavioral_dimensions: context.behavioral_dimensions || {},
        redirect_to: context.redirect_to,
        redirect_reason: context.redirect_reason,
        redirect_gap_areas: context.redirect_gap_areas,
        session_duration_minutes: context.session_duration_minutes,
        observation_areas: context.observation_areas || []
      })
      .select()
      .single()

    if (error) return formatSupabaseResponse({ error }, null)

    // Also log to mentor_decision_patterns for the data moat
    if (data) {
      await logMentorDecisionPattern(data)
    }

    return formatSupabaseResponse({ error: null }, data)
  } catch (error) {
    console.error('Error recording endorsement:', error)
    return { data: null, success: false, message: 'Failed to record endorsement' }
  }
}

/**
 * Check mentor capacity
 */
export const checkMentorCapacity = async (mentorId: string): Promise<T3AApiResponse<MentorCapacity>> => {
  try {
    const { data, error } = await supabase
      .from('mentor_profiles')
      .select('max_mentees, current_mentee_count')
      .eq('id', mentorId)
      .single()

    if (error) return formatSupabaseResponse({ error }, null)

    return formatSupabaseResponse({ error: null }, {
      can_accept_mentee: data.current_mentee_count < data.max_mentees,
      current_count: data.current_mentee_count,
      max_count: data.max_mentees
    })
  } catch (error) {
    console.error('Error checking mentor capacity:', error)
    return { data: null, success: false, message: 'Failed to check mentor capacity' }
  }
}

/**
 * Get candidate's redirect count
 * Business Rule: Maximum 2 Redirect loops — 3rd redirect triggers escalation
 */
export const getCandidateRedirectCount = async (candidateId: string): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('redirect_tracking')
      .select('*', { count: 'exact', head: true })
      .eq('candidate_id', candidateId)

    if (error) return 0
    return count || 0
  } catch (error) {
    console.error('Error getting redirect count:', error)
    return 0
  }
}

// ============================================================================
// GROWTH LOG FUNCTIONS
// Business Rule: Passive, append-only tracking
// ============================================================================

/**
 * Log growth event (passive tracking)
 * Business Rule: System events are immutable — cannot be edited or deleted
 */
export const logGrowthEvent = async (
  userId: string,
  eventCategory: GrowthLogEvent['event_category'],
  eventType: string,
  eventSource: GrowthLogEvent['event_source'],
  eventData: Record<string, any>,
  sessionId?: string,
  metrics?: {
    time_on_page_seconds?: number
    scroll_depth_percent?: number
    click_count?: number
  }
): Promise<T3AApiResponse<GrowthLogEvent>> => {
  try {
    const { data, error } = await supabase
      .from('growth_log_events')
      .insert({
        user_id: userId,
        event_category: eventCategory,
        event_type: eventType,
        event_source: eventSource,
        event_data: eventData,
        session_id: sessionId,
        time_on_page_seconds: metrics?.time_on_page_seconds,
        scroll_depth_percent: metrics?.scroll_depth_percent,
        click_count: metrics?.click_count
      })
      .select()
      .single()

    if (error) return formatSupabaseResponse({ error }, null)
    return formatSupabaseResponse({ error: null }, data)
  } catch (error) {
    console.error('Error logging growth event:', error)
    return { data: null, success: false, message: 'Failed to log growth event' }
  }
}

/**
 * Start user session
 */
export const startUserSession = async (
  userId: string,
  deviceInfo?: {
    device_type?: string
    browser?: string
    referrer?: string
  }
): Promise<T3AApiResponse<UserSession>> => {
  try {
    const { data, error } = await supabase
      .from('user_sessions')
      .insert({
        user_id: userId,
        device_type: deviceInfo?.device_type,
        browser: deviceInfo?.browser,
        referrer: deviceInfo?.referrer
      })
      .select()
      .single()

    if (error) return formatSupabaseResponse({ error }, null)
    return formatSupabaseResponse({ error: null }, data)
  } catch (error) {
    console.error('Error starting session:', error)
    return { data: null, success: false, message: 'Failed to start session' }
  }
}

/**
 * Get user's growth log events
 */
export const getUserGrowthEvents = async (
  userId: string,
  options?: {
    category?: GrowthLogEvent['event_category']
    source?: GrowthLogEvent['event_source']
    limit?: number
    offset?: number
  }
): Promise<T3AApiResponse<GrowthLogEvent[]>> => {
  try {
    let query = supabase
      .from('growth_log_events')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (options?.category) query = query.eq('event_category', options.category)
    if (options?.source) query = query.eq('event_source', options.source)
    if (options?.limit) query = query.limit(options.limit)
    if (options?.offset) query = query.range(options.offset, options.offset + (options.limit || 10) - 1)

    const { data, error } = await query

    if (error) return formatSupabaseResponse({ error }, [])
    return formatSupabaseResponse({ error: null }, data || [])
  } catch (error) {
    console.error('Error getting growth events:', error)
    return { data: [], success: false, message: 'Failed to get growth events' }
  }
}

// ============================================================================
// FRAMEWORK & LICENSING FUNCTIONS (DATA MOATS)
// CRITICAL: These must be captured from Day 1
// ============================================================================

/**
 * Log mentor decision pattern (Lock 1)
 * Internal function - called automatically when endorsements are recorded
 */
const logMentorDecisionPattern = async (endorsement: MentorEndorsement): Promise<void> => {
  try {
    await supabase
      .from('mentor_decision_patterns')
      .insert({
        endorsement_id: endorsement.id,
        mentor_id: endorsement.mentor_id,
        candidate_id: endorsement.candidate_id,
        decision: endorsement.decision,
        decision_timestamp: endorsement.decision_timestamp,
        behavioral_indicators: endorsement.behavioral_dimensions
      })
  } catch (error) {
    console.error('Error logging decision pattern:', error)
  }
}

/**
 * Update outcome in mentor decision pattern (when candidate is hired/rejected)
 */
export const updateDecisionPatternOutcome = async (
  candidateId: string,
  outcome: 'hired' | 'rejected' | 'exited',
  employerFeedbackScore?: number
): Promise<void> => {
  try {
    const now = new Date()

    // Get the most recent proceed endorsement for this candidate
    const { data: endorsements } = await supabase
      .from('mentor_endorsements')
      .select('decision_timestamp')
      .eq('candidate_id', candidateId)
      .eq('decision', 'proceed')
      .order('decision_timestamp', { ascending: false })
      .limit(1)

    let timeToOutcomeDays: number | undefined
    if (endorsements && endorsements.length > 0) {
      const endorsementDate = new Date(endorsements[0].decision_timestamp)
      timeToOutcomeDays = Math.floor((now.getTime() - endorsementDate.getTime()) / (1000 * 60 * 60 * 24))
    }

    await supabase
      .from('mentor_decision_patterns')
      .update({
        outcome,
        outcome_timestamp: now.toISOString(),
        time_to_outcome_days: timeToOutcomeDays,
        employer_feedback_score: employerFeedbackScore,
        updated_at: now.toISOString()
      })
      .eq('candidate_id', candidateId)
      .is('outcome', null)
  } catch (error) {
    console.error('Error updating decision pattern outcome:', error)
  }
}

// ============================================================================
// RESUME ENHANCER FUNCTIONS
// Business Rule: Gap indicators are MENTOR-ONLY visibility
// ============================================================================

/**
 * Create resume analysis
 */
export const createResumeAnalysis = async (
  userId: string,
  analysis: Omit<ResumeAnalysis, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'processed_at'>
): Promise<T3AApiResponse<ResumeAnalysis>> => {
  try {
    const { data, error } = await supabase
      .from('resume_analysis')
      .insert({
        user_id: userId,
        ...analysis
      })
      .select()
      .single()

    if (error) return formatSupabaseResponse({ error }, null)
    return formatSupabaseResponse({ error: null }, data)
  } catch (error) {
    console.error('Error creating resume analysis:', error)
    return { data: null, success: false, message: 'Failed to create resume analysis' }
  }
}

/**
 * Get resume analysis for user
 */
export const getUserResumeAnalysis = async (userId: string): Promise<T3AApiResponse<ResumeAnalysis>> => {
  try {
    const { data, error } = await supabase
      .from('resume_analysis')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') return formatSupabaseResponse({ error }, null)
    return formatSupabaseResponse({ error: null }, data)
  } catch (error) {
    console.error('Error getting resume analysis:', error)
    return { data: null, success: false, message: 'Failed to get resume analysis' }
  }
}

// ============================================================================
// BASIC PROFILE FUNCTIONS
// Business Rule: NOT a credential, NOT visible to employers
// ============================================================================

/**
 * Create or update basic profile
 */
export const upsertBasicProfile = async (
  userId: string,
  profile: Partial<BasicProfile>
): Promise<T3AApiResponse<BasicProfile>> => {
  try {
    const { data, error } = await supabase
      .from('basic_profiles')
      .upsert({
        user_id: userId,
        ...profile,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' })
      .select()
      .single()

    if (error) return formatSupabaseResponse({ error }, null)
    return formatSupabaseResponse({ error: null }, data)
  } catch (error) {
    console.error('Error upserting basic profile:', error)
    return { data: null, success: false, message: 'Failed to update basic profile' }
  }
}

/**
 * Get basic profile
 */
export const getBasicProfile = async (userId: string): Promise<T3AApiResponse<BasicProfile>> => {
  try {
    const { data, error } = await supabase
      .from('basic_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') return formatSupabaseResponse({ error }, null)
    return formatSupabaseResponse({ error: null }, data)
  } catch (error) {
    console.error('Error getting basic profile:', error)
    return { data: null, success: false, message: 'Failed to get basic profile' }
  }
}

// ============================================================================
// SKILL PASSPORT ELIGIBILITY
// Business Rule: Generated ONLY after MentorLink 'Proceed' endorsement
// ============================================================================

/**
 * Check if candidate is eligible for Skill Passport
 * Business Rule: MANDATORY mentor endorsement with 'proceed' decision
 */
export const checkSkillPassportEligibility = async (candidateId: string): Promise<T3AApiResponse<SkillPassportEligibility>> => {
  try {
    // Check for active mentor assignment
    const { data: assignment } = await supabase
      .from('mentor_assignments')
      .select('id')
      .eq('candidate_id', candidateId)
      .eq('status', 'active')
      .single()

    // Check for current 'proceed' endorsement
    const { data: endorsement } = await supabase
      .from('mentor_endorsements')
      .select('id, valid_until')
      .eq('candidate_id', candidateId)
      .eq('decision', 'proceed')
      .eq('is_current', true)
      .gt('valid_until', new Date().toISOString())
      .single()

    const eligibility: SkillPassportEligibility = {
      eligible: false,
      has_mentor_assignment: !!assignment,
      has_proceed_endorsement: !!endorsement,
      endorsement_is_current: !!endorsement && new Date(endorsement.valid_until) > new Date(),
      reasons: []
    }

    if (!assignment) {
      eligibility.reasons.push('No active mentor assignment')
    }
    if (!endorsement) {
      eligibility.reasons.push('No proceed endorsement from mentor')
    }

    eligibility.eligible = eligibility.has_mentor_assignment &&
                          eligibility.has_proceed_endorsement &&
                          eligibility.endorsement_is_current

    return { data: eligibility, success: true, message: 'Eligibility checked' }
  } catch (error) {
    console.error('Error checking eligibility:', error)
    return { data: null, success: false, message: 'Failed to check eligibility' }
  }
}

// ============================================================================
// TALENTVISA FUNCTIONS
// Business Rule: <5% cap, nomination-only, conditional on feedback
// ============================================================================

/**
 * Check TalentVisa availability (rarity control)
 * Business Rule: System-enforced cap at <5% of Skill Passport holders
 */
export const checkTalentVisaAvailability = async (): Promise<T3AApiResponse<TalentVisaEligibility>> => {
  try {
    // Get counts
    const { count: passportCount } = await supabase
      .from('skill_passports')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')

    const { count: visaCount } = await supabase
      .from('talent_visas')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')

    const currentPercentage = passportCount ? ((visaCount || 0) / passportCount) * 100 : 0
    const withinCap = currentPercentage < 5.0

    return {
      data: {
        eligible: withinCap,
        has_skill_passport: false, // Caller should check this separately
        has_nomination: false, // Caller should check this separately
        within_rarity_cap: withinCap,
        reasons: withinCap ? [] : ['TalentVisa capacity reached (5% cap)']
      },
      success: true,
      message: withinCap ? 'TalentVisa available' : 'TalentVisa at capacity'
    }
  } catch (error) {
    console.error('Error checking TalentVisa availability:', error)
    return { data: null, success: false, message: 'Failed to check availability' }
  }
}

/**
 * Create TalentVisa nomination (mentor-initiated)
 * Business Rule: Mentors limited to 3 nominations per quarter
 */
export const createTalentVisaNomination = async (
  candidateId: string,
  mentorId: string,
  justification: string,
  recommendedTier: VisaTier,
  supportingEvidence: any[]
): Promise<T3AApiResponse<TalentVisaNomination>> => {
  try {
    // Get current quarter
    const now = new Date()
    const quarter = `Q${Math.ceil((now.getMonth() + 1) / 3)}_${now.getFullYear()}`

    // Check mentor's nomination count
    const { count } = await supabase
      .from('talentvisa_nominations')
      .select('*', { count: 'exact', head: true })
      .eq('nominating_mentor_id', mentorId)
      .eq('nomination_quarter', quarter)

    if ((count || 0) >= 3) {
      return { data: null, success: false, message: 'Mentor has reached quarterly nomination limit (3)' }
    }

    const { data, error } = await supabase
      .from('talentvisa_nominations')
      .insert({
        candidate_id: candidateId,
        nominating_mentor_id: mentorId,
        justification,
        recommended_tier: recommendedTier,
        supporting_evidence: supportingEvidence,
        nomination_quarter: quarter
      })
      .select()
      .single()

    if (error) return formatSupabaseResponse({ error }, null)
    return formatSupabaseResponse({ error: null }, data)
  } catch (error) {
    console.error('Error creating nomination:', error)
    return { data: null, success: false, message: 'Failed to create nomination' }
  }
}

// ============================================================================
// T3X TALENT EXCHANGE FUNCTIONS
// Business Rule: Only Skill Passport holders, mandatory 30/60/90 feedback
// ============================================================================

/**
 * Create T3X listing (auto-generated from Skill Passport)
 */
export const createT3XListing = async (
  candidateId: string,
  skillPassportId: string,
  listingData: Record<string, any>
): Promise<T3AApiResponse<T3XListing>> => {
  try {
    const { data, error } = await supabase
      .from('t3x_listings')
      .insert({
        candidate_id: candidateId,
        skill_passport_id: skillPassportId,
        listing_data: listingData
      })
      .select()
      .single()

    if (error) return formatSupabaseResponse({ error }, null)
    return formatSupabaseResponse({ error: null }, data)
  } catch (error) {
    console.error('Error creating T3X listing:', error)
    return { data: null, success: false, message: 'Failed to create listing' }
  }
}

/**
 * Record hiring outcome
 */
export const recordHiringOutcome = async (
  candidateId: string,
  employerId: string,
  status: 'hired' | 'rejected' | 'withdrawn',
  jobId?: string,
  connectionId?: string
): Promise<T3AApiResponse<HiringOutcome>> => {
  try {
    const { data, error } = await supabase
      .from('hiring_outcomes')
      .insert({
        candidate_id: candidateId,
        employer_id: employerId,
        status,
        job_id: jobId,
        connection_id: connectionId
      })
      .select()
      .single()

    if (error) return formatSupabaseResponse({ error }, null)

    // Update decision pattern outcomes
    if (status === 'hired' || status === 'rejected') {
      await updateDecisionPatternOutcome(candidateId, status === 'hired' ? 'hired' : 'rejected')
    }

    return formatSupabaseResponse({ error: null }, data)
  } catch (error) {
    console.error('Error recording hiring outcome:', error)
    return { data: null, success: false, message: 'Failed to record outcome' }
  }
}

/**
 * Submit employer feedback (30/60/90 day)
 * Business Rule: Mandatory for employers
 */
export const submitEmployerFeedback = async (
  outcomeId: string,
  feedbackType: '30_day' | '60_day' | '90_day',
  feedback: {
    performance_score: number
    cultural_fit: number
    feedback_text: string
    would_rehire: boolean
  }
): Promise<T3AApiResponse<HiringOutcome>> => {
  try {
    const feedbackColumn = `feedback_${feedbackType}`
    const feedbackData = {
      ...feedback,
      submitted_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('hiring_outcomes')
      .update({
        [feedbackColumn]: feedbackData,
        updated_at: new Date().toISOString()
      })
      .eq('id', outcomeId)
      .select()
      .single()

    if (error) return formatSupabaseResponse({ error }, null)
    return formatSupabaseResponse({ error: null }, data)
  } catch (error) {
    console.error('Error submitting feedback:', error)
    return { data: null, success: false, message: 'Failed to submit feedback' }
  }
}

// ============================================================================
// REJECTION TRACKING & DIGNITY SAFEGUARDS
// Business Rule: >3 rejections triggers mentor review
// ============================================================================

/**
 * Track rejection (dignity safeguards)
 * Business Rule: Candidates with >3 rejections trigger review pathway
 */
export const trackRejection = async (
  candidateId: string,
  employerId: string,
  rejectionStage: 'application' | 'interview' | 'offer',
  rejectionReason?: string,
  jobId?: string
): Promise<T3AApiResponse<RejectionThresholdCheck>> => {
  try {
    // Get current rejection count
    const { count: currentCount } = await supabase
      .from('rejection_tracking')
      .select('*', { count: 'exact', head: true })
      .eq('candidate_id', candidateId)

    const rejectionNumber = (currentCount || 0) + 1
    const thresholdExceeded = rejectionNumber > 3

    // Insert rejection record
    await supabase
      .from('rejection_tracking')
      .insert({
        candidate_id: candidateId,
        employer_id: employerId,
        job_id: jobId,
        rejection_stage: rejectionStage,
        rejection_reason: rejectionReason,
        rejection_number: rejectionNumber,
        threshold_exceeded: thresholdExceeded,
        mentor_review_triggered: thresholdExceeded
      })

    return {
      data: {
        below_threshold: !thresholdExceeded,
        rejection_count: rejectionNumber,
        needs_mentor_review: thresholdExceeded
      },
      success: true,
      message: thresholdExceeded ? 'Rejection threshold exceeded - mentor review triggered' : 'Rejection tracked'
    }
  } catch (error) {
    console.error('Error tracking rejection:', error)
    return { data: null, success: false, message: 'Failed to track rejection' }
  }
}

// ============================================================================
// BRIDGEFAST FUNCTIONS
// Business Rule: Max 2 loops per candidate, 14-day deadline
// ============================================================================

/**
 * Enroll in BridgeFast module (mentor-directed for credentialing path)
 */
export const enrollInBridgeFast = async (
  userId: string,
  moduleId: string,
  enrollmentType: 'mentor_referral' | 'employer_provided' | 'self_enrolled',
  referringEndorsementId?: string
): Promise<T3AApiResponse<BridgeFastEnrollment>> => {
  try {
    // Check redirect loop count for credentialing path
    let redirectLoopNumber: number | undefined
    if (enrollmentType === 'mentor_referral') {
      const redirectCount = await getCandidateRedirectCount(userId)
      if (redirectCount >= 2) {
        return { data: null, success: false, message: 'Maximum redirect loops (2) exceeded' }
      }
      redirectLoopNumber = redirectCount + 1
    }

    const { data, error } = await supabase
      .from('bridgefast_enrollments')
      .insert({
        user_id: userId,
        module_id: moduleId,
        enrollment_type: enrollmentType,
        referring_endorsement_id: referringEndorsementId,
        redirect_loop_number: redirectLoopNumber
      })
      .select()
      .single()

    if (error) return formatSupabaseResponse({ error }, null)
    return formatSupabaseResponse({ error: null }, data)
  } catch (error) {
    console.error('Error enrolling in BridgeFast:', error)
    return { data: null, success: false, message: 'Failed to enroll' }
  }
}

/**
 * Get available BridgeFast modules
 */
export const getBridgeFastModules = async (category?: string): Promise<T3AApiResponse<BridgeFastModule[]>> => {
  try {
    let query = supabase
      .from('bridgefast_modules')
      .select('*')
      .eq('is_active', true)

    if (category) {
      query = query.eq('category', category)
    }

    const { data, error } = await query.order('title')

    if (error) return formatSupabaseResponse({ error }, [])
    return formatSupabaseResponse({ error: null }, data || [])
  } catch (error) {
    console.error('Error getting BridgeFast modules:', error)
    return { data: [], success: false, message: 'Failed to get modules' }
  }
}

// ============================================================================
// LIVEWORKS FUNCTIONS
// Business Rule: All credentialing-path projects require mentor supervision
// ============================================================================

/**
 * Get available LiveWorks projects
 */
export const getLiveWorksProjects = async (filters?: {
  category?: string
  difficulty?: string
  status?: string
}): Promise<T3AApiResponse<LiveWorksProject[]>> => {
  try {
    let query = supabase
      .from('liveworks_projects')
      .select('*')
      .eq('status', filters?.status || 'open')

    if (filters?.category) query = query.eq('category', filters.category)
    if (filters?.difficulty) query = query.eq('difficulty_level', filters.difficulty)

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) return formatSupabaseResponse({ error }, [])
    return formatSupabaseResponse({ error: null }, data || [])
  } catch (error) {
    console.error('Error getting LiveWorks projects:', error)
    return { data: [], success: false, message: 'Failed to get projects' }
  }
}

/**
 * Apply to LiveWorks project
 */
export const applyToLiveWorksProject = async (
  projectId: string,
  candidateId: string,
  isCredentialingPath: boolean = false,
  mentorId?: string
): Promise<T3AApiResponse<LiveWorksAssignment>> => {
  try {
    // Check concurrent project limit (max 2)
    const { count } = await supabase
      .from('liveworks_assignments')
      .select('*', { count: 'exact', head: true })
      .eq('candidate_id', candidateId)
      .in('status', ['applied', 'assigned', 'in_progress'])

    if ((count || 0) >= 2) {
      return { data: null, success: false, message: 'Maximum concurrent projects (2) reached' }
    }

    const { data, error } = await supabase
      .from('liveworks_assignments')
      .insert({
        project_id: projectId,
        candidate_id: candidateId,
        is_credentialing_path: isCredentialingPath,
        mentor_id: mentorId
      })
      .select()
      .single()

    if (error) return formatSupabaseResponse({ error }, null)
    return formatSupabaseResponse({ error: null }, data)
  } catch (error) {
    console.error('Error applying to project:', error)
    return { data: null, success: false, message: 'Failed to apply to project' }
  }
}

// ============================================================================
// EMPLOYER PROFILE FUNCTIONS
// Business Rule: Employers must be verified businesses
// ============================================================================

/**
 * Create employer profile
 */
export const createEmployerProfile = async (
  userId: string,
  profile: Omit<EmployerProfile, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'is_verified' | 'verified_at' | 'total_hires' | 'feedback_submission_rate'>
): Promise<T3AApiResponse<EmployerProfile>> => {
  try {
    const { data, error } = await supabase
      .from('employer_profiles')
      .insert({
        user_id: userId,
        ...profile
      })
      .select()
      .single()

    if (error) return formatSupabaseResponse({ error }, null)
    return formatSupabaseResponse({ error: null }, data)
  } catch (error) {
    console.error('Error creating employer profile:', error)
    return { data: null, success: false, message: 'Failed to create employer profile' }
  }
}

/**
 * Get employer profile
 */
export const getEmployerProfile = async (userId: string): Promise<T3AApiResponse<EmployerProfile>> => {
  try {
    const { data, error } = await supabase
      .from('employer_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') return formatSupabaseResponse({ error }, null)
    return formatSupabaseResponse({ error: null }, data)
  } catch (error) {
    console.error('Error getting employer profile:', error)
    return { data: null, success: false, message: 'Failed to get employer profile' }
  }
}

// ============================================================================
// USER ROLE MANAGEMENT
// ============================================================================

/**
 * Update user role
 */
export const updateUserRole = async (userId: string, role: UserRole): Promise<T3AApiResponse<any>> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({ role, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single()

    if (error) return formatSupabaseResponse({ error }, null)
    return formatSupabaseResponse({ error: null }, data)
  } catch (error) {
    console.error('Error updating user role:', error)
    return { data: null, success: false, message: 'Failed to update role' }
  }
}

/**
 * Get user by ID with role
 */
export const getUserWithRole = async (userId: string): Promise<T3AApiResponse<any>> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, full_name, avatar_url, role, is_verified, profile_completed')
      .eq('id', userId)
      .single()

    if (error) return formatSupabaseResponse({ error }, null)
    return formatSupabaseResponse({ error: null }, data)
  } catch (error) {
    console.error('Error getting user:', error)
    return { data: null, success: false, message: 'Failed to get user' }
  }
}
