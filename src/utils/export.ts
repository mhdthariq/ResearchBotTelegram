/**
 * Export Utilities
 *
 * Provides functions to export paper data in various formats:
 * - BibTeX: For citation managers and LaTeX documents
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
