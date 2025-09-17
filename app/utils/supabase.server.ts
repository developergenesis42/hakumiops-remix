
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export function createClient() {
  const headers = new Headers();

  // Ensure environment variables are loaded
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  // Use the regular Supabase client for server-side operations
  // This bypasses the SSR cookie handling that might be causing issues
  const supabase = createSupabaseClient(
    supabaseUrl,
    supabaseAnonKey
  );

  return { supabase, headers };
}
