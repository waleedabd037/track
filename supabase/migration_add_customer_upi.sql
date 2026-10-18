-- Run this once in Supabase SQL Editor for an existing LoanTrack database.
alter table public.customers
add column if not exists upi text;
