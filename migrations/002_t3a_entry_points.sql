-- ============================================================================
-- THE 3RD ACADEMY - ENTRY POINTS & CREDENTIALING SCHEMA
-- Phase 2: Entry Points (Resume Enhancer, Basic Profile, LiveWorks, Civic Lab)
-- Phase 3: Credentialing (Skill Passport updates, TalentVisa, T3X)
--
-- Entry Points:
--   A: Resume Upload → Resume Enhancer → Basic Profile
--   B: Civic Access Lab (institutional track - SEPARATE)
--   C: LiveWorks Studio (project-based entry)
-- ============================================================================

-- ============================================================================
-- SECTION 1: RESUME ENHANCER (Entry A)
-- Business Rule: Gap indicators are mentor-facing ONLY — never exposed to
-- candidates or employers. Language uses "observation areas" not "deficiencies"
-- ============================================================================

-- Resume Analysis (output from Resume Enhancer)
CREATE TABLE IF NOT EXISTS resume_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Original input
    original_filename TEXT,
    original_content TEXT, -- Raw extracted text
    upload_source TEXT DEFAULT 'upload', -- 'upload', 'linkedin', 'import'

    -- Parsed data (what is CLAIMED)
    parsed_skills JSONB DEFAULT '[]', -- [{skill, confidence, source_text}]
    parsed_experience JSONB DEFAULT '[]', -- [{role, company, duration, responsibilities}]
    parsed_education JSONB DEFAULT '[]',
    parsed_certifications JSONB DEFAULT '[]',
    language_patterns JSONB DEFAULT '{}', -- confidence level, specificity, quantification

    -- Gap Detection (what is MISSING - MENTOR-ONLY visibility)
    -- Business Rule: Categories: Communication, Collaboration, Problem-solving, Adaptability, Leadership
    observation_areas JSONB DEFAULT '[]', -- [{area, description, priority}]
    -- NEVER exposed as "gaps" or "deficiencies"

    -- Behavioral competency mapping
    behavioral_indicators JSONB DEFAULT '{}',

    -- Processing metadata
    processed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    processing_version TEXT DEFAULT '1.0',

    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- SECTION 2: BASIC PROFILE (Entry Snapshot)
-- Business Rule: Basic Profile is NOT a credential, is NOT visible to employers,
-- cannot be labeled as "verified," "validated," or "ready"
-- ============================================================================

-- Basic Profiles (non-credentialed snapshot)
CREATE TABLE IF NOT EXISTS basic_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Source tracking
    entry_point TEXT NOT NULL, -- 'resume_upload', 'liveworks', 'civic_transition'
    resume_analysis_id UUID REFERENCES resume_analysis(id),

    -- Profile data (descriptive only)
    skills_snapshot JSONB DEFAULT '[]', -- Point-in-time claimed skills
    experience_snapshot JSONB DEFAULT '[]',
    education_snapshot JSONB DEFAULT '[]',

    -- Status (purely descriptive)
    profile_status TEXT DEFAULT 'draft', -- 'draft', 'complete', 'archived'

    -- IMPORTANT: This is NOT a credential
    -- No validation claims, no readiness labels
    -- This feeds into Growth Log for passive tracking

    -- For mentor reference (from Resume Enhancer)
    mentor_observation_areas JSONB DEFAULT '[]', -- Visible ONLY to assigned mentor

    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    UNIQUE(user_id) -- One active basic profile per user
);

-- ============================================================================
-- SECTION 3: LIVEWORKS STUDIO (Entry C + Redirect Destination)
-- Business Rule: All credentialing-path projects require mentor supervision.
-- Entry C freelancers still require MentorLink for Skill Passport.
-- ============================================================================

-- LiveWorks Project Listings (posted by employers/clients)
CREATE TABLE IF NOT EXISTS liveworks_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    posted_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Project details
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL, -- 'development', 'design', 'writing', 'marketing', etc.
    difficulty_level TEXT NOT NULL DEFAULT 'intermediate', -- 'beginner', 'intermediate', 'advanced'

    -- Requirements
    required_skills JSONB DEFAULT '[]',
    estimated_duration_days INTEGER,
    budget_min NUMERIC(10,2),
    budget_max NUMERIC(10,2),

    -- Milestones
    milestones JSONB DEFAULT '[]', -- [{title, description, deliverables, percentage}]

    -- Status
    status TEXT NOT NULL DEFAULT 'open', -- 'open', 'in_progress', 'completed', 'cancelled'
    max_applicants INTEGER DEFAULT 10,
    current_applicants INTEGER DEFAULT 0,

    -- Platform fee: 15% of project value
    platform_fee_percent NUMERIC(5,2) DEFAULT 15.00,

    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- LiveWorks Project Assignments (candidate-project-mentor linking)
