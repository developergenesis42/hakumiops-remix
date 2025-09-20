import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";

import { destroySession, getSession } from "~/session.server";
import { getSupabaseClient } from "~/utils/getSupabaseClient";

export async function action({ request }: ActionFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("__session");
  
  // Sign out from Supabase if token exists
  if (token) {
    try {
      const supabase = getSupabaseClient();
      await supabase.auth.signOut();
    } catch (error) {
      // Continue with logout even if Supabase signout fails
      console.error("Error signing out from Supabase:", error);
    }
  }
  
  return redirect("/login", {
    headers: {
      "Set-Cookie": await destroySession(session),
    },
  });
}
