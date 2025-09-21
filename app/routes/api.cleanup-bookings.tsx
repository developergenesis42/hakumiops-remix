import { json } from "@remix-run/node";
import { cleanupOldBookings, getAllBookingsForCleanup, expireOldScheduledBookings } from "~/utils/database.server";

export async function loader({ request }: { request: Request }) {
  try {
    // Get all bookings for analysis
    const { data: allBookings, error: fetchError } = await getAllBookingsForCleanup();
    
    if (fetchError) {
      return json({ error: fetchError }, { status: 500 });
    }

    // Analyze booking ages
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const oldBookings = allBookings?.filter(booking => {
      const startTime = new Date(booking.start_time);
      return startTime < sevenDaysAgo && (booking.status === 'Completed' || booking.status === 'Cancelled');
    }) || [];
    
    const yesterdayBookings = allBookings?.filter(booking => {
      const startTime = new Date(booking.start_time);
      return startTime < oneDayAgo && startTime >= sevenDaysAgo;
    }) || [];

    return json({ 
      data: {
        totalBookings: allBookings?.length || 0,
        oldBookings: oldBookings.length,
        yesterdayBookings: yesterdayBookings.length,
        oldBookingsList: oldBookings.map(b => ({
          id: b.id,
          start_time: b.start_time,
          status: b.status,
          days_old: Math.floor((now.getTime() - new Date(b.start_time).getTime()) / (24 * 60 * 60 * 1000))
        }))
      }
    });
  } catch (error) {
    return json({ 
      error: error instanceof Error ? error.message : 'Failed to analyze bookings' 
    }, { status: 500 });
  }
}

export async function action({ request }: { request: Request }) {
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get("action");

    if (action === "cleanup") {
      const { deletedCount, error } = await cleanupOldBookings();
      
      if (error) {
        return json({ error }, { status: 500 });
      }

      return json({ 
        message: `Successfully cleaned up ${deletedCount} old bookings`,
        deletedCount 
      });
    }

    if (action === "expire") {
      const { expiredCount, error } = await expireOldScheduledBookings();
      
      if (error) {
        return json({ error }, { status: 500 });
      }

      return json({ 
        message: `Successfully expired ${expiredCount} old scheduled bookings`,
        expiredCount 
      });
    }

    if (action === "both") {
      // Run both cleanup and expire
      const [cleanupResult, expireResult] = await Promise.all([
        cleanupOldBookings(),
        expireOldScheduledBookings()
      ]);
      
      if (cleanupResult.error) {
        return json({ error: cleanupResult.error }, { status: 500 });
      }
      
      if (expireResult.error) {
        return json({ error: expireResult.error }, { status: 500 });
      }

      return json({ 
        message: `Successfully cleaned up ${cleanupResult.deletedCount} old bookings and expired ${expireResult.expiredCount} scheduled bookings`,
        deletedCount: cleanupResult.deletedCount,
        expiredCount: expireResult.expiredCount
      });
    }

    return json({ error: "Invalid action. Use 'cleanup', 'expire', or 'both'" }, { status: 400 });
  } catch (error) {
    return json({ 
      error: error instanceof Error ? error.message : 'Failed to process booking cleanup' 
    }, { status: 500 });
  }
}
