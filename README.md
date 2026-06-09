# Series 66 · Interactive Study Platform

A full study product for the **NASAA Series 66 (Uniform Combined State Law) exam**, built on
the official June 2023 test specifications. React front end + Node/Express backend with user
accounts, cloud-synced progress, full timed mock exams, and analytics.

---

## Quick start

### Full product (accounts + saved results) — recommended
```bash
npm install            # first time (root)
npm --prefix server install   # first time (backend)
npm start              # runs the web app (:3000) AND the API (:4000) together
```
Open **http://localhost:3000**, create an account, and your progress, results, and study
plan sync to the backend.

### Production (one port)
```bash
npm run build          # bundle the app into dist/
npm run serve          # backend serves the app + API at http://localhost:4000
```

### Offline / no backend
Double-click **`dist/index.html`** (after `npm run build`). It runs fully offline as a guest;
progress is saved in the browser. Accounts/sync require the backend.

---

## Features

**Learn**
- 4 official subject areas → 35 topics with key points and key-term tables
- Section flashcards (click to flip)
- Sidebar search across topics and terms

**Practice**
- **Mock Exams** — multiple full-length, *timed* simulations (100 Q / 150 min), plus a
  half-length and a 25-question diagnostic. Each is a fresh weighted draw (8 / 17 / 30 / 45)
  from a 140+ question bank, with a question navigator, submit confirmation, and full
  answer review.
- **Practice Test** — build a quiz by section and length with instant feedback.
- **Review Missed** — missed questions are saved automatically and clear once answered correctly.

**Track**
- **My Progress** — exam-readiness gauge, best/average scores, score-trend chart vs. the 73%
  pass line, and per-section mastery.
- All results and progress sync to your account (with local fallback when offline).

---

## Architecture

```
.
├─ src/                 # React app (Vite)
│  ├─ data/             # curriculum, questions (140+), mocks, study plan, exam facts
│  ├─ components/       # Dashboard, MockExams, ProgressDashboard, Quiz, Auth, …
│  ├─ context/AppData   # auth + cloud sync + local-first state
│  └─ api/client.js     # talks to the backend; degrades gracefully when offline
├─ server/              # Express API (auth, progress, results)
│  ├─ index.js          # routes + JWT auth + serves built app in production
│  ├─ db.js             # JSON-file store (swap for SQLite/Postgres later)
│  └─ data/db.json      # local user data (git-ignored)
└─ dist/                # single-file production build
```

**Backend API**: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`,
`GET|PUT /api/progress`, `GET|POST /api/results`, `GET /api/health`.

---

## Deploy to Render (public hosting)

The repo ships a `render.yaml` blueprint — one Node web service that builds the React app
and runs the API, with a persistent disk for the database and an auto-generated `JWT_SECRET`.

1. **Push to GitHub** (one-time):
   ```bash
   git remote add origin https://github.com/<you>/series66.git
   git push -u origin main
   ```
2. In **Render → New → Blueprint**, connect the repo. Render reads `render.yaml` and provisions:
   - build `npm install && npm install --prefix server && npm run build`
   - start `node server/index.js`
   - a 1 GB disk mounted at `/var/data` (`DATA_DIR`) so accounts/results persist
   - a generated `JWT_SECRET`
3. Click **Apply**. You get a public `https://series66.onrender.com` URL; add a custom domain in the dashboard.

> The persistent disk requires Render's **Starter** plan (~$7/mo). On the free plan, omit the
> `disk:` block — the app still runs, but user data resets on each redeploy/sleep.

---

## Production / sellability notes

- **Logos**: the NASAA / FINRA / SEC marks identify the standards the content aligns to. The
  app is independent and **not affiliated with or endorsed by** those bodies (disclaimer shown
  in-app). Before commercial release, confirm trademark usage with counsel or replace with
  text-only references.
- **Auth secret**: set `JWT_SECRET` (env var) in production — do not ship the dev default.
- **Database**: the JSON store is fine for local/single-user use. For multi-user production,
  swap `server/db.js` for SQLite or Postgres (the function API is already isolated).
- **Questions**: practice items are original. NASAA's actual exam questions are copyrighted and
  are not reproduced. Expand the bank in `src/data/questions.js`.
