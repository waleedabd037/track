# LoanTrack — Next.js App Router starter

A mobile-friendly loan tracker with:
- Public mobile-number lookup
- Customer loan summary: total loaned, returned, remaining
- Lending / Unsettled / Completed filters and a Detail view
- Admin password login, signed HttpOnly session cookie, and admin-only dashboard
- Admin forms to add, edit, and delete customers and loan records
- Admin-managed UPI ID for each customer account; shown on that customer's loan page
- Supabase PostgreSQL schema

## 1. Requirements
- Node.js 20.9 or later
- A Supabase project

## 2. Install
```bash
npm install
cp .env.example .env.local
```
Fill in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase **service role** key (server only; never use a `NEXT_PUBLIC_` prefix)
- `ADMIN_PASSWORD`: a strong, unique admin password
- `ADMIN_SESSION_SECRET`: at least 32 random characters, used to sign the admin session cookie

Generate a secret with `openssl rand -base64 32` or another secure password generator. Do not commit `.env.local`.

## 3. Create database tables
For a new database, open Supabase → SQL Editor and run `supabase/schema.sql`. For an existing deployed database, run `supabase/migration_add_customer_upi.sql` once to add the UPI ID column without removing existing records.

## 4. Run locally
```bash
npm run dev
```
Open http://localhost:3000. Go to **Administrator sign in** to add customers and their loans.

## How loan balances work
- Remaining = total amount − returned amount
- Values are stored per loan record and the account summary adds up each record.
- Currency is currently configured as INR (₹) to match the sample UI. Change `Intl.NumberFormat` currency from `INR` if needed.

## Important security notes before production
1. A phone number by itself is not secure identity verification. Anyone who knows a customer's number could potentially view the record. Add OTP/SMS verification before storing or showing real financial data.
2. Add rate limiting / abuse protection to both public endpoints and use generic lookup errors if you need to reduce account enumeration.
3. The service role key bypasses Supabase RLS, so keep it server-only. Never expose it in client components or public environment variables.
4. Use HTTPS in production, set strong secrets, and consider individual admin accounts, audit logs, backups, and stricter deployment controls.
5. This starter tracks amounts and statuses, but does not yet store a payment-by-payment ledger. For a regulated or audited lending workflow, record each repayment as its own immutable transaction.


## UPI payment links

The public loan account page includes **Make Payment** when the customer has an outstanding balance. The server calculates the balance from all of that customer's loans and signs a 15-minute payment URL containing the amount and the customer's saved UPI ID. The QR endpoint verifies the signature and expiry before returning a QR code.

Add `PAYMENT_SECRET` to `.env.local` and to your Vercel project environment variables. Use a long, random value and keep it server-side; do not use the same value as your admin password or commit it to source control. Redeploy after adding it.

The payment page retains UPI deep-link launching, provider website fallbacks, copy amount/UPI, and QR generation. The UTR field currently only displays a message; it does not verify payments or record a repayment. A successful UPI transfer must still be checked and recorded by the administrator.
