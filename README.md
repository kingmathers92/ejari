# Ejari — Short-Term Rental Platform in Tunisia

A complete short-term rental platform for Tunisia. A local alternative to Airbnb and Booking.com with payments in Tunisian Dinars (TND), automatic tax invoicing, and OTP-based authentication.

---

## Tech Stack

| Layer                | Technology                                        |
| -------------------- | ------------------------------------------------- |
| Frontend             | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Backend              | Node.js, Express, TypeScript                      |
| Database             | PostgreSQL with Prisma ORM                        |
| Cache / Sessions     | Redis (ioredis)                                   |
| Real-time            | Socket.IO (host ↔ guest chat)                     |
| Payments             | Konnect (Tunisian Dinars)                         |
| Local Infrastructure | Docker Compose                                    |

---

## Project Structure

```
ejari/
├── app/
│   ├── api/                  ← Backend Express
│   │   ├── prisma/
│   │   │   ├── schema.prisma ← Database schema
│   │   │   └── seed.ts       ← Test data
│   │   └── src/
│   │       ├── lib/          ← Prisma client (singleton)
│   │       ├── middleware/   ← JWT authentication
│   │       ├── routes/       ← auth, properties, bookings, payments
│   │       ├── services/     ← OTP (Redis), Redis client
│   │       └── socket.ts     ← Real-time chat with Socket.IO
│   └── web/                  ← Next.js Frontend
│       └── src/
│           ├── app/          ← Pages (App Router)
│           ├── components/   ← Reusable components
│           ├── lib/          ← API client, Auth context
│           └── types/        ← Shared TypeScript types
└── docker-compose.yml        ← Postgres + Redis for local development
```

---

## Running the Project Locally

### Prerequisites

- Node.js v18+
- Docker Desktop

### 1. Start the Infrastructure

```bash
docker compose up -d
# Starts PostgreSQL on port 5432 and Redis on port 6379
```

### 2. Backend API

```bash
cd app/api
cp .env.example .env          # Fill JWT_SECRET with a long random string
npm install
npx prisma generate
npx prisma db push
npm run db:seed               # Creates 6 properties and 3 test users
npm run dev                   # API runs on http://localhost:4000
```

### 3. Frontend

```bash
cd app/web
cp .env.local.example .env.local
npm install
npm run dev                   # Website runs on http://localhost:3000
```

---

## Test Accounts

All OTP codes are displayed in the API terminal (no real SMS in development mode).

| Role                    | Phone Number |
| ----------------------- | ------------ |
| Host 1 — Ahmed Ben Ali  | +21698000001 |
| Host 2 — Fatma Trabelsi | +21698000002 |
| Guest — Khaled Mansour  | +21698000003 |

---

## Complete Booking Flow

1. Guest searches for a property on `/search`
2. Selects dates on the property page `/property/:id`
3. Clicks "Book Now" → redirected to `/login` if not authenticated
4. After login, a booking is created with status `PENDING`
5. Redirected to mock payment page (dev) or Konnect payment (production)
6. After successful payment: status → `CONFIRMED`, tax invoice is automatically generated
7. Host sees the booking in their dashboard and can chat with the guest in real time

---

## Main API Endpoints

```
POST   /auth/request-otp        Request OTP code
POST   /auth/verify-otp         Verify OTP and receive JWT
GET    /auth/me                 Get current user profile
POST   /auth/become-host        Switch from GUEST to HOST role

GET    /properties              Search with filters and date availability
GET    /properties/:id          Property details
POST   /properties              Create a new listing (hosts only)

POST   /bookings                Create a booking (checks for conflicts)
GET    /bookings                List bookings (for host or guest)
GET    /bookings/stats          Host dashboard statistics
POST   /bookings/:id/confirm    Confirm a booking (host only)
POST   /bookings/:id/cancel     Cancel a booking

POST   /payments/initiate       Initiate Konnect payment
POST   /payments/webhook        Konnect webhook (automatic confirmation)
POST   /payments/dev-confirm    Simulate payment (development only)
GET    /payments/invoice/:id    Download invoice for a booking
```

---

## Frontend Pages

| URL                       | Description                      |
| ------------------------- | -------------------------------- |
| `/`                       | Homepage                         |
| `/search`                 | Search with filters              |
| `/property/:id`           | Property details & booking       |
| `/login`                  | Login with OTP                   |
| `/bookings`               | My bookings                      |
| `/booking/:id`            | Booking details + real-time chat |
| `/booking/:id/mock-pay`   | Simulated payment (dev)          |
| `/booking/:id/success`    | Payment success page             |
| `/become-host`            | Become a host                    |
| `/dashboard`              | Host dashboard                   |
| `/dashboard/property/new` | Create new listing               |

---

## Key Features

- **OTP Authentication** — Passwordless login using phone number, with rate limiting and brute-force protection
- **Availability-Based Search** — Filters out properties already booked for the selected dates (interval overlap formula)
- **Double-Booking Protection** — Conflict verification before every booking insertion
- **Real-time Chat** — Socket.IO with JWT authentication, private rooms per booking
- **Automatic Tax Invoicing** — Invoice with 19% VAT generated immediately after payment confirmation
- **Development Mode** — Simulated payments without a real Konnect account, OTP codes shown in the terminal

---

## Production Deployment

| Service     | Plateforme recommandée |
| ----------- | ---------------------- |
| Frontend    | Vercel                 |
| Backend API | Railway                |
| PostgreSQL  | Neon ou Railway        |
| Redis       | Upstash                |

Environment variables to configure in production:

- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET` — Long random string (`openssl rand -base64 64`)
- `REDIS_URL` — Redis URL with authentication
- `KONNECT_API_KEY` — Konnect API key
- `KONNECT_WALLET_ID` — Konnect wallet ID
- `KONNECT_WEBHOOK_SECRET` — Webhook signature secret
- `FRONTEND_URL` — Production frontend URL
- `API_URL` — Production API URL

---

## Built With

This project was developed step by step with a production-ready architecture:
Strict TypeScript, clean separation of routes and services, Prisma singleton, Redis-based OTP with automatic TTL, date overlap validation, and atomic transactions for payments.

Developed for the Tunisian market — Supporting local currency, local payment gateway, and automatic tax compliance.
