import { json } from "@remix-run/node";
import { getBookingsWithDetails, createBooking, deleteBooking, updateBooking } from "~/utils/database.server";
import { requireAuth } from "~/utils/auth.server";

export async function loader({ request }: { request: Request }) {
  // Require authentication
  await requireAuth(request);
  try {
    const { data, error } = await getBookingsWithDetails();
    
    if (error) {
      return json({ error }, { status: 500 });
    }

    return json({ data });
  } catch (error) {
    return json({ 
      error: error instanceof Error ? error.message : 'Failed to fetch bookings' 
    }, { status: 500 });
  }
}

export async function action({ request }: { request: Request }) {
  // Require authentication
  await requireAuth(request);
  
  const method = request.method;

  if (method === "POST") {
    try {
      const bookingData = await request.json();
      
      // Validate required fields
      if (!bookingData.serviceId || !bookingData.therapistIds || !bookingData.startTime || !bookingData.endTime) {
        return json({ error: "Missing required fields: serviceId, therapistIds, startTime, endTime" }, { status: 400 });
      }

      // Validate therapist IDs array
      if (!Array.isArray(bookingData.therapistIds) || bookingData.therapistIds.length === 0) {
        return json({ error: "therapistIds must be a non-empty array" }, { status: 400 });
      }

      // Validate time relationship
      const startTime = new Date(bookingData.startTime);
      const endTime = new Date(bookingData.endTime);
      
      if (endTime <= startTime) {
        return json({ error: "End time must be after start time" }, { status: 400 });
      }

      // Convert camelCase to snake_case for database
      const dbBooking = {
        service_id: bookingData.serviceId,
        therapist_ids: bookingData.therapistIds,
        start_time: bookingData.startTime,
        end_time: bookingData.endTime,
        room_id: bookingData.roomId || null,
        note: bookingData.note || null,
        status: 'Scheduled'
      };

      const { data, error } = await createBooking(dbBooking);
      
      if (error) {
        return json({ error }, { status: 500 });
      }

      return json({ data, success: true });
    } catch (error) {
      return json({ 
        error: error instanceof Error ? error.message : 'Failed to create booking' 
      }, { status: 500 });
    }
  }

  if (method === "DELETE") {
    try {
      const { id } = await request.json();
      console.log('🗑️ DELETE booking API called with ID:', id);
      
      if (!id) {
        console.log('❌ No booking ID provided');
        return json({ error: "Booking ID is required" }, { status: 400 });
      }

      console.log('🗑️ Calling deleteBooking function for ID:', id);
      const { error } = await deleteBooking(id);
      
      if (error) {
        console.log('❌ deleteBooking failed:', error);
        return json({ error }, { status: 500 });
      }

      console.log('✅ Booking deleted successfully from database');
      return json({ success: true });
    } catch (error) {
      console.log('❌ DELETE booking API error:', error);
      return json({ 
        error: error instanceof Error ? error.message : 'Failed to delete booking' 
      }, { status: 500 });
    }
  }

  if (method === "PUT") {
    try {
      const { id, ...updates } = await request.json();
      
      if (!id) {
        return json({ error: "Booking ID is required" }, { status: 400 });
      }

      // Check if this is a status-only update
      const isStatusOnlyUpdate = Object.keys(updates).length === 1 && updates.status;
      
      if (isStatusOnlyUpdate) {
        // Validate status value
        const validStatuses = ['Scheduled', 'Started', 'Completed', 'Cancelled'];
        if (!validStatuses.includes(updates.status)) {
          return json({ error: "Invalid status. Must be one of: " + validStatuses.join(', ') }, { status: 400 });
        }
      } else {
        // Full update - validate required fields
        if (!updates.serviceId || !updates.therapistIds || !updates.startTime || !updates.endTime) {
          return json({ error: "Missing required fields: serviceId, therapistIds, startTime, endTime" }, { status: 400 });
        }

        // Validate therapist IDs array
        if (!Array.isArray(updates.therapistIds) || updates.therapistIds.length === 0) {
          return json({ error: "therapistIds must be a non-empty array" }, { status: 400 });
        }

        // Validate time relationship
        const startTime = new Date(updates.startTime);
        const endTime = new Date(updates.endTime);
        
        if (endTime <= startTime) {
          return json({ error: "End time must be after start time" }, { status: 400 });
        }
      }

      const { data, error } = await updateBooking(id, updates);
      
      if (error) {
        return json({ error }, { status: 500 });
      }

      return json({ data, success: true });
    } catch (error) {
      return json({ 
        error: error instanceof Error ? error.message : 'Failed to update booking' 
      }, { status: 500 });
    }
  }

  return json({ error: "Method not allowed" }, { status: 405 });
}
