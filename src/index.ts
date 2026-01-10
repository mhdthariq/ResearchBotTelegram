import { prompt } from "@gramio/prompt";
import { session } from "@gramio/session";
import { and, eq } from "drizzle-orm";
import { Bot, bold, format, InlineKeyboard } from "gramio";
import { initJobify } from "jobify";
import { fetchPapers } from "./arxiv";
import { db } from "./db";
import { subscriptions } from "./db/schema";

// 1. Setup Scheduler
const createJob = initJobify(
  process.env.REDIS_URL
    ? { url: process.env.REDIS_URL, skipVersionCheck: true }
    : {
        host: process.env.REDIS_HOST || "localhost",
        port: Number(process.env.REDIS_PORT) || 6379,
        skipVersionCheck: true,
      },
);

interface SessionData {
  lastTopic?: string;
  lastOffset: number;
}

const bot = new Bot(process.env.BOT_TOKEN as string)
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
      .text("🔔 Subscribe", "action:subscribe")
      .text("🗑 Unsubscribe", "action:unsubscribe")
      .row()
      .text("ℹ️ Help", "action:help");

    return context.send(
      format`
👋 ${bold`Welcome to AI Research Assistant!`}

I help you discover and track the latest research papers from arXiv.

${bold`What I can do:`}
🔍 Search for papers on any topic
📚 Load more results from your last search
🔔 Subscribe to daily updates on topics
🗑 Unsubscribe from topics

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
      case "subscribe":
        await context.answer();
        await context.message?.send(
          "🔔 To subscribe to daily updates, use:\n/subscribe [topic] [days]\n\nExample: /subscribe machine learning 1",
        );
        break;
      case "unsubscribe":
        await context.answer();
        await context.message?.send(
          "🗑 To unsubscribe from a topic, use:\n/unsubscribe [topic]\n\nExample: /unsubscribe machine learning",
        );
        break;
      case "help":
        await context.answer();
        await context.message?.send(
          format`
${bold`📖 Help & Commands`}

${bold`/search [topic]`} - Search for papers
Example: /search neural networks

${bold`/more`} - Load more results from last search

${bold`/subscribe [topic] [days]`} - Get periodic updates
Example: /subscribe AI safety 1

${bold`/unsubscribe [topic]`} - Stop updates for a topic
Example: /unsubscribe AI safety

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
  })

  .command("subscribe", async (context) => {
    // Usage: /subscribe topic 1
    const args = context.text
      ?.replace("/subscribe", "")
      .trim()
      .split(/\s+(\d+)$/);

    if (!args || args.length < 2 || !args[0] || !args[1]) {
      return context.send(
        "Usage: /subscribe [topic] [days]\nExample: /subscribe machine learning 1",
      );
    }

    const topic = args[0].trim();
    const days = parseInt(args[1], 10);

    await db.insert(subscriptions).values({
      chatId: context.chatId.toString(),
      userId: context.senderId?.toString() ?? "",
      topic: topic,
      intervalDays: days,
    });

    return context.send(`✅ Subscribed to "${topic}" every ${days} days.`);
  })

  .command("unsubscribe", async (context) => {
    const topic = context.text?.replace("/unsubscribe", "").trim();
    if (!topic) return context.send("Usage: /unsubscribe [topic]");

    await db
      .delete(subscriptions)
      .where(
        and(
          eq(subscriptions.chatId, context.chatId.toString()),
          eq(subscriptions.topic, topic),
        ),
      );

    return context.send(`🗑 Unsubscribed from "${topic}".`);
  });

// --- 2. SCHEDULER LOGIC ---
const subscriptionJob = createJob("check-subscriptions").action(async () => {
  const allSubs = await db.select().from(subscriptions);
  const now = new Date();

  for (const sub of allSubs) {
    const lastRun = new Date(sub.lastRunAt || 0);
    const nextRun = new Date(lastRun);
    nextRun.setDate(lastRun.getDate() + sub.intervalDays);

    if (now >= nextRun) {
      const papers = await fetchPapers(sub.topic, 0, 3);
      if (papers.length > 0) {
        await bot.api.sendMessage({
          chat_id: sub.chatId,
          text:
            `🔔 Daily Update for ${sub.topic}:\n\n` +
            papers.map((p) => `${p.title}\n${p.link}`).join("\n\n"),
        });

        await db
          .update(subscriptions)
          .set({ lastRunAt: new Date().toISOString() })
          .where(eq(subscriptions.id, sub.id));
      }
    }
  }
});

subscriptionJob.repeatable({ every: 60 * 60 * 1000 }); // 60 minutes in ms

// --- 3. START BOT ---
bot.onStart(({ info }) => console.log(`✨ Bot ${info.username} started!`));
bot.start();
