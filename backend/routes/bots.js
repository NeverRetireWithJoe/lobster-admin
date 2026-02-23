import express from 'express';
import fs from 'fs';
import path from 'path';
import https from 'https';

const router = express.Router();

const AGENTS_DIR = '/home/autorun/.openclaw/agents';
const WORKSPACE_BASE = '/home/autorun/.openclaw/workspace';
const BOT_TOKENS = {
  smartbot1: '8508689248:AAGH9HzF99GWp7liqh9f9G8X0bd9xpTAgH0',
  smartbot2: '8387963354:AAEnRJAUYsG_cemHPL9Lfe9lpo6hxOZeOCY',
  smartbot3: '8472506025:AAH_81yLOjSGfWF1eYhyW6SbMLObEXDC7-Q',
};
const BOTS = [
  { id: 'smartbot1', name: '智能軍師_1', telegram: '@bestmove_1_bot' },
  { id: 'smartbot2', name: '智能軍師_2', telegram: '@bestmove_2_bot' },
  { id: 'smartbot3', name: '智能軍師_3', telegram: '@bestmove_3_bot' },
];

function readJsonSafe(filePath) {
  try { return JSON.parse(fs.readFileSync(filePath, 'utf-8')); } catch { return {}; }
}

function sendTelegramMessage(token, chatId, text) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown', disable_web_page_preview: true });
    const req = https.request({
      hostname: 'api.telegram.org',
      path: `/bot${token}/sendMessage`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
    }, (res) => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => resolve(JSON.parse(body)));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// GET Bot 狀態（真實資料）
router.get('/status', (req, res) => {
  try {
    const result = BOTS.map(bot => {
      const sessFile = path.join(AGENTS_DIR, bot.id, 'sessions', 'sessions.json');
      const sessions = readJsonSafe(sessFile);
      
      let totalTokens = 0, totalInput = 0, totalOutput = 0, lastActive = 0, model = 'unknown';
      const users = [];
      const seenUsers = new Set();

      for (const [key, sess] of Object.entries(sessions)) {
        totalInput += sess.inputTokens || 0;
        totalOutput += sess.outputTokens || 0;
        totalTokens += sess.totalTokens || 0;
        const updated = sess.updatedAt || 0;
        if (updated > lastActive) lastActive = updated;
        if (sess.model) model = sess.model;

        const origin = sess.origin || {};
        const tgId = (origin.from || '').replace('telegram:', '');
        if (tgId && !seenUsers.has(tgId)) {
          seenUsers.add(tgId);
          users.push({
            telegramId: tgId,
            name: origin.label || tgId,
            tokens: sess.totalTokens || 0,
            lastActive: updated
          });
        }
      }

      // Subscribers
      const subFile = path.join(`${WORKSPACE_BASE}-${bot.id}`, 'subscribers.json');
      const subscribers = readJsonSafe(subFile);

      // Workspace
      const wsDir = `${WORKSPACE_BASE}-${bot.id}`;
      let soulContent = '';
      try { soulContent = fs.readFileSync(path.join(wsDir, 'SOUL.md'), 'utf-8').slice(0, 200); } catch {}

      return {
        ...bot,
        online: true,
        model,
        sessionCount: Object.keys(sessions).length,
        userCount: seenUsers.size,
        totalTokens,
        totalInput,
        totalOutput,
        lastActive,
        lastActiveStr: lastActive > 0 ? new Date(lastActive).toISOString() : 'N/A',
        users,
        subscriberCount: Object.keys(subscribers).length,
        subscribers: Object.entries(subscribers).map(([id, info]) => ({ telegramId: id, ...info })),
        soulPreview: soulContent
      };
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: '獲取 Bot 狀態失敗', details: error.message });
  }
});

// POST 廣播訊息（真實發送）
router.post('/broadcast', async (req, res) => {
  try {
    const { message, targetBots } = req.body;
    if (!message) return res.status(400).json({ error: '訊息內容為必填' });

    const results = [];
    for (const botId of (targetBots || ['smartbot1', 'smartbot2', 'smartbot3'])) {
      const token = BOT_TOKENS[botId];
      if (!token) continue;

      // Get all users for this bot
      const sessFile = path.join(AGENTS_DIR, botId, 'sessions', 'sessions.json');
      const sessions = readJsonSafe(sessFile);
      const sentTo = new Set();

      for (const [key, sess] of Object.entries(sessions)) {
        const tgId = (sess.origin?.from || '').replace('telegram:', '');
        if (tgId && !sentTo.has(tgId)) {
          sentTo.add(tgId);
          try {
            await sendTelegramMessage(token, parseInt(tgId), message);
            results.push({ bot: botId, user: tgId, status: 'ok' });
          } catch (e) {
            results.push({ bot: botId, user: tgId, status: 'error', error: e.message });
          }
        }
      }
    }

    res.json({ message: '廣播完成', sent: results.length, results });
  } catch (error) {
    res.status(500).json({ error: '發送廣播失敗', details: error.message });
  }
});

export default router;
