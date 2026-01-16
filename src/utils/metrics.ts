/**
 * Metrics Collection Module
 *
 * Provides utilities for collecting and reporting application metrics.
 * Supports basic metrics collection for monitoring bot health and usage.
 */

import { getRateLimiterStatus } from "../arxiv.js";
import { getUserCount } from "../db/repositories/index.js";
import { getTotalSubscriptionCount } from "../db/repositories/subscriptionRepository.js";
import { logger } from "./logger.js";

/**
 * Metric types
 */
export type MetricType = "counter" | "gauge" | "histogram";

/**
 * Metric entry
 */
export interface Metric {
	name: string;
	type: MetricType;
	value: number;
	labels?: Record<string, string>;
	timestamp: number;
}

/**
 * Application metrics
 */
export interface AppMetrics {
	users: {
		total: number;
	};
	searches: {
		total: number;
	};
	bookmarks: {
		total: number;
	};
	subscriptions: {
		active: number;
	};
	performance: {
		uptime: number;
		memoryUsedMB: number;
		memoryTotalMB: number;
	};
	arxiv: {
		rateLimiter: {
			canProceed: boolean;
			waitTimeMs: number;
			pendingRequests: number;
		};
	};
}

/**
 * Simple in-memory metrics store
 */
class MetricsStore {
	private counters: Map<string, number> = new Map();
	private gauges: Map<string, number> = new Map();
	private histograms: Map<string, number[]> = new Map();
	private startTime: number = Date.now();

	/**
	 * Increment a counter
	 */
	incrementCounter(name: string, labels?: Record<string, string>): void {
		const key = this.buildKey(name, labels);
		const current = this.counters.get(key) || 0;
		this.counters.set(key, current + 1);
	}

	/**
	 * Set a gauge value
	 */
	setGauge(name: string, value: number, labels?: Record<string, string>): void {
		const key = this.buildKey(name, labels);
		this.gauges.set(key, value);
	}

	/**
	 * Record a histogram value
	 */
	recordHistogram(
		name: string,
		value: number,
		labels?: Record<string, string>,
	): void {
		const key = this.buildKey(name, labels);
		const values = this.histograms.get(key) || [];
		values.push(value);
		// Keep only last 1000 values
		if (values.length > 1000) {
			values.shift();
		}
		this.histograms.set(key, values);
	}

	/**
	 * Get counter value
	 */
	getCounter(name: string, labels?: Record<string, string>): number {
		const key = this.buildKey(name, labels);
		return this.counters.get(key) || 0;
	}

	/**
	 * Get gauge value
	 */
	getGauge(name: string, labels?: Record<string, string>): number {
		const key = this.buildKey(name, labels);
		return this.gauges.get(key) || 0;
	}

	/**
	 * Get histogram statistics
	 */
	getHistogramStats(
		name: string,
		labels?: Record<string, string>,
	): {
		count: number;
		sum: number;
		avg: number;
		min: number;
		max: number;
		p50: number;
		p95: number;
		p99: number;
	} | null {
		const key = this.buildKey(name, labels);
		const values = this.histograms.get(key);

		if (!values || values.length === 0) {
			return null;
		}

		const sorted = [...values].sort((a, b) => a - b);
		const sum = values.reduce((a, b) => a + b, 0);

		return {
			count: values.length,
			sum,
			avg: sum / values.length,
			min: sorted[0] ?? 0,
			max: sorted[sorted.length - 1] ?? 0,
			p50: this.percentile(sorted, 50),
			p95: this.percentile(sorted, 95),
			p99: this.percentile(sorted, 99),
		};
	}

	/**
	 * Get uptime in seconds
	 */
	getUptime(): number {
		return Math.floor((Date.now() - this.startTime) / 1000);
	}

	/**
	 * Reset all metrics
	 */
	reset(): void {
		this.counters.clear();
		this.gauges.clear();
		this.histograms.clear();
	}

	/**
	 * Export all metrics
	 */
	exportAll(): Metric[] {
		const metrics: Metric[] = [];
		const timestamp = Date.now();

		for (const [key, value] of this.counters) {
			const { name, labels } = this.parseKey(key);
			metrics.push({ name, type: "counter", value, labels, timestamp });
		}

		for (const [key, value] of this.gauges) {
			const { name, labels } = this.parseKey(key);
			metrics.push({ name, type: "gauge", value, labels, timestamp });
		}

		return metrics;
	}

