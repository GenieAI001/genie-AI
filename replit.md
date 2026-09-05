# OpportunityGenie AI

An Expo/React Native app that helps students discover, match against, and track
scholarships worldwide. Scholarships and app settings (AdMob IDs, API keys) are
managed from a separate admin web dashboard, not hardcoded in the app.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm --filter @workspace/admin run dev` — run the admin dashboard (Vite)
- `pnpm --filter @workspace/mobile run dev` — run the Expo mobile app
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/db run seed` — one-time: load the original 112
  hardcoded scholarships into the database (safe to re-run, skips duplicates)
- Required env: see `.env.example` at the repo root for the full list
  (`DATABASE_URL`, `ADMIN_PASSWORD`, `ADMIN_TOKEN_SECRET`, etc.)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- Admin dashboard: Vite + React + Tailwind (no component library — hand-rolled)
- Mobile: Expo Router, React Native, `@tanstack/react-query`
- Ads: `react-native-google-mobile-ads` (AdMob)
- Build: esbuild (CJS bundle) for the API server

## Where things live

- `artifacts/mobile` — the Expo app (iOS/Android/web)
- `artifacts/api-server` — Express API. Routes in `src/routes/`:
  `scholarships.ts` (public read + admin CRUD), `settings.ts` (public AdMob
  IDs + admin secrets), `admin.ts` (login)
- `artifacts/admin` — admin web dashboard. One admin account (password-gated,
  no per-user accounts). Pages: Scholarships (list/create/edit/delete),
  Settings (AdMob unit IDs + API keys)
- `lib/db/src/schema/scholarships.ts` — scholarship table + Zod schemas
- `lib/db/src/schema/settings.ts` — key/value settings table (AdMob IDs, API
  keys), plus `KNOWN_SETTING_KEYS` listing what the app understands
- `lib/db/src/seed.ts` + `lib/db/src/seedData/scholarships.json` — seed data
  extracted from the app's original hardcoded scholarship list
- `lib/api-client-react/src/{scholarships,settings,adminAuth}.ts` —
  hand-written typed API clients shared by the mobile app and the admin
  dashboard (not orval-generated — there's no OpenAPI codegen wired up for
  these routes yet, see Gotchas)
- `artifacts/mobile/hooks/useScholarships.ts` — fetches scholarships from the
  API, falling back to the old bundled `constants/scholarships.ts` data if
  the API is unreachable
- `artifacts/mobile/hooks/useAdmobConfig.ts` + `components/AdBanner.tsx` —
  reads ad unit IDs from the backend at runtime; falls back to Google's
  public test ad units if nothing's configured yet
- `artifacts/mobile/app.config.js` — dynamic Expo config; injects the AdMob
  native App IDs (build-time only, from `ADMOB_APP_ID_IOS`/`_ANDROID` env
  vars) into the `react-native-google-mobile-ads` plugin

## Architecture decisions

- **Single admin, no user accounts for admin access.** The admin dashboard
  is gated by one shared `ADMIN_PASSWORD`, not a users table. Simpler for a
  single-founder project; revisit if you ever need multiple admins with
  different permissions.
- **AdMob App ID vs. ad unit ID split.** The AdMob *App ID* is baked into
  the native binary at build time (can't change without a rebuild/release).
  Ad *unit* IDs (banner/interstitial/rewarded) are runtime-configurable via
  the backend settings API instead, so you can tune/disable ad placements
  without shipping a new build.
- **`isSecret` flag on settings**, not separate tables. One `settings`
  key/value table serves both the public AdMob-config endpoint and the
  admin-only API-keys view; `isSecret: true` rows are simply never returned
  by the public endpoint.
- **No new auth dependencies.** Admin tokens are HMAC-signed with Node's
  built-in `crypto` (no jsonwebtoken/bcrypt) to avoid adding dependencies
  for a single-admin use case.

## Product

- Browse and search scholarships worldwide, filter by region
- "Match" score per scholarship based on the user's CGPA, IELTS, and degree
  level (see `computeMatchScore` in `constants/scholarships.ts`)
- Application tracker (saved/applied/interview/visa/accepted)
- AI advisor chat (canned responses today — see Gotchas)
- Guest mode with limited features; full account required for Match/Tracker

## User preferences

_Populate as you build — explicit user instructions worth remembering across
sessions._

## Gotchas

- **Run the seed script after your first `db push`**, or the app/admin
  dashboard will start with an empty scholarships list:
  `pnpm --filter @workspace/db run push && pnpm --filter @workspace/db run seed`
- **The advisor tab is not actually AI-powered yet** — `app/(tabs)/advisor.tsx`
  returns canned string responses based on simple keyword matching. The
  `AI_ADVISOR_API_KEY` setting exists in the schema/admin UI for when this
  gets wired up to a real model, but nothing reads it yet.
- **No orval/OpenAPI codegen for the new routes.** `lib/api-zod` and
  `lib/api-client-react/src/generated/*` are still orval output for the
  `/healthz` route only. The scholarships/settings/admin clients are
  hand-written in matching style. If you set up real codegen later, update
  `lib/api-spec/openapi.yaml` first and regenerate from there.
- **AdMob ad unit IDs fall back to Google's public test IDs** until you set
  real ones on the Settings page — so ads will show as clearly-labeled
  "Test Ad" until then, not real ads.
- **The mobile app needs `EXPO_PUBLIC_API_BASE_URL` set** (see
  `.env.example`) or it silently falls back to the old hardcoded scholarship
  list and AdMob test units, with no visible error.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup,
  and package details
- `.env.example` at the repo root documents every required environment
  variable
