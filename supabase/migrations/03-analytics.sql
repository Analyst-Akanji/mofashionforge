-- Run in the Supabase SQL editor.

create table if not exists public.analytics_events (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  visitor_id  text not null,           -- random id kept in the visitor's browser (no name/email/IP)
  session_id  text not null,           -- random id for one visit
  event       text not null,
  path        text,
  product_id  text,
  meta        jsonb
);

create index if not exists analytics_events_created_idx on public.analytics_events (created_at);
create index if not exists analytics_events_event_idx   on public.analytics_events (event, created_at);
create index if not exists analytics_events_product_idx on public.analytics_events (product_id) where product_id is not null;

alter table public.analytics_events enable row level security;

-- Visitors can only ADD events (of the allowed kinds). Nobody can read them directly.
drop policy if exists "visitors can log events" on public.analytics_events;
create policy "visitors can log events" on public.analytics_events
  for insert to anon, authenticated
  with check (
    event in ('page_view', 'product_view', 'add_to_cart', 'begin_checkout', 'payment_started')
    and char_length(visitor_id) <= 64
    and char_length(session_id) <= 64
    and char_length(coalesce(path, '')) <= 300
    and char_length(coalesce(product_id, '')) <= 80
    and coalesce(pg_column_size(meta), 0) < 1000
  );

-- The dashboard reads one summary through this function (logged-in admin only).
create or replace function public.analytics_summary(p_days int default 30)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  since  timestamptz := now() - make_interval(days => greatest(1, least(coalesce(p_days, 30), 365)));
  result jsonb;
begin
  if auth.role() <> 'authenticated' then
    raise exception 'not allowed';
  end if;

  with ev as (
    select * from analytics_events where created_at >= since
  ),
  daily as (
    select (created_at at time zone 'Africa/Lagos')::date as day,
           count(distinct visitor_id) as visitors,
           count(*) filter (where event = 'page_view') as pageviews
    from ev group by 1
  ),
  sold as (
    select split_part(it->>'product_id', '::', 1) as product_id,
           sum(coalesce((it->>'qty')::int, 1)) as units,
           sum(coalesce((it->>'qty')::int, 1) * coalesce((it->>'price')::bigint, 0)) as revenue
    from orders o,
         jsonb_array_elements(case when jsonb_typeof(o.items::jsonb) = 'array' then o.items::jsonb else '[]'::jsonb end) it
    where o.created_at >= since
      and o.status in ('paid', 'processing', 'shipped', 'delivered')
    group by 1
  ),
  prod as (
    select p.id::text as product_id,
           p.name,
           coalesce(v.views, 0)   as views,
           coalesce(v.viewers, 0) as viewers,
           coalesce(a.adds, 0)    as adds,
           coalesce(s.units, 0)   as units,
           coalesce(s.revenue, 0) as revenue
    from products p
    left join (select product_id, count(*) as views, count(distinct visitor_id) as viewers
               from ev where event = 'product_view' group by 1) v on v.product_id = p.id::text
    left join (select product_id, count(*) as adds
               from ev where event = 'add_to_cart' group by 1) a on a.product_id = p.id::text
    left join sold s on s.product_id = p.id::text
  )
  select jsonb_build_object(
    'totals', (select jsonb_build_object(
                 'visitors',  count(distinct visitor_id),
                 'sessions',  count(distinct session_id),
                 'pageviews', count(*) filter (where event = 'page_view')) from ev),
    'daily', coalesce((select jsonb_agg(to_jsonb(d) order by d.day) from daily d), '[]'::jsonb),
    'funnel', jsonb_build_object(
      'visited',          (select count(distinct session_id) from ev where event = 'page_view'),
      'viewed_product',   (select count(distinct session_id) from ev where event = 'product_view'),
      'added_to_cart',    (select count(distinct session_id) from ev where event = 'add_to_cart'),
      'reached_checkout', (select count(distinct session_id) from ev where event = 'begin_checkout'),
      'started_payment',  (select count(distinct session_id) from ev where event = 'payment_started'),
      'paid_orders',      (select count(*) from orders where created_at >= since and status in ('paid', 'processing', 'shipped', 'delivered')),
      'payment_not_completed', (select count(*) from orders where created_at >= since and payment_method = 'paystack' and paid_at is null and status in ('pending', 'cancelled') and created_at < now() - interval '1 hour')
    ),
    'products', coalesce((select jsonb_agg(to_jsonb(p) order by p.views desc, p.units desc) from prod p), '[]'::jsonb),
    'sources', coalesce((select jsonb_agg(to_jsonb(s)) from (
                 select coalesce(nullif(meta->>'source', ''), 'direct') as source, count(distinct session_id) as sessions
                 from ev where event = 'page_view' and meta->>'first' = 'true'
                 group by 1 order by 2 desc limit 8) s), '[]'::jsonb),
    'pages', coalesce((select jsonb_agg(to_jsonb(g)) from (
                 select path, count(*) as views, count(distinct visitor_id) as visitors
                 from ev where event = 'page_view'
                 group by 1 order by 2 desc limit 10) g), '[]'::jsonb)
  ) into result;

  return result;
end $$;

revoke all on function public.analytics_summary(int) from public, anon;
grant execute on function public.analytics_summary(int) to authenticated;
