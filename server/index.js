// Series 66 backend API — Express + JWT auth + JSON/Postgres store
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateStudyPlan } from '../src/lib/planGenerator.js';

let db; // Will be set to either db.js or db-postgres.js
let findUserByEmail, getUser, createUser, publicUser, getProgress, saveProgress, addResult, getResults, saveOnboarding;

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'series66-dev-secret-change-me';
const TOKEN_TTL = '30d';

const app = express();
app.use(cors());
app.use(express.json());

// Initialize database (async)
async function initializeDatabase() {
  try {
    if (process.env.USE_POSTGRES === 'true' && process.env.DATABASE_URL) {
      console.log('🔌 Using PostgreSQL database');
      db = await import('./db-postgres.js');
    } else {
      console.log('📁 Using JSON file database');
      db = await import('./db.js');
    }

    // Destructure functions from the module
    findUserByEmail = db.findUserByEmail;
    getUser = db.getUser;
    createUser = db.createUser;
    publicUser = db.publicUser;
    getProgress = db.getProgress;
    saveProgress = db.saveProgress;
    addResult = db.addResult;
    getResults = db.getResults;
    saveOnboarding = db.saveOnboarding;

    return true;
  } catch (err) {
    console.error('❌ Failed to initialize database:', err.message);
    return false;
  }
}

// ---------- helpers ----------
const sign = (user) => jwt.sign({ uid: user.id }, JWT_SECRET, { expiresIn: TOKEN_TTL });

async function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  try {
    const { uid } = jwt.verify(token, JWT_SECRET);
    const user = await getUser(uid);
    if (!user) return res.status(401).json({ error: 'Invalid token' });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s || ''));

// ---------- health ----------
app.get('/api/health', (_req, res) => res.json({ ok: true, ts: Date.now() }));

// ---------- auth ----------
app.post('/api/auth/register', async (req, res) => {
  const { email, password, name } = req.body || {};
  if (!isEmail(email)) return res.status(400).json({ error: 'Enter a valid email address.' });
  if (!password || password.length < 6)
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });

  const existing = await findUserByEmail(email);
  if (existing) return res.status(409).json({ error: 'An account with that email already exists.' });

  const passwordHash = bcrypt.hashSync(password, 10);
  const user = await createUser({ email, name, passwordHash });
  res.json({ token: sign(user), user: publicUser(user) });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body || {};
  const user = await findUserByEmail(email);
  if (!user || !bcrypt.compareSync(password || '', user.passwordHash))
    return res.status(401).json({ error: 'Incorrect email or password.' });
  res.json({ token: sign(user), user: publicUser(user) });
});

app.get('/api/auth/me', auth, (req, res) => res.json({ user: publicUser(req.user) }));

// ---------- onboarding ----------
app.post('/api/onboarding/complete', auth, async (req, res) => {
  const { examDate, knowledgeLevel, studyTimeHours, learningStyle } = req.body || {};
  if (!examDate || !knowledgeLevel || !studyTimeHours || !learningStyle)
    return res.status(400).json({ error: 'Missing onboarding data.' });

  const onboardingData = { examDate, knowledgeLevel, studyTimeHours, learningStyle };
  const user = await saveOnboarding(req.user.id, onboardingData);
  const plan = generateStudyPlan(onboardingData);

  res.json({ user, onboardingData, plan });
});

// ---------- progress ----------
app.get('/api/progress', auth, async (req, res) => {
  const progress = await getProgress(req.user.id);
  res.json(progress);
});

app.put('/api/progress', auth, async (req, res) => {
  const { visited, missed, plan } = req.body || {};
  const patch = {};
  if (Array.isArray(visited)) patch.visited = visited;
  if (Array.isArray(missed)) patch.missed = missed;
  if (Array.isArray(plan)) patch.plan = plan;
  const progress = await saveProgress(req.user.id, patch);
  res.json(progress);
});

// ---------- results ----------
app.get('/api/results', auth, async (req, res) => {
  const results = await getResults(req.user.id);
  res.json(results);
});

app.post('/api/results', auth, async (req, res) => {
  const { score, total } = req.body || {};
  if (typeof score !== 'number' || typeof total !== 'number' || total <= 0)
    return res.status(400).json({ error: 'Invalid result payload.' });
  const result = await addResult(req.user.id, req.body);
  res.json(result);
});

// ---------- readiness ----------
app.get('/api/progress/readiness', auth, async (req, res) => {
  const results = await getResults(req.user.id);
  const user = await getUser(req.user.id);

  // Calculate weighted readiness score from last 5 quizzes
  const recent = results.slice(0, 5);
  if (recent.length === 0) {
    return res.json({ score: 0, forecast: 'no_data', message: 'Take a quiz to see your readiness' });
  }

  const weights = [0.35, 0.25, 0.20, 0.12, 0.08];
  let weightedSum = 0;
  let weightSum = 0;

  for (let i = 0; i < recent.length; i++) {
    const pct = recent[i].pct || 0;
    const weight = weights[i] || 0;
    weightedSum += pct * weight;
    weightSum += weight;
  }

  const readinessScore = Math.round(weightedSum / weightSum);

  // Determine forecast
  let forecast = 'at_risk';
  if (readinessScore >= 73) forecast = 'likely_pass';
  else if (readinessScore >= 65) forecast = 'on_track';
  else if (readinessScore >= 55) forecast = 'needs_improvement';

  // Days remaining
  const examDate = user?.onboardingData?.examDate ? new Date(user.onboardingData.examDate) : null;
  const daysRemaining = examDate ? Math.floor((examDate - new Date()) / (1000 * 60 * 60 * 24)) : 0;

  res.json({
    score: readinessScore,
    forecast,
    daysRemaining,
    totalQuizzes: results.length,
    lastQuizDate: recent[0]?.created_at || null,
  });
});

// ---------- serve built frontend (production) ----------
const distDir = join(__dirname, '..', 'dist');
if (existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    res.sendFile(join(distDir, 'index.html'));
  });
}

// Start server after database is initialized
initializeDatabase().then((success) => {
  if (!success) {
    console.error('Failed to initialize database. Exiting.');
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`✅ Series 66 API listening on http://localhost:${PORT}`);
  });
}).catch((err) => {
  console.error('Initialization error:', err);
  process.exit(1);
});
