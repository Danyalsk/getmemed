# Meme'd Campaign Payout Tracker

A creator marketplace where brands run campaigns with a milestone payout ladder and creators get paid as their Instagram and YouTube posts gain views. A post earns the highest milestone it has crossed, and a campaign can never pay out more than its budget, even when view updates arrive at the same time.

| | |
|---|---|
| Live app | https://getmemed.vercel.app |
| API | https://memed-api.onrender.com/api/health |
| Repository | https://github.com/Danyalsk/getmemed |

### Demo accounts

All demo accounts use the password `password123`.

| Role | Email |
|---|---|
| Creator | `daily.meme.dose@seed.memed.app` |
| Brand | `zing.beverages@seed.memed.app` |

You can also sign up with any email as a brand or a creator.

## What's covered

| Assignment item | Where it lives |
|---|---|
| JWT signup and login, brand and creator roles | `backend/src/routes/auth.routes.ts`, `middleware/auth.ts` |
| Brand creates a campaign (name, platform, budget, milestone ladder) | `POST /api/campaigns`, "New campaign" on `/brand/campaigns` |
| Budget spent vs. remaining per campaign | `GET /api/campaigns/mine`, brand campaign cards and campaign page |
| Creator lists live campaigns | `GET /api/campaigns/live`, `/creator/discover` |
| Creator submits a post link | `POST /api/campaigns/:id/submissions`, "Submit a post" on a campaign page |
| Creator sees total earnings | `GET /api/submissions/mine`, `/creator/earnings` |
| `PATCH /api/submissions/:id/views` with no role check | `backend/src/routes/submission.routes.ts`, "Update" on `/creator/submissions` |
| Payout = highest milestone crossed, capped by remaining budget | `backend/src/services/payout.ts`, `submission.service.ts` |
| Jest unit tests for payout and budget cap | `backend/tests/payout.test.ts` |
| Bonus: Redis cache for the campaign list | `backend/src/lib/cache.ts` |
| Bonus: flag unusual view spikes | `backend/src/services/spike.ts` |
| Stretch: concurrent updates never overspend or double pay | Mongo transactions, `tests/views.integration.test.ts` |
| Stretch: Docker | `docker-compose.yml`, `backend/Dockerfile`, `frontend/Dockerfile` |
| Stretch: scaling to 10,000 creators | [Scaling](#scaling-to-10000-creators) below |

Beyond the brief, I added pause/resume/close for campaigns, a brief on each campaign, search and pagination on every list, a discovery page for creators, per-campaign leaderboards, analytics for both roles, and account settings.

## Stack

| | |
|---|---|
| Backend | Node.js, Express 5, TypeScript, MongoDB with Mongoose, Zod, JWT, Redis |
| Frontend | Next.js 16 (App Router), TypeScript, TanStack Query, Tailwind CSS v4, shadcn/ui, react-hook-form |
| Tests | Jest, Supertest, mongodb-memory-server |
| Hosting | Vercel (web), Render (API), MongoDB Atlas |

## Project structure

```
backend/
  src/contracts/   Zod schemas and inferred types for every request and response
  src/services/    Business logic; payout.ts and spike.ts are pure functions
  src/routes/      Express routers
  src/models/      Mongoose models
  scripts/         Demo data seed
  tests/           Unit and integration tests
frontend/
  src/app/         Routes: landing, auth, /brand/*, /creator/*, /settings
  src/components/  UI grouped into brand, creator, campaign and shared pieces
  src/lib/         Typed API client, query definitions, session store, formatting
```

Every API shape is defined once, as a Zod schema in `backend/src/contracts`. The backend validates requests with it, and the frontend imports the same files through the `@contracts/*` path alias for form validation and to parse every response. No type is declared twice.

The API returns Mongoose documents directly. The schema owns the response shape (`remaining` is a virtual and `passwordHash` is removed in `toJSON`), so there are no mapping layers to keep in sync. The integration tests parse every response with the contract schemas, which catches any drift.

Each route handler catches its errors and passes them to `next(error)`. One error handler (`middleware/error-handler.ts`) turns validation, domain, duplicate-key and malformed-body errors into the shared error format, and returns a plain 500 for anything unexpected without leaking internals.

## Running locally

You need Node 22+, a MongoDB replica set (any Atlas cluster works; payouts use transactions, which need a replica set) and, optionally, Redis.

```bash
# API on http://localhost:4000
cd backend
cp .env.example .env        # set MONGODB_URI and JWT_SECRET
npm install
npm run dev

# Web app on http://localhost:3000
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

To load demo data:

```bash
cd backend && npm run seed
```

This creates 12 campaigns from fictional brands, 8 creators and their posts. The payouts on those posts go through the real payout service. Seeded accounts use the `@seed.memed.app` domain, and running the seed again replaces only that data.

### Docker

```bash
JWT_SECRET=$(openssl rand -hex 32) docker compose up --build
```

This starts a single-node Mongo replica set, Redis, the API on port 4000 and the web app on port 3000. I tested it end to end: health check, signup, cover upload, campaign creation, submissions, and parallel view updates that stopped exactly at the budget, plus the Redis cache being filled.

### Scripts

| | Backend | Frontend |
|---|---|---|
| Dev server | `npm run dev` | `npm run dev` |
| Type check | `npm run typecheck` | `npm run typecheck` |
| Lint | `npm run lint` | `npm run lint` |
| Tests | `npm test` | |
| Demo data | `npm run seed` | |
| Production | `npm run build && npm start` | `npm run build && npm start` |

`npm test` runs Jest with `--experimental-vm-modules`, because the MongoDB driver loads some modules with a dynamic `import()` that Jest's VM rejects without the flag.

## Environment variables

**backend/.env**

| Variable | Required | Default | Notes |
|---|---|---|---|
| `MONGODB_URI` | yes | | Must point to a replica set |
| `JWT_SECRET` | yes | | At least 32 characters |
| `JWT_TTL_SECONDS` | no | `604800` | Token lifetime (7 days) |
| `PORT` | no | `4000` | |
| `CORS_ORIGINS` | no | `http://localhost:3000` | Comma-separated list of allowed origins |
| `REDIS_URL` | no | | Turns on the live campaign cache. Without it, or if Redis is down, reads go straight to Mongo |
| `SPIKE_MIN_DELTA` | no | `5000` | Smallest view gain that can count as a spike |
| `SPIKE_VIEWS_PER_HOUR` | no | `20000` | Growth rate that flags a spike |

**frontend/.env.local**

| Variable | Required | Notes |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | yes | Base URL of the API, for example `http://localhost:4000` |
| `NEXT_PUBLIC_SITE_URL` | no | Public URL of the web app, used for link previews. Defaults to `http://localhost:3000` |

The backend validates its environment with Zod on startup and exits with a clear message if something is missing or malformed.

## API

Responses are JSON. Errors always have the shape `{ "error": { "code", "message", "fields"? } }`.

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/signup` | | `{ name, email, password, role }` returns `{ token, user }` |
| POST | `/api/auth/login` | | `{ email, password }` returns `{ token, user }` |
| GET | `/api/auth/me` | any | Current user |
| PATCH | `/api/auth/me` | any | `{ name }` |
| PATCH | `/api/auth/password` | any | `{ currentPassword, newPassword }` |
| POST | `/api/images` | brand | Upload a campaign cover (JPEG, PNG or WebP, up to 2 MB) |
| POST | `/api/campaigns` | brand | Create a campaign |
| GET | `/api/campaigns/mine` | brand | Own campaigns with `spent` and `remaining`, plus a budget `summary`. Filter: `status` |
| GET | `/api/campaigns/:id` | owner brand or any creator | One campaign |
| GET | `/api/campaigns/:id/leaderboard` | owner brand or any creator | Top 5 creators by earnings |
| PATCH | `/api/campaigns/:id/status` | owner brand | `{ status: "active" \| "paused" \| "closed" }` |
| GET | `/api/campaigns/:id/submissions` | owner brand | Posts submitted to the campaign |
| GET | `/api/campaigns/featured` | none | Up to 12 trending live campaigns for the login and signup pages (Redis-cached) |
| GET | `/api/campaigns/live` | creator | Live campaigns, cached in Redis. Filters: `platform`, `sort=newest\|trending\|budget` |
| GET | `/api/campaigns/joined` | creator | Campaigns the creator has posted to, with their own posts, views and earnings |
| POST | `/api/campaigns/:id/submissions` | creator | `{ postUrl }` |
| GET | `/api/submissions/mine` | creator | Own posts plus `totalEarnings` |
| GET | `/api/submissions/brand` | brand | Posts across all of the brand's campaigns. Filter: `campaign` |
| PATCH | `/api/submissions/:id/views` | none | `{ views }` returns `{ submission, paidNow }` |
| GET | `/api/analytics/creator` | creator | Totals plus per-campaign and per-platform breakdowns |
| GET | `/api/analytics/brand` | brand | Totals, spend per campaign, platform split and top creators |

Every list endpoint takes `?page=1&pageSize=12&search=…` (page size up to 50) and returns `{ items, total, page, pageSize, totalPages }`. Campaign lists search by name; submission lists search by post link, creator name or campaign name.

Requests are authenticated with `Authorization: Bearer <token>`. Signup and login are rate limited to 20 requests per 15 minutes per IP.

The views endpoint has no auth because the brief describes it as a stand-in for platform data. To try payouts from the UI, open My posts as a creator and use the "Update" field on any post.

## Payout rules and assumptions

Where the brief left room, these are the calls I made:

1. **Highest milestone only.** A post is entitled to the payout of the highest milestone its views have reached. If one update jumps past several milestones (0 to 120K), it pays the top one, not the sum.
2. **Pay the difference.** Each update pays `entitled − alreadyPaid`. Moving from 10K (₹500) to 50K (₹2,000) pays ₹1,500 more, so the post has ₹2,000 in total.
3. **Budget runs out mid-payout: pay what's left.** If ₹3,000 is owed and ₹1,200 remains, the creator gets ₹1,200 and the campaign is exhausted. The submission keeps both `entitledAmount` and `paidAmount`, and the UI marks it as capped by budget.
4. **Views never go down.** A lower count than the stored one is treated as stale or out of order and ignored. Nothing is ever clawed back.
5. **A live campaign** is `active` with budget left. Exhausted, paused and closed campaigns drop out of the creator list and reject new posts.
6. **Pause, resume, close.** A paused campaign is hidden from creators, takes no new posts and pays nothing, but still records views. Because payouts are `entitled − alreadyPaid`, the first update after resuming pays whatever was earned during the pause. Closing is permanent and leaves the remaining budget unspent.
7. **Money is in whole rupees.**
8. **Milestone ladder:** 1 to 10 rungs, with views and payouts strictly increasing, and the top payout must fit in the budget.
9. **A post can be submitted once.** Links are normalised before the uniqueness check (`?igsh=`, `/reel/` vs `/p/`, `youtu.be` and `/shorts/` all map to one canonical URL), and the link's host must match the campaign's platform.
10. **Spike flag:** an update is flagged when a post gains at least `SPIKE_MIN_DELTA` views at `SPIKE_VIEWS_PER_HOUR` or faster since its last update. The flag is shown to the brand and stays on the post, but the payout still goes through. In production I'd hold flagged payouts for review.
11. **Session storage:** the JWT lives in `localStorage`. It's simple and works across the Vercel and Render domains. The trade-off is that injected scripts could read it; an httpOnly cookie behind a same-origin proxy would be the next step.

## Concurrency and idempotency

`PATCH /api/submissions/:id/views` runs in a MongoDB transaction with snapshot reads:

1. Read the submission and its campaign.
2. Work out `views = max(stored, incoming)`, the entitlement, and `pay = min(entitled − paid, budget − spent)`.
3. `$inc` the campaign's `spent`, guarded by `spent + pay ≤ budget`, and update the submission.

When two updates touch the same campaign or submission at once, MongoDB raises a write conflict on one of them and Mongoose retries it from a fresh read, so the second update sees the first one's payout. Combined with paying only the difference:

- parallel updates on different posts can't overspend the budget
- repeated or racing updates on the same post can't pay a milestone twice

`tests/views.integration.test.ts` checks this against a real in-memory replica set. In one test, 20 posts each owed ₹2,000 are updated in parallel against a ₹5,000 budget and exactly ₹5,000 is paid. In another, 10 concurrent duplicate updates pay ₹500 once. Without the transaction, both tests fail (₹21,000 paid from a ₹5,000 budget).

## Caching

`GET /api/campaigns/live` is a read-through Redis cache with a 30 second TTL. It stores the serialised response, so a hit skips both Mongo and serialisation. Each page, search and filter combination gets its own key under a version number. Creating a campaign, changing its status or paying out from it bumps the version, which drops every cached variant at once, so the remaining budgets creators see stay current. If Redis errors, the request falls back to Mongo.

## Tests

```bash
cd backend && npm test
```

42 tests across five suites:

- `payout.test.ts`: milestone lookup, multi-milestone jumps, paying the difference, and the budget cap when it's full, partial or exhausted
- `spike.test.ts`: spike thresholds and time windows
- `views.integration.test.ts`: concurrency, idempotency, partial payouts, pause/resume/close, pagination, search and input validation
- `marketplace.integration.test.ts`: campaign access rules, leaderboards, trending sort, the public featured list, creator and brand workspaces, account settings
- `auth.integration.test.ts`: the password hash never appears in a response

## Deployment

- **Web on Vercel:** root directory `frontend`, with "Include files outside the root directory" turned on because the app imports `backend/src/contracts`. Set `NEXT_PUBLIC_API_URL`.
- **API on Render:** defined in `render.yaml`. Set `MONGODB_URI` and `CORS_ORIGINS`; `JWT_SECRET` is generated by Render. Redis isn't deployed (the brief makes it optional), so the live API reads campaigns straight from Mongo; set `REDIS_URL` to turn the cache on.
- **Keep-alive:** Render's free tier sleeps after 15 idle minutes. `.github/workflows/keep-api-awake.yml` pings the health check every 10 minutes using the `API_URL` repository variable.
- **Database:** MongoDB Atlas.

## Scaling to 10,000 creators

Today every view update runs a payout transaction, and every payout for a campaign updates one `spent` counter. Both become bottlenecks at this scale.

- **Queue view updates.** Platform pollers push counts into a queue (BullMQ or SQS). Workers save every count right away with a cheap `$max`, so brands always see live views, and only open a payout transaction when a post crosses a new milestone.
- **Partition by campaign.** Routing a campaign's updates to a single worker removes write conflicts on `spent`, so a viral campaign with thousands of posts doesn't slow everything else down.
- **Payout ledger.** Each payout becomes an immutable entry keyed by `(submissionId, milestone)`. That gives an audit trail, makes retries idempotent by design, and lets totals be rebuilt or reconciled.
- **Fast reads.** Keep creator earnings and campaign view totals as stored running totals instead of aggregating per request, move search to Atlas Search, and cache campaign summaries in Redis.
- **Platform rate limits.** Poll new posts every few minutes and older ones hourly, and back off when a platform rate-limits us.
- **Fraud.** Score engagement quality (likes and comments relative to views, against the creator's usual numbers) alongside view spikes. Payouts for flagged posts are held until a brand reviews them.
