import { createClient } from "~/utils/supabase.server";
import type { 
  Therapist, 
  Room, 
  Service, 
  Session, 
  Booking, 
  TherapistExpense, 
  ShopExpense, 
  Walkout,
  DailyReport,
  SessionWithDetails,
  BookingWithDetails,
  TherapistWithStats,
  RoomWithSession,
  FinancialSummary
} from "~/types";

// ============================================================================
// THERAPIST OPERATIONS
// ============================================================================

export async function getTherapists(): Promise<{ data: Therapist[]; error: string | null }> {
  try {
    const { supabase } = createClient();
    const { data, error } = await supabase
      .from("therapists")
      .select(`
        *,
        therapist_expenses(
          id,
          item_name,
          amount
        )
      `)
      .eq("is_on_duty", true)
      .order("name");

    if (error) throw error;
    
    // Transform the data to match the Therapist interface
    const transformedData = (data || []).map(therapist => ({
      ...therapist,
      expenses: therapist.therapist_expenses?.map((expense: any) => ({
        id: expense.id,
        name: expense.item_name,
        amount: expense.amount
      })) || []
    }));

    return { data: transformedData, error: null };
  } catch (error) {
    return { 
      data: [], 
      error: error instanceof Error ? error.message : 'Failed to fetch therapists' 
    };
  }
}

export async function getAllTherapists(): Promise<{ data: Therapist[]; error: string | null }> {
  try {
    const { supabase } = createClient();
    const { data, error } = await supabase
      .from("therapists")
      .select(`
        *,
        therapist_expenses(
          id,
          item_name,
          amount
        )
      `)
      .order("name");

    if (error) throw error;
    
    // Transform the data to match the Therapist interface
    const transformedData = (data || []).map(therapist => ({
      ...therapist,
      expenses: therapist.therapist_expenses?.map((expense: any) => ({
        id: expense.id,
        name: expense.item_name,
        amount: expense.amount
      })) || []
    }));

    return { data: transformedData, error: null };
  } catch (error) {
    return { 
      data: [], 
      error: error instanceof Error ? error.message : 'Failed to fetch all therapists' 
    };
  }
}

export async function getTherapistById(id: string): Promise<{ data: Therapist | null; error: string | null }> {
  try {
    const { supabase } = createClient();
    const { data, error } = await supabase
      .from("therapists")
      .select(`
        *,
        therapist_expenses(
          id,
          item_name,
          amount
        )
      `)
      .eq("id", id)
      .single();

    if (error) throw error;
    
    // Transform the data to match the Therapist interface
    const transformedData = data ? {
      ...data,
      expenses: data.therapist_expenses?.map((expense: any) => ({
        id: expense.id,
        name: expense.item_name,
        amount: expense.amount
      })) || []
    } : null;

    return { data: transformedData, error: null };
  } catch (error) {
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Failed to fetch therapist' 
    };
  }
}

export async function createTherapist(therapist: Omit<Therapist, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: Therapist | null; error: string | null }> {
  try {
    const { supabase } = createClient();
    const { data, error } = await supabase
      .from("therapists")
      .insert([therapist])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Failed to create therapist' 
    };
  }
}

export async function updateTherapist(id: string, updates: Partial<Omit<Therapist, 'id' | 'created_at' | 'updated_at'>>): Promise<{ data: Therapist | null; error: string | null }> {
  try {
    const { supabase } = createClient();
    
    const { data, error } = await supabase
      .from("therapists")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Failed to update therapist' 
    };
  }
}

export async function deleteTherapist(id: string): Promise<{ error: string | null }> {
  try {
    const { supabase } = createClient();
    const { error } = await supabase
      .from("therapists")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    return { 
      error: error instanceof Error ? error.message : 'Failed to delete therapist' 
    };
  }
}

// ============================================================================
// ROOM OPERATIONS
// ============================================================================

export async function getRooms(): Promise<{ data: Room[]; error: string | null }> {
  try {
    const { supabase } = createClient();
    const { data, error } = await supabase
      .from("rooms")
      .select("*")
      .order("name");

    if (error) throw error;
    return { data: data || [], error: null };
  } catch (error) {
    return { 
      data: [], 
      error: error instanceof Error ? error.message : 'Failed to fetch rooms' 
    };
  }
}

export async function updateRoomStatus(id: string, status: 'Available' | 'Occupied'): Promise<{ data: Room | null; error: string | null }> {
  try {
    const { supabase } = createClient();
    const { data, error } = await supabase
      .from("rooms")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Failed to update room status' 
    };
  }
}

// ============================================================================
// SERVICE OPERATIONS
// ============================================================================

export async function getServices(): Promise<{ data: Service[]; error: string | null }> {
  try {
    const { supabase } = createClient();
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .order("category", { ascending: true })
      .order("price", { ascending: true });

    if (error) throw error;
    return { data: data || [], error: null };
  } catch (error) {
    return { 
      data: [], 
      error: error instanceof Error ? error.message : 'Failed to fetch services' 
    };
  }
}

