// ============================================================================
// THE 3RD ACADEMY - TypeScript Type Definitions
// Complete type definitions for the T3A architecture
// ============================================================================

// ============================================================================
// ENUMS (matching PostgreSQL enum types)
// ============================================================================

export type UserRole = 'candidate' | 'mentor' | 'employer' | 'institution' | 'admin'

export type EndorsementDecision = 'proceed' | 'redirect' | 'pause'

export type RedirectType = 'bridgefast' | 'liveworks'

export type VisaTier = 'silver' | 'gold' | 'platinum'

export type ReadinessTier = 'tier_1' | 'tier_2' | 'tier_3'

// ============================================================================
// USER & AUTHENTICATION
// ============================================================================

export interface User {
  id: string
  email: string
  password_hash: string
  full_name?: string
  avatar_url?: string
  role: UserRole
  is_verified: boolean
  profile_completed: boolean
  created_at: string
  updated_at: string
}

// ============================================================================
// MENTORLINK - THE MANDATORY GATE
// Business Rule: No candidate can earn Skill Passport without MentorLink
// ============================================================================

export interface MentorProfile {
  id: string
  user_id: string
  industry: string
  expertise_areas: string[]
  years_experience: number
  company?: string
  job_title?: string
  bio?: string
  is_active: boolean
  max_mentees: number
  current_mentee_count: number
  quality_score: number // Updated by Framework
  total_endorsements: number
  successful_placements: number
  quarterly_nominations_used: number // Max 3 TalentVisa nominations per quarter
  quarterly_nominations_reset_at?: string
  created_at: string
  updated_at: string
}

export interface MentorAssignment {
  id: string
  mentor_id: string
  candidate_id: string
  assigned_at: string
  assignment_reason?: string // 'industry_match', 'expertise_match', etc.
  status: 'active' | 'completed' | 'transferred'
  completed_at?: string
  total_sessions: number
  last_session_at?: string
  created_at: string
  updated_at: string
}

export interface MentorEndorsement {
  id: string
  assignment_id: string
  mentor_id: string
  candidate_id: string
  decision: EndorsementDecision
  decision_context?: string // Mentor's reasoning
  observation_notes?: string
  behavioral_dimensions: BehavioralDimensions
  redirect_to?: RedirectType
  redirect_reason?: string
  redirect_gap_areas?: string[]
  session_duration_minutes?: number
  decision_timestamp: string
  observation_areas: ObservationArea[] // From Resume Enhancer
  valid_until: string // 12 months default
  is_current: boolean
  created_at: string
  locked_at: string // 48 hours after creation
}

export interface BehavioralDimensions {
  communication?: number // 0-100
  collaboration?: number
  problem_solving?: number
  adaptability?: number
  leadership?: number
  initiative?: number
  [key: string]: number | undefined
}

export interface ObservationArea {
  area: string
  description: string
  priority: 'high' | 'medium' | 'low'
}

export interface RedirectTracking {
  id: string
  candidate_id: string
  endorsement_id: string
  redirect_type: RedirectType
  redirect_number: number // 1 or 2 max
  started_at: string
  completed_at?: string
  completion_status?: 'completed' | 'abandoned' | 'timeout'
  created_at: string
}

// ============================================================================
// GROWTH LOG - PASSIVE BEHAVIORAL TRACKING
// Business Rule: Passive, append-only tracking of ALL interactions
// ============================================================================

export interface GrowthLogEvent {
  id: string
  user_id: string
  event_category: 'navigation' | 'assessment' | 'training' | 'project' | 'mentor' | 'application'
  event_type: string
  event_source: 'resume_enhancer' | 'mentorlink' | 'bridgefast' | 'liveworks' | 'civic_lab' | 't3x'
  event_data: Record<string, any>
  session_id?: string
  time_on_page_seconds?: number
  scroll_depth_percent?: number
  click_count?: number
  previous_event_id?: string
  created_at: string
}

export interface UserSession {
  id: string
  user_id: string
  started_at: string
  ended_at?: string
  duration_seconds?: number
  device_type?: 'desktop' | 'mobile' | 'tablet'
  browser?: string
  referrer?: string
  total_events: number
  pages_viewed: number
  assessments_started: number
  assessments_completed: number
  created_at: string
}

// ============================================================================
// FRAMEWORK & LICENSING - THE DATA MOATS
// CRITICAL: These capture the compounding competitive advantage
// ============================================================================

// Lock 1: Mentor Decision Patterns
export interface MentorDecisionPattern {
  id: string
  endorsement_id: string
  mentor_id: string
  candidate_id: string
  decision: EndorsementDecision
  decision_timestamp: string
  outcome?: 'hired' | 'rejected' | 'exited' | 'pending'
  outcome_timestamp?: string
  time_to_outcome_days?: number
  employer_feedback_score?: number
  employment_duration_days?: number
  candidate_profile_snapshot: Record<string, any> // Anonymized
  mentor_context_snapshot: Record<string, any>
  behavioral_indicators: Record<string, any>
  created_at: string
  updated_at: string
}

