import { json } from "@remix-run/node";
import { getPrintNodeService } from "~/utils/printnode.server";
import { requireAuth } from "~/utils/auth.server";

export async function loader({ request }: { request: Request }) {
  // Temporarily disable auth for development - change back to requireAuth for production
  // await requireAuth(request);
  try {
    const printNodeService = getPrintNodeService();
    const printers = await printNodeService.getPrinters();
    return json({ printers });
  } catch (error) {
    console.error('Error fetching printers:', error);
    return json({ 
      error: error instanceof Error ? error.message : 'Failed to fetch printers' 
    }, { status: 500 });
  }
}
