# GreenQuote

Solar financing pre-qualification. A signed-in customer enters their home's energy usage and a
system size, and gets back a system price, a risk band (A/B/C) and three installment offers
(5/10/15 years). Admins can review every customer's quotes.

**Stack:** Next.js 16.4 (App Router, Cache Components enabled) · TypeScript · PostgreSQL · JWT cookie
sessions (`jose` + `bcryptjs`) · Zod · Vitest.

## Prerequisites

- Node.js **20.12+** (22 recommended) and npm
- **Docker**, to run Postgres locally (or any Postgres 14+ you already have)

## Setup and run

```bash
docker compose -f docker-compose.dev.yml up -d   # Postgres on localhost:5432
npm install
cp .env.example .env     # set AUTH_SECRET to any 32+ character string; DATABASE_URL already matches
npm run dev              # http://localhost:3000
```

The database schema and a demo admin (**admin@test.com** / **Admin123!**) are created from
`db/init/*.sql` the first time the Postgres container starts. Regular users register at `/register`.

### Docker

```bash
echo "AUTH_SECRET=$(openssl rand -base64 48)" > .env
docker compose up --build        # http://localhost:3000
```

This starts Postgres (data on a named volume) and the app, which waits for the database to be
healthy and serves on port 3000. On the database's first start the init scripts create the
schema and the admin user. The image runs as a
non-root user and has a Docker `HEALTHCHECK` against `/api/health`. Set `POSTGRES_PASSWORD` in
`.env` to override the default password. In production mode the session
cookie is `Secure`, so use HTTPS (or `localhost`) when signing in.

## Tests and quality gates

```bash
npm test             # 50 unit + integration tests (Vitest)
npm run lint         # ESLint (next/core-web-vitals + typescript)
npm run typecheck    # tsc --noEmit
npm run format:check # Prettier (npm run format to fix)
```

## Pages

| Route                 | Access        | Purpose                                           |
| --------------------- | ------------- | ------------------------------------------------- |
| `/register`, `/login` | public        | Account creation and sign-in                      |
| `/quotes/new`         | signed in     | Quote form (client-side validation)               |
| `/quotes/[id]`        | owner / admin | Price, risk band, 3 offers, amortization schedule |
| `/quotes`             | signed in     | Your quotes (date, size, price, band, link)       |
| `/admin/quotes`       | admin         | All quotes; search by name/email or pick a user   |

API reference: [`docs/API.md`](docs/API.md).

## Pricing model

`systemPrice = systemSizeKw × 1200` (USD) · `principal = systemPrice − downPayment`

| Band | Rule                                        | APR   |
| ---- | ------------------------------------------- | ----- |
| A    | consumption ≥ 400 kWh **and** system ≤ 6 kW | 6.9%  |
| B    | otherwise, consumption ≥ 250 kWh            | 8.9%  |
| C    | otherwise                                   | 11.9% |

Monthly payment uses the standard amortization formula `P·r / (1 − (1+r)^−n)` with `r = APR/12`
and `n = years × 12`, rounded to cents. All logic lives in `src/lib/pricing.ts` as pure functions.

## Design notes

Decisions worth knowing about:

- **Next 16 / Cache Components:** anything that reads `cookies()` or `params` renders inside
  `<Suspense>` (the header, and each page's inner component), so the static shell prerenders and
  the user-specific parts stream. `src/proxy.ts` is Next 16's replacement for `middleware.ts`.
- **Authorization is server-side and centralised.** Route handlers and server-rendered pages both
  call `quoteService`, so ownership and admin checks cannot diverge between UI and API. The
  proxy only redirects anonymous visitors; it is a convenience, not the security boundary.
- **Sessions:** an HS256 JWT in an `httpOnly`, `SameSite=Lax` cookie holding only the user id.
  The user is re-read from the DB on each request, so role changes and deletions apply immediately.
- **Login hardening:** one generic error for unknown email / wrong password, with a dummy bcrypt
  comparison so timing doesn't reveal which emails exist.
- **Validation:** the same Zod schema runs in the browser and on the server; the server is
  authoritative. Server field errors are mapped back onto the form.
- **Offers are stored as a JSON snapshot** on the quote row. A quote stays reproducible if rates
  change later, and nothing ever queries individual offers.
- **Errors:** every API error is `{ "error": { code, message, details? } }`; 403 for another
  user's quote, 404 for unknown ids. The page for another user's quote shows a "no access" notice.
- **Logging:** one JSON line per request (`requestId`, method, path, status, duration) plus
  warn/error lines; sensitive keys are redacted. The request id is returned as `x-request-id`.
- **Amortization schedule** (bonus): a collapsible month-by-month table per offer on the quote page.
- The brief labels system size "Kwh" in the form but prices per kW; the app uses **kW** throughout.

## Trade-offs

- **Plain init scripts instead of a migration tool.** `db/init/*.sql` is mounted into the
  Postgres container and runs once, on an empty volume. It is the simplest thing that gives a
  reproducible schema and seed data, but it has no versioning: a later schema change means wiping
  the volume (or applying SQL by hand), and it does nothing for a Postgres that isn't this
  container. A migration tool (node-pg-migrate, Flyway, Prisma Migrate) fixes both.
- **Tests use PGlite rather than a mocked database**, trading a few seconds of WASM start-up per
  file for real Postgres behaviour (constraints, `ILIKE`, `jsonb`, error codes).
- **Hand-rolled auth** (bcrypt + JWT) is small and transparent, but lacks password reset, email
  verification, session revocation and rate limiting. Production would use an IdP (e.g. Keycloak).
- **No ORM:** plain SQL is fewer moving parts and easy to read at this size; it costs some
  type-safety on row mapping.
- **Stateless JWT** means logout only clears the cookie; a stolen token stays valid until expiry
  (7 days by default).
- **Plain CSS** instead of a UI kit: accessible and responsive with no build dependencies, but
  less reusable.

## What I'd do next

1. Rate-limit and lock out login/register; add CSRF-token or `Origin` checks on mutating routes.
2. Add a readiness probe that checks the database, and a real migration tool with versioning.
3. Playwright E2E for sign-in → quote → results, and axe checks for accessibility.
4. PDF export of a quote with its amortization schedule.
5. Password reset and email verification, or hand authentication to Keycloak/Google IdP.
6. Pagination for the quote lists.
