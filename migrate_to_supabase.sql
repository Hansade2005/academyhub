-- Supabase Migration SQL for The 3rd Academy
-- This script migrates from PiPilot DB to Supabase
-- Run this in your Supabase SQL editor or via psql

-- Enable Row Level Security (RLS) for all tables
-- This ensures proper security for production

-- 1. Create users table (auth users will be handled by Supabase Auth)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create posts table
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  post_id UUID,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Create skill_passports table
CREATE TABLE IF NOT EXISTS skill_passports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content JSONB NOT NULL,
  confidence_score NUMERIC(5,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Create progress_tracking table
CREATE TABLE IF NOT EXISTS progress_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  skill TEXT NOT NULL,
  level TEXT NOT NULL,
  score NUMERIC(5,2) NOT NULL,
  date TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Create analytics table
CREATE TABLE IF NOT EXISTS analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Create simulations table
CREATE TABLE IF NOT EXISTS simulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  simulation_type TEXT NOT NULL,
  results JSONB NOT NULL,
  score NUMERIC(5,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Create mentor_feedback table
CREATE TABLE IF NOT EXISTS mentor_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  mentor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  feedback TEXT NOT NULL,
  rating NUMERIC(3,1) NOT NULL,
  date TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Create job_postings table
CREATE TABLE IF NOT EXISTS job_postings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements JSONB NOT NULL,
  location TEXT,
  salary_range TEXT,
  employment_type TEXT,
  status TEXT DEFAULT 'open' NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Create applications table
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  job_id UUID,
  status TEXT DEFAULT 'pending' NOT NULL,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  cover_letter TEXT
);

-- 11. Create portfolios table
CREATE TABLE IF NOT EXISTS portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  links JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT,
  category TEXT,
  technologies TEXT[]
);

-- 12. Create credentials table
CREATE TABLE IF NOT EXISTS credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  data JSONB NOT NULL,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- 13. Create files table
CREATE TABLE IF NOT EXISTS files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  contract_value NUMERIC(12,2),
  status TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. Create user_analytics_profiles table
