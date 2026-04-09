# إيجاري (Ejari) — Short-Term Rental Platform for Tunisia

A full-stack rental platform built as a local alternative to Airbnb and Booking.com.
Payments in Tunisian Dinar, automatic fiscal invoices, phone OTP authentication, and real-time host-guest chat.

---

## TL;DR — 2-minute demo flow

```
Home → Search city → Property detail → Select dates → Book
  → OTP login (if not logged in)
  → Mock payment page → Confirm
  → Booking confirmed + invoice generated
  → Chat with host in real-time
```

**Try it yourself in under 2 minutes:**

| Step | Action                                                             |
| ---- | ------------------------------------------------------------------ |
| 1    | Go to `http://localhost:3000`                                      |
| 2    | Click any city tile or search "Tunis"                              |
| 3    | Click a property → pick dates → click Réserver                     |
| 4    | Login with phone `+21698000003` → check API terminal for OTP code  |
| 5    | Enter the 6-digit code                                             |
| 6    | On the mock payment page → click Confirmer le paiement             |
| 7    | You're in. Invoice generated. Chat with the host at `/booking/:id` |

> All OTPs print to the API terminal in development. No real SMS is sent.
> To see the host view, log in with `+21698000001` and visit `/dashboard`.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│  Browser / Mobile                                    │
│  Next.js 14 — SSR pages, React components           │
└──────────────────────┬──────────────────────────────┘
                       │  HTTP (JSON) + WebSocket
┌──────────────────────▼──────────────────────────────┐
│  Express API  (Node.js + TypeScript)                 │
│  Routes → Services → Prisma ORM                     │
│  Socket.IO for real-time chat                        │
└──────────┬───────────────────────┬──────────────────┘
           │ SQL                   │ Commands
┌──────────▼──────────┐  ┌─────────▼──────────────────┐
│  PostgreSQL          │  │  Redis                      │
│  All persistent data │  │  OTP codes (TTL 5 min)      │
│  Prisma migrations   │  │  Rate limiting              │
│                      │  │  Session state              │
└─────────────────────-┘  └────────────────────────────┘
           │
┌──────────▼──────────────────────────────────────────┐
│  Konnect API (external)                              │
│  TND payments — webhook confirms booking + invoice   │
└─────────────────────────────────────────────────────┘
```

**Request lifecycle — booking creation:**

1. `POST /bookings` received
2. JWT verified in `authMiddleware`
3. Property fetched — validate guests, check host isn't self-booking
4. Conflict check: query existing bookings with date overlap formula
5. Total price calculated (nights × pricePerNight)
6. Booking inserted with status `PENDING`
7. `POST /payments/initiate` → Konnect creates payment session → returns `payUrl`
8. Guest redirected to Konnect (or mock-pay in dev)
9. Konnect webhook fires `POST /payments/webhook`
10. `prisma.$transaction()` — updates Payment, Booking, creates Invoice atomically
11. Socket.IO notifies booking room participants

---

## Tech Stack

| Layer                | Technology                                              |
| -------------------- | ------------------------------------------------------- |
| Frontend             | Next.js 14 (App Router + SSR), TypeScript, Tailwind CSS |
| Backend              | Node.js, Express, TypeScript                            |
| Database             | PostgreSQL via Prisma ORM                               |
| Cache / Sessions     | Redis (ioredis)                                         |
| Real-time            | Socket.IO (host ↔ guest chat)                           |
| Payments             | Konnect API (Tunisian Dinar)                            |
| Local infrastructure | Docker Compose                                          |

---

## Security

Security is enforced at multiple layers — not just at the route level.

### Authentication

- **Phone OTP** — no passwords to leak or brute-force
- **JWT tokens** — signed with `HS256`, 30-day expiry, verified on every protected request
- **Token refresh** — new token issued on role change (e.g. GUEST → HOST) so stale permissions can't be exploited

### OTP hardening

- **Rate limiting** — max 3 OTP sends per phone per 60 seconds (Redis `INCR` + `EXPIRE`)
- **Brute force protection** — 5 wrong attempts locks the code and forces a new request
- **Automatic expiry** — OTP codes deleted from Redis after 5 minutes via TTL, no cron job needed
- **Attempt counter TTL** — attempt counter expires with the code, so it can't persist across requests

### Authorization

- Every route that modifies data verifies the requesting user owns the resource (`booking.guestId === req.user.id`)
- Hosts can only edit, confirm, or cancel their own properties and bookings
- Socket.IO room membership re-verified on every `send_message` event, not just on join
- `requireHost` middleware rejects non-host users at the route level before any DB query runs

### Payment security

- **Webhook signature verification** — HMAC-SHA256 signature checked against `KONNECT_WEBHOOK_SECRET` before processing any webhook
- **Raw body preserved** — `express.raw()` applied before `express.json()` so the original buffer is available for signature verification
- **Atomic transactions** — `prisma.$transaction()` ensures payment confirmation and booking update either both succeed or both fail

### HTTP security

- `helmet()` sets `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, and `Content-Security-Policy` headers on every response
- CORS restricted to `FRONTEND_URL` only — no wildcard origins
- Request body size limited to `10mb` to prevent payload flooding

