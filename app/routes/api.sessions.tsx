import { json } from "@remix-run/node";
import { createSession, updateSession, getSessions } from "~/utils/database.server";
import { validateSession } from "~/utils/validation.server";

export async function loader() {
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
  const url = new URL(request.url);
  const action = url.searchParams.get("action");

  // Handle DELETE method for clearing completed sessions
  if (request.method === "DELETE") {
    try {
      const { action: deleteAction } = await request.json();
      
      if (deleteAction === 'clear_completed') {
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

  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    if (action === "create") {
      const sessionData = await request.json();
      
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
      const { sessionId, updates } = await request.json();
      
      const { data, error } = await updateSession(sessionId, updates);
      
      if (error) {
        return json({ error }, { status: 500 });
      }

      return json({ data });
    } else if (action === "complete") {
      const { sessionId, endTime, forceComplete } = await request.json();
      
      const { data, error } = await updateSession(sessionId, {
        status: 'Completed',
        end_time: endTime || new Date().toISOString()
      });
      
      if (error) {
        return json({ error }, { status: 500 });
      }

      return json({ data, forceComplete });
    } else {
      return json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    return json({ 
      error: error instanceof Error ? error.message : 'Failed to process session' 
    }, { status: 500 });
  }
}
