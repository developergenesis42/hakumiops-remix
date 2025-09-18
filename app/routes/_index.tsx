
import { useLoaderData } from "@remix-run/react";
import React, { useState, useCallback, useMemo, useRef } from "react";
// Realtime subscriptions removed - will be handled differently
// Validation will be handled on the server side in API routes
import RoomList from "~/components/RoomList";
import TherapistGrid from "~/components/TherapistGrid";
import AddTherapistModal from "~/components/AddTherapistModal";
import SessionModal from "~/components/SessionModal";
import BookingModal from "~/components/BookingModal";
import BookingViewModal from "~/components/BookingViewModal";
import ExpenseModal from "~/components/ExpenseModal";
import DepartureModal from "~/components/DepartureModal";
import ShopExpenseModal from "~/components/ShopExpenseModal";
import ReportModal from "~/components/ReportModal";
import ModifySessionModal from "~/components/ModifySessionModal";
import MonthlyReportModal from "~/components/MonthlyReportModal";
import EndOfDayModal from "~/components/EndOfDayModal";
// ClientOnly import removed
import { Room, Therapist, SessionWithDetails, BookingWithDetails, ShopExpense, Walkout, FinancialSummary, AddonItem } from "~/types";

export async function loader() {
  try {
    console.log("Loader: Starting to load data...");
    
    // Import database functions only in the loader
    const { 
      getTherapists, 
      getRooms, 
      getServices, 
      getSessionsWithDetails, 
      getBookingsWithDetails, 
      getWalkouts, 
      getShopExpenses,
      calculateFinancials
    } = await import("~/utils/database.server");

    console.log("Loader: Database functions imported successfully");

    // Fetch all data using database service functions
    const [therapistsResult, roomsResult, servicesResult, sessionsResult, bookingsResult, walkoutsResult, shopExpensesResult, financialsResult] = await Promise.all([
      getTherapists(),
      getRooms(),
      getServices(),
      getSessionsWithDetails(), // Use getSessionsWithDetails instead of getSessions
      getBookingsWithDetails(),
      getWalkouts(),
      getShopExpenses(),
      calculateFinancials()
    ]);

    console.log("Loader: Data fetched successfully");
    console.log("Loader: Rooms count:", roomsResult.data?.length);
    console.log("Loader: Therapists count:", therapistsResult.data?.length);

    // Deduplicate therapists by name (prioritize those on duty)
    const uniqueTherapists = therapistsResult.data ? 
      therapistsResult.data.reduce((acc, therapist) => {
        const existing = acc.find(t => t.name === therapist.name);
        if (!existing) {
          acc.push(therapist);
        } else if (therapist.is_on_duty && !existing.is_on_duty) {
          // Replace with the one that's on duty
          const index = acc.findIndex(t => t.name === therapist.name);
          acc[index] = therapist;
        }
        return acc;
      }, [] as typeof therapistsResult.data) : [];

    console.log("Loader: Unique therapists count:", uniqueTherapists.length);

    return Response.json({ 
      therapists: uniqueTherapists,
      rooms: roomsResult.data,
      services: servicesResult.data,
      sessions: sessionsResult.data,
      bookings: bookingsResult.data,
      walkouts: walkoutsResult.data,
      shopExpenses: shopExpensesResult.data,
      financials: financialsResult.data,
      errors: {
        therapists: therapistsResult.error,
        rooms: roomsResult.error,
        services: servicesResult.error,
        sessions: sessionsResult.error,
        bookings: bookingsResult.error,
        walkouts: walkoutsResult.error,
        shopExpenses: shopExpensesResult.error,
        financials: financialsResult.error,
      }
    });
  } catch (error) {
    console.error("Loader: Error occurred:", error);
    return Response.json({
      therapists: [],
      rooms: [],
      services: [],
      sessions: [],
      bookings: [],
      walkouts: [],
      shopExpenses: [],
      financials: {
        total_revenue: 0,
        shop_revenue: 0,
        therapist_payouts: 0,
        net_profit: 0
      },
      errors: {
        therapists: error instanceof Error ? error.message : 'Unknown error',
        rooms: null,
        services: null,
        sessions: null,
        bookings: null,
        walkouts: null,
        shopExpenses: null,
        financials: null,
      }
    });
  }
}

// clientLoader removed - will use regular loader with proper server-side data loading

interface LoaderData {
  therapists: Therapist[];
  rooms: Room[];
  services: Array<{ id: number; name: string; category: string; room_type: string; duration: number; price: number; payout: number; created_at: string }>;
  sessions: SessionWithDetails[];
  bookings: BookingWithDetails[];
  walkouts: Walkout[];
  shopExpenses: ShopExpense[];
  financials: FinancialSummary;
  errors: {
    therapists: string | null;
    rooms: string | null;
    services: string | null;
    sessions: string | null;
    bookings: string | null;
    walkouts: string | null;
    shopExpenses: string | null;
    financials: string | null;
  };
}

