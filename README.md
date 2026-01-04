# Flacron GameZone (Web + Backend + Mobile) — Runnable MVP

This is a **runnable MVP** implementing the core architecture described in your spec:
- **Web**: Next.js + Tailwind (public pages, auth, dashboard, admin)
- **Backend**: Node.js (Express + TypeScript) + PostgreSQL (Prisma) + Redis caching
- **Billing**: Stripe Checkout + Webhooks (subscription sync)
- **Football Data**: API-Football integration (with Redis caching + safe fallbacks)
- **AI**: Match preview/summary endpoints (OpenAI supported; fallback text if no key)
- **Mobile**: Expo (React Native) consuming the same backend

> Note: This is a complete starter you can run locally immediately. You can then extend styling and enrich pages.

---

## 1) Requirements (local)
- Node.js 18+ (recommended 20)
- Docker Desktop (for Postgres + Redis)
- pnpm (optional) or npm

---

## 2) Quick start (fastest)

### A) Start Postgres + Redis
```bash
cd flacron-gamezone
docker compose up -d postgres redis
```

### B) Backend
```bash
cd backend
cp .env.example .env
npm install
npx prisma generate
npx prisma db push
npm run dev
```
Backend runs at: http://localhost:4000

### C) Web
```bash
cd ../web
cp .env.example .env.local
npm install
npm run dev
```
Web runs at: http://localhost:3000

### D) Mobile (Expo)
```bash
cd ../mobile
cp .env.example .env
npm install
npm run start
```

---

## 3) Create an admin user
1) Sign up from the web UI (top-right).
2) In DB, promote the user to admin:

```bash
cd backend
npx prisma studio
```
Set `role` from `USER` to `ADMIN`.

---

## 4) Stripe setup (optional for running)
If you only want to “run it”, you can skip Stripe and the app still works.

To enable Stripe:
- Put keys into `backend/.env`
- Configure webhook endpoint in Stripe dashboard:
  - `POST http://localhost:4000/api/billing/webhook`
  - events: `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`
- Use Stripe CLI for local testing (recommended):
  ```bash
  stripe listen --forward-to localhost:4000/api/billing/webhook
  ```

---

## 5) Football API (optional)
Set `API_FOOTBALL_KEY` in `backend/.env`.
Without it, the app uses mock data so you can run immediately.

---

## 6) AI (optional)
Set `OPENAI_API_KEY` in `backend/.env`.
Without it, endpoints return cached placeholder text.

---

## Project structure
- `backend/` Express API + Prisma schema
- `web/` Next.js frontend (public + admin)
- `mobile/` Expo app
- `docker-compose.yml` Postgres + Redis

---

## Scripts
- Backend:
  - `npm run dev` (ts-node-dev)
  - `npm run build` / `npm start`
- Web:
  - `npm run dev` / `npm run build` / `npm start`
- Mobile:
  - `npm run start`

---

## Security note
This is an MVP starter:
- Uses JWT auth
- Basic rate limiting
- CORS configured
- Add advanced protections (WAF rules, auditing, logs) before production.
