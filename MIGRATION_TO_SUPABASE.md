# Migration to Supabase PostgreSQL

## Step 1: Set Up Supabase

### 1.1 Create a Supabase Project
1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Create a new project
4. Note your project URL and API keys

### 1.2 Install Supabase CLI
```bash
npm install -g supabase
# or
yarn global add supabase
# or
pnpm add -g supabase
```

### 1.3 Configure Supabase CLI
```bash
supabase login
supabase link --project-ref your-project-ref
```

## Step 2: Run the Migration Script

### 2.1 Using Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy and paste the contents of `supabase_migration.sql`
5. Click **Run**

### 2.2 Using Supabase CLI
```bash
supabase db push
```

### 2.3 Using SQL File
```bash
supabase db remote commit supabase_migration.sql
```

## Step 3: Set Up Environment Variables

Create a `.env.local` file in the project root:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Disable PiPilot (optional)
NEXT_PUBLIC_USE_PIPILOT=false
```

## Step 4: Update Code to Use Supabase

The migration script creates tables that match the PiPilot DB structure. You'll need to update the database access layer to use Supabase instead of PiPilot SDK.

### 4.1 Install Supabase Client
```bash
pnpm add @supabase/supabase-js
```

### 4.2 Create Supabase Client
Create a new file `src/lib/supabase-client.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### 4.3 Update Database Tools
Replace the PiPilot DB calls in `src/lib/database-tools.ts` with Supabase queries. Example:

```typescript
// Old PiPilot code
import PiPilot from 'pipilot-sdk';
const pipilot = new PiPilot(...);

// New Supabase code
import { supabase } from './supabase-client';
```

## Step 5: Update Authentication

### 5.1 Install NextAuth with Supabase Provider
```bash
pnpm add next-auth @next-auth/prisma-adapter @prisma/client
```

### 5.2 Configure NextAuth
Update `src/lib/pipilot-auth-service.ts` to use Supabase auth:

```typescript
import { supabase } from './supabase-client'

export async function signUp(email: string, password: string, fullName?: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        avatar_url: null
      }
    }
  })

  if (error) throw error

  // Insert into users table if needed
  const { data: userData, error: userError } = await supabase
    .from('users')
    .insert({
      id: data.user.id,
      email: data.user.email,
      password_hash: 'supabase_auth', // Mark as using Supabase auth
      full_name: fullName,
      avatar_url: null
    })
    .select()
    .single()

  if (userError && userError.code !== '23505') throw userError // 23505 = duplicate key

  return userData
}
```

## Step 6: Test the Migration

1. Run the application:
```bash
pnpm dev
```

2. Test all major features:
- User authentication
- Skill passport creation
- Progress tracking
- Job applications
- Portfolio management
- Analytics

## Step 7: Data Migration (Optional)

If you need to migrate existing data from PiPilot to Supabase:

```typescript
import { pipilot } from './database-tools'
import { supabase } from './supabase-client'

async function migrateSkillPassports() {
  const { data: passports, error } = await pipilot.queryTable('225', {})

  if (error) throw error

  for (const passport of passports) {
    await supabase.from('skill_passports').insert({
      id: passport.id,
      user_id: passport.user_id,
      title: passport.title,
      content: passport.content,
      confidence_score: passport.confidence_score,
      created_at: passport.created_at,
      updated_at: passport.updated_at
    })
  }
}
```

## Troubleshooting

### Common Issues

1. **Authentication errors**: Ensure your Supabase API keys are correct
2. **Table not found**: Verify the migration script ran successfully
3. **Permission denied**: Check Row-Level Security policies in Supabase
4. **Connection issues**: Verify your Supabase project URL is correct

### Enabling Debug Mode

Add to your `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_DEBUG=true
```

## Next Steps

1. Monitor application performance
2. Set up database backups in Supabase
3. Configure monitoring and alerts
4. Plan for gradual deprecation of PiPilot DB

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase PostgreSQL Reference](https://supabase.com/docs/guides/database)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
