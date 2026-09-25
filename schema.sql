CREATE TABLE IF NOT EXISTS profile (
  id TEXT PRIMARY KEY,
  swimmer_name TEXT NOT NULL,
  weekly_target_meters INTEGER DEFAULT 30000,
  smr_streak_days INTEGER DEFAULT 0,
  last_smr_date TEXT,
  updated_at TEXT
);
CREATE TABLE IF NOT EXISTS workouts (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  meters INTEGER NOT NULL,
  duration_min INTEGER NOT NULL,
  rpe_scale INTEGER NOT NULL,
  stroke_rate_spm REAL,
  dps_meters REAL,
  notes TEXT,
  created_at TEXT
);
CREATE TABLE IF NOT EXISTS shoulder_logs (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  pain_scale INTEGER NOT NULL,
  affected_side TEXT NOT NULL,
  trigger_points TEXT,
  mobility_score INTEGER DEFAULT 100,
  notes TEXT,
  created_at TEXT
);
CREATE TABLE IF NOT EXISTS mobility_logs (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  type TEXT NOT NULL,
  measured_value REAL NOT NULL,
  status TEXT NOT NULL,
  passed INTEGER NOT NULL,
  notes TEXT,
  created_at TEXT
);
