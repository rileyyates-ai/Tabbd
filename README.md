# Family Challenge

The family operating system powered by challenges. Everyone participates — parents included.

## Quick Start

See `SETUP-GUIDE.md` for complete step-by-step instructions.

```bash
npm install
cp .env.local.example .env.local
# Add your Supabase keys to .env.local
npm run dev
```

## Tech Stack

- **Frontend:** Next.js 14 + React + Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Auth + Realtime)
- **Hosting:** Vercel
- **Icons:** Lucide React

## Database Setup

Run `supabase-setup.sql` in your Supabase SQL Editor to create all tables and security policies.
