/**
 * Export Storage Utility
 *
 * Manages temporary storage for export files with automatic expiration.
 * Generates unique tokens for secure download links.
 */

import { randomUUID } from "node:crypto";
import { logger } from "./logger.js";

export interface ExportData {
	content: string;
	format: "bibtex" | "csv";
	filename: string;
	userId: number;
	createdAt: number;
	expiresAt: number;
}

// In-memory storage for exports (consider Redis for production scale)
const exportStore = new Map<string, ExportData>();

// Default expiration time: 10 minutes
const DEFAULT_EXPIRATION_MS = 10 * 60 * 1000;

// Cleanup interval: 5 minutes
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;

/**
 * Generate a unique token for export download
 */
function generateToken(): string {
	return randomUUID();
}

/**
 * Store export data and return a download token
 *
 * @param data - Export data to store
 * @param expirationMs - Optional custom expiration time in milliseconds
 * @returns Unique token for download
 */
export function storeExport(
	data: Omit<ExportData, "createdAt" | "expiresAt">,
	expirationMs = DEFAULT_EXPIRATION_MS,
): string {
	const token = generateToken();
	const now = Date.now();

	const exportData: ExportData = {
		...data,
		createdAt: now,
		expiresAt: now + expirationMs,
	};

	exportStore.set(token, exportData);

	logger.debug("Stored export data", {
		token,
		format: data.format,
		userId: data.userId,
		expiresIn: expirationMs,
	});

	return token;
}

/**
 * Retrieve export data by token
 *
 * @param token - Download token
 * @returns Export data if valid and not expired, null otherwise
 */
export function getExport(token: string): ExportData | null {
	const data = exportStore.get(token);

	if (!data) {
		logger.debug("Export not found", { token });
		return null;
	}

	// Check expiration
	if (Date.now() > data.expiresAt) {
		logger.debug("Export expired", { token });
		exportStore.delete(token);
		return null;
	}

	return data;
}

/**
 * Delete export data by token
 *
 * @param token - Download token
 * @returns true if deleted, false if not found
 */
export function deleteExport(token: string): boolean {
	return exportStore.delete(token);
}

/**
 * Clean up expired exports
 *
 * @returns Number of expired exports removed
 */
export function cleanupExpiredExports(): number {
	const now = Date.now();
	let cleaned = 0;

	for (const [token, data] of exportStore.entries()) {
		if (now > data.expiresAt) {
			exportStore.delete(token);
			cleaned++;
		}
	}

	if (cleaned > 0) {
		logger.info("Cleaned up expired exports", { count: cleaned });
	}

	return cleaned;
}

/**
 * Get the current number of stored exports
 */
export function getExportCount(): number {
	return exportStore.size;
}

/**
 * Build download URL for an export
 *
 * @param token - Export token
 * @param baseUrl - Base URL of the server
 * @returns Full download URL
 */
export function buildExportUrl(token: string, baseUrl: string): string {
	// Remove trailing slash if present
	const cleanBaseUrl = baseUrl.replace(/\/$/, "");
	return `${cleanBaseUrl}/api/export/${token}`;
}

/**
 * Get MIME type for export format
 */
export function getExportMimeType(format: "bibtex" | "csv"): string {
	switch (format) {
		case "bibtex":
			return "application/x-bibtex";
		case "csv":
			return "text/csv";
		default:
			return "application/octet-stream";
	}
}

/**
 * Get file extension for export format
 */
export function getExportExtension(format: "bibtex" | "csv"): string {
	switch (format) {
		case "bibtex":
			return ".bib";
		case "csv":
			return ".csv";
		default:
			return ".txt";
	}
}

// Start cleanup interval
let cleanupIntervalId: ReturnType<typeof setInterval> | null = null;

/**
 * Start the automatic cleanup interval
 */
export function startExportCleanup(): void {
	if (cleanupIntervalId) {
		return; // Already running
	}

	cleanupIntervalId = setInterval(cleanupExpiredExports, CLEANUP_INTERVAL_MS);
	logger.info("Export cleanup interval started", {
		intervalMs: CLEANUP_INTERVAL_MS,
	});
}

/**
 * Stop the automatic cleanup interval
 */
export function stopExportCleanup(): void {
	if (cleanupIntervalId) {
		clearInterval(cleanupIntervalId);
		cleanupIntervalId = null;
		logger.info("Export cleanup interval stopped");
	}
}

// Auto-start cleanup on module load
startExportCleanup();
