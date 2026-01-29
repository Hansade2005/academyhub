-- ============================================================================
-- THE 3RD ACADEMY - FOUNDATION SCHEMA MIGRATION
-- Phase 1: Foundation (MentorLink, Framework & Licensing, Growth Log)
--
-- CRITICAL: This migration implements the core T3A architecture per the
-- Developer Guidelines. The data moats (mentor decision patterns + behavioral
-- fingerprints) MUST be captured from Day 1.
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- SECTION 1: USER ROLES & PERMISSIONS
-- Business Rule: No single actor ever holds authority, judgment, and outcome
-- control at the same time.
-- ============================================================================

-- Create user role enum
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('candidate', 'mentor', 'employer', 'institution', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create endorsement decision enum
DO $$ BEGIN
    CREATE TYPE endorsement_decision AS ENUM ('proceed', 'redirect', 'pause');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create redirect type enum
DO $$ BEGIN
    CREATE TYPE redirect_type AS ENUM ('bridgefast', 'liveworks');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create talent visa tier enum
DO $$ BEGIN
    CREATE TYPE visa_tier AS ENUM ('silver', 'gold', 'platinum');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create readiness tier enum
DO $$ BEGIN
    CREATE TYPE readiness_tier AS ENUM ('tier_1', 'tier_2', 'tier_3');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add role column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'candidate';
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT FALSE;

-- Create index on user role for efficient filtering
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ============================================================================
-- SECTION 2: MENTORLINK - THE MANDATORY GATE
-- Business Rule: MANDATORY — no candidate can earn Skill Passport without
-- passing through MentorLink. No bypass allowed.
-- ============================================================================

-- Mentor profiles (extends users with mentor-specific data)
CREATE TABLE IF NOT EXISTS mentor_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Professional info
    industry TEXT NOT NULL,
    expertise_areas TEXT[] NOT NULL DEFAULT '{}',
    years_experience INTEGER NOT NULL DEFAULT 0,
    company TEXT,
    job_title TEXT,
    bio TEXT,

    -- Mentor capacity & status
    is_active BOOLEAN DEFAULT TRUE,
    max_mentees INTEGER DEFAULT 5,
    current_mentee_count INTEGER DEFAULT 0,

    -- Quality metrics (updated by Framework)
    quality_score NUMERIC(5,2) DEFAULT 50.00,
    total_endorsements INTEGER DEFAULT 0,
    successful_placements INTEGER DEFAULT 0,

    -- Nomination limits (max 3 TalentVisa nominations per quarter)
    quarterly_nominations_used INTEGER DEFAULT 0,
    quarterly_nominations_reset_at TIMESTAMP WITH TIME ZONE,

    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    UNIQUE(user_id)
);

-- Mentor-Candidate Assignments (system assigns, no self-selection)
-- Business Rule: Candidates cannot choose or request specific mentors
CREATE TABLE IF NOT EXISTS mentor_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mentor_id UUID NOT NULL REFERENCES mentor_profiles(id) ON DELETE CASCADE,
    candidate_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Assignment metadata
    assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    assignment_reason TEXT, -- e.g., "industry_match", "expertise_match"

    -- Status tracking
    status TEXT NOT NULL DEFAULT 'active', -- active, completed, transferred
    completed_at TIMESTAMP WITH TIME ZONE,

    -- Session tracking
    total_sessions INTEGER DEFAULT 0,
    last_session_at TIMESTAMP WITH TIME ZONE,

    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    -- Prevent duplicate assignments
    UNIQUE(mentor_id, candidate_id)
);

-- Mentor Endorsements (proceed / redirect / pause)
-- CRITICAL: Log every decision with timestamp for pattern tracking (Lock 1)
CREATE TABLE IF NOT EXISTS mentor_endorsements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES mentor_assignments(id) ON DELETE CASCADE,
    mentor_id UUID NOT NULL REFERENCES mentor_profiles(id) ON DELETE CASCADE,
    candidate_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- The decision (MANDATORY field)
    decision endorsement_decision NOT NULL,

    -- Decision context
    decision_context TEXT, -- Mentor's reasoning
    observation_notes TEXT, -- Structured observation notes
    behavioral_dimensions JSONB DEFAULT '{}', -- communication, collaboration, etc.

    -- Redirect details (if decision = 'redirect')
    redirect_to redirect_type,
    redirect_reason TEXT,
    redirect_gap_areas TEXT[], -- Specific gaps identified

    -- Timing (for pattern analysis)
    session_duration_minutes INTEGER,
    decision_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    -- Observation areas from Resume Enhancer (mentor focus points)
    observation_areas JSONB DEFAULT '{}',

    -- This endorsement is TIME-BOUND (contextual, reversible)
    -- Business Rule: Endorsements are contextual, reversible, time-bound
    valid_until TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '12 months'),
    is_current BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    -- Prevent editing after 48 hours
    -- Business Rule: Observations must be completed within 48 hours of session
    locked_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '48 hours')
);

