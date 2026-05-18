# Fleet Tracker SaaS Demo

Fleet Tracker is a React + Vite multi-tenant fleet SaaS demo with a same-repo Express API, Prisma ORM, and SQLite-backed authentication.

It includes:

- a public marketing page with trial signup
- a master admin dashboard for platform-level company management
- company workspaces for tracking, zones, alerts, maintenance, customers, and playback

## Product shape

The demo is aimed at fleet businesses such as:

- car rental
- transportation
- logistics
- food delivery

Each company can be created from a template, assigned a plan, and given a device package with hardware and yearly tracking pricing.

## Auth and backend

Authentication is now handled by the Express API in `server/`:

- passwords are hashed with `bcryptjs`
- sessions are stored in the database and sent via an HTTP-only cookie
- trial signup creates a company plus its first admin user
- master admins can create additional companies from the dashboard
- profile updates and password changes go through backend endpoints

The frontend still keeps catalog-style product metadata in `src/data/companies.js`, but user accounts, companies, and signed-in session state now come from the API and database.

## Demo access

Use these seeded demo credentials from the login screen:

- Master: `master@platform.com` / `demo123`
- Company: `admin@riyadhrentals.com` / `demo123`

You can also start a free trial from the public landing page to create a new company and sign in immediately.

## Setup

1. Install dependencies:
   - `npm install`
2. Copy the example environment file if needed:
   - `cp .env.example .env`
3. Generate Prisma client:
   - `npm run db:generate`
4. Create the local database and migration:
   - `npm run db:migrate -- --name init_auth`
5. Seed demo data:
   - `npm run db:seed`

## Scripts

- `npm run dev` — run the Express API and Vite dev server together
- `npm run dev:server` — run the API server with watch mode
- `npm run dev:client` — run the Vite frontend
- `npm run start` — start the API server
- `npm run build` — produce a production frontend build
- `npm run lint` — run ESLint
- `npm run db:generate` — generate Prisma client
- `npm run db:migrate` — run Prisma migrations in development
- `npm run db:push` — push schema changes without creating a migration
- `npm run db:seed` — seed the local database

## Notes

- SQLite database files live under `prisma/`
- seeded company records come from `src/data/companies.js`
- the Vite dev server proxies `/api` requests to the Express backend
