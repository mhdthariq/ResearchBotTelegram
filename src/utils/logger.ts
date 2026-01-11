/**
 * Logger utility for structured logging
 *
 * Provides consistent, structured logging across the application
 * with support for different log levels and JSON output.
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogContext {
	[key: string]: unknown;
}

interface LogEntry {
	level: LogLevel;
	message: string;
	timestamp: string;
	context?: LogContext;
}

const LOG_LEVELS: Record<LogLevel, number> = {
	debug: 0,
	info: 1,
	warn: 2,
	error: 3,
};

class Logger {
	private minLevel: LogLevel;
	private useJson: boolean;

	constructor(level?: LogLevel, useJson?: boolean) {
		this.minLevel = level || (process.env.LOG_LEVEL as LogLevel) || "info";
		this.useJson = useJson ?? process.env.NODE_ENV === "production";
	}

	private shouldLog(level: LogLevel): boolean {
		return LOG_LEVELS[level] >= LOG_LEVELS[this.minLevel];
	}

	private formatMessage(entry: LogEntry): string {
		if (this.useJson) {
			return JSON.stringify(entry);
		}

		const levelEmoji: Record<LogLevel, string> = {
			debug: "🔍",
			info: "ℹ️",
			warn: "⚠️",
			error: "❌",
		};

		const emoji = levelEmoji[entry.level];
		const contextStr = entry.context ? ` ${JSON.stringify(entry.context)}` : "";

		return `${entry.timestamp} ${emoji} [${entry.level.toUpperCase()}] ${entry.message}${contextStr}`;
	}

	private log(level: LogLevel, message: string, context?: LogContext): void {
		if (!this.shouldLog(level)) return;

		const entry: LogEntry = {
			level,
			message,
			timestamp: new Date().toISOString(),
			context,
		};

		const formattedMessage = this.formatMessage(entry);

		switch (level) {
			case "debug":
			case "info":
				console.log(formattedMessage);
				break;
			case "warn":
				console.warn(formattedMessage);
				break;
			case "error":
				console.error(formattedMessage);
				break;
		}
	}

	/**
	 * Log debug message (for development/troubleshooting)
	 */
	debug(message: string, context?: LogContext): void {
		this.log("debug", message, context);
	}

	/**
	 * Log info message (general information)
	 */
	info(message: string, context?: LogContext): void {
		this.log("info", message, context);
	}

	/**
	 * Log warning message (potential issues)
	 */
	warn(message: string, context?: LogContext): void {
		this.log("warn", message, context);
	}

	/**
	 * Log error message (errors and failures)
	 */
	error(message: string, context?: LogContext): void {
		this.log("error", message, context);
	}

	/**
	 * Create a child logger with additional context
	 */
	child(defaultContext: LogContext): {
		debug: (message: string, context?: LogContext) => void;
		info: (message: string, context?: LogContext) => void;
		warn: (message: string, context?: LogContext) => void;
		error: (message: string, context?: LogContext) => void;
	} {
		return {
			debug: (message: string, context?: LogContext) =>
				this.debug(message, { ...defaultContext, ...context }),
			info: (message: string, context?: LogContext) =>
				this.info(message, { ...defaultContext, ...context }),
			warn: (message: string, context?: LogContext) =>
				this.warn(message, { ...defaultContext, ...context }),
			error: (message: string, context?: LogContext) =>
				this.error(message, { ...defaultContext, ...context }),
		};
	}
}

// Export singleton instance
export const logger = new Logger();

// Export class for custom instances
export { Logger };
export type { LogLevel, LogContext, LogEntry };
