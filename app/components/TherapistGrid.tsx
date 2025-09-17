import { Therapist, SessionWithDetails, BookingWithDetails } from '../types';
import TherapistCard from './TherapistCard';

interface TherapistGridProps {
  therapists: Therapist[];
  activeSessions?: SessionWithDetails[];
  bookings?: BookingWithDetails[];
  onTherapistClick?: (therapist: Therapist) => void;
  onBookSession?: (therapistId: string) => void;
  onAddExpense?: (therapistId: string) => void;
  onDepartTherapist?: (therapistId: string) => void;
  onModifySession?: (sessionId: string) => void;
  onBeginSessionTimer?: (sessionId: string) => void;
  onCompleteSession?: (sessionId: string) => void;
  getSessionTimeRemaining?: (session: SessionWithDetails) => string | null;
  onAddTherapist?: () => void;
}

export default function TherapistGrid({ 
  therapists, 
  activeSessions = [],
  bookings = [],
  onTherapistClick,
  onBookSession,
  onAddExpense,
  onDepartTherapist,
  onModifySession,
  onBeginSessionTimer,
  onCompleteSession,
  getSessionTimeRemaining,
  onAddTherapist
}: TherapistGridProps) {
  const findActiveSessionForTherapist = (therapistId: string) => {
    return activeSessions.find(s => s.therapist_ids.includes(therapistId));
  };

  const getTotalExpenses = () => {
    // This would need to be calculated from therapist expenses
    // For now, returning 0 as placeholder
    return 0;
  };

  return (
    <>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Therapists on Duty</h2>
        <button 
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
          onClick={() => onAddTherapist?.()}
        >
          Add Therapist
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
      {therapists.length === 0 ? (
        <div className="text-center text-gray-500 p-4 col-span-full">No therapists on duty.</div>
      ) : (
        therapists.map((therapist) => {
          const activeSession = findActiveSessionForTherapist(therapist.id);
          const totalExpenses = getTotalExpenses();

          return (
        <TherapistCard
          key={therapist.id}
          therapist={therapist}
          activeSession={activeSession}
          bookings={bookings}
          totalExpenses={totalExpenses}
          onTherapistClick={onTherapistClick}
          onBookSession={onBookSession}
          onAddExpense={onAddExpense}
          onDepartTherapist={onDepartTherapist}
          onModifySession={onModifySession}
          onBeginSessionTimer={onBeginSessionTimer}
          onCompleteSession={onCompleteSession}
          getSessionTimeRemaining={getSessionTimeRemaining}
        />
          );
        })
      )}
      </div>
    </>
  );
}
