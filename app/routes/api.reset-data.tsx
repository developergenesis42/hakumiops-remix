import { json, type ActionFunctionArgs } from "@remix-run/node";
import { createClient } from "~/utils/supabase.server";
import { requireAuth } from "~/utils/auth.server";

export async function action({ request }: ActionFunctionArgs) {
  // Require authentication
  await requireAuth(request);
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const { supabase } = createClient();

    // Safety check - only allow this to run in development
    if (process.env.NODE_ENV === "production") {
      return json({ error: "Reset data is not allowed in production" }, { status: 403 });
    }

    console.log("🧹 Starting data reset - clearing test operations...");

    // Clear operational data tables (test operations)
    const tablesToClear = [
      'bookings',
      'sessions', 
      'therapist_expenses',
      'daily_reports'
      // Note: walkouts and shop_expenses preserved for historical analysis
    ];

    for (const table of tablesToClear) {
      const { error } = await supabase
        .from(table)
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records
      
      if (error) {
        console.error(`Error clearing ${table}:`, error);
        return json({ error: `Failed to clear ${table}: ${error.message}` }, { status: 500 });
      }
      
      console.log(`✅ Cleared ${table}`);
    }

    // Reset therapist statuses to default values (preserve names and roster)
    const { error: therapistResetError } = await supabase
      .from('therapists')
      .update({
        is_on_duty: false,
        status: 'Rostered',
        check_in_time: null,
        check_out_time: null,
        active_room_id: null,
        completed_room_ids: []
      })
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Update all records

    if (therapistResetError) {
      console.error("Error resetting therapists:", therapistResetError);
      return json({ error: `Failed to reset therapists: ${therapistResetError.message}` }, { status: 500 });
    }

    console.log("✅ Reset therapist statuses");

    // Reset room statuses to Available
    const { error: roomResetError } = await supabase
      .from('rooms')
      .update({
        status: 'Available'
      })
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Update all records

    if (roomResetError) {
      console.error("Error resetting rooms:", roomResetError);
      return json({ error: `Failed to reset rooms: ${roomResetError.message}` }, { status: 500 });
    }

    console.log("✅ Reset room statuses");

    console.log("🎉 Data reset completed successfully!");
    console.log("📋 Preserved data:");
    console.log("  - Therapist names and roster");
    console.log("  - Services and pricing");
    console.log("  - Room configurations");
    console.log("🗑️ Cleared data:");
    console.log("  - All bookings");
    console.log("  - All sessions");
    console.log("  - All therapist expenses");
    console.log("  - All daily reports");
    console.log("📊 Preserved data:");
    console.log("  - Walkouts (for analytics and historical tracking)");
    console.log("  - Shop expenses (for analytics and historical tracking)");

    return json({ 
      success: true, 
      message: "Data reset completed successfully",
      preserved: ["therapists", "services", "rooms"],
      cleared: tablesToClear
    });

  } catch (error) {
    console.error("Reset data error:", error);
    return json({ 
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    }, { status: 500 });
  }
}

// Prevent GET requests
export async function loader() {
  return json({ error: "Use POST method to reset data" }, { status: 405 });
}
