const express = require('express');
const bcrypt  = require('bcryptjs');
const db      = require('../db/database');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

const parseClasses = (t) => {
  try { t.classes = JSON.parse(t.classes || '[]'); } catch { t.classes = []; }
  return t;
};

// GET /api/teachers/me
router.get('/me', authenticate, requireRole('teacher'), (req, res) => {
  const t = db.prepare('SELECT * FROM teachers WHERE user_id = ?').get(req.user.userId);
  if (!t) return res.status(404).json({ success: false, message: 'Not found' });
  res.json({ success: true, teacher: parseClasses(t) });
});

// GET /api/teachers
router.get('/', authenticate, requireRole('admin'), (req, res) => {
  const teachers = db.prepare('SELECT * FROM teachers ORDER BY full_name').all().map(parseClasses);
  res.json({ success: true, teachers });
});

// POST /api/teachers
router.post('/', authenticate, requireRole('admin'), (req, res) => {
  const { staff_id, full_name, subject, email, phone, password, classes = [] } = req.body;
  if (!staff_id || !full_name || !subject)
    return res.status(400).json({ success: false, message: 'staff_id, full_name and subject required' });
  if (db.prepare('SELECT id FROM users WHERE username = ?').get(staff_id))
    return res.status(409).json({ success: false, message: 'Staff ID already exists' });

  const create = db.transaction(() => {
    const u = db.prepare(`INSERT INTO users (username,password,role) VALUES (?,?,?)`).run(staff_id, bcrypt.hashSync(password || 'teacher123', 10), 'teacher');
    return db.prepare(`INSERT INTO teachers (user_id,staff_id,full_name,subject,email,phone,classes) VALUES (?,?,?,?,?,?,?)`).run(u.lastInsertRowid, staff_id, full_name, subject, email||null, phone||null, JSON.stringify(classes)).lastInsertRowid;
  });
  const id = create();
  res.status(201).json({ success: true, teacher: parseClasses(db.prepare('SELECT * FROM teachers WHERE id = ?').get(id)) });
});

// PUT /api/teachers/:id
router.put('/:id', authenticate, requireRole('admin'), (req, res) => {
  const { full_name, subject, email, phone, classes } = req.body;
  db.prepare(`UPDATE teachers SET full_name=?,subject=?,email=?,phone=?,classes=? WHERE id=?`)
    .run(full_name, subject, email||null, phone||null, JSON.stringify(classes || []), req.params.id);
  res.json({ success: true, teacher: parseClasses(db.prepare('SELECT * FROM teachers WHERE id = ?').get(req.params.id)) });
});

// DELETE /api/teachers/:id
router.delete('/:id', authenticate, requireRole('admin'), (req, res) => {
  const t = db.prepare('SELECT user_id FROM teachers WHERE id = ?').get(req.params.id);
  if (!t) return res.status(404).json({ success: false, message: 'Not found' });
  db.prepare('DELETE FROM users WHERE id = ?').run(t.user_id);
  res.json({ success: true, message: 'Teacher deleted' });
});

module.exports = router;
