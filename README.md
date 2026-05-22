# Pathfinder — Job Tracker

A self-hosted clone of your [Base44 Pathfinder app](https://my-jobtracker.base44.app), built with **React**, **Vite**, **TypeScript**, **Tailwind CSS**, and **Supabase**.

## Features

- **Dashboard** — stats, upcoming interviews, recent activity
- **Applications** — CRUD, search, filter, CSV export
- **Pipeline** — Kanban board with drag-and-drop stages
- **Companies** — company directory with notes
- **Contacts** — recruiters, HR, references
- **Documents** — upload resumes, offer letters, etc.
- **Settings** — profile, Gmail OAuth, resume builder
- **AI Email Scanner** — paste emails or use OpenAI to detect application updates
- **Resume Builder** — summary, skills, print to PDF

## Quick start (demo mode)

Works immediately without Supabase — data is stored in `localStorage`.

```bash
cd pathfinder
npm install
npm run dev
```

Open http://localhost:5173 — use any email/password to sign in.

## Supabase setup (required for cloud sync)

**If you added Supabase keys but saves do nothing**, you likely skipped this step. The app needs database tables.

1. Create a project at [supabase.com](https://supabase.com)
2. Open **SQL Editor** → paste the full contents of `supabase/schema.sql` → **Run**
3. Copy `.env.example` to `.env` and add your keys:

```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

4. Enable Email auth in Supabase → Authentication  
   - For quick testing: disable **Confirm email** under Email provider
5. Restart `npm run dev` — the yellow banner should disappear after tables exist
6. (Optional) Create a `documents` storage bucket for file uploads

If you already ran the schema earlier, also run `supabase/migrations/002_company_logo.sql` to add company logo support.

Until step 2 is done, the app uses **local browser storage** (data on one device only).

## Optional integrations

| Feature | Env variable |
|---------|----------------|
| AI email scanner | `VITE_OPENAI_API_KEY` |
| Gmail quick access | `VITE_GOOGLE_CLIENT_ID` |

## Migrate data from Base44

Base44 does not export source code publicly. To move your data:

1. Export applications from Base44 (if available in the builder), or
2. Re-enter records manually, or
3. Use the AI Email Scanner to re-import updates from pasted emails

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm run preview` — preview production build
