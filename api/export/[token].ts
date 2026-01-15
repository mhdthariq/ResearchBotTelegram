/**
 * Vercel Serverless Function for Export File Downloads
 *
 * This handler serves export files (BibTeX or CSV) based on a temporary token.
 * Tokens are generated when users request an export and expire after a set time.
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
	getExport,
	getExportMimeType,
} from "../../src/utils/exportStorage.js";
import { logger } from "../../src/utils/logger.js";

export default async function handler(
	req: VercelRequest,
	res: VercelResponse,
): Promise<VercelResponse> {
	// Only allow GET requests
	if (req.method !== "GET") {
		return res.status(405).json({ error: "Method not allowed" });
	}

	// Get token from URL parameter
	const { token } = req.query;

	if (!token || typeof token !== "string") {
		logger.warn("Export request missing token");
		return res.status(400).json({ error: "Missing export token" });
	}

	// Retrieve export data
	const exportData = getExport(token);

	if (!exportData) {
		logger.warn("Export not found or expired", { token });
		return res.status(404).json({
			error: "Export not found or expired",
			message: "This download link has expired. Please request a new export from the bot.",
		});
	}

	// Set response headers for file download
	const mimeType = getExportMimeType(exportData.format);
	const filename = exportData.filename;

	res.setHeader("Content-Type", mimeType);
	res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
	res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
	res.setHeader("Pragma", "no-cache");
	res.setHeader("Expires", "0");

	logger.info("Serving export file", {
		token,
		format: exportData.format,
		filename,
		userId: exportData.userId,
	});

	// Send the file content
	return res.status(200).send(exportData.content);
}
