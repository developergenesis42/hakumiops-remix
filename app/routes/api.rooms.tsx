import { json } from "@remix-run/node";
import { getRooms } from "~/utils/database.server";
import { requireAuth } from "~/utils/auth.server";

export async function loader({ request }: { request: Request }) {
  // Require authentication
  await requireAuth(request);
  try {
    const { data, error } = await getRooms();
    
    if (error) {
      return json({ error }, { status: 500 });
    }

    return json({ data });
  } catch (error) {
    return json({ 
      error: error instanceof Error ? error.message : 'Failed to fetch rooms' 
    }, { status: 500 });
  }
}
