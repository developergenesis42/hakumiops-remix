import { json } from "@remix-run/node";
import { createClient } from "~/utils/supabase.server";

export async function loader() {
  try {
    const { supabase } = createClient();
    
    // Test database connection and permissions
    const results = {
      timestamp: new Date().toISOString(),
      environment: {
        supabaseUrl: process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL ? 'SET' : 'NOT SET',
        supabaseKey: process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET',
      },
      tests: {}
    };
    
    // Test 1: Basic connection
    try {
      const { data, error } = await supabase.from('rooms').select('count(*)');
      results.tests.basicConnection = {
        success: !error,
        error: error?.message || null,
        data: data
      };
    } catch (err) {
      results.tests.basicConnection = {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error'
      };
    }
    
    // Test 2: Fetch rooms
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .order('name');
      
      results.tests.fetchRooms = {
        success: !error,
        error: error?.message || null,
        count: data?.length || 0,
        data: data?.slice(0, 3) || [] // Show first 3 rooms
      };
    } catch (err) {
      results.tests.fetchRooms = {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error'
      };
    }
    
    // Test 3: Fetch therapists
    try {
      const { data, error } = await supabase
        .from('therapists')
        .select('*')
        .order('name');
      
      results.tests.fetchTherapists = {
        success: !error,
        error: error?.message || null,
        count: data?.length || 0,
        data: data?.slice(0, 3) || [] // Show first 3 therapists
      };
    } catch (err) {
      results.tests.fetchTherapists = {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error'
      };
    }
    
    // Test 4: Try to insert a test therapist
    try {
      const testTherapist = {
        name: `Debug Test ${Date.now()}`,
        is_on_duty: false,
        status: 'Rostered'
      };
      
      const { data, error } = await supabase
        .from('therapists')
        .insert([testTherapist])
        .select();
      
      results.tests.insertTest = {
        success: !error,
        error: error?.message || null,
        insertedData: data
      };
      
      // Clean up the test therapist
      if (data && data[0]) {
        await supabase
          .from('therapists')
          .delete()
          .eq('id', data[0].id);
      }
    } catch (err) {
      results.tests.insertTest = {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error'
      };
    }
    
    return json(results);
    
  } catch (error) {
    return json({
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : null
    }, { status: 500 });
  }
}
