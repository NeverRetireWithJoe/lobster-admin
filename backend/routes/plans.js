import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const configPath = path.join(__dirname, '..', '..', 'config.json');

// GET 所有方案
router.get('/', (req, res) => {
  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    res.json(config.plans || []);
  } catch (error) {
    res.status(500).json({ error: '讀取方案失敗' });
  }
});

// PUT 更新方案
router.put('/', (req, res) => {
  try {
    const { plans } = req.body;

    if (!Array.isArray(plans)) {
      return res.status(400).json({ error: '方案格式錯誤' });
    }

    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    config.plans = plans;

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');

    res.json({ message: '方案更新成功' });
  } catch (error) {
    res.status(500).json({ error: '更新方案失敗' });
  }
});

export default router;
