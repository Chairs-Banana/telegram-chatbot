const { pgTable, uuid, bigint, varchar, text, timestamp, boolean } = require("drizzle-orm/pg-core");

const schedules = pgTable("schedules", {
  id: uuid("id").defaultRandom().primaryKey(),
  chatId: bigint("chat_id", { mode: "number" }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  scheduleAt: timestamp("schedule_at", { withTimezone: true }).notNull(),
  isNotified: boolean("is_notified").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

module.exports = { schedules };
