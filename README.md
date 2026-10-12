# Meme'd — Campaign Payout Tracker

Brands run campaigns with a milestone payout ladder. Creators submit Instagram / YouTube posts, and as views come in they are paid the highest milestone their post has crossed — never more than the campaign's budget.

**Live demo:** _frontend link_ · _API link_

| | Stack |
|---|---|
| Backend | Node.js, Express 5, TypeScript, MongoDB + Mongoose, Zod, JWT, Redis (optional) |
| Frontend | Next.js 16 (App Router), TypeScript, TanStack Query, Tailwind CSS v4, shadcn/ui, react-hook-form |
| Tests | Jest, Supertest, mongodb-memory-server |

## Repository layout

```
backend/
  src/contracts/   Zod schemas + inferred types for every request/response (shared with the frontend)
  src/services/    Business logic — payout.ts and spike.ts are pure functions
  src/routes/      Express routers
  src/models/      Mongoose models
  tests/           Unit tests (payout, spike) and integration tests (concurrency)
frontend/
  src/app/         Routes: landing, login, signup, /brand, /creator
  src/components/  UI, grouped by brand / creator / shared
  src/lib/         Typed API client, session store, formatting
```

**Single source of truth for types.** Every API shape is defined once as a Zod schema in `backend/src/contracts`. The backend validates requests with it; the frontend imports the same files through the `@contracts/*` path alias, uses them for form validation, and parses every API response with them. Nothing is redeclared on either side.

The API returns Mongoose documents as-is — the response shape is owned by the schemas (`remaining` is a virtual, `passwordHash` is stripped in `toJSON`), so there are no hand-written DTO mappers. The integration tests parse every response with the contract schemas, which keeps the two in sync.

Every route handler wraps its work in `try/catch` and passes failures to `next(error)`. The central error handler (`middleware/error-handler.ts`) maps Zod, domain, duplicate-key and body-parser errors to the shared error shape, and anything unexpected to a 500 without leaking internals.

## Running locally

Requirements: Node 20+, a MongoDB **replica set** (MongoDB Atlas works out of the box; transactions need a replica set), and optionally Redis.

```bash
# API → http://localhost:4000
cd backend
cp .env.example .env        # fill in MONGODB_URI and JWT_SECRET
npm install
npm run dev

# Web app → http://localhost:3000
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

### Demo data

```bash
cd backend && npm run seed
```

Creates 12 campaigns from fictional brands (with cover art from `backend/scripts/seed/covers`), 8 creators and posts whose payouts are calculated by the real payout service. Every seeded account uses the `@seed.memed.app` domain and the password `password123`, for example `daily.meme.dose@seed.memed.app` (creator) or `zing.beverages@seed.memed.app` (brand). Re-running the seed replaces only that data.

Or run everything (Mongo replica set, Redis, API, web) with Docker:

```bash
JWT_SECRET=$(openssl rand -hex 32) docker compose up --build
```

> The Docker setup was written but not run on my machine (Docker isn't installed there), so treat it as untested.

### Scripts

| | Backend | Frontend |
|---|---|---|
| Dev server | `npm run dev` | `npm run dev` |
| Type check | `npm run typecheck` | `npm run typecheck` |
| Lint | `npm run lint` | `npm run lint` |
| Tests | `npm test` | — |
| Demo data | `npm run seed` | — |
| Production | `npm run build && npm start` | `npm run build && npm start` |

`npm test` runs Jest with `--experimental-vm-modules`: the MongoDB driver loads runtime adapters with a dynamic `import()`, which Jest's VM rejects without that flag.

## Environment variables

**backend/.env**

| Variable | Required | Default | Notes |
|---|---|---|---|
| `MONGODB_URI` | yes | — | Must point to a replica set (Atlas clusters are) |
| `JWT_SECRET` | yes | — | At least 32 characters |
| `JWT_TTL_SECONDS` | no | `604800` | Token lifetime (7 days) |
| `PORT` | no | `4000` | |
| `CORS_ORIGINS` | no | `http://localhost:3000` | Comma-separated allowed origins |
| `REDIS_URL` | no | — | Enables the live-campaign cache. Without it, or if Redis is down, reads go to Mongo |
| `SPIKE_MIN_DELTA` | no | `5000` | Minimum view gain to consider a spike |
| `SPIKE_VIEWS_PER_HOUR` | no | `20000` | Growth rate that triggers a spike flag |

