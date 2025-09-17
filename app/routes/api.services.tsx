import { json } from "@remix-run/node";
import { getServices } from "~/utils/database.server";

export async function loader() {
  try {
    const { data, error } = await getServices();
    
    if (error) {
      return json({ error }, { status: 500 });
    }

    return json({ data });
  } catch (error) {
    return json({ 
      error: error instanceof Error ? error.message : 'Failed to fetch services' 
    }, { status: 500 });
  }
}
