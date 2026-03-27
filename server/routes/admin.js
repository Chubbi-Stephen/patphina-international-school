const express = require('express');
const bcrypt  = require('bcryptjs');
const db      = require('../db/database');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/admin/dashboard
router.get('/dashboard', authenticate, requireRole('admin'), (req, res) => {
  const totalStudents  = db.prepare('SELECT COUNT(*) as c FROM students WHERE is_active=1').get().c;
  const totalTeachers  = db.prepare('SELECT COUNT(*) as c FROM teachers WHERE is_active=1').get().c;
  const totalResults   = db.prepare('SELECT COUNT(*) as c FROM results').get().c;
  const totalQuestions = db.prepare('SELECT COUNT(*) as c FROM questions').get().c;
  const classCounts    = db.prepare('SELECT class, COUNT(*) as count FROM students WHERE is_active=1 GROUP BY class ORDER BY class').all();
  const recentStudents = db.prepare('SELECT reg_no, full_name, class, created_at FROM students ORDER BY created_at DESC LIMIT 5').all();
  const announcements  = db.prepare('SELECT * FROM announcements ORDER BY created_at DESC LIMIT 5').all();
  const gradeDistribution = db.prepare('SELECT grade, COUNT(*) as count FROM results GROUP BY grade ORDER BY grade').all();
  res.json({ success: true, stats: { totalStudents, totalTeachers, totalResults, totalQuestions }, classCounts, recentStudents, announcements, gradeDistribution });
});

// GET /api/admin/classes
router.get('/classes', authenticate, requireRole('admin','teacher'), (req, res) => {
  const classes = db.prepare('SELECT DISTINCT class FROM students ORDER BY class').all().map(r => r.class);
  res.json({ success: true, classes });
});

// GET /api/admin/announcements
router.get('/announcements', authenticate, (req, res) => {
  const { target } = req.query;
  let q = 'SELECT * FROM announcements WHERE 1=1';
  const p = [];
  if (target) { q += ' AND (target = ? OR target = "all")'; p.push(target); }
  q += ' ORDER BY created_at DESC';
  res.json({ success: true, announcements: db.prepare(q).all(...p) });
});

// POST /api/admin/announcements
router.post('/announcements', authenticate, requireRole('admin'), (req, res) => {
  const { title, body, target } = req.body;
  if (!title || !body) return res.status(400).json({ success: false, message: 'Title and body required' });
  const r = db.prepare('INSERT INTO announcements (title,body,target,created_by) VALUES (?,?,?,?)').run(title, body, target || 'all', req.user.userId);
  res.status(201).json({ success: true, announcement: db.prepare('SELECT * FROM announcements WHERE id = ?').get(r.lastInsertRowid) });
});

// DELETE /api/admin/announcements/:id
router.delete('/announcements/:id', authenticate, requireRole('admin'), (req, res) => {
  db.prepare('DELETE FROM announcements WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// POST /api/admin/reset-password
router.post('/reset-password', authenticate, requireRole('admin'), (req, res) => {
  const { identifier, newPassword } = req.body;
  if (!identifier || !newPassword || newPassword.length < 6)
    return res.status(400).json({ success: false, message: 'identifier and newPassword (min 6 chars) are required' });
  const user = db.prepare('SELECT id FROM users WHERE username = ?').get(identifier);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  db.prepare('UPDATE users SET password = ? WHERE id = ?').run(bcrypt.hashSync(newPassword, 10), user.id);
  res.json({ success: true, message: 'Password reset' });
});

// GET /api/admin/export/students
router.get('/export/students', authenticate, requireRole('admin'), (req, res) => {
  const { class: cls } = req.query;
  let q = 'SELECT reg_no, full_name, class, gender, parent_name, parent_phone FROM students WHERE is_active=1';
  const p = [];
  if (cls) { q += ' AND class=?'; p.push(cls); }
  q += ' ORDER BY class, full_name';
  res.json({ success: true, students: db.prepare(q).all(...p) });
});

// GET /api/admin/export/results
router.get('/export/results', authenticate, requireRole('admin'), (req, res) => {
  const { class: cls, term, session } = req.query;
  if (!cls || !term || !session) return res.status(400).json({ success: false, message: 'class, term, session required' });
  const rows = db.prepare(`
    SELECT s.reg_no, s.full_name, r.subject, r.ca_score, r.exam_score, (r.ca_score+r.exam_score) as total, r.grade
    FROM results r JOIN students s ON s.id = r.student_id
    WHERE r.class=? AND r.term=? AND r.session=?
    ORDER BY s.full_name, r.subject
  `).all(cls, term, session);
  res.json({ success: true, results: rows });
});

module.exports = router;
