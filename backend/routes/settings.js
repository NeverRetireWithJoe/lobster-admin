import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import db from '../database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const configPath = path.join(__dirname, '..', '..', 'config.json');

// GET 設定
router.get('/', (req, res) => {
  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    res.json(config.settings || {});
  } catch (error) {
    res.status(500).json({ error: '讀取設定失敗' });
  }
});

// PUT 更新設定
router.put('/', (req, res) => {
  try {
    const { settings } = req.body;

    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    config.settings = { ...config.settings, ...settings };

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');

    res.json({ message: '設定更新成功' });
  } catch (error) {
    res.status(500).json({ error: '更新設定失敗' });
  }
});

// PUT 修改管理員密碼
router.put('/password', (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: '請提供當前密碼和新密碼' });
    }

    const admin = db.prepare('SELECT * FROM admins WHERE id = ?').get(req.user.id);

    if (!bcrypt.compareSync(currentPassword, admin.password)) {
      return res.status(401).json({ error: '當前密碼錯誤' });
    }

    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    db.prepare('UPDATE admins SET password = ? WHERE id = ?').run(hashedPassword, req.user.id);

    res.json({ message: '密碼修改成功' });
  } catch (error) {
    res.status(500).json({ error: '修改密碼失敗' });
  }
});

export default router;
