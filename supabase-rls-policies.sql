-- =====================================================
-- COMPREHENSIVE RLS POLICIES FOR ACADEMYHUB
-- Run this in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- AUTOMATIC USER PROFILE CREATION TRIGGER
-- This creates a profile in the users table when a new
-- auth user signs up. This is more reliable than client-side
-- inserts because triggers run with elevated privileges.
-- =====================================================

-- Create the function that will be called by the trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url, role, is_verified, profile_completed, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.raw_user_meta_data->>'avatar_url',
    'candidate',
    COALESCE(NEW.email_confirmed_at IS NOT NULL, false),
    false,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, users.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, users.avatar_url),
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- 1. USERS TABLE
-- =====================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

CREATE POLICY "Users can view own profile"
ON users FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
ON users FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- =====================================================
-- 2. SKILL_PASSPORTS TABLE
-- =====================================================
ALTER TABLE skill_passports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own skill passports" ON skill_passports;
DROP POLICY IF EXISTS "Users can insert own skill passports" ON skill_passports;
DROP POLICY IF EXISTS "Users can update own skill passports" ON skill_passports;
DROP POLICY IF EXISTS "Users can delete own skill passports" ON skill_passports;

CREATE POLICY "Users can view own skill passports"
ON skill_passports FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own skill passports"
ON skill_passports FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own skill passports"
ON skill_passports FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own skill passports"
ON skill_passports FOR DELETE
USING (auth.uid() = user_id);

-- =====================================================
-- 3. PROGRESS_TRACKING TABLE
-- =====================================================
ALTER TABLE progress_tracking ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own progress" ON progress_tracking;
DROP POLICY IF EXISTS "Users can insert own progress" ON progress_tracking;
DROP POLICY IF EXISTS "Users can update own progress" ON progress_tracking;
DROP POLICY IF EXISTS "Users can delete own progress" ON progress_tracking;

CREATE POLICY "Users can view own progress"
ON progress_tracking FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
ON progress_tracking FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
ON progress_tracking FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own progress"
ON progress_tracking FOR DELETE
USING (auth.uid() = user_id);

-- =====================================================
-- 4. ANALYTICS TABLE
-- =====================================================
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own analytics" ON analytics;
DROP POLICY IF EXISTS "Users can insert own analytics" ON analytics;
DROP POLICY IF EXISTS "Allow anonymous analytics" ON analytics;

CREATE POLICY "Users can view own analytics"
ON analytics FOR SELECT
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert own analytics"
ON analytics FOR INSERT
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Allow anonymous analytics events (user_id can be null)
CREATE POLICY "Allow anonymous analytics"
ON analytics FOR INSERT
WITH CHECK (user_id IS NULL);

-- =====================================================
-- 5. SIMULATIONS TABLE
-- =====================================================
ALTER TABLE simulations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own simulations" ON simulations;
DROP POLICY IF EXISTS "Users can insert own simulations" ON simulations;
DROP POLICY IF EXISTS "Users can update own simulations" ON simulations;
DROP POLICY IF EXISTS "Users can delete own simulations" ON simulations;

CREATE POLICY "Users can view own simulations"
ON simulations FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own simulations"
ON simulations FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own simulations"
ON simulations FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own simulations"
ON simulations FOR DELETE
USING (auth.uid() = user_id);

-- =====================================================
-- 6. JOB_POSTINGS TABLE
-- =====================================================
ALTER TABLE job_postings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view open job postings" ON job_postings;
DROP POLICY IF EXISTS "Employers can insert own job postings" ON job_postings;
DROP POLICY IF EXISTS "Employers can update own job postings" ON job_postings;
DROP POLICY IF EXISTS "Employers can delete own job postings" ON job_postings;

-- Anyone can view open job postings
CREATE POLICY "Anyone can view open job postings"
ON job_postings FOR SELECT
USING (status = 'open' OR auth.uid() = employer_id);

CREATE POLICY "Employers can insert own job postings"
ON job_postings FOR INSERT
WITH CHECK (auth.uid() = employer_id);

CREATE POLICY "Employers can update own job postings"
ON job_postings FOR UPDATE
USING (auth.uid() = employer_id)
WITH CHECK (auth.uid() = employer_id);

CREATE POLICY "Employers can delete own job postings"
ON job_postings FOR DELETE
USING (auth.uid() = employer_id);

-- =====================================================
-- 7. APPLICATIONS TABLE
-- =====================================================
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own applications" ON applications;
DROP POLICY IF EXISTS "Users can insert own applications" ON applications;
DROP POLICY IF EXISTS "Users can update own applications" ON applications;
DROP POLICY IF EXISTS "Employers can view applications for their jobs" ON applications;

