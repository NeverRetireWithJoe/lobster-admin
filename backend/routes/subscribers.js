import express from 'express';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// 讀取訂閱者（從 bot1 作為主要來源）
function getSubscribers() {
  const subscriberPath = '/home/autorun/.openclaw/workspace-smartbot1/subscribers.json';
  try {
    if (fs.existsSync(subscriberPath)) {
      return JSON.parse(fs.readFileSync(subscriberPath, 'utf-8'));
    }
    return [];
  } catch (error) {
    return [];
  }
}

// 同步訂閱者到所有 bot
function syncSubscribersToAllBots(subscribers) {
  for (let i = 1; i <= 3; i++) {
    const botPath = `/home/autorun/.openclaw/workspace-smartbot${i}/subscribers.json`;
    try {
      fs.writeFileSync(botPath, JSON.stringify(subscribers, null, 2), 'utf-8');
    } catch (error) {
      console.error(`同步訂閱者到 bot${i} 失敗:`, error.message);
    }
  }
}

// GET 訂閱者列表
router.get('/', (req, res) => {
  try {
    const subscribers = getSubscribers();
    res.json(subscribers);
  } catch (error) {
    res.status(500).json({ error: '獲取訂閱者失敗' });
  }
});

// POST 新增訂閱者
router.post('/', (req, res) => {
  try {
    const { telegram_id, name } = req.body;

    if (!telegram_id) {
      return res.status(400).json({ error: 'Telegram ID 為必填' });
    }

    const subscribers = getSubscribers();

    if (subscribers.includes(telegram_id)) {
      return res.status(400).json({ error: '此用戶已訂閱' });
    }

    subscribers.push(telegram_id);
    syncSubscribersToAllBots(subscribers);

    res.json({ message: '訂閱者新增成功' });
  } catch (error) {
    res.status(500).json({ error: '新增訂閱者失敗' });
  }
});

// DELETE 刪除訂閱者
router.delete('/:telegram_id', (req, res) => {
  try {
    const { telegram_id } = req.params;

    let subscribers = getSubscribers();
    subscribers = subscribers.filter(id => id !== telegram_id);

    syncSubscribersToAllBots(subscribers);

    res.json({ message: '訂閱者移除成功' });
  } catch (error) {
    res.status(500).json({ error: '移除訂閱者失敗' });
  }
});

export default router;
