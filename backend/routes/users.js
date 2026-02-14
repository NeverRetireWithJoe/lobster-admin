import express from 'express';
import db from '../database.js';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// 同步用戶到各個 bot 的 users.json
function syncUsersToBot(botNumber, users) {
  const botPath = `/home/autorun/.openclaw/workspace-smartbot${botNumber}/users.json`;
  try {
    fs.writeFileSync(botPath, JSON.stringify(users, null, 2), 'utf-8');
  } catch (error) {
    console.error(`同步到 bot${botNumber} 失敗:`, error.message);
  }
}

// 同步所有用戶到 3 隻 bot
function syncAllUsersToAllBots() {
  const users = db.prepare('SELECT * FROM users').all();
  const userMap = {};
  
  users.forEach(user => {
    userMap[user.telegram_id] = {
      name: user.name,
      plan: user.plan_id,
      status: user.status,
      expiryDate: user.expiry_date,
      dailyMessages: user.daily_messages,
      totalMessages: user.total_messages,
      monthlyTokens: user.monthly_tokens
    };
  });

  for (let i = 1; i <= 3; i++) {
    syncUsersToBot(i, userMap);
  }
}

// GET 所有用戶
router.get('/', (req, res) => {
  try {
    const users = db.prepare('SELECT * FROM users ORDER BY created_at DESC').all();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: '獲取用戶列表失敗' });
  }
});

// POST 新增用戶
router.post('/', (req, res) => {
  try {
    const { telegram_id, name, plan_id, expiry_date } = req.body;

    if (!telegram_id || !plan_id) {
      return res.status(400).json({ error: 'Telegram ID 和方案為必填' });
    }

    const stmt = db.prepare(`
      INSERT INTO users (telegram_id, name, plan_id, expiry_date)
      VALUES (?, ?, ?, ?)
    `);

    const result = stmt.run(telegram_id, name || '', plan_id, expiry_date || null);

    syncAllUsersToAllBots();

    res.json({ id: result.lastInsertRowid, message: '用戶新增成功' });
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: '此 Telegram ID 已存在' });
    }
    res.status(500).json({ error: '新增用戶失敗' });
  }
});

// PUT 更新用戶
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, plan_id, status, expiry_date } = req.body;

    const stmt = db.prepare(`
      UPDATE users 
      SET name = ?, plan_id = ?, status = ?, expiry_date = ?
      WHERE id = ?
    `);

    stmt.run(name, plan_id, status, expiry_date, id);

    syncAllUsersToAllBots();

    res.json({ message: '用戶更新成功' });
  } catch (error) {
    res.status(500).json({ error: '更新用戶失敗' });
  }
});

// DELETE 刪除用戶
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;

    db.prepare('DELETE FROM users WHERE id = ?').run(id);

    syncAllUsersToAllBots();

    res.json({ message: '用戶刪除成功' });
  } catch (error) {
    res.status(500).json({ error: '刪除用戶失敗' });
  }
});

export default router;
