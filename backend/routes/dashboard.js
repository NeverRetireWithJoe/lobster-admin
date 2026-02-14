import express from 'express';
import db from '../database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

router.get('/stats', (req, res) => {
  try {
    // 總用戶數
    const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get().count;

    // 付費用戶數 (狀態為 active 且有到期日)
    const paidUsers = db.prepare('SELECT COUNT(*) as count FROM users WHERE status = ? AND expiry_date IS NOT NULL').get('active').count;

    // 月營收 (簡化計算：根據方案計算)
    const usersWithPlans = db.prepare('SELECT plan_id FROM users WHERE status = ?').all('active');
    const configPath = path.join(__dirname, '..', '..', 'config.json');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    let monthlyRevenue = 0;
    usersWithPlans.forEach(user => {
      const plan = config.plans.find(p => p.id === user.plan_id);
      if (plan) monthlyRevenue += plan.price;
    });

    // 今日訊息量
    const today = new Date().toISOString().split('T')[0];
    const todayMessages = db.prepare('SELECT SUM(message_count) as count FROM message_logs WHERE log_date = ?').get(today);
    const dailyMessages = todayMessages.count || 0;

    // API Token 用量（本月）
    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthlyTokens = db.prepare(`
      SELECT SUM(tokens_used) as total 
      FROM message_logs 
      WHERE strftime('%Y-%m', log_date) = ?
    `).get(currentMonth);
    const apiTokenUsage = monthlyTokens.total || 0;

    // 3 隻小龍蝦狀態
    const bots = db.prepare('SELECT * FROM bot_status').all();

    res.json({
      totalUsers,
      paidUsers,
      monthlyRevenue,
      dailyMessages,
      apiTokenUsage,
      bots
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: '獲取統計資料失敗' });
  }
});

export default router;
