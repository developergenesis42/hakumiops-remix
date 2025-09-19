import { json } from "@remix-run/node";
import { createTherapistExpense, createShopExpense } from "~/utils/database.server";
import { validateTherapistExpense, validateShopExpense } from "~/utils/validation.server";

export async function action({ request }: { request: Request }) {
  const url = new URL(request.url);
  const type = url.searchParams.get("type");

  // Handle DELETE method for clearing all therapist expenses
  if (request.method === "DELETE") {
    try {
      const { action: deleteAction } = await request.json();
      
      if (deleteAction === 'clear_all') {
        const { createClient } = await import("~/utils/supabase.server");
        const { supabase } = createClient();
        
        // Delete all therapist expenses
        const { error } = await supabase
          .from('therapist_expenses')
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records
        
        if (error) {
          return json({ error: error.message }, { status: 500 });
        }
        
        return json({ message: 'All therapist expenses cleared successfully' });
      } else {
        return json({ error: "Invalid delete action" }, { status: 400 });
      }
    } catch (error) {
      return json({ 
        error: error instanceof Error ? error.message : 'Failed to clear expenses' 
      }, { status: 500 });
    }
  }

  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    if (type === "therapist") {
      const expenseData = await request.json();
      
      // Validate expense data
      const validation = validateTherapistExpense(expenseData);
      if (!validation.isValid) {
        return json({ 
          error: validation.errors.map(e => e.message).join(', ') 
        }, { status: 400 });
      }

      const { data, error } = await createTherapistExpense(expenseData);
      
      if (error) {
        return json({ error }, { status: 500 });
      }

      return json({ data });
    } else if (type === "shop") {
      const expenseData = await request.json();
      
      // Validate expense data
      const validation = validateShopExpense(expenseData);
      if (!validation.isValid) {
        return json({ 
          error: validation.errors.map(e => e.message).join(', ') 
        }, { status: 400 });
      }

      const { data, error } = await createShopExpense(expenseData);
      
      if (error) {
        return json({ error }, { status: 500 });
      }

      return json({ data });
    } else {
      return json({ error: "Invalid expense type" }, { status: 400 });
    }
  } catch (error) {
    return json({ 
      error: error instanceof Error ? error.message : 'Failed to process expense' 
    }, { status: 500 });
  }
}
