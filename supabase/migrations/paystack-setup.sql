-- Run once in the Supabase SQL editor BEFORE deploying the Paystack functions.
-- Adds two columns to orders. Existing orders are not changed (their values stay empty).
alter table orders add column if not exists payment_method text;   -- 'paystack' for online payments
alter table orders add column if not exists paid_at timestamptz;   -- when Paystack confirmed the payment
