// Lightweight JSON-file data store (no native deps — Windows-safe).
// Clean function API so it can be swapped for SQLite/Postgres later.
import { readFileSync, writeFileSync, existsSync, renameSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
// DATA_DIR lets the store live on a persistent disk in production
// (e.g. Render disk mounted at /var/data). Falls back to ./data locally.
const DATA_DIR = process.env.DATA_DIR || join(__dirname, 'data');
const DB_FILE = join(DATA_DIR, 'db.json');

const EMPTY = { users: [], progress: {}, results: [] };

function load() {
  try {
    if (!existsSync(DB_FILE)) return structuredClone(EMPTY);
    return { ...structuredClone(EMPTY), ...JSON.parse(readFileSync(DB_FILE, 'utf8')) };
  } catch {
    return structuredClone(EMPTY);
  }
}

let cache = load();

function persist() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  const tmp = DB_FILE + '.tmp';
  writeFileSync(tmp, JSON.stringify(cache, null, 2));
  renameSync(tmp, DB_FILE); // atomic-ish swap
}

// ---------- Users ----------
export function findUserByEmail(email) {
  return cache.users.find((u) => u.email.toLowerCase() === String(email).toLowerCase()) || null;
}
export function getUser(id) {
  return cache.users.find((u) => u.id === id) || null;
}
export function createUser({ email, name, passwordHash }) {
  const user = {
    id: randomUUID(),
    email,
    name: name || email.split('@')[0],
    passwordHash,
    createdAt: new Date().toISOString(),
  };
  cache.users.push(user);
  persist();
  return user;
}
export function publicUser(u) {
  if (!u) return null;
  const { passwordHash, ...rest } = u;
  return rest;
}

// ---------- Progress (per user) ----------
const DEFAULT_PROGRESS = { visited: [], missed: [], plan: [] };
export function getProgress(userId) {
  return { ...DEFAULT_PROGRESS, ...(cache.progress[userId] || {}) };
}
export function saveProgress(userId, patch) {
  const cur = getProgress(userId);
  cache.progress[userId] = {
    ...cur,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  persist();
  return getProgress(userId);
}

// ---------- Results (exam/quiz attempts) ----------
export function addResult(userId, result) {
  const row = {
    id: randomUUID(),
    userId,
    kind: result.kind || 'quiz', // 'mock' | 'quiz' | 'section'
    label: result.label || 'Practice',
    score: result.score,
    total: result.total,
    pct: Math.round((result.score / result.total) * 100),
    passed: Math.round((result.score / result.total) * 100) >= 73,
    bySection: result.bySection || {},
    durationSec: result.durationSec ?? null,
    createdAt: new Date().toISOString(),
  };
  cache.results.push(row);
  persist();
  return row;
}
export function getResults(userId) {
  return cache.results
    .filter((r) => r.userId === userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}
