import initSqlJs from 'sql.js';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let db;
const dbPath = join(__dirname, '..', 'database.db');

// 初始化 SQL.js
const SQL = await initSqlJs();

// 載入或創建資料庫
if (fs.existsSync(dbPath)) {
  const buffer = fs.readFileSync(dbPath);
  db = new SQL.Database(buffer);
} else {
  db = new SQL.Database();
}

// 保存資料庫到文件
function saveDatabase() {
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);
}

// 包裝 SQL.js 方法為類似 better-sqlite3 的接口
const dbWrapper = {
  prepare(sql) {
    return {
      run(...params) {
        db.run(sql, params);
        saveDatabase();
        return { lastInsertRowid: db.exec('SELECT last_insert_rowid() as id')[0]?.values[0]?.[0] };
      },
      get(...params) {
        const result = db.exec(sql, params);
        if (result.length === 0) return null;
        const columns = result[0].columns;
        const values = result[0].values[0];
        if (!values) return null;
        const row = {};
        columns.forEach((col, i) => {
          row[col] = values[i];
        });
        return row;
      },
      all(...params) {
        const result = db.exec(sql, params);
        if (result.length === 0) return [];
        const columns = result[0].columns;
        const rows = result[0].values.map(values => {
          const row = {};
          columns.forEach((col, i) => {
            row[col] = values[i];
          });
          return row;
        });
        return rows;
      }
    };
  },
  exec(sql) {
    db.run(sql);
    saveDatabase();
  }
};

// 初始化資料庫
export function initDatabase() {
  // 管理員表
  dbWrapper.exec(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 用戶表
  dbWrapper.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      telegram_id TEXT UNIQUE NOT NULL,
      name TEXT,
      plan_id TEXT NOT NULL,
      status TEXT DEFAULT 'active',
      expiry_date DATE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      daily_messages INTEGER DEFAULT 0,
      total_messages INTEGER DEFAULT 0,
      monthly_tokens INTEGER DEFAULT 0,
      last_message_date DATE
    )
  `);

  // 訊息日誌表
  dbWrapper.exec(`
    CREATE TABLE IF NOT EXISTS message_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      bot_number INTEGER,
      message_count INTEGER DEFAULT 1,
      tokens_used INTEGER DEFAULT 0,
      log_date DATE DEFAULT CURRENT_DATE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Bot 狀態表
  dbWrapper.exec(`
    CREATE TABLE IF NOT EXISTS bot_status (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      status TEXT DEFAULT 'offline',
      user_count INTEGER DEFAULT 0,
      daily_messages INTEGER DEFAULT 0,
      last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 初始化預設管理員 (admin / lobster2026)
  const adminExists = dbWrapper.prepare('SELECT COUNT(*) as count FROM admins WHERE username = ?').get('admin');
  if (!adminExists || adminExists.count === 0) {
    const hashedPassword = bcrypt.hashSync('lobster2026', 10);
    dbWrapper.prepare('INSERT INTO admins (username, password) VALUES (?, ?)').run('admin', hashedPassword);
  }

  // 初始化 3 隻小龍蝦
  for (let i = 1; i <= 3; i++) {
    const botExists = dbWrapper.prepare('SELECT COUNT(*) as count FROM bot_status WHERE id = ?').get(i);
    if (!botExists || botExists.count === 0) {
      dbWrapper.prepare('INSERT INTO bot_status (id, name, status) VALUES (?, ?, ?)').run(i, `小龍蝦 ${i}`, 'online');
    }
  }

  console.log('✅ 資料庫初始化完成');
}

export default dbWrapper;
