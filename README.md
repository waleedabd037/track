# Recoverly — Loan Recovery Web App

A Vercel-ready Next.js loan recovery / collections dashboard.

## Features

- Portfolio dashboard with outstanding, overdue, recovered, and high-risk KPIs
- Borrower and loan account management
- Borrower detail pages
- Risk scores and recovery priority queue
- Recovery contact/action logging
- Payment recording and outstanding-balance updates
- Browser persistence via `localStorage`
- Responsive desktop/mobile UI
- No database required for the demo

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Deploy to Vercel

1. Push this folder to GitHub.
2. Import the repository into Vercel.
3. Keep the default Next.js build settings.
4. Deploy — no environment variables are required for this demo version.

## Important: demo storage

This starter stores data in the current browser's `localStorage`. That makes the project instantly deployable, but data is **not shared between users or devices**.

For a production loan recovery system, use a server database such as Supabase/Postgres and add:

- Authentication and role-based access control
- Server-side input validation
- Audit logs
- Database backups
- Encryption/secrets management
- Organization/tenant separation if needed
- Applicable lending, privacy, collections, and financial compliance controls

## Suggested Supabase tables

- `borrowers`
- `loans`
- `payments`
- `recovery_actions`
- `users`
- `audit_logs`

The UI/data model in `lib/types.ts` is intentionally structured so those tables can be introduced without redesigning the application.
