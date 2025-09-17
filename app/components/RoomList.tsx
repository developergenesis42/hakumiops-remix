import React from 'react';
import { Room, RoomStatus, RoomType, SessionWithDetails } from '~/types';

interface RoomListProps {
  rooms: Room[];
  activeSessions?: SessionWithDetails[];
  onRoomStatusChange?: (roomId: string, status: RoomStatus) => void;
}

export default function RoomList({ rooms, activeSessions = [], onRoomStatusChange }: RoomListProps) {
  // Force re-render every second to update timers
  const [, forceUpdate] = React.useState({});
  
  React.useEffect(() => {
    const interval = setInterval(() => {
      forceUpdate({});
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  const getRoomTypeIcon = (type: RoomType) => {
    switch (type) {
      case 'Shower':
        return '🚿';
      case 'Large Shower':
        return '🚿💧';
      case 'VIP Jacuzzi':
        return '🛁✨';
      default:
        return '🏠';
    }
  };

  const getStatusText = (status: RoomStatus) => {
    return status === 'Available' ? 'Available' : 'Occupied';
  };

  const getStatusColor = (status: RoomStatus) => {
    return status === 'Available' 
      ? 'text-green-400 bg-green-900/20 border-green-400/30' 
      : 'text-red-400 bg-red-900/20 border-red-400/30';
  };

  const getSessionForRoom = (roomId: string) => {
    return activeSessions.find(session => session.room_id === roomId);
  };

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

  // Group rooms by type
  const roomGroups = rooms.reduce((acc, room) => {
    acc[room.type] = acc[room.type] || [];
    acc[room.type].push(room);
    return acc;
  }, {} as Record<string, Room[]>);

  // Calculate room statistics
  const roomStats = {
    total: rooms.length,
    available: rooms.filter(r => r.status === 'Available').length,
    occupied: rooms.filter(r => r.status === 'Occupied').length
  };

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
        .status-occupied { background-color: #ef4444; color: white; }
      `}</style>
      <div className="space-y-4">
        {/* Room Statistics */}
        <div className="bg-gray-800/50 p-3 rounded-lg">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-white">{roomStats.total}</div>
              <div className="text-xs text-gray-400">Total</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-400">{roomStats.available}</div>
              <div className="text-xs text-gray-400">Available</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-400">{roomStats.occupied}</div>
              <div className="text-xs text-gray-400">Occupied</div>
            </div>
          </div>
        </div>
        {rooms.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <div className="text-4xl mb-2">🏠</div>
            <p>No rooms found</p>
          </div>
        ) : (
          Object.entries(roomGroups).map(([type, typeRooms]) => (
            <div key={type}>
              <h3 className="font-semibold text-gray-400 text-sm mb-2">{type}s</h3>
              <div className="grid grid-cols-2 gap-3">
                {typeRooms.map((room) => {
                  const session = getSessionForRoom(room.id);
                  return (
                    <div
                      key={room.id}
                      className={`p-3 rounded-lg text-center shadow-md ${
                        room.status === 'Available' 
                          ? 'bg-gray-800 hover:bg-gray-700 cursor-pointer transition-colors' 
                          : 'bg-gray-800/50 border-l-4 border-red-500'
                      }`}
                      onClick={() => {
                        if (onRoomStatusChange && !session) {
                          const newStatus = room.status === 'Available' ? 'Occupied' : 'Available';
                          onRoomStatusChange(room.id, newStatus);
                        }
                      }}
                      title={session ? 'Room in use' : 'Click to toggle status'}
                    >
                      <h5 className="font-semibold text-white">{room.name}</h5>
                      <span className={`status-badge ${room.status === 'Available' ? 'status-available' : 'status-occupied'}`}>
                        {getStatusText(room.status)}
                      </span>
                      
                      {session && (
                        <div className="mt-2 text-xs text-gray-300">
                          <div className="font-medium text-white">
                            {session.service.name}
                          </div>
                          <div className="text-gray-400">
                            {session.therapists.map(t => t.name).join(', ')}
                          </div>
                          {session.status === 'In Progress' && session.end_time && (
                            <div className="text-yellow-400 font-mono">
                              {getSessionTimeRemaining(session)}
                            </div>
                          )}
                          {session.status === 'Ready' && (
                            <div className="text-blue-400">
                              Ready to Start
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
