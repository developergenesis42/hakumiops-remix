
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export function createClient() {
  const headers = new Headers();

  // Try multiple environment variable names for deployment compatibility
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables:');
    console.error('SUPABASE_URL or VITE_SUPABASE_URL:', !!supabaseUrl);
    console.error('SUPABASE_ANON_KEY or VITE_SUPABASE_ANON_KEY:', !!supabaseAnonKey);
    throw new Error('Missing Supabase environment variables');
  }

  console.log('Supabase URL configured:', supabaseUrl ? 'SET' : 'NOT SET');
  console.log('Supabase Key configured:', supabaseAnonKey ? 'SET' : 'NOT SET');

  // Use the regular Supabase client for server-side operations
  const supabase = createSupabaseClient(
    supabaseUrl,
    supabaseAnonKey
  );

  return { supabase, headers };
}
