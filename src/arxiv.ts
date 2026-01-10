import { XMLParser } from "fast-xml-parser";

const parser = new XMLParser({ ignoreAttributes: false });

interface ArxivEntry {
  title: string;
  summary: string;
  id: string;
  published: string;
}

export async function fetchPapers(topic: string, start = 0, max = 5) {
  const url = `http://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(topic)}&start=${start}&max_results=${max}&sortBy=submittedDate&sortOrder=descending`;

  try {
    const response = await fetch(url);
    const xml = await response.text();
    const result = parser.parse(xml);
    const entries = result.feed?.entry;

    if (!entries) return [];

    // Ensure we always have an array (XML parser returns object if only 1 result)
    const papers = Array.isArray(entries) ? entries : [entries];

    return papers.map((p: ArxivEntry) => ({
      title: p.title.replace(/\n/g, " "),
      summary: `${p.summary.trim().substring(0, 200)}...`,
      link: p.id,
      published: p.published.split("T")[0],
    }));
  } catch (error) {
    console.error("Error fetching papers:", error);
    return [];
  }
}
