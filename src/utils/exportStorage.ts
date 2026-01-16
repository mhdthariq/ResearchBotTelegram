/**
 * Export Storage Utility
 *
 * Provides helper functions for export file handling.
 * The tokenized download storage has been deprecated in favor of
 * direct Telegram document uploads.
 */

import { logger } from "./logger.js";

export interface ExportData {
	content: string;
	format: "bibtex" | "csv";
	filename: string;
	userId: number;
	createdAt: number;
	expiresAt: number;
}

// In-memory storage for exports (kept for API endpoint compatibility)
const exportStore = new Map<string, ExportData>();

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
