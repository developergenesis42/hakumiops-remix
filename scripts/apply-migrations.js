/* eslint-disable no-undef, no-unused-vars */
// Script to apply database migrations manually
// Run with: node scripts/apply-migrations.js

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration(migrationFile) {
  console.log(`\n🔧 Applying migration: ${migrationFile}`);
  
  try {
    const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', migrationFile);
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log(`  Executing: ${statement.substring(0, 50)}...`);
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          console.error(`❌ Error executing statement: ${error.message}`);
          console.error(`Statement: ${statement}`);
          return false;
        }
      }
    }
    
    console.log(`✅ Migration ${migrationFile} applied successfully`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to apply migration ${migrationFile}:`, error.message);
    return false;
  }
}

async function checkTableStructure() {
  console.log('\n🔍 Checking current table structure...');
  
  // Check bookings table structure
  const { data: bookingsColumns, error: bookingsError } = await supabase
    .from('information_schema.columns')
    .select('column_name, data_type, is_nullable')
    .eq('table_name', 'bookings')
    .eq('table_schema', 'public');
  
  if (bookingsError) {
    console.log('❌ Failed to check bookings table structure:', bookingsError.message);
  } else {
    console.log('📋 Bookings table columns:');
    bookingsColumns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
  }
  
  // Check sessions table structure
  const { data: sessionsColumns, error: sessionsError } = await supabase
    .from('information_schema.columns')
    .select('column_name, data_type, is_nullable')
    .eq('table_name', 'sessions')
    .eq('table_schema', 'public');
  
  if (sessionsError) {
    console.log('❌ Failed to check sessions table structure:', sessionsError.message);
  } else {
    console.log('📋 Sessions table columns:');
    sessionsColumns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
  }
}

async function applyMigrations() {
  console.log('🚀 Starting migration application...\n');
  
  // Check current structure first
  await checkTableStructure();
  
  // List of migrations to apply (in order)
  const migrations = [
    '20250225030000_add_started_status_to_bookings.sql',
    '20250225040000_add_booking_id_to_sessions.sql'
  ];
  
  let allSuccessful = true;
  
  for (const migration of migrations) {
    const success = await applyMigration(migration);
    if (!success) {
      allSuccessful = false;
      break;
    }
  }
  
  if (allSuccessful) {
    console.log('\n🎉 All migrations applied successfully!');
    console.log('\n📊 Checking updated table structure...');
    await checkTableStructure();
  } else {
    console.log('\n❌ Some migrations failed. Please check the errors above.');
  }
  
  return allSuccessful;
}

// Run the migrations
applyMigrations().then(success => {
  if (success) {
    console.log('\n✅ Migration process completed successfully!');
    console.log('You can now test the booking status functionality.');
  } else {
    console.log('\n❌ Migration process failed. Please check the errors above.');
  }
  process.exit(success ? 0 : 1);
});
