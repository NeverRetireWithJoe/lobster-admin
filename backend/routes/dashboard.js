import express from 'express';
import db from '../database.js';
import fs from 'fs';
import path from 'path';

const router = express.Router();

const AGENTS_DIR = '/home/autorun/.openclaw/agents';
const WORKSPACE_BASE = '/home/autorun/.openclaw/workspace';
const BOTS = [
  { id: 'smartbot1', name: '智能軍師_1', telegram: '@bestmove_1_bot', token: '8508689248' },
  { id: 'smartbot2', name: '智能軍師_2', telegram: '@bestmove_2_bot', token: '8387963354' },
  { id: 'smartbot3', name: '智能軍師_3', telegram: '@bestmove_3_bot', token: '8472506025' },
];

function readJsonSafe(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch { return {}; }
}

function getBotRealData(botId) {
  const sessFile = path.join(AGENTS_DIR, botId, 'sessions', 'sessions.json');
  const sessions = readJsonSafe(sessFile);
  
  let totalTokens = 0;
  let totalInput = 0;
  let totalOutput = 0;
  let totalMessages = 0;
  let lastActive = 0;
  const users = new Map();
  let model = 'unknown';

  for (const [key, sess] of Object.entries(sessions)) {
    totalInput += sess.inputTokens || 0;
    totalOutput += sess.outputTokens || 0;
    totalTokens += sess.totalTokens || 0;
    
    const updated = sess.updatedAt || 0;
    if (updated > lastActive) lastActive = updated;
    
    if (sess.model) model = sess.model;
    
    const origin = sess.origin || {};
    const label = origin.label || '';
    const from = origin.from || '';
    if (label && from) {
      // Extract telegram ID from "telegram:XXXXX"
      const tgId = from.replace('telegram:', '');
      if (!users.has(tgId)) {
        users.set(tgId, {
          telegramId: tgId,
          name: label,
          inputTokens: sess.inputTokens || 0,
          outputTokens: sess.outputTokens || 0,
          totalTokens: sess.totalTokens || 0,
          lastActive: updated,
          model: sess.model || 'unknown'
        });
      } else {
        const u = users.get(tgId);
        u.inputTokens += sess.inputTokens || 0;
        u.outputTokens += sess.outputTokens || 0;
        u.totalTokens += sess.totalTokens || 0;
        if (updated > u.lastActive) u.lastActive = updated;
      }
    }
  }

  // Count transcript files for message count estimate
  const sessDir = path.join(AGENTS_DIR, botId, 'sessions');
  let transcriptFiles = 0;
  let transcriptSize = 0;
  try {
    const files = fs.readdirSync(sessDir).filter(f => f.endsWith('.jsonl'));
    transcriptFiles = files.length;
    for (const f of files) {
      const stat = fs.statSync(path.join(sessDir, f));
      transcriptSize += stat.size;
    }
  } catch {}

  // Workspace info
  const wsDir = `${WORKSPACE_BASE}-${botId}`;
  let wsFiles = 0;
  try {
    const countFiles = (dir) => {
      let count = 0;
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (entry.isFile()) count++;
        else if (entry.isDirectory()) count += countFiles(path.join(dir, entry.name));
      }
      return count;
    };
    wsFiles = countFiles(wsDir);
  } catch {}

  // Subscribers
  const subFile = path.join(`${WORKSPACE_BASE}-${botId}`, 'subscribers.json');
  const subscribers = readJsonSafe(subFile);
  const subscriberCount = Object.keys(subscribers).length;

  return {
    sessionCount: Object.keys(sessions).length,
    totalTokens,
    totalInput,
    totalOutput,
    lastActive,
    model,
    users: Array.from(users.values()),
    userCount: users.size,
    transcriptFiles,
    transcriptSize,
    wsFiles,
    subscriberCount,
    subscribers
  };
}

router.get('/stats', (req, res) => {
  try {
    // Get real data from all 3 bots
    const botData = BOTS.map(bot => {
      const data = getBotRealData(bot.id);
      return { ...bot, ...data };
    });

    const totalUsers = new Set();
    let totalTokens = 0;
    let totalSessions = 0;
    let totalSubscribers = 0;

    botData.forEach(b => {
      b.users.forEach(u => totalUsers.add(u.telegramId));
      totalTokens += b.totalTokens;
      totalSessions += b.sessionCount;
      totalSubscribers += b.subscriberCount;
    });

    // Get plan config
    const configPath = path.join(WORKSPACE_BASE, 'lobster-admin', 'config.json');
    const config = readJsonSafe(configPath);

    // Calculate estimated cost (DeepSeek pricing)
    const deepseekCostPerMToken = { input: 0.28, output: 0.42 };
    let totalInputTokens = 0;
    let totalOutputTokens = 0;
    botData.forEach(b => {
      totalInputTokens += b.totalInput;
      totalOutputTokens += b.totalOutput;
    });
    const estimatedCostUSD = (totalInputTokens / 1000000 * deepseekCostPerMToken.input) + 
                              (totalOutputTokens / 1000000 * deepseekCostPerMToken.output);
    const estimatedCostTWD = Math.round(estimatedCostUSD * 30.5);

    // DB users for paid tracking
    let dbUsers = 0;
    let paidUsers = 0;
    let monthlyRevenue = 0;
    try {
      dbUsers = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
      paidUsers = db.prepare("SELECT COUNT(*) as count FROM users WHERE status = 'active' AND expiry_date IS NOT NULL").get().count;
      const activeUsers = db.prepare("SELECT plan_id FROM users WHERE status = 'active'").all();
      activeUsers.forEach(u => {
        const plan = (config.plans || []).find(p => p.id === u.plan_id);
        if (plan) monthlyRevenue += plan.price;
      });
    } catch {}

    res.json({
      // Real-time data
      totalUniqueUsers: totalUsers.size,
      totalSessions,
      totalTokens,
      totalInputTokens,
      totalOutputTokens,
      estimatedCostUSD: estimatedCostUSD.toFixed(4),
      estimatedCostTWD,
      totalSubscribers,
      
      // DB data
      registeredUsers: dbUsers,
      paidUsers,
      monthlyRevenue,
      
      // Per-bot breakdown
      bots: botData.map(b => ({
        id: b.id,
        name: b.name,
        telegram: b.telegram,
        model: b.model,
        userCount: b.userCount,
        sessionCount: b.sessionCount,
        totalTokens: b.totalTokens,
        totalInput: b.totalInput,
        totalOutput: b.totalOutput,
        lastActive: b.lastActive,
        transcriptFiles: b.transcriptFiles,
        transcriptSizeKB: Math.round(b.transcriptSize / 1024),
        wsFiles: b.wsFiles,
        subscriberCount: b.subscriberCount,
        users: b.users,
        online: b.lastActive > 0
      }))
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: '獲取統計資料失敗', details: error.message });
  }
});

export default router;
