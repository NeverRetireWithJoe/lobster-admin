import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import db, { initDatabase } from './database.js';
import { authMiddleware } from './auth.js';

// 路由
import authRoutes from './routes/auth.js';
import dashboardRoutes from './routes/dashboard.js';
import usersRoutes from './routes/users.js';
import plansRoutes from './routes/plans.js';
import botsRoutes from './routes/bots.js';
import subscribersRoutes from './routes/subscribers.js';
import settingsRoutes from './routes/settings.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

// 中間件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 初始化資料庫
initDatabase();

// API 路由
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', authMiddleware, dashboardRoutes);
app.use('/api/users', authMiddleware, usersRoutes);
app.use('/api/plans', authMiddleware, plansRoutes);
app.use('/api/bots', authMiddleware, botsRoutes);
app.use('/api/subscribers', authMiddleware, subscribersRoutes);
app.use('/api/settings', authMiddleware, settingsRoutes);

// 提供前端靜態文件
const frontendPath = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(frontendPath));

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🦞 小龍蝦管理系統後端運行在 http://localhost:${PORT}`);
});