CREATE TABLE IF NOT EXISTS liveworks_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES liveworks_projects(id) ON DELETE CASCADE,
    candidate_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- MANDATORY mentor supervision for credentialing path
    mentor_id UUID REFERENCES mentor_profiles(id),
    is_credentialing_path BOOLEAN DEFAULT FALSE, -- TRUE if redirected from MentorLink

    -- Assignment status
    status TEXT NOT NULL DEFAULT 'applied', -- 'applied', 'assigned', 'in_progress', 'completed', 'withdrawn'
    assigned_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,

    -- Milestone tracking
    milestones_completed JSONB DEFAULT '[]', -- [{milestone_id, completed_at, mentor_approved}]
    current_milestone INTEGER DEFAULT 0,

    -- Payment (escrow-based)
    agreed_amount NUMERIC(10,2),
    amount_released NUMERIC(10,2) DEFAULT 0,

    -- Mentor observations (feeds Growth Log)
    mentor_observations JSONB DEFAULT '[]', -- [{date, observation, behavioral_dimensions}]

    -- Dispute tracking
    has_dispute BOOLEAN DEFAULT FALSE,
    dispute_details JSONB,

    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    -- Candidates limited to 2 concurrent projects
    -- Business Rule: Candidates limited to 2 concurrent projects
    UNIQUE(project_id, candidate_id)
);

-- ============================================================================
-- SECTION 4: CIVIC ACCESS LAB (Entry B - SEPARATE INSTITUTIONAL TRACK)
-- Business Rule: Civic Access Lab data feeds institutional dashboards ONLY.
-- Does NOT directly produce credentials. Does NOT feed Skill Passport or TalentVisa.
-- ============================================================================

-- Civic Institutions (schools, government programs)
CREATE TABLE IF NOT EXISTS civic_institutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    institution_type TEXT NOT NULL, -- 'high_school', 'college', 'vocational', 'government_program'
    location JSONB, -- {city, state, country}

    -- Admin user
    admin_user_id UUID REFERENCES users(id),

    -- Settings
    is_active BOOLEAN DEFAULT TRUE,
    settings JSONB DEFAULT '{}',

    -- Compliance (COPPA/FERPA)
    compliance_verified BOOLEAN DEFAULT FALSE,
    compliance_verified_at TIMESTAMP WITH TIME ZONE,

    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Civic Students (linked to institutions)
CREATE TABLE IF NOT EXISTS civic_students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    institution_id UUID NOT NULL REFERENCES civic_institutions(id) ON DELETE CASCADE,

    -- Student info
    grade_level TEXT,
    expected_graduation DATE,

    -- Status
    enrollment_status TEXT DEFAULT 'enrolled', -- 'enrolled', 'graduated', 'transferred', 'withdrawn'
    graduated_at TIMESTAMP WITH TIME ZONE,

    -- Transition tracking (to main credentialing pathway)
    transitioned_to_main_path BOOLEAN DEFAULT FALSE,
    transitioned_at TIMESTAMP WITH TIME ZONE,

    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    UNIQUE(user_id, institution_id)
);

-- Civic Activities (participation tracking - developmental, not evaluative)
-- Business Rule: Teacher observations are developmental, not evaluative
CREATE TABLE IF NOT EXISTS civic_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES civic_students(id) ON DELETE CASCADE,
    institution_id UUID NOT NULL REFERENCES civic_institutions(id) ON DELETE CASCADE,

    -- Activity details
    activity_type TEXT NOT NULL, -- 'career_exploration', 'interest_inventory', 'goal_setting', 'self_assessment'
    activity_name TEXT NOT NULL,
    activity_data JSONB DEFAULT '{}',

    -- Teacher observations (developmental only)
    teacher_user_id UUID REFERENCES users(id),
    teacher_observation TEXT,
    observed_behaviors JSONB DEFAULT '[]', -- Developmental notes, NOT evaluative

    -- Completion
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    completion_status TEXT DEFAULT 'in_progress', -- 'in_progress', 'completed', 'abandoned'

    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Civic Cohort Analytics (aggregate only - no individual scoring)