**frontend/.env.local**

| Variable | Required | Notes |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | yes | Base URL of the API, e.g. `http://localhost:4000` |

All backend env vars are validated with Zod at startup; the process exits with a clear message if anything is missing or malformed.

## API

All responses are JSON. Errors always look like `{ "error": { "code", "message", "fields"? } }`.

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/signup` | — | `{ name, email, password, role }` → `{ token, user }` |
| POST | `/api/auth/login` | — | `{ email, password }` → `{ token, user }` |
| GET | `/api/auth/me` | any | Current user |
| POST | `/api/campaigns` | brand | Create campaign |
| GET | `/api/campaigns/mine` | brand | Own campaigns (`spent` / `remaining` each) plus a budget `summary`. Filters: `status` |
| GET | `/api/campaigns/:id` | brand (owner) | One campaign |
| PATCH | `/api/campaigns/:id/status` | brand (owner) | `{ status: "active" \| "paused" \| "closed" }` |
| GET | `/api/campaigns/:id/submissions` | brand (owner) | Posts submitted to a campaign |
| GET | `/api/campaigns/live` | creator | Live campaigns (Redis-cached). Filters: `platform` |
| POST | `/api/campaigns/:id/submissions` | creator | `{ postUrl }` |
| GET | `/api/submissions/mine` | creator | Own posts plus `totalEarnings` |
| PATCH | `/api/submissions/:id/views` | **none** | `{ views }` → `{ submission, paidNow }` |

Every list endpoint is paginated and searchable: `?page=1&pageSize=10&search=…` (page size up to 50). Responses look like `{ items, total, page, pageSize, totalPages }`. Campaign lists search by name; submission lists search by post link, creator name or campaign name.

Auth is a JWT sent as `Authorization: Bearer <token>`. Signup and login are rate limited (20 requests / 15 min per IP).

The views endpoint is intentionally unauthenticated as the brief says it simulates platform data. The creator dashboard has a "Simulate views" control that calls it, so the payout flow can be tried from the UI.

## Payout rules and assumptions

Where the brief was open, these are the calls I made:

1. **Highest milestone only.** A post's entitlement is the payout of the highest milestone its views have reached. Crossing several milestones in one update (e.g. 0 → 120K) pays the top one, not the sum.
2. **Pay the difference.** Each update pays `entitled − alreadyPaid`. Going from 10K (₹500) to 50K (₹2,000) pays ₹1,500 more, for ₹2,000 total.
3. **Budget runs out mid-payout → partial payout.** If ₹3,000 is owed but ₹1,200 is left, ₹1,200 is paid and the campaign is exhausted. The submission records both `entitledAmount` and `paidAmount`, and the UI shows "capped by budget".
4. **Views never go down.** A lower count than the stored one is treated as stale/out-of-order and ignored. Payouts are never clawed back.
5. **Live campaign** = status `active` and `spent < budget`. Exhausted, paused or closed campaigns disappear from the creator list and reject new submissions.
6. **Pause, resume, close.** Brands can pause an active campaign and resume it later, or close it for good. A paused campaign is hidden from creators, takes no new submissions and pays nothing, but views are still recorded. Because each update pays `entitled − alreadyPaid`, the first update after resuming pays whatever was earned while paused. Closing is final: no submissions or payouts, and the remaining budget stays unspent.
7. **Money is whole rupees** (integers).
8. **Milestone ladder:** 1–10 rungs, views and payouts strictly increasing, and the top payout must fit inside the budget.
9. **One post, one submission.** Links are normalised before the uniqueness check — `?igsh=`, `/reel/` vs `/p/`, `youtu.be`, `/shorts/` all collapse to one canonical URL — so the same post can't be submitted twice. The link's host must match the campaign platform.
10. **Spike flag** (bonus): an update is flagged when the post gained at least `SPIKE_MIN_DELTA` views at a rate of at least `SPIKE_VIEWS_PER_HOUR` since the previous update. The flag is informational and sticky — it's shown to the brand, but the payout still goes through. In production I'd hold flagged payouts for review.
11. **Session storage:** the JWT is kept in `localStorage`. It's simple and works across the Vercel/Render domains, at the cost of being readable by injected scripts; an httpOnly cookie behind a same-origin proxy would be the hardening step.

## Concurrency and idempotency

`PATCH /api/submissions/:id/views` runs inside a MongoDB transaction with snapshot read concern:

1. Read the submission and its campaign.
2. Compute `views = max(stored, incoming)`, the entitlement, and `pay = min(entitled − paid, budget − spent)`.
3. `$inc` the campaign's `spent` (with an `$expr` guard that `spent + pay ≤ budget`) and update the submission.

If two updates touch the same campaign or submission at once, MongoDB raises a write conflict for one of them and Mongoose retries it from a fresh read, so the second update sees the first one's payout. Together with paying only the difference, this means:

- parallel updates for different posts can't overspend the budget, and
- repeating or racing the same update can't pay a milestone twice.

`tests/views.integration.test.ts` proves this against a real (in-memory) replica set: 20 posts each owed ₹2,000 are updated in parallel against a ₹5,000 budget and exactly ₹5,000 is paid; 10 concurrent duplicate updates pay ₹500 once. Removing the transaction makes both tests fail (₹21,000 paid out of a ₹5,000 budget).

## Caching

`GET /api/campaigns/live` is a read-through Redis cache (`campaigns:live`, 30s TTL). It stores the serialised response body, so a hit skips MongoDB and serialisation entirely. Each page/search/filter combination is cached under a versioned key; invalidation bumps the version, dropping every variant at once. That happens whenever a campaign is created, changes status, or any payout changes its spend, so remaining budgets shown to creators stay current. Any Redis error falls back to MongoDB.

## Tests

```bash
cd backend && npm test
```

- `payout.test.ts` — milestone lookup, multi-milestone jumps, paying the difference, budget cap (full, partial, exhausted).
- `spike.test.ts` — spike thresholds and time windows.
- `views.integration.test.ts` — concurrency, idempotency, partial payout, pause/resume/close, pagination and search, input validation.
- `auth.integration.test.ts` — password hash never appears in responses.

## Deployment

- **API (Render):** root directory `backend`, build `npm ci && npm run build`, start `npm start`. Set the env vars above plus `MONGOMS_DISABLE_POSTINSTALL=1` (skips the test-only MongoDB binary download). Set `CORS_ORIGINS` to the frontend URL.
- **Web (Vercel):** root directory `frontend`, keep "Include files outside the root directory" enabled (the app imports `backend/src/contracts`), set `NEXT_PUBLIC_API_URL`.
- **Database:** MongoDB Atlas (any tier — it's a replica set).

## Scaling to 10,000 creators

The current design is correct but funnels every payout for a campaign through one document, which becomes the bottleneck as volume grows.

- **Ingest views asynchronously.** Platforms (or our pollers) push view counts into a queue (SQS / BullMQ). Workers batch updates per submission and only run the payout transaction when a count crosses a new milestone — most updates then become a cheap `$max` on `views` with no transaction at all.
- **Reduce contention on hot campaigns.** A viral campaign with thousands of posts serialises on its `spent` counter. Partition the queue by campaign so one worker owns a campaign's payouts (no conflicts, no retries), or pre-split the budget into reservation chunks.
- **Ledger instead of counters.** Write each payout as an immutable ledger entry with a unique `(submissionId, milestone)` key. That gives an audit trail, makes retries naturally idempotent, and lets `spent` / earnings be recomputed or reconciled.
- **Reads.** Lists are already paginated and indexed (`{ brand, createdAt }`, `{ creator, createdAt }`, `{ campaign, createdAt }`). Next steps: keep creator earnings as a maintained total instead of aggregating per request, replace regex search with an Atlas Search index, and cache per-campaign summaries in Redis.
- **Platform limits.** Instagram/YouTube APIs are rate limited, so poll on a schedule weighted by post age (fresh posts every few minutes, older ones hourly) and back off on errors.
- **Fraud.** Move spike detection to the worker with per-creator baselines, and hold flagged payouts for review.
