const { db } = require("../db");
const { schedules } = require("../db/schema");
const { eq, and, gte, desc } = require("drizzle-orm");

/**
 * Create a new schedule
 */
async function createSchedule({ chatId, title, description, scheduleAt }) {
  const [schedule] = await db
    .insert(schedules)
    .values({
      chatId,
      title,
      description: description || null,
      scheduleAt: new Date(scheduleAt),
    })
    .returning();

  return schedule;
}

/**
 * Get all upcoming schedules for a chat
 */
async function listSchedules(chatId) {
  const now = new Date();
  const results = await db
    .select()
    .from(schedules)
    .where(
      and(
        eq(schedules.chatId, chatId),
        eq(schedules.isNotified, false)
      )
    )
    .orderBy(desc(schedules.scheduleAt));

  return results;
}

/**
 * Get all schedules for a chat (including past ones)
 */
async function listAllSchedules(chatId) {
  const results = await db
    .select()
    .from(schedules)
    .where(eq(schedules.chatId, chatId))
    .orderBy(desc(schedules.scheduleAt));

  return results;
}

/**
 * Get a single schedule by ID
 */
async function getSchedule(id) {
  const [schedule] = await db
    .select()
    .from(schedules)
    .where(eq(schedules.id, id))
    .limit(1);

  return schedule || null;
}

/**
 * Update a schedule
 */
async function updateSchedule(id, { title, description, scheduleAt }) {
  const updateData = {};

  if (title !== undefined) updateData.title = title;
  if (description !== undefined) updateData.description = description;
  if (scheduleAt !== undefined) updateData.scheduleAt = new Date(scheduleAt);
  updateData.updatedAt = new Date();

  const [updated] = await db
    .update(schedules)
    .set(updateData)
    .where(eq(schedules.id, id))
    .returning();

  return updated || null;
}

/**
 * Delete a schedule
 */
async function deleteSchedule(id) {
  const [deleted] = await db
    .delete(schedules)
    .where(eq(schedules.id, id))
    .returning();

  return deleted || null;
}

/**
 * Mark schedule as notified
 */
async function markAsNotified(id) {
  await db
    .update(schedules)
    .set({ isNotified: true, updatedAt: new Date() })
    .where(eq(schedules.id, id));
}

module.exports = {
  createSchedule,
  listSchedules,
  listAllSchedules,
  getSchedule,
  updateSchedule,
  deleteSchedule,
  markAsNotified,
};
