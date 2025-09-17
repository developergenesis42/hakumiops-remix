
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import React, { useState, useCallback, useMemo } from "react";
import { createClient } from "~/utils/supabase.server";
import RoomList from "~/components/RoomList";
import TherapistGrid from "~/components/TherapistGrid";
import AddTherapistModal from "~/components/AddTherapistModal";
import SessionModal from "~/components/SessionModal";
import BookingModal from "~/components/BookingModal";
import ExpenseModal from "~/components/ExpenseModal";
import DepartureModal from "~/components/DepartureModal";
import ShopExpenseModal from "~/components/ShopExpenseModal";
import ReportModal from "~/components/ReportModal";
import ModifySessionModal from "~/components/ModifySessionModal";
import MonthlyReportModal from "~/components/MonthlyReportModal";
import EndOfDayModal from "~/components/EndOfDayModal";
import { Room, Therapist, SessionWithDetails, BookingWithDetails, RoomType, RoomStatus } from "~/types";

export async function loader() {
  try {
    const { supabase } = createClient();
    
    // Fetch data from Supabase tables
    const { data: therapists, error: therapistsError } = await supabase
      .from("therapists")
      .select("id, name");
    
    const { data: rooms, error: roomsError } = await supabase
      .from("rooms")
      .select("id, name, type, status, created_at, updated_at");
    
    const { data: services, error: servicesError } = await supabase
      .from("services")
      .select("id, name, category, price");

    return json({ 
      therapists: therapists || [],
      rooms: rooms || [],
      services: services || [],
      errors: {
        therapists: therapistsError?.message,
        rooms: roomsError?.message,
        services: servicesError?.message,
      }
    });
  } catch (error) {
    return json({
      therapists: [],
      rooms: [],
      services: [],
      errors: {
        therapists: error instanceof Error ? error.message : 'Unknown error',
        rooms: null,
        services: null,
      }
    });
  }
}

interface LoaderData {
  therapists: Array<{ id: string; name: string }>;
  rooms: Array<{ 
    id: string; 
    name: string; 
    type: string; 
    status: string;
    created_at: string;
    updated_at: string;
  }>;
  services: Array<{ id: string; name: string; category: string; price: number }>;
  errors: {
    therapists: string | null;
    rooms: string | null;
    services: string | null;
  };
}