CREATE TABLE IF NOT EXISTS user_analytics_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  demographics JSONB,
  professional_background JSONB,
  career_goals JSONB,
  learning_preferences JSONB,
  discovery_source TEXT,
  marketing_consent BOOLEAN,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 16. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_skill_passports_user_id ON skill_passports(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_tracking_user_id ON progress_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_simulations_user_id ON simulations(user_id);
CREATE INDEX IF NOT EXISTS idx_mentor_feedback_user_id ON mentor_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_mentor_feedback_mentor_id ON mentor_feedback(mentor_id);
CREATE INDEX IF NOT EXISTS idx_job_postings_employer_id ON job_postings(employer_id);
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_job_id ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_portfolios_user_id ON portfolios(user_id);
CREATE INDEX IF NOT EXISTS idx_credentials_user_id ON credentials(user_id);
CREATE INDEX IF NOT EXISTS idx_files_user_id ON files(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_user_analytics_profiles_user_id ON user_analytics_profiles(user_id);

-- 17. Enable Row Level Security on all tables
-- This ensures proper security for production
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_passports ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentor_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_analytics_profiles ENABLE ROW LEVEL SECURITY;

-- 18. Create RLS policies for each table
-- Users table policy
CREATE POLICY "Users can view their own data"
ON users
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own data"
ON users
FOR UPDATE
USING (auth.uid() = id);

-- Posts table policies
CREATE POLICY "Users can create posts"
ON posts
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view posts"
ON posts
FOR SELECT
USING (true); -- Public read

CREATE POLICY "Users can update their own posts"
ON posts
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts"
ON posts
FOR DELETE
USING (auth.uid() = user_id);

-- Skill passports policies
CREATE POLICY "Users can create skill passports"
ON skill_passports
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own skill passports"
ON skill_passports
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own skill passports"
ON skill_passports
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own skill passports"
ON skill_passports
FOR DELETE
USING (auth.uid() = user_id);

-- Progress tracking policies
CREATE POLICY "Users can create progress entries"
ON progress_tracking
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own progress"
ON progress_tracking
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
ON progress_tracking
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own progress"
ON progress_tracking
FOR DELETE
USING (auth.uid() = user_id);

-- Simulations policies
CREATE POLICY "Users can create simulations"
ON simulations
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own simulations"
ON simulations
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own simulations"
ON simulations
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own simulations"
ON simulations
FOR DELETE
USING (auth.uid() = user_id);

-- Job postings policies
CREATE POLICY "Users can create job postings"
ON job_postings
FOR INSERT
WITH CHECK (auth.uid() = employer_id);

CREATE POLICY "Users can view job postings"
ON job_postings
FOR SELECT
USING (true); -- Public read

CREATE POLICY "Employers can update their own job postings"
ON job_postings
FOR UPDATE
USING (auth.uid() = employer_id);

CREATE POLICY "Employers can delete their own job postings"
ON job_postings
FOR DELETE
USING (auth.uid() = employer_id);

-- Applications policies
CREATE POLICY "Users can create applications"
ON applications
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own applications"
ON applications
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Employers can view applications for their jobs"
ON applications
FOR SELECT
USING (EXISTS (SELECT 1 FROM job_postings WHERE id = applications.job_id AND employer_id = auth.uid()));

CREATE POLICY "Users can update their own applications"
ON applications
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own applications"
ON applications
FOR DELETE
USING (auth.uid() = user_id);

-- Portfolios policies
CREATE POLICY "Users can create portfolios"
ON portfolios
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view portfolios"
ON portfolios
FOR SELECT
USING (true); -- Public read for portfolios

CREATE POLICY "Users can update their own portfolios"
ON portfolios
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own portfolios"
ON portfolios
FOR DELETE
USING (auth.uid() = user_id);

-- Files policies
CREATE POLICY "Users can upload files"
ON files
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own files"
ON files
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own files"
ON files
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own files"
ON files
FOR DELETE
USING (auth.uid() = user_id);

-- Projects policies
CREATE POLICY "Users can create projects"
ON projects
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own projects"
ON projects
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects"
ON projects
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects"
ON projects
FOR DELETE
USING (auth.uid() = user_id);

-- User analytics profiles policies
CREATE POLICY "Users can create analytics profiles"
ON user_analytics_profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own analytics profiles"
ON user_analytics_profiles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own analytics profiles"
ON user_analytics_profiles
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own analytics profiles"
ON user_analytics_profiles
FOR DELETE
USING (auth.uid() = user_id);

-- Analytics table (special policy - only admins can view all)
CREATE POLICY "Users can create analytics events"
ON analytics
FOR INSERT
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can view their own analytics"
ON analytics
FOR SELECT
USING (auth.uid() = user_id OR user_id IS NULL);

-- Mentor feedback policies
CREATE POLICY "Mentors can create feedback"
ON mentor_feedback
FOR INSERT
WITH CHECK (auth.uid() = mentor_id);

CREATE POLICY "Users can view their own feedback"
ON mentor_feedback
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Mentors can view their own feedback"
ON mentor_feedback
FOR SELECT
USING (auth.uid() = mentor_id);

CREATE POLICY "Users can update their own feedback"
ON mentor_feedback
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Mentors can update their own feedback"
ON mentor_feedback
FOR UPDATE
USING (auth.uid() = mentor_id);

CREATE POLICY "Users can delete their own feedback"
ON mentor_feedback
FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Mentors can delete their own feedback"
ON mentor_feedback
FOR DELETE
USING (auth.uid() = mentor_id);

-- Comments policies
CREATE POLICY "Users can create comments"
ON comments
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view comments"
ON comments
FOR SELECT
USING (true); -- Public read

CREATE POLICY "Users can update their own comments"
ON comments
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
ON comments
FOR DELETE
USING (auth.uid() = user_id);

-- Credentials policies
CREATE POLICY "Users can create credentials"
ON credentials
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own credentials"
ON credentials
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own credentials"
ON credentials
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own credentials"
ON credentials
FOR DELETE
USING (auth.uid() = user_id);

-- Migration complete!
-- Next steps:
-- 1. Run this SQL in your Supabase dashboard
-- 2. Update your application to use Supabase client instead of PiPilot SDK
-- 3. Migrate existing data from PiPilot to Supabase using a data migration script
