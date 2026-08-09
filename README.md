# LedgerPro

LedgerPro is an Arabic-first SaaS ERP dashboard built with React, TypeScript, Vite, Tailwind CSS, React Router, and Supabase.

## Local development

1. Copy `.env.example` to `.env`.
2. Add the Supabase project URL and a browser-safe publishable key. Never use a secret or `service_role` key in the frontend.
3. Install dependencies with `npm install`.
4. Start the app with `npm run dev`.

## Validation

```bash
npm run typecheck
npm run lint
npm run build
```

The current implementation is the frontend foundation. Database migrations, RLS policies, and the NestJS API will be added in later phases.
