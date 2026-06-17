# Series 66 v1.0 Launch Guide

**Status:** Production-ready for testing on Railway  
**Version:** 1.0.0  
**Last Updated:** 2026-06-16

---

## 🚀 Quick Start (5 min)

Your app is ready to launch on Railway. Follow these steps:

### Step 1: Deploy to Railway
```bash
# The app automatically deploys when you push to GitHub
# Code is already at: https://github.com/JUAN-CALLEJO/Series66
# Just make sure main branch is up to date:
git push origin main

# Then go to Railway dashboard and link your GitHub repo:
# https://railway.app/dashboard
```

### Step 2: Configure Environment
In Railway dashboard, set these environment variables:

```
PORT=4000
JWT_SECRET=your-secure-random-string-here-change-this
NODE_ENV=production
```

**Optional (for PostgreSQL):**
```
USE_POSTGRES=true
DATABASE_URL=<Railway will auto-populate this when you add Postgres service>
```

### Step 3: Test Your Deployment
After Railway deploys:

```
1. Visit: https://your-app.railway.app
2. Register new account: test@example.com / password123
3. Complete onboarding (select exam date 30 days out)
4. Take a practice quiz
5. Check readiness score appears on dashboard
```

---

## ✅ Launch Checklist

### Pre-Launch (Do These First)

- [ ] **Verify all features work locally:**
  ```bash
  npm install && npm run build && npm run dev
  ```

- [ ] **Test complete user flow:**
  - [ ] Register new account
  - [ ] See onboarding wizard
  - [ ] Complete 4-step onboarding
  - [ ] See personalized study plan
  - [ ] Take a quiz (5-10 questions)
  - [ ] See progress update
  - [ ] See readiness score on dashboard

- [ ] **Test offline mode:**
  - [ ] Open DevTools → Network → toggle "Offline"
  - [ ] Take a quiz while offline
  - [ ] Go back online
  - [ ] Verify quiz saved to server

- [ ] **Test multiple browsers:**
  - [ ] Chrome ✓
  - [ ] Firefox ✓
  - [ ] Safari (iOS) ✓
  - [ ] Edge ✓

- [ ] **Check console:**
  - [ ] No red errors (warnings OK)
  - [ ] No 404s for static assets
  - [ ] API calls return correct status codes

### Deployment (On Railway)

