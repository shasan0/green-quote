# GreenQuote
## solar financing pre-qualification

## Needs
1. **Minimal** End to end app
2. **MVP**
    a. authenicatedUser request a pre-qualification quote
    b. for a residential solar system and view results
    c. UI, API, DB, auth, basic infra/ops, and a small test sutie

## Suggested stack (TypeScript encouraged):
1. Frontend: Next.js (recommended) or any modern React/Vue setup.
2. Backend: Next.js API routes, Node/Express, or NestJS.
3. DB: SQLite or Postgres (Docker).
4. Auth: Email/password as the baseline (required).
5. Optional - OAuth

**Keep it simple and conventional; choos tools you can set up fast**

## What to build
A. Frontend
1. Quote Form (Protected)
- Fields (With client side validation)
    1. Full name, email (prefilled based on logged-in user)
    2. Address
    3. Monthly Consumption Kwh (Number)
    4. System Size Kwh (Number)
    5. Down Payment (Number, Optional)
- Action - Get pre-qualification (Call API)
2. Quote Results (Protected)
- Display
    1. Computed system price
    2. Risk band (A/B/C)
    3. Three installment offers (terms 5/10/15 years) with monthly payment values (see “Pricing model” below)
3. Quotes list & Admin view (Protected - Logged in)
    1. My qutoes (/quttoes)
        - Afer sign-in, show a table of only the current user’s qutoes (date, system size, price, band, link to details)
    2. Admin view (/admin/qutoes): admin users can view all quotes and filter by user (search by name/email or a dropdown)
    3. Authorization must be enforced server-side (not just hidden UI). Seed one admin in your DB (e.g., admin@test.com)
4. Registration
    1. minimal form
    2. Fields
        A. fullName
        B. email
        C. password
5. Login
    1. Fields
        A. email
        B. password

**Accessibitiy and clear presentation matter. Keep the UI simple and responsive**

B. Backend API - At least these endpoints
A. POST /api/quotes (Protected)
    1. Validates input.
    2. Applies the pricing model (below).
    3. Persists the request + computed result.
    4. Returns a normalized JSON response (inputs, derived values, offers)
B. GET /api/quotes/:id (Protected)
    1. fetch one quote
    2. Auth required
    3. Enforce ownership unless admin
C. GET /api/health
    1. liveness check

C. Pricing model
1. System price
    1. systemPrice = systemSizeKw * 1200
    2. choose any currency and stick to it
2. Principal amount
    1. principalAmount = systemPrice - downPayment.
3. Risk band (coarse):
    1. A = if monthlyConsumptionKwh >= 400 and systemSizeKw <= 6
    2. B = otherwise if monthlyConsumptionKwh >= 250
    3. C = otherwise
4. Base APR by band
    1. A→ 6.9%
    2. B → 8.9%
    3. C → 11.9%
5. Offers
    1. terms 5, 10, 15 years.
    2. For each term, compute the monthly payment using the standard amortization calculation.
    3. Return each offer with
        A. termYears
        B. apr
        C. principalUsed
        D. monthlyPayment

D. Authenication & Authorization
    1. Required - email/password
    2. Session
        - Keep required details in the session (cookie-based session or JWT)
    3. Bonus: Integrate an IdP such as **Keycloak**.

E. Database & schema
    1. Minimal tables
        A. User
        B. Quote
    2. Include a migration/schema and any seed data (including one adminuser)

F. Infra & operations
    1. Local dev
        A. Provide a Dockerfile (and optionally docker-compose.yml) or
        B. Clearly documented scripts to runAPI + DB locally
    2. Config
        A. 12-factor envs
        B. include a .env.example
    3. Observability
        A. Structured logging around request/response/error paths;
        B. implement/api/health

G. Quality gates
    1. Automated tests
        A. Reasonable unit tests
        B. integration tests
    2. Lint/format
        A. set up what you normally use
    3. Docs
        A. A concise README describing
            1. Setup steps
            2. Run steps
            3. Tests steps
        B. Trade-offs
        C. What you’d do next

H. Deliverables
    1. Repo (GitHub link or zip)
        A. Source code and Git history
        B. README
            1. Prerequisites
            2. Run/test instrutcions
            3. A brief design/decisions notes.
        C. Scripts
            1. .env.example
            2. schema/migrations
            3. any seed scripts
        D. Short API reference
            1. Markdown or OpenAPI/Swagger - either is fine

I. Bonus
**Attempt only after the core implementation is strong**
**Pick one or two-optional extras that showcase breadth**
1. OpenAPI auto-rendered docs page
2. E2E test (e.g., Playwright) covering sign-in → quote → view results.
3. Implement an amortization schedule which the user can view for the selected quote.
4. PDF Export: Allow users to download their qutoe (including offers and optionally amortization schedule) as a formatted PDF

J. How we review
We’ll assess along five themes:
1. Correctness - adheres to the core requirements.
2. Documentation - clear README and commit history over excessive code comments.
3. Testing - reasonable mix of unit/integration tests.
4. Readabiliy - naming, structure, duplication, consistency.
5. Application architecture - conventional patterns for your stack; sensible
modularization and boundaries.


K. Questions we may ask
1. Why this stack and architecture? What trade-offs did you make?
2. If you had another day, what would you add or change first?
3. How would you implement CI/CD and what would you test in the pipeline?
4. Where would you deploy on GCP and why (Cloud Run, GKE, App Engine)?
5. How did you approach testing, and what would you add for production readiness?