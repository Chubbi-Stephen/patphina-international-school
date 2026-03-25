const express = require('express');
const bcrypt  = require('bcryptjs');
const db      = require('../db/database');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/students/me
router.get('/me', authenticate, requireRole('student'), (req, res) => {
  const student = db.prepare('SELECT * FROM students WHERE user_id = ?').get(req.user.userId);
  if (!student) return res.status(404).json({ success: false, message: 'Not found' });
  res.json({ success: true, student });
});

// GET /api/students
router.get('/', authenticate, requireRole('admin','teacher'), (req, res) => {
  const { class: cls, search } = req.query;
  let q = 'SELECT * FROM students WHERE is_active = 1';
  const p = [];
  if (cls)    { q += ' AND class = ?'; p.push(cls); }
  if (search) { q += ' AND (full_name LIKE ? OR reg_no LIKE ?)'; p.push(`%${search}%`, `%${search}%`); }
  q += ' ORDER BY class, full_name';
  res.json({ success: true, students: db.prepare(q).all(...p) });
});

// GET /api/students/:id
router.get('/:id', authenticate, requireRole('admin','teacher'), (req, res) => {
  const s = db.prepare('SELECT * FROM students WHERE id = ?').get(req.params.id);
  if (!s) return res.status(404).json({ success: false, message: 'Not found' });
  res.json({ success: true, student: s });
});

// POST /api/students
router.post('/', authenticate, requireRole('admin'), (req, res) => {
  const { reg_no, full_name, class: cls, dob, gender, parent_name, parent_phone, address, password } = req.body;
  if (!reg_no || !full_name || !cls)
    return res.status(400).json({ success: false, message: 'reg_no, full_name and class are required' });
  if (db.prepare('SELECT id FROM users WHERE username = ?').get(reg_no))
    return res.status(409).json({ success: false, message: 'Reg number already exists' });

  const create = db.transaction(() => {
    const u = db.prepare(`INSERT INTO users (username, password, role) VALUES (?, ?, 'student')`).run(reg_no, bcrypt.hashSync(password || 'student123', 10));
    return db.prepare(`INSERT INTO students (user_id,reg_no,full_name,class,dob,gender,parent_name,parent_phone,address) VALUES (?,?,?,?,?,?,?,?,?)`).run(u.lastInsertRowid, reg_no, full_name, cls, dob||null, gender||null, parent_name||null, parent_phone||null, address||null).lastInsertRowid;
  });
  const id = create();
  res.status(201).json({ success: true, student: db.prepare('SELECT * FROM students WHERE id = ?').get(id) });
});

// PUT /api/students/:id
router.put('/:id', authenticate, requireRole('admin'), (req, res) => {
  const { full_name, class: cls, dob, gender, parent_name, parent_phone, address } = req.body;
  db.prepare(`UPDATE students SET full_name=?,class=?,dob=?,gender=?,parent_name=?,parent_phone=?,address=? WHERE id=?`)
    .run(full_name, cls, dob||null, gender||null, parent_name||null, parent_phone||null, address||null, req.params.id);
  res.json({ success: true, student: db.prepare('SELECT * FROM students WHERE id = ?').get(req.params.id) });
});

// DELETE /api/students/:id
router.delete('/:id', authenticate, requireRole('admin'), (req, res) => {
  const s = db.prepare('SELECT user_id FROM students WHERE id = ?').get(req.params.id);
  if (!s) return res.status(404).json({ success: false, message: 'Not found' });
  db.prepare('DELETE FROM users WHERE id = ?').run(s.user_id);
  res.json({ success: true, message: 'Student deleted' });
});

module.exports = router;
