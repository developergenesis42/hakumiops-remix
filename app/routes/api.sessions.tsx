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
    } else {
      return json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    return json({ 
      error: error instanceof Error ? error.message : 'Failed to process session' 
    }, { status: 500 });
  }
}
