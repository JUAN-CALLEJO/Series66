# Series 66 Study Platform

An interactive study tool for the **NASAA Series 66 exam** with timed mock exams, progress tracking, and user accounts.

## Quick Start

### Local Development
```bash
npm install && npm --prefix server install
npm start              # runs web app (:3000) + API (:4000)
```
Open **http://localhost:3000**, create an account, and study.

### Production Build
```bash
npm run build          # single-file HTML in dist/
node server/index.js   # serves the app + API
```

---

## Features

- **311 original practice questions** (Sections I–IV) with weighted mock exams matching the official exam structure (8/17/30/45).
- **Timed mock exams** — full-length (100 Q / 150 min), half-length, and diagnostic variants.
- **Account system** — register, login, and sync progress and results to the backend.
- **Progress dashboard** — readiness gauge, score trends, and per-section mastery.
- **Offline fallback** — works offline with local storage; syncs when reconnected.

---

## Architecture

```
.
├─ src/                    # React app (Vite)
│  ├─ components/          # Dashboard, MockExams, Quiz, Auth, etc.
│  ├─ context/AppData.jsx  # auth + cloud sync + local-first state
│  ├─ api/client.js        # HTTP client
│  ├─ data/                # curriculum, questions, mocks
│  └─ hooks/               # local storage, utilities
├─ server/                 # Express API
│  ├─ index.js             # routes + JWT auth + serves built app
│  ├─ db.js                # JSON-file data store
│  └─ data/db.json         # user accounts & results (persisted)
└─ dist/                   # production build (single HTML file)
```

**API endpoints:** `/api/auth/*` (register, login, me), `/api/progress` (GET/PUT), `/api/results` (GET/POST), `/api/health`.

---

## Deploy to Render

1. **Push to GitHub:**
   ```bash
   git remote add origin https://github.com/<you>/series66.git
   git push -u origin main
   ```

2. **On Render** → New → Blueprint, connect the repo. Render reads `render.yaml` and provisions a Node service with a persistent disk for user data and an auto-generated JWT secret.

3. Your app is live at `https://series66.onrender.com`.

(Requires Render's Starter plan ~$7/mo for persistent storage; omit the `disk:` block in `render.yaml` for free tier, but user data will reset on redeploy.)

---

## Configuration

- **JWT_SECRET** — set in production (Render auto-generates via `render.yaml`). Never commit a real secret to the repo.
- **DATA_DIR** — path where the database lives. Defaults to `./server/data`; set to `/var/data` on Render (mounted persistent disk).
- **PORT** — Express listens on the port assigned by the hosting platform (or defaults to 4000 locally).

---

## Development Notes

- All user data is stored in `server/data/db.json` (git-ignored). For production, swap the JSON store in `server/db.js` for a proper database (SQLite, Postgres, etc.).
- Questions are original; NASAA's exam questions are copyrighted.
- The app uses the real Series 66 exam structure and 2026 tax/regulatory figures (verified from IRS.gov, SEC).
- Before commercial release, verify trademark usage (NASAA/FINRA/SEC logos) with legal counsel.
