import { json } from "@remix-run/node";
import { createDailyReport, getDailyReports } from "~/utils/database.server";

export async function loader() {
  try {
    const { data, error } = await getDailyReports();
    
    if (error) {
      return json({ error }, { status: 500 });
    }

    return json({ data });
  } catch (error) {
    return json({ 
      error: error instanceof Error ? error.message : 'Failed to fetch daily reports' 
    }, { status: 500 });
  }
}

export async function action({ request }: { request: Request }) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const reportData = await request.json();
    
    // Basic validation
    if (!reportData.report_date) {
      return json({ error: "Report date is required" }, { status: 400 });
    }

    const { data, error } = await createDailyReport(reportData);
    
    if (error) {
      return json({ error }, { status: 500 });
    }

    return json({ data });
  } catch (error) {
    return json({ 
      error: error instanceof Error ? error.message : 'Failed to create daily report' 
    }, { status: 500 });
  }
}