// ============================================================================
// SESSION OPERATIONS
// ============================================================================

export async function getSessions(): Promise<{ data: Session[]; error: string | null }> {
  try {
    const { supabase } = createClient();
    const { data, error } = await supabase
      .from("sessions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { data: data || [], error: null };
  } catch (error) {
    return { 
      data: [], 
      error: error instanceof Error ? error.message : 'Failed to fetch sessions' 
    };
  }
}

export async function getSessionsWithDetails(): Promise<{ data: SessionWithDetails[]; error: string | null }> {
  try {
    const { supabase } = createClient();
    const { data, error } = await supabase
      .from("sessions")
      .select(`
        *,
        services!sessions_service_id_fkey(*),
        rooms!sessions_room_id_fkey(*)
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Transform the data to match SessionWithDetails interface
    const sessionsWithDetails: SessionWithDetails[] = (data || []).map(session => ({
      ...session,
      service: session.services,
      room: session.rooms,
      therapists: [] // Will be populated separately
    }));

    return { data: sessionsWithDetails, error: null };
  } catch (error) {
    return { 
      data: [], 
      error: error instanceof Error ? error.message : 'Failed to fetch sessions with details' 
    };
  }
}

export async function createSession(session: Omit<Session, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: Session | null; error: string | null }> {
  try {
    const { supabase } = createClient();
    const { data, error } = await supabase
      .from("sessions")
      .insert([session])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Failed to create session' 
    };
  }
}

export async function updateSession(id: string, updates: Partial<Omit<Session, 'id' | 'created_at' | 'updated_at'>>): Promise<{ data: Session | null; error: string | null }> {
  try {
    const { supabase } = createClient();
    const { data, error } = await supabase
      .from("sessions")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Failed to update session' 
    };
  }
}

export async function deleteSession(id: string): Promise<{ error: string | null }> {
  try {
    const { supabase } = createClient();
    const { error } = await supabase
      .from("sessions")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    return { 
      error: error instanceof Error ? error.message : 'Failed to delete session' 
    };
  }
}

// ============================================================================
// BOOKING OPERATIONS
// ============================================================================

export async function getBookings(): Promise<{ data: Booking[]; error: string | null }> {
  try {
    const { supabase } = createClient();
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .order("start_time", { ascending: true });

    if (error) throw error;
    return { data: data || [], error: null };
  } catch (error) {
    return { 
      data: [], 
      error: error instanceof Error ? error.message : 'Failed to fetch bookings' 
    };
  }
}

export async function createBooking(booking: Omit<Booking, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: Booking | null; error: string | null }> {
  try {
    const { supabase } = createClient();
    const { data, error } = await supabase
      .from("bookings")
      .insert([booking])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Failed to create booking' 
    };
  }
}

export async function deleteBooking(id: string): Promise<{ error: string | null }> {
  try {
    const { supabase } = createClient();
    const { error } = await supabase
      .from("bookings")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    return { 
      error: error instanceof Error ? error.message : 'Failed to delete booking' 
    };
  }
}

export async function updateBooking(id: string, updates: Partial<Omit<Booking, 'id' | 'created_at' | 'updated_at'>>): Promise<{ data: Booking | null; error: string | null }> {
  try {
    const { supabase } = createClient();
    const { data, error } = await supabase
      .from("bookings")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Failed to update booking' 
    };
  }
}

// ============================================================================
// EXPENSE OPERATIONS
// ============================================================================

export async function getTherapistExpenses(therapistId: string): Promise<{ data: TherapistExpense[]; error: string | null }> {
  try {
    const { supabase } = createClient();
    const { data, error } = await supabase
      .from("therapist_expenses")
      .select("*")
      .eq("therapist_id", therapistId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { data: data || [], error: null };
  } catch (error) {
    return { 
      data: [], 
      error: error instanceof Error ? error.message : 'Failed to fetch therapist expenses' 
    };
  }
}

export async function createTherapistExpense(expense: Omit<TherapistExpense, 'id' | 'created_at'>): Promise<{ data: TherapistExpense | null; error: string | null }> {
  try {
    const { supabase } = createClient();
    const { data, error } = await supabase
      .from("therapist_expenses")
      .insert([expense])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Failed to create therapist expense' 
    };
  }
}

export async function getShopExpenses(): Promise<{ data: ShopExpense[]; error: string | null }> {
  try {
    const { supabase } = createClient();
    const { data, error } = await supabase
      .from("shop_expenses")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { data: data || [], error: null };
  } catch (error) {
    return { 
      data: [], 
      error: error instanceof Error ? error.message : 'Failed to fetch shop expenses' 
    };
  }
}

export async function createShopExpense(expense: Omit<ShopExpense, 'id' | 'created_at'>): Promise<{ data: ShopExpense | null; error: string | null }> {
  try {
    const { supabase } = createClient();
    const { data, error } = await supabase
      .from("shop_expenses")
      .insert([expense])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Failed to create shop expense' 
    };
  }
}

// ============================================================================
// WALKOUT OPERATIONS
// ============================================================================

export async function getWalkouts(): Promise<{ data: Walkout[]; error: string | null }> {
  try {
    const { supabase } = createClient();
    const { data, error } = await supabase
      .from("walkouts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { data: data || [], error: null };
  } catch (error) {
    return { 
      data: [], 
      error: error instanceof Error ? error.message : 'Failed to fetch walkouts' 
    };
  }
}

export async function createWalkout(walkout: Omit<Walkout, 'id' | 'created_at'>): Promise<{ data: Walkout | null; error: string | null }> {
  try {
    const { supabase } = createClient();
    const { data, error } = await supabase
      .from("walkouts")
      .insert([walkout])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Failed to create walkout' 
    };
  }
}

// ============================================================================
// DAILY REPORT OPERATIONS
// ============================================================================

export async function getDailyReport(date: string): Promise<{ data: DailyReport | null; error: string | null }> {
  try {
    const { supabase } = createClient();
    const { data, error } = await supabase
      .from("daily_reports")
      .select("*")
      .eq("report_date", date)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
    return { data: data || null, error: null };
  } catch (error) {
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Failed to fetch daily report' 
    };
  }
}

export async function createDailyReport(report: Omit<DailyReport, 'id' | 'created_at'>): Promise<{ data: DailyReport | null; error: string | null }> {
  try {
    const { supabase } = createClient();
    const { data, error } = await supabase
      .from("daily_reports")
      .insert([report])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Failed to create daily report' 
    };
  }
}

export async function getDailyReports(): Promise<{ data: DailyReport[]; error: string | null }> {
  try {
    const { supabase } = createClient();
    const { data, error } = await supabase
      .from("daily_reports")
      .select("*")
      .order("report_date", { ascending: false });

    if (error) throw error;
    return { data: data || [], error: null };
  } catch (error) {
    return { 
      data: [], 
      error: error instanceof Error ? error.message : 'Failed to fetch daily reports' 
    };
  }
}

export async function updateDailyReport(id: string, updates: Partial<Omit<DailyReport, 'id' | 'created_at'>>): Promise<{ data: DailyReport | null; error: string | null }> {
  try {
    const { supabase } = createClient();
    const { data, error } = await supabase
      .from("daily_reports")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Failed to update daily report' 
    };
  }
}

// ============================================================================
// FINANCIAL CALCULATIONS
// ============================================================================

export async function calculateFinancials(date?: string): Promise<{ data: FinancialSummary; error: string | null }> {
  try {
    const { supabase } = createClient();
    const targetDate = date || new Date().toISOString().split('T')[0];

    // Get completed sessions for the day
    const { data: sessions, error: sessionsError } = await supabase
      .from("sessions")
      .select("price, payout")
      .eq("status", "Completed")
      .gte("created_at", `${targetDate}T00:00:00Z`)
      .lt("created_at", `${targetDate}T23:59:59Z`);

    if (sessionsError) throw sessionsError;

    // Get therapist expenses for the day
    const { data: therapistExpenses, error: expensesError } = await supabase
      .from("therapist_expenses")
      .select("amount")
      .gte("created_at", `${targetDate}T00:00:00Z`)
      .lt("created_at", `${targetDate}T23:59:59Z`);

    if (expensesError) throw expensesError;

    // Get shop expenses for the day
    const { data: shopExpenses, error: shopExpensesError } = await supabase
      .from("shop_expenses")
      .select("amount")
      .gte("created_at", `${targetDate}T00:00:00Z`)
      .lt("created_at", `${targetDate}T23:59:59Z`);

    if (shopExpensesError) throw shopExpensesError;

    // Calculate totals
    const sessionRevenue = (sessions || []).reduce((sum, session) => sum + Number(session.price), 0);
    const sessionPayouts = (sessions || []).reduce((sum, session) => sum + Number(session.payout), 0);
    const therapistExpensesTotal = (therapistExpenses || []).reduce((sum, expense) => sum + Number(expense.amount), 0);
    const shopExpensesTotal = (shopExpenses || []).reduce((sum, expense) => sum + Number(expense.amount), 0);

    const shopRevenue = sessionRevenue - sessionPayouts + therapistExpensesTotal - shopExpensesTotal;
    const totalRevenue = sessionRevenue + therapistExpensesTotal;
    const netProfit = shopRevenue;

    return {
      data: {
        total_revenue: totalRevenue,
        shop_revenue: shopRevenue,
        therapist_payouts: sessionPayouts,
        net_profit: netProfit
      },
      error: null
    };
  } catch (error) {
    return { 
      data: {
        total_revenue: 0,
        shop_revenue: 0,
        therapist_payouts: 0,
        net_profit: 0
      }, 
      error: error instanceof Error ? error.message : 'Failed to calculate financials' 
    };
  }
}