export default function Home() {
  const { rooms: initialRooms = [] } = useLoaderData<LoaderData>();
  
  // State management for rooms
  const [rooms, setRooms] = useState<Room[]>(initialRooms.map(room => ({
    ...room,
    type: room.type as RoomType,
    status: room.status as RoomStatus
  })));
  
  // State management for therapists
  const [therapists, setTherapists] = useState<Therapist[]>([
    {
      id: '1',
      name: 'Sarah Johnson',
      is_on_duty: true,
      status: 'Available',
      check_in_time: '2024-01-15T09:00:00Z',
      check_out_time: null,
      active_room_id: null,
      completed_room_ids: ['Room 1', 'Room 3'],
      expenses: [
        { id: 'exp-1', name: 'Condom 12', amount: 50 },
        { id: 'exp-2', name: 'Lube', amount: 100 }
      ],
      created_at: '2024-01-15T08:00:00Z',
      updated_at: '2024-01-15T09:00:00Z'
    },
    {
      id: '2',
      name: 'Emma Wilson',
      is_on_duty: true,
      status: 'Rostered',
      check_in_time: null,
      check_out_time: null,
      active_room_id: null,
      completed_room_ids: [],
      expenses: [
        { id: 'exp-3', name: 'Towel', amount: 30 }
      ],
      created_at: '2024-01-15T08:00:00Z',
      updated_at: '2024-01-15T09:00:00Z'
    },
    {
      id: '3',
      name: 'Lisa Chen',
      is_on_duty: true,
      status: 'In Session',
      check_in_time: '2024-01-15T08:30:00Z',
      check_out_time: null,
      active_room_id: 'Room 2',
      completed_room_ids: ['Room 1'],
      expenses: [],
      created_at: '2024-01-15T08:00:00Z',
      updated_at: '2024-01-15T09:00:00Z'
    }
  ]);

  const [isAddTherapistModalOpen, setIsAddTherapistModalOpen] = useState(false);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
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
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [completedSessions, setCompletedSessions] = useState<SessionWithDetails[]>([
    {
      id: 'completed-1',
      service_id: 2,
      therapist_ids: ['1'],
      room_id: '1',
      status: 'Completed',
      duration: 60,
      start_time: '2024-01-15T10:00:00Z',
      end_time: '2024-01-15T11:00:00Z',
      price: 3500,
      payout: 1500,
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T11:00:00Z',
      service: {
        id: 2,
        category: '1 Lady',
        room_type: 'Shower',
        name: '60 min Shower',
        duration: 60,
        price: 3500,
        payout: 1500,
        created_at: '2024-01-15T08:00:00Z'
      },
      therapists: [{
        id: '1',
        name: 'Ally',
        is_on_duty: true,
        status: 'Available',
        check_in_time: '2024-01-15T09:00:00Z',
        check_out_time: null,
        active_room_id: null,
        completed_room_ids: [],
        expenses: [
          { id: 'exp-1', name: 'Condom 12', amount: 50 },
          { id: 'exp-2', name: 'Lube', amount: 100 }
        ],
        created_at: '2024-01-15T08:00:00Z',
        updated_at: '2024-01-15T11:00:00Z'
      }],
      room: {
        id: '1',
        name: 'Room 1',
        type: 'Shower',
        status: 'Available',
        created_at: '2024-01-15T08:00:00Z',
        updated_at: '2024-01-15T11:00:00Z'
      }
    }
  ]);
  const [mockActiveSessions, setMockActiveSessions] = useState<SessionWithDetails[]>([]);
  const [walkouts, setWalkouts] = useState<Array<{id: string; reason: string; count: number; timestamp: Date}>>([]);
  const [walkoutCount, setWalkoutCount] = useState<number>(1);
  const [walkoutReason, setWalkoutReason] = useState<string>('');
  const [shopExpenses, setShopExpenses] = useState<Array<{id: string; amount: number; note: string; timestamp: Date}>>([]);
  const [financials, setFinancials] = useState({
    totalRevenue: 0,
    shopRevenue: 0,
    therapistPayouts: 0,
    netProfit: 0
  });
  const [sessionTimers, setSessionTimers] = useState<Record<string, NodeJS.Timeout>>({});

  // Services data
  const services = useMemo(() => [
    { id: 1, category: '1 Lady', roomType: 'Shower', name: '40 min Shower', duration: 40, price: 3200, payout: 1300 },
    { id: 2, category: '1 Lady', roomType: 'Shower', name: '60 min Shower', duration: 60, price: 3500, payout: 1500 },
    { id: 3, category: '1 Lady', roomType: 'Shower', name: '90 min Shower', duration: 90, price: 4000, payout: 1800 },
    { id: 4, category: '1 Lady', roomType: 'VIP Jacuzzi', name: '60 min VIP', duration: 60, price: 4000, payout: 2000 },
    { id: 5, category: '1 Lady', roomType: 'VIP Jacuzzi', name: '90 min VIP', duration: 90, price: 5000, payout: 2300 },
    { id: 6, category: '2 Ladies', roomType: 'Shower', name: '60 min 2L Shower', duration: 60, price: 6500, payout: 3400 },
    { id: 7, category: '2 Ladies', roomType: 'Shower', name: '90 min 2L Shower', duration: 90, price: 7500, payout: 4000 },
    { id: 8, category: '2 Ladies', roomType: 'VIP Jacuzzi', name: '60 min 2L VIP', duration: 60, price: 7500, payout: 4000 },
    { id: 9, category: '2 Ladies', roomType: 'VIP Jacuzzi', name: '90 min 2L VIP', duration: 90, price: 8500, payout: 4800 },
    { id: 10, category: 'Couple', roomType: 'Shower', name: '60 min Couple Shower', duration: 60, price: 7500, payout: 2500 },
    { id: 11, category: 'Couple', roomType: 'Shower', name: '90 min Couple Shower', duration: 90, price: 8000, payout: 3000 },
    { id: 12, category: 'Couple', roomType: 'VIP Jacuzzi', name: '60 min Couple VIP', duration: 60, price: 8500, payout: 3000 },
    { id: 13, category: 'Couple', roomType: 'VIP Jacuzzi', name: '90 min Couple VIP', duration: 90, price: 9000, payout: 3500 }
  ], []);

  // Handler functions
  const handleAddTherapist = (newTherapist: Omit<Therapist, 'id' | 'created_at' | 'updated_at'>) => {
    const therapistWithId: Therapist = {
      ...newTherapist,
      id: Date.now().toString(), // Simple ID generation for demo
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    setTherapists(prev => {
      const updated = [...prev, therapistWithId];
      // Sort alphabetically by name
      return updated.sort((a, b) => a.name.localeCompare(b.name));
    });
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
  }) => {
    startSession(sessionData.serviceId, sessionData.therapistIds, sessionData.roomId, sessionData.bookingId);
  };

  const handleConfirmBooking = (bookingData: {
    therapistIds: string[];
    serviceId: number;
    startTime: Date;
    note?: string;
  }) => {
    console.log('Creating booking:', bookingData);
    // TODO: Implement booking creation logic
    // This will create a new booking record and update the bookings state
  };

  const handleConfirmExpense = (expenseData: {
    therapistId: string;
    itemId: string;
    amount: number;
    itemName: string;
  }) => {
    const therapist = therapists.find(t => t.id === expenseData.therapistId);
    if (!therapist) return;

    if (expenseData.amount <= 0) {
      alert("Expense amount must be greater than zero.");
      return;
    }

    // Add expense to therapist
    const newExpense = {
      id: Date.now().toString(),
      name: expenseData.itemName,
      amount: expenseData.amount
    };

    setTherapists(prev => prev.map(t => 
      t.id === expenseData.therapistId 
        ? { ...t, expenses: [...t.expenses, newExpense] }
        : t
    ));
  };

  const handleConfirmDeparture = (therapistId: string) => {
    console.log('Confirming departure for therapist:', therapistId);
    // TODO: Implement departure logic
    // This will update therapist status to 'Departed' and set checkout time
    setTherapists(prev => prev.map(t => 
      t.id === therapistId 
        ? { ...t, status: 'Departed' as const, check_out_time: new Date().toISOString() }
        : t
    ));
  };

  const handleConfirmShopExpense = (expenseData: {
    amount: number;
    note: string;
  }) => {
    if (expenseData.amount <= 0) {
      alert("Please enter a valid expense amount.");
      return;
    }

    const newShopExpense = {
      id: Date.now().toString(),
      amount: expenseData.amount,
      note: expenseData.note,
      timestamp: new Date()
    };

    setShopExpenses(prev => [...prev, newShopExpense]);
  };

  const handleModifySession = (sessionId: string) => {
    const session = mockActiveSessions.find(s => s.id === sessionId);
    if (session) {
      setSelectedSessionForModify(session);
      setIsModifySessionModalOpen(true);
    }
  };

  const handleRoomStatusChange = (roomId: string, status: 'Available' | 'Occupied') => {
    setRooms(prev => prev.map(room => 
      room.id === roomId 
        ? { ...room, status }
        : room
    ));
  };

  const handleEndOfDay = useCallback(() => {
    // Clear all active sessions
    setMockActiveSessions([]);
    
    // Clear all bookings
    setBookings([]);
    
    // Clear walkouts
    setWalkouts([]);
    
    // Clear shop expenses
    setShopExpenses([]);
    
    // Reset therapist statuses to 'Rostered' and clear session data
    setTherapists(prev => prev.map(therapist => ({
      ...therapist,
      status: 'Rostered' as const,
      active_room_id: null,
      completed_room_ids: [],
      expenses: [],
      check_in_time: null,
      check_out_time: null
    })));
    
    // Reset all rooms to 'Available'
    setRooms(prev => prev.map(room => ({
      ...room,
      status: 'Available' as const
    })));
    
    // Reset financials
    setFinancials({
      totalRevenue: 0,
      shopRevenue: 0,
      therapistPayouts: 0,
      netProfit: 0
    });
    
    // Clear completed sessions
    setCompletedSessions([]);
    
    // Clear all session timers
    Object.values(sessionTimers).forEach(timer => clearInterval(timer));
    setSessionTimers({});
    
    console.log('End of day completed - all data reset');
  }, [sessionTimers]);

  const handleConfirmModifySession = (modifyData: {
    sessionId: string;
    newServiceId: number;
    newRoomId: string;
  }) => {
    console.log('Modifying session:', modifyData);
    // TODO: Implement session modification logic
    // This will update the session service/room and handle room status changes
  };

  const handleLogWalkout = () => {
    if (!walkoutReason || walkoutCount <= 0) {
      alert("Please provide a valid reason and count.");
      return;
    }

    const newWalkout = {
      id: Date.now().toString(),
      reason: walkoutReason,
      count: walkoutCount,
      timestamp: new Date()
    };

    setWalkouts(prev => [newWalkout, ...prev]);
    setWalkoutCount(1);
    setWalkoutReason('');
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
  const startSession = (serviceId: number, therapistIds: string[], roomId: string, bookingId?: string) => {
    const service = services.find(s => s.id === serviceId);
    const room = rooms.find(r => r.id === roomId);
    const selectedTherapists = therapistIds.map(id => therapists.find(t => t.id === id)).filter(Boolean) as Therapist[];
    
    if (!service || !room || selectedTherapists.length === 0) {
      console.error('Invalid selection or resource not available.');
      return;
    }

    // Check if all therapists are available
    const unavailableTherapists = selectedTherapists.filter(t => t.status !== 'Available');
    if (unavailableTherapists.length > 0) {
      alert(`${unavailableTherapists.map(t => t.name).join(', ')} is/are not available.`);
      return;
    }

    // Check if room is available
    if (room.status !== 'Available') {
      alert(`${room.name} is not available.`);
      return;
    }

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

    // Create new session
    const newSession: SessionWithDetails = {
      id: Date.now().toString(),
      service_id: serviceId,
      therapist_ids: therapistIds,
      room_id: roomId,
      status: 'Ready',
      duration: service.duration,
      start_time: null,
      end_time: null,
      price: service.price,
      payout: service.payout,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      service: {
        id: service.id,
        category: service.category as '1 Lady' | '2 Ladies' | 'Couple',
        room_type: service.roomType as 'Shower' | 'VIP Jacuzzi',
        name: service.name,
        duration: service.duration,
        price: service.price,
        payout: service.payout,
        created_at: new Date().toISOString()
      },
      therapists: selectedTherapists,
      room: {
        id: room.id,
        name: room.name,
        type: room.type as 'Shower' | 'VIP Jacuzzi' | 'Large Shower',
        status: 'Occupied' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    };

    setMockActiveSessions(prev => [...prev, newSession]);

    // Remove booking if it exists
    if (bookingId) {
      setBookings(prev => prev.filter(b => b.id !== bookingId));
    }
  };

  const completeSession = useCallback((sessionId: string) => {
    const sessionIndex = mockActiveSessions.findIndex(s => s.id === sessionId);
    if (sessionIndex === -1) return;

    const session = mockActiveSessions[sessionIndex];
    const service = services.find(s => s.id === session.service_id);
    
    if (!service) return;

    // Clear timer
    if (sessionTimers[sessionId]) {
      clearInterval(sessionTimers[sessionId]);
      setSessionTimers(prev => {
        const newTimers = { ...prev };
        delete newTimers[sessionId];
        return newTimers;
      });
    }

    // Financials will be updated automatically via useEffect

    // Update therapist statuses
    setTherapists(prev => prev.map(t => 
      session.therapist_ids.includes(t.id) 
        ? { ...t, status: 'Available' as const }
        : t
    ));

    // Update room status
    setRooms(prev => prev.map(room => 
      room.id === session.room_id 
        ? { ...room, status: 'Available' as const }
        : room
    ));

    // Add to completed sessions
    setCompletedSessions(prev => [...prev, session]);

    // Remove from active sessions
    setMockActiveSessions(prev => prev.filter(s => s.id !== sessionId));
  }, [mockActiveSessions, services, sessionTimers, setFinancials, setTherapists, setCompletedSessions, setMockActiveSessions, setSessionTimers]);

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

  const beginSessionTimer = useCallback((sessionId: string) => {
    const session = mockActiveSessions.find(s => s.id === sessionId);
    if (!session || session.status !== 'Ready') return;

    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + session.duration * 60 * 1000);

    // Update session status and times
    setMockActiveSessions(prev => prev.map(s => 
      s.id === sessionId 
        ? { ...s, status: 'In Progress', start_time: startTime.toISOString(), end_time: endTime.toISOString() }
        : s
    ));

    // Start timer
    startTimerForSession(sessionId, endTime);
  }, [mockActiveSessions, startTimerForSession]);

  const getSessionTimeRemaining = (session: SessionWithDetails) => {
    if (!session.end_time) return null;
    
    const endTime = new Date(session.end_time);
    const remaining = endTime.getTime() - new Date().getTime();
    if (remaining <= 0) return "Finished";
    
    const minutes = Math.floor((remaining / 1000 / 60) % 60);
    const seconds = Math.floor((remaining / 1000) % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Financial calculations
  const calculateFinancials = useCallback(() => {
    // Calculate from completed sessions
    const sessionRevenue = completedSessions.reduce((sum, session) => sum + session.price, 0);
    const sessionPayouts = completedSessions.reduce((sum, session) => sum + session.payout, 0);
    const sessionShopRevenue = sessionRevenue - sessionPayouts;

    // Calculate from therapist expenses
    const therapistExpenses = therapists.reduce((sum, therapist) => 
      sum + therapist.expenses.reduce((expSum, expense) => expSum + expense.amount, 0), 0
    );

    // Calculate from shop expenses
    const shopExpensesTotal = shopExpenses.reduce((sum, expense) => sum + expense.amount, 0);

    // Calculate total shop revenue (session shop revenue + therapist expenses - shop expenses)
    const totalShopRevenue = sessionShopRevenue + therapistExpenses - shopExpensesTotal;

    return {
      totalRevenue: sessionRevenue + therapistExpenses,
      shopRevenue: totalShopRevenue,
      therapistPayouts: sessionPayouts,
      netProfit: totalShopRevenue
    };
  }, [completedSessions, therapists, shopExpenses]);

  // Update financials when dependencies change
  React.useEffect(() => {
    const newFinancials = calculateFinancials();
    setFinancials(newFinancials);
  }, [calculateFinancials]);

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
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [beginSessionTimer, completeSession]);



  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 antialiased flex flex-col">
      {/* Header */}
      <header className="bg-gray-900/80 backdrop-blur-sm p-4 shadow-lg sticky top-0 z-20 border-b border-gray-700 flex-shrink-0">
        <h1 className="text-2xl font-bold text-center text-white tracking-wider">HAKUMI NURU MASSAGE</h1>
        <p className="text-center text-sm text-gray-400">Operations Command Center</p>
      </header>

      {/* Main Content Area */}
      <main className="flex flex-1 overflow-hidden">
        {/* Main Area: Therapists */}
        <div className="flex-grow p-4 lg:p-6 overflow-y-auto">
        <TherapistGrid 
          therapists={therapists}
          activeSessions={mockActiveSessions}
          bookings={bookings}
          onTherapistClick={handleTherapistClick}
          onBookSession={handleBookSession}
          onAddExpense={handleAddExpense}
          onDepartTherapist={handleDepartTherapist}
          onModifySession={handleModifySession}
          onBeginSessionTimer={beginSessionTimer}
          onCompleteSession={completeSession}
          getSessionTimeRemaining={getSessionTimeRemaining}
          onAddTherapist={() => setIsAddTherapistModalOpen(true)}
        />
        </div>

        {/* Sidebar: Rooms & Walkouts */}
        <aside className="w-full lg:w-80 xl:w-96 flex-shrink-0 bg-gray-900/50 border-l border-gray-700 p-4 lg:p-6 flex flex-col overflow-y-auto">
          {/* Room Status */}
          <div className="flex-shrink-0">
            <h2 className="text-xl font-bold text-white border-b border-gray-700 pb-2 mb-4">Room Status</h2>
            <RoomList 
              rooms={rooms as Room[]} 
              activeSessions={mockActiveSessions} 
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
                          {' '}at {new Date(walkout.timestamp).toLocaleTimeString('en-US', { 
                            hour: '2-digit', 
                            minute: '2-digit',
                            hour12: false 
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
                ฿{financials.totalRevenue.toLocaleString('en-US', { 
                  minimumFractionDigits: 2, 
                  maximumFractionDigits: 2 
                })}
              </p>
            </div>
            <div className="bg-gray-800 p-3 rounded-lg text-center">
              <p className="text-sm text-gray-400">Shop Revenue</p>
              <p className="text-lg font-semibold text-blue-400">
                ฿{financials.shopRevenue.toLocaleString('en-US', { 
                  minimumFractionDigits: 2, 
                  maximumFractionDigits: 2 
                })}
              </p>
            </div>
            <div className="bg-gray-800 p-3 rounded-lg text-center">
              <p className="text-sm text-gray-400">Gross Payouts</p>
              <p className="text-lg font-semibold text-yellow-400">
                ฿{financials.therapistPayouts.toLocaleString('en-US', { 
                  minimumFractionDigits: 2, 
                  maximumFractionDigits: 2 
                })}
              </p>
            </div>
            <div className="bg-gray-800 p-3 rounded-lg text-center">
              <p className="text-sm text-gray-400">Net Profit</p>
              <p className="text-lg font-semibold text-purple-400">
                ฿{financials.netProfit.toLocaleString('en-US', { 
                  minimumFractionDigits: 2, 
                  maximumFractionDigits: 2 
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
        onClose={() => setIsSessionModalOpen(false)}
        onConfirmSession={handleConfirmSession}
        therapists={therapists}
        rooms={rooms as Room[]}
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

