require("dotenv").config();

const { getDueSchedules, formatNotificationMessage } = require("../src/services/notification");
const { markAsNotified } = require("../src/services/schedule");

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

async function sendTelegramMessage(chatId, text) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: "Markdown",
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Telegram API error: ${error}`);
  }

  return response.json();
}

async function main() {
  console.log("[TEST-CRON] Starting cron test...\n");

  try {
    // Get all schedules that are due
    const dueSchedules = await getDueSchedules();

    console.log(`[TEST-CRON] Found ${dueSchedules.length} due schedule(s)\n`);

    if (dueSchedules.length === 0) {
      console.log("Tidak ada jadwal yang due. Buat jadwal dengan waktu yang sudah lewat untuk test.");
      process.exit(0);
    }

    for (const schedule of dueSchedules) {
      console.log("---");
      console.log(`ID: ${schedule.id}`);
      console.log(`Chat ID: ${schedule.chatId}`);
      console.log(`Title: ${schedule.title}`);
      console.log(`Description: ${schedule.description || "-"}`);
      console.log(`Schedule At: ${schedule.scheduleAt}`);
      console.log(`Is Notified: ${schedule.isNotified}`);

      try {
        const message = formatNotificationMessage(schedule);
        console.log(`\nMessage:\n${message}`);

        await sendTelegramMessage(schedule.chatId, message);
        await markAsNotified(schedule.id);

        console.log(`\n✅ Notification sent & marked as notified`);
      } catch (error) {
        console.error(`\n❌ Failed: ${error.message}`);
      }
    }

    console.log("\n---");
    console.log("[TEST-CRON] Done!");
  } catch (error) {
    console.error("[TEST-CRON] Error:", error);
    process.exit(1);
  }

  process.exit(0);
}

main();
