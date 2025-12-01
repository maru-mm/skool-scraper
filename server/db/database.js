import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database(path.join(__dirname, '../../data/skool.db'));

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS scrapes (
      id TEXT PRIMARY KEY,
      url TEXT NOT NULL,
      title TEXT,
      tab TEXT,
      status TEXT NOT NULL,
      items_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME,
      error TEXT
    );

    CREATE TABLE IF NOT EXISTS scrape_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      scrape_id TEXT NOT NULL,
      content TEXT NOT NULL,
      type TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (scrape_id) REFERENCES scrapes(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS summaries (
      id TEXT PRIMARY KEY,
      scrape_id TEXT NOT NULL,
      summary TEXT NOT NULL,
      key_points TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (scrape_id) REFERENCES scrapes(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_scrapes_created_at ON scrapes(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_scrape_items_scrape_id ON scrape_items(scrape_id);
    CREATE INDEX IF NOT EXISTS idx_summaries_scrape_id ON summaries(scrape_id);
  `);
  
  console.log('✅ Database initialized');
}

export default db;

