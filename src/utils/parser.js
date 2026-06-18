const { parse, isValid } = require("date-fns");
const { formatInTimeZone, fromZonedTime } = require("date-fns-tz");

const TIMEZONE = process.env.TIMEZONE || "Asia/Jakarta";

/**
 * Parse schedule input from user
 * Format: /add Title | Description | 2024-12-25 10:00
 * Or:     /add Title | 2024-12-25 10:00
 *
 * Returns: { title, description, scheduleAt } or null if invalid
 */
function parseScheduleInput(text, commandPrefix) {
  // Remove command prefix
  const input = text.replace(commandPrefix, "").trim();

  if (!input) return null;

  const parts = input.split("|").map((p) => p.trim());

  if (parts.length < 2) return null;

  let title, description, dateTimeStr;

  if (parts.length === 2) {
    // Title | DateTime
    title = parts[0];
    description = null;
    dateTimeStr = parts[1];
  } else {
    // Title | Description | DateTime
    title = parts[0];
    description = parts[1];
    dateTimeStr = parts.slice(2).join("|"); // In case description has |
  }

  // Parse datetime - try multiple formats
  const scheduleAt = parseDateTime(dateTimeStr);

  if (!scheduleAt) return null;

  return { title, description, scheduleAt: scheduleAt.toISOString() };
}

/**
 * Parse edit input from user
 * Format: /edit <id> | Title | Description | 2024-12-25 10:00
 * Or:     /edit <id> | Title | 2024-12-25 10:00
 * Or:     /edit <id> | Title
 *
 * Returns: { id, title, description, scheduleAt } or null if invalid
 */
function parseEditInput(text) {
  const input = text.replace("/edit", "").trim();

  if (!input) return null;

  const parts = input.split("|").map((p) => p.trim());

  if (parts.length < 2) return null;

  const id = parts[0];

  // Validate UUID format
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) return null;

  let title, description, scheduleAt;

  if (parts.length === 2) {
    // /edit <id> | Title (only update title)
    title = parts[1];
  } else if (parts.length === 3) {
    // /edit <id> | Title | DateTime
    title = parts[1];
    const parsed = parseDateTime(parts[2]);
    if (parsed) scheduleAt = parsed.toISOString();
    else description = parts[2]; // Maybe it's description
  } else {
    // /edit <id> | Title | Description | DateTime
    title = parts[1];
    description = parts[2];
    const parsed = parseDateTime(parts.slice(3).join("|"));
    if (parsed) scheduleAt = parsed.toISOString();
  }

  return { id, title, description, scheduleAt };
}

/**
 * Parse delete input
 * Format: /delete <id>
 */
function parseDeleteInput(text) {
  const input = text.replace("/delete", "").trim();
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  if (!uuidRegex.test(input)) return null;
  return input;
}

/**
 * Parse date-time string with multiple format support
 * Input is treated as being in TIMEZONE, then converted to UTC for storage
 */
function parseDateTime(str) {
  if (!str) return null;

  const formats = [
    "yyyy-MM-dd HH:mm",
    "dd/MM/yyyy HH:mm",
    "dd-MM-yyyy HH:mm",
    "yyyy/MM/dd HH:mm",
    "dd MMM yyyy HH:mm",
  ];

  for (const fmt of formats) {
    const parsed = parse(str.trim(), fmt, new Date());
    if (isValid(parsed)) {
      // Treat input as TIMEZONE, convert to UTC
      return fromZonedTime(parsed, TIMEZONE);
    }
  }

  return null;
}

module.exports = {
  parseScheduleInput,
  parseEditInput,
  parseDeleteInput,
};
