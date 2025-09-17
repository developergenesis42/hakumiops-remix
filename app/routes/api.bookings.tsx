import { json } from "@remix-run/node";
import { getBookings, deleteBooking } from "~/utils/database.server";

export async function loader() {
  try {
    const { data, error } = await getBookings();
    
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
  if (request.method !== "DELETE") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const { id } = await request.json();
    
    if (!id) {
      return json({ error: "Booking ID is required" }, { status: 400 });
    }

    const { error } = await deleteBooking(id);
    
    if (error) {
      return json({ error }, { status: 500 });
    }

    return json({ success: true });
  } catch (error) {
    return json({ 
      error: error instanceof Error ? error.message : 'Failed to delete booking' 
    }, { status: 500 });
  }
}
