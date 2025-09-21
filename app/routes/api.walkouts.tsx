import { json } from "@remix-run/node";
import { createWalkout, getWalkouts } from "~/utils/database.server";
import { validateWalkout } from "~/utils/validation.server";
import { createClient } from "~/utils/supabase.server";
import { requireAuth } from "~/utils/auth.server";

export async function loader({ request }: { request: Request }) {
  // Temporarily disable auth for development - change back to requireAuth for production
  // await requireAuth(request);
  try {
    const { data, error } = await getWalkouts();
    
    if (error) {
      return json({ error }, { status: 500 });
    }

    return json({ data });
  } catch (error) {
    return json({ 
      error: error instanceof Error ? error.message : 'Failed to fetch walkouts' 
    }, { status: 500 });
  }
}

export async function action({ request }: { request: Request }) {
  // Temporarily disable auth for development - change back to requireAuth for production
  // await requireAuth(request);
  
  if (request.method === 'DELETE') {
    // Handle clearing all walkouts (for end of day)
    try {
      const { supabase } = createClient();
      
      const { error } = await supabase
        .from('walkouts')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records
      
      if (error) {
        return json({ error: error.message }, { status: 500 });
      }
      
      return json({ message: 'All walkouts cleared successfully' });
    } catch (error) {
      return json({ 
        error: error instanceof Error ? error.message : 'Failed to clear walkouts' 
      }, { status: 500 });
    }
  }
  
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const walkoutData = await request.json();
    
    // Validate walkout data
    const validation = validateWalkout(walkoutData);
    if (!validation.isValid) {
      return json({ 
        error: validation.errors.map(e => e.message).join(', ') 
      }, { status: 400 });
    }

    const { data, error } = await createWalkout(walkoutData);
    
    if (error) {
      return json({ error }, { status: 500 });
    }

    return json({ data });
  } catch (error) {
    return json({ 
      error: error instanceof Error ? error.message : 'Failed to create walkout' 
    }, { status: 500 });
  }
}
