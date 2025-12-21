#!/usr/bin/env node

// PiPilot Auth Setup Script
// Run this script to set up the users table in PiPilot DB for authentication

const { create_database, create_table } = require('../lib/database-tools');

async function setupPiPilotAuth() {
  try {
    console.log('🚀 Setting up PiPilot Authentication...');

    // Step 1: Create database (if it doesn't exist)
    console.log('📦 Creating database...');
    const dbResult = await create_database({ name: 'skill_passport_auth' });
    console.log('✅ Database ready:', dbResult);

    // Step 2: Create users table
    console.log('👥 Creating users table...');
    const usersTable = await create_table({
      name: 'users',
      description: 'User authentication table for storing user accounts, passwords, and profile information',
      schema: {
        columns: [
          {
            name: 'email',
            type: 'text',
            required: true,
            unique: true,
            description: 'User email address (unique identifier for login)'
          },
          {
            name: 'password_hash',
            type: 'text',
            required: true,
            description: 'Hashed password for secure authentication'
          },
          {
            name: 'full_name',
            type: 'text',
            required: false,
            description: 'User full name (optional)'
          },
          {
            name: 'avatar_url',
            type: 'text',
            required: false,
            description: 'URL to user avatar/profile picture'
          },
          {
            name: 'created_at',
            type: 'timestamp',
            required: true,
            description: 'Account creation timestamp'
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            required: true,
            description: 'Last profile update timestamp'
          }
        ],
        indexes: ['email'] // Index for fast email lookups
      }
    });

    console.log('✅ Users table created:', usersTable);

    console.log('🎉 PiPilot Authentication setup complete!');
    console.log('📋 Next steps:');
    console.log('1. Update your .env.local with JWT_SECRET');
    console.log('2. Test user registration and login');
    console.log('3. Your app now uses PiPilot DB for authentication!');

  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

// Run the setup
setupPiPilotAuth();