const express = require('express');
const db      = require('../db/database');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/questions
router.get('/', authenticate, requireRole('teacher','admin'), (req, res) => {
  const { class: cls, subject, term } = req.query;
  let q = `SELECT qu.*, t.full_name as teacher_name FROM questions qu
           LEFT JOIN teachers t ON t.id = qu.teacher_id WHERE 1=1`;
  const p = [];
  if (req.user.role === 'teacher') {
    const t = db.prepare('SELECT id FROM teachers WHERE user_id = ?').get(req.user.userId);
    q += ' AND qu.teacher_id = ?'; p.push(t?.id);
  }
  if (cls)     { q += ' AND qu.class = ?';   p.push(cls); }
  if (subject) { q += ' AND qu.subject = ?'; p.push(subject); }
  if (term)    { q += ' AND qu.term = ?';    p.push(term); }
  q += ' ORDER BY qu.created_at DESC';
  res.json({ success: true, questions: db.prepare(q).all(...p) });
});

// POST /api/questions
router.post('/', authenticate, requireRole('teacher','admin'), (req, res) => {
  const { class: cls, subject, term, session, question, option_a, option_b, option_c, option_d, answer, marks } = req.body;
  if (!cls || !subject || !question || !option_a || !option_b || !option_c || !option_d || !answer)
    return res.status(400).json({ success: false, message: 'All fields required' });

  const teacher = req.user.role === 'teacher'
    ? db.prepare('SELECT id FROM teachers WHERE user_id = ?').get(req.user.userId)
    : null;

  const r = db.prepare(`INSERT INTO questions (teacher_id,subject,class,term,session,question,option_a,option_b,option_c,option_d,answer,marks) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`)
    .run(teacher?.id || null, subject, cls, term || '2nd Term', session || '2025/2026', question, option_a, option_b, option_c, option_d, answer, marks || 1);

  res.status(201).json({ success: true, question: db.prepare('SELECT * FROM questions WHERE id = ?').get(r.lastInsertRowid) });
});

// PUT /api/questions/:id
router.put('/:id', authenticate, requireRole('teacher','admin'), (req, res) => {
  const { question, option_a, option_b, option_c, option_d, answer, marks } = req.body;
  if (req.user.role === 'teacher') {
    const t = db.prepare('SELECT id FROM teachers WHERE user_id = ?').get(req.user.userId);
    const q = db.prepare('SELECT teacher_id FROM questions WHERE id = ?').get(req.params.id);
    if (!q || q.teacher_id !== t?.id)
      return res.status(403).json({ success: false, message: 'You can only edit your own questions' });
  }
  db.prepare(`UPDATE questions SET question=?,option_a=?,option_b=?,option_c=?,option_d=?,answer=?,marks=? WHERE id=?`)
    .run(question, option_a, option_b, option_c, option_d, answer, marks, req.params.id);
  res.json({ success: true, question: db.prepare('SELECT * FROM questions WHERE id = ?').get(req.params.id) });
});

// DELETE /api/questions/:id
router.delete('/:id', authenticate, requireRole('teacher','admin'), (req, res) => {
  if (req.user.role === 'teacher') {
    const t = db.prepare('SELECT id FROM teachers WHERE user_id = ?').get(req.user.userId);
    const q = db.prepare('SELECT teacher_id FROM questions WHERE id = ?').get(req.params.id);
    if (!q || q.teacher_id !== t?.id)
      return res.status(403).json({ success: false, message: 'You can only delete your own questions' });
  }
  db.prepare('DELETE FROM questions WHERE id = ?').run(req.params.id);
  res.json({ success: true, message: 'Question deleted' });
});

module.exports = router;
