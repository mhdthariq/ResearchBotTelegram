import { autoRetry } from "@gramio/auto-retry";
import { paginationFor } from "@gramio/pagination/plugin";
import { prompt } from "@gramio/prompt";
import { session } from "@gramio/session";
import { Bot } from "gramio";
import { config } from "./config.ts";

export const bot = new Bot(config.BOT_TOKEN)
  .extend(autoRetry())
  .extend(session())
  .extend(prompt())
  .extend(paginationFor([]))
  .command("start", (context) => context.send("Hi!"))
  .onStart(({ info }) => console.log(`✨ Bot ${info.username} was started!`));
