import { bot } from "./bot";

// Start bot in polling mode (for local development)
bot.onStart(({ info }) => console.log(`✨ Bot ${info.username} started!`));
bot.start();
