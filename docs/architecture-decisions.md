# Architecture Decision Records

Short notes on the "why" behind the choices in this codebase. Future-you will appreciate these.

---

## ADR-001 — Use Claude vision instead of dedicated OCR

**Decision:** Use Claude Sonnet 4.5 vision API for receipt extraction instead of Google Vision API or AWS Textract.

**Context:** We need to extract structured data (vendor, items, total, tax, date, category) from photos of Korean and English receipts.

**Tradeoffs considered:**

| Option         | Pro                                          | Con                                              |
| -------------- | -------------------------------------------- | ------------------------------------------------ |
| Google Vision  | Cheapest per call (~$0.0015)                 | Returns raw text. We'd build a parser ourselves. |
| AWS Textract   | Form/table detection                         | Weak on Korean. Setup overhead.                  |
| Claude vision  | Korean fluency, structured JSON in one call  | More expensive (~$0.015 per receipt)             |

**Decision:** Claude vision wins for the MVP. The 10x cost ($0.015 vs $0.0015) buys us:

- One API call instead of OCR + parsing pipeline
- Native Korean understanding (사업자등록번호, 부가세, etc.)
- Categorization in the same call
- Self-reported confidence for UX hints

**When we'll revisit:** When per-receipt cost matters (>10k receipts/month), add Google Vision as a fallback for high-confidence English receipts and keep Claude for Korean / ambiguous ones.

---

## ADR-002 — Store raw extraction JSON in `receipts.extracted_data`

**Decision:** Save the full Claude response as a `jsonb` column, in addition to denormalizing the key fields (vendor, total, etc.) into typed columns.

**Why:** If we ever want to re-categorize or extract new fields (e.g. "did this receipt include a tip?"), we can re-parse from the stored JSON without re-calling the API. API calls cost money; database reads don't.

---

## ADR-003 — Row Level Security on every table

**Decision:** Enable RLS on `users`, `categories`, `receipts`, `receipt_items`, and the `receipts` storage bucket. Every policy filters by `auth.uid() = user_id`.

**Why:** Defense in depth. Even if a query has a bug and forgets to filter by user_id, RLS prevents data leakage. This is non-negotiable for a multi-tenant SaaS.

**Cost:** Slight query overhead. Worth it.

---

## ADR-004 — Compute monthly summaries on read, not on write

**Decision:** Don't pre-aggregate into a `monthly_summaries` table. Compute totals from `receipts` on the dashboard request.

**Why:** At MVP scale (<10k receipts per user), Postgres can sum these in <50ms with the `(user_id, purchased_at)` index. Pre-aggregation adds write complexity (triggers, race conditions) for no user-visible win until we have much more data.

**When we'll revisit:** If dashboard queries exceed 200ms p95, add a materialized view refreshed nightly.

---

## ADR-005 — `next-intl` over alternatives

**Decision:** Use `next-intl` for i18n.

**Why:** Native App Router support, locale-prefixed routing, server-component-friendly. The `react-i18next` ecosystem is older but doesn't integrate as cleanly with Server Components.

**Tradeoff:** Locked into one library. Migration cost is moderate (mainly the message files port).

---

## ADR-006 — One `/api/receipts/upload` route does both upload AND extract

**Decision:** Don't split upload and extract into separate API calls. Do both in one handler.

**Why for MVP:** Simpler client code, one loading state, one error path. Total handler time is ~3-5s which is fine.

**When we'll revisit:** When we add bulk upload or background re-extraction. At that point, split into:

- `/api/receipts/upload` — fast, returns receipt_id
- A queue worker that runs `extractReceipt` async
- Client subscribes to receipt status changes via Supabase Realtime

This is a deliberate "MVP shortcut, not tech debt" decision. The query layer is already split so the refactor is straightforward.
