const { formatInTimeZone } = require("date-fns-tz");

const TIMEZONE = process.env.TIMEZONE || "Asia/Jakarta";

/**
 * Format schedule list message
 */
function formatScheduleList(schedules) {
  if (schedules.length === 0) {
    return "📭 Belum ada jadwal yang tersimpan.\n\nGunakan /add untuk menambah jadwal baru.";
  }

  let msg = `📋 *Daftar Jadwal*\n\n`;

  schedules.forEach((schedule, index) => {
    const timeStr = formatInTimeZone(
      schedule.scheduleAt,
      TIMEZONE,
      "dd MMM yyyy HH:mm"
    );
    const status = schedule.isNotified ? "✅" : "⏳";

    msg += `${status} *${index + 1}. ${schedule.title}*\n`;

    if (schedule.description) {
      msg += `   📝 ${schedule.description}\n`;
    }

    msg += `   🕐 ${timeStr}\n`;
    msg += `   🆔 \`${schedule.id}\`\n\n`;
  });

  msg += `\n💡 Gunakan /delete <id> untuk menghapus jadwal.`;

  return msg;
}

/**
 * Format single schedule message
 */
function formatSchedule(schedule) {
  const timeStr = formatInTimeZone(
    schedule.scheduleAt,
    TIMEZONE,
    "dd MMM yyyy HH:mm"
  );
  const createdStr = formatInTimeZone(
    schedule.createdAt,
    TIMEZONE,
    "dd MMM yyyy HH:mm"
  );

  let msg = `📋 *Detail Jadwal*\n\n`;
  msg += `📌 *Judul:* ${schedule.title}\n`;

  if (schedule.description) {
    msg += `📝 *Deskripsi:* ${schedule.description}\n`;
  }

  msg += `🕐 *Waktu:* ${timeStr} (${TIMEZONE})\n`;
  msg += `📅 *Dibuat:* ${createdStr}\n`;
  msg += `🆔 \`${schedule.id}\`\n`;

  return msg;
}

/**
 * Format success message
 */
function formatSuccess(action, schedule) {
  const timeStr = formatInTimeZone(
    schedule.scheduleAt,
    TIMEZONE,
    "dd MMM yyyy HH:mm"
  );

  const actions = {
    created: "✅ Jadwal berhasil dibuat!",
    updated: "✅ Jadwal berhasil diperbarui!",
    deleted: "🗑️ Jadwal berhasil dihapus!",
  };

  let msg = `${actions[action] || "✅ Berhasil!"}\n\n`;

  if (action !== "deleted") {
    msg += `📌 *${schedule.title}*\n`;
    if (schedule.description) msg += `📝 ${schedule.description}\n`;
    msg += `🕐 ${timeStr}\n`;
  }

  return msg;
}

/**
 * Format help message
 */
function formatHelp() {
  return `🤖 *Bot Jadwal - Bantuan*

📋 *Perintah yang tersedia:*

/start - Mulai menggunakan bot
/help - Tampilkan bantuan ini
/add - Tambah jadwal baru
/list - Lihat semua jadwal
/edit - Edit jadwal yang sudah ada
/delete - Hapus jadwal

📝 *Cara menambah jadwal:*
\`/add Judul | Deskripsi | 2024-12-25 10:00\`
atau
\`/add Judul | 2024-12-25 10:00\`

✏️ *Cara edit jadwal:*
\`/edit <id> | Judul Baru\`
\`/edit <id> | Judul Baru | 2024-12-25 10:00\`

🗑️ *Cara hapus jadwal:*
\`/delete <id>\`

💡 *Tips:*
• Format tanggal: \`YYYY-MM-DD HH:mm\`
• ID jadwal bisa dilihat di /list
• Notifikasi akan dikirim otomatis saat jadwal tiba`;
}

module.exports = {
  formatScheduleList,
  formatSchedule,
  formatSuccess,
  formatHelp,
};
