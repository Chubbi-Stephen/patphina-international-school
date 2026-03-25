const express = require('express');
const db      = require('../db/database');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/results/me  (student)
router.get('/me', authenticate, requireRole('student'), (req, res) => {
  const student = db.prepare('SELECT id FROM students WHERE user_id = ?').get(req.user.userId);
  if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

  const { term, session } = req.query;
  let q = `SELECT r.*, t.full_name as teacher_name
           FROM results r LEFT JOIN teachers t ON t.id = r.teacher_id
           WHERE r.student_id = ?`;
  const p = [student.id];
  if (term)    { q += ' AND r.term = ?';    p.push(term); }
  if (session) { q += ' AND r.session = ?'; p.push(session); }
  q += ' ORDER BY r.subject';
  res.json({ success: true, results: db.prepare(q).all(...p) });
});

// GET /api/results/student/:studentId  (teacher or admin)
router.get('/student/:studentId', authenticate, requireRole('teacher','admin'), (req, res) => {
  const { term, session } = req.query;
  let q = `SELECT r.*, t.full_name as teacher_name
           FROM results r LEFT JOIN teachers t ON t.id = r.teacher_id
           WHERE r.student_id = ?`;
  const p = [req.params.studentId];
  if (term)    { q += ' AND r.term = ?';    p.push(term); }
  if (session) { q += ' AND r.session = ?'; p.push(session); }
  q += ' ORDER BY r.subject';
  res.json({ success: true, results: db.prepare(q).all(...p) });
});

// POST /api/results/bulk  (teacher or admin)
router.post('/bulk', authenticate, requireRole('teacher','admin'), (req, res) => {
  const { results, term, session } = req.body;
  if (!Array.isArray(results) || !results.length)
    return res.status(400).json({ success: false, message: 'results array required' });

  const teacher = req.user.role === 'teacher'
    ? db.prepare('SELECT id FROM teachers WHERE user_id = ?').get(req.user.userId)
    : null;

  const insertMany = db.transaction((rows) => {
    for (const r of rows) {
      const { grade, remark } = db.computeGrade(Number(r.ca_score) + Number(r.exam_score));
      const student = db.prepare('SELECT class FROM students WHERE id = ?').get(r.student_id);
      db.prepare(`
        INSERT INTO results (student_id,teacher_id,subject,term,session,class,ca_score,exam_score,grade,remark)
        VALUES (?,?,?,?,?,?,?,?,?,?)
        ON CONFLICT(student_id,subject,term,session) DO UPDATE SET
          ca_score=excluded.ca_score, exam_score=excluded.exam_score,
          grade=excluded.grade, remark=excluded.remark, teacher_id=excluded.teacher_id
      `).run(r.student_id, teacher?.id || null, r.subject, term, session, student?.class || '', r.ca_score, r.exam_score, grade, remark);
    }
  });

  insertMany(results);
  res.json({ success: true, message: `${results.length} results saved` });
});

// POST /api/results  (single)
router.post('/', authenticate, requireRole('teacher','admin'), (req, res) => {
  const { student_id, subject, ca_score, exam_score, term, session } = req.body;
  if (!student_id || !subject || ca_score == null || exam_score == null || !term || !session)
    return res.status(400).json({ success: false, message: 'Missing required fields' });

  const teacher = req.user.role === 'teacher'
    ? db.prepare('SELECT id FROM teachers WHERE user_id = ?').get(req.user.userId)
    : null;
  const student = db.prepare('SELECT class FROM students WHERE id = ?').get(student_id);
  const { grade, remark } = db.computeGrade(Number(ca_score) + Number(exam_score));

  db.prepare(`
    INSERT INTO results (student_id,teacher_id,subject,term,session,class,ca_score,exam_score,grade,remark)
    VALUES (?,?,?,?,?,?,?,?,?,?)
    ON CONFLICT(student_id,subject,term,session) DO UPDATE SET
      ca_score=excluded.ca_score, exam_score=excluded.exam_score,
      grade=excluded.grade, remark=excluded.remark, teacher_id=excluded.teacher_id
  `).run(student_id, teacher?.id || null, subject, term, session, student?.class || '', ca_score, exam_score, grade, remark);

  res.json({ success: true, message: 'Result saved', grade });
});

// DELETE /api/results/:id
router.delete('/:id', authenticate, requireRole('teacher','admin'), (req, res) => {
  if (req.user.role === 'teacher') {
    const teacher = db.prepare('SELECT id FROM teachers WHERE user_id = ?').get(req.user.userId);
    const result  = db.prepare('SELECT teacher_id FROM results WHERE id = ?').get(req.params.id);
    if (!result || result.teacher_id !== teacher?.id)
      return res.status(403).json({ success: false, message: 'You can only delete your own results' });
  }
  db.prepare('DELETE FROM results WHERE id = ?').run(req.params.id);
  res.json({ success: true, message: 'Result deleted' });
});

module.exports = router;