---

## Getting Started

### Prerequisites

- Node.js v18+
- Docker Desktop

### 1. Start infrastructure

```bash
docker compose up -d
# Starts PostgreSQL on :5432 and Redis on :6379
```

### 2. Backend API

```bash
cd app/api
cp .env.example .env
# Set JWT_SECRET to a long random string:
# openssl rand -base64 64

npm install
npx prisma generate   # must output: "Generated to node_modules/@prisma/client"
npx prisma db push    # creates all tables
npm run db:seed       # seeds 6 properties and 3 test users
npm run dev           # API running at http://localhost:4000
```

Verify:

```bash
curl http://localhost:4000/health
# {"status":"ok","env":"development","ts":"..."}

curl http://localhost:4000/properties
# returns array of 6 properties
```

### 3. Frontend

```bash
cd app/web
cp .env.local.example .env.local
npm install
npm run dev           # Site at http://localhost:3000
```

---

## Test Credentials

| Role                    | Phone        |
| ----------------------- | ------------ |
| Host 1 — Ahmed Ben Ali  | +21698000001 |
| Host 2 — Fatma Trabelsi | +21698000002 |
| Guest — Khaled Mansour  | +21698000003 |

---

## API Reference

### Auth

```
POST  /auth/request-otp       Send OTP to phone
POST  /auth/verify-otp        Verify OTP → returns JWT + user
GET   /auth/me                Get current user profile
PATCH /auth/me                Update name and email
POST  /auth/become-host       Upgrade GUEST to HOST (returns new token)
```

### Properties

```
GET   /properties             Search — city, dates, guests, price range
GET   /properties/my          Host's own listings
GET   /properties/:id         Property detail with photos and reviews
POST  /properties             Create a listing (hosts only)
PUT   /properties/:id         Update a listing (owner only)
POST  /properties/:id/photos  Add a photo
```

### Bookings

```
POST  /bookings               Create booking — conflict check runs first
GET   /bookings               List (host: received | guest: own)
GET   /bookings/stats         Host dashboard metrics
GET   /bookings/:id           Full detail with messages
POST  /bookings/:id/confirm   Host confirms
POST  /bookings/:id/cancel    Either party cancels
```

### Payments

```
POST  /payments/initiate           Start Konnect payment session
POST  /payments/webhook            Konnect callback — confirms + invoices
POST  /payments/dev-confirm        Simulate payment (dev only)
GET   /payments/invoice/:bookingId Get invoice for confirmed booking
```

### Reviews

```
POST  /reviews                Post review (completed bookings only, once per booking)
```

---

## Pages

| URL                            | Description                                              |
| ------------------------------ | -------------------------------------------------------- |
| `/`                            | Homepage — hero, city tiles, features, pricing, waitlist |
| `/search`                      | Property grid with filters                               |
| `/property/:id`                | Photos, description, host info, reviews, booking widget  |
| `/login`                       | 2-step OTP — auto-registers new users                    |
| `/bookings`                    | Guest trips or host received bookings                    |
| `/booking/:id`                 | Detail + real-time chat                                  |
| `/booking/:id/mock-pay`        | Dev payment simulation                                   |
| `/booking/:id/success`         | Post-payment confirmation                                |
| `/become-host`                 | Upgrade guest account to host                            |
| `/profile`                     | Edit name and email                                      |
| `/dashboard`                   | Host stats, bookings, property list                      |
| `/dashboard/property/new`      | Create a listing                                         |
| `/dashboard/property/:id/edit` | Edit a listing                                           |

---

## Key Architecture Decisions

**Prisma singleton** — one `PrismaClient` per server process, stored on `global.__prisma`. Without this, hot-reload creates a new connection pool on every file save and exhausts the database connection limit within seconds.

**Middleware order** — `helmet()` → `cors()` → `express.raw()` for webhook → `express.json()` → routes. Routes mounted before `express.json()` receive `undefined` bodies on every request. Order is not optional.

**Date overlap formula** — two ranges `[A_start, A_end]` and `[B_start, B_end]` overlap when `A_start < B_end AND A_end > B_start`. Applied in both search (filter unavailable properties) and booking creation (conflict check before insert).

**Atomic payment confirmation** — `prisma.$transaction()` updates Payment, Booking, and creates Invoice together. If the invoice step fails, the payment and booking updates roll back, preventing partial state.

