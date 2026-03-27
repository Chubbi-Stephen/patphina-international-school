const express = require('express');
const db      = require('../db/database');
const { authenticate, requireRole } = require('../middleware/auth');
const router  = express.Router();

// GET /api/sessions
router.get('/', authenticate, (req, res) => {
  res.json({ success: true, sessions: db.prepare('SELECT * FROM sessions ORDER BY id DESC').all() });
});

// GET /api/sessions/current
router.get('/current', (req, res) => {
  const sess = db.prepare('SELECT * FROM sessions WHERE is_active=1 LIMIT 1').get();
  res.json({ success: true, session: sess || null });
});

// POST /api/sessions — create new session
router.post('/', authenticate, requireRole('admin'), (req, res) => {
  const { name, current_term } = req.body;
  if (!name) return res.status(400).json({ success: false, message: 'Session name required' });
  try {
    const r = db.prepare("INSERT INTO sessions (name,current_term,is_active) VALUES (?,?,0)").run(name, current_term || '1st Term');
    db.logAudit(req.user.userId, req.user.username, 'CREATE_SESSION', 'sessions', r.lastInsertRowid, name);
    res.status(201).json({ success: true, session: db.prepare('SELECT * FROM sessions WHERE id=?').get(r.lastInsertRowid) });
  } catch (e) {
    res.status(409).json({ success: false, message: 'Session already exists' });
  }
});

// PUT /api/sessions/:id — update term
router.put('/:id', authenticate, requireRole('admin'), (req, res) => {
  const { current_term } = req.body;
  db.prepare('UPDATE sessions SET current_term=? WHERE id=?').run(current_term, req.params.id);
  db.logAudit(req.user.userId, req.user.username, 'UPDATE_SESSION', 'sessions', req.params.id, `Term → ${current_term}`);
  res.json({ success: true, session: db.prepare('SELECT * FROM sessions WHERE id=?').get(req.params.id) });
});

// PUT /api/sessions/:id/activate — set this as the current active session
router.put('/:id/activate', authenticate, requireRole('admin'), (req, res) => {
  db.prepare('UPDATE sessions SET is_active=0').run();
  db.prepare('UPDATE sessions SET is_active=1 WHERE id=?').run(req.params.id);
  const sess = db.prepare('SELECT * FROM sessions WHERE id=?').get(req.params.id);
  db.logAudit(req.user.userId, req.user.username, 'ACTIVATE_SESSION', 'sessions', req.params.id,
    `Activated ${sess.name} — ${sess.current_term}`);
  res.json({ success: true, session: sess });
});

module.exports = router;
