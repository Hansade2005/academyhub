# Supabase PostgreSQL Migration Guide

This guide provides the SQL scripts needed to migrate from PiPilot DB to Supabase PostgreSQL.

## Overview

The migration involves creating tables that match the structure used in the PiPilot DB integration, with appropriate PostgreSQL types and constraints.

## SQL Migration Script

Run this script in your Supabase SQL editor or via the Supabase CLI:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table (matches PiPilot DB users table)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  post_id UUID,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Skill Passports table
CREATE TABLE IF NOT EXISTS skill_passports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content JSONB NOT NULL,
  confidence_score INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Progress Tracking table
CREATE TABLE IF NOT EXISTS progress_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  skill TEXT NOT NULL,
  level TEXT NOT NULL,
  score INTEGER NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Analytics table
CREATE TABLE IF NOT EXISTS analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Simulations table
CREATE TABLE IF NOT EXISTS simulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  simulation_type TEXT NOT NULL,
  results JSONB NOT NULL,
  score INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Mentor Feedback table
CREATE TABLE IF NOT EXISTS mentor_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  mentor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  feedback TEXT NOT NULL,
  rating INTEGER NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Job Postings table
CREATE TABLE IF NOT EXISTS job_postings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Applications table
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  job_id UUID,
  status TEXT NOT NULL DEFAULT 'pending',
  applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  cover_letter TEXT
);

-- Portfolios table
CREATE TABLE IF NOT EXISTS portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  links JSONB,
  status TEXT NOT NULL DEFAULT 'draft',
  category TEXT,
  technologies TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Credentials table
CREATE TABLE IF NOT EXISTS credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  data JSONB NOT NULL,
  issued_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Files table
CREATE TABLE IF NOT EXISTS files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  contract_value NUMERIC,
  status TEXT NOT NULL DEFAULT 'planned',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- User Analytics Profiles table
CREATE TABLE IF NOT EXISTS user_analytics_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  demographics JSONB NOT NULL,
  professional_background JSONB NOT NULL,
  career_goals JSONB NOT NULL,
  learning_preferences JSONB NOT NULL,
  discovery_source TEXT,
  marketing_consent BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_skill_passports_user_id ON skill_passports(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_tracking_user_id ON progress_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_simulations_user_id ON simulations(user_id);
CREATE INDEX IF NOT EXISTS idx_mentor_feedback_user_id ON mentor_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_job_postings_employer_id ON job_postings(employer_id);
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_job_id ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_portfolios_user_id ON portfolios(user_id);
CREATE INDEX IF NOT EXISTS idx_credentials_user_id ON credentials(user_id);
CREATE INDEX IF NOT EXISTS idx_files_user_id ON files(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_user_analytics_profiles_user_id ON user_analytics_profiles(user_id);

-- Enable Row-Level Security (RLS) for all tables
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', r.tablename);
  END LOOP;
END $$;

-- Create policies for each table
-- Users table policies
CREATE POLICY "Users can view their own data"
  ON users
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own data"
  ON users
  FOR UPDATE
  USING (auth.uid() = id);

-- Skill Passports policies
CREATE POLICY "Users can view their own skill passports"
  ON skill_passports
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create skill passports"
  ON skill_passports
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own skill passports"
  ON skill_passports
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Progress Tracking policies
CREATE POLICY "Users can view their own progress"
  ON progress_tracking
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create progress entries"
  ON progress_tracking
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Analytics policies
CREATE POLICY "Users can view their own analytics"
  ON analytics
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create analytics events"
  ON analytics
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Simulations policies
CREATE POLICY "Users can view their own simulations"
  ON simulations
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create simulations"
  ON simulations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Mentor Feedback policies
CREATE POLICY "Users can view their own mentor feedback"
  ON mentor_feedback
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create mentor feedback"
  ON mentor_feedback
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Job Postings policies
CREATE POLICY "Users can view job postings"
  ON job_postings
  FOR SELECT;

CREATE POLICY "Employers can create job postings"
  ON job_postings
  FOR INSERT
  WITH CHECK (auth.uid() = employer_id);

CREATE POLICY "Employers can update their own job postings"
  ON job_postings
  FOR UPDATE
  USING (auth.uid() = employer_id);

-- Applications policies
CREATE POLICY "Users can view their own applications"
  ON applications
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create applications"
  ON applications
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Portfolios policies
CREATE POLICY "Users can view their own portfolios"
  ON portfolios
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create portfolios"
  ON portfolios
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own portfolios"
  ON portfolios
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Credentials policies
CREATE POLICY "Users can view their own credentials"
  ON credentials
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create credentials"
  ON credentials
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Files policies
CREATE POLICY "Users can view their own files"
  ON files
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create files"
  ON files
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Projects policies
CREATE POLICY "Users can view their own projects"
  ON projects
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create projects"
  ON projects
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects"
  ON projects
  FOR UPDATE
  USING (auth.uid() = user_id);

-- User Analytics Profiles policies
CREATE POLICY "Users can view their own analytics profile"
  ON user_analytics_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create analytics profile"
  ON user_analytics_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own analytics profile"
  ON user_analytics_profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Comments policies
CREATE POLICY "Users can view comments"
  ON comments
  FOR SELECT;

CREATE POLICY "Users can create comments"
  ON comments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Posts policies
CREATE POLICY "Users can view posts"
  ON posts
  FOR SELECT;

CREATE POLICY "Users can create posts"
  ON posts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create a default admin user (optional)
-- INSERT INTO users (id, email, password_hash, full_name, created_at, updated_at)
-- VALUES (gen_random_uuid(), 'admin@example.com', crypt('adminpassword', gen_salt('bf')), 'Admin User', NOW(), NOW());

-- Migration complete
