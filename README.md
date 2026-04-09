# إيجاري (Ejari) — Short-Term Rental Platform for Tunisia

A full-stack rental platform built as a local alternative to Airbnb and Booking.com. Payments in Tunisian Dinar, automatic fiscal invoices, phone OTP authentication, and real-time host-guest chat.

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
# Open .env and set JWT_SECRET to a long random string:
# openssl rand -base64 64

npm install
npx prisma generate   # must show: "Generated to node_modules/@prisma/client"
npx prisma db push    # creates all tables
npm run db:seed       # creates 6 properties and 3 test users
npm run dev           # API running at http://localhost:4000
```

**Verify it works:**

```bash
curl http://localhost:4000/health
curl http://localhost:4000/properties
```

### 3. Frontend

```bash
cd app/web
cp .env.local.example .env.local
npm install
npm run dev           # Site running at http://localhost:3000
```

---

## Test Credentials

All OTPs print to the API terminal in dev mode — no real SMS is sent.

| Role                    | Phone        |
| ----------------------- | ------------ |
| Host 1 — Ahmed Ben Ali  | +21698000001 |
| Host 2 — Fatma Trabelsi | +21698000002 |
| Guest — Khaled Mansour  | +21698000003 |

---

## Complete Booking Flow (dev)

1. Go to `http://localhost:3000` — homepage
2. Search by city or click a city tile → search results
3. Click a property → detail page with photos and booking widget
4. Select dates → click "Réserver" → redirected to `/login` if not logged in
5. Enter phone `+21698000003` → check the API terminal for the OTP code
6. Enter the code → logged in as Khaled (guest)
7. Booking created with status `PENDING`
8. Redirected to `/booking/:id/mock-pay`
9. Click "Confirmer le paiement" → calls `POST /payments/dev-confirm`
10. Booking → `CONFIRMED`, invoice auto-generated → `/booking/:id/success`
11. Log out → log in as `+21698000001` (host Ahmed) → dashboard shows the booking and revenue

---

## API Reference

### Auth

```
POST  /auth/request-otp       Send OTP to phone number
POST  /auth/verify-otp        Verify OTP → returns JWT + user
GET   /auth/me                Get current user profile
PATCH /auth/me                Update name and email
POST  /auth/become-host       Upgrade GUEST account to HOST (returns new token)
```

### Properties

```
GET   /properties             Search — city, dates, guests, price range
GET   /properties/my          Host's own listings (auth required)
GET   /properties/:id         Single property detail with photos and reviews
POST  /properties             Create a listing (hosts only)
PUT   /properties/:id         Update a listing (owner only)
POST  /properties/:id/photos  Add a photo to a listing
```

### Bookings

```
POST  /bookings               Create booking — runs conflict check first
GET   /bookings               List bookings (host sees received, guest sees own)
GET   /bookings/stats         Host dashboard stats — revenue, counts, etc.
GET   /bookings/:id           Full booking detail with messages
POST  /bookings/:id/confirm   Host confirms a pending booking
POST  /bookings/:id/cancel    Either party cancels
```

### Payments

```
POST  /payments/initiate          Start a Konnect payment session
POST  /payments/webhook           Konnect webhook — confirms booking + generates invoice
POST  /payments/dev-confirm       Simulate successful payment (development only)
GET   /payments/invoice/:bookingId  Get invoice for a confirmed booking
```

### Reviews

```
POST  /reviews                Post a review (completed bookings only, one per booking)
```

---

## Pages

| URL                            | Description                                              |
| ------------------------------ | -------------------------------------------------------- |
| `/`                            | Homepage — hero, city tiles, features, pricing, waitlist |
| `/search`                      | Property grid with filters (city, dates, guests, price)  |
| `/property/:id`                | Photos, description, host info, reviews, booking widget  |
| `/login`                       | 2-step OTP login — auto-registers new users              |
| `/bookings`                    | Guest trips or host received bookings                    |
| `/booking/:id`                 | Full detail + real-time chat between guest and host      |
| `/booking/:id/mock-pay`        | Dev payment simulation page                              |
| `/booking/:id/success`         | Post-payment confirmation                                |
| `/become-host`                 | Upgrade a guest account to host                          |
| `/profile`                     | Edit name and email                                      |
| `/dashboard`                   | Host stats, recent bookings, property list               |
| `/dashboard/property/new`      | Create a new listing with photos                         |
| `/dashboard/property/:id/edit` | Edit an existing listing                                 |

---

## Key Architecture Decisions

**Prisma singleton** — one `PrismaClient` instance per server process, stored on `global.__prisma` to survive hot-reload without exhausting database connections.

**Middleware order in `index.ts`** — `helmet()` → `cors()` → `express.raw()` for webhook → `express.json()` → routes. Routes registered before `express.json()` would receive `undefined` bodies on every request.

**Date overlap formula** — two date ranges `[A_start, A_end]` and `[B_start, B_end]` overlap when `A_start < B_end AND A_end > B_start`. Used in both the search query (filter unavailable properties) and booking creation (conflict check before insert).

**Atomic payment confirmation** — `prisma.$transaction()` updates `Payment`, `Booking`, and creates `Invoice` together. If any step fails, all roll back.

**Socket.IO authentication** — JWT verified in `io.use()` middleware before the connection is accepted. Booking room membership re-verified on every `send_message` event, not just on join.

**OTP security** — three Redis keys per phone: the code (5-min TTL), attempt counter (locked after 5 wrong tries), rate limit (max 3 sends per minute). All keys have TTLs — nothing needs manual cleanup.

**Money type** — `Decimal(10,3)` in Prisma, not `Float`. Float arithmetic gives `0.1 + 0.2 = 0.30000000000000004`. Decimal stores exact values. TND has 3 decimal places (millimes).

---

## Common Issues

**Seed crashes with "Cannot find module '@prisma/client'"**
Your `prisma/schema.prisma` still has `provider = "prisma-client"` with a custom `output` path. Fix the generator block:

```prisma
generator client {
  provider = "prisma-client-js"
}
```

Then run `npx prisma generate` again.

**`req.body` is always `undefined`**
Routes are mounted before `express.json()` in `index.ts`. Middleware must always come before routes.

**Images not loading**
Add the image domain to `next.config.js` under `images.remotePatterns`.

**Socket.IO connection refused**
The frontend is connecting to the wrong URL. Check `NEXT_PUBLIC_API_URL` in `.env.local`.

---

## Deployment

| Service     | Recommended platform |
| ----------- | -------------------- |
| Frontend    | Vercel               |
| Backend API | Railway              |
| PostgreSQL  | Neon or Railway      |
| Redis       | Upstash              |

### Production environment variables

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
□ .env not committed to git
□ JWT_SECRET is at least 64 characters
□ CORS origin set to production frontend URL only
□ npx prisma migrate deploy run (not db push)
□ Konnect webhook URL updated to production API URL
□ Health endpoint responds: GET /health → {"status":"ok"}
```
