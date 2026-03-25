const express = require('express');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const db      = require('../db/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { identifier, password, role } = req.body;
  if (!identifier || !password || !role)
    return res.status(400).json({ success: false, message: 'All fields required' });

  const user = db.prepare('SELECT * FROM users WHERE username = ? AND role = ?').get(identifier.trim(), role);
  if (!user || !bcrypt.compareSync(password, user.password))
    return res.status(401).json({ success: false, message: 'Invalid credentials' });

  let profile = {};
  if (role === 'student') {
    profile = db.prepare('SELECT * FROM students WHERE user_id = ?').get(user.id) || {};
  } else if (role === 'teacher') {
    profile = db.prepare('SELECT * FROM teachers WHERE user_id = ?').get(user.id) || {};
    if (profile.id) {
      try { profile.classes = JSON.parse(profile.classes || '[]'); } catch { profile.classes = []; }
    }
  } else {
    profile = db.prepare('SELECT * FROM admin_users WHERE user_id = ?').get(user.id) || {};
  }

  const token = jwt.sign(
    { userId: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );

  res.json({ success: true, token, user: { ...profile, role: user.role, username: user.username } });
});

// POST /api/auth/change-password
router.post('/change-password', authenticate, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword || newPassword.length < 6)
    return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.userId);
  if (!bcrypt.compareSync(currentPassword, user.password))
    return res.status(400).json({ success: false, message: 'Current password incorrect' });

  db.prepare('UPDATE users SET password = ? WHERE id = ?').run(bcrypt.hashSync(newPassword, 10), user.id);
  res.json({ success: true, message: 'Password changed successfully' });
});

// GET /api/auth/me
router.get('/me', authenticate, (req, res) => {
  const user = db.prepare('SELECT id, username, role FROM users WHERE id = ?').get(req.user.userId);
  res.json({ success: true, user });
});

module.exports = router;
