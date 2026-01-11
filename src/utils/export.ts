/**
 * Export Utilities
 *
 * Provides functions to export paper data in various formats:
 * - BibTeX: For citation managers and LaTeX documents
 * - Markdown: For notes and documentation
 * - Plain text: For simple sharing
 */

import type { Paper } from "../arxiv.js";

/**
 * Extract arXiv ID from paper link
 *
 * @param link - arXiv paper link (e.g., "http://arxiv.org/abs/2301.00001")
 * @returns arXiv ID or null if not found
 */
export function extractArxivId(link: string): string | null {
	// Handle various arXiv URL formats
	const patterns = [
		/arxiv\.org\/abs\/([^\s/?]+)/,
		/arxiv\.org\/pdf\/([^\s./?]+)/,
		/^(\d{4}\.\d{4,5})$/,
		/^([a-z-]+\/\d{7})$/i,
	];

	for (const pattern of patterns) {
		const match = link.match(pattern);
		if (match?.[1]) {
			return match[1];
		}
	}

	return null;
}

/**
 * Generate a citation key from arXiv ID and authors
 */
function generateCitationKey(arxivId: string, authors?: string[]): string {
	// Try to use first author's last name
	if (authors?.[0]) {
		const lastName = authors[0].split(" ").pop()?.toLowerCase() || "unknown";
		// Remove special characters
		const cleanName = lastName.replace(/[^a-z]/g, "");
		return `${cleanName}${arxivId.replace(/[./]/g, "")}`;
	}

	return `arxiv${arxivId.replace(/[./]/g, "")}`;
}

/**
 * Escape special characters for BibTeX
 */
function escapeBibTeX(text: string): string {
	return text
		.replace(/\\/g, "\\textbackslash{}")
		.replace(/[&%$#_{}]/g, (match) => `\\${match}`)
		.replace(/~/g, "\\textasciitilde{}")
		.replace(/\^/g, "\\textasciicircum{}")
		.replace(/\n/g, " ");
}

/**
 * Convert paper to BibTeX format
 *
 * @param paper - Paper object to convert
 * @returns BibTeX formatted string
 *
 * @example
 * const bibtex = toBibTeX(paper);
 * // @article{smith2301.00001,
 * //   title={Deep Learning for ...},
 * //   author={John Smith and Jane Doe},
 * //   year={2023},
 * //   ...
 * // }
 */
export function toBibTeX(paper: Paper): string {
	const arxivId = extractArxivId(paper.link) || "unknown";
	const authors = paper.authors?.join(" and ") || "Unknown";
	const year = paper.published?.split("-")[0] || new Date().getFullYear();
	const citationKey = generateCitationKey(arxivId, paper.authors);

	// Get primary category if available
	const primaryClass = paper.categories?.[0] || "cs";

	const bibtex = `@article{${citationKey},
  title={${escapeBibTeX(paper.title)}},
  author={${escapeBibTeX(authors)}},
  year={${year}},
  eprint={${arxivId}},
  archivePrefix={arXiv},
  primaryClass={${primaryClass}},
  url={${paper.link}}
}`;

	return bibtex;
}

/**
 * Convert paper to Markdown format
 *
 * @param paper - Paper object to convert
 * @param options - Formatting options
 * @returns Markdown formatted string
 */
export function toMarkdown(
	paper: Paper,
	options?: {
		includeAbstract?: boolean;
		includePdfLink?: boolean;
	},
): string {
	const { includeAbstract = true, includePdfLink = true } = options || {};

	const arxivId = extractArxivId(paper.link) || "unknown";
	const authors = paper.authors?.join(", ") || "Unknown";
	const pdfLink = `${paper.link.replace("/abs/", "/pdf/")}.pdf`;

	let markdown = `# ${paper.title}\n\n`;
	markdown += `**Authors:** ${authors}\n\n`;
	markdown += `**Published:** ${paper.published}\n\n`;
	markdown += `**arXiv ID:** ${arxivId}\n\n`;

	if (paper.categories?.length) {
		markdown += `**Categories:** ${paper.categories.join(", ")}\n\n`;
	}

	if (includeAbstract && paper.summary) {
		markdown += `## Abstract\n\n${paper.summary}\n\n`;
	}

	markdown += `---\n\n`;
	markdown += `[View on arXiv](${paper.link})`;

	if (includePdfLink) {
		markdown += ` | [PDF](${pdfLink})`;
	}

	markdown += "\n";

	return markdown;
}

/**
 * Convert paper to plain text format
 *
 * @param paper - Paper object to convert
 * @returns Plain text formatted string
 */
export function toPlainText(paper: Paper): string {
	const arxivId = extractArxivId(paper.link) || "unknown";
	const authors = paper.authors?.join(", ") || "Unknown";

	let text = `${paper.title}\n`;
	text += `${"=".repeat(paper.title.length)}\n\n`;
	text += `Authors: ${authors}\n`;
	text += `Published: ${paper.published}\n`;
	text += `arXiv ID: ${arxivId}\n`;

	if (paper.categories?.length) {
		text += `Categories: ${paper.categories.join(", ")}\n`;
	}

	text += `\nAbstract:\n${paper.summary}\n`;
	text += `\nLink: ${paper.link}\n`;

	return text;
}

/**
 * Convert multiple papers to BibTeX format
 *
 * @param papers - Array of papers to convert
 * @returns Combined BibTeX string
 */
export function papersToBibTeX(papers: Paper[]): string {
	return papers.map(toBibTeX).join("\n\n");
}

/**
 * Convert multiple papers to a Markdown list
 *
 * @param papers - Array of papers to convert
 * @param options - Formatting options
 * @returns Markdown formatted list
 */
export function papersToMarkdownList(
	papers: Paper[],
	options?: {
		numbered?: boolean;
		includeAbstract?: boolean;
	},
): string {
	const { numbered = true, includeAbstract = false } = options || {};

	return papers
		.map((paper, index) => {
			const prefix = numbered ? `${index + 1}. ` : "- ";
			const arxivId = extractArxivId(paper.link) || "";
			const authors = paper.authors?.slice(0, 3).join(", ") || "Unknown";
			const moreAuthors = (paper.authors?.length || 0) > 3 ? " et al." : "";

			let entry = `${prefix}**${paper.title}**\n`;
			entry += `   ${authors}${moreAuthors} (${paper.published})\n`;
			entry += `   [arXiv:${arxivId}](${paper.link})`;

			if (includeAbstract && paper.summary) {
				const shortAbstract =
					paper.summary.length > 200
						? `${paper.summary.substring(0, 200)}...`
						: paper.summary;
				entry += `\n   > ${shortAbstract}`;
			}

			return entry;
		})
		.join("\n\n");
}

/**
 * Format paper for Telegram message
 *
 * @param paper - Paper to format
 * @param index - Optional index number
 * @returns Formatted string suitable for Telegram
 */
export function formatPaperForTelegram(paper: Paper, index?: number): string {
	const prefix = index !== undefined ? `${index + 1}. ` : "";
	const authors =
		paper.authors?.slice(0, 2).join(", ") +
		((paper.authors?.length || 0) > 2 ? " et al." : "");

	let message = `${prefix}<b>${escapeHtml(paper.title)}</b>\n`;
	message += `👥 ${escapeHtml(authors || "Unknown")}\n`;
	message += `📅 ${paper.published}\n`;
	message += `🔗 ${paper.link}`;

	return message;
}

/**
 * Escape HTML special characters for Telegram
 */
function escapeHtml(text: string): string {
	return text
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;");
}
