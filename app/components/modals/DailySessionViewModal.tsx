import { useState, useMemo } from 'react';
import { SessionWithDetails } from '../../types';

interface DailySessionViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: SessionWithDetails[];
  onEditSession: (sessionId: string) => void;
  onCompleteSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
}

export default function DailySessionViewModal({
  isOpen,
  onClose,
  sessions,
  onEditSession,
  onCompleteSession,
  onDeleteSession
}: DailySessionViewModalProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Filter sessions for today only
  const todaysSessions = useMemo(() => {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    return sessions.filter(session => {
      const sessionDate = new Date(session.start_time || session.created_at);
      return sessionDate >= startOfDay && sessionDate < endOfDay;
    });
  }, [sessions]);

  // Sort sessions chronologically
  const sortedSessions = useMemo(() => {
    const activeSessions = todaysSessions.filter(s => s.status !== 'Completed');
    const completedSessions = todaysSessions.filter(s => s.status === 'Completed');

    // Sort active sessions by start time (Ready sessions first, then In Progress)
    const sortedActive = activeSessions.sort((a, b) => {
      if (a.status === 'Ready' && b.status !== 'Ready') return -1;
      if (b.status === 'Ready' && a.status !== 'Ready') return 1;
      if (a.start_time && b.start_time) {
        return new Date(a.start_time).getTime() - new Date(b.start_time).getTime();
      }
      return 0;
    });

    // Sort completed sessions by end time (most recent first)
    const sortedCompleted = completedSessions.sort((a, b) => {
      const aTime = a.end_time ? new Date(a.end_time).getTime() : 0;
      const bTime = b.end_time ? new Date(b.end_time).getTime() : 0;
      return bTime - aTime;
    });

    return [...sortedActive, ...sortedCompleted];
  }, [todaysSessions]);

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    const active = sortedSessions.filter(s => s.status !== 'Completed');
    const completed = sortedSessions.filter(s => s.status === 'Completed');
    const totalRevenue = completed.reduce((sum, s) => sum + (Number(s.price) - Number(s.discount || 0)), 0);
    const avgDuration = completed.length > 0 
      ? completed.reduce((sum, s) => sum + s.duration, 0) / completed.length 
      : 0;

    return {
      active: active.length,
      completed: completed.length,
      total: sortedSessions.length,
      revenue: totalRevenue,
      avgDuration: Math.round(avgDuration)
    };
  }, [sortedSessions]);

  const formatTime = (timeString: string | null) => {
    if (!timeString) return '--:--';
    return new Date(timeString).toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const getSessionTimeRemaining = (session: SessionWithDetails) => {
    if (session.status !== 'In Progress' || !session.end_time) return null;
    
    const now = new Date();
    const endTime = new Date(session.end_time);
    const remainingMs = endTime.getTime() - now.getTime();
    
    if (remainingMs <= 0) return '00:00';
    
    const minutes = Math.floor(remainingMs / 60000);
    const seconds = Math.floor((remainingMs % 60000) / 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ready': return 'bg-yellow-600';
      case 'In Progress': return 'bg-green-600';
      case 'Completed': return 'bg-gray-600';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'Ready': return 'Ready to Start';
      case 'In Progress': return 'In Progress';
      case 'Completed': return 'Completed';
      default: return status;
    }
  };

  const handleEdit = (sessionId: string) => {
    onEditSession(sessionId);
    onClose();
  };

  const handleDelete = async (sessionId: string) => {
    setShowDeleteConfirm(null);
    await onDeleteSession(sessionId);
  };

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        @keyframes fadeIn { 
          from { opacity: 0; transform: scale(0.95); } 
          to { opacity: 1; transform: scale(1); } 
        }
        .modal-fade-in { 
          animation: fadeIn 0.2s ease-out forwards; 
        }
        @keyframes slideIn { 
          from { opacity: 0; transform: translateY(-10px); } 
          to { opacity: 1; transform: translateY(0); } 
        }
        .session-card { 
          animation: slideIn 0.3s ease-out forwards; 
        }
      `}</style>
      
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800 rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden modal-fade-in">
          {/* Header */}
          <div className="bg-gray-900 p-6 border-b border-gray-700">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-white">Today&apos;s Sessions</h2>
                <p className="text-gray-400 mt-1">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="bg-gray-800 p-3 rounded-lg text-center">
                <p className="text-sm text-gray-400">Active Sessions</p>
                <p className="text-xl font-bold text-green-400">{summaryStats.active}</p>
              </div>
              <div className="bg-gray-800 p-3 rounded-lg text-center">
                <p className="text-sm text-gray-400">Completed</p>
                <p className="text-xl font-bold text-blue-400">{summaryStats.completed}</p>
              </div>
              <div className="bg-gray-800 p-3 rounded-lg text-center">
                <p className="text-sm text-gray-400">Total Revenue</p>
                <p className="text-lg font-semibold text-yellow-400">
                  ฿{summaryStats.revenue}
                </p>
              </div>
              <div className="bg-gray-800 p-3 rounded-lg text-center">
                <p className="text-sm text-gray-400">Avg Duration</p>
                <p className="text-lg font-semibold text-purple-400">{summaryStats.avgDuration}min</p>
              </div>
            </div>
          </div>

          {/* Sessions List */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {sortedSessions.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-lg mb-2">📅</div>
                <p className="text-gray-400 text-lg">No sessions for today</p>
                <p className="text-gray-500 text-sm mt-1">Sessions will appear here once created</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedSessions.map((session, index) => {
                  const timeRemaining = getSessionTimeRemaining(session);
                  const isActive = session.status !== 'Completed';
                  
                  return (
                    <div 
                      key={session.id}
                      className={`session-card bg-gray-700/50 rounded-lg p-4 border-l-4 ${
                        session.status === 'In Progress' ? 'border-green-500' :
                        session.status === 'Ready' ? 'border-yellow-500' :
                        'border-gray-500'
                      }`}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex justify-between items-start">
                        {/* Session Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`px-2 py-1 rounded text-xs font-semibold text-white ${getStatusColor(session.status)}`}>
                              {getStatusText(session.status)}
                            </span>
                            {session.status === 'In Progress' && timeRemaining && (
                              <span className="px-2 py-1 rounded text-xs font-mono bg-red-600 text-white">
                                ⏱️ {timeRemaining}
                              </span>
                            )}
                            {session.booking_id && (
                              <span className="px-2 py-1 rounded text-xs bg-blue-600 text-white">
                                📋 From Booking
                              </span>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Basic Info */}
                            <div>
                              <h4 className="font-semibold text-white mb-1">{session.service?.name}</h4>
                              <p className="text-sm text-gray-300">
                                👥 {session.therapists?.map(t => t.name).join(', ') || `No therapists assigned (IDs: ${session.therapist_ids?.join(', ') || 'none'})`}
                              </p>
                              <p className="text-sm text-gray-300">
                                🏠 {session.room?.name} ({session.room?.type})
                              </p>
                            </div>
                            
                            {/* Time Info */}
                            <div>
                              <p className="text-sm text-gray-300">
                                ⏰ {formatTime(session.start_time)} - {formatTime(session.end_time)}
                              </p>
                              <p className="text-sm text-gray-300">
                                ⏱️ {session.duration} minutes
                              </p>
                              {session.notes && (
                                <p className="text-sm text-gray-300 mt-1">
                                  📝 {session.notes}
                                </p>
                              )}
                            </div>
                            
                            {/* Payment Info */}
                            <div>
                              <p className="text-sm text-gray-300">
                                💰 ฿{Number(session.price) - Number(session.discount || 0)}
                              </p>
                              <p className="text-sm text-gray-300">
                                💳 {session.payment_method || 'Cash'}
                              </p>
                              <p className="text-sm text-gray-300">
                                🌍 {session.nationality || 'Chinese'} | {session.wob || 'W'}
                              </p>
                              {session.vip_number && (
                                <p className="text-sm text-gray-300">
                                  👑 VIP #{session.vip_number}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-2 ml-4">
                          {isActive && (
                            <>
                              <button
                                onClick={() => handleEdit(session.id)}
                                className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded transition-colors"
                              >
                                ✏️ Edit
                              </button>
                              {session.status === 'Ready' && (
                                <button
                                  onClick={() => onCompleteSession(session.id)}
                                  className="px-3 py-1 bg-green-600 hover:bg-green-500 text-white text-xs font-semibold rounded transition-colors"
                                >
                                  ✅ Complete
                                </button>
                              )}
                            </>
                          )}
                          
                          {session.status === 'Completed' && (
                            <button
                              onClick={() => handleEdit(session.id)}
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded transition-colors"
                            >
                              ✏️ Edit
                            </button>
                          )}
                          
                          <button
                            onClick={() => setShowDeleteConfirm(session.id)}
                            className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded transition-colors"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-60 p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-white mb-4">Confirm Delete</h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete this session? This action cannot be undone and will affect your daily reports.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded transition-colors"
              >
                Delete Session
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