// Lock 2: Behavioral Fingerprint
export interface BehavioralFingerprint {
  id: string
  user_id: string
  pattern_period: 'daily' | 'weekly' | 'monthly' | 'lifetime'
  period_start: string
  period_end: string
  avg_session_duration_seconds?: number
  avg_time_between_sessions_hours?: number
  total_sessions: number
  completion_rate?: number // 0.0000 to 1.0000
  skip_rate?: number
  revision_rate?: number
  avg_response_time_seconds?: number
  response_consistency_score?: number // 0-100
  suspicious_pattern_flags: string[]
  gaming_risk_score: number
  eventual_outcome?: 'hired' | 'rejected' | 'exited' | 'pending'
  outcome_timestamp?: string
  created_at: string
  updated_at: string
}

// Framework Aggregate Learnings
export interface FrameworkLearning {
  id: string
  learning_type: 'mentor_calibration' | 'gap_prediction' | 'dropout_risk' | 'success_pattern'
  sample_size: number
  confidence_level: number // 0.0000 to 1.0000
  pattern_description: string
  pattern_data: Record<string, any>
  recommended_actions: RecommendedAction[]
  implemented_at?: string
  valid_from: string
  valid_until?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface RecommendedAction {
  action: string
  priority: 'high' | 'medium' | 'low'
  target_component: string
}

// ============================================================================
// RESUME ENHANCER (Entry A)
// Business Rule: Gap indicators are MENTOR-ONLY visibility
// ============================================================================

export interface ResumeAnalysis {
  id: string
  user_id: string
  original_filename?: string
  original_content?: string
  upload_source: 'upload' | 'linkedin' | 'import'
  parsed_skills: ParsedSkill[]
  parsed_experience: ParsedExperience[]
  parsed_education: ParsedEducation[]
  parsed_certifications: string[]
  language_patterns: LanguagePatterns
  observation_areas: ObservationArea[] // MENTOR-ONLY
  behavioral_indicators: Record<string, any>
  processed_at: string
  processing_version: string
  created_at: string
  updated_at: string
}

export interface ParsedSkill {
  skill: string
  confidence: number
  source_text?: string
}

export interface ParsedExperience {
  role: string
  company?: string
  duration?: string
  responsibilities?: string[]
}

export interface ParsedEducation {
  institution: string
  degree?: string
  field?: string
  year?: number
}

export interface LanguagePatterns {
  confidence_level: number
  specificity: number
  quantification: number
}

// ============================================================================
// BASIC PROFILE (Entry Snapshot)
// Business Rule: NOT a credential, NOT visible to employers
// ============================================================================

export interface BasicProfile {
  id: string
  user_id: string
  entry_point: 'resume_upload' | 'liveworks' | 'civic_transition'
  resume_analysis_id?: string
  skills_snapshot: ParsedSkill[]
  experience_snapshot: ParsedExperience[]
  education_snapshot: ParsedEducation[]
  profile_status: 'draft' | 'complete' | 'archived'
  mentor_observation_areas: ObservationArea[] // MENTOR-ONLY
  created_at: string
  updated_at: string
}

// ============================================================================
// LIVEWORKS STUDIO (Entry C + Redirect Destination)
// Business Rule: All credentialing-path projects require mentor supervision
// ============================================================================

export interface LiveWorksProject {
  id: string
  posted_by: string
  title: string
  description: string
  category: string
  difficulty_level: 'beginner' | 'intermediate' | 'advanced'
  required_skills: string[]
  estimated_duration_days?: number
  budget_min?: number
  budget_max?: number
  milestones: ProjectMilestone[]
  status: 'open' | 'in_progress' | 'completed' | 'cancelled'
  max_applicants: number
  current_applicants: number
  platform_fee_percent: number // Default 15%
  created_at: string
  updated_at: string
}

export interface ProjectMilestone {
  title: string
  description: string
  deliverables: string[]
  percentage: number
}

export interface LiveWorksAssignment {
  id: string
  project_id: string
  candidate_id: string
  mentor_id?: string
  is_credentialing_path: boolean
  status: 'applied' | 'assigned' | 'in_progress' | 'completed' | 'withdrawn'
  assigned_at?: string
  started_at?: string
  completed_at?: string
  milestones_completed: CompletedMilestone[]
  current_milestone: number
  agreed_amount?: number
  amount_released: number
  mentor_observations: MentorObservation[]
  has_dispute: boolean
  dispute_details?: Record<string, any>
  created_at: string
  updated_at: string
}

export interface CompletedMilestone {
  milestone_id: number
  completed_at: string
  mentor_approved: boolean
}

export interface MentorObservation {
  date: string
  observation: string
  behavioral_dimensions: BehavioralDimensions
}

// ============================================================================
// CIVIC ACCESS LAB (Entry B - SEPARATE INSTITUTIONAL TRACK)
// Business Rule: Does NOT directly produce credentials
// ============================================================================

export interface CivicInstitution {
  id: string
  name: string
  institution_type: 'high_school' | 'college' | 'vocational' | 'government_program'
  location?: {
    city?: string
    state?: string
    country?: string
  }
  admin_user_id?: string
  is_active: boolean
  settings: Record<string, any>
  compliance_verified: boolean
  compliance_verified_at?: string
  created_at: string
  updated_at: string
}

export interface CivicStudent {
  id: string
  user_id: string
  institution_id: string
  grade_level?: string
  expected_graduation?: string
  enrollment_status: 'enrolled' | 'graduated' | 'transferred' | 'withdrawn'
  graduated_at?: string
  transitioned_to_main_path: boolean
  transitioned_at?: string
  created_at: string
  updated_at: string
}

export interface CivicActivity {
  id: string
  student_id: string
  institution_id: string
  activity_type: 'career_exploration' | 'interest_inventory' | 'goal_setting' | 'self_assessment'
  activity_name: string
  activity_data: Record<string, any>
  teacher_user_id?: string
  teacher_observation?: string // Developmental, NOT evaluative
  observed_behaviors: string[]
  started_at: string
  completed_at?: string
  completion_status: 'in_progress' | 'completed' | 'abandoned'
  created_at: string
}

export interface CivicCohortAnalytics {
  id: string
  institution_id: string
  analytics_period: 'monthly' | 'quarterly' | 'yearly'
  period_start: string
  period_end: string
  total_students?: number
  active_students?: number
  activities_completed?: number
  avg_engagement_score?: number
  participation_by_activity: Record<string, number>
  engagement_trends: Record<string, any>
  framework_contribution_id?: string
  created_at: string
}

// ============================================================================
// SKILL PASSPORT (MENTOR-GATED)
// Business Rule: Generated ONLY after MentorLink 'Proceed' endorsement
// ============================================================================

export interface SkillPassport {
  id: string
  user_id: string
  title: string
  content: SkillPassportContent
  confidence_score?: number
  mentor_endorsement_id?: string // MANDATORY for new passports
  basic_profile_id?: string
  readiness_tier?: ReadinessTier
  evidence_links: EvidenceLink[]
  behavioral_scores: BehavioralDimensions
  is_active: boolean
  status: 'active' | 'expired' | 'withdrawn'
  expires_at?: string // 12 months default
  verification_code?: string
  created_at: string
  updated_at: string
}

export interface SkillPassportContent {
  hard_skills: SkillEntry[]
  soft_skills: SkillEntry[]
  experience_summary?: string
  education_summary?: string
  certifications?: string[]
}

export interface SkillEntry {
  name: string
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  years_experience?: number
  evidence?: string[]
}

export interface EvidenceLink {
  type: 'assessment' | 'project' | 'mentor_observation' | 'certification'
  title: string
  url?: string
  date: string
  verified: boolean
}

// ============================================================================
// TALENTVISA (LATE-STAGE, CONDITIONAL, RARE)
// Business Rule: <5% cap, nomination-only, conditional on feedback
// ============================================================================

export interface TalentVisaNomination {
  id: string
  candidate_id: string
  nominating_mentor_id: string
  justification: string
  recommended_tier: VisaTier
  supporting_evidence: EvidenceLink[]
  status: 'pending' | 'approved' | 'rejected' | 'withdrawn'
  reviewed_by?: string
  reviewed_at?: string
  review_notes?: string
  nomination_quarter: string // 'Q1_2026', 'Q2_2026', etc.
  created_at: string
}

export interface TalentVisa {
  id: string
  candidate_id: string
  nomination_id: string
  skill_passport_id: string
  tier: VisaTier
  issued_at: string
  expires_at: string // 18 months default
  status: 'active' | 'under_review' | 'suspended' | 'expired'
  negative_feedback_count: number
  last_review_at?: string
  review_reason?: string
  verification_code?: string
  created_at: string
  updated_at: string
}

export interface TalentVisaRarityControl {
  id: string
  snapshot_date: string
  total_skill_passport_holders: number
  total_active_talent_visas: number
  current_percentage: number
  max_percentage: number // Default 5%
  is_at_capacity: boolean
  created_at: string
}

// ============================================================================
// T3X TALENT EXCHANGE
// Business Rule: Only Skill Passport holders, mandatory 30/60/90 feedback
// ============================================================================

export interface T3XListing {
  id: string
  candidate_id: string
  skill_passport_id: string
  talent_visa_id?: string
  listing_data: Record<string, any>
  behavioral_scores: BehavioralDimensions
  readiness_tier?: ReadinessTier
  is_visible: boolean
  visibility_settings: {
    preferred_industries?: string[]
    preferred_locations?: string[]
    min_salary?: number
    remote_only?: boolean
  }
  view_count: number
  connection_request_count: number
  last_viewed_at?: string
  created_at: string
  updated_at: string
}

export interface EmployerProfile {
  id: string
  user_id: string
  company_name: string
  company_website?: string
  company_size?: 'startup' | 'small' | 'medium' | 'large' | 'enterprise'
  industry: string
  location?: {
    city?: string
    state?: string
    country?: string
  }
  is_verified: boolean
  verified_at?: string
  verification_documents: string[]
  subscription_tier: 'standard' | 'premium'
  total_hires: number
  feedback_submission_rate: number
  created_at: string
  updated_at: string
}

export interface T3XConnectionRequest {
  id: string
  employer_id: string
  listing_id: string
  candidate_id: string
  message?: string
  job_id?: string
  status: 'pending' | 'accepted' | 'declined' | 'expired'
  responded_at?: string
  expires_at: string // 14 days default
  created_at: string
}

export interface HiringOutcome {
  id: string
  candidate_id: string
  employer_id: string
  job_id?: string
  connection_id?: string
  status: 'hired' | 'rejected' | 'withdrawn'
  hired_at?: string
  // 30/60/90 Day Feedback (MANDATORY for employers)
  feedback_30_day?: EmployerFeedback
  feedback_30_day_due?: string
  feedback_60_day?: EmployerFeedback
  feedback_60_day_due?: string
  feedback_90_day?: EmployerFeedback
  feedback_90_day_due?: string
  overall_feedback_score?: number
  employment_ended_at?: string
  employment_end_reason?: string
  framework_processed: boolean
  created_at: string
  updated_at: string
}

export interface EmployerFeedback {
  submitted_at: string
  performance_score: number
  cultural_fit: number
  feedback_text: string
  would_rehire: boolean
}

export interface RejectionTracking {
  id: string
  candidate_id: string
  employer_id: string
  job_id?: string
  rejection_stage: 'application' | 'interview' | 'offer'
  rejection_reason?: string // Internal only
  rejection_number: number
  threshold_exceeded: boolean // >3 triggers review
  mentor_review_triggered: boolean
  mentor_review_id?: string
  exited_credentialing_path: boolean
  exit_handled_with_dignity: boolean // Always TRUE by design
  created_at: string
}

// ============================================================================
// BRIDGEFAST TRAINING MODULES
// Business Rule: Max 2 loops per candidate, 14-day deadline
// ============================================================================

export interface BridgeFastModule {
  id: string
  title: string
  description: string
  category: 'communication' | 'collaboration' | 'problem_solving' | 'adaptability' | 'leadership'
  difficulty_level: 'beginner' | 'intermediate' | 'advanced'
  estimated_duration_hours: number // 2-4 hours typical
  content_type: 'video' | 'interactive' | 'scenario' | 'mixed'
  content_data: Record<string, any>
  has_final_assessment: boolean
  passing_score: number // Default 70
  is_active: boolean
  version: string
  created_at: string
  updated_at: string
}

export interface BridgeFastEnrollment {
  id: string
  user_id: string
  module_id: string
  enrollment_type: 'mentor_referral' | 'employer_provided' | 'self_enrolled'
  referring_endorsement_id?: string
  redirect_loop_number?: number // 1 or 2 max
  status: 'enrolled' | 'in_progress' | 'completed' | 'expired'
  started_at?: string
  completed_at?: string
  final_score?: number
  passed?: boolean
  deadline: string // 14 days default
  extension_granted: boolean
  extension_granted_by?: string
  growth_log_synced: boolean
  created_at: string
  updated_at: string
}

// ============================================================================
// HELPER TYPES FOR API RESPONSES
// ============================================================================

export interface T3AApiResponse<T> {
  data: T | null
  success: boolean
  message: string
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  per_page: number
  total_pages: number
}

// ============================================================================
// BUSINESS RULE VALIDATION TYPES
// ============================================================================

export interface SkillPassportEligibility {
  eligible: boolean
  has_mentor_assignment: boolean
  has_proceed_endorsement: boolean
  endorsement_is_current: boolean
  reasons: string[]
}

export interface TalentVisaEligibility {
  eligible: boolean
  has_skill_passport: boolean
  has_nomination: boolean
  within_rarity_cap: boolean
  reasons: string[]
}

export interface RejectionThresholdCheck {
  below_threshold: boolean
  rejection_count: number
  needs_mentor_review: boolean
}

export interface MentorCapacity {
  can_accept_mentee: boolean
  current_count: number
  max_count: number
}