-- Business Rule: Data is aggregate, descriptive, participation-based
CREATE TABLE IF NOT EXISTS civic_cohort_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL REFERENCES civic_institutions(id) ON DELETE CASCADE,

    -- Period
    analytics_period TEXT NOT NULL, -- 'monthly', 'quarterly', 'yearly'
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,

    -- Aggregate metrics (NO individual data)
    total_students INTEGER,
    active_students INTEGER,
    activities_completed INTEGER,
    avg_engagement_score NUMERIC(5,2),

    -- Participation patterns (aggregate)
    participation_by_activity JSONB DEFAULT '{}',
    engagement_trends JSONB DEFAULT '{}',

    -- Feeds Framework (anonymized aggregate only)
    framework_contribution_id UUID,

    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    UNIQUE(institution_id, analytics_period, period_start)
);

-- ============================================================================
-- SECTION 5: SKILL PASSPORT UPDATES (MENTOR-GATED)
-- Business Rule: Generated ONLY after MentorLink 'Proceed' endorsement — no exceptions
-- ============================================================================

-- Add mentor-gating columns to existing skill_passports table
ALTER TABLE skill_passports
    ADD COLUMN IF NOT EXISTS mentor_endorsement_id UUID REFERENCES mentor_endorsements(id),
    ADD COLUMN IF NOT EXISTS basic_profile_id UUID REFERENCES basic_profiles(id),
    ADD COLUMN IF NOT EXISTS readiness_tier readiness_tier,
    ADD COLUMN IF NOT EXISTS evidence_links JSONB DEFAULT '[]',
    ADD COLUMN IF NOT EXISTS behavioral_scores JSONB DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '12 months'),
    ADD COLUMN IF NOT EXISTS verification_code TEXT DEFAULT encode(gen_random_bytes(16), 'hex');

-- Business Rule: Skill Passport can be withdrawn or updated
-- Add status column
ALTER TABLE skill_passports
    ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active'; -- 'active', 'expired', 'withdrawn'

-- ============================================================================
-- SECTION 6: TALENTVISA (LATE-STAGE, CONDITIONAL, RARE)
-- Business Rule: System-enforced cap at <5% of Skill Passport holders.
-- Cannot be purchased or requested — nomination only.
-- Conditional — negative employer feedback triggers review.
-- ============================================================================

-- TalentVisa Nominations (mentor-initiated)
CREATE TABLE IF NOT EXISTS talentvisa_nominations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    nominating_mentor_id UUID NOT NULL REFERENCES mentor_profiles(id) ON DELETE CASCADE,

    -- Nomination details
    justification TEXT NOT NULL,
    recommended_tier visa_tier NOT NULL,
    supporting_evidence JSONB DEFAULT '[]',

    -- Review status
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'withdrawn'
    reviewed_by UUID REFERENCES users(id), -- Committee member
    reviewed_at TIMESTAMP WITH TIME ZONE,
    review_notes TEXT,

    -- Tracking mentor nomination limits
    -- Business Rule: Mentors limited to 3 nominations per quarter
    nomination_quarter TEXT NOT NULL, -- 'Q1_2026', 'Q2_2026', etc.

    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- TalentVisa Credentials (issued after committee approval)
CREATE TABLE IF NOT EXISTS talent_visas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    nomination_id UUID NOT NULL REFERENCES talentvisa_nominations(id) ON DELETE CASCADE,
    skill_passport_id UUID NOT NULL REFERENCES skill_passports(id) ON DELETE CASCADE,

    -- Visa details
    tier visa_tier NOT NULL,
    issued_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '18 months'),

    -- Status (conditional)
    status TEXT NOT NULL DEFAULT 'active', -- 'active', 'under_review', 'suspended', 'expired'

    -- Conditional review triggers
    negative_feedback_count INTEGER DEFAULT 0,
    last_review_at TIMESTAMP WITH TIME ZONE,
    review_reason TEXT,

    -- Enhanced verification
    verification_code TEXT DEFAULT encode(gen_random_bytes(20), 'hex'),

    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    UNIQUE(candidate_id, nomination_id)
);

