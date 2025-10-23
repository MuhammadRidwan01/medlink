## Getting Started

First, install dependencies and run the dev server:

```bash
npm install
npm run dev
```

Open http://localhost:3000 to see the app.

## Demo Seeds and Reset

- Seed mock data and set demo flags:

```bash
npm run seed
```

- Reset to baseline (clears local/session mock stores on next load, then re-applies baseline seeds):

```bash
npm run reset
```

The client bootstrap reads `public/mock-seed.json` and applies to localStorage/sessionStorage. Flags are controlled via `.env.local`.

## Release Checklist

Visit `/admin/release-checklist` to view toggles and run client-only Smoke Tests. All-green indicates the demo flows are ready.

## Environment

Copy `.env.example` to `.env.local` and adjust if needed:

```bash
cp .env.example .env.local
```

Required demo vars:

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`: demo placeholders are fine (no real backend required).
- `NEXT_PUBLIC_ANALYTICS_DEMO`: enables analytics demo mode.
- `NEXT_PUBLIC_APPLY_MOCK_SEEDS`: applies seeds on client load.
- `NEXT_PUBLIC_RESET_ON_BOOT`: when `true`, clears seeded keys before applying.

## CI (mock)

Run verify locally:

```bash
npm run verify
```

GitHub Actions workflow runs the same checks on PRs.

## Demo Flows

- Patient triage: `patient/triage` (mock AI stream)
- Checkout: `patient/checkout` (use webhook simulator to finalize)
- Follow-up booking: via mini-scheduler components
- Admin analytics: `admin/analytics` (requires `NEXT_PUBLIC_ANALYTICS_DEMO=true`)
