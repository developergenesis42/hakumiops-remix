/* eslint-disable no-undef, no-unused-vars */
// Simple script to apply database migrations
// Run with: node scripts/apply-migrations-simple.js

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

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

async function applyMigrations() {
  console.log('🚀 Applying database migrations...\n');
  
  try {
    // Migration 1: Add 'Started' status to bookings
    console.log('1. Adding "Started" status to bookings table...');
    
    const migration1 = `
      -- Update the CHECK constraint to include 'Started' status
      ALTER TABLE bookings 
      DROP CONSTRAINT IF EXISTS bookings_status_check;

      ALTER TABLE bookings 
      ADD CONSTRAINT bookings_status_check 
      CHECK (status IN ('Scheduled', 'Started', 'Completed', 'Cancelled'));

      -- Add comment to clarify the status flow
      COMMENT ON COLUMN bookings.status IS 'Booking status: Scheduled (future booking) -> Started (session in progress) -> Completed (session finished) or Cancelled';
    `;
    
    const { error: error1 } = await supabase.rpc('exec', { sql: migration1 });
    
    if (error1) {
      console.error('❌ Error applying migration 1:', error1.message);
      return false;
    }
    
    console.log('✅ Migration 1 applied successfully');
    
    // Migration 2: Add booking_id to sessions
    console.log('\n2. Adding booking_id field to sessions table...');
    
    const migration2 = `
      -- Add booking_id column to sessions table
      ALTER TABLE sessions 
      ADD COLUMN IF NOT EXISTS booking_id UUID REFERENCES bookings(id);

      -- Add index for better query performance
      CREATE INDEX IF NOT EXISTS idx_sessions_booking_id ON sessions(booking_id);

      -- Add comment to clarify the relationship
      COMMENT ON COLUMN sessions.booking_id IS 'Reference to the booking this session was created from. NULL for walk-in sessions.';
    `;
    
    const { error: error2 } = await supabase.rpc('exec', { sql: migration2 });
    
    if (error2) {
      console.error('❌ Error applying migration 2:', error2.message);
      return false;
    }
    
    console.log('✅ Migration 2 applied successfully');
    
    // Verify the changes
    console.log('\n3. Verifying changes...');
    
    // Check bookings table
    const { data: bookingsData, error: bookingsError } = await supabase
      .from('bookings')
      .select('id, status')
      .limit(1);
    
    if (bookingsError) {
      console.log('⚠️  Could not verify bookings table:', bookingsError.message);
    } else {
      console.log('✅ Bookings table accessible');
    }
    
    // Check sessions table
    const { data: sessionsData, error: sessionsError } = await supabase
      .from('sessions')
      .select('id, booking_id')
      .limit(1);
    
    if (sessionsError) {
      console.log('⚠️  Could not verify sessions table:', sessionsError.message);
    } else {
      console.log('✅ Sessions table accessible with booking_id field');
    }
    
    console.log('\n🎉 All migrations applied successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Test creating a booking');
    console.log('2. Start a session from the booking');
    console.log('3. Verify the booking disappears from the roster card');
    
    return true;
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    return false;
  }
}

// Run the migrations
applyMigrations().then(success => {
  if (success) {
    console.log('\n✅ Migration process completed successfully!');
  } else {
    console.log('\n❌ Migration process failed. Please check the errors above.');
    console.log('\n💡 Alternative: You can manually run these SQL commands in your Supabase SQL editor:');
    console.log('\n1. For bookings status:');
    console.log('ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check;');
    console.log('ALTER TABLE bookings ADD CONSTRAINT bookings_status_check CHECK (status IN (\'Scheduled\', \'Started\', \'Completed\', \'Cancelled\'));');
    console.log('\n2. For sessions booking_id:');
    console.log('ALTER TABLE sessions ADD COLUMN IF NOT EXISTS booking_id UUID REFERENCES bookings(id);');
    console.log('CREATE INDEX IF NOT EXISTS idx_sessions_booking_id ON sessions(booking_id);');
  }
  process.exit(success ? 0 : 1);
});
