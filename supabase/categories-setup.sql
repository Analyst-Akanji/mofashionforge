-- Run once in the Supabase SQL editor (Dashboard -> SQL Editor).
-- Before running: replace BOTH occurrences of 'REPLACE_WITH_MORAYO_ADMIN_EMAIL'
-- with the email of the admin account that logs in to /admin/login.

create table if not exists categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,                 -- what customers see, e.g. "Baby Shirts"
  slug        text not null unique,          -- what products store, e.g. "baby_shirts" (never changes)
  sort_order  integer not null default 0,    -- order of the tabs in the shop
  created_at  timestamptz not null default now()
);

alter table categories enable row level security;

-- Everyone can read categories (the shop needs them)...
drop policy if exists "anyone can read categories" on categories;
create policy "anyone can read categories" on categories
  for select to anon, authenticated
  using (true);

-- ...but only the admin can add, rename, reorder or delete them.
drop policy if exists "admin manages categories" on categories;
create policy "admin manages categories" on categories
  for all to authenticated
  using (auth.jwt() ->> 'email' = 'REPLACE_WITH_MORAYO_ADMIN_EMAIL')
  with check (auth.jwt() ->> 'email' = 'REPLACE_WITH_MORAYO_ADMIN_EMAIL');

-- Starting categories (safe to re-run: existing slugs are left alone)
insert into categories (name, slug, sort_order) values
  ('Tops',        'tops',        1),
  ('Sweatshirts', 'sweatshirts', 2),
  ('Shirts',      'shirts',      3),
  ('Dresses',     'dresses',     4),
  ('Baby Shirts', 'baby_shirts', 5),
  ('Bags',        'bags',        6),
  ('Accessories', 'accessories', 7),
  ('Bucket Hats', 'bucket_hats', 8)
on conflict (slug) do nothing;

-- Earrings now live under Accessories: move any existing earrings products there.
update products set category = 'accessories' where category = 'earrings';
