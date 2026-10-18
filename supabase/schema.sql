-- Run this SQL in Supabase SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  phone text not null unique check (phone ~ '^\+?[0-9]{7,15}$'),
  upi text,
  created_at timestamptz not null default now()
);

create table if not exists public.loans (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 120),
  total_amount numeric(12,2) not null check (total_amount > 0),
  returned_amount numeric(12,2) not null default 0 check (returned_amount >= 0 and returned_amount <= total_amount),
  due_date date,
  status text not null default 'Unsettled' check (status in ('Lending','Unsettled','Completed')),
  created_at timestamptz not null default now()
);

create index if not exists loans_customer_id_idx on public.loans(customer_id);
-- RLS blocks direct public client access. This app uses the service role key only in server routes.
alter table public.customers enable row level security;
alter table public.loans enable row level security;
