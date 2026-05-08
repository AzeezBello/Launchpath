/**
 * Simple logging utility for the application
 * In production, replace with a proper logging service
 */

type LogLevel = 'info' | 'warn' | 'error';

class Logger {
  private log(level: LogLevel, message: string, ...args: unknown[]) {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

    if (process.env.NODE_ENV === 'development') {
      console[level](prefix, message, ...args);
    } else {
      // In production, send to logging service
      // For now, we'll still log errors
      if (level === 'error') {
        console.error(prefix, message, ...args);
      }
    }
  }

  info(message: string, ...args: unknown[]) {
    this.log('info', message, ...args);
  }

  warn(message: string, ...args: unknown[]) {
    this.log('warn', message, ...args);
  }

  error(message: string, ...args: unknown[]) {
    this.log('error', message, ...args);
  }
}

export const logger = new Logger();