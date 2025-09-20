import { getSession } from "~/session.server";
import { getSupabaseClient } from "~/utils/getSupabaseClient";

export async function requireAuth(request: Request) {
  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("__session");

  if (!token) {
    throw new Response("Unauthorized", { status: 401 });
  }

  return token;
}

export async function optionalAuth(request: Request) {
  try {
    return await requireAuth(request);
  } catch {
    return null;
  }
}

export async function getUserData(request: Request) {
  const token = await requireAuth(request);
  const supabase = getSupabaseClient();
  
  // Set the session for the request
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    throw new Response("Unauthorized", { status: 401 });
  }

  return {
    id: user.id,
    email: user.email,
    name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
    avatar_url: user.user_metadata?.avatar_url || '/user.jpg'
  };
}
