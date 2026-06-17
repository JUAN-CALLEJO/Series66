# Railway Deployment Guide for Series 66

Quick step-by-step to deploy your Series 66 platform on Railway.

## Prerequisites
- GitHub account (code is at https://github.com/JUAN-CALLEJO/Series66)
- Railway account (free, sign up at https://railway.app)

## Deployment Steps

### 1. Connect GitHub to Railway (2 min)

1. Go to https://railway.app/dashboard
2. Click **+ New Project** → **Deploy from GitHub repo**
3. Select **JUAN-CALLEJO/Series66**
4. Click **Deploy**

Railway will:
- Auto-detect Node.js
- Run `npm install && npm run build`
- Start with `npm start`

### 2. Set Environment Variables (1 min)

While Railway deploys, set these vars in the dashboard:

**Variables tab → Add variable:**

| Key | Value |
|-----|-------|
| `JWT_SECRET` | Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `NODE_ENV` | `production` |

Railway auto-provides:
- `PORT` (usually 3000 or 4000)
- `DATABASE_URL` (only if you add Postgres)

### 3. Wait for Deployment (3-5 min)

Watch the **Deployments** tab:
- 🟡 Building → ⏳ Deploying → ✅ Live

When it shows **✅ Live**, click the URL to visit your app.

### 4. Test Your App (5 min)

At your railway app URL:

```
1. Register: test@example.com / password123
2. Complete onboarding (set exam date 30 days out)
3. Take a quiz (Practice → Build a Test → Section I)
4. Check dashboard shows readiness score
5. Close browser, reopen → check you're still logged in
```

**All working?** 🎉 You're live!

---

## Optional: Enable PostgreSQL (5 min)

For production data, add a database:

1. **In Railway dashboard:**
   - Click **+ Add service** → **Postgres**
   - Wait for it to provision (2-3 min)
   - Railway auto-sets `DATABASE_URL` env var

2. **In your app settings:**
   - Add env var: `USE_POSTGRES` = `true`
   - Redeploy (auto-redeploys on env change)

3. **Migrate existing data** (if you have users):
   ```bash
   # Locally (from your computer):
   DATABASE_URL="<copy from Railway>" \
   node server/scripts/migrate-json-to-postgres.js
   
   # Or on Railway via CLI:
   railway shell
   npm --prefix server install
   DATABASE_URL=$DATABASE_URL node server/scripts/migrate-json-to-postgres.js
   ```

Done! Your data is now persistent across redeploys.

---

## Troubleshooting

### App won't deploy
→ Check **Deployments** tab for error logs  
→ Common: Node version issue, try setting `NODE_VERSION=22.16.0` as env var

### App crashes after deploy
→ Railway dashboard → **Logs** tab  
→ Search for "error" or "Error"  
→ Check if `PORT` env var is set (Railway sets it automatically)

### Registration works but login fails
→ Check `JWT_SECRET` is set (not empty)  
→ Try logout and login again  
→ Check browser console (F12) for error messages

### Quizzes save but data disappears after reload
→ If using JSON: data should persist (check `/var/data/db.json` size)  
→ If using Postgres: check `USE_POSTGRES=true` is set  
→ Check `/api/health` returns `{ "ok": true }`

---

## Monitoring After Launch

### Daily Check
- Open your Railway dashboard
- Check **Logs** tab for any errors (filter: "error")
- Make sure **Status** shows ✅ Live

### Weekly Backup (JSON mode)
```bash
# Download your user database:
railway shell
cat /var/data/db.json > backup.json
# Then scp it locally
```

### Scale if Needed
- User count <100: JSON storage is fine
- User count >100: Switch to PostgreSQL (follow steps above)

---

## Environment Variables Reference

| Variable | Default | Purpose |
|----------|---------|---------|
| `JWT_SECRET` | none | **REQUIRED** — Session token secret |
| `NODE_ENV` | development | Set to `production` for live |
| `PORT` | auto | Railway assigns, don't change |
| `USE_POSTGRES` | false | Set `true` to use database |
| `DATABASE_URL` | none | Auto-set by Railway if Postgres added |

---

## Success Indicators ✅

Once deployed, verify:

- [ ] App loads at your Railway URL
- [ ] Can register new account
- [ ] Onboarding wizard appears
- [ ] Can select exam date + study time
- [ ] Study plan generates with 30+ days
- [ ] Can take a quiz
- [ ] Quiz results save
- [ ] Readiness score appears on dashboard
- [ ] Can logout and log back in
- [ ] Browser session persists after reload

All green? You're production-ready! 🚀

---

## Next: Make Money 💰

Once live, you can:

1. **Add payment** (Stripe) → charge for access
2. **Share URL** → get beta testers
3. **Collect feedback** → iterate
4. **Launch v1.1** → add more features

See `LAUNCH.md` for full roadmap.

Good luck! 🎉
