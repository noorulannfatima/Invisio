# Invisio

Finance and inventory management platform — companies, parties, items, transactions (invoices/bills), expenses, reports, and an optional AI chat assistant.

**Stack:** Vue 3 + TypeScript (Vite), Express, PostgreSQL, Sequelize, JWT (HTTP-only cookies), Pinia.

---

## Prerequisites

Install on a fresh machine:

| Tool | Version |
|------|---------|
| [Node.js](https://nodejs.org/) | 18+ recommended |
| [PostgreSQL](https://www.postgresql.org/) | 14+ (running locally) |
| `psql` / `createdb` | On your `PATH` (comes with Postgres) |

Optional: [Google AI Studio](https://aistudio.google.com/apikey) API key — only for **Invisio Brain** (`/api/ai/chat`). The rest of the app works without it.

---

## Quick start

### 1. Clone and install dependencies

```bash
git clone <your-repo-url>
cd Invisio

cd backend && npm install
cd ../frontend && npm install
```

### 2. Environment files

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Edit `backend/.env`:

- `DB_USER` / `DB_PASSWORD` — your Postgres role
- `DB_NAME` — database name (default `Invisio`)
- `JWT_SECRET` — any long random string for local dev
- `GEMINI_API_KEY` — optional; leave dummy value if you skip AI chat

`frontend/.env` defaults to `VITE_API_URL=http://localhost:3000/api` (must match backend `PORT`).

### 3. Create database and schema

```bash
cd backend

# Create empty database (pick one)
createdb Invisio
# or: npx sequelize-cli db:create

npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
```

### 4. Run the app

**Terminal 1 — API**

```bash
cd backend
npm run dev
```

Server: `http://localhost:3000` (or whatever `PORT` is in `.env`).

**Terminal 2 — UI**

```bash
cd frontend
npm run dev
```

App: `http://localhost:5173`

### 5. Log in (seeded demo users)

After `db:seed:all`, example accounts:

| Username | Password |
|----------|----------|
| `john_doe` | `password123` |
| `jane_smith` | `password456` |

---

## One-liner summary (after setup)

With Postgres running, env files in place, and DB migrated/seeded:

```bash
(cd backend && npm run dev) & (cd frontend && npm run dev)
```

Then open `http://localhost:5173`.

---

## Project layout

```
Invisio/
├── backend/          # Express API, Sequelize models/migrations
├── frontend/         # Vue 3 + Vite SPA
├── ANSWERS.md        # Assessment-style reflection (see note inside)
└── README.md
```

---

## API overview

| Area | Base path |
|------|-----------|
| Auth | `/api/auth` |
| Company | `/api/company` |
| Parties | `/api/party` |
| Items | `/api/item` |
| Transactions | `/api/transaction` |
| Expenses | `/api/expense` |
| Reports | `/api/reports` |
| Settings | `/api/settings` |
| AI chat (optional) | `/api/ai/chat` |

Health check: `GET http://localhost:3000/status`

---

## Troubleshooting

**Database connection failed**

- Confirm Postgres is running: `pg_isready`
- Check `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` in `backend/.env`
- Ensure the database exists: `createdb Invisio` or `npx sequelize-cli db:create`

**Frontend cannot reach API**

- Backend must be on the same port as `VITE_API_URL` (default `3000`)
- CORS is configured for `http://localhost:5173` in `backend/app.js`

**AI chat errors**

- Set a valid `GEMINI_API_KEY` in `backend/.env`, or ignore Brain and use the rest of the app

**Reseed / reset database**

```bash
cd backend
npx sequelize-cli db:migrate:undo:all
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
```

---

## Screenshot 

---

## Scripts reference

| Location | Command | Purpose |
|----------|---------|---------|
| `backend/` | `npm run dev` | API with nodemon |
| `backend/` | `npm start` | API without nodemon |
| `frontend/` | `npm run dev` | Vite dev server |
| `frontend/` | `npm run dev:demo` | UI only — mock API, no backend |
| `frontend/` | `npm run build` | Production build |
| `frontend/` | `npm run test:run` | Vitest |