-- Track redirect loops (max 2 per candidate)
-- Business Rule: Maximum 2 Redirect loops — 3rd redirect triggers escalation
CREATE TABLE IF NOT EXISTS redirect_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    endorsement_id UUID NOT NULL REFERENCES mentor_endorsements(id) ON DELETE CASCADE,
    redirect_type redirect_type NOT NULL,
    redirect_number INTEGER NOT NULL DEFAULT 1, -- 1 or 2 max

    -- Tracking
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    completion_status TEXT, -- 'completed', 'abandoned', 'timeout'

    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- SECTION 3: GROWTH LOG - PASSIVE BEHAVIORAL TRACKING
-- Business Rule: Passive, append-only tracking of ALL interactions.
-- Captures: clicks, time spent, completions, skips, behavioral patterns
-- ============================================================================

-- Growth Log Events (append-only, immutable)
-- Business Rule: System events are immutable — cannot be edited or deleted
CREATE TABLE IF NOT EXISTS growth_log_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Event categorization
    event_category TEXT NOT NULL, -- 'navigation', 'assessment', 'training', 'project', 'mentor', 'application'
    event_type TEXT NOT NULL, -- specific event within category
    event_source TEXT NOT NULL, -- 'resume_enhancer', 'mentorlink', 'bridgefast', 'liveworks', 'civic_lab', 't3x'

    -- Event data (flexible JSONB for different event types)
    event_data JSONB NOT NULL DEFAULT '{}',

    -- Behavioral metrics (captured passively)
    session_id UUID, -- Group events by session
    time_on_page_seconds INTEGER,
    scroll_depth_percent INTEGER,
    click_count INTEGER,

    -- Sequence tracking
    previous_event_id UUID REFERENCES growth_log_events(id),

    -- Timestamp (immutable)
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Session tracking for behavioral fingerprint
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Session metadata
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,

    -- Device/context info (for pattern analysis)
    device_type TEXT, -- 'desktop', 'mobile', 'tablet'
    browser TEXT,
    referrer TEXT,

    -- Session metrics
    total_events INTEGER DEFAULT 0,
    pages_viewed INTEGER DEFAULT 0,
    assessments_started INTEGER DEFAULT 0,
    assessments_completed INTEGER DEFAULT 0,

    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- SECTION 4: FRAMEWORK & LICENSING - THE DATA MOATS
-- CRITICAL: These tables capture the compounding advantage that grows with
-- every candidate interaction. A competitor cannot replicate years of
-- judgment-outcome correlations.
-- ============================================================================

-- LOCK 1: Mentor Decision Patterns
-- What the System Learns: mentor quality scoring, decision calibration,
-- pattern recognition, predictive matching
CREATE TABLE IF NOT EXISTS mentor_decision_patterns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- The decision being tracked
    endorsement_id UUID NOT NULL REFERENCES mentor_endorsements(id) ON DELETE CASCADE,
    mentor_id UUID NOT NULL REFERENCES mentor_profiles(id) ON DELETE CASCADE,
    candidate_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Decision data
    decision endorsement_decision NOT NULL,
    decision_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,

    -- Subsequent outcome (updated when known)
    outcome TEXT, -- 'hired', 'rejected', 'exited', 'pending'
    outcome_timestamp TIMESTAMP WITH TIME ZONE,
    time_to_outcome_days INTEGER,

    -- Outcome details
    employer_feedback_score INTEGER, -- from 30/60/90 day feedback
    employment_duration_days INTEGER,

    -- Pattern features for ML (system learning)
    candidate_profile_snapshot JSONB DEFAULT '{}', -- anonymized at capture
    mentor_context_snapshot JSONB DEFAULT '{}',
    behavioral_indicators JSONB DEFAULT '{}',

    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- LOCK 2: Behavioral Fingerprint
