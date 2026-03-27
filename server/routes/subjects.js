const express = require('express');
const db      = require('../db/database');
const { authenticate, requireRole } = require('../middleware/auth');
const router  = express.Router();

// GET /api/subjects — optionally filter by class
router.get('/', authenticate, (req, res) => {
  const { class: cls } = req.query;
  let q = "SELECT * FROM subjects WHERE is_active=1";
  const p = [];
  if (cls) { q += ' AND class=?'; p.push(cls); }
  q += ' ORDER BY class, name';
  res.json({ success: true, subjects: db.prepare(q).all(...p) });
});

// GET /api/subjects/classes — list distinct classes that have subjects
router.get('/classes', authenticate, requireRole('admin'), (req, res) => {
  const classes = db.prepare("SELECT DISTINCT class FROM subjects WHERE is_active=1 ORDER BY class").all().map(r => r.class);
  res.json({ success: true, classes });
});

// POST /api/subjects
router.post('/', authenticate, requireRole('admin'), (req, res) => {
  const { class: cls, name } = req.body;
  if (!cls || !name) return res.status(400).json({ success: false, message: 'class and name required' });
  try {
    const r = db.prepare("INSERT INTO subjects (class,name) VALUES (?,?)").run(cls, name);
    db.logAudit(req.user.userId, req.user.username, 'CREATE_SUBJECT', 'subjects', r.lastInsertRowid, `${cls}: ${name}`);
    res.status(201).json({ success: true, subject: db.prepare('SELECT * FROM subjects WHERE id=?').get(r.lastInsertRowid) });
  } catch (e) {
    res.status(409).json({ success: false, message: 'Subject already exists for this class' });
  }
});

// PUT /api/subjects/:id
router.put('/:id', authenticate, requireRole('admin'), (req, res) => {
  const { name, is_active } = req.body;
  db.prepare('UPDATE subjects SET name=?, is_active=? WHERE id=?').run(name, is_active ?? 1, req.params.id);
  db.logAudit(req.user.userId, req.user.username, 'UPDATE_SUBJECT', 'subjects', req.params.id, null);
  res.json({ success: true, subject: db.prepare('SELECT * FROM subjects WHERE id=?').get(req.params.id) });
});

// DELETE /api/subjects/:id — soft delete
router.delete('/:id', authenticate, requireRole('admin'), (req, res) => {
  db.prepare('UPDATE subjects SET is_active=0 WHERE id=?').run(req.params.id);
  db.logAudit(req.user.userId, req.user.username, 'DELETE_SUBJECT', 'subjects', req.params.id, null);
  res.json({ success: true });
});

module.exports = router;