-- TalentVisa Rarity Control (system table)
-- Business Rule: Capped at <5% of Skill Passport holders
CREATE TABLE IF NOT EXISTS talentvisa_rarity_control (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Snapshot date
    snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,

    -- Counts
    total_skill_passport_holders INTEGER NOT NULL,
    total_active_talent_visas INTEGER NOT NULL,
    current_percentage NUMERIC(5,2) NOT NULL,

    -- Threshold
    max_percentage NUMERIC(5,2) DEFAULT 5.00,
    is_at_capacity BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    UNIQUE(snapshot_date)
);

-- ============================================================================
-- SECTION 7: T3X TALENT EXCHANGE & FEEDBACK LOOPS
-- Business Rule: Only Skill Passport holders appear — no exceptions.
-- 30/60/90-day feedback is mandatory for employers.
-- ============================================================================

-- T3X Candidate Listings (auto-generated from Skill Passport)
CREATE TABLE IF NOT EXISTS t3x_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    skill_passport_id UUID NOT NULL REFERENCES skill_passports(id) ON DELETE CASCADE,

    -- Optional TalentVisa (premium listing)
    talent_visa_id UUID REFERENCES talent_visas(id),

    -- Listing data (mirrors Skill Passport)
    listing_data JSONB NOT NULL DEFAULT '{}',
    behavioral_scores JSONB DEFAULT '{}',
    readiness_tier readiness_tier,

    -- Visibility
    is_visible BOOLEAN DEFAULT TRUE,
    visibility_settings JSONB DEFAULT '{}', -- preferred industries, locations, etc.

    -- Activity tracking
    view_count INTEGER DEFAULT 0,
    connection_request_count INTEGER DEFAULT 0,
    last_viewed_at TIMESTAMP WITH TIME ZONE,

    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    UNIQUE(candidate_id, skill_passport_id)
);

-- Employer Profiles (verified businesses)
-- Business Rule: Employers must be verified businesses
CREATE TABLE IF NOT EXISTS employer_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Company info
    company_name TEXT NOT NULL,
    company_website TEXT,
    company_size TEXT, -- 'startup', 'small', 'medium', 'large', 'enterprise'
    industry TEXT NOT NULL,
    location JSONB,

    -- Verification
    is_verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP WITH TIME ZONE,
    verification_documents JSONB DEFAULT '[]',

    -- Subscription tier
    subscription_tier TEXT DEFAULT 'standard', -- 'standard', 'premium'
    -- Premium = access to TalentVisa candidates + advanced filtering

    -- Activity
    total_hires INTEGER DEFAULT 0,
    feedback_submission_rate NUMERIC(5,2) DEFAULT 100.00,

    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    UNIQUE(user_id)
);

-- Connection Requests (employer → candidate)
CREATE TABLE IF NOT EXISTS t3x_connection_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employer_id UUID NOT NULL REFERENCES employer_profiles(id) ON DELETE CASCADE,
    listing_id UUID NOT NULL REFERENCES t3x_listings(id) ON DELETE CASCADE,
    candidate_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Request details
    message TEXT,
    job_id UUID REFERENCES job_postings(id),

    -- Status
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'accepted', 'declined', 'expired'
    responded_at TIMESTAMP WITH TIME ZONE,

    -- Business Rule: Connection requests expire after 14 days
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '14 days'),

    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    UNIQUE(employer_id, listing_id)
);

-- Hiring Outcomes (tracks hired status + 30/60/90 feedback)
CREATE TABLE IF NOT EXISTS hiring_outcomes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    employer_id UUID NOT NULL REFERENCES employer_profiles(id) ON DELETE CASCADE,
    job_id UUID REFERENCES job_postings(id),
    connection_id UUID REFERENCES t3x_connection_requests(id),

    -- Hiring status
    status TEXT NOT NULL DEFAULT 'hired', -- 'hired', 'rejected', 'withdrawn'
    hired_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- 30/60/90 Day Feedback (MANDATORY for employers)
    -- Business Rule: 30/60/90-day feedback is mandatory for employers
    feedback_30_day JSONB, -- {submitted_at, performance_score, cultural_fit, feedback_text}
    feedback_30_day_due TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),

    feedback_60_day JSONB,
    feedback_60_day_due TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '60 days'),

    feedback_90_day JSONB,
    feedback_90_day_due TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '90 days'),

    -- Aggregate feedback score
    overall_feedback_score NUMERIC(5,2),

    -- Employment duration tracking
    employment_ended_at TIMESTAMP WITH TIME ZONE,
    employment_end_reason TEXT,

    -- Feeds Framework learning
    framework_processed BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Rejection Tracking (dignity safeguards)
