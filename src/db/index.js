const { drizzle } = require("drizzle-orm/postgres-js");
const postgres = require("postgres");
const { schedules } = require("./schema");

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set in environment variables");
}

const client = postgres(connectionString);
const db = drizzle(client, { schema: { schedules } });

module.exports = { db, client };
