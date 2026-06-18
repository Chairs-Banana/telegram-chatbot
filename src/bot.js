require("dotenv").config();

const { Telegraf } = require("telegraf");
const { startHandler, helpHandler } = require("./handlers/start");
const { addHandler, listHandler, editHandler, deleteHandler } = require("./handlers/schedule");

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  console.error("❌ TELEGRAM_BOT_TOKEN is not set in environment variables");
  process.exit(1);
}

const bot = new Telegraf(token);

// Register command handlers
bot.start(startHandler);
bot.help(helpHandler);
bot.command("add", addHandler);
bot.command("list", listHandler);
bot.command("edit", editHandler);
bot.command("delete", deleteHandler);

// Error handling
bot.catch((err, ctx) => {
  console.error(`❌ Error for ${ctx.updateType}:`, err);
  return ctx.reply("❌ Terjadi kesalahan internal.");
});

// Export bot for webhook usage
module.exports = { bot };

// Start polling for local development
if (process.env.NODE_ENV !== "production") {
  console.log("🤖 Bot started in polling mode...");
  bot.launch();

  // Graceful stop
  process.once("SIGINT", () => bot.stop("SIGINT"));
  process.once("SIGTERM", () => bot.stop("SIGTERM"));
}
