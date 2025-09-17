import { json } from "@remix-run/node";
import { printNodeService } from "~/utils/printnode.server";

export async function loader() {
  try {
    const printers = await printNodeService.getPrinters();
    return json({ printers });
  } catch (error) {
    console.error('Error fetching printers:', error);
    return json({ 
      error: error instanceof Error ? error.message : 'Failed to fetch printers' 
    }, { status: 500 });
  }
}
