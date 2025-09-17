
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export function createClient() {
  const headers = new Headers();

  // Use the regular Supabase client for server-side operations
  // This bypasses the SSR cookie handling that might be causing issues
  const supabase = createSupabaseClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_ANON_KEY!
  );

  return { supabase, headers };
}
