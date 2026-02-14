import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = 'lobster-secret-key-2026';

// In-memory store (resets on cold start, fine for demo)
const store = {
  admins: [{ id: 1, username: 'admin', password: bcrypt.hashSync('lobster2026', 10) }],
  users: [],
  bots: [
    { id: 1, name: '小龍蝦 1', status: 'online', user_count: 0, daily_messages: 0 },
    { id: 2, name: '小龍蝦 2', status: 'online', user_count: 0, daily_messages: 0 },
    { id: 3, name: '小龍蝦 3', status: 'online', user_count: 0, daily_messages: 0 },
  ],
  plans: [
    { id: 'personal', name: '個人版', price: 500, max_users: 1, daily_limit: 50 },
    { id: 'family', name: '家庭版', price: 1000, max_users: 3, daily_limit: 100 },
    { id: 'business', name: '企業版', price: 3000, max_users: 10, daily_limit: 500 },
  ],
  subscribers: [],
  settings: { site_name: '小龍蝦管理系統', maintenance: false },
};

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: '未授權' });
  try {
    req.user = jwt.verify(auth.slice(7), JWT_SECRET);
    next();
  } catch { return res.status(401).json({ error: 'Token 無效' }); }
}

const app = express();
app.use(cors());
app.use(express.json());

// Auth
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const admin = store.admins.find(a => a.username === username);
  if (!admin || !bcrypt.compareSync(password, admin.password)) {
    return res.status(401).json({ error: '帳號或密碼錯誤' });
  }
  const token = jwt.sign({ id: admin.id, username }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: admin.id, username } });
});

// Dashboard
app.get('/api/dashboard/stats', authMiddleware, (req, res) => {
  res.json({
    totalUsers: store.users.length,
    activeUsers: store.users.filter(u => u.status === 'active').length,
    totalBots: 3,
    activeBots: store.bots.filter(b => b.status === 'online').length,
    todayMessages: 0,
    monthlyRevenue: store.users.length * 500,
    userGrowth: [],
    messageStats: [],
    recentActivity: [],
  });
});

// Users
app.get('/api/users', authMiddleware, (req, res) => res.json(store.users));
app.post('/api/users', authMiddleware, (req, res) => {
  const user = { id: Date.now(), ...req.body, status: 'active', created_at: new Date().toISOString() };
  store.users.push(user);
  res.json(user);
});
app.put('/api/users/:id', authMiddleware, (req, res) => {
  const idx = store.users.findIndex(u => u.id == req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  store.users[idx] = { ...store.users[idx], ...req.body };
  res.json(store.users[idx]);
});
app.delete('/api/users/:id', authMiddleware, (req, res) => {
  store.users = store.users.filter(u => u.id != req.params.id);
  res.json({ ok: true });
});

// Plans
app.get('/api/plans', authMiddleware, (req, res) => res.json(store.plans));
app.put('/api/plans', authMiddleware, (req, res) => {
  if (req.body.plans) store.plans = req.body.plans;
  res.json(store.plans);
});

// Bots
app.get('/api/bots/status', authMiddleware, (req, res) => res.json(store.bots));
app.post('/api/bots/broadcast', authMiddleware, (req, res) => res.json({ ok: true, sent: 0 }));

// Subscribers
app.get('/api/subscribers', authMiddleware, (req, res) => res.json(store.subscribers));
app.post('/api/subscribers', authMiddleware, (req, res) => {
  store.subscribers.push({ ...req.body, created_at: new Date().toISOString() });
  res.json({ ok: true });
});
app.delete('/api/subscribers/:id', authMiddleware, (req, res) => {
  store.subscribers = store.subscribers.filter(s => s.telegram_id != req.params.id);
  res.json({ ok: true });
});

// Settings
app.get('/api/settings', authMiddleware, (req, res) => res.json(store.settings));
app.put('/api/settings', authMiddleware, (req, res) => {
  Object.assign(store.settings, req.body.settings || req.body);
  res.json(store.settings);
});
app.put('/api/settings/password', authMiddleware, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const admin = store.admins[0];
  if (!bcrypt.compareSync(currentPassword, admin.password)) {
    return res.status(400).json({ error: '目前密碼錯誤' });
  }
  admin.password = bcrypt.hashSync(newPassword, 10);
  res.json({ ok: true });
});

export default function handler(req, res) {
  return app(req, res);
}