-- Business Rule: Candidates with >3 rejections trigger review pathway
-- No permanent failure labels. No public rejection status.
CREATE TABLE IF NOT EXISTS rejection_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    employer_id UUID NOT NULL REFERENCES employer_profiles(id) ON DELETE CASCADE,
    job_id UUID REFERENCES job_postings(id),

    -- Rejection details (NOT visible to employers)
    rejection_stage TEXT NOT NULL, -- 'application', 'interview', 'offer'
    rejection_reason TEXT, -- Internal only

    -- Threshold tracking
    rejection_number INTEGER NOT NULL,
    threshold_exceeded BOOLEAN DEFAULT FALSE,

    -- If threshold exceeded, trigger mentor review
    mentor_review_triggered BOOLEAN DEFAULT FALSE,
    mentor_review_id UUID REFERENCES mentor_endorsements(id),

    -- Business Rule: Candidates exceeding limits exit credentialing path
    -- Data retained for optional re-entry later
    exited_credentialing_path BOOLEAN DEFAULT FALSE,
    exit_handled_with_dignity BOOLEAN DEFAULT TRUE, -- Always TRUE by design

    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- SECTION 8: BRIDGEFAST TRAINING MODULES
-- Business Rule: Credentialing-path candidates access only via mentor referral.
-- Maximum 2 BridgeFast loops per candidate.
-- ============================================================================

-- BridgeFast Module Library
CREATE TABLE IF NOT EXISTS bridgefast_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Module details
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL, -- 'communication', 'collaboration', 'problem_solving', 'adaptability', 'leadership'
    difficulty_level TEXT DEFAULT 'intermediate',

    -- Content
    estimated_duration_hours NUMERIC(4,1) NOT NULL, -- 2-4 hours typical
    content_type TEXT DEFAULT 'mixed', -- 'video', 'interactive', 'scenario', 'mixed'
    content_data JSONB DEFAULT '{}',

    -- Assessment
    has_final_assessment BOOLEAN DEFAULT TRUE,
    passing_score INTEGER DEFAULT 70,

    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    version TEXT DEFAULT '1.0',

    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- BridgeFast Enrollments (mentor-directed only for credentialing path)
CREATE TABLE IF NOT EXISTS bridgefast_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    module_id UUID NOT NULL REFERENCES bridgefast_modules(id) ON DELETE CASCADE,

    -- How they got here
    enrollment_type TEXT NOT NULL, -- 'mentor_referral', 'employer_provided', 'self_enrolled'
    referring_endorsement_id UUID REFERENCES mentor_endorsements(id),

    -- For credentialing path: which redirect loop is this?
    redirect_loop_number INTEGER, -- 1 or 2 max

    -- Progress
    status TEXT NOT NULL DEFAULT 'enrolled', -- 'enrolled', 'in_progress', 'completed', 'expired'
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,

    -- Assessment
    final_score INTEGER,
    passed BOOLEAN,

    -- Business Rule: Completion deadline is 14 days — extensions require mentor approval
    deadline TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '14 days'),
    extension_granted BOOLEAN DEFAULT FALSE,
    extension_granted_by UUID REFERENCES mentor_profiles(id),

    -- Feeds Growth Log
    growth_log_synced BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    UNIQUE(user_id, module_id, redirect_loop_number)
);

-- ============================================================================
-- SECTION 9: INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_resume_analysis_user_id ON resume_analysis(user_id);
CREATE INDEX IF NOT EXISTS idx_basic_profiles_user_id ON basic_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_basic_profiles_entry_point ON basic_profiles(entry_point);

CREATE INDEX IF NOT EXISTS idx_liveworks_projects_status ON liveworks_projects(status);
CREATE INDEX IF NOT EXISTS idx_liveworks_projects_category ON liveworks_projects(category);
CREATE INDEX IF NOT EXISTS idx_liveworks_assignments_project_id ON liveworks_assignments(project_id);
CREATE INDEX IF NOT EXISTS idx_liveworks_assignments_candidate_id ON liveworks_assignments(candidate_id);
CREATE INDEX IF NOT EXISTS idx_liveworks_assignments_status ON liveworks_assignments(status);

