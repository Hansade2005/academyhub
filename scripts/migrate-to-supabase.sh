#!/bin/bash

# Supabase Migration Script
# This script helps migrate from PiPilot DB to Supabase

echo "=========================================="
echo "Supabase Migration Assistant"
echo "=========================================="
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "⚠️  Supabase CLI not found. Installing..."
    npm install -g supabase
    echo "✅ Supabase CLI installed"
    echo ""
fi

echo "📋 Migration Steps:"
echo ""
echo "1. Run SQL migration in Supabase"
echo "2. Update environment variables"
echo "3. Install Supabase client"
echo "4. Update code references"
echo ""

# Step 1: Check if SQL file exists
if [ -f "supabase_migration.sql" ]; then
    echo "✅ SQL migration file found: supabase_migration.sql"
    echo ""
    echo "To run the migration:"
    echo "  - Go to Supabase Dashboard > SQL Editor"
    echo "  - Copy and paste the contents of supabase_migration.sql"
    echo "  - Click Run"
    echo ""
else
    echo "❌ SQL migration file not found!"
    exit 1
fi

# Step 2: Check environment variables
echo "2️⃣  Environment Variables Setup"
echo ""
if [ -f ".env.local" ]; then
    echo "✅ .env.local file exists"
    if grep -q "NEXT_PUBLIC_SUPABASE_URL" .env.local; then
        echo "✅ Supabase URL configured"
    else
        echo "❌ Supabase URL not configured"
    fi
    if grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY" .env.local; then
        echo "✅ Supabase Anon Key configured"
    else
        echo "❌ Supabase Anon Key not configured"
    fi
else
    echo "⚠️  .env.local file not found"
    echo "Create one with:"
    echo "  NEXT_PUBLIC_SUPABASE_URL=your-project-url"
    echo "  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key"
    echo "  SUPABASE_SERVICE_ROLE_KEY=your-service-role-key"
fi
echo ""

# Step 3: Install Supabase client
echo "3️⃣  Installing Supabase Client..."
pnpm install @supabase/supabase-js --save
echo "✅ Supabase client installed"
echo ""

# Step 4: Update code references
echo "4️⃣  Code Updates"
echo ""
echo "The following files need to be updated:"
echo "  ✅ src/lib/supabase-client.ts (created)"
echo "  ✅ src/lib/supabase-database-tools.ts (created)"
echo "  ⚠️  src/lib/database-tools.ts (needs update)"
echo "  ⚠️  src/lib/pipilot-auth-service.ts (needs update)"
echo "  ⚠️  src/lib/simple-db.ts (needs update)"
echo ""

# Check if old files exist
if [ -f "src/lib/database-tools.ts" ]; then
    echo "Found src/lib/database-tools.ts"
    echo "You should update it to use the new Supabase implementation"
    echo "Or rename it to database-tools.old.ts and update imports"
    echo ""
fi

if [ -f "src/lib/pipilot-auth-service.ts" ]; then
    echo "Found src/lib/pipilot-auth-service.ts"
    echo "This needs to be updated to use Supabase auth"
    echo ""
fi

if [ -f "src/lib/simple-db.ts" ]; then
    echo "Found src/lib/simple-db.ts"
    echo "This can be removed or updated to use Supabase"
    echo ""
fi

echo "=========================================="
echo "Migration Documentation:"
echo "=========================================="
echo ""
echo "📖 MIGRATION_TO_SUPABASE.md - Step-by-step guide"
echo "📖 SUPABASE_MIGRATION_GUIDE.md - Technical details"
echo "📖 MIGRATION_SUMMARY.md - Summary of changes"
echo ""
echo "=========================================="
echo "Next Steps:"
echo "=========================================="
echo ""
echo "1. Run the SQL migration in Supabase"
echo "2. Update your .env.local with Supabase credentials"
echo "3. Update API routes to import from supabase-database-tools.ts"
echo "4. Test the application"
echo "5. Monitor for any errors"
echo ""
echo "Need help? Check the documentation files above!"
echo ""
