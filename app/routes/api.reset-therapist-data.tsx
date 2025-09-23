import { json, type ActionFunctionArgs } from "@remix-run/node";
import { createClient } from "~/utils/supabase.server";
import { requireAuth } from "~/utils/auth.server";

export async function action({ request }: ActionFunctionArgs) {
  // Temporarily disable auth for development - change back to requireAuth for production
  // await requireAuth(request);
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const { supabase } = createClient();

    // Safety check - only allow this to run in development
    if (process.env.NODE_ENV === "production") {
      return json({ error: "Reset therapist data is not allowed in production" }, { status: 403 });
    }

    console.log("🧹 Starting therapist data reset...");

    // Clear all therapist data
    const { error: therapistDeleteError } = await supabase
      .from('therapists')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records

    if (therapistDeleteError) {
      console.error("Error clearing therapists:", therapistDeleteError);
      return json({ error: `Failed to clear therapists: ${therapistDeleteError.message}` }, { status: 500 });
    }

    console.log("✅ Cleared all therapist data");

    // Clear related data that depends on therapists
    const relatedTables = [
      'therapist_expenses',
      'sessions', // Sessions reference therapist_ids
      'bookings'  // Bookings reference therapist_ids
    ];

    for (const table of relatedTables) {
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

    // Reset room statuses to Available (since therapists are gone)
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

    console.log("✅ Reset room statuses to Available");

    console.log("🎉 Therapist data reset completed successfully!");
    console.log("🗑️ Cleared data:");
    console.log("  - All therapists");
    console.log("  - All therapist expenses");
    console.log("  - All sessions");
    console.log("  - All bookings");
    console.log("📊 Preserved data:");
    console.log("  - Services and pricing");
    console.log("  - Room configurations");
    console.log("  - Walkouts (for analytics)");
    console.log("  - Shop expenses (for analytics)");
    console.log("  - Daily reports (for analytics)");

    return json({ 
      success: true, 
      message: "Therapist data reset completed successfully",
      cleared: ['therapists', 'therapist_expenses', 'sessions', 'bookings'],
      preserved: ['services', 'rooms', 'walkouts', 'shop_expenses', 'daily_reports']
    });

  } catch (error) {
    console.error("Reset therapist data error:", error);
    return json({ 
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    }, { status: 500 });
  }
}

export async function loader({ request }: { request: Request }) {
  // Temporarily disable auth for development - change back to requireAuth for production
  // await requireAuth(request);
  try {
    // Return reset service status and available operations
    return json({ 
      data: {
        status: 'available',
        operations: ['reset_therapist_data'],
        message: 'Therapist data reset service is available (development only)',
        environment: process.env.NODE_ENV || 'development'
      }
    });
  } catch (error) {
    return json({ 
      error: error instanceof Error ? error.message : 'Failed to check reset service status' 
    }, { status: 500 });
  }
}
