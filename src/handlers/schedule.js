const scheduleService = require("../services/schedule");
const {
  parseScheduleInput,
  parseEditInput,
  parseDeleteInput,
} = require("../utils/parser");
const {
  formatScheduleList,
  formatSuccess,
  formatHelp,
} = require("../utils/formatter");

/**
 * Handle /add command
 * Format: /add Title | Description | 2024-12-25 10:00
 */
async function addHandler(ctx) {
  const chatId = ctx.chat.id;
  const text = ctx.message.text;

  const parsed = parseScheduleInput(text, "/add");

  if (!parsed) {
    return ctx.reply(
      "❌ Format salah!\n\n" +
        "Gunakan format:\n" +
        "`/add Judul | Deskripsi | 2024-12-25 10:00`\n" +
        "atau\n" +
        "`/add Judul | 2024-12-25 10:00`\n\n" +
        "Format tanggal: `YYYY-MM-DD HH:mm`",
      { parse_mode: "Markdown" }
    );
  }

  try {
    const schedule = await scheduleService.createSchedule({
      chatId,
      title: parsed.title,
      description: parsed.description,
      scheduleAt: parsed.scheduleAt,
    });

    return ctx.reply(formatSuccess("created", schedule), {
      parse_mode: "Markdown",
    });
  } catch (error) {
    console.error("Error creating schedule:", error);
    return ctx.reply("❌ Terjadi kesalahan saat membuat jadwal.");
  }
}

/**
 * Handle /list command
 */
async function listHandler(ctx) {
  const chatId = ctx.chat.id;

  try {
    const schedules = await scheduleService.listSchedules(chatId);
    return ctx.reply(formatScheduleList(schedules), {
      parse_mode: "Markdown",
    });
  } catch (error) {
    console.error("Error listing schedules:", error);
    return ctx.reply("❌ Terjadi kesalahan saat mengambil daftar jadwal.");
  }
}

/**
 * Handle /edit command
 * Format: /edit <id> | Title | Description | 2024-12-25 10:00
 */
async function editHandler(ctx) {
  const chatId = ctx.chat.id;
  const text = ctx.message.text;

  const parsed = parseEditInput(text);

  if (!parsed) {
    return ctx.reply(
      "❌ Format salah!\n\n" +
        "Gunakan format:\n" +
        "`/edit <id> | Judul Baru | 2024-12-25 10:00`\n" +
        "atau\n" +
        "`/edit <id> | Judul Baru`\n\n" +
        "ID jadwal bisa dilihat di /list",
      { parse_mode: "Markdown" }
    );
  }

  try {
    // Check if schedule exists and belongs to this chat
    const existing = await scheduleService.getSchedule(parsed.id);

    if (!existing) {
      return ctx.reply("❌ Jadwal tidak ditemukan.");
    }

    if (existing.chatId !== chatId) {
      return ctx.reply("❌ Anda tidak memiliki akses ke jadwal ini.");
    }

    const updated = await scheduleService.updateSchedule(parsed.id, {
      title: parsed.title,
      description: parsed.description,
      scheduleAt: parsed.scheduleAt,
    });

    return ctx.reply(formatSuccess("updated", updated), {
      parse_mode: "Markdown",
    });
  } catch (error) {
    console.error("Error updating schedule:", error);
    return ctx.reply("❌ Terjadi kesalahan saat memperbarui jadwal.");
  }
}

/**
 * Handle /delete command
 * Format: /delete <id>
 */
async function deleteHandler(ctx) {
  const chatId = ctx.chat.id;
  const text = ctx.message.text;

  const id = parseDeleteInput(text);

  if (!id) {
    return ctx.reply(
      "❌ Format salah!\n\n" +
        "Gunakan format:\n" +
        "`/delete <id>`\n\n" +
        "ID jadwal bisa dilihat di /list",
      { parse_mode: "Markdown" }
    );
  }

  try {
    // Check if schedule exists and belongs to this chat
    const existing = await scheduleService.getSchedule(id);

    if (!existing) {
      return ctx.reply("❌ Jadwal tidak ditemukan.");
    }

    if (existing.chatId !== chatId) {
      return ctx.reply("❌ Anda tidak memiliki akses ke jadwal ini.");
    }

    await scheduleService.deleteSchedule(id);

    return ctx.reply(formatSuccess("deleted", existing), {
      parse_mode: "Markdown",
    });
  } catch (error) {
    console.error("Error deleting schedule:", error);
    return ctx.reply("❌ Terjadi kesalahan saat menghapus jadwal.");
  }
}

module.exports = {
  addHandler,
  listHandler,
  editHandler,
  deleteHandler,
};
