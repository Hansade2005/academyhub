// Data Migration Script: PiPilot DB to Supabase
// This script helps migrate existing data from PiPilot to Supabase

import { createClient } from '@supabase/supabase-js';
import PiPilot from 'pipilot-sdk';
import { TABLE_IDS } from '../src/lib/database-tools';

// Configuration - Update these with your actual credentials
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://your-project-ref.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'your-anon-key';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key';

const PIPILOT_API_KEY = process.env.PIPILOT_API_KEY || 'sk_live_db3a12d669e420721b56a98ba13924d5815f6e349bbeb44b1725acd252dae5a2';
const PIPILOT_DATABASE_ID = process.env.PIPILOT_DATABASE_ID || '41';

// Initialize clients
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const pipilot = new PiPilot(PIPILOT_API_KEY, PIPILOT_DATABASE_ID, {
  maxRetries: 3,
  retryDelay: 1000
});

interface MigrationStats {
  totalTables: number;
  completedTables: number;
  totalRecords: number;
  migratedRecords: number;
  errors: string[];
}

const stats: MigrationStats = {
  totalTables: 0,
  completedTables: 0,
  totalRecords: 0,
  migratedRecords: 0,
  errors: []
};

async function migrateTable(tableId: string, tableName: string, fieldMapping?: Record<string, string>) {
  console.log(`\n📊 Migrating table: ${tableName} (ID: ${tableId})`);

  try {
    // Fetch all records from PiPilot
    const response = await pipilot.queryTable(tableId, {});
    const records = response.data || [];

    stats.totalRecords += records.length;

    if (records.length === 0) {
      console.log(`✅ No records to migrate for ${tableName}`);
      stats.completedTables++;
      return;
    }

    console.log(`📝 Found ${records.length} records to migrate`);

    // Prepare batches for insertion
    const batchSize = 100;
    const batches = [];

    for (let i = 0; i < records.length; i += batchSize) {
      batches.push(records.slice(i, i + batchSize));
    }

    let migratedCount = 0;

    // Insert in batches
    for (const batch of batches) {
      const insertData = batch.map(record => {
        // Map fields if mapping is provided
        if (fieldMapping) {
          const mappedRecord: any = {};
          for (const [oldField, newField] of Object.entries(fieldMapping)) {
            if (record[oldField as keyof typeof record] !== undefined) {
              mappedRecord[newField] = record[oldField as keyof typeof record];
            }
          }
          return mappedRecord;
        }

        // Default: use all fields from the record
        return {
          id: record.id,
          ...record.data_json,
          created_at: record.created_at,
          updated_at: record.updated_at
        };
      }).filter(record => Object.keys(record).length > 0); // Filter out empty records

      if (insertData.length === 0) continue;

      // Insert into Supabase
      const { data, error } = await supabase
        .from(tableName)
        .insert(insertData)
        .select();

      if (error) {
        console.error(`❌ Error migrating batch to ${tableName}:`, error.message);
        stats.errors.push(`Error in ${tableName}: ${error.message}`);
        continue;
      }

      migratedCount += insertData.length;
      console.log(`✅ Migrated ${insertData.length} records (${migratedCount}/${records.length})`);
    }

    stats.migratedRecords += migratedCount;
    console.log(`✅ Completed migration for ${tableName}: ${migratedCount}/${records.length} records`);
    stats.completedTables++;

  } catch (error) {
    console.error(`❌ Failed to migrate ${tableName}:`, error);
    stats.errors.push(`Failed to migrate ${tableName}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function main() {
  console.log('🚀 Starting PiPilot to Supabase Data Migration');
  console.log('==============================================\n');

  // Define field mappings for tables that need special handling
  const fieldMappings = {
    skill_passports: {
      'data_json': 'content'
    },
    simulations: {
      'data_json': 'results'
    },
    job_postings: {
      'data_json': 'requirements'
    },
    portfolios: {
      'data_json': 'links'
    },
    credentials: {
      'data_json': 'data'
    },
    user_analytics_profiles: {
      'data_json': 'demographics',
      'data_json': 'professional_background',
      'data_json': 'career_goals',
      'data_json': 'learning_preferences'
    }
  };

  // Calculate total tables to migrate
  stats.totalTables = Object.keys(TABLE_IDS).length;
  console.log(`📋 Total tables to migrate: ${stats.totalTables}`);

  // Migrate each table
  await migrateTable(TABLE_IDS.users, 'users');
  await migrateTable(TABLE_IDS.posts, 'posts');
  await migrateTable(TABLE_IDS.comments, 'comments');
  await migrateTable(TABLE_IDS.skill_passports, 'skill_passports', fieldMappings.skill_passports);
  await migrateTable(TABLE_IDS.progress_tracking, 'progress_tracking');
  await migrateTable(TABLE_IDS.analytics, 'analytics');
  await migrateTable(TABLE_IDS.simulations, 'simulations', fieldMappings.simulations);
  await migrateTable(TABLE_IDS.mentor_feedback, 'mentor_feedback');
  await migrateTable(TABLE_IDS.job_postings, 'job_postings', fieldMappings.job_postings);
  await migrateTable(TABLE_IDS.applications, 'applications');
  await migrateTable(TABLE_IDS.portfolios, 'portfolios', fieldMappings.portfolios);
  await migrateTable(TABLE_IDS.credentials, 'credentials', fieldMappings.credentials);
  await migrateTable(TABLE_IDS.files, 'files');
  await migrateTable(TABLE_IDS.projects, 'projects');
  await migrateTable(TABLE_IDS.user_analytics_profiles, 'user_analytics_profiles', fieldMappings.user_analytics_profiles);

  // Print summary
  console.log('\n📊 Migration Summary');
  console.log('==================');
  console.log(`Total tables: ${stats.totalTables}`);
  console.log(`Completed tables: ${stats.completedTables}`);
  console.log(`Total records: ${stats.totalRecords}`);
  console.log(`Migrated records: ${stats.migratedRecords}`);
  console.log(`Success rate: ${((stats.migratedRecords / stats.totalRecords) * 100).toFixed(2)}%`);

  if (stats.errors.length > 0) {
    console.log(`\n⚠️  Errors encountered (${stats.errors.length}):`);
    stats.errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error}`);
    });
  } else {
    console.log('\n✅ Migration completed successfully!');
  }
}

// Run the migration
main().catch(console.error);
