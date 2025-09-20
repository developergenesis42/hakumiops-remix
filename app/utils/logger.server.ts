// Production-safe logging utility
const isDevelopment = process.env.NODE_ENV === 'development';

export function log(...args: any[]) {
  if (isDevelopment) {
    console.log(...args);
  }
}

export function logError(...args: any[]) {
  if (isDevelopment) {
    console.error(...args);
  }
  // In production, you might want to send to a logging service
  // like Sentry, LogRocket, or DataDog
}

export function logInfo(...args: any[]) {
  if (isDevelopment) {
    console.info(...args);
  }
}
