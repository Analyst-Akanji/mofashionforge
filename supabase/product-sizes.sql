-- Run once in the Supabase SQL editor BEFORE deploying the new ShopPage and AdminProducts.
-- Adds the list of sizes each piece comes in (empty = no sizes, e.g. a bag).
alter table products add column if not exists sizes text[] not null default '{}';
