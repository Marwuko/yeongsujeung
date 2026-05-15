# 영수증 · Yeongsujeung

> AI expense tracker for students and immigrants in Korea. Snap a receipt, get insights.

[![Built with Next.js](https://img.shields.io/badge/Next.js-15-000)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](https://www.typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres-3ECF8E)](https://supabase.com)

---

## What this is

Yeongsujeung turns Korean and English receipts into a clean spending dashboard. Users snap a photo, Claude vision extracts vendor / items / total / tax / date, and the app categorizes the spend and surfaces weekly insights.

**Target user:** Students and immigrants in Korea who struggle with budgeting across languages, currencies, and unfamiliar receipt formats.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Next.js 15 (App Router)                │
│                                                              │
│   src/app/[locale]/        ← bilingual routes (en, ko)      │
│   src/app/api/             ← Route Handlers                 │
│                                                              │
│   ┌────────────┐    ┌──────────────┐    ┌───────────────┐   │
│   │ Components │ ←→ │ lib/         │ ←→ │ db/queries/   │   │
│   │ (UI)       │    │ (business)   │    │ (data access) │   │
│   └────────────┘    └──────────────┘    └───────────────┘   │
│                            ↕                                 │
│                    ┌───────────────┐                         │
│                    │  Validators   │  (Zod — runtime safety) │
│                    └───────────────┘                         │
└─────────────────────────────────────────────────────────────┘
            ↓                                ↓
   ┌────────────────┐              ┌──────────────────┐
   │  Supabase      │              │  Anthropic API   │
   │  Auth/DB/Store │              │  Claude vision   │
   └────────────────┘              └──────────────────┘
```

### Why this layout?

- **`src/lib/`** holds business logic — pure functions, no UI. Easy to test, easy to reuse.
- **`src/db/queries/`** is the only place that touches Supabase tables directly. The schema can change without touching components.
- **`src/lib/ai/`** is isolated so we can swap models or add fallbacks (e.g. Google Vision) without touching anything else.
- **`src/lib/validators/`** uses Zod to enforce a runtime contract on AI output — JSON from any LLM can be malformed, this catches it at the boundary.

---

## Tech stack

| Layer        | Choice                       | Why                                              |
| ------------ | ---------------------------- | ------------------------------------------------ |
| Framework    | Next.js 15 (App Router)      | Server Components, typed routes, fast iteration  |
| Language     | TypeScript (strict)          | `noUncheckedIndexedAccess` + strict null checks  |
| Database     | Supabase Postgres            | RLS, auth, storage, type-safe SDK in one stack   |
| Auth         | Supabase Auth                | Built-in, no separate auth provider needed       |
| Storage      | Supabase Storage             | Per-user folder isolation enforced via RLS       |
| AI           | Claude Sonnet 4.5 (vision)   | Korean + English fluency, structured JSON output |
| Validation   | Zod                          | Runtime guarantee on AI/external boundaries      |
| Styling      | Tailwind CSS                 | No CSS-in-JS overhead                            |
| i18n         | next-intl                    | Native to App Router, locale-prefixed routing    |
| Charts       | Recharts                     | Composable, themeable, works with SSR            |
| Code quality | ESLint + Prettier + Husky    | Pre-commit checks                                |

---

## Local setup

### Prerequisites

- Node.js ≥ 20
- pnpm ≥ 9
- A Supabase project (free tier is fine)
- An Anthropic API key

### 1. Install

```bash
pnpm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Fill in:

- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from Supabase → Project Settings → API
- `SUPABASE_SERVICE_ROLE_KEY` from the same page (keep secret)
- `ANTHROPIC_API_KEY` from [console.anthropic.com](https://console.anthropic.com/settings/keys)

### 3. Set up the database

Open the Supabase SQL editor and run the migration:

```
src/db/migrations/0001_initial_schema.sql
```

This creates all tables, RLS policies, the storage bucket, and the auto-create-user trigger.

### 4. Run

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Scripts

| Command            | What it does                              |
| ------------------ | ----------------------------------------- |
| `pnpm dev`         | Dev server with Turbopack                 |
| `pnpm build`       | Production build                          |
| `pnpm typecheck`   | Run TypeScript without emitting           |
| `pnpm lint`        | ESLint                                    |
| `pnpm format`      | Prettier (writes)                         |
| `pnpm check`       | typecheck + lint + format check (CI gate) |

---

## Deployment

**Vercel** is the path of least resistance:

1. Push to GitHub
2. Import repo in Vercel
3. Add the same env vars from `.env.local` to Vercel project settings
4. Deploy

Note: `NEXT_PUBLIC_APP_URL` should be set to your production URL.

---

## Roadmap

### Month 1 — MVP _(in progress)_

- [x] Project scaffold + DB schema
- [x] Upload + Claude vision extraction
- [ ] Receipt detail view
- [ ] Dashboard (totals + category breakdown)
- [ ] Auth flow polish

### Month 2 — Insights

- [ ] Weekly LLM-generated summaries
- [ ] PDF export for visa/scholarship proof of expenses
- [ ] Spending trends and rules-based alerts

### Month 3 — Monetization

- [ ] Stripe integration
- [ ] Free / Student / Pro tiers
- [ ] Public Product Hunt launch

---

## License

Private — not yet open source.
