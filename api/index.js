import express from 'express';
import cors from 'cors';
import { initDatabase } from '../backend/database.js';
import { authMiddleware } from '../backend/auth.js';
import authRoutes from '../backend/routes/auth.js';
import dashboardRoutes from '../backend/routes/dashboard.js';
import usersRoutes from '../backend/routes/users.js';
import plansRoutes from '../backend/routes/plans.js';
import botsRoutes from '../backend/routes/bots.js';
import subscribersRoutes from '../backend/routes/subscribers.js';
import settingsRoutes from '../backend/routes/settings.js';

let app;
let dbReady = false;

function getApp() {
  if (app) return app;
  app = express();
  app.use(cors());
  app.use(express.json());

  app.use('/api/auth', authRoutes);
  app.use('/api/dashboard', authMiddleware, dashboardRoutes);
  app.use('/api/users', authMiddleware, usersRoutes);
  app.use('/api/plans', authMiddleware, plansRoutes);
  app.use('/api/bots', authMiddleware, botsRoutes);
  app.use('/api/subscribers', authMiddleware, subscribersRoutes);
  app.use('/api/settings', authMiddleware, settingsRoutes);

  return app;
}

export default async function handler(req, res) {
  if (!dbReady) {
    await initDatabase();
    dbReady = true;
  }
  return getApp()(req, res);
}