-- What the System Learns: dropout prediction, high-potential identification,
-- gaming detection, engagement optimization
CREATE TABLE IF NOT EXISTS behavioral_fingerprints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Aggregated behavioral patterns (updated periodically)
    pattern_period TEXT NOT NULL, -- 'daily', 'weekly', 'monthly', 'lifetime'
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,

    -- Interaction patterns
    avg_session_duration_seconds NUMERIC(10,2),
    avg_time_between_sessions_hours NUMERIC(10,2),
    total_sessions INTEGER DEFAULT 0,

    -- Engagement patterns
    completion_rate NUMERIC(5,4), -- 0.0000 to 1.0000
    skip_rate NUMERIC(5,4),
    revision_rate NUMERIC(5,4), -- how often they revise/redo

    -- Response patterns
    avg_response_time_seconds NUMERIC(10,2),
    response_consistency_score NUMERIC(5,2), -- 0-100

    -- Gaming detection signals
    suspicious_pattern_flags JSONB DEFAULT '[]',
    gaming_risk_score NUMERIC(5,2) DEFAULT 0,

    -- Subsequent outcome (for correlation)
    eventual_outcome TEXT, -- 'hired', 'rejected', 'exited', 'pending'
    outcome_timestamp TIMESTAMP WITH TIME ZONE,

    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    -- Unique per user per period
    UNIQUE(user_id, pattern_period, period_start)
);

-- Framework Aggregate Learnings (system-level, never individual)
-- Business Rule: Framework & Licensing learns from aggregate outcomes,
-- improves system design, never intervenes in individual cases
CREATE TABLE IF NOT EXISTS framework_learnings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Learning category
    learning_type TEXT NOT NULL, -- 'mentor_calibration', 'gap_prediction', 'dropout_risk', 'success_pattern'

    -- Aggregate data (never individual)
    sample_size INTEGER NOT NULL,
    confidence_level NUMERIC(5,4), -- 0.0000 to 1.0000

    -- The learning
    pattern_description TEXT NOT NULL,
    pattern_data JSONB NOT NULL,

    -- Actionable insights (for system improvement)
    recommended_actions JSONB DEFAULT '[]',
    implemented_at TIMESTAMP WITH TIME ZONE,

    -- Validity
    valid_from TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    valid_until TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- SECTION 5: INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_mentor_profiles_user_id ON mentor_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_mentor_profiles_industry ON mentor_profiles(industry);
CREATE INDEX IF NOT EXISTS idx_mentor_profiles_is_active ON mentor_profiles(is_active);

