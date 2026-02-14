import express from 'express';
import db from '../database.js';

const router = express.Router();

// GET Bot 狀態
router.get('/status', (req, res) => {
  try {
    const bots = db.prepare('SELECT * FROM bot_status').all();

    // 為每個 bot 獲取綁定用戶列表（簡化：假設平均分配）
    const allUsers = db.prepare('SELECT * FROM users WHERE status = ?').all('active');
    const usersPerBot = Math.ceil(allUsers.length / 3);

    const botsWithUsers = bots.map((bot, index) => ({
      ...bot,
      users: allUsers.slice(index * usersPerBot, (index + 1) * usersPerBot)
    }));

    res.json(botsWithUsers);
  } catch (error) {
    res.status(500).json({ error: '獲取 Bot 狀態失敗' });
  }
});

// POST 廣播訊息
router.post('/broadcast', (req, res) => {
  try {
    const { message, targetBots } = req.body;

    if (!message) {
      return res.status(400).json({ error: '訊息內容為必填' });
    }

    // 這裡是模擬，實際需要整合 Telegram Bot API
    console.log(`📢 廣播訊息到 Bot ${targetBots.join(', ')}: ${message}`);

    res.json({ 
      message: '廣播訊息已發送',
      details: `發送到 ${targetBots.length} 個 Bot`
    });
  } catch (error) {
    res.status(500).json({ error: '發送廣播失敗' });
  }
});

export default router;