CREATE POLICY "Users can view own applications"
ON applications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own applications"
ON applications FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own applications"
ON applications FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Employers can view applications for their job postings
CREATE POLICY "Employers can view applications for their jobs"
ON applications FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM job_postings
    WHERE job_postings.id = applications.job_id
    AND job_postings.employer_id = auth.uid()
  )
);

-- =====================================================
-- 8. PORTFOLIOS TABLE
-- =====================================================
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own portfolios" ON portfolios;
DROP POLICY IF EXISTS "Users can insert own portfolios" ON portfolios;
DROP POLICY IF EXISTS "Users can update own portfolios" ON portfolios;
DROP POLICY IF EXISTS "Users can delete own portfolios" ON portfolios;
DROP POLICY IF EXISTS "Anyone can view published portfolios" ON portfolios;

CREATE POLICY "Users can view own portfolios"
ON portfolios FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own portfolios"
ON portfolios FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own portfolios"
ON portfolios FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own portfolios"
ON portfolios FOR DELETE
USING (auth.uid() = user_id);

-- Anyone can view published portfolios
CREATE POLICY "Anyone can view published portfolios"
ON portfolios FOR SELECT
USING (status = 'Published');

-- =====================================================
-- 9. CREDENTIALS TABLE
-- =====================================================
ALTER TABLE credentials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own credentials" ON credentials;
DROP POLICY IF EXISTS "Users can insert own credentials" ON credentials;
DROP POLICY IF EXISTS "Users can update own credentials" ON credentials;
DROP POLICY IF EXISTS "Users can delete own credentials" ON credentials;

CREATE POLICY "Users can view own credentials"
ON credentials FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own credentials"
ON credentials FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own credentials"
ON credentials FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own credentials"
ON credentials FOR DELETE
USING (auth.uid() = user_id);

-- =====================================================
-- 10. FILES TABLE
-- =====================================================
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own files" ON files;
DROP POLICY IF EXISTS "Users can insert own files" ON files;
DROP POLICY IF EXISTS "Users can update own files" ON files;
DROP POLICY IF EXISTS "Users can delete own files" ON files;

CREATE POLICY "Users can view own files"
ON files FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own files"
ON files FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own files"
ON files FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own files"
ON files FOR DELETE
USING (auth.uid() = user_id);

-- =====================================================
-- 11. PROJECTS TABLE
-- =====================================================
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own projects" ON projects;
DROP POLICY IF EXISTS "Users can insert own projects" ON projects;
DROP POLICY IF EXISTS "Users can update own projects" ON projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON projects;

CREATE POLICY "Users can view own projects"
ON projects FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects"
ON projects FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
ON projects FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
ON projects FOR DELETE
USING (auth.uid() = user_id);

-- =====================================================
-- 12. MENTOR_FEEDBACK TABLE
-- =====================================================
ALTER TABLE mentor_feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own mentor feedback" ON mentor_feedback;
DROP POLICY IF EXISTS "Users can insert mentor feedback" ON mentor_feedback;
DROP POLICY IF EXISTS "Mentors can view feedback they gave" ON mentor_feedback;

CREATE POLICY "Users can view own mentor feedback"
ON mentor_feedback FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert mentor feedback"
ON mentor_feedback FOR INSERT
WITH CHECK (auth.uid() = user_id OR auth.uid() = mentor_id);

-- Mentors can view feedback they provided
CREATE POLICY "Mentors can view feedback they gave"
ON mentor_feedback FOR SELECT
USING (auth.uid() = mentor_id);

-- =====================================================
-- 13. USER_ANALYTICS_PROFILES TABLE
-- =====================================================
ALTER TABLE user_analytics_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own analytics profile" ON user_analytics_profiles;
DROP POLICY IF EXISTS "Users can insert own analytics profile" ON user_analytics_profiles;
DROP POLICY IF EXISTS "Users can update own analytics profile" ON user_analytics_profiles;

CREATE POLICY "Users can view own analytics profile"
ON user_analytics_profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analytics profile"
ON user_analytics_profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own analytics profile"
ON user_analytics_profiles FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- STORAGE BUCKET POLICIES (for 'files' bucket)
-- =====================================================
-- Note: These need to be set in Supabase Dashboard under Storage > Policies

-- Storage policy for 'files' bucket:
-- INSERT: auth.uid() = (storage.foldername(name))[1]::uuid
-- SELECT: auth.uid() = (storage.foldername(name))[1]::uuid OR bucket_id = 'files' AND public = true
-- UPDATE: auth.uid() = (storage.foldername(name))[1]::uuid
-- DELETE: auth.uid() = (storage.foldername(name))[1]::uuid

-- =====================================================
-- VERIFICATION QUERY
-- Run this to verify all policies are created
-- =====================================================
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
