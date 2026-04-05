/**
 * Structured Logging System
 * Production-ready logger for debugging, monitoring, and analytics
 * Can be extended to integrate with external logging services
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL',
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  stack?: string;
  duration?: number; // For performance logging
}

/**
 * Logger configuration
 */
export interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableRemote: boolean;
  remoteEndpoint?: string;
}

/**
 * Core Logger
 */
class Logger {
  private config: LoggerConfig;
  private static instance: Logger;

  private constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      level: config.level || LogLevel.INFO,
      enableConsole: config.enableConsole !== false,
      enableRemote: config.enableRemote === true,
      remoteEndpoint: config.remoteEndpoint,
    };

    // Preserve logs in memory for debugging (max 100 entries)
    if (!('logs' in window)) {
      (window as any).logs = [];
    }
  }

  /**
   * Get or create logger instance
   */
  static getInstance(config?: Partial<LoggerConfig>): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger(config);
    }
    return Logger.instance;
  }

  /**
   * Format log entry
   */
  private formatEntry(
    level: LogLevel,
    message: string,
    context?: Record<string, any>
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
    };
  }

  /**
   * Check if log level should be output
   */
  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR, LogLevel.CRITICAL];
    const configIndex = levels.indexOf(this.config.level);
    const levelIndex = levels.indexOf(level);
    return levelIndex >= configIndex;
  }

  /**
   * Send log to remote endpoint
   */
  private async sendRemote(entry: LogEntry): Promise<void> {
    if (!this.config.enableRemote || !this.config.remoteEndpoint) {
      return;
    }

    try {
      // Only send errors and critical logs to remote
      if ([LogLevel.ERROR, LogLevel.CRITICAL].includes(entry.level)) {
        // Placeholder for remote logging service
        // In production, this would send to your logging service (e.g., Sentry, DataDog)
        // console.log('Would send to remote:', entry);
      }
    } catch (err) {
      // Silently fail - never let logging break the app
      console.error('Failed to send log to remote', err);
    }
  }

  /**
   * Console output with styling
   */
  private consoleLog(entry: LogEntry): void {
    if (!this.config.enableConsole) {
      return;
    }

    const styles = {
      [LogLevel.DEBUG]: 'color: gray',
      [LogLevel.INFO]: 'color: blue',
      [LogLevel.WARN]: 'color: orange',
      [LogLevel.ERROR]: 'color: red',
      [LogLevel.CRITICAL]: 'color: red; font-weight: bold',
    };

    const style = styles[entry.level] || '';
    const prefix = `[${entry.timestamp}] [${entry.level}]`;

    console.log(`%c${prefix} ${entry.message}`, style, entry.context || '');
  }

  /**
   * Store log entry in memory
   */
  private storeLogs(entry: LogEntry): void {
    const logs = (window as any).logs as LogEntry[];
    logs.push(entry);

    // Keep only last 100 logs
    if (logs.length > 100) {
      logs.shift();
    }
  }

  /**
   * Log entry point
   */
  private log(level: LogLevel, message: string, context?: Record<string, any>): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const entry = this.formatEntry(level, message, context);

    // Store in memory
    this.storeLogs(entry);

    // Console output
    this.consoleLog(entry);

    // Send to remote
    this.sendRemote(entry).catch(() => {
      /* ignore */
    });
  }

  /**
   * Public logging methods
   */
  debug(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, context);
  }

  error(message: string, context?: Record<string, any>, error?: Error): void {
    this.log(LogLevel.ERROR, message, {
      ...context,
      errorName: error?.name,
      errorStack: error?.stack,
    });
  }

  critical(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.CRITICAL, message, context);
  }

  /**
   * Performance tracking
   */
  startTimer(label: string): () => void {
    const startTime = performance.now();
    return () => {
      const duration = performance.now() - startTime;
      this.debug(`${label} completed`, { durationMs: duration.toFixed(2) });
      return duration;
    };
  }

  /**
   * Get logged entries
   */
  getLogs(): LogEntry[] {
    return (window as any).logs || [];
  }

  /**
   * Clear logs
   */
  clearLogs(): void {
    (window as any).logs = [];
  }
}

/**
 * Export singleton instance
 */
export const logger = Logger.getInstance({
  level: LogLevel.INFO,
  enableConsole: true,
  enableRemote: false,
});

/**
 * Convenience methods
 */
export function logDebug(message: string, context?: Record<string, any>): void {
  logger.debug(message, context);
}

export function logInfo(message: string, context?: Record<string, any>): void {
  logger.info(message, context);
}

export function logWarn(message: string, context?: Record<string, any>): void {
  logger.warn(message, context);
}

export function logError(message: string, context?: Record<string, any>, error?: Error): void {
  logger.error(message, context, error);
}

export function logCritical(message: string, context?: Record<string, any>): void {
  logger.critical(message, context);
}
