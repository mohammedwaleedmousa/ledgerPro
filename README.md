# LedgerPro

LedgerPro is an Arabic-first SaaS ERP dashboard built with React, TypeScript, Vite, Tailwind CSS, React Router, and Supabase.

## Current testable MVP

- Fixed responsive dashboard sidebar with nested client-side routing.
- Demo authentication and persistent browser session.
- Optional Supabase email/password authentication and session handling.
- Product and customer CRUD with search and filtering.
- Customer statements with invoices, receipts, returns, balances, and printable history.
- Invoice creation, printable invoice details, quotations, quotation-to-invoice conversion, receipts, payments, and sales returns.
- Purchase orders with a draft/order/receive workflow that updates stock and supplier balances.
- Automatic stock movements, manual adjustments, dynamic low-stock alerts, and warehouse foundations.
- Expenses, suppliers, chart of accounts, balanced journal entries, and data-driven financial reports.
- Team roles, activity log, company currency/tax/document settings, and deterministic in-app business insights.
- Multi-tenant PostgreSQL migrations with explicit grants, RLS, composite tenant foreign keys, cursor indexes, private invitations, and concurrency-safe document numbers.

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

4. Review and apply the migrations in timestamp order to the dedicated LedgerPro project, then run Supabase security and performance advisors.
5. Keep secret and `service_role` keys out of the frontend and out of Git.

The initial migration creates the company and owner profile transactionally. The launch migration adds the remaining ERP modules, default settings, warehouse, accounts, server-managed invitations, and per-company document sequences. Every public business row is tenant-scoped, and RLS limits reads to the authenticated user's company.

## Production boundary

The browser demo intentionally stores ERP records in `localStorage` so every workflow can be tested without touching a real database. Supabase Auth can be enabled independently, but that does not move ERP data to PostgreSQL.

The NestJS backend is not present in this GitHub repository. Before a public launch, connect the UI to the dedicated API and execute financial mutations through server-side transactions. The launch migration already revokes browser writes to accounting-critical tables so invoice posting, receiving purchases, payments, returns, journal posting, stock changes, and audit logging cannot become partially committed operations.

For large product catalogs, use the `(company_id, created_at, id)` cursor indexes from the migrations instead of offset pagination.

## Validation

```bash
npm run typecheck
npm run lint
npm run build
npm audit
```

CI runs the same type, lint, build, and high-severity dependency checks on pushes and pull requests.
