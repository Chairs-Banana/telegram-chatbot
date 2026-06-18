# Telegram Schedule Bot

Bot Telegram untuk mengelola jadwal dengan notifikasi otomatis. Dibangun dengan Node.js, Telegraf, Drizzle ORM, dan Supabase. Deploy di Vercel.

## Fitur

- Tambah, edit, hapus jadwal
- Lihat daftar jadwal
- Notifikasi otomatis saat jadwal tiba
- Support timezone (default: Asia/Jakarta)
- Deploy serverless di Vercel

## Tech Stack

| Layer         | Teknologi                  |
| ------------- | -------------------------- |
| Runtime       | Node.js                    |
| Bot Framework | Telegraf                   |
| Database      | Supabase (PostgreSQL)      |
| ORM           | Drizzle ORM                |
| Deployment    | Vercel (Serverless + Cron) |

## Struktur Project

```
├── api/
│   ├── webhook.js          # Endpoint Telegram webhook
│   └── cron.js             # Cron job kirim notifikasi (setiap 1 menit)
├── src/
│   ├── bot.js              # Instance Telegraf + registrasi handler
│   ├── db/
│   │   ├── schema.js       # Definisi tabel schedules
│   │   └── index.js        # Koneksi database
│   ├── handlers/
│   │   ├── start.js        # Handler /start, /help
│   │   └── schedule.js     # Handler /add, /list, /edit, /delete
│   ├── services/
│   │   ├── schedule.js     # Operasi CRUD
│   │   └── notification.js # Query jadwal & format notifikasi
│   └── utils/
│       ├── parser.js       # Parsing input user
│       └── formatter.js    # Format pesan Telegram
├── vercel.json             # Konfigurasi Vercel + cron
├── drizzle.config.js       # Konfigurasi Drizzle Kit
└── .env                    # Environment variables
```

## Perintah Bot

| Perintah  | Fungsi                | Contoh                                                 |
| --------- | --------------------- | ------------------------------------------------------ |
| `/start`  | Mulai menggunakan bot | `/start`                                               |
| `/help`   | Tampilkan bantuan     | `/help`                                                |
| `/add`    | Tambah jadwal baru    | `/add Rapat Tim \| 2024-12-25 10:00`                   |
| `/add`    | Dengan deskripsi      | `/add Rapat Tim \| Diskusi budget \| 2024-12-25 10:00` |
| `/list`   | Lihat semua jadwal    | `/list`                                                |
| `/edit`   | Edit jadwal           | `/edit <id> \| Judul Baru \| 2024-12-26 14:00`         |
| `/delete` | Hapus jadwal          | `/delete <id>`                                         |

Format tanggal: `YYYY-MM-DD HH:mm`

## Setup Lokal

### 1. Clone & Install

```bash
git clone <repo-url>
cd telegram-chatbot-v2
npm install
```

### 2. Buat Supabase Project

1. Buka [supabase.com](https://supabase.com) → buat project baru
2. Buka **Settings → Database** → copy connection string
3. Buka **Settings → API** → copy URL dan anon key

### 3. Konfigurasi Environment

Copy `.env.example` ke `.env` dan isi:

```env
TELEGRAM_BOT_TOKEN=token_dari_botfather
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJxxx
DATABASE_URL=postgresql://postgres:password@db.xxx.supabase.co:5432/postgres
CRON_SECRET=random_secret_string
APP_URL=http://localhost:3000
TIMEZONE=Asia/Jakarta
```

### 4. Push Schema ke Database

```bash
npm run db:push
```

### 5. Jalankan Bot (Polling Mode)

```bash
npm run dev
```

Bot akan berjalan dengan polling — cocok untuk development lokal.

## Deploy ke Vercel

### 1. Install Vercel CLI

```bash
npm i -g vercel
```

### 2. Login & Deploy

```bash
vercel login
vercel --prod
```

### 3. Set Environment Variables

Buka **Vercel Dashboard → Project → Settings → Environment Variables**, tambahkan semua variabel dari `.env`.

### 4. Set Webhook Telegram

```bash
curl "https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://<PROJECT>.vercel.app/api/webhook"
```

Ganti `<TOKEN>` dengan bot token dan `<PROJECT>` dengan nama project Vercel.

### 5. Aktifkan Cron Job

Buka **Vercel Dashboard → Project → Settings → Crons** — pastikan cron `/api/cron` terdaftar dengan jadwal `* * * * *` (setiap menit).

## Cara Kerja

```
User kirim pesan → Telegram → Vercel Webhook (/api/webhook) → Bot proses → Simpan ke Supabase

Vercel Cron (setiap menit) → /api/cron → Cek jadwal due → Kirim notifikasi ke user
```

1. **Webhook**: Menerima update dari Telegram dan memproses command
2. **Cron**: Mengecek jadwal yang sudah waktunya dan mengirim notifikasi
3. **Database**: Menyimpan semua data jadwal di Supabase PostgreSQL

## Database Schema

Tabel `schedules`:

| Kolom         | Tipe         | Keterangan           |
| ------------- | ------------ | -------------------- |
| `id`          | UUID         | Primary key          |
| `chat_id`     | BIGINT       | ID chat Telegram     |
| `title`       | VARCHAR(255) | Judul jadwal         |
| `description` | TEXT         | Deskripsi (opsional) |
| `schedule_at` | TIMESTAMP    | Waktu jadwal         |
| `is_notified` | BOOLEAN      | Status notifikasi    |
| `created_at`  | TIMESTAMP    | Waktu dibuat         |
| `updated_at`  | TIMESTAMP    | Terakhir diupdate    |

## License

MIT