CREATE INDEX IF NOT EXISTS idx_civic_institutions_type ON civic_institutions(institution_type);
CREATE INDEX IF NOT EXISTS idx_civic_students_institution ON civic_students(institution_id);
CREATE INDEX IF NOT EXISTS idx_civic_students_user ON civic_students(user_id);
CREATE INDEX IF NOT EXISTS idx_civic_activities_student ON civic_activities(student_id);

CREATE INDEX IF NOT EXISTS idx_skill_passports_endorsement ON skill_passports(mentor_endorsement_id);
CREATE INDEX IF NOT EXISTS idx_skill_passports_status ON skill_passports(status);

CREATE INDEX IF NOT EXISTS idx_talentvisa_nominations_candidate ON talentvisa_nominations(candidate_id);
CREATE INDEX IF NOT EXISTS idx_talentvisa_nominations_mentor ON talentvisa_nominations(nominating_mentor_id);
CREATE INDEX IF NOT EXISTS idx_talentvisa_nominations_status ON talentvisa_nominations(status);
CREATE INDEX IF NOT EXISTS idx_talent_visas_candidate ON talent_visas(candidate_id);
CREATE INDEX IF NOT EXISTS idx_talent_visas_status ON talent_visas(status);

CREATE INDEX IF NOT EXISTS idx_t3x_listings_candidate ON t3x_listings(candidate_id);
CREATE INDEX IF NOT EXISTS idx_t3x_listings_visible ON t3x_listings(is_visible);
CREATE INDEX IF NOT EXISTS idx_employer_profiles_user ON employer_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_employer_profiles_verified ON employer_profiles(is_verified);

CREATE INDEX IF NOT EXISTS idx_t3x_connections_employer ON t3x_connection_requests(employer_id);
CREATE INDEX IF NOT EXISTS idx_t3x_connections_candidate ON t3x_connection_requests(candidate_id);
CREATE INDEX IF NOT EXISTS idx_t3x_connections_status ON t3x_connection_requests(status);

CREATE INDEX IF NOT EXISTS idx_hiring_outcomes_candidate ON hiring_outcomes(candidate_id);
CREATE INDEX IF NOT EXISTS idx_hiring_outcomes_employer ON hiring_outcomes(employer_id);
CREATE INDEX IF NOT EXISTS idx_rejection_tracking_candidate ON rejection_tracking(candidate_id);

CREATE INDEX IF NOT EXISTS idx_bridgefast_modules_category ON bridgefast_modules(category);
CREATE INDEX IF NOT EXISTS idx_bridgefast_modules_active ON bridgefast_modules(is_active);
CREATE INDEX IF NOT EXISTS idx_bridgefast_enrollments_user ON bridgefast_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_bridgefast_enrollments_status ON bridgefast_enrollments(status);

-- ============================================================================
-- SECTION 10: HELPER FUNCTIONS
-- ============================================================================

-- Function to check if candidate can receive Skill Passport
-- Business Rule: MANDATORY mentor endorsement with 'proceed' decision
CREATE OR REPLACE FUNCTION can_issue_skill_passport(p_candidate_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_has_proceed BOOLEAN;
BEGIN
    SELECT EXISTS(
        SELECT 1 FROM mentor_endorsements
        WHERE candidate_id = p_candidate_id
        AND decision = 'proceed'
        AND is_current = TRUE
        AND valid_until > NOW()
    ) INTO v_has_proceed;

    RETURN v_has_proceed;
END;
$$ LANGUAGE plpgsql;

-- Function to check TalentVisa eligibility (rarity control)
CREATE OR REPLACE FUNCTION check_talentvisa_availability()
RETURNS BOOLEAN AS $$
DECLARE
    v_total_passports INTEGER;
    v_total_visas INTEGER;
    v_percentage NUMERIC;
BEGIN
    SELECT COUNT(*) INTO v_total_passports
    FROM skill_passports WHERE status = 'active';

    SELECT COUNT(*) INTO v_total_visas
    FROM talent_visas WHERE status = 'active';

    IF v_total_passports = 0 THEN
        RETURN TRUE;
    END IF;

    v_percentage := (v_total_visas::NUMERIC / v_total_passports::NUMERIC) * 100;

    -- Business Rule: Capped at <5% of Skill Passport holders
    RETURN v_percentage < 5.00;
END;
$$ LANGUAGE plpgsql;

-- Function to get candidate rejection count
CREATE OR REPLACE FUNCTION get_candidate_rejection_count(p_candidate_id UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)::INTEGER
        FROM rejection_tracking
        WHERE candidate_id = p_candidate_id
    );
