# Database Migration Guide: PiPilot DB to Supabase

This guide will walk you through migrating your database from PiPilot to Supabase.

## 📋 Migration Overview

The migration consists of two main phases:
1. **Schema Migration** - Create the database structure in Supabase
2. **Data Migration** - Transfer existing data from PiPilot to Supabase

## ✅ Prerequisites

Before starting the migration, ensure you have:

1. **Supabase Account**: Sign up at [https://supabase.com](https://supabase.com)
2. **Supabase Project**: Create a new project in your Supabase dashboard
3. **Node.js**: Installed on your local machine (v18+ recommended)
4. **PiPilot Credentials**: Your current PiPilot API key and database ID

## 🛠️ Step 1: Set Up Supabase

### 1.1 Create a Supabase Project
- Go to [Supabase Dashboard](https://app.supabase.com)
- Click "New Project"
- Choose a name (e.g., "The 3rd Academy")
- Select a region close to your users
- Click "Create Project"

### 1.2 Get Your Supabase Credentials
- Navigate to your project
- Go to **Settings** > **API**
- Copy:
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY` (for public access)
  - `SUPABASE_SERVICE_ROLE_KEY` (for admin access - use this for migration)

### 1.3 Install Supabase CLI (Optional)
```bash
npm install -g supabase
supabase login
```

## 🗃️ Step 2: Create Database Schema in Supabase

### 2.1 Run the Migration SQL

You have two options to run the migration SQL:

#### Option A: Using Supabase Dashboard (Recommended)
1. In your Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Open the file `migrate_to_supabase.sql` in this repository
4. Copy and paste the entire SQL content into the query editor
5. Click **Run**
6. Wait for all queries to execute successfully

#### Option B: Using Supabase CLI
```bash
supabase db push --file migrate_to_supabase.sql
```

#### Option C: Using psql
```bash
psql -h your-project-ref.supabase.co -p 6543 -U postgres -d postgres -f migrate_to_supabase.sql
```

### 2.2 Verify Schema Creation
- Go to **Table Editor** in your Supabase dashboard
- Verify that all 17 tables have been created:
  - users
  - posts
  - comments
  - skill_passports
  - progress_tracking
  - analytics
  - simulations
  - mentor_feedback
  - job_postings
  - applications
  - portfolios
  - credentials
  - files
  - projects
  - user_analytics_profiles

## 📤 Step 3: Migrate Data from PiPilot to Supabase

### 3.1 Install Required Dependencies
```bash
cd /home/user/project/academyhub
npm install @supabase/supabase-js
```

### 3.2 Configure Environment Variables

Create a `.env` file in the root directory with the following content:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# PiPilot Configuration
PIPILOT_API_KEY=sk_live_your_api_key_here
PIPILOT_DATABASE_ID=your_database_id_here
```

**Important Security Note**: The service role key should only be used for migration and should not be committed to version control or exposed in production code.

### 3.3 Run the Data Migration Script

Execute the migration script:

```bash
cd /home/user/project/academyhub
node scripts/migrate_data_to_supabase.ts
```

This will:
- Connect to your PiPilot database
- Fetch all records from each table
- Insert them into the corresponding Supabase tables
- Provide a summary of migrated records

### 3.4 Verify Data Migration

Check the migration output for:
- Total records migrated
- Success rate
- Any errors encountered

If there are errors, review them and fix any data issues before proceeding.

## 🔧 Step 4: Update Application Code

Now you need to update your application to use Supabase instead of PiPilot SDK.

### 4.1 Install Supabase Client
```bash
npm install @supabase/supabase-js
```

### 4.2 Create Supabase Client Utility

Create a new file `src/lib/supabase-client.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### 4.3 Update Environment Variables

Update your `.env.local` file to include Supabase credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Remove PiPilot credentials (or comment them out)
# NEXT_PUBLIC_PIPILOT_DATABASE_ID=
# PIPILOT_API_KEY=
```

### 4.4 Replace Database Operations

Replace all PiPilot SDK calls with Supabase client calls. Here's an example:

**Before (PiPilot):**
```typescript
import { queryTable, TABLE_IDS } from '../lib/database-tools';

const response = await queryTable(TABLE_IDS.skill_passports, {});
```

**After (Supabase):**
```typescript
import { supabase } from '../lib/supabase-client';

const { data, error } = await supabase
  .from('skill_passports')
  .select('*');
```

### 4.5 Update Authentication

Replace PiPilot authentication with Supabase Auth:

**Before:**
```typescript
import { pipilotAuthService } from '../lib/pipilot-auth-service';

await pipilotAuthService.signup(email, password, fullName);
```

**After:**
```typescript
import { supabase } from '../lib/supabase-client';

const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: {
      full_name: fullName
    }
  }
});
```

## 🔐 Step 5: Set Up Authentication

### 5.1 Configure Supabase Auth

1. Go to **Authentication** > **Providers** in Supabase dashboard
2. Enable **Email/Password** (already enabled by default)
3. Configure any additional providers (Google, GitHub, etc.) as needed

### 5.2 Set Up Row Level Security (RLS)

The migration SQL already includes RLS policies. You can customize them further:

1. Go to **Authentication** > **Policies** in Supabase dashboard
2. Review and adjust the policies based on your security requirements
3. Test that users can only access their own data

## 🧪 Step 6: Test the Migration

### 6.1 Test Database Operations

Create test scripts to verify:
- Data can be read from Supabase
- Data can be created/updated/deleted
- RLS policies work correctly
- Authentication works as expected

### 6.2 Test Application Features

Test all major application features:
- User registration and login
- Skill passport creation and viewing
- Progress tracking
- Job postings and applications
- Portfolio management
- Analytics and reporting

## 🚀 Step 7: Deploy to Production

### 7.1 Update Production Environment

Update your production environment variables with Supabase credentials.

### 7.2 Monitor the Migration

- Monitor application logs for errors
- Check Supabase dashboard for database activity
- Verify that all data is accessible

### 7.3 Decommission PiPilot (Optional)

Once you've confirmed everything works with Supabase:
- Update your documentation
- Notify users of the change (if applicable)
- Consider canceling your PiPilot subscription

## 📝 Troubleshooting

### Common Issues

#### 1. Authentication Errors
- **Symptom**: Users can't log in
- **Solution**: Verify Supabase Auth is properly configured and RLS policies allow access

#### 2. Missing Data
- **Symptom**: Some records are missing after migration
- **Solution**: Check the migration script logs for errors, re-run the migration for specific tables

#### 3. RLS Policy Conflicts
- **Symptom**: "42501: insufficient privileges" errors
- **Solution**: Review and adjust RLS policies in Supabase dashboard

#### 4. Data Type Mismatches
- **Symptom**: Errors during data migration
- **Solution**: Check the SQL schema and adjust field types as needed

## 📚 Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase React Guide](https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Supabase RLS Guide](https://supabase.com/docs/guides/database/row-level-security)

## 🎉 Migration Complete!

Once you've completed all steps and verified everything works, your application is now using Supabase instead of PiPilot DB. Congratulations! 🎉

For any issues or questions, refer to the Supabase documentation or create an issue in this repository.
