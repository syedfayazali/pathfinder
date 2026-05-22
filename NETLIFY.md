# Deploy Pathfinder on Netlify

## 1. Push to GitHub

In PowerShell:

```powershell
cd C:\Users\ADMIN\pathfinder

git init
git add .
git commit -m "Pathfinder job tracker"

# Create a new empty repo on https://github.com/new (name: pathfinder)
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/pathfinder.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

---

## 2. Create Netlify site

1. Go to [app.netlify.com](https://app.netlify.com) → **Add new site** → **Import an existing project**
2. Choose **GitHub** → authorize → select the `pathfinder` repo
3. Netlify should read `netlify.toml` automatically:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
4. Click **Add environment variables** (expand) and add:

   | Key | Value |
   |-----|--------|
   | `VITE_SUPABASE_URL` | Supabase → Settings → API → Project URL |
   | `VITE_SUPABASE_ANON_KEY` | Supabase → Settings → API → anon public key |
   | `VITE_OPENAI_API_KEY` | Optional |
   | `VITE_GOOGLE_CLIENT_ID` | Optional |

5. Click **Deploy site**

Wait ~1–2 minutes. Your URL will look like `https://random-name-123.netlify.app`.

---

## 3. Configure Supabase (required for login)

Supabase Dashboard → **Authentication** → **URL configuration**:

| Field | Value |
|-------|--------|
| **Site URL** | `https://YOUR-SITE.netlify.app` |
| **Redirect URLs** | `https://YOUR-SITE.netlify.app/**` |

Save. Test sign-up / sign-in on the live site.

---

## 4. Custom domain (optional)

Netlify → **Site configuration** → **Domain management** → **Add domain**  
(e.g. `jobs.yourname.com` — follow DNS instructions Netlify shows)

---

## 5. Gmail OAuth (optional)

Google Cloud Console → your OAuth client → **Authorized redirect URIs**:

```
https://YOUR-SITE.netlify.app/settings
```

---

## Redeploy after changes

Push to GitHub — Netlify rebuilds automatically:

```powershell
git add .
git commit -m "Update app"
git push
```

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Blank page after refresh on `/applications` | `netlify.toml` redirects are included — redeploy |
| Login fails on live site | Update Supabase Site URL + Redirect URLs |
| Saves don’t work | Run `supabase/schema.sql` in Supabase SQL Editor |
| Build fails | Check **Deploy log** on Netlify; run `npm run build` locally |

---

## Deploy without GitHub (drag & drop)

```powershell
cd C:\Users\ADMIN\pathfinder
npm run build
```

Netlify → **Sites** → **Add new site** → **Deploy manually** → drag the **`dist`** folder.

Note: env vars must be set in Netlify UI first, then rebuild (drag-drop won’t inject `VITE_*` unless you built locally with `.env` present).
