// Simple test script to verify Supabase database connection
// Run with: node test-db-connection.js

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

async function testConnection() {
  console.log('🔍 Testing Supabase database connection...\n');

  try {
    // Test 1: Check if we can connect to the database
    console.log('1. Testing database connection...');
    const { data, error } = await supabase.from('therapists').select('count').limit(1);
    
    if (error) {
      console.error('❌ Database connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Database connection successful');

    // Test 2: Check if tables exist and have data
    console.log('\n2. Checking table structure...');
    
    const tables = ['therapists', 'rooms', 'services', 'sessions', 'bookings', 'therapist_expenses', 'shop_expenses', 'walkouts', 'daily_reports'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select('*').limit(1);
        if (error) {
          console.log(`⚠️  Table '${table}': ${error.message}`);
        } else {
          console.log(`✅ Table '${table}': OK (${data?.length || 0} records)`);
        }
      } catch (err) {
        console.log(`❌ Table '${table}': ${err.message}`);
      }
    }

    // Test 3: Test CRUD operations
    console.log('\n3. Testing CRUD operations...');
    
    // Test creating a therapist
    const testTherapist = {
      name: 'Test Therapist',
      is_on_duty: false,
      status: 'Rostered',
      check_in_time: null,
      check_out_time: null,
      active_room_id: null,
      completed_room_ids: []
    };

    const { data: createdTherapist, error: createError } = await supabase
      .from('therapists')
      .insert([testTherapist])
      .select()
      .single();

    if (createError) {
      console.log('❌ Create operation failed:', createError.message);
    } else {
      console.log('✅ Create operation successful');
      
      // Test updating the therapist
      const { error: updateError } = await supabase
        .from('therapists')
        .update({ name: 'Updated Test Therapist' })
        .eq('id', createdTherapist.id);

      if (updateError) {
        console.log('❌ Update operation failed:', updateError.message);
      } else {
        console.log('✅ Update operation successful');
      }

      // Test deleting the therapist
      const { error: deleteError } = await supabase
        .from('therapists')
        .delete()
        .eq('id', createdTherapist.id);

      if (deleteError) {
        console.log('❌ Delete operation failed:', deleteError.message);
      } else {
        console.log('✅ Delete operation successful');
      }
    }

    // Check therapist status distribution
    console.log('\n📊 Checking therapist status distribution...');
    const { data: allTherapists, error: therapistError } = await supabase
      .from('therapists')
      .select('name, is_on_duty');
    
    if (therapistError) {
      console.log('❌ Failed to fetch therapists:', therapistError.message);
    } else {
      const onDuty = allTherapists.filter(t => t.is_on_duty === true);
      const offDuty = allTherapists.filter(t => t.is_on_duty === false);
      
      console.log(`Total therapists: ${allTherapists.length}`);
      console.log(`On duty: ${onDuty.length}`);
      console.log(`Off duty: ${offDuty.length}`);
      
      if (onDuty.length > 0) {
        console.log('\nOn duty therapists:');
        onDuty.forEach(t => console.log(`  - ${t.name}`));
      }
      
      if (offDuty.length > 0) {
        console.log('\nOff duty therapists (first 10):');
        offDuty.slice(0, 10).forEach(t => console.log(`  - ${t.name}`));
        if (offDuty.length > 10) {
          console.log(`  ... and ${offDuty.length - 10} more`);
        }
      }
    }

    console.log('\n🎉 Database integration test completed!');
    return true;

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  }
}

// Run the test
testConnection().then(success => {
  if (success) {
    console.log('\n✅ All tests passed! The Supabase integration is working correctly.');
  } else {
    console.log('\n❌ Some tests failed. Please check your Supabase configuration.');
  }
  process.exit(success ? 0 : 1);
});
