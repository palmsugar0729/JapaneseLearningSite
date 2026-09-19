import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DB_PATH = path.join(__dirname, '..', 'data', 'japanese.db')

const db = new Database(DB_PATH)

// WAL mode for better concurrent read performance
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

// ========== Schema ==========

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    openid TEXT UNIQUE,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS srs_progress (
    user_id INTEGER NOT NULL,
    word_id TEXT NOT NULL,
    ef REAL DEFAULT 2.5,
    repetitions INTEGER DEFAULT 0,
    interval_days INTEGER DEFAULT 0,
    next_review TEXT,
    last_reviewed TEXT,
    total_reviews INTEGER DEFAULT 0,
    PRIMARY KEY (user_id, word_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS srs_stats (
    user_id INTEGER PRIMARY KEY,
    last_study_date TEXT,
    streak_days INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS exercise_wrong (
    user_id INTEGER NOT NULL,
    exercise_id TEXT NOT NULL,
    PRIMARY KEY (user_id, exercise_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS exercise_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    total INTEGER,
    correct INTEGER,
    duration INTEGER,
    level TEXT,
    type TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- 一次性迁移的标记位
  CREATE TABLE IF NOT EXISTS meta (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
`)

// ========== 迁移：旧库补 openid 列 ==========

const userColumns = db.prepare('PRAGMA table_info(users)').all() as { name: string }[]
if (!userColumns.some((c) => c.name === 'openid')) {
  db.exec('ALTER TABLE users ADD COLUMN openid TEXT')
  db.exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_users_openid ON users(openid)')
  console.log('[db] migrated: added users.openid')
}

// ========== 迁移：教科书词库换代（2026-09-19） ==========
//
// 旧教科书只有单元 1~4，新版 LEVEL 1 有 16 个单元，两者内容完全不同，
// 但单词 ID 沿用 tb1-{单元}-{序号} 同一命名空间 —— 留着旧进度会让「已学过」
// 错记到毫不相干的新词上。这里清一次，用 meta 表打标记保证只执行一次。
//
// ⚠️ 部署时后端要与新的前端构建一起上线：若只更新后端，仍在使用旧版前端的
// 用户会在下次同步时把 tb1-* 旧记录重新推回来。

const TEXTBOOK_RESET_KEY = 'migration:textbook-level1-2026-09-19'

if (!db.prepare('SELECT 1 FROM meta WHERE key = ?').get(TEXTBOOK_RESET_KEY)) {
  const { changes } = db.prepare("DELETE FROM srs_progress WHERE word_id LIKE 'tb1-%'").run()
  db.prepare('INSERT INTO meta (key, value) VALUES (?, ?)').run(
    TEXTBOOK_RESET_KEY,
    new Date().toISOString()
  )
  console.log(`[db] migrated: cleared ${changes} legacy textbook SRS row(s)`)
}

export default db
