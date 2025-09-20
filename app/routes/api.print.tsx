import { json } from "@remix-run/node";
import { getPrintNodeService } from "~/utils/printnode.server";
import { requireAuth } from "~/utils/auth.server";

export async function action({ request }: { request: Request }) {
  // Require authentication
  await requireAuth(request);
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const body = await request.json();
    const { type, printerId, data, copies } = body;

    if (!type || !printerId) {
      return json({ error: "Type and printerId are required" }, { status: 400 });
    }

    let result;

    switch (type) {
      case 'receipt':
        if (!data.service || !data.price) {
          return json({ error: "Receipt data is incomplete" }, { status: 400 });
        }
        
        // Use copies if specified, otherwise single receipt
        const printNodeService = getPrintNodeService();
        if (copies && copies > 1) {
          result = await printNodeService.printReceiptCopies(printerId, {
            ...data,
            timestamp: data.timestamp || new Date().toLocaleString()
          }, copies);
        } else {
          result = await printNodeService.printReceipt(printerId, {
            ...data,
            timestamp: data.timestamp || new Date().toLocaleString()
          });
        }
        break;

      case 'daily-report':
        if (!data.date || data.totalRevenue === undefined) {
          return json({ error: "Daily report data is incomplete" }, { status: 400 });
        }
        result = await getPrintNodeService().printDailyReport(printerId, data);
        break;

      case 'custom':
        if (!data.content) {
          return json({ error: "Custom print content is required" }, { status: 400 });
        }
        result = await getPrintNodeService().printJob(printerId, data.content, data.title || 'Custom Print');
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
