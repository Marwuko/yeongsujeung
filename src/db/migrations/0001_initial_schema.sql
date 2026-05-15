-- ============================================================
-- Yeongsujeung — Initial schema
-- ============================================================
-- Design decisions:
-- 1. `users` extends auth.users via FK (Supabase pattern)
-- 2. `receipts.extracted_data` stores raw JSON from Claude vision
--    so we can re-parse without re-calling the API
-- 3. RLS on every table — users can only see their own data
-- 4. Categories are seeded as system defaults; users may add custom ones later
-- 5. We compute monthly summaries on read for now (cron job comes in Month 2)
-- ============================================================

-- ============================================================
-- USERS
-- ============================================================
create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  display_name text,
  locale text not null default 'en' check (locale in ('en', 'ko')),
  currency text not null default 'KRW',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.users is 'App-level user profile. Extends auth.users.';

-- ============================================================
-- CATEGORIES
-- ============================================================
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users (id) on delete cascade,
  -- null user_id = system default category, available to all users
  slug text not null,
  name_en text not null,
  name_ko text not null,
  icon text,
  color text,
  is_system boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (user_id, slug)
);

comment on table public.categories is 'Spending categories. System defaults have user_id = null.';

-- Seed system categories tuned for Korean student/immigrant life
insert into public.categories (slug, name_en, name_ko, icon, color, is_system, sort_order) values
  ('restaurant',    'Restaurant',    '식당',         '🍚', '#ed6f1f', true, 10),
  ('cafe',          'Cafe',          '카페',         '☕', '#b84014', true, 20),
  ('convenience',   'Convenience',   '편의점',       '🏪', '#f18d43', true, 30),
  ('grocery',       'Grocery',       '마트',         '🛒', '#76d275', true, 40),
  ('transport',     'Transport',     '교통',         '🚇', '#4a90e2', true, 50),
  ('subscription',  'Subscription',  '통신/구독',    '📱', '#9b59b6', true, 60),
  ('school',        'School',        '학용품',       '📚', '#e74c3c', true, 70),
  ('health',        'Health',        '건강',         '💊', '#2ecc71', true, 80),
  ('other',         'Other',         '기타',         '📦', '#95a5a6', true, 999);

-- ============================================================
-- RECEIPTS
-- ============================================================
create type public.receipt_status as enum ('pending', 'processing', 'extracted', 'failed');

create table public.receipts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  category_id uuid references public.categories (id) on delete set null,

  -- Storage
  image_path text not null, -- path in Supabase Storage bucket
  image_url text,           -- cached signed URL (refreshed periodically)

  -- Extracted fields (denormalized for fast queries)
  vendor text,
  vendor_normalized text,   -- lowercased + trimmed for matching
  total_amount numeric(12, 2),
  tax_amount numeric(12, 2),
  currency text not null default 'KRW',
  purchased_at timestamptz,

  -- Raw AI output (kept for re-parsing & debugging)
  extracted_data jsonb,
  extraction_model text,    -- e.g. 'claude-sonnet-4-5'
  extraction_cost_usd numeric(10, 6), -- track API cost per receipt

  -- State machine
  status public.receipt_status not null default 'pending',
  error_message text,

  -- User notes/overrides
  user_notes text,
  is_flagged boolean not null default false,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index receipts_user_id_purchased_at_idx
  on public.receipts (user_id, purchased_at desc nulls last);
create index receipts_user_id_category_id_idx
  on public.receipts (user_id, category_id);
create index receipts_user_id_status_idx
  on public.receipts (user_id, status);

comment on table public.receipts is 'A single receipt. extracted_data is the raw JSON from the vision model.';

-- ============================================================
-- RECEIPT ITEMS
-- ============================================================
create table public.receipt_items (
  id uuid primary key default gen_random_uuid(),
  receipt_id uuid not null references public.receipts (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade, -- denormalized for RLS performance

  name text not null,
  quantity numeric(10, 3) default 1,
  unit_price numeric(12, 2),
  total_price numeric(12, 2),
  sort_order integer not null default 0,

  created_at timestamptz not null default now()
);

create index receipt_items_receipt_id_idx on public.receipt_items (receipt_id);
create index receipt_items_user_id_idx on public.receipt_items (user_id);

comment on table public.receipt_items is 'Line items extracted from a receipt.';

-- ============================================================
-- AUTOMATIC TIMESTAMPS
-- ============================================================
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger users_set_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();

create trigger receipts_set_updated_at
  before update on public.receipts
  for each row execute function public.set_updated_at();

-- ============================================================
-- AUTO-CREATE USER PROFILE ON SIGNUP
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, display_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$ language plpgsql;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.users enable row level security;
alter table public.categories enable row level security;
alter table public.receipts enable row level security;
alter table public.receipt_items enable row level security;

-- Users: can only read/update their own profile
create policy "users_select_own" on public.users
  for select using (auth.uid() = id);
create policy "users_update_own" on public.users
  for update using (auth.uid() = id);

-- Categories: users see system defaults + their own custom ones
create policy "categories_select_own_or_system" on public.categories
  for select using (user_id is null or auth.uid() = user_id);
create policy "categories_insert_own" on public.categories
  for insert with check (auth.uid() = user_id and is_system = false);
create policy "categories_update_own" on public.categories
  for update using (auth.uid() = user_id and is_system = false);
create policy "categories_delete_own" on public.categories
  for delete using (auth.uid() = user_id and is_system = false);

-- Receipts: full CRUD on own receipts only
create policy "receipts_select_own" on public.receipts
  for select using (auth.uid() = user_id);
create policy "receipts_insert_own" on public.receipts
  for insert with check (auth.uid() = user_id);
create policy "receipts_update_own" on public.receipts
  for update using (auth.uid() = user_id);
create policy "receipts_delete_own" on public.receipts
  for delete using (auth.uid() = user_id);

-- Receipt items: same pattern
create policy "receipt_items_select_own" on public.receipt_items
  for select using (auth.uid() = user_id);
create policy "receipt_items_insert_own" on public.receipt_items
  for insert with check (auth.uid() = user_id);
create policy "receipt_items_update_own" on public.receipt_items
  for update using (auth.uid() = user_id);
create policy "receipt_items_delete_own" on public.receipt_items
  for delete using (auth.uid() = user_id);

-- ============================================================
-- STORAGE BUCKET FOR RECEIPT IMAGES
-- ============================================================
insert into storage.buckets (id, name, public)
values ('receipts', 'receipts', false)
on conflict (id) do nothing;

create policy "receipts_storage_select_own"
  on storage.objects for select
  using (bucket_id = 'receipts' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "receipts_storage_insert_own"
  on storage.objects for insert
  with check (bucket_id = 'receipts' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "receipts_storage_delete_own"
  on storage.objects for delete
  using (bucket_id = 'receipts' and (storage.foldername(name))[1] = auth.uid()::text);
