#!/usr/bin/env node

// One-time migration script: JSON (db.json) → PostgreSQL
// Usage: DATABASE_URL=postgres://... node server/scripts/migrate-json-to-postgres.js

import fs from 'node:fs';
import path from 'node:path';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import pkg from 'pg';

const { Pool } = pkg;

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_FILE = path.join(__dirname, '..', 'data', 'db.json');

if (!process.env.DATABASE_URL) {
  console.error('❌ Error: DATABASE_URL environment variable not set');
  console.error('Usage: DATABASE_URL=postgres://user:pass@host/db node server/scripts/migrate-json-to-postgres.js');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 5000,
});

async function migrate() {
  try {
    console.log('📦 Loading JSON data...');
    if (!fs.existsSync(DB_FILE)) {
      console.error(`❌ Error: ${DB_FILE} not found`);
      process.exit(1);
    }

    const json = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    const { users = [], progress = {}, results = [] } = json;

    console.log(`📋 Found: ${users.length} users, ${Object.keys(progress).length} progress entries, ${results.length} results`);

    // Test connection
    console.log('🔌 Testing database connection...');
    const testResult = await pool.query('SELECT NOW()');
    if (!testResult.rows[0]) throw new Error('Connection test failed');
    console.log('✓ Database connected');

    // Migrate users
    console.log('👥 Migrating users...');
    for (const user of users) {
      await pool.query(
        `INSERT INTO users (id, email, name, password_hash, created_at, onboarding_completed, onboarding_data, weak_sections, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (id) DO NOTHING`,
        [
          user.id,
          user.email,
          user.name,
          user.passwordHash,
          user.createdAt,
          user.onboardingCompleted || false,
          user.onboardingData ? JSON.stringify(user.onboardingData) : null,
          user.weakSections || [],
          user.updatedAt || user.createdAt,
        ]
      );
    }
    console.log(`✓ Migrated ${users.length} users`);

    // Migrate progress
    console.log('📊 Migrating progress...');
    for (const [userId, prog] of Object.entries(progress)) {
      await pool.query(
        `INSERT INTO progress (user_id, visited, missed, plan_version, actual_pace_7day_avg, readiness_score, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (user_id) DO NOTHING`,
        [
          userId,
          prog.visited || [],
          prog.missed || [],
          prog.plan_version || null,
          prog.actual_pace_7day_avg || null,
          prog.readiness_score || null,
          prog.updatedAt || new Date().toISOString(),
        ]
      );
    }
    console.log(`✓ Migrated ${Object.keys(progress).length} progress entries`);

    // Migrate results
    console.log('🏆 Migrating results...');
    for (const result of results) {
      await pool.query(
        `INSERT INTO results (id, user_id, kind, label, score, total, pct, passed, by_section, duration_sec, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         ON CONFLICT (id) DO NOTHING`,
        [
          result.id,
          result.userId,
          result.kind,
          result.label,
          result.score,
          result.total,
          result.pct,
          result.passed,
          result.bySection ? JSON.stringify(result.bySection) : null,
          result.durationSec || null,
          result.createdAt,
        ]
      );
    }
    console.log(`✓ Migrated ${results.length} results`);

    // Verify counts
    console.log('\n🔍 Verifying migration...');
    const userCount = await pool.query('SELECT COUNT(*) FROM users');
    const progressCount = await pool.query('SELECT COUNT(*) FROM progress');
    const resultsCount = await pool.query('SELECT COUNT(*) FROM results');

    console.log(`  Users: ${userCount.rows[0].count} (expected: ${users.length})`);
    console.log(`  Progress: ${progressCount.rows[0].count} (expected: ${Object.keys(progress).length})`);
    console.log(`  Results: ${resultsCount.rows[0].count} (expected: ${results.length})`);

    if (
      parseInt(userCount.rows[0].count) === users.length &&
      parseInt(progressCount.rows[0].count) === Object.keys(progress).length &&
      parseInt(resultsCount.rows[0].count) === results.length
    ) {
      console.log('\n✅ Migration complete! All data verified.');
      console.log('\n📝 Next steps:');
      console.log('  1. Enable Postgres in production: set USE_POSTGRES=true');
      console.log('  2. Keep JSON backup for 1 week as fallback');
      console.log('  3. Monitor logs for any sync issues');
    } else {
      throw new Error('Counts do not match - migration may be incomplete');
    }
  } catch (err) {
    console.error('\n❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