**Money type** — `Decimal(10,3)` in Prisma schema, not `Float`. `0.1 + 0.2` in floating point gives `0.30000000000000004`. Decimal stores exact values. TND has 3 decimal places (millimes).

**Server-side rendering for SEO** — search and property detail pages fetch data server-side via `fetch()` in async Server Components. Google receives fully-rendered HTML, making "appartement à louer Tunis" indexable. Client-side-only React (like CRA) would deliver a blank page to crawlers.

---

## Scalability & Known Limits

The current architecture handles hundreds of concurrent users comfortably. Here's where the bottlenecks appear at scale and what to do about them:

| Limit                   | When it hits                         | Solution                                                                                                                                            |
| ----------------------- | ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Socket.IO single-server | ~10k concurrent connections          | Add `@socket.io/redis-adapter` — all servers share a Redis pub/sub channel, so messages reach users regardless of which server they're connected to |
| PostgreSQL search query | ~100k properties                     | Add `@@fulltext` index on `title` + `description` in Prisma schema, or move search to Meilisearch                                                   |
| Property photos         | Storage grows unboundedly            | Currently URL-based. Move to Cloudinary with automatic resizing: `w_800,q_auto,f_auto` on upload                                                    |
| OTP Redis keys          | Negligible — TTL auto-deletes them   | Already handled                                                                                                                                     |
| JWT cannot be revoked   | Compromised tokens valid for 30 days | Add a Redis token blocklist, or shorten expiry to 7 days with silent refresh                                                                        |

---

## Future Improvements

- [ ] **iCal sync** — sync blocked dates from Airbnb/Booking.com feeds via a Python worker (codebase has the `icalUrl` field ready on `Property`)
- [ ] **SMS integration** — replace `console.log` in `src/services/otp.ts` with Twilio or a Tunisian SMS provider
- [ ] **Image uploads** — replace URL input with Cloudinary direct upload (presigned URLs from `/properties/:id/upload-url`)
- [ ] **Push notifications** — notify hosts of new bookings, guests of confirmations via Firebase or OneSignal
- [ ] **Mobile app** — React Native using the same API (all endpoints are already REST)
- [ ] **Analytics dashboard** — occupancy rate per property, revenue per month with Chart.js (Prisma queries already exist in `/bookings/stats`)
- [ ] **Multi-language** — Arabic RTL support with `next-intl`
- [ ] **Admin panel** — approve hosts, manage disputes, view platform-wide revenue
- [ ] **Stripe/Flouci** — additional payment providers alongside Konnect

---

## Common Issues

**Seed crashes: "Cannot find module '@prisma/client'"**
The schema still uses Prisma 7's experimental generator. Fix the `generator` block in `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}
```

Then run `npx prisma generate` again. You should see "Generated to `node_modules/@prisma/client`" — not a custom path.

**`req.body` is always `undefined`**
Routes are mounted before `express.json()` in `index.ts`. Middleware must come first.

**Images not loading**
Add the hostname to `images.remotePatterns` in `next.config.js`.

**Socket.IO connection refused**
Check `NEXT_PUBLIC_API_URL` in `app/web/.env.local` — it must point to the running API server.

**`npx prisma db push` connects to wrong database**
`prisma.config.ts` is overriding `DATABASE_URL`. Delete that file — it was auto-generated by Prisma 7's wizard and conflicts with the standard setup.

---

## Deployment

| Service     | Platform        |
| ----------- | --------------- |
| Frontend    | Vercel          |
| Backend API | Railway         |
| PostgreSQL  | Neon or Railway |
| Redis       | Upstash         |

### Environment variables

**Backend (`app/api/.env`):**

```
DATABASE_URL=postgresql://...
JWT_SECRET=<openssl rand -base64 64>
REDIS_URL=redis://...
FRONTEND_URL=https://yourdomain.com
API_URL=https://your-api.railway.app
NODE_ENV=production
KONNECT_API_KEY=...
KONNECT_WALLET_ID=...
KONNECT_WEBHOOK_SECRET=...
```

**Frontend (`app/web/.env.local`):**

```
NEXT_PUBLIC_API_URL=https://your-api.railway.app
```

### Deploy checklist

```
□ .env is in .gitignore and not committed
□ JWT_SECRET is at least 64 characters
□ CORS origin set to production frontend URL only
□ npx prisma migrate deploy (not db push) for production
□ Konnect webhook URL updated to production API URL
□ Health check passes: GET /health → {"status":"ok"}
□ Test the full booking flow end-to-end in production
```

---

## Built with

TypeScript strict mode throughout. Separation of routes and services. Prisma singleton. OTP with Redis TTLs. Date overlap validation. Atomic payment transactions. JWT-authenticated WebSockets.
