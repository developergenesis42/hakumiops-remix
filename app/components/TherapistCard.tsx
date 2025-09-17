import { Therapist, TherapistStatus, SessionWithDetails, BookingWithDetails } from '../types';

interface TherapistCardProps {
  therapist: Therapist;
  activeSession?: SessionWithDetails;
  bookings?: BookingWithDetails[];
  totalExpenses?: number;
  onTherapistClick?: (therapist: Therapist) => void;
  onBookSession?: (therapistId: string) => void;
  onAddExpense?: (therapistId: string) => void;
  onDepartTherapist?: (therapistId: string) => void;
  onModifySession?: (sessionId: string) => void;
  onBeginSessionTimer?: (sessionId: string) => void;
  onCompleteSession?: (sessionId: string) => void;
  getSessionTimeRemaining?: (session: SessionWithDetails) => string | null;
}

export default function TherapistCard({
  therapist,
  activeSession,
  bookings = [],
  totalExpenses = 0,
  onTherapistClick,
  onBookSession,
  onAddExpense,
  onDepartTherapist,
  onModifySession,
  onBeginSessionTimer: _onBeginSessionTimer,
  onCompleteSession: _onCompleteSession,
  getSessionTimeRemaining
}: TherapistCardProps) {
  // Suppress unused variable warnings for event handlers that are used via event delegation
  void _onBeginSessionTimer;
  void _onCompleteSession;
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
    
    // Completed rooms
    if (therapist.completed_room_ids && therapist.completed_room_ids.length > 0) {
      therapist.completed_room_ids.forEach(roomId => {
        indicators += `<div class="room-number room-completed">${roomId}</div>`;
      });
    }
    
    // Active room
    if (activeSession) {
      indicators += `<div class="room-number room-active">${activeSession.room_id}</div>`;
    }
    
    return indicators;
  };

  const getSessionInfoHtml = (therapist: Therapist, activeSession?: SessionWithDetails) => {
    if (!activeSession) return '';
    
    const service = activeSession.service;
    const room = activeSession.room;
    
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
    
    const bookingItems = therapistBookings.map(b => {
      const service = b.service;
      return `<div data-booking-id="${b.id}" class="booking-item bg-gray-800/50 text-xs p-2 rounded-md flex justify-between items-center"><span>${formatTime(b.start_time)} - ${service.name.substring(0,15)}...</span><span class="text-green-400">▶</span></div>`;
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
            {activeSession && (
              <button 
                data-session-id={activeSession.id}
                className="modify-session-btn bg-purple-600 hover:bg-purple-500 text-white px-3 py-1 text-sm rounded"
                onClick={(e) => {
                  e.stopPropagation();
                  onModifySession?.(activeSession.id);
                }}
              >
                Modify
              </button>
            )}
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
