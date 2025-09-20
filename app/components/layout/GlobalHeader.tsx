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
            
          </div>
        </div>
      </div>
    </header>
  );
}
