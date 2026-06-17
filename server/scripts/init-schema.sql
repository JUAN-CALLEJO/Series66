-- Series 66 PostgreSQL Schema
-- Persistent data store for users, progress, and results

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  onboarding_completed BOOLEAN DEFAULT FALSE,
  onboarding_data JSONB,
  weak_sections TEXT[] DEFAULT '{}',
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS progress (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  visited TEXT[] DEFAULT '{}',
  missed TEXT[] DEFAULT '{}',
  plan_version VARCHAR(50),
  actual_pace_7day_avg NUMERIC(5, 2),
  readiness_score NUMERIC(5, 2),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS results (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind VARCHAR(50),
  label VARCHAR(255),
  score SMALLINT,
  total SMALLINT,
  pct SMALLINT,
  passed BOOLEAN,
  by_section JSONB,
  duration_sec INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_results_user ON results(user_id);
CREATE INDEX IF NOT EXISTS idx_results_created ON results(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(LOWER(email));
