# LedgerPro

LedgerPro is an Arabic-first SaaS ERP dashboard built with React, TypeScript, Vite, Tailwind CSS, React Router, and Supabase.

## Current testable MVP

- Fixed responsive dashboard sidebar with nested client-side routing.
- Demo authentication and persistent browser session.
- Optional Supabase email/password authentication and session handling.
- Product and customer CRUD with search and filtering.
- Invoice creation with customer selection, editable items, tax calculations, and statuses.
- Automatic stock deduction, stock movements, manual adjustments, and low-stock alerts.
- Categories, suppliers, expenses, dashboard KPIs, and persistent demo data.
- Multi-tenant PostgreSQL schema with explicit grants, RLS policies, indexes, and automatic company/profile creation.

## Run the demo

```bash
npm install
npm run dev
```

Open the local Vite URL and choose **دخول تجريبي فوري**. Demo data is saved in the browser, so changes remain after a refresh. Use Settings to reset it.

## Connect a LedgerPro Supabase project

1. Create a separate Supabase project for LedgerPro. Do not reuse another production application's database.
2. Copy `.env.example` to `.env.local`.
3. Add the project URL and browser-safe publishable key:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key
VITE_ENABLE_DEMO_MODE=true
```

4. Apply the migration in `supabase/migrations` to the LedgerPro project and run Supabase security/performance advisors.
5. Keep secret and `service_role` keys out of the frontend and out of Git.

The migration creates a company and owner profile transactionally when a user signs up. Every business row includes `company_id`, and RLS restricts authenticated users to their own company.

## Validation

```bash
npm run typecheck
npm run lint
npm run build
npm audit
```

The NestJS backend is not present in the GitHub repository yet. Invoice posting and other accounting-critical multi-table operations should move into transactional backend services before production launch.