END;
$$ LANGUAGE plpgsql;

-- Function to check if candidate should exit credentialing path
-- Business Rule: Candidates with >3 rejections trigger review pathway
CREATE OR REPLACE FUNCTION check_rejection_threshold(p_candidate_id UUID)
RETURNS TABLE(
    below_threshold BOOLEAN,
    rejection_count INTEGER,
    needs_mentor_review BOOLEAN
) AS $$
DECLARE
    v_count INTEGER;
BEGIN
    v_count := get_candidate_rejection_count(p_candidate_id);

    RETURN QUERY SELECT
        v_count <= 3 AS below_threshold,
        v_count AS rejection_count,
        v_count > 3 AS needs_mentor_review;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update TalentVisa status on negative feedback
CREATE OR REPLACE FUNCTION check_talentvisa_on_feedback()
RETURNS TRIGGER AS $$
DECLARE
    v_feedback_score NUMERIC;
BEGIN
    -- Calculate overall feedback score
    v_feedback_score := (
        COALESCE((NEW.feedback_30_day->>'performance_score')::NUMERIC, 0) +
        COALESCE((NEW.feedback_60_day->>'performance_score')::NUMERIC, 0) +
        COALESCE((NEW.feedback_90_day->>'performance_score')::NUMERIC, 0)
    ) / NULLIF(
        (CASE WHEN NEW.feedback_30_day IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN NEW.feedback_60_day IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN NEW.feedback_90_day IS NOT NULL THEN 1 ELSE 0 END), 0
    );

    UPDATE hiring_outcomes
    SET overall_feedback_score = v_feedback_score,
        updated_at = NOW()
    WHERE id = NEW.id;

    -- If score is low, flag TalentVisa for review
    IF v_feedback_score IS NOT NULL AND v_feedback_score < 60 THEN
        UPDATE talent_visas
        SET
            negative_feedback_count = negative_feedback_count + 1,
            status = CASE WHEN negative_feedback_count >= 2 THEN 'under_review' ELSE status END,
            last_review_at = NOW(),
            review_reason = 'Low employer feedback score: ' || v_feedback_score::TEXT,
            updated_at = NOW()
        WHERE candidate_id = NEW.candidate_id AND status = 'active';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_talentvisa_feedback ON hiring_outcomes;
CREATE TRIGGER trg_check_talentvisa_feedback
    AFTER UPDATE ON hiring_outcomes
    FOR EACH ROW
    WHEN (
        NEW.feedback_30_day IS DISTINCT FROM OLD.feedback_30_day OR
        NEW.feedback_60_day IS DISTINCT FROM OLD.feedback_60_day OR
        NEW.feedback_90_day IS DISTINCT FROM OLD.feedback_90_day
    )
    EXECUTE FUNCTION check_talentvisa_on_feedback();

-- Comments for documentation
COMMENT ON TABLE resume_analysis IS 'Resume Enhancer: Parses resumes and identifies observation areas for mentors (MENTOR-ONLY visibility)';
COMMENT ON TABLE basic_profiles IS 'Basic Profile: Non-credentialed entry snapshot. NOT visible to employers.';
COMMENT ON TABLE liveworks_projects IS 'LiveWorks Studio: Project marketplace with mentor supervision requirement';
COMMENT ON TABLE civic_institutions IS 'Civic Access Lab: Institutional track (SEPARATE from credentialing path)';
COMMENT ON TABLE talent_visas IS 'TalentVisa: Late-stage, conditional, rare credential (<5% cap)';
COMMENT ON TABLE t3x_listings IS 'T3X Talent Exchange: Skill Passport holders only, no exceptions';
COMMENT ON TABLE hiring_outcomes IS 'T3X Feedback: 30/60/90 day mandatory employer feedback';
COMMENT ON TABLE bridgefast_modules IS 'BridgeFast: Training modules (max 2 loops per candidate)';
