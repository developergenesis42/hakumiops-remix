import { json } from "@remix-run/node";
import { getRooms } from "~/utils/database.server";

export async function loader() {
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
