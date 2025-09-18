import React from 'react';
import { Therapist, TherapistStatus, SessionWithDetails, BookingWithDetails } from '../types';

interface TherapistCardProps {
  therapist: Therapist;
  activeSession?: SessionWithDetails;
  bookings?: BookingWithDetails[];
  totalExpenses?: number;
  rooms?: Array<{id: string; name: string}>;
  onTherapistClick?: (therapist: Therapist) => void;
  onBookSession?: (therapistId: string) => void;
  onAddExpense?: (therapistId: string) => void;
  onDepartTherapist?: (therapistId: string) => void;
  onModifySession?: (sessionId: string) => void;
  onBeginSessionTimer?: (sessionId: string) => void;
  onCompleteSession?: (sessionId: string) => void;
  onBookingClick?: (bookingId: string) => void;
  onCancelBooking?: (bookingId: string) => void;
  getSessionTimeRemaining?: (session: SessionWithDetails) => string | null;
}

export default function TherapistCard({
  therapist,
  activeSession,
  bookings = [],
  totalExpenses = 0,
  rooms = [],
  onTherapistClick,
  onBookSession,
  onAddExpense,
  onDepartTherapist,
  onModifySession: _onModifySession,
  onBeginSessionTimer: _onBeginSessionTimer,
  onCompleteSession: _onCompleteSession,
  onBookingClick: _onBookingClick,
  onCancelBooking: _onCancelBooking,
  getSessionTimeRemaining
}: TherapistCardProps) {
  // Force re-render every second to update timers
  const [, forceUpdate] = React.useState({});
  
  React.useEffect(() => {
    const interval = setInterval(() => {
      forceUpdate({});
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Suppress unused variable warnings for event handlers that are used via event delegation
  void _onModifySession;
  void _onBeginSessionTimer;
  void _onCompleteSession;
  void _onBookingClick;
  void _onCancelBooking;
  const getStatusClass = (status: TherapistStatus) => {
    switch (status) {
      case 'Available':
        return 'status-available';
      case 'In Session':
        return 'status-in-session';
      case 'Rostered':
        return 'status-rostered';
      case 'Departed':
        return 'status-departed';
      default:
        return 'status-departed';
    }
  };

  const formatTime = (timeString: string | null) => {
    if (!timeString) return '';
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const getTherapistBookings = (therapistId: string) => {
    return bookings.filter(b => b.therapist_ids.includes(therapistId));
  };


  const getRoomIndicators = (therapist: Therapist, activeSession?: SessionWithDetails) => {
    let indicators = '';
    
    // Helper function to extract room number from room name
    const getRoomNumber = (roomName: string) => {
      // Extract number from "Room X" format, or return the name as-is if no "Room" prefix
      const match = roomName.match(/Room (\d+)/);
      return match ? match[1] : roomName;
    };
    
    // Completed rooms
    if (therapist.completed_room_ids && therapist.completed_room_ids.length > 0) {
      therapist.completed_room_ids.forEach(roomId => {
        const room = rooms.find(r => r.id === roomId);
        const roomDisplay = room ? getRoomNumber(room.name) : roomId; // Fallback to ID if room not found
        indicators += `<div class="room-number room-completed">${roomDisplay}</div>`;
      });
    }
    
    // Active room
    if (activeSession) {
      const room = rooms.find(r => r.id === activeSession.room_id);
      const roomDisplay = room ? getRoomNumber(room.name) : activeSession.room_id; // Fallback to ID if room not found
      indicators += `<div class="room-number room-active">${roomDisplay}</div>`;
    }
    
    return indicators;
  };

  const getSessionInfoHtml = (therapist: Therapist, activeSession?: SessionWithDetails) => {
    if (!activeSession) return '';
    
    const service = activeSession.service;
    const room = activeSession.room;
    
    // Add null checks for service and room
    if (!service || !room) {
      console.warn('Session missing service or room data:', activeSession);
      return `
        <div class="bg-gray-800/50 p-3 rounded-lg mt-3 space-y-2 border-l-4 border-red-500">
          <div class="flex justify-between items-center">
            <h5 class="font-bold text-sm text-white">Session in progress</h5>
            <span class="text-xs text-red-300">Data missing</span>
          </div>
        </div>
      `;
    }
    
    if (activeSession.status === 'In Progress') {
      return `
        <div class="bg-gray-800/50 p-3 rounded-lg mt-3 space-y-2 border-l-4 border-yellow-500">
          <div class="flex justify-between items-center">
            <h5 class="font-bold text-sm text-white">${service.name} in ${room.name}</h5>
            <button data-session-id="${activeSession.id}" class="modify-session-btn text-xs bg-gray-600 hover:bg-gray-500 px-2 py-1 rounded">✏️ Modify</button>
          </div>
          <div class="text-center">
            <p id="timer-${activeSession.id}-${therapist.id}" class="text-2xl font-bold ${getSessionTimeRemaining?.(activeSession) === "Finished" ? 'text-green-400' : 'text-yellow-400'}">${getSessionTimeRemaining?.(activeSession) || '--:--'}</p>
            <p class="text-xs text-gray-500">Time Remaining</p>
          </div>
          <button data-session-id="${activeSession.id}" class="complete-session-btn w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-1 px-3 rounded text-sm">Complete Session</button>
        </div>
      `;
    } else {
      return `
        <div class="bg-gray-800/50 p-3 rounded-lg mt-3 space-y-2 border-l-4 border-blue-500">
          <div class="flex justify-between items-center">
            <h5 class="font-bold text-sm text-white">${service.name} in ${room.name}</h5>
            <span class="text-xs text-blue-300">Ready to Start</span>
          </div>
          <button data-session-id="${activeSession.id}" class="begin-session-timer-btn w-full bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-3 rounded">Start Timer</button>
        </div>
      `;
    }
  };

  const getTimeInfoHtml = (therapist: Therapist) => {
    if (!therapist.check_in_time) {
      return '<div class="text-xs text-gray-500">Waiting for check-in...</div>';
    }
    
    let html = `<div class="text-xs text-gray-400">Checked In: ${formatTime(therapist.check_in_time)}</div>`;
    if (therapist.check_out_time) {
      html += `<div class="text-xs text-gray-400">Checked Out: ${formatTime(therapist.check_out_time)}</div>`;
    }
    return html;
  };

  const getBookingsHtml = (therapistId: string) => {
    const therapistBookings = getTherapistBookings(therapistId);
    if (therapistBookings.length === 0) return '';
    
    const bookingItems = therapistBookings.map(booking => {
      const service = booking.service;
      const startTime = new Date(booking.start_time).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
      
      // Get room abbreviation
      const room = rooms.find(r => r.id === booking.room_id);
      const roomAbbr = room ? `R${room.name.match(/\d+/)?.[0] || ''}` : 'TBD';
      
      // Truncate service name to 12 chars
      const serviceShort = service.name.length > 12 ? 
        service.name.substring(0, 12) : service.name;
      
      // Show notes (truncated to 20 chars if too long)
      const notes = booking.note ? 
        (booking.note.length > 20 ? 
          `"${booking.note.substring(0, 20)}..."` : 
          `"${booking.note}"`) : 
        'No notes';
      
      return `
        <div 
          data-booking-id="${booking.id}" 
          class="booking-item bg-gray-800/50 text-xs p-2 rounded-md border border-gray-700 flex justify-between items-center hover:bg-gray-700/50 transition-colors mb-1"
        >
          <div 
            class="flex-1 cursor-pointer flex items-center justify-between"
            onclick="window.bookingClickHandler && window.bookingClickHandler('${booking.id}')"
          >
            <span class="font-mono">${startTime} ${serviceShort} ${roomAbbr}</span>
            <span class="text-green-400 ml-2">▶</span>
            <span class="text-gray-300 text-xs ml-2">${notes}</span>
          </div>
          <button 
            data-booking-id="${booking.id}"
            class="cancel-booking-btn text-red-400 hover:text-red-300 hover:bg-red-900/20 p-1 rounded transition-colors ml-2"
            onclick="event.stopPropagation(); window.cancelBookingHandler && window.cancelBookingHandler('${booking.id}')"
            title="Cancel booking"
          >
            ✕
          </button>
        </div>
      `;
    }).join('');
    
    return `
      <div class="mt-3">
        <h6 class="text-xs font-bold text-gray-400 mb-1">Bookings</h6>
        <div class="space-y-1">${bookingItems}</div>
      </div>
    `;
  };

  const getMainActionButtons = (therapist: Therapist) => {
    if (therapist.status === 'Rostered') {
      return `<button data-therapist-id="${therapist.id}" class="check-in-btn w-full bg-green-600 hover:bg-green-500 text-white font-bold py-2 rounded">Check In</button>`;
    }
    if (therapist.status === 'Available') {
      return `<button data-therapist-id="${therapist.id}" class="start-session-for-therapist-btn w-full bg-green-600 hover:bg-green-500 text-white font-bold py-2 rounded">Start Session</button>`;
    }
    return '';
  };

  const statusClass = getStatusClass(therapist.status);
  const roomIndicators = getRoomIndicators(therapist, activeSession);
  const sessionInfoHtml = getSessionInfoHtml(therapist, activeSession);
  const timeInfoHtml = getTimeInfoHtml(therapist);
  const bookingsHtml = getBookingsHtml(therapist.id);
  const mainActionButtons = getMainActionButtons(therapist);

  return (
    <>
      <style>{`
        .status-badge { 
          display: inline-flex; 
          align-items: center; 
          padding: 0.25em 0.6em; 
          font-size: 0.8rem; 
          font-weight: 600; 
          border-radius: 9999px; 
          text-transform: uppercase; 
          letter-spacing: 0.05em; 
        }
        .status-available { background-color: #22c55e; color: white; }
        .status-in-session { background-color: #eab308; color: white; }
        .status-departed { background-color: #6b7280; color: white; }
        .status-rostered { background-color: #3b82f6; color: white; }
        .room-indicator { display: flex; gap: 0.3rem; flex-wrap: wrap; }
        .room-number { 
          font-size: 0.75rem; 
          font-weight: 600; 
          width: 1.75rem; 
          height: 1.5rem; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          border-radius: 0.25rem; 
        }
        .room-completed { border: 2px solid #4ade80; color: #4ade80; }
        .room-active { background-color: #eab308; color: white; }
        .booking-item { 
          cursor: pointer; 
          transition: background-color 0.2s; 
        }
        .booking-item:hover { 
          background-color: rgba(255, 255, 255, 0.05); 
        }
      `}</style>
      <div className="bg-gray-900 rounded-lg shadow-md flex flex-col p-4 gap-3">
        <div className="flex justify-between items-start">
          <div>
            <button
              className="font-bold text-lg text-white hover:text-gray-300 text-left"
              onClick={() => onTherapistClick?.(therapist)}
            >
              {therapist.name}
            </button>
            <span className={`status-badge ${statusClass}`}>{therapist.status}</span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button 
              data-therapist-id={therapist.id}
              className={`book-session-btn bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 text-sm rounded ${therapist.status === 'Departed' ? 'hidden' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                onBookSession?.(therapist.id);
              }}
            >
              Book
            </button>
            <button 
              data-therapist-id={therapist.id}
              className={`add-expense-btn bg-yellow-600 hover:bg-yellow-500 text-white px-3 py-1 text-sm rounded ${therapist.status === 'Rostered' || therapist.status === 'Departed' ? 'hidden' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                onAddExpense?.(therapist.id);
              }}
            >
              Expense
            </button>
            <button 
              data-therapist-id={therapist.id}
              className={`depart-therapist-btn bg-red-600 hover:bg-red-500 text-white px-3 py-1 text-sm rounded ${therapist.status === 'Departed' ? 'hidden' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                onDepartTherapist?.(therapist.id);
              }}
            >
              Depart
            </button>
          </div>
        </div>

        <div dangerouslySetInnerHTML={{ __html: timeInfoHtml }} />
        
        <div className="flex-grow min-h-[6rem]">
          <div dangerouslySetInnerHTML={{ __html: sessionInfoHtml }} />
          <div dangerouslySetInnerHTML={{ __html: bookingsHtml }} />
        </div>

        <div className="border-t border-gray-700 pt-3 mt-auto">
          <div className="flex justify-between items-center mb-2">
            <span className={`text-xs text-red-400 ${therapist.check_in_time ? '' : 'invisible'}`}>
              Expenses: ฿{totalExpenses.toFixed(2)}
            </span>
            <div 
              className="room-indicator" 
              dangerouslySetInnerHTML={{ __html: roomIndicators }}
            />
          </div>
          <div className="h-10">
            <div dangerouslySetInnerHTML={{ __html: mainActionButtons }} />
          </div>
        </div>
      </div>
    </>
  );
}
