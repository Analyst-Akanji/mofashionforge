-- Run once in the Supabase SQL editor, BEFORE creating the webhook.

-- 1) The email function records when each email went out (and Morayo can see it in the admin)
alter table orders add column if not exists customer_email_sent_at timestamptz;
alter table orders add column if not exists admin_email_sent_at timestamptz;
alter table orders add column if not exists paid_email_sent_at timestamptz;

-- 2) Tighten the public insert policy so a visitor can't pre-fill those columns.
--    (Same rules as before, plus the three new columns must start empty.)
drop policy if exists "public can place pending orders" on orders;
create policy "public can place pending orders" on orders
  for insert to anon
  with check (
    status = 'pending'
    and admin_notes is null
    and payment_ref is null
    and customer_email_sent_at is null
    and admin_email_sent_at is null
    and paid_email_sent_at is null
  );
