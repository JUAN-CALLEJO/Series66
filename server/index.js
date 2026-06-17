// Series 66 backend API — Express + JWT auth + JSON store.
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  findUserByEmail, getUser, createUser, publicUser,
  getProgress, saveProgress, addResult, getResults, saveOnboarding,
} from './db.js';
import { generateStudyPlan } from '../src/lib/planGenerator.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'series66-dev-secret-change-me';
const TOKEN_TTL = '30d';

const app = express();
app.use(cors());
app.use(express.json());

// ---------- helpers ----------
const sign = (user) => jwt.sign({ uid: user.id }, JWT_SECRET, { expiresIn: TOKEN_TTL });

function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  try {
    const { uid } = jwt.verify(token, JWT_SECRET);
    const user = getUser(uid);
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
app.post('/api/auth/register', (req, res) => {
  const { email, password, name } = req.body || {};
  if (!isEmail(email)) return res.status(400).json({ error: 'Enter a valid email address.' });
  if (!password || password.length < 6)
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  if (findUserByEmail(email)) return res.status(409).json({ error: 'An account with that email already exists.' });
  const passwordHash = bcrypt.hashSync(password, 10);
  const user = createUser({ email, name, passwordHash });
  res.json({ token: sign(user), user: publicUser(user) });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  const user = findUserByEmail(email);
  if (!user || !bcrypt.compareSync(password || '', user.passwordHash))
    return res.status(401).json({ error: 'Incorrect email or password.' });
  res.json({ token: sign(user), user: publicUser(user) });
});

app.get('/api/auth/me', auth, (req, res) => res.json({ user: publicUser(req.user) }));

// ---------- onboarding ----------
app.post('/api/onboarding/complete', auth, (req, res) => {
  const { examDate, knowledgeLevel, studyTimeHours, learningStyle } = req.body || {};
  if (!examDate || !knowledgeLevel || !studyTimeHours || !learningStyle)
    return res.status(400).json({ error: 'Missing onboarding data.' });

  const onboardingData = { examDate, knowledgeLevel, studyTimeHours, learningStyle };
  const user = saveOnboarding(req.user.id, onboardingData);
  const plan = generateStudyPlan(onboardingData);

  res.json({ user, onboardingData, plan });
});

// ---------- progress ----------
app.get('/api/progress', auth, (req, res) => res.json(getProgress(req.user.id)));
app.put('/api/progress', auth, (req, res) => {
  const { visited, missed, plan } = req.body || {};
  const patch = {};
  if (Array.isArray(visited)) patch.visited = visited;
  if (Array.isArray(missed)) patch.missed = missed;
  if (Array.isArray(plan)) patch.plan = plan;
  res.json(saveProgress(req.user.id, patch));
});

// ---------- results ----------
app.get('/api/results', auth, (req, res) => res.json(getResults(req.user.id)));
app.post('/api/results', auth, (req, res) => {
  const { score, total } = req.body || {};
  if (typeof score !== 'number' || typeof total !== 'number' || total <= 0)
    return res.status(400).json({ error: 'Invalid result payload.' });
  res.json(addResult(req.user.id, req.body));
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

app.listen(PORT, () => {
  console.log(`Series 66 API listening on http://localhost:${PORT}`);
});
