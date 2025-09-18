import { json } from "@remix-run/node";
import { createTherapist, getTherapists, updateTherapist } from "~/utils/database.server";
import { validateTherapist } from "~/utils/validation.server";

export async function loader({ request }: { request: Request }) {
  try {
    const url = new URL(request.url);
    const all = url.searchParams.get("all");
    
    if (all === "true") {
      // Get all therapists (for adding to roster)
      const { getAllTherapists } = await import("~/utils/database.server");
      const { data, error } = await getAllTherapists();
      
      if (error) {
        return json({ error }, { status: 500 });
      }

      return json({ data });
    } else {
      // Get only therapists on duty (default behavior)
      const { data, error } = await getTherapists();
      
      if (error) {
        return json({ error }, { status: 500 });
      }

      return json({ data });
    }
  } catch (error) {
    return json({ 
      error: error instanceof Error ? error.message : 'Failed to fetch therapists' 
    }, { status: 500 });
  }
}

export async function action({ request }: { request: Request }) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const url = new URL(request.url);
    const action = url.searchParams.get("action");
    const therapistData = await request.json();

    if (action === "create") {
      // Validate therapist data
      const validation = validateTherapist(therapistData);
      if (!validation.isValid) {
        return json({ 
          error: validation.errors.map(e => e.message).join(', ') 
        }, { status: 400 });
      }

      const { data, error } = await createTherapist(therapistData);
      
      if (error) {
        return json({ error }, { status: 500 });
      }

      return json({ data });
    } else if (action === "update") {
      const { id, updates } = therapistData;
      
      if (!id) {
        return json({ error: "Therapist ID is required" }, { status: 400 });
      }

      const { data, error } = await updateTherapist(id, updates);
      
      if (error) {
        return json({ error }, { status: 500 });
      }

      return json({ data });
    } else {
      return json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    return json({ 
      error: error instanceof Error ? error.message : 'Failed to process therapist' 
    }, { status: 500 });
  }
}
