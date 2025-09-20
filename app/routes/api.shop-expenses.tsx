import { json } from "@remix-run/node";
import { getShopExpenses } from "~/utils/database.server";
import { requireAuth } from "~/utils/auth.server";

export async function loader({ request }: { request: Request }) {
  // Require authentication
  await requireAuth(request);
  try {
    const { data, error } = await getShopExpenses();
    
    if (error) {
      return json({ error }, { status: 500 });
    }

    return json({ data });
  } catch (error) {
    return json({ 
      error: error instanceof Error ? error.message : 'Failed to fetch shop expenses' 
    }, { status: 500 });
  }
}

export async function action({ request }: { request: Request }) {
  // Handle DELETE method for clearing all shop expenses
  if (request.method === "DELETE") {
    try {
      const { createClient } = await import("~/utils/supabase.server");
      const { supabase } = createClient();
      
      // Delete all shop expenses
      const { error } = await supabase
        .from('shop_expenses')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records
      
      if (error) {
        return json({ error: error.message }, { status: 500 });
      }
      
      return json({ message: 'All shop expenses cleared successfully' });
    } catch (error) {
      return json({ 
        error: error instanceof Error ? error.message : 'Failed to clear shop expenses' 
      }, { status: 500 });
    }
  }

  return json({ error: "Method not allowed" }, { status: 405 });
}

