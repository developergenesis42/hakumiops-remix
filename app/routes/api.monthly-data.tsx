import { json } from "@remix-run/node";
import { getMonthlyData } from "~/utils/database.server";
import { requireAuth } from "~/utils/auth.server";

export async function loader({ request }: { request: Request }) {
  // Temporarily disable auth for development - change back to requireAuth for production
  // await requireAuth(request);
  try {
    const url = new URL(request.url);
    const month = url.searchParams.get("month") || new Date().toISOString().slice(0, 7); // Default to current month
    
    // Validate month format
    if (!/^\d{4}-\d{2}$/.test(month)) {
      return json({ error: "Month parameter must be in format YYYY-MM" }, { status: 400 });
    }
    
    const { data, error } = await getMonthlyData(month);
    
    if (error) {
      return json({ error }, { status: 500 });
    }

    return json({ data });
  } catch (error) {
    return json({ 
      error: error instanceof Error ? error.message : 'Failed to fetch monthly data' 
    }, { status: 500 });
  }
}