	private buildKey(name: string, labels?: Record<string, string>): string {
		if (!labels || Object.keys(labels).length === 0) {
			return name;
		}
		const labelStr = Object.entries(labels)
			.sort(([a], [b]) => a.localeCompare(b))
			.map(([k, v]) => `${k}="${v}"`)
			.join(",");
		return `${name}{${labelStr}}`;
	}

	private parseKey(key: string): {
		name: string;
		labels?: Record<string, string>;
	} {
		const match = key.match(/^([^{]+)(?:\{(.+)\})?$/);
		if (!match) {
			return { name: key };
		}

		const name = match[1] ?? key;
		if (!match[2]) {
			return { name };
		}

		const labels: Record<string, string> = {};
		const labelPairs = match[2].split(",");
		for (const pair of labelPairs) {
			const [k, v] = pair.split("=");
			if (k && v) {
				labels[k] = v.replace(/"/g, "");
			}
		}

		return { name, labels };
	}

	private percentile(sorted: number[], p: number): number {
		const index = Math.ceil((p / 100) * sorted.length) - 1;
		return sorted[Math.max(0, index)] ?? 0;
	}
}

// Global metrics store instance
export const metricsStore = new MetricsStore();

/**
 * Collect comprehensive application metrics
 */
export async function collectMetrics(): Promise<AppMetrics> {
	try {
		// Get database metrics (these may fail if DB is not configured)
		let totalUsers = 0;
		let activeSubscriptions = 0;

		try {
			totalUsers = await getUserCount();
		} catch {
			// Ignore DB errors
		}

		try {
			// Get aggregate stats from all users
			activeSubscriptions = await getTotalSubscriptionCount();
		} catch {
			// Ignore DB errors
		}

		// Get performance metrics
		const memory = process.memoryUsage();

		// Get arXiv rate limiter status
		const rateLimiterStatus = getRateLimiterStatus();

		return {
			users: {
				total: totalUsers,
			},
			searches: {
				total: metricsStore.getCounter("searches_total"),
			},
			bookmarks: {
				total: metricsStore.getCounter("bookmarks_total"),
			},
			subscriptions: {
				active: activeSubscriptions,
			},
			performance: {
				uptime: metricsStore.getUptime(),
				memoryUsedMB: Math.round(memory.heapUsed / 1024 / 1024),
				memoryTotalMB: Math.round(memory.heapTotal / 1024 / 1024),
			},
			arxiv: {
				rateLimiter: rateLimiterStatus,
			},
		};
	} catch (error) {
		logger.error("Error collecting metrics", {
			error: error instanceof Error ? error.message : String(error),
		});

		// Return minimal metrics on error
		return {
			users: { total: 0 },
			searches: { total: 0 },
			bookmarks: { total: 0 },
			subscriptions: { active: 0 },
			performance: {
				uptime: metricsStore.getUptime(),
				memoryUsedMB: 0,
				memoryTotalMB: 0,
			},
			arxiv: {
				rateLimiter: {
					canProceed: true,
					waitTimeMs: 0,
					pendingRequests: 0,
				},
			},
		};
	}
}

/**
 * Format metrics in Prometheus exposition format
 */
export function formatPrometheusMetrics(metrics: AppMetrics): string {
	const lines: string[] = [];

	// Helper to add metric
	const addMetric = (
		name: string,
		value: number,
		help: string,
		type: string,
	) => {
		lines.push(`# HELP ${name} ${help}`);
		lines.push(`# TYPE ${name} ${type}`);
		lines.push(`${name} ${value}`);
	};

	addMetric(
		"research_bot_users_total",
		metrics.users.total,
		"Total number of users",
		"gauge",
	);
	addMetric(
		"research_bot_searches_total",
		metrics.searches.total,
		"Total number of searches",
		"counter",
	);
	addMetric(
		"research_bot_bookmarks_total",
		metrics.bookmarks.total,
		"Total number of bookmarks",
		"counter",
	);
	addMetric(
		"research_bot_subscriptions_active",
		metrics.subscriptions.active,
		"Number of active subscriptions",
		"gauge",
	);
	addMetric(
		"research_bot_uptime_seconds",
		metrics.performance.uptime,
		"Bot uptime in seconds",
		"gauge",
	);
	addMetric(
		"research_bot_memory_used_bytes",
		metrics.performance.memoryUsedMB * 1024 * 1024,
		"Memory used in bytes",
		"gauge",
	);

	return lines.join("\n");
}
