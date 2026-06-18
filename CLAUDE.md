# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Telegram Chatbot v2 — A schedule management bot with automatic notifications. Built with Node.js, Express, Telegraf, Drizzle ORM, and Supabase. Deployed on Vercel.

## Common Commands

```bash
# Install dependencies
npm install

# Run locally (polling mode)
npm run dev

# Database migrations (Drizzle)
npm run db:generate   # Generate migration files
npm run db:push       # Push schema directly to Supabase
npm run db:migrate    # Run migrations
```

## Architecture

```
api/
  webhook.js          — Vercel serverless: receives Telegram updates, forwards to bot
  cron.js             — Vercel Cron: checks due schedules every minute, sends notifications
src/
  bot.js              — Telegraf instance, registers all command handlers
  db/
    schema.js         — Drizzle table definition (schedules)
    index.js          — postgres-js client + drizzle instance
  handlers/
    start.js          — /start, /help command handlers
    schedule.js       — /add, /list, /edit, /delete command handlers
  services/
    schedule.js       — CRUD operations via Drizzle
    notification.js   — Query due schedules, format notification messages
  utils/
    parser.js         — Parse user input (pipes-separated format)
    formatter.js      — Format Telegram messages (Markdown)
vercel.json           — Cron schedule (every minute), route config
drizzle.config.js     — Drizzle Kit config for migrations
```

## Key Design Decisions

- **Webhook + Cron pattern**: `api/webhook.js` handles incoming Telegram messages. `api/cron.js` runs every minute via Vercel Cron to send due notifications. No long-running processes.
- **Pipes-separated input**: User commands use `|` as delimiter: `/add Title | Description | 2024-12-25 10:00`
- **Ownership check**: Edit/delete verify `chatId` matches before modifying — users can only manage their own schedules.
- **Timezone-aware**: All timestamps stored with timezone. Display uses `TIMEZONE` env var (default: Asia/Jakarta).

## Bot Commands

| Command | Usage |
|---------|-------|
| `/add` | `/add Title \| Description \| YYYY-MM-DD HH:mm` |
| `/list` | Show upcoming (unnotified) schedules |
| `/edit` | `/edit <uuid> \| New Title \| New DateTime` |
| `/delete` | `/delete <uuid>` |

## Environment Variables

All config in `.env` — see `.env.example` for required vars:
- `TELEGRAM_BOT_TOKEN` — from @BotFather
- `DATABASE_URL` — Supabase PostgreSQL connection string
- `SUPABASE_URL`, `SUPABASE_ANON_KEY` — Supabase project credentials
- `CRON_SECRET` — secures the cron endpoint
- `APP_URL` — Vercel deployment URL
- `TIMEZONE` — default `Asia/Jakarta`
