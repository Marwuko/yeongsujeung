# Setup guide — get to "first receipt extracted" in 30 minutes

This walks you from a fresh clone to a working local app.

---

## 1. Install dependencies (3 min)

```bash
pnpm install
```

If you don't have pnpm: `npm install -g pnpm`.

---

## 2. Create Supabase project (5 min)

1. Go to [supabase.com](https://supabase.com) → New project
2. Name: `yeongsujeung`
3. Region: **Northeast Asia (Seoul)** — closer to your users = lower latency
4. Wait ~2 minutes for provisioning

---

## 3. Run the database migration (3 min)

1. In your Supabase project, go to **SQL Editor**
2. Open `src/db/migrations/0001_initial_schema.sql` in VS Code
3. Copy the whole file, paste into Supabase SQL Editor, run
4. Verify in **Table Editor** that you see: `users`, `categories`, `receipts`, `receipt_items`
5. Verify in **Storage** that you see a private `receipts` bucket

---

## 4. Configure auth (2 min)

In Supabase: **Authentication → Providers → Email**

- Enable **Email** provider
- For local dev, you can disable "Confirm email" so test signups work immediately
- (Re-enable for production — you don't want fake signups)

---

## 5. Get your environment variables (3 min)

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in:

### Supabase

In Supabase project → **Project Settings → API**:

- `NEXT_PUBLIC_SUPABASE_URL` ← "Project URL"
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` ← "anon public" key
- `SUPABASE_SERVICE_ROLE_KEY` ← "service_role" key (⚠️ secret, never commit)

### Anthropic

[console.anthropic.com](https://console.anthropic.com/settings/keys) → Create key

- `ANTHROPIC_API_KEY` ← starts with `sk-ant-`

---

## 6. Run the app (1 min)

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). You should see the landing page.

---

## 7. Test the full flow (10 min)

1. Click **Sign up** → create an account with an email + password
2. (If email confirmation is on, check your inbox)
3. Navigate to `/upload`
4. Drop a receipt photo (any Korean cafe receipt works great)
5. Watch the dropzone turn into "Reading your receipt…"
6. After ~3-5 seconds, you should be redirected to the receipt detail page

If something fails, check:

- Browser DevTools → Network tab → look at the `/api/receipts/upload` response
- Supabase → **Logs** → look for SQL errors
- Anthropic Console → **Logs** → look for API errors

---

## 8. Deploy to Vercel (later)

When you're ready:

1. Push to GitHub
2. [vercel.com/new](https://vercel.com/new) → Import repo
3. Add all env vars from `.env.local`
4. Update `NEXT_PUBLIC_APP_URL` to your Vercel URL
5. In Supabase → **Authentication → URL Configuration**, add your Vercel URL to "Redirect URLs"

---

## Troubleshooting

**`Invalid environment variables` at startup**
→ Check `.env.local` against `.env.example`. The `env.ts` file validates on boot.

**Receipt upload returns 401**
→ You're not logged in. Sign up first.

**Receipt upload returns 422 with "Extraction failed"**
→ The image isn't being read by Claude. Try a clearer photo, or check Anthropic logs.

**Receipt uploads but data is empty**
→ Check `extracted_data` column in Supabase. The model may have returned low confidence — by design we save what we got.
