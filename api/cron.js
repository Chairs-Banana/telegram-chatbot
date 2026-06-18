require("dotenv").config();

const { getDueSchedules, formatNotificationMessage } = require("../src/services/notification");
const { markAsNotified } = require("../src/services/schedule");

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CRON_SECRET = process.env.CRON_SECRET;

/**
 * Send Telegram message directly via API
 */
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

module.exports = async (req, res) => {
  // Only allow POST or GET
  if (!["POST", "GET"].includes(req.method)) {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Debug mode: ?debug=true bypasses auth (for manual testing)
  const isDebug = req.query.debug === "true";

  // Verify cron secret
  if (CRON_SECRET && !isDebug) {
    const authHeader = req.headers.authorization || "";
    const isValid = authHeader === `Bearer ${CRON_SECRET}`;

    if (!isValid) {
      console.log("[CRON] Unauthorized. Header:", authHeader);
      return res.status(401).json({ error: "Unauthorized" });
    }
  }

  try {
    // Get all schedules that are due
    const dueSchedules = await getDueSchedules();

    console.log(`[CRON] Found ${dueSchedules.length} due schedules`);

    const results = [];

    for (const schedule of dueSchedules) {
      try {
        const message = formatNotificationMessage(schedule);
        await sendTelegramMessage(schedule.chatId, message);
        await markAsNotified(schedule.id);
        results.push({ id: schedule.id, status: "sent" });
        console.log(`[CRON] Notification sent for schedule ${schedule.id}`);
      } catch (error) {
        console.error(`[CRON] Failed for schedule ${schedule.id}:`, error.message);
        results.push({ id: schedule.id, status: "error", error: error.message });
      }
    }

    return res.status(200).json({
      ok: true,
      processed: dueSchedules.length,
      results,
    });
  } catch (error) {
    console.error("[CRON] Job error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
