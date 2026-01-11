import { prompt } from "@gramio/prompt";
import { session } from "@gramio/session";
import { Bot, bold, format, InlineKeyboard } from "gramio";
import { fetchPapers } from "../arxiv";

interface SessionData {
	lastTopic?: string;
	lastOffset: number;
}

export const bot = new Bot(process.env.BOT_TOKEN as string)
	.extend(
		session({
			key: "research_session",
			initial: (): SessionData => ({ lastOffset: 0 }),
		}),
	)
	.extend(prompt())

	// --- COMMANDS ---

	.command("start", (context) => {
		const keyboard = new InlineKeyboard()
			.text("🔍 Search Papers", "action:search")
			.text("📚 Load More", "action:more")
			.row()
			.text("ℹ️ Help", "action:help");

		return context.send(
			format`
👋 ${bold`Welcome to AI Research Assistant!`}

I help you discover the latest research papers from arXiv.

${bold`What I can do:`}
🔍 Search for papers on any topic
📚 Load more results from your last search

Use the buttons below or type commands directly!
      `,
			{ reply_markup: keyboard },
		);
	})

	.on("callback_query", async (context) => {
		const data = context.data;
		if (!data?.startsWith("action:")) return;

		const action = data.replace("action:", "");

		switch (action) {
			case "search":
				await context.answer();
				await context.message?.send(
					"🔍 What topic would you like to search for?\n\nType your search query or use:\n/search [topic]",
				);
				break;
			case "more": {
				await context.answer();
				const topic = context.research_session?.lastTopic;
				if (!topic) {
					await context.message?.send(
						"Use /search first to search for papers.",
					);
				} else {
					await context.message?.send(
						`Loading more results for "${topic}"...\nUse /more to load additional papers.`,
					);
				}
				break;
			}
			case "help":
				await context.answer();
				await context.message?.send(
					format`
${bold`📖 Help & Commands`}

${bold`/search [topic]`} - Search for papers
Example: /search neural networks

${bold`/more`} - Load more results from last search

${bold`/start`} - Show main menu
          `,
				);
				break;
		}
	})

	.command("search", async (context) => {
		let topic = context.args ?? "";

		// If no topic provided, ask the user interactively
		if (!topic) {
			const answer = await context.prompt(
				"message",
				"What topic are you looking for?",
			);
			topic = answer.text || "";
		}

		if (!topic) return context.send("Search cancelled.");

		// Save session data for "Load More"
		context.research_session.lastTopic = topic;
		context.research_session.lastOffset = 0;

		await context.send(`🔍 Searching for "${topic}"...`);

		const papers = await fetchPapers(topic);
		if (!papers.length) return context.send("No papers found.");

		const message = papers
			.map(
				(p, i) =>
					format`${bold(`${i + 1}. ${p.title}`)}\n📅 ${p.published}\n🔗 ${p.link}`,
			)
			.join("\n\n");

		return context.send(message);
	})

	.command("more", async (context) => {
		const topic = context.research_session.lastTopic;
		if (!topic) return context.send("Use /search first.");

		const nextOffset = context.research_session.lastOffset + 5;
		context.research_session.lastOffset = nextOffset;

		const papers = await fetchPapers(topic, nextOffset);
		if (!papers.length) return context.send("No more papers.");

		const message = papers
			.map(
				(p, i) =>
					format`${bold(`${i + 1 + nextOffset}. ${p.title}`)}\n📅 ${p.published}\n🔗 ${p.link}`,
			)
			.join("\n\n");

		return context.send(message);
	});
