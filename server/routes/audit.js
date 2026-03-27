const express = require('express');
const db      = require('../db/database');
const { authenticate, requireRole } = require('../middleware/auth');
const router  = express.Router();

// GET /api/audit
router.get('/', authenticate, requireRole('admin'), (req, res) => {
  const { action, entity, limit = 100, offset = 0, username } = req.query;
  let q = 'SELECT * FROM audit_log WHERE 1=1';
  const p = [];
  if (action)   { q += ' AND action LIKE ?';   p.push(`%${action}%`); }
  if (entity)   { q += ' AND entity = ?';       p.push(entity); }
  if (username) { q += ' AND username LIKE ?';  p.push(`%${username}%`); }
  q += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  p.push(Number(limit), Number(offset));
  const logs  = db.prepare(q).all(...p);
  const total = db.prepare('SELECT COUNT(*) as c FROM audit_log').get().c;
  res.json({ success: true, logs, total });
});

module.exports = router;
