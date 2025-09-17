import { json } from "@remix-run/node";
import { printNodeService } from "~/utils/printnode.server";

export async function action({ request }: { request: Request }) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const body = await request.json();
    const { type, printerId, data } = body;

    if (!type || !printerId) {
      return json({ error: "Type and printerId are required" }, { status: 400 });
    }

    let result;

    switch (type) {
      case 'receipt':
        if (!data.service || !data.price) {
          return json({ error: "Receipt data is incomplete" }, { status: 400 });
        }
        result = await printNodeService.printReceipt(printerId, {
          ...data,
          timestamp: data.timestamp || new Date().toLocaleString()
        });
        break;

      case 'daily-report':
        if (!data.date || data.totalRevenue === undefined) {
          return json({ error: "Daily report data is incomplete" }, { status: 400 });
        }
        result = await printNodeService.printDailyReport(printerId, data);
        break;

      case 'custom':
        if (!data.content) {
          return json({ error: "Custom print content is required" }, { status: 400 });
        }
        result = await printNodeService.printJob(printerId, data.content, data.title || 'Custom Print');
        break;

      default:
        return json({ error: "Invalid print type" }, { status: 400 });
    }

    return json({ success: true, result });

  } catch (error) {
    console.error('Error printing:', error);
    return json({ 
      error: error instanceof Error ? error.message : 'Failed to print' 
    }, { status: 500 });
  }
}