- [ ] **Set JWT_SECRET** to a secure random string (don't use default)
  ```bash
  # Generate one:
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```

- [ ] **Optional: Enable PostgreSQL for production**
  - [ ] Add Postgres service in Railway
  - [ ] Set `USE_POSTGRES=true`
  - [ ] Run migration script (if you have existing users)

- [ ] **Verify deployment:**
  - [ ] App deploys without errors (check Railway logs)
  - [ ] Live URL is accessible
  - [ ] HTTPS is working

- [ ] **Test production:**
  - [ ] Register on live site
  - [ ] Complete onboarding
  - [ ] Take a quiz
  - [ ] Check data persists after page reload
  - [ ] Check readiness dashboard works

### Post-Launch Monitoring

- [ ] **Check Railway logs daily** (watch for errors)
  ```
  Railway Dashboard → Logs tab → filter by "error"
  ```

- [ ] **Monitor user registrations:**
  - If using JSON: check `server/data/db.json` file size
  - If using Postgres: check row counts

- [ ] **Test new signups** work end-to-end

- [ ] **Back up user data weekly:**
  ```bash
  # For JSON:
  scp user@railway.app:/app/server/data/db.json ./backups/db-$(date +%Y%m%d).json
  
  # For Postgres:
  # Use Railway dashboard to export data
  ```

---

## 🔧 Environment Variables

### Required
```
JWT_SECRET      # Random secure string, 32+ chars
                # Generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
PORT            # 4000 (Railway will override)
```

### Optional
```
NODE_ENV        # "production" (default: "development")
USE_POSTGRES    # "true" to use Postgres (default: false, use JSON)
DATABASE_URL    # Auto-populated by Railway if Postgres service added
```

---

## 📊 Feature Overview (What's Live)

### Authentication ✅
- Email/password registration with bcrypt hashing
- JWT tokens (30-day TTL)
- Persistent login across sessions
- Offline mode with sync when online

### Onboarding ✅
- 4-step questionnaire (exam date, knowledge level, study time, learning style)
- Automatically shows for new users
- Skippable for existing users
- Stores personalization data

### Personalized Study Plan ✅
- Auto-generates daily schedule based on exam date
- Accounts for knowledge level (faster for advanced, slower for beginners)
- 342 questions total across 4 sections
- Daily targets: 5-12 questions depending on pace

### Study Features ✅
- 342 practice questions across 4 sections
- Multiple choice with explanations
- Practice quizzes with custom scoping
- Missed questions review
- Mock exams (full-length)
- Flashcards by section

### Progress Tracking ✅
- Quiz results stored (score, time, by section)
- Visited topics tracked
- Missed questions collected
- Progress dashboard

### Readiness Scoring ✅
- Weighted score from last 5 quizzes
- Forecast: "likely to pass" / "on track" / "at risk"
- Days remaining to exam
- Trend analysis (improving/declining/stable)
- Color-coded status badge

### Data Storage ✅
- Default: JSON file (`server/data/db.json`) — zero setup
- Optional: PostgreSQL — for production scale
- LocalStorage fallback — works offline
- Automatic sync when online

---

## 🚨 Known Limitations (v1.0)

- **No user email verification** — anyone can sign up with any email
- **No password reset** — users can't recover lost passwords (v1.1 feature)
- **No analytics** — can't see usage data (v1.1 feature)
- **No dark mode toggle** — dark theme only (v1.1 feature)
- **No mobile app** — web-only (v1.1 as PWA)
- **Pass score: 73/100** — hardcoded, not configurable

---

## 📈 Scaling (If You Get Popular)

### Current Capacity
- **JSON storage:** Safe for ~100 users before perf degrades
- **Railway free tier:** Unlimited bandwidth, auto-scales compute

### How to Scale
1. **Add PostgreSQL** (Week 3 infrastructure already in place)
   - Run migration script: `node server/scripts/migrate-json-to-postgres.js`
   - Set `USE_POSTGRES=true` in Railway
   - Keep JSON as backup 1 week, then delete

2. **Add caching** (Redis, v1.1)
   - Cache quiz results, readiness scores
   - Reduces database queries by 50%+

3. **Split database** (v1.2)
   - One DB for users, one for results
   - Allows independent scaling

---

## 🐛 Troubleshooting

### "App not loading"
```bash
# Check Railway logs:
# → Logs tab → search for "error"

# Common fixes:
# 1. Node version mismatch
#    → Check package.json "engines" field
#    → Set NODE_VERSION=22.16.0 in Railway env vars

# 2. Port conflict
#    → Set PORT=4000 in Railway env vars

# 3. Build failed
#    → Check build logs in Railway dashboard
#    → Try: npm run build locally to debug
```

### "Login fails"
```bash
# Check backend is running:
curl https://your-app.railway.app/api/health
# Should return: { "ok": true, "ts": 1718536000000 }

# If it doesn't:
# → App may be crashed, check Railway logs
```

### "Progress not saving"
```bash
# If using JSON:
# → Check server can write to disk
#    ssh into Railway, run: ls -la server/data/
#    → db.json should exist and be >100 bytes

# If using Postgres:
# → Check DATABASE_URL is set
# → Check Postgres service is running in Railway
```

### "Quiz results disappear after reload"
```bash
# This means offline sync failed
# → Check network tab in DevTools
# → Is /api/results returning 200?
# → Check authentication token is valid
```

---

## 📝 Deployment Commands

### Local Testing
```bash
# Install dependencies
npm install && npm --prefix server install

# Build frontend
npm run build

# Run locally
npm run dev
# Visit: http://localhost:5173

# Backend runs on: http://localhost:4000
```

### Deploy to Railway
```bash
# Push code to GitHub (Railway auto-deploys)
git add -A
git commit -m "Your message"
git push origin main

# Check Railway logs to confirm deployment
# If successful: Railway shows green checkmark
```

### Migrate to PostgreSQL (if needed)
```bash
# 1. Add Postgres service in Railway dashboard
# 2. Copy DATABASE_URL from Railway env vars
# 3. Run migration locally or on Railway:
DATABASE_URL=postgres://... node server/scripts/migrate-json-to-postgres.js

# 4. Set USE_POSTGRES=true in Railway env vars
# 5. Redeploy
git push origin main
```

---

## 📞 Support

### Common Questions

**Q: How do I add more questions?**  
A: Questions are in `src/data/questions.js`. Add more objects to the array and restart.

**Q: How do I change the pass score (73)?**  
A: Edit `server/db.js` line where it says `const passed = pct >= 73`

**Q: Can I add users manually?**  
A: Not in v1.0 (no admin panel yet). Users must register themselves.

**Q: How do I email users?**  
A: Email is a v1.1 feature. No SMTP setup yet.

**Q: What if the database gets corrupted?**  
A: Restore from backup: `cp backups/db-20260615.json server/data/db.json`

---

## ✨ Next Steps (v1.1 Roadmap)

- [ ] Password reset flow
- [ ] Email notifications (exam reminder, low readiness alert)
- [ ] Dark mode toggle
- [ ] Full WCAG 2.1 AA accessibility
- [ ] Stripe payment integration
- [ ] Admin panel (edit questions, view user stats)
- [ ] PWA (installable app)
- [ ] Browser notifications
- [ ] User referral program

---

## 🎉 You're Ready!

Your Series 66 platform is production-ready. Here's the launch sequence:

1. **Verify locally** (run checklist above) — 15 min
2. **Deploy to Railway** — 2 min (auto-deploys on push)
3. **Test live** — register and take a quiz — 5 min
4. **Share with beta testers** — get feedback
5. **Monitor logs** — watch for errors

**Total launch time: ~30 minutes**

Good luck! 🚀
