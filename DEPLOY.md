# Publish Pathfinder online

Your app is a **static React site** (Vite) + **Supabase** (database & auth). You host the frontend on any static host; Supabase stays on [supabase.com](https://supabase.com).

## Before you publish

1. **Supabase database** — Run `supabase/schema.sql` (and `migrations/002_company_logo.sql` if needed) in SQL Editor.
2. **Supabase Auth** — Dashboard → **Authentication** → **URL configuration**:
   - **Site URL**: your live URL (e.g. `https://pathfinder.vercel.app`)
   - **Redirect URLs**: add the same URL and `https://your-domain.com/**`
3. **Email sign-up** (optional): Authentication → Providers → Email → turn off **Confirm email** for easier testing, or keep it on for production.
4. **Never commit `.env`** — set secrets only in the hosting dashboard.

---

## Option A: Vercel (recommended, free)

1. Push the project to **GitHub** (create a repo, then `git init`, commit, push).
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import your repo.
3. Settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Root Directory**: `pathfinder` (if the repo root is your user folder, use `.` instead)
4. **Environment Variables** (Project → Settings → Environment Variables):

   | Name | Value |
   |------|--------|
   | `VITE_SUPABASE_URL` | From Supabase → Settings → API |
   | `VITE_SUPABASE_ANON_KEY` | Same page (anon public key) |
   | `VITE_OPENAI_API_KEY` | Optional |
   | `VITE_GOOGLE_CLIENT_ID` | Optional (Gmail) |

5. Click **Deploy**. Your site will be at `https://your-project.vercel.app`.

`vercel.json` in this repo already handles client-side routing.

**CLI (no GitHub):**

```powershell
cd C:\Users\ADMIN\pathfinder
npm i -g vercel
npm run build
vercel
```

Follow prompts; add env vars in the Vercel dashboard afterward.

---

## Option B: Netlify (free)

1. Push to GitHub (same as above).
2. [netlify.com](https://netlify.com) → **Add new site** → Import from Git.
3. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. **Site configuration** → **Environment variables** — same `VITE_*` names as above.
5. Deploy. `public/_redirects` handles SPA routing.

---

## Option C: Cloudflare Pages (free)

1. Push to GitHub.
2. Cloudflare Dashboard → **Workers & Pages** → **Create** → **Pages** → Connect repo.
3. Build: `npm run build`, output: `dist`.
4. Add environment variables (`VITE_SUPABASE_URL`, etc.).
5. Add a **Redirect rule** (or `_redirects` file): all paths → `/index.html` (200).

---

## Option D: Your own server (VPS / nginx)

```powershell
npm run build
```

Upload the `dist` folder to the server. Example nginx:

```nginx
root /var/www/pathfinder/dist;
location / {
  try_files $uri $uri/ /index.html;
}
```

Serve over HTTPS (Let’s Encrypt). Env vars are baked in at **build time** for Vite — set `VITE_*` on the machine before `npm run build`, or use a CI pipeline that injects them.

---

## After deploy — checklist

| Step | Action |
|------|--------|
| Supabase URLs | Site URL + Redirect URLs = your live domain |
| Gmail OAuth | Google Cloud → OAuth client → Authorized redirect URI = `https://your-domain.com/settings` |
| Test | Sign up, add application, upload logo, refresh page (data should persist) |
| Custom domain | Vercel/Netlify → Domains → add `jobs.yourname.com` |

---

## Local production preview

```powershell
cd C:\Users\ADMIN\pathfinder
npm run build
npm run preview
```

Open the URL shown (usually `http://localhost:4173`) to test the production build before publishing.

---

## What you cannot move from Base44

Your old [Base44 app](https://my-jobtracker.base44.app) is hosted by Base44. This project is **your own copy** — publishing this repo does not migrate Base44 data automatically. Export/re-enter data or use the email scanner to re-import.
