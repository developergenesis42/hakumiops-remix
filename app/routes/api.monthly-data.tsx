import { json } from "@remix-run/node";
import { getMonthlyData } from "~/utils/database.server";

export async function loader({ request }: { request: Request }) {
  try {
    const url = new URL(request.url);
    const month = url.searchParams.get("month");
    
    if (!month) {
      return json({ error: "Month parameter is required (format: YYYY-MM)" }, { status: 400 });
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
