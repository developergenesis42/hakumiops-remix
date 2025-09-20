import { json } from "@remix-run/node";
import { createSession, updateSession, getSessions } from "~/utils/database.server";
import { validateSession } from "~/utils/validation.server";
import { validateDeleteAction } from "~/utils/api-validation.server";
import { requireAuth } from "~/utils/auth.server";

export async function loader({ request }: { request: Request }) {
  // Require authentication
  await requireAuth(request);
  try {
    const { data, error } = await getSessions();
    
    if (error) {
      return json({ error }, { status: 500 });
    }

    return json({ data });
  } catch (error) {
    return json({ 
      error: error instanceof Error ? error.message : 'Failed to fetch sessions' 
    }, { status: 500 });
  }
}

export async function action({ request }: { request: Request }) {
  // Temporarily disable auth for development - change back to secureApiAction for production
  // return secureApiAction(request, async (req) => {
  const req = request; // Use request directly for development
  
  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    // Handle DELETE method for clearing completed sessions
    if (req.method === "DELETE") {
      try {
        const body = await req.json();
        
        // Validate DELETE action
        const validation = validateDeleteAction(body, ['clear_completed']);
        if (!validation.valid) {
          return json({ error: validation.error }, { status: 400 });
        }
        
        if (body.action === 'clear_completed') {
        const { createClient } = await import("~/utils/supabase.server");
        const { supabase } = createClient();
        
        // Delete all completed sessions
        const { error } = await supabase
          .from('sessions')
          .delete()
          .eq('status', 'Completed');
        
        if (error) {
          return json({ error: error.message }, { status: 500 });
        }
        
        return json({ message: 'Completed sessions cleared successfully' });
        } else {
          return json({ error: "Invalid delete action" }, { status: 400 });
        }
      } catch (error) {
        return json({ 
          error: error instanceof Error ? error.message : 'Failed to clear sessions' 
        }, { status: 500 });
      }
    }

    if (req.method !== "POST") {
      return json({ error: "Method not allowed" }, { status: 405 });
    }

    try {
      if (action === "create") {
        const sessionData = await req.json();
      
      // Validate session data
      const validation = validateSession(sessionData);
      if (!validation.isValid) {
        return json({ 
          error: validation.errors.map(e => e.message).join(', ') 
        }, { status: 400 });
      }

      const { data, error } = await createSession(sessionData);
      
      if (error) {
        return json({ error }, { status: 500 });
      }

      return json({ data });
      } else if (action === "update") {
        const { sessionId, updates } = await req.json();
        
        const { data, error } = await updateSession(sessionId, updates);
        
        if (error) {
          return json({ error }, { status: 500 });
        }

        return json({ data });
      } else if (action === "complete") {
        const { sessionId, endTime, forceComplete } = await req.json();
        
        const { data, error } = await updateSession(sessionId, {
          status: 'Completed',
          end_time: endTime || new Date().toISOString()
        });
        
        if (error) {
          return json({ error }, { status: 500 });
        }

        return json({ data, forceComplete });
      } else if (action === "delete") {
        const { sessionId } = await req.json();
        
        const { createClient } = await import("~/utils/supabase.server");
        const { supabase } = createClient();
        
        // Delete the session
        const { error } = await supabase
          .from('sessions')
          .delete()
          .eq('id', sessionId);
        
        if (error) {
          return json({ error: error.message }, { status: 500 });
        }
        
        return json({ message: 'Session deleted successfully' });
      } else {
        return json({ error: "Invalid action" }, { status: 400 });
      }
    } catch (error) {
      return json({ 
        error: error instanceof Error ? error.message : 'Failed to process session' 
      }, { status: 500 });
    }
  } catch (error) {
    return json({ 
      error: error instanceof Error ? error.message : 'Failed to process session' 
    }, { status: 500 });
  }
}