export default function Home() {
  const { 
    rooms: initialRooms = [], 
    therapists: initialTherapists = [], 
    services: initialServices = [],
    sessions: initialSessions = [],
    bookings: initialBookings = [],
    walkouts: initialWalkouts = [],
    shopExpenses: initialShopExpenses = [],
    financials: initialFinancials = {
      total_revenue: 0,
      shop_revenue: 0,
      therapist_payouts: 0,
      net_profit: 0,
      cash_revenue: 0,
      thai_qr_revenue: 0,
      wechat_revenue: 0,
      alipay_revenue: 0,
      fx_cash_revenue: 0
    }
  } = useLoaderData<LoaderData>();
  
  // State management for rooms
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  
  // State management for therapists
  const [therapists, setTherapists] = useState<Therapist[]>(initialTherapists);

  const [isAddTherapistModalOpen, setIsAddTherapistModalOpen] = useState(false);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isBookingViewModalOpen, setIsBookingViewModalOpen] = useState(false);
  const [selectedTherapistForBooking, setSelectedTherapistForBooking] = useState<Therapist | null>(null);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [selectedTherapistForExpense, setSelectedTherapistForExpense] = useState<Therapist | null>(null);
  const [isDepartureModalOpen, setIsDepartureModalOpen] = useState(false);
  const [selectedTherapistForDeparture, setSelectedTherapistForDeparture] = useState<Therapist | null>(null);
  const [isShopExpenseModalOpen, setIsShopExpenseModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isModifySessionModalOpen, setIsModifySessionModalOpen] = useState(false);
  const [selectedSessionForModify, setSelectedSessionForModify] = useState<SessionWithDetails | null>(null);
  const [isMonthlyReportModalOpen, setIsMonthlyReportModalOpen] = useState(false);
  const [isEndOfDayModalOpen, setIsEndOfDayModalOpen] = useState(false);
  const [bookings, setBookings] = useState<BookingWithDetails[]>(initialBookings);
  
  // Booking to session conversion state
  const [selectedBookingForSession, setSelectedBookingForSession] = useState<BookingWithDetails | null>(null);
  const bookingForSessionRef = useRef<BookingWithDetails | null>(null);
  const [completedSessions, setCompletedSessions] = useState<SessionWithDetails[]>(initialSessions.filter(s => s.status === 'Completed'));
  const [activeSessions, setActiveSessions] = useState<SessionWithDetails[]>(initialSessions.filter(s => s.status !== 'Completed'));
  const [walkouts, setWalkouts] = useState<Walkout[]>(initialWalkouts);
  const [walkoutCount, setWalkoutCount] = useState<number>(1);
  const [walkoutReason, setWalkoutReason] = useState<string>('');
  const [shopExpenses, setShopExpenses] = useState<ShopExpense[]>(initialShopExpenses);
  const [financials, setFinancials] = useState<FinancialSummary>(initialFinancials);
  const [sessionTimers, setSessionTimers] = useState<Record<string, NodeJS.Timeout>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Services data from database
  const services = useMemo(() => initialServices, [initialServices]);

  // Handler functions
  const handleAddTherapist = async (therapistData: Omit<Therapist, 'id' | 'created_at' | 'updated_at'>) => {
    console.log('Adding therapist to duty roster:', therapistData);
    
    setIsLoading(true);
    setError(null);
    
    // Check if therapist is already on duty
    const existingTherapist = therapists.find(t => t.name === therapistData.name);
    if (existingTherapist) {
      setError(`${therapistData.name} is already on duty`);
      setIsLoading(false);
      return;
    }

    try {
      // First, get all therapists from database to find the one by name
      const therapistsResponse = await fetch('/api/therapists?all=true');
      const therapistsResult = await therapistsResponse.json();
      
      if (!therapistsResponse.ok) {
        throw new Error(`Failed to fetch therapists: ${therapistsResult.error}`);
      }

      // Find the therapist by name (case-insensitive)
      const dbTherapist = therapistsResult.data.find((t: Therapist) => 
        t.name.toLowerCase() === therapistData.name.toLowerCase()
      );

      if (!dbTherapist) {
        setError(`Therapist "${therapistData.name}" not found in database`);
        return;
      }

      // Update therapist in database to set is_on_duty = true
      const response = await fetch('/api/therapists?action=update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: dbTherapist.id,
          updates: {
            is_on_duty: true,
            status: 'Rostered'
          }
        })
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        console.error('Failed to add therapist to duty roster:', result.error);
        setError(`Failed to add therapist to duty roster: ${result.error}`);
        return;
      }

      // Update local state with the therapist now on duty
      const updatedTherapist = {
        ...dbTherapist,
        is_on_duty: true,
        status: 'Rostered' as const
      };

      setTherapists(prev => {
        const updated = [...prev, updatedTherapist];
        return updated.sort((a, b) => a.name.localeCompare(b.name));
      });

      console.log('Therapist added to duty roster successfully');
    } catch (error) {
      console.error('Failed to add therapist to duty roster:', error);
      setError('Failed to add therapist to duty roster. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTherapistClick = (therapist: Therapist) => {
    console.log('Therapist clicked:', therapist.name);
  };

  const handleBookSession = (therapistId: string) => {
    const therapist = therapists.find(t => t.id === therapistId);
    if (therapist) {
      setSelectedTherapistForBooking(therapist);
      setIsBookingModalOpen(true);
    }
  };

  const handleBookingClick = useCallback((bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;
    
    // Always allow viewing booking details
    setSelectedBookingForSession(booking);
    setIsBookingViewModalOpen(true);
  }, [bookings]);

  const handleCancelBooking = useCallback(async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      const response = await fetch('/api/bookings', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: bookingId })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to cancel booking');
      }

      // Remove booking from local state
      setBookings(prev => prev.filter(b => b.id !== bookingId));
      console.log('Booking cancelled successfully');
    } catch (error) {
      console.error('Failed to cancel booking:', error);
      alert('Failed to cancel booking. Please try again.');
    }
  }, []);

  const handleAddExpense = (therapistId: string) => {
    const therapist = therapists.find(t => t.id === therapistId);
    if (therapist) {
      setSelectedTherapistForExpense(therapist);
      setIsExpenseModalOpen(true);
    }
  };

  const handleDepartTherapist = (therapistId: string) => {
    const therapist = therapists.find(t => t.id === therapistId);
    if (therapist) {
      // Check if therapist is in session
      if (therapist.status === 'In Session') {
        alert(`${therapist.name} cannot depart while in a session.`);
        return;
      }
      setSelectedTherapistForDeparture(therapist);
      setIsDepartureModalOpen(true);
    }
  };

  const handleConfirmSession = (sessionData: {
    serviceId: number;
    therapistIds: string[];
    roomId: string;
    bookingId?: string;
    discount?: 0 | 200 | 300;
    wob?: 'W' | 'O' | 'B';
    vip_number?: number;
    nationality?: 'Chinese' | 'Foreigner';
    payment_method?: 'Cash' | 'Thai QR Code' | 'WeChat' | 'Alipay' | 'FX Cash (other than THB)';
    addon_items?: AddonItem[];
    addon_custom_amount?: number;
    notes?: string;
  }) => {
    startSession(
      sessionData.serviceId,
      sessionData.therapistIds,
      sessionData.roomId,
      sessionData.bookingId,
      sessionData.discount,
      sessionData.wob,
      sessionData.vip_number,
      sessionData.nationality,
      sessionData.payment_method,
      sessionData.addon_items,
      sessionData.addon_custom_amount,
      sessionData.notes
    );
  };

  const handleUpdateBooking = useCallback(async (bookingId: string, updates: {
    serviceId: number;
    therapistIds: string[];
    startTime: Date;
    endTime: Date;
    roomId?: string;
    note?: string;
  }) => {
    try {
      // Validate the updates before sending
      if (!updates.serviceId || !updates.therapistIds.length || !updates.startTime || !updates.endTime) {
        throw new Error('Invalid booking data provided');
      }

      // Check if end time is after start time
      if (updates.endTime <= updates.startTime) {
        throw new Error('End time must be after start time');
      }

      // Validate therapist IDs exist
      const validTherapistIds = updates.therapistIds.filter(id => 
        therapists.some(t => t.id === id)
      );
      
      if (validTherapistIds.length !== updates.therapistIds.length) {
        throw new Error('One or more therapist IDs are invalid');
      }

      const response = await fetch('/api/bookings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: bookingId,
          ...updates,
          startTime: updates.startTime.toISOString(),
          endTime: updates.endTime.toISOString()
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update booking');
      }

      // Refresh bookings data
      const updatedResponse = await fetch('/api/bookings');
      if (updatedResponse.ok) {
        const updatedBookings = await updatedResponse.json();
        setBookings(updatedBookings.data || []);
        
        // Update room statuses if room assignment changed
        const originalBooking = bookings.find(b => b.id === bookingId);
        if (originalBooking) {
          const oldRoomId = originalBooking.room_id;
          const newRoomId = updates.roomId;
          
          // If room assignment changed
          if (oldRoomId !== newRoomId) {
            setRooms(prev => prev.map(room => {
              // Mark old room as available (if it was assigned)
              if (oldRoomId && room.id === oldRoomId) {
                return { ...room, status: 'Available' as const };
              }
              // Mark new room as occupied (if assigned)
              if (newRoomId && room.id === newRoomId) {
                return { ...room, status: 'Occupied' as const };
              }
              return room;
            }));
          }
        }
      }
    } catch (error) {
      console.error('Failed to update booking:', error);
      throw error;
    }
  }, [therapists, bookings]);

  const handleStartSessionFromBooking = useCallback((bookingId: string) => {
    console.log('handleStartSessionFromBooking called with bookingId:', bookingId);
    const booking = bookings.find(b => b.id === bookingId);
    console.log('Found booking:', booking);
    if (!booking) {
      console.log('No booking found with ID:', bookingId);
      return;
    }
    
    // Check if primary therapist is available
    const primaryTherapist = therapists.find(t => t.id === booking.therapist_ids[0]);
    console.log('Primary therapist:', primaryTherapist);
    if (!primaryTherapist || primaryTherapist.status !== 'Available') {
      alert('Therapist is not available to start this booking.');
      return;
    }
    
    console.log('Opening SessionModal with booking data');
    // Store booking data in ref for immediate access
    bookingForSessionRef.current = booking;
    setSelectedBookingForSession(booking);
    setIsSessionModalOpen(true);
  }, [bookings, therapists]);

  // Note: Modal opening is now handled directly in handleStartSessionFromBooking

  const handleConfirmBooking = async (bookingData: {
    therapistIds: string[];
    serviceId: number;
    startTime: Date;
    note?: string;
  }) => {
    console.log('Creating booking:', bookingData);
    
    const service = services.find(s => s.id === bookingData.serviceId);
    if (!service) {
      setError('Service not found');
      return;
    }

    const endTime = new Date(bookingData.startTime.getTime() + service.duration * 60000);
    
    try {
      // Save to database
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: bookingData.serviceId,
          therapistIds: bookingData.therapistIds,
          startTime: bookingData.startTime.toISOString(),
          endTime: endTime.toISOString(),
          note: bookingData.note || null
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create booking');
      }

      const result = await response.json();
      console.log('Booking created successfully:', result);

      // Refresh bookings from database
      const bookingsResponse = await fetch('/api/bookings');
      if (bookingsResponse.ok) {
        const bookingsData = await bookingsResponse.json();
        setBookings(bookingsData.data || []);
      }

    } catch (error) {
      console.error('Failed to create booking:', error);
      setError(error instanceof Error ? error.message : 'Failed to create booking');
    }
  };

  const handleConfirmExpense = async (expenseData: {
    therapistId: string;
    itemId: string;
    amount: number;
    itemName: string;
  }) => {
    setIsLoading(true);
    setError(null);

    const expense = {
      therapist_id: expenseData.therapistId,
      item_name: expenseData.itemName,
      amount: expenseData.amount
    };

    // Validation will be handled on the server side

    try {
      const response = await fetch('/api/expenses?type=therapist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expense)
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        setError(result.error);
      } else if (result.data) {
        // Update therapist expenses in local state
        setTherapists(prev => prev.map(t => 
          t.id === expenseData.therapistId 
            ? { ...t, expenses: [...t.expenses, { id: result.data.id, name: result.data.item_name, amount: result.data.amount }] }
            : t
        ));

        // Update financials (therapist expenses increase shop revenue and total revenue)
        setFinancials(prev => ({
          ...prev,
          shop_revenue: prev.shop_revenue + expenseData.amount,
          total_revenue: prev.total_revenue + expenseData.amount
        }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add expense');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckIn = useCallback(async (therapistId: string) => {
    console.log('Checking in therapist:', therapistId);
    
    const checkInTime = new Date().toISOString();
    
    // Update local state first
    setTherapists(prev => prev.map(t => 
      t.id === therapistId 
        ? { ...t, status: 'Available' as const, check_in_time: checkInTime, is_on_duty: true }
        : t
    ));

    // Update database
    try {
      const response = await fetch('/api/therapists?action=update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: therapistId,
          updates: {
            status: 'Available',
            check_in_time: checkInTime,
            is_on_duty: true
          }
        })
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        console.error('Failed to update therapist in database:', result.error);
        setError(`Failed to check in therapist: ${result.error}`);
      }
    } catch (error) {
      console.error('Failed to update therapist in database:', error);
      setError('Failed to check in therapist. Please try again.');
    }
  }, [setError]);

  const handleConfirmDeparture = async (therapistId: string) => {
    console.log('Confirming departure for therapist:', therapistId);
    
    const checkOutTime = new Date().toISOString();
    
    // Update local state first
    setTherapists(prev => prev.map(t => 
      t.id === therapistId 
        ? { ...t, status: 'Departed' as const, check_out_time: checkOutTime, is_on_duty: false }
        : t
    ));

    // Update database
    try {
      const response = await fetch('/api/therapists?action=update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: therapistId,
          updates: {
            status: 'Departed',
            check_out_time: checkOutTime,
            is_on_duty: false
          }
        })
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        console.error('Failed to update therapist in database:', result.error);
        setError(`Failed to check out therapist: ${result.error}`);
      }
    } catch (error) {
      console.error('Failed to update therapist in database:', error);
      setError('Failed to check out therapist. Please try again.');
    }
  };

  const handleConfirmShopExpense = async (expenseData: {
    amount: number;
    note: string;
  }) => {
    setIsLoading(true);
    setError(null);

    const expense = {
      amount: expenseData.amount,
      note: expenseData.note || null
    };

    // Validation will be handled on the server side

    try {
      const response = await fetch('/api/expenses?type=shop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expense)
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        setError(result.error);
      } else if (result.data) {
        setShopExpenses(prev => [result.data, ...prev]);

        // Update financials (shop expenses decrease shop revenue and total revenue)
        setFinancials(prev => ({
          ...prev,
          shop_revenue: prev.shop_revenue - expenseData.amount,
          total_revenue: prev.total_revenue - expenseData.amount
        }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add shop expense');
    } finally {
      setIsLoading(false);
    }
  };

  const handleModifySession = useCallback((sessionId: string) => {
    const session = activeSessions.find(s => s.id === sessionId);
    if (session) {
      setSelectedSessionForModify(session);
      setIsModifySessionModalOpen(true);
    }
  }, [activeSessions]);

  const handleRoomStatusChange = (roomId: string, status: 'Available' | 'Occupied') => {
    setRooms(prev => prev.map(room => 
      room.id === roomId 
        ? { ...room, status }
        : room
    ));
  };

  const handleEndOfDay = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Starting end of day process...');
      
      // PHASE 1: ARCHIVE TODAY'S DATA
      console.log('Phase 1: Archiving today\'s data...');
      
      // Create daily report with today's summary
      const today = new Date().toISOString().split('T')[0];
      const dailyReport = {
        report_date: today,
        total_revenue: financials.total_revenue,
        shop_revenue: financials.shop_revenue,
        therapist_payouts: financials.therapist_payouts,
        session_count: completedSessions.length,
        walkout_count: walkouts.reduce((sum, w) => sum + w.count, 0),
        report_data: {
          completed_sessions: completedSessions,
          walkouts: walkouts,
          shop_expenses: shopExpenses,
          therapist_summaries: therapists.map(t => ({
            id: t.id,
            name: t.name,
            status: t.status,
            check_in_time: t.check_in_time,
            check_out_time: t.check_out_time,
            completed_room_ids: t.completed_room_ids,
            total_expenses: t.expenses.reduce((sum, e) => sum + e.amount, 0),
            session_count: completedSessions.filter(s => s.therapist_ids.includes(t.id)).length
          }))
        }
      };
      
      // Save daily report to database
      const reportResponse = await fetch('/api/daily-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dailyReport)
      });
      
      if (!reportResponse.ok) {
        const error = await reportResponse.json();
        throw new Error(`Failed to save daily report: ${error.error}`);
      }
      
      console.log('Daily report saved successfully');
      
      // PHASE 2: RESET FOR NEXT DAY
      console.log('Phase 2: Resetting for next day...');
      
      // Clear all active sessions (only in-progress sessions)
      setActiveSessions([]);
      
      // Clear today's bookings (keep future bookings)
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      setBookings(prev => prev.filter(booking => 
        new Date(booking.start_time) >= tomorrow
      ));
      
      // Clear today's walkouts (data is archived in daily report)
      setWalkouts([]);
      
      // Clear today's shop expenses (data is archived in daily report)
      setShopExpenses([]);
      
      // Reset therapist statuses to 'Rostered' but keep historical data
      const resetTherapists = therapists.map(therapist => ({
        ...therapist,
        status: 'Rostered' as const,
        is_on_duty: false,
        active_room_id: null,
        completed_room_ids: [], // Reset for new day
        check_in_time: null,
        check_out_time: null
        // Keep expenses array - they're archived in daily report
      }));
      
      setTherapists(resetTherapists);
      
      // Update therapists in database
      for (const therapist of resetTherapists) {
        try {
          await fetch('/api/therapists?action=update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: therapist.id,
              updates: {
                status: 'Rostered',
                is_on_duty: false,
                active_room_id: null,
                completed_room_ids: [],
                check_in_time: null,
                check_out_time: null
              }
            })
          });
        } catch (error) {
          console.error('Failed to reset therapist in database:', error);
        }
      }
      
      // Reset all rooms to 'Available'
      setRooms(prev => prev.map(room => ({
        ...room,
        status: 'Available' as const
      })));
      
      // Reset financials for new day
      setFinancials({
        total_revenue: 0,
        shop_revenue: 0,
        therapist_payouts: 0,
        net_profit: 0,
        cash_revenue: 0,
        thai_qr_revenue: 0,
        wechat_revenue: 0,
        alipay_revenue: 0,
        fx_cash_revenue: 0
      });
      
      // Clear completed sessions (data is archived in daily report)
      setCompletedSessions([]);
      
      // Clear all session timers
      Object.values(sessionTimers).forEach(timer => clearInterval(timer));
      setSessionTimers({});
      
      console.log('End of day completed successfully');
      setError(null);
      
    } catch (err) {
      console.error('Error during end of day process:', err);
      setError(err instanceof Error ? err.message : 'Failed to complete end of day process');
    } finally {
      setIsLoading(false);
    }
  }, [sessionTimers, therapists, financials, completedSessions, walkouts, shopExpenses, setError, setIsLoading]);

  const completeSession = useCallback(async (sessionId: string) => {
    const sessionIndex = activeSessions.findIndex(s => s.id === sessionId);
    if (sessionIndex === -1) return;

    const session = activeSessions[sessionIndex];
    
    setIsLoading(true);
    setError(null);

    try {
      // Update session status to completed
      const response = await fetch('/api/sessions?action=update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          updates: {
            status: 'Completed',
            end_time: new Date().toISOString()
          }
        })
      });
      
      const result = await response.json();

      if (!response.ok) {
        setError(result.error);
        return;
      }

      // Clear timer
      if (sessionTimers[sessionId]) {
        clearInterval(sessionTimers[sessionId]);
        setSessionTimers(prev => {
          const newTimers = { ...prev };
          delete newTimers[sessionId];
          return newTimers;
        });
      }

      // Update therapist statuses and add completed room ID
      const updatedTherapists = therapists.map(t => 
        session.therapist_ids.includes(t.id) 
          ? { 
              ...t, 
              status: 'Available' as const,
              completed_room_ids: [...(t.completed_room_ids || []), session.room_id]
            }
          : t
      );
      
      setTherapists(updatedTherapists);

      // Update therapists in database
      for (const therapist of updatedTherapists) {
        if (session.therapist_ids.includes(therapist.id)) {
          try {
            await fetch('/api/therapists?action=update', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                id: therapist.id,
                updates: {
                  status: therapist.status,
                  completed_room_ids: therapist.completed_room_ids
                }
              })
            });
          } catch (error) {
            console.error('Failed to update therapist in database:', error);
          }
        }
      }

      // Update room status
      setRooms(prev => prev.map(room => 
        room.id === session.room_id 
          ? { ...room, status: 'Available' as const }
          : room
      ));

      // Add to completed sessions
      setCompletedSessions(prev => [...prev, { ...session, status: 'Completed' }]);

      // Remove from active sessions
      setActiveSessions(prev => prev.filter(s => s.id !== sessionId));

      // Recalculate financials
      try {
        const financialResponse = await fetch('/api/financials');
        const financialResult = await financialResponse.json();
        
        if (financialResponse.ok && financialResult.data) {
          setFinancials(financialResult.data);
        }
      } catch (error) {
        console.error('Failed to update financials:', error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete session');
    } finally {
      setIsLoading(false);
    }
  }, [activeSessions, sessionTimers, setFinancials, setTherapists, setCompletedSessions, setActiveSessions, setSessionTimers, therapists]);

  const startTimerForSession = useCallback((sessionId: string, endTime: Date) => {
    const updateTimer = () => {
      const remaining = endTime.getTime() - new Date().getTime();
      
      if (remaining <= 0) {
        // Session finished
        completeSession(sessionId);
        return;
      }

      // Force re-render by updating a timer state
      setSessionTimers(prev => ({ ...prev }));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    setSessionTimers(prev => ({ ...prev, [sessionId]: interval }));
  }, [completeSession]);

  const handleConfirmModifySession = useCallback(async (modifyData: {
    sessionId: string;
    newServiceId: number;
    newRoomId: string;
    newTherapistIds?: string[];
  }) => {
    console.log('Modifying session:', modifyData);
    
    const session = activeSessions.find(s => s.id === modifyData.sessionId);
    if (!session) {
      setError('Session not found');
      return;
    }

    const originalService = services.find(s => s.id === session.service_id);
    const newService = services.find(s => s.id === modifyData.newServiceId);
    const originalRoom = rooms.find(r => r.id === session.room_id);
    const newRoom = rooms.find(r => r.id === modifyData.newRoomId);

    if (!originalService || !newService || !originalRoom || !newRoom) {
      setError('Invalid service or room selection');
      return;
    }

    // Handle therapist changes if provided
    let newTherapistIds = session.therapist_ids;
    if (modifyData.newTherapistIds) {
      // Validate new therapists are available
      const unavailableTherapists = modifyData.newTherapistIds
        .map(id => therapists.find(t => t.id === id))
        .filter(t => !t || (t.status !== 'Available' && !session.therapist_ids.includes(t.id)));
      
      if (unavailableTherapists.length > 0) {
        setError(`${unavailableTherapists.map(t => t?.name).join(', ')} is/are not available.`);
        return;
      }
      
      newTherapistIds = modifyData.newTherapistIds;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Update session in database
      const response = await fetch('/api/sessions?action=update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: modifyData.sessionId,
          updates: {
            service_id: modifyData.newServiceId,
            room_id: modifyData.newRoomId,
            therapist_ids: newTherapistIds,
            duration: newService.duration,
            price: newService.price,
            payout: newService.payout
          }
        })
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        setError(result.error);
        return;
      }

      // Update therapist statuses if therapists changed
      if (modifyData.newTherapistIds) {
        const oldTherapistIds = session.therapist_ids;
        const therapistsToRemove = oldTherapistIds.filter(id => !newTherapistIds.includes(id));
        const therapistsToAdd = newTherapistIds.filter(id => !oldTherapistIds.includes(id));

        // Remove old therapists from session (set to Available)
        if (therapistsToRemove.length > 0) {
          setTherapists(prev => prev.map(t => 
            therapistsToRemove.includes(t.id) 
              ? { ...t, status: 'Available' as const }
              : t
          ));
        }

        // Add new therapists to session (set to In Session)
        if (therapistsToAdd.length > 0) {
          setTherapists(prev => prev.map(t => 
            therapistsToAdd.includes(t.id) 
              ? { ...t, status: 'In Session' as const }
              : t
          ));
        }
      }

      // Update local state
      setActiveSessions(prev => prev.map(s => {
        if (s.id === modifyData.sessionId) {
          const updatedSession: SessionWithDetails = {
            ...s,
            service_id: modifyData.newServiceId,
            room_id: modifyData.newRoomId,
            therapist_ids: newTherapistIds,
            duration: newService.duration,
            price: newService.price,
            payout: newService.payout,
            service: {
              ...newService,
              category: newService.category as '1 Lady' | '2 Ladies' | 'Couple',
              room_type: newService.room_type as 'Shower' | 'VIP Jacuzzi'
            },
            room: {
              ...newRoom,
              status: 'Occupied' as const
            },
            therapists: newTherapistIds.map(id => therapists.find(t => t.id === id)).filter(Boolean) as Therapist[]
          };

          // If session is in progress, recalculate timer
          if (s.status === 'In Progress' && s.start_time) {
            const durationDifferenceMs = (newService.duration - originalService.duration) * 60 * 1000;
            const newEndTime = new Date(new Date(s.end_time || '').getTime() + durationDifferenceMs);
            updatedSession.end_time = newEndTime.toISOString();

            // Clear existing timer and start new one
            if (sessionTimers[s.id]) {
              clearInterval(sessionTimers[s.id]);
              setSessionTimers(prev => {
                const newTimers = { ...prev };
                delete newTimers[s.id];
                return newTimers;
              });
            }

            // Start new timer with updated end time
            startTimerForSession(s.id, newEndTime);
          }

          return updatedSession;
        }
        return s;
      }));

      // Update room statuses
      if (originalRoom.id !== newRoom.id) {
        setRooms(prev => prev.map(room => {
          if (room.id === originalRoom.id) {
            return { ...room, status: 'Available' as const };
          }
          if (room.id === newRoom.id) {
            return { ...room, status: 'Occupied' as const };
          }
          return room;
        }));
      }

      console.log('Session modified successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to modify session');
    } finally {
      setIsLoading(false);
    }
  }, [activeSessions, services, rooms, therapists, sessionTimers, startTimerForSession, setActiveSessions, setRooms, setTherapists, setSessionTimers]);

  const handleLogWalkout = async () => {
    if (!walkoutReason || walkoutCount <= 0) {
      setError("Please provide a valid reason and count.");
      return;
    }

    setIsLoading(true);
    setError(null);

    const walkout = {
      reason: walkoutReason as 'No Rooms' | 'No Ladies' | 'Price Too High' | 'Client Too Picky' | 'Chinese' | 'Laowai',
      count: walkoutCount
    };

    // Validation will be handled on the server side

    try {
      const response = await fetch('/api/walkouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(walkout)
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        setError(result.error);
      } else if (result.data) {
        setWalkouts(prev => [result.data, ...prev]);
        setWalkoutCount(1);
        setWalkoutReason('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to log walkout');
    } finally {
      setIsLoading(false);
    }
  };

  const getWalkoutReasonClass = (reason: string) => {
    const reasonClasses: Record<string, string> = {
      'No Rooms': 'bg-red-500',
      'No Ladies': 'bg-pink-500',
      'Price Too High': 'bg-yellow-500',
      'Client Too Picky': 'bg-orange-500',
      'Chinese': 'bg-blue-500',
      'Laowai': 'bg-purple-500'
    };
    return reasonClasses[reason] || 'bg-gray-500';
  };

  // Session Management Functions
  const startSession = async (
    serviceId: number,
    therapistIds: string[],
    roomId: string,
    bookingId?: string,
    discount?: 0 | 200 | 300,
    wob?: 'W' | 'O' | 'B',
    vip_number?: number,
    nationality?: 'Chinese' | 'Foreigner',
    payment_method?: 'Cash' | 'Thai QR Code' | 'WeChat' | 'Alipay' | 'FX Cash (other than THB)',
    addon_items?: AddonItem[],
    addon_custom_amount?: number,
    notes?: string
  ) => {
    setIsLoading(true);
    setError(null);

    const service = services.find(s => s.id === serviceId);
    const room = rooms.find(r => r.id === roomId);
    const selectedTherapists = therapistIds.map(id => therapists.find(t => t.id === id)).filter(Boolean) as Therapist[];
    
    if (!service || !room || selectedTherapists.length === 0) {
      setError('Invalid selection or resource not available.');
      setIsLoading(false);
      return;
    }

    // Check if all therapists are available
    const unavailableTherapists = selectedTherapists.filter(t => t.status !== 'Available');
    if (unavailableTherapists.length > 0) {
      setError(`${unavailableTherapists.map(t => t.name).join(', ')} is/are not available.`);
      setIsLoading(false);
      return;
    }

    // Check if room is available
    if (room.status !== 'Available') {
      setError(`${room.name} is not available.`);
      setIsLoading(false);
      return;
    }

    const sessionData = {
      service_id: serviceId,
      therapist_ids: therapistIds,
      room_id: roomId,
      status: 'Ready' as const,
      duration: service.duration,
      start_time: null,
      end_time: null,
      price: Math.max(0, service.price - (discount || 0)),
      payout: service.payout,
      // custom fields persisted if backend supports
      discount: discount || 0,
      wob: wob || 'W',
      vip_number: vip_number || undefined,
      nationality: nationality || 'Chinese',
      payment_method: payment_method || 'Cash',
      addon_items: addon_items || undefined,
      addon_custom_amount: addon_custom_amount || undefined,
      notes: notes || undefined
    };

    // Validation will be handled on the server side

    try {
      const response = await fetch('/api/sessions?action=create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionData)
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        setError(result.error);
      } else if (result.data) {
        const data = result.data;
        // Update therapist statuses
        setTherapists(prev => prev.map(t => 
          therapistIds.includes(t.id) ? { ...t, status: 'In Session' as const } : t
        ));

        // Update room status
        setRooms(prev => prev.map(room => 
          room.id === roomId 
            ? { ...room, status: 'Occupied' as const }
            : room
        ));

        // Add to active sessions
        const newSession: SessionWithDetails = {
          ...data,
          service: {
            id: service.id,
            category: service.category as '1 Lady' | '2 Ladies' | 'Couple',
            room_type: service.room_type as 'Shower' | 'VIP Jacuzzi',
            name: service.name,
            duration: service.duration,
            price: service.price,
            payout: service.payout,
            created_at: service.created_at
          },
          therapists: selectedTherapists,
          room: { ...room, status: 'Occupied' as const }
        };
        setActiveSessions(prev => [...prev, newSession]);

        // Remove booking if it exists
        if (bookingId) {
          setBookings(prev => prev.filter(b => b.id !== bookingId));
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start session');
    } finally {
      setIsLoading(false);
    }
  };

  const beginSessionTimer = useCallback(async (sessionId: string) => {
    const session = activeSessions.find(s => s.id === sessionId);
    if (!session || session.status !== 'Ready') return;

    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + session.duration * 60 * 1000);

    setIsLoading(true);
    setError(null);

    try {
      // Update session status and times in database
      const response = await fetch('/api/sessions?action=update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          updates: {
            status: 'In Progress',
            start_time: startTime.toISOString(),
            end_time: endTime.toISOString()
          }
        })
      });
      
      const result = await response.json();

      if (!response.ok) {
        setError(result.error);
        return;
      }

      // Update local state
      setActiveSessions(prev => prev.map(s => 
        s.id === sessionId 
          ? { ...s, status: 'In Progress', start_time: startTime.toISOString(), end_time: endTime.toISOString() }
          : s
      ));

      // Start timer
      startTimerForSession(sessionId, endTime);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start session timer');
    } finally {
      setIsLoading(false);
    }
  }, [activeSessions, startTimerForSession]);

  const getSessionTimeRemaining = (session: SessionWithDetails) => {
    if (!session.end_time) return null;
    
    const endTime = new Date(session.end_time);
    const remaining = endTime.getTime() - new Date().getTime();
    if (remaining <= 0) return "Finished";
    
    const totalMinutes = Math.floor(remaining / 1000 / 60);
    const minutes = totalMinutes % 60;
    const hours = Math.floor(totalMinutes / 60);
    const seconds = Math.floor((remaining / 1000) % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
  };

  // Update financials when dependencies change
  React.useEffect(() => {
    const updateFinancials = async () => {
      try {
        const response = await fetch('/api/financials');
        const result = await response.json();
        
        if (response.ok && result.data) {
          setFinancials(result.data);
        }
      } catch (error) {
        console.error('Failed to update financials:', error);
      }
    };
    updateFinancials();
  }, [completedSessions, shopExpenses]);

  // Real-time subscriptions removed for now - will implement with client-side Supabase client later
  // For now, the app will work with manual refreshes and API calls

  // Set up global booking click handler
  React.useEffect(() => {
    (window as unknown as { bookingClickHandler?: (id: string) => void }).bookingClickHandler = handleBookingClick;
    (window as unknown as { cancelBookingHandler?: (id: string) => void }).cancelBookingHandler = handleCancelBooking;
    return () => {
      delete (window as unknown as { bookingClickHandler?: (id: string) => void }).bookingClickHandler;
      delete (window as unknown as { cancelBookingHandler?: (id: string) => void }).cancelBookingHandler;
    };
  }, [handleBookingClick, handleCancelBooking]);

  // Event listeners for session management buttons
  React.useEffect(() => {
    const handleClick = (e: Event) => {
      const target = e.target as HTMLElement;
      
      if (target.matches('.begin-session-timer-btn')) {
        const sessionId = target.getAttribute('data-session-id');
        if (sessionId) {
          beginSessionTimer(sessionId);
        }
      }
      
      if (target.matches('.complete-session-btn')) {
        const sessionId = target.getAttribute('data-session-id');
        if (sessionId) {
          completeSession(sessionId);
        }
      }
      
      if (target.matches('.modify-session-btn')) {
        const sessionId = target.getAttribute('data-session-id');
        if (sessionId) {
          handleModifySession(sessionId);
        }
      }
      
      if (target.matches('.check-in-btn')) {
        const therapistId = target.getAttribute('data-therapist-id');
        if (therapistId) {
          handleCheckIn(therapistId);
        }
      }
      
      if (target.matches('.start-session-for-therapist-btn')) {
        const therapistId = target.getAttribute('data-therapist-id');
        if (therapistId) {
          const therapist = therapists.find(t => t.id === therapistId);
          if (therapist) {
            setSelectedTherapistForBooking(therapist);
            setIsSessionModalOpen(true);
          }
        }
      }
      
      if (target.matches('.booking-item')) {
        const bookingId = target.getAttribute('data-booking-id');
        if (bookingId) {
          const booking = bookings.find(b => b.id === bookingId);
          if (booking) {
            // Check if therapist is available
            const therapist = therapists.find(t => t.id === booking.therapist_ids[0]);
            if (therapist && therapist.status === 'Available') {
              // Pre-populate session modal with booking data
              setSelectedTherapistForBooking(therapist);
              setIsSessionModalOpen(true);
              // TODO: Pre-populate session modal with booking service and therapist
            } else {
              setError('Therapist is not available to start this booking.');
            }
          }
        }
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [beginSessionTimer, completeSession, handleCheckIn, handleModifySession, therapists, bookings, setSelectedTherapistForBooking, setIsSessionModalOpen]);



  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 antialiased flex flex-col">
      {/* Header */}
      <header className="bg-gray-900/80 backdrop-blur-sm p-4 shadow-lg sticky top-0 z-20 border-b border-gray-700 flex-shrink-0">
        <h1 className="text-2xl font-bold text-center text-white tracking-wider">HAKUMI NURU MASSAGE</h1>
        <p className="text-center text-sm text-gray-400">Operations Command Center</p>
        
        {/* Error Display */}
        {error && (
          <div className="mt-4 bg-red-900/50 border border-red-500 text-red-200 px-4 py-2 rounded-lg text-center">
            {error}
          </div>
        )}
        
        {/* Loading Indicator */}
        {isLoading && (
          <div className="mt-4 bg-blue-900/50 border border-blue-500 text-blue-200 px-4 py-2 rounded-lg text-center">
            Processing...
          </div>
        )}

        {/* Temporary Reset Button - Development Only */}
        {process.env.NODE_ENV !== 'production' && (
          <div className="mt-4 flex justify-center">
            <button
              onClick={async () => {
                if (confirm('⚠️ This will clear ALL test data (bookings, sessions, expenses, etc.) but preserve therapist roster, services, and rooms. Continue?')) {
                  try {
                    setIsLoading(true);
                    const response = await fetch('/api/reset-data', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                    });
                    
                    const result = await response.json();
                    
                    if (result.success) {
                      alert('✅ Data reset completed! Page will reload...');
                      window.location.reload();
                    } else {
                      alert(`❌ Reset failed: ${result.error}`);
                    }
                  } catch (error) {
                    alert(`❌ Reset failed: ${error}`);
                  } finally {
                    setIsLoading(false);
                  }
                }
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 border border-red-500"
              disabled={isLoading}
            >
              🧹 Reset Test Data
            </button>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex flex-1 overflow-hidden">
        {/* Main Area: Therapists */}
        <div className="flex-grow p-4 lg:p-6 overflow-y-auto">
          <TherapistGrid
            therapists={therapists}
            activeSessions={activeSessions}
            bookings={bookings}
            rooms={rooms}
            onTherapistClick={handleTherapistClick}
            onBookSession={handleBookSession}
            onAddExpense={handleAddExpense}
            onDepartTherapist={handleDepartTherapist}
            onModifySession={handleModifySession}
            onBeginSessionTimer={beginSessionTimer}
            onCompleteSession={completeSession}
            onBookingClick={handleBookingClick}
            onCancelBooking={handleCancelBooking}
            getSessionTimeRemaining={getSessionTimeRemaining}
            onAddTherapist={() => {
              console.log('Setting modal open to true');
              setIsAddTherapistModalOpen(true);
            }}
          />
        </div>

        {/* Sidebar: Rooms & Walkouts */}
        <aside className="w-full lg:w-80 xl:w-96 flex-shrink-0 bg-gray-900/50 border-l border-gray-700 p-4 lg:p-6 flex flex-col overflow-y-auto">
          {/* Room Status */}
          <div className="flex-shrink-0">
            <h2 className="text-xl font-bold text-white border-b border-gray-700 pb-2 mb-4">Room Status</h2>
            <RoomList 
              rooms={rooms as Room[]} 
              activeSessions={activeSessions} 
              onRoomStatusChange={handleRoomStatusChange}
            />
          </div>

          {/* Walkout Module */}
          <div className="flex-grow flex flex-col mt-6">
            <h2 className="text-xl font-bold text-white border-b border-gray-700 pb-2 mb-4">Walkout Tracking</h2>
            {/* Walkout Form */}
            <div className="bg-gray-800 p-4 rounded-lg space-y-3 mb-4">
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  id="walkout-count"
                  className="w-20 bg-gray-700 text-white border-gray-600 rounded-md p-2 text-center" 
                  value={walkoutCount}
                  onChange={(e) => setWalkoutCount(parseInt(e.target.value) || 1)}
                  min={1}
                />
                <select 
                  id="walkout-reason"
                  className="flex-grow bg-gray-700 text-white border-gray-600 rounded-md p-2"
                  value={walkoutReason}
                  onChange={(e) => setWalkoutReason(e.target.value)}
                >
                  <option value="">Select reason...</option>
                  <option value="No Rooms">No Rooms</option>
                  <option value="No Ladies">No Ladies</option>
                  <option value="Price Too High">Price Too High</option>
                  <option value="Client Too Picky">Client Too Picky</option>
                  <option value="Chinese">Chinese</option>
                  <option value="Laowai">Laowai</option>
                </select>
              </div>
              <button 
                onClick={handleLogWalkout}
                className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
              >
                Log Walkout
              </button>
            </div>
            {/* Walkout Display */}
            <div className="flex-grow overflow-y-auto pr-2">
              <div className="text-center text-sm text-gray-400 mb-2">
                {walkouts.length} Incidents | {walkouts.reduce((sum, w) => sum + w.count, 0)} People
              </div>
              <div className="space-y-2">
                {walkouts.length === 0 ? (
                  <div className="text-center text-gray-500 text-sm pt-4">No walkouts logged.</div>
                ) : (
                  walkouts.map(walkout => (
                    <div key={walkout.id} className="bg-gray-800 p-2 rounded-md flex justify-between items-center text-sm">
                      <div>
                        <span className="font-bold text-white">
                          {walkout.count} {walkout.count > 1 ? 'people' : 'person'}
                        </span>
                        <span className="text-gray-400 text-xs">
                          {' '}at {new Date(walkout.created_at).toLocaleTimeString('en-US', { 
                            hour: '2-digit', 
                            minute: '2-digit',
                            hour12: false,
                            timeZone: 'UTC'
                          })}
                        </span>
                      </div>
                      <span className={`text-white text-xs font-semibold px-2 py-1 rounded-full ${getWalkoutReasonClass(walkout.reason)}`}>
                        {walkout.reason}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </aside>
      </main>

      {/* Footer: Stats and Actions */}
      <footer className="flex-shrink-0 bg-gray-900/80 backdrop-blur-sm p-4 border-t border-gray-700 z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
          {/* Stats */}
          <div className="md:col-span-3 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-gray-800 p-3 rounded-lg text-center">
              <p className="text-sm text-gray-400">Total Revenue</p>
              <p className="text-xl font-bold text-green-400">
                ฿{financials.total_revenue.toLocaleString('en-US', { 
                  minimumFractionDigits: 2, 
                  maximumFractionDigits: 2,
                  useGrouping: true
                })}
              </p>
            </div>
            <div className="bg-gray-800 p-3 rounded-lg text-center">
              <p className="text-sm text-gray-400">Shop Revenue</p>
              <p className="text-lg font-semibold text-blue-400">
                ฿{financials.shop_revenue.toLocaleString('en-US', { 
                  minimumFractionDigits: 2, 
                  maximumFractionDigits: 2,
                  useGrouping: true
                })}
              </p>
            </div>
            <div className="bg-gray-800 p-3 rounded-lg text-center">
              <p className="text-sm text-gray-400">Gross Payouts</p>
              <p className="text-lg font-semibold text-yellow-400">
                ฿{financials.therapist_payouts.toLocaleString('en-US', { 
                  minimumFractionDigits: 2, 
                  maximumFractionDigits: 2,
                  useGrouping: true
                })}
              </p>
            </div>
            <div className="bg-gray-800 p-3 rounded-lg text-center">
              <p className="text-sm text-gray-400">Net Profit</p>
              <p className="text-lg font-semibold text-purple-400">
                ฿{financials.net_profit.toLocaleString('en-US', { 
                  minimumFractionDigits: 2, 
                  maximumFractionDigits: 2,
                  useGrouping: true
                })}
              </p>
            </div>
          </div>
          {/* Actions */}
          <div className="md:col-span-2 flex flex-col sm:flex-row md:flex-col gap-2">
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => setIsShopExpenseModalOpen(true)}
                className="w-full bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
              >
                Shop Expense
              </button>
              <button 
                onClick={() => setIsReportModalOpen(true)}
                className="w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
              >
                Daily Report
              </button>
              <button 
                onClick={() => setIsMonthlyReportModalOpen(true)}
                className="w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
              >
                Monthly Report
              </button>
              <button 
                onClick={() => setIsEndOfDayModalOpen(true)}
                className="w-full bg-red-700 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
              >
                End of Day
              </button>
            </div>
            <button 
              onClick={() => setIsSessionModalOpen(true)}
              className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-4 rounded-lg transition duration-200 shadow-lg"
            >
              ✨ Start New Session
            </button>
          </div>
        </div>
      </footer>

      {/* Add Therapist Modal */}
      <AddTherapistModal
        isOpen={isAddTherapistModalOpen}
        onClose={() => setIsAddTherapistModalOpen(false)}
        onAddTherapist={handleAddTherapist}
        currentTherapists={therapists}
      />

      {/* Session Modal */}
      <SessionModal
        isOpen={isSessionModalOpen}
        onClose={() => {
          setIsSessionModalOpen(false);
          setSelectedBookingForSession(null);
          setSelectedTherapistForBooking(null);
        }}
        onConfirmSession={handleConfirmSession}
        therapists={therapists}
        rooms={rooms as Room[]}
        preselectedTherapistId={selectedBookingForSession?.therapist_ids[0] || selectedTherapistForBooking?.id}
        bookingId={selectedBookingForSession?.id}
        bookingNote={selectedBookingForSession?.note || undefined}
        bookingData={bookingForSessionRef.current || selectedBookingForSession || undefined}
      />

      {/* Booking Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => {
          setIsBookingModalOpen(false);
          setSelectedTherapistForBooking(null);
        }}
        onConfirmBooking={handleConfirmBooking}
        therapist={selectedTherapistForBooking}
        allTherapists={therapists}
      />

      {/* Booking View/Edit Modal */}
      <BookingViewModal
        isOpen={isBookingViewModalOpen}
        onClose={() => {
          setIsBookingViewModalOpen(false);
          setSelectedBookingForSession(null);
        }}
        onUpdateBooking={handleUpdateBooking}
        onStartSession={handleStartSessionFromBooking}
        onCancelBooking={handleCancelBooking}
        booking={selectedBookingForSession}
        therapists={therapists}
        rooms={rooms}
      />

      {/* Expense Modal */}
      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => {
          setIsExpenseModalOpen(false);
          setSelectedTherapistForExpense(null);
        }}
        onConfirmExpense={handleConfirmExpense}
        therapist={selectedTherapistForExpense}
      />

      {/* Departure Modal */}
      <DepartureModal
        isOpen={isDepartureModalOpen}
        onClose={() => {
          setIsDepartureModalOpen(false);
          setSelectedTherapistForDeparture(null);
        }}
        onConfirmDeparture={handleConfirmDeparture}
        therapist={selectedTherapistForDeparture}
        completedSessions={completedSessions}
      />

      {/* Shop Expense Modal */}
      <ShopExpenseModal
        isOpen={isShopExpenseModalOpen}
        onClose={() => setIsShopExpenseModalOpen(false)}
        onConfirmExpense={handleConfirmShopExpense}
      />

      {/* Report Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        therapists={therapists}
        completedSessions={completedSessions}
        walkouts={walkouts}
        shopExpenses={shopExpenses}
        financials={financials}
      />

      {/* Modify Session Modal */}
      <ModifySessionModal
        isOpen={isModifySessionModalOpen}
        onClose={() => {
          setIsModifySessionModalOpen(false);
          setSelectedSessionForModify(null);
        }}
        onConfirmModify={handleConfirmModifySession}
        session={selectedSessionForModify}
        therapists={therapists}
        rooms={rooms as Room[]}
      />

      {/* Monthly Report Modal */}
      <MonthlyReportModal
        isOpen={isMonthlyReportModalOpen}
        onClose={() => setIsMonthlyReportModalOpen(false)}
      />

      {/* End of Day Modal */}
      <EndOfDayModal
        isOpen={isEndOfDayModalOpen}
        onClose={() => setIsEndOfDayModalOpen(false)}
        onConfirmEndOfDay={handleEndOfDay}
      />
    </div>
  );
}

