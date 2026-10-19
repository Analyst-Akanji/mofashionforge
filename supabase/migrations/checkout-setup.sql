-- Run this once in the Supabase SQL editor (Dashboard -> SQL Editor).
-- Before running: replace BOTH occurrences of 'REPLACE_WITH_MORAYO_ADMIN_EMAIL'
-- with the email of the admin account that logs in to /admin/login.

-- 1) New columns on orders
alter table orders add column if not exists items jsonb not null default '[]'::jsonb;
alter table orders add column if not exists customer_notes text;
alter table orders add column if not exists receipt_path text;

-- 2) Visitors (not logged in) may create a PENDING order, and nothing else:
--    they cannot read, change or delete any orders.
drop policy if exists "public can place pending orders" on orders;
create policy "public can place pending orders" on orders
  for insert to anon
  with check (status = 'pending' and admin_notes is null and payment_ref is null);

-- 3) Private bucket for payment receipts (5 MB max, images and PDF only)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('receipts', 'receipts', false, 5242880,
        array['image/jpeg', 'image/png', 'image/webp', 'application/pdf'])
on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Anyone can upload a receipt, but only the admin can see or remove them.
drop policy if exists "public can upload receipts" on storage.objects;
create policy "public can upload receipts" on storage.objects
  for insert to anon, authenticated
  with check (bucket_id = 'receipts');

drop policy if exists "admin can read receipts" on storage.objects;
create policy "admin can read receipts" on storage.objects
  for select to authenticated
  using (bucket_id = 'receipts' and auth.jwt() ->> 'email' = 'REPLACE_WITH_MORAYO_ADMIN_EMAIL');

drop policy if exists "admin can delete receipts" on storage.objects;
create policy "admin can delete receipts" on storage.objects
  for delete to authenticated
  using (bucket_id = 'receipts' and auth.jwt() ->> 'email' = 'REPLACE_WITH_MORAYO_ADMIN_EMAIL');
