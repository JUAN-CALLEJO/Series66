// PostgreSQL data store adapter — mirrors db.js API exactly
// Use when process.env.DATABASE_URL is set; falls back to db.js otherwise

import pkg from 'pg';
import { randomUUID } from 'node:crypto';

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Timeouts prevent hanging on connection loss
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
  max: 10, // Connection pool size
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

// ---------- Users ----------
export async function findUserByEmail(email) {
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE LOWER(email) = LOWER($1)',
      [email]
    );
    return result.rows[0] || null;
  } catch (err) {
    console.error('findUserByEmail error:', err.message);
    return null;
  }
}

export async function getUser(id) {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0] || null;
  } catch (err) {
    console.error('getUser error:', err.message);
    return null;
  }
}

export async function createUser({ email, name, passwordHash }) {
  try {
    const id = randomUUID();
    const createdAt = new Date().toISOString();
    await pool.query(
      `INSERT INTO users (id, email, name, password_hash, created_at, onboarding_completed, onboarding_data, weak_sections, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [id, email, name || email.split('@')[0], passwordHash, createdAt, false, null, '{}', createdAt]
    );
    return getUser(id);
  } catch (err) {
    console.error('createUser error:', err.message);
    return null;
  }
}

export function publicUser(u) {
  if (!u) return null;
  const { password_hash, ...rest } = u;
  return rest;
}

// ---------- Progress ----------
const DEFAULT_PROGRESS = { visited: [], missed: [], plan_version: null, actual_pace_7day_avg: null, readiness_score: null };

export async function getProgress(userId) {
  try {
    const result = await pool.query('SELECT * FROM progress WHERE user_id = $1', [userId]);
    return result.rows[0] || { ...DEFAULT_PROGRESS, user_id: userId };
  } catch (err) {
    console.error('getProgress error:', err.message);
    return { ...DEFAULT_PROGRESS, user_id: userId };
  }
}

export async function saveProgress(userId, patch) {
  try {
    const current = await getProgress(userId);
    const updated = { ...current, ...patch, updated_at: new Date().toISOString() };

    // Upsert: insert or update
    await pool.query(
      `INSERT INTO progress (user_id, visited, missed, plan_version, actual_pace_7day_avg, readiness_score, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (user_id) DO UPDATE SET
         visited = $2, missed = $3, plan_version = $4, actual_pace_7day_avg = $5, readiness_score = $6, updated_at = $7`,
      [
        userId,
        updated.visited || [],
        updated.missed || [],
        updated.plan_version || null,
        updated.actual_pace_7day_avg || null,
        updated.readiness_score || null,
        updated.updated_at,
      ]
    );

    return getProgress(userId);
  } catch (err) {
    console.error('saveProgress error:', err.message);
    return current;
  }
}

// ---------- Results ----------
export async function addResult(userId, result) {
  try {
    const id = randomUUID();
    const createdAt = new Date().toISOString();
    const pct = Math.round((result.score / result.total) * 100);
    const passed = pct >= 73;

    await pool.query(
      `INSERT INTO results (id, user_id, kind, label, score, total, pct, passed, by_section, duration_sec, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        id,
        userId,
        result.kind || 'quiz',
        result.label || 'Practice',
        result.score,
        result.total,
        pct,
        passed,
        result.bySection ? JSON.stringify(result.bySection) : null,
        result.durationSec || null,
        createdAt,
      ]
    );

    return {
      id,
      user_id: userId,
      kind: result.kind || 'quiz',
      label: result.label || 'Practice',
      score: result.score,
      total: result.total,
      pct,
      passed,
      by_section: result.bySection || {},
      duration_sec: result.durationSec || null,
      created_at: createdAt,
    };
  } catch (err) {
    console.error('addResult error:', err.message);
    return null;
  }
}

export async function getResults(userId) {
  try {
    const result = await pool.query(
      'SELECT * FROM results WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return result.rows || [];
  } catch (err) {
    console.error('getResults error:', err.message);
    return [];
  }
}

// ---------- Onboarding ----------
export async function saveOnboarding(userId, onboardingData) {
  try {
    const user = await getUser(userId);
    if (!user) return null;

    const weakSections = onboardingData.weakSections || [];
    await pool.query(
      `UPDATE users SET onboarding_completed = $1, onboarding_data = $2, weak_sections = $3, updated_at = $4 WHERE id = $5`,
      [
        true,
        JSON.stringify(onboardingData),
        weakSections,
        new Date().toISOString(),
        userId,
      ]
    );

    return publicUser(await getUser(userId));
  } catch (err) {
    console.error('saveOnboarding error:', err.message);
    return null;
  }
}

// ---------- Health check ----------
export async function health() {
  try {
    const result = await pool.query('SELECT NOW()');
    return result.rows[0] ? true : false;
  } catch (err) {
    console.error('Health check failed:', err.message);
    return false;
  }
}
