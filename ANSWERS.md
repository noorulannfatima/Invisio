# ANSWERS.md

## 1. How to run

Give the exact command(s) or steps to run your project on a fresh machine. If anything needs installing, list it.

### Install

- **Node.js** 18+
- **PostgreSQL** 14+ (`psql`, `createdb` on PATH)

### Steps

```bash
git clone <repo-url> && cd Invisio

cd backend && npm install && cp .env.example .env
cd ../frontend && npm install && cp .env.example .env

# Edit backend/.env — DB_USER, DB_PASSWORD, JWT_SECRET at minimum

cd ../backend
createdb Invisio          # or: npx sequelize-cli db:create
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all

# Terminal 1
npm run dev

# Terminal 2
cd ../frontend && npm run dev
```

Open **http://localhost:5173**. Log in with seeded user `john_doe` / `password123`.

**API keys:** None required for core features. Optional `GEMINI_API_KEY` in `backend/.env` for AI chat — get one from [Google AI Studio](https://aistudio.google.com/apikey). Do not commit `.env`.

Full detail: see [README.md](./README.md).

---

## 2. Stack choice

Why did you pick this stack/language/framework for this task? What would have been a worse choice and why?

**Why this stack for Invisio**

- **Vue 3 + TypeScript + Vite** — component-based UI fits many forms (invoices, parties, expenses) and dashboards; Vite gives fast local dev.
- **Express + Sequelize + PostgreSQL** — relational data (users, companies, transactions, line items) maps naturally to SQL; Sequelize migrations keep schema versioned.
- **JWT in HTTP-only cookies** — browser SPA can stay authenticated without storing tokens in `localStorage`.

**Worse choices for *this* product**

- **SQLite only** — fine for a demo, weaker for concurrent multi-user business data and reporting at scale.
- **NoSQL alone** — transaction headers + line items + party links are inherently relational; forcing document models adds complexity.
- **Next.js full-stack for everything** — workable, but this app is mostly a private CRUD API + SPA; a separate Express API was a straightforward split.

**For the upcoming Public API Consumer project**, a smaller scope (CLI or single-purpose web page + one public API) would be a **better** choice than reusing this full monolith.

---

## 3. One real edge case

Describe one specific edge case your code handles correctly. Point to the file and line number. Explain what would happen without that handling.

**Case:** Access token is present but **expired** or **cryptographically invalid** (tampered signature).

**Location:** `backend/middleware/authMiddleware.js`, lines **42–47**.

```javascript
if (error.name === "TokenExpiredError") {
    return res.status(401).json({ message: "Unauthorized - Access token expired" });
}
if (error.name === "JsonWebTokenError") {
     return res.status(401).json({ message: "Unauthorized - Invalid access token signature" });
}
```

**What it does:** `jwt.verify()` throws named errors. The middleware maps `TokenExpiredError` and `JsonWebTokenError` to clear **401** responses instead of falling through to a generic failure path.

**Without this handling:** Expired and malformed tokens could hit the outer `catch` and return a vague `"Authentication failed"` message, or an unhandled throw could produce **500** responses. The client could not tell **refresh** vs **re-login** vs **corrupt cookie**, and protected routes would behave inconsistently.

---

## 4. AI usage

List every place you used AI (which tool, what you asked, what it gave you). For at least one of these, describe something you changed about the AI output and why.

| Tool | What I asked | What it gave | What I changed |
|------|----------------|--------------|----------------|
| **Cursor (Agent)** | Restore lost `backend/.env` with dummy values | Draft `.env` aligned with `config.json` and code (`JWT_SECRET`, `DB_*`, `GEMINI_API_KEY`) | Set `PORT=3000` to match frontend hardcoded API URLs; kept Postgres user from existing `config.json` |
| **Cursor (Agent)** | Add frontend env, `.env.example`, and DB setup guidance | `frontend/.env`, `.env.example`, `backend/.env.example`, `.sequelizerc` | Added `frontend/.gitignore` entries for `.env` so secrets are not committed |
| **Cursor (Agent)** | Whether Invisio fits “Public API Consumer” assessment | Honest gap analysis vs rubric | Decided **not** to submit this repo for that variant; plan separate project |
| **Cursor (Agent)** | Add `README.md` and `ANSWERS.md` | Structured runbook and assessment-style answers | Rewrote for **Invisio** truthfully (not pretending to be an API-consumer-only app); added note that assessment submission will be a different repo |

**Example change (env):** AI suggested a generic `PORT=5000` from `app.js` default; I changed it to **3000** because most frontend stores still call `http://localhost:3000/api` — matching reality avoids a broken fresh clone.

**Example change (ANSWERS):** AI draft assumed a public-API-first narrative; I kept answers **accurate to Invisio** and flagged that the assessment variant needs a new codebase.

---

## 5. Honest gap

What's one thing in your submission that isn't good enough, and what would you do to fix it with another day?

**Gap (this repo vs Public API Consumer brief):** Invisio is a **private full-stack business app**, not a tool built around a **free public REST API**. External API usage is limited to optional **Gemini** behind our own route (`backend/routes/ai.js`), with no timeouts, no structured handling of rate limits, and no “useful beyond the provider’s website” story aimed at assessors.

**With another day I would:**

1. **For assessment:** Start a **small dedicated repo** (e.g. REST Countries or OpenWeather CLI/UI) with explicit timeout, error mapping, and input validation — and point question 3 at that code.
2. **For Invisio:** Centralize all frontend API URLs on `VITE_API_URL` (many stores still hardcode `localhost:3000`), add request timeouts on `fetch`/axios, and document a single `docker compose` or script so Postgres + migrate + dev servers run without manual steps.

---

*Last updated: May 2026*
