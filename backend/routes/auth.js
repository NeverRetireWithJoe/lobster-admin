import express from 'express';
import bcrypt from 'bcryptjs';
import db from '../database.js';
import { generateToken } from '../auth.js';

const router = express.Router();

router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: '請提供帳號和密碼' });
  }

  const admin = db.prepare('SELECT * FROM admins WHERE username = ?').get(username);

  if (!admin) {
    return res.status(401).json({ error: '帳號或密碼錯誤' });
  }

  const isPasswordValid = bcrypt.compareSync(password, admin.password);

  if (!isPasswordValid) {
    return res.status(401).json({ error: '帳號或密碼錯誤' });
  }

  const token = generateToken(admin);

  res.json({
    token,
    user: {
      id: admin.id,
      username: admin.username
    }
  });
});

export default router;