CREATE INDEX IF NOT EXISTS idx_mentor_assignments_mentor_id ON mentor_assignments(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentor_assignments_candidate_id ON mentor_assignments(candidate_id);
CREATE INDEX IF NOT EXISTS idx_mentor_assignments_status ON mentor_assignments(status);

CREATE INDEX IF NOT EXISTS idx_mentor_endorsements_assignment_id ON mentor_endorsements(assignment_id);
CREATE INDEX IF NOT EXISTS idx_mentor_endorsements_mentor_id ON mentor_endorsements(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentor_endorsements_candidate_id ON mentor_endorsements(candidate_id);
CREATE INDEX IF NOT EXISTS idx_mentor_endorsements_decision ON mentor_endorsements(decision);
CREATE INDEX IF NOT EXISTS idx_mentor_endorsements_is_current ON mentor_endorsements(is_current);

CREATE INDEX IF NOT EXISTS idx_redirect_tracking_candidate_id ON redirect_tracking(candidate_id);

CREATE INDEX IF NOT EXISTS idx_growth_log_events_user_id ON growth_log_events(user_id);
CREATE INDEX IF NOT EXISTS idx_growth_log_events_category ON growth_log_events(event_category);
CREATE INDEX IF NOT EXISTS idx_growth_log_events_source ON growth_log_events(event_source);
CREATE INDEX IF NOT EXISTS idx_growth_log_events_session ON growth_log_events(session_id);
CREATE INDEX IF NOT EXISTS idx_growth_log_events_created_at ON growth_log_events(created_at);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);

CREATE INDEX IF NOT EXISTS idx_mentor_decision_patterns_mentor_id ON mentor_decision_patterns(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentor_decision_patterns_outcome ON mentor_decision_patterns(outcome);

CREATE INDEX IF NOT EXISTS idx_behavioral_fingerprints_user_id ON behavioral_fingerprints(user_id);
CREATE INDEX IF NOT EXISTS idx_behavioral_fingerprints_period ON behavioral_fingerprints(pattern_period);

CREATE INDEX IF NOT EXISTS idx_framework_learnings_type ON framework_learnings(learning_type);
CREATE INDEX IF NOT EXISTS idx_framework_learnings_active ON framework_learnings(is_active);

-- ============================================================================
-- SECTION 6: ROW LEVEL SECURITY POLICIES
-- Business Rule: No single actor ever holds authority, judgment, and outcome
-- control at the same time.
-- ============================================================================

-- Enable RLS on sensitive tables
ALTER TABLE mentor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentor_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentor_endorsements ENABLE ROW LEVEL SECURITY;
ALTER TABLE growth_log_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentor_decision_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE behavioral_fingerprints ENABLE ROW LEVEL SECURITY;

-- Policies will be added after authentication is properly configured
-- For now, we'll use service role for API access

-- ============================================================================
-- SECTION 7: HELPER FUNCTIONS
-- ============================================================================

-- Function to check redirect count for a candidate
CREATE OR REPLACE FUNCTION get_candidate_redirect_count(p_candidate_id UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)::INTEGER
        FROM redirect_tracking
        WHERE candidate_id = p_candidate_id
    );
END;
$$ LANGUAGE plpgsql;

-- Function to check if mentor can take more mentees
CREATE OR REPLACE FUNCTION can_mentor_accept_mentee(p_mentor_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_max_mentees INTEGER;
    v_current_count INTEGER;
BEGIN
    SELECT max_mentees, current_mentee_count
    INTO v_max_mentees, v_current_count
    FROM mentor_profiles
    WHERE id = p_mentor_id;

    RETURN v_current_count < v_max_mentees;
END;
$$ LANGUAGE plpgsql;

-- Function to get mentor's proceed success rate
CREATE OR REPLACE FUNCTION get_mentor_success_rate(p_mentor_id UUID)
RETURNS NUMERIC AS $$
DECLARE
    v_total_proceeds INTEGER;
    v_successful_hires INTEGER;
BEGIN
    SELECT
        COUNT(*) FILTER (WHERE decision = 'proceed'),
        COUNT(*) FILTER (WHERE decision = 'proceed' AND outcome = 'hired')
    INTO v_total_proceeds, v_successful_hires
    FROM mentor_decision_patterns
    WHERE mentor_id = p_mentor_id;

    IF v_total_proceeds = 0 THEN
        RETURN 50.00; -- Default for new mentors
    END IF;

    RETURN (v_successful_hires::NUMERIC / v_total_proceeds::NUMERIC) * 100;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update mentor quality score when patterns are updated
CREATE OR REPLACE FUNCTION update_mentor_quality_score()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE mentor_profiles
    SET
        quality_score = get_mentor_success_rate(NEW.mentor_id),
        updated_at = NOW()
    WHERE id = NEW.mentor_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_mentor_quality ON mentor_decision_patterns;
CREATE TRIGGER trg_update_mentor_quality
    AFTER INSERT OR UPDATE ON mentor_decision_patterns
    FOR EACH ROW
    WHEN (NEW.outcome IS NOT NULL)
    EXECUTE FUNCTION update_mentor_quality_score();

-- Trigger to increment mentor's mentee count on assignment
CREATE OR REPLACE FUNCTION update_mentor_mentee_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE mentor_profiles
        SET current_mentee_count = current_mentee_count + 1,
            updated_at = NOW()
        WHERE id = NEW.mentor_id;
    ELSIF TG_OP = 'UPDATE' AND OLD.status = 'active' AND NEW.status != 'active' THEN
        UPDATE mentor_profiles
        SET current_mentee_count = GREATEST(0, current_mentee_count - 1),
            updated_at = NOW()
        WHERE id = NEW.mentor_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_mentee_count ON mentor_assignments;
CREATE TRIGGER trg_update_mentee_count
    AFTER INSERT OR UPDATE ON mentor_assignments
    FOR EACH ROW
    EXECUTE FUNCTION update_mentor_mentee_count();

COMMENT ON TABLE mentor_profiles IS 'MentorLink: Human validation layer where experienced professionals observe candidates';
COMMENT ON TABLE mentor_assignments IS 'MentorLink: System-assigned mentor-candidate pairings (no self-selection)';
COMMENT ON TABLE mentor_endorsements IS 'MentorLink: Mentor decisions (proceed/redirect/pause) - MANDATORY for credential path';
COMMENT ON TABLE growth_log_events IS 'Growth Log: Passive, append-only behavioral tracking';
COMMENT ON TABLE mentor_decision_patterns IS 'Framework LOCK 1: Mentor decision patterns for system learning (DATA MOAT)';
COMMENT ON TABLE behavioral_fingerprints IS 'Framework LOCK 2: Behavioral fingerprints for system learning (DATA MOAT)';
