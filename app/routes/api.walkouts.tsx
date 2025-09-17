import { json } from "@remix-run/node";
import { createWalkout, getWalkouts } from "~/utils/database.server";
import { validateWalkout } from "~/utils/validation.server";

export async function loader() {
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
