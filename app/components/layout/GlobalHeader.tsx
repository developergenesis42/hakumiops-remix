import { Form, Link } from "@remix-run/react";
import { useState, useEffect } from "react";

interface User {
  id: string;
  email: string;
  name: string;
  avatar_url: string;
}

interface GlobalHeaderProps {
  user?: User | null;
  error?: string | null;
  isLoading?: boolean;
}

// Real-time date/time component
function DateTimeDisplay() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDateTime = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    };
    
    return date.toLocaleDateString('en-US', options)
      .replace(/(\w+), (\w+) (\d+), (\d+), (\d+):(\d+):(\d+)/, '$1, $2 $3, $4 • $5:$6:$7');
  };

  return (
    <div className="text-center text-sm text-gray-300 font-mono">
      {formatDateTime(currentTime)}
    </div>
  );
}

export default function GlobalHeader({ user, error, isLoading }: GlobalHeaderProps) {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleResetClick = () => {
    setShowResetConfirm(true);
  };

  const handleResetConfirm = async () => {
    setIsResetting(true);
    try {
      const response = await fetch('/api/reset-therapist-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Reset successful:', result);
        // Reload the page to reflect the changes
        window.location.reload();
      } else {
        const error = await response.json();
        console.error('Reset failed:', error);
        alert('Reset failed: ' + (error.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Reset error:', error);
      alert('Reset failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsResetting(false);
      setShowResetConfirm(false);
    }
  };

  const handleResetCancel = () => {
    setShowResetConfirm(false);
  };

  return (
    <header className="bg-gray-900/80 backdrop-blur-sm shadow-lg border-b border-gray-700 relative z-40">
      {/* Top row with title and user profile */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold text-white">
            HAKUMI NURU MASSAGE
          </h1>
        </div>
        
        {user ? (
          <div className="flex items-center gap-4">
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium text-white">{user.name}</p>
              <p className="text-xs text-gray-300">{user.email}</p>
            </div>
            <img
              className="w-8 h-8 rounded-full ring-2 ring-cyan-300"
              src={user.avatar_url}
              alt={user.name}
            />
            <Form action="/logout" method="POST">
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
              >
                Logout
              </button>
            </Form>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="px-4 py-2 text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 rounded-md transition-colors"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
      
      {/* Second row with subtitle, date/time, and actions */}
      <div className="px-4 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-400">
              Operations Command Center
            </div>
            <DateTimeDisplay />
          </div>
          <div className="flex items-center gap-3">
            {/* Error Display */}
            {error && (
              <div className="bg-red-900/50 border border-red-500 text-red-200 px-3 py-1 rounded text-xs">
                {error}
              </div>
            )}
            
            {/* Loading Indicator */}
            {isLoading && (
              <div className="bg-blue-900/50 border border-blue-500 text-blue-200 px-3 py-1 rounded text-xs">
                Processing...
              </div>
            )}
            
            {/* Reset Button - Only show in development */}
            {process.env.NODE_ENV !== 'production' && (
              <button
                onClick={handleResetClick}
                className="px-3 py-1 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isResetting}
              >
                {isResetting ? "Resetting..." : "Reset Data"}
              </button>
            )}
            
          </div>
        </div>
      </div>
      
      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Reset Therapist Data
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              This will permanently delete all therapist data, sessions, bookings, and related information. 
              This action cannot be undone. Are you sure you want to continue?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={handleResetCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleResetConfirm}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isResetting}
              >
                {isResetting ? "Resetting..." : "Yes, Reset Data"}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
