const { formatHelp } = require("../utils/formatter");

/**
 * Handle /start command
 */
function startHandler(ctx) {
  return ctx.reply(
    `👋 *Selamat Datang di Bot Jadwal!*\n\n` +
      `Saya bisa membantu Anda mengelola jadwal dan mengirimkan notifikasi saat jadwal tiba.\n\n` +
      `Gunakan /help untuk melihat daftar perintah yang tersedia.`,
    { parse_mode: "Markdown" }
  );
}

/**
 * Handle /help command
 */
function helpHandler(ctx) {
  return ctx.reply(formatHelp(), { parse_mode: "Markdown" });
}

module.exports = { startHandler, helpHandler };
