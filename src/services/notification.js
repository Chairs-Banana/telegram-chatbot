const { db } = require("../db");
const { schedules } = require("../db/schema");
const { eq, and, lte } = require("drizzle-orm");
const { formatInTimeZone } = require("date-fns-tz");

const TIMEZONE = process.env.TIMEZONE || "Asia/Jakarta";

/**
 * Get all schedules that are due for notification
 */
async function getDueSchedules() {
  const now = new Date();

  const results = await db
    .select()
    .from(schedules)
    .where(
      and(
        lte(schedules.scheduleAt, now),
        eq(schedules.isNotified, false)
      )
    );

  return results;
}

/**
 * Format notification message
 */
function formatNotificationMessage(schedule) {
  const timeStr = formatInTimeZone(
    schedule.scheduleAt,
    TIMEZONE,
    "dd MMM yyyy HH:mm"
  );

  let msg = `⏰ *Jadwal Sudah Tiba!*\n\n`;
  msg += `📋 *${schedule.title}*\n`;

  if (schedule.description) {
    msg += `📝 ${schedule.description}\n`;
  }

  msg += `🕐 ${timeStr} (${TIMEZONE})\n`;

  return msg;
}

module.exports = {
  getDueSchedules,
  formatNotificationMessage,
};
