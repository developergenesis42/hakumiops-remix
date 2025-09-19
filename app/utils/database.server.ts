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
  UpdateBookingForm,
  FinancialSummary
} from "~/types";

// ============================================================================
// ROSTER OPERATIONS
// ============================================================================

export async function getRoster(): Promise<{ data: Array<{id: number; name: string; vip_number: number | null; is_active: boolean}>; error: string | null }> {
  try {
    const { supabase } = createClient();
    
    const { data, error } = await supabase
      .from('roster')
      .select('id, name, vip_number, is_active')
      .eq('is_active', true)
      .order('vip_number', { ascending: true });
    
    if (error) throw error;
    
    return { data: data || [], error: null };
  } catch (error) {
    return { 
      data: [], 
      error: error instanceof Error ? error.message : 'Failed to fetch roster' 
    };
  }
}

export async function getAvailableRosterTherapists(currentTherapistNames: string[]): Promise<{ data: Array<{id: number; name: string; vip_number: number | null}>; error: string | null }> {
  try {
    const { supabase } = createClient();
    
    const { data, error } = await supabase
      .from('roster')
      .select('id, name, vip_number')
      .eq('is_active', true)
      .not('name', 'in', `(${currentTherapistNames.map(name => `'${name}'`).join(',')})`)
      .order('vip_number', { ascending: true });
    
    if (error) throw error;
    
    return { data: data || [], error: null };
  } catch (error) {
    return { 
      data: [], 
      error: error instanceof Error ? error.message : 'Failed to fetch available roster therapists' 
    };
  }
}

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
      expenses: therapist.therapist_expenses?.map((expense: { id: string; item_name: string; amount: number }) => ({
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
      expenses: therapist.therapist_expenses?.map((expense: { id: string; item_name: string; amount: number }) => ({
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
      expenses: data.therapist_expenses?.map((expense: { id: string; item_name: string; amount: number }) => ({
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

export async function getBookingsWithDetails(): Promise<{ data: BookingWithDetails[]; error: string | null }> {
  try {
    const { supabase } = createClient();
    
    // First get all bookings
    const { data: bookings, error: bookingsError } = await supabase
      .from("bookings")
      .select("*")
      .order("start_time", { ascending: true });

    if (bookingsError) throw bookingsError;
    if (!bookings) return { data: [], error: null };

    // Get all services
    const { data: services, error: servicesError } = await supabase
      .from("services")
      .select("*");

    if (servicesError) throw servicesError;

    // Get all therapists
    const { data: therapists, error: therapistsError } = await supabase
      .from("therapists")
      .select("*");

    if (therapistsError) throw therapistsError;

    // Transform bookings to include service and therapist details
    const bookingsWithDetails = bookings.map(booking => {
      const service = services?.find(s => s.id === booking.service_id);
      const bookingTherapists = therapists?.filter(t => booking.therapist_ids.includes(t.id)) || [];
      
      return {
        ...booking,
        service,
        therapists: bookingTherapists
      };
    });

    return { data: bookingsWithDetails, error: null };
  } catch (error) {
    return { 
      data: [], 
      error: error instanceof Error ? error.message : 'Failed to fetch bookings with details' 
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

export async function updateBooking(id: string, updates: UpdateBookingForm): Promise<{ data: Booking | null; error: string | null }> {
  try {
    console.log('updateBooking called with:', { id, updates });
    
    const { supabase } = createClient();
    
    // Convert camelCase field names to snake_case for database
    const dbUpdates: Partial<Booking> = {};
    
    if (updates.serviceId !== undefined) {
      dbUpdates.service_id = updates.serviceId;
    }
    
    if (updates.therapistIds !== undefined) {
      // Ensure it's an array of strings (UUIDs)
      dbUpdates.therapist_ids = Array.isArray(updates.therapistIds) 
        ? updates.therapistIds.map(id => String(id))
        : [String(updates.therapistIds)];
    }
    
    if (updates.startTime !== undefined) {
      // startTime is already an ISO string from the frontend
      dbUpdates.start_time = updates.startTime;
    }
    
    if (updates.endTime !== undefined) {
      // endTime is already an ISO string from the frontend
      dbUpdates.end_time = updates.endTime;
    }
    
    if (updates.roomId !== undefined) {
      dbUpdates.room_id = updates.roomId;
    }
    
    if (updates.note !== undefined) {
      dbUpdates.note = updates.note;
    }
    
    // Note: status updates are not part of UpdateBookingForm
    // If needed, they should be handled separately
    
    console.log('Database updates (snake_case):', dbUpdates);
    
    const { data, error } = await supabase
      .from("bookings")
      .update(dbUpdates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error('Supabase update error:', error);
      throw error;
    }
    
    console.log('Update successful:', data);
    return { data, error: null };
  } catch (error) {
    console.error('updateBooking error:', error);
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

    // Get completed sessions for the day with all financial fields
    const { data: sessions, error: sessionsError } = await supabase
      .from("sessions")
      .select("price, payout, payment_method, discount, addon_items, addon_custom_amount")
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

    // Helper function to calculate actual paid amount for a session
    const calculateActualPaidAmount = (session: {
      price: number;
      discount?: number;
      addon_items?: Array<{ price: number }>;
      addon_custom_amount?: number;
    }) => {
      const basePrice = Number(session.price) || 0;
      const discount = Number(session.discount) || 0;
      
      // Calculate addon total
      let addonTotal = 0;
      if (session.addon_items && Array.isArray(session.addon_items)) {
        addonTotal += session.addon_items.reduce((sum: number, item: { price: number }) => sum + (Number(item.price) || 0), 0);
      }
      if (session.addon_custom_amount) {
        addonTotal += Number(session.addon_custom_amount) || 0;
      }
      
      // Actual paid amount = base price - discount + addons
      return Math.max(0, basePrice - discount + addonTotal);
    };

    // Calculate totals using actual paid amounts
    const sessionRevenue = (sessions || []).reduce((sum, session) => sum + calculateActualPaidAmount(session), 0);
    const sessionPayouts = (sessions || []).reduce((sum, session) => sum + Number(session.payout), 0);
    const therapistExpensesTotal = (therapistExpenses || []).reduce((sum, expense) => sum + Number(expense.amount), 0);
    const shopExpensesTotal = (shopExpenses || []).reduce((sum, expense) => sum + Number(expense.amount), 0);

    // Calculate payment method breakdowns using actual paid amounts
    const cashRevenue = (sessions || []).reduce((sum, session) => 
      session.payment_method === 'Cash' ? sum + calculateActualPaidAmount(session) : sum, 0);
    const thaiQrRevenue = (sessions || []).reduce((sum, session) => 
      session.payment_method === 'Thai QR Code' ? sum + calculateActualPaidAmount(session) : sum, 0);
    const wechatRevenue = (sessions || []).reduce((sum, session) => 
      session.payment_method === 'WeChat' ? sum + calculateActualPaidAmount(session) : sum, 0);
    const alipayRevenue = (sessions || []).reduce((sum, session) => 
      session.payment_method === 'Alipay' ? sum + calculateActualPaidAmount(session) : sum, 0);
    const fxCashRevenue = (sessions || []).reduce((sum, session) => 
      session.payment_method === 'FX Cash (other than THB)' ? sum + calculateActualPaidAmount(session) : sum, 0);

    const shopRevenue = sessionRevenue - sessionPayouts + therapistExpensesTotal - shopExpensesTotal;
    const totalRevenue = sessionRevenue + therapistExpensesTotal;
    const netProfit = shopRevenue;

    return {
      data: {
        total_revenue: totalRevenue,
        shop_revenue: shopRevenue,
        therapist_payouts: sessionPayouts,
        net_profit: netProfit,
        // Payment method breakdowns
        cash_revenue: cashRevenue,
        thai_qr_revenue: thaiQrRevenue,
        wechat_revenue: wechatRevenue,
        alipay_revenue: alipayRevenue,
        fx_cash_revenue: fxCashRevenue
      },
      error: null
    };
  } catch (error) {
    return { 
      data: {
        total_revenue: 0,
        shop_revenue: 0,
        therapist_payouts: 0,
        net_profit: 0,
        cash_revenue: 0,
        thai_qr_revenue: 0,
        wechat_revenue: 0,
        alipay_revenue: 0,
        fx_cash_revenue: 0
      }, 
      error: error instanceof Error ? error.message : 'Failed to calculate financials' 
    };
  }
}

// ============================================================================
// MONTHLY REPORT OPERATIONS
// ============================================================================

export async function getMonthlyData(month: string): Promise<{ data: Record<string, unknown> | null; error: string | null }> {
  try {
    const { supabase } = createClient();
    
    // Parse month (format: YYYY-MM)
    const [year, monthNum] = month.split('-');
    const startDate = `${year}-${monthNum}-01`;
    const endDate = `${year}-${monthNum}-${new Date(parseInt(year), parseInt(monthNum), 0).getDate()}`;
    
    console.log(`Fetching monthly data for ${month}: ${startDate} to ${endDate}`);
    
    // Get daily reports for the month (this is the archived data)
    const { data: dailyReports, error: dailyReportsError } = await supabase
      .from("daily_reports")
      .select("*")
      .gte("report_date", startDate)
      .lte("report_date", endDate)
      .order("report_date", { ascending: true });
    
    if (dailyReportsError) throw dailyReportsError;
    
    console.log(`Found ${dailyReports?.length || 0} daily reports for ${month}`);
    
    // Aggregate data from daily reports
    let totalRevenue = 0;
    let totalShopRevenue = 0;
    let totalTherapistPayouts = 0;
    let totalSessions = 0;
    let totalWalkouts = 0;
    let totalWalkoutPeople = 0;
    let totalShopExpenses = 0;
    
    // Aggregate detailed data from daily reports
    const allSessions: any[] = [];
    const allWalkouts: any[] = [];
    const allShopExpenses: any[] = [];
    const therapistPerformance: Record<string, { name: string; sessions: number; revenue: number; expenses: number }> = {};
    
    (dailyReports || []).forEach(report => {
      // Sum up financial totals
      totalRevenue += Number(report.total_revenue || 0);
      totalShopRevenue += Number(report.shop_revenue || 0);
      totalTherapistPayouts += Number(report.therapist_payouts || 0);
      totalSessions += Number(report.session_count || 0);
      totalWalkouts += Number(report.walkout_count || 0);
      
      // Extract detailed data from report_data JSONB
      if (report.report_data) {
        const reportData = report.report_data as any;
        
        // Aggregate sessions
        if (reportData.completed_sessions && Array.isArray(reportData.completed_sessions)) {
          allSessions.push(...reportData.completed_sessions);
        }
        
        // Aggregate walkouts
        if (reportData.walkouts && Array.isArray(reportData.walkouts)) {
          allWalkouts.push(...reportData.walkouts);
          totalWalkoutPeople += reportData.walkouts.reduce((sum: number, w: any) => sum + Number(w.count || 0), 0);
        }
        
        // Aggregate shop expenses
        if (reportData.shop_expenses && Array.isArray(reportData.shop_expenses)) {
          allShopExpenses.push(...reportData.shop_expenses);
          totalShopExpenses += reportData.shop_expenses.reduce((sum: number, e: any) => sum + Number(e.amount || 0), 0);
        }
        
        // Aggregate therapist performance
        if (reportData.therapist_summaries && Array.isArray(reportData.therapist_summaries)) {
          reportData.therapist_summaries.forEach((therapist: any) => {
            if (!therapistPerformance[therapist.name]) {
              therapistPerformance[therapist.name] = {
                name: therapist.name,
                sessions: 0,
                revenue: 0,
                expenses: 0
              };
            }
            therapistPerformance[therapist.name].sessions += Number(therapist.session_count || 0);
            therapistPerformance[therapist.name].expenses += Number(therapist.total_expenses || 0);
          });
        }
      }
    });
    
    // Group walkouts by reason from aggregated data
    const walkoutReasons: Record<string, number> = {};
    allWalkouts.forEach(walkout => {
      const reason = walkout.reason || 'Unknown';
      walkoutReasons[reason] = (walkoutReasons[reason] || 0) + Number(walkout.count || 0);
    });
    
    // Convert therapist performance to array format
    const therapistBreakdown = Object.values(therapistPerformance).map(therapist => ({
      name: therapist.name,
      grossPayout: 0, // We don't have individual payout data in daily reports
      sessionCount: therapist.sessions,
      expenses: therapist.expenses,
      netPayout: -therapist.expenses, // Negative because it's expenses
      checkIn: 'N/A', // Not available in daily reports
      checkOut: 'N/A', // Not available in daily reports
      totalHours: 'N/A' // Not available in daily reports
    }));
    
    // Format shop expenses for display from aggregated data
    const formattedShopExpenses = allShopExpenses.map(expense => ({
      note: expense.note || 'Unspecified expense',
      amount: Number(expense.amount || 0),
      timestamp: new Date(expense.created_at)
    }));
    
    const monthlyData = {
      month,
      totalRevenue,
      shopRevenue: totalShopRevenue,
      therapistPayouts: totalTherapistPayouts,
      totalSessions,
      totalWalkouts,
      totalWalkoutPeople,
      totalShopExpenses,
      therapistBreakdown,
      walkoutReasons,
      shopExpenses: formattedShopExpenses
    };
    
    return { data: monthlyData, error: null };
    
  } catch (error) {
    console.error('Error fetching monthly data:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Failed to fetch monthly data' 
    };
  }
}
