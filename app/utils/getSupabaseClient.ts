import { createClient } from "@supabase/supabase-js";

export function getSupabaseClient() {
  // Try Vite environment variables first (for client-side)
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.SUPABASE_DATABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase environment variables are missing. Please check your .env.local file.");
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}
