const express = require('express');
const db      = require('../db/database');
const { authenticate, requireRole } = require('../middleware/auth');
const router  = express.Router();

// Helper to compute positions within a class/term/session
function computeClassPositions(cls, term, session) {
  // 1. Get total score per student (sum of CA + Exam across all subjects)
  const totals = db.prepare(`
    SELECT student_id, SUM(ca_score + exam_score) as grand_total
    FROM results WHERE class=? AND term=? AND session=?
    GROUP BY student_id ORDER BY grand_total DESC
  `).all(cls, term, session);

  if (!totals.length) return;
  const classSize = totals.length;

  // 2. Assign positions based on grand total
  let currentPos = 1;
  let currentRank = 1;
  let prevTotal = totals[0].grand_total;

  const updatePos = db.prepare('UPDATE results SET position=?, class_size=? WHERE student_id=? AND class=? AND term=? AND session=?');
  
  const applyAll = db.transaction(() => {
    for (const t of totals) {
      if (t.grand_total < prevTotal) {
        currentRank = currentPos;
        prevTotal = t.grand_total;
      }
      updatePos.run(currentRank, classSize, t.student_id, cls, term, session);
      currentPos++;
    }
  });
  applyAll();
}

// GET /api/results/positions/:class
router.get('/positions/:class', authenticate, requireRole('admin','teacher'), (req, res) => {
  const { term, session } = req.query;
  if (!term || !session) return res.status(400).json({ success: false, message: 'term and session required' });
  
  // Return each student's grand total and position
  const ranks = db.prepare(`
    SELECT s.id as student_id, s.full_name, s.reg_no,
           SUM(r.ca_score + r.exam_score) as grand_total,
           MIN(r.position) as position,
           MIN(r.class_size) as class_size
    FROM students s
    JOIN results r ON r.student_id = s.id
    WHERE r.class=? AND r.term=? AND r.session=?
    GROUP BY s.id ORDER BY position ASC
  `).all(req.params.class, term, session);
  
  res.json({ success: true, positions: ranks });
});

// GET /api/results/student/:id
router.get('/student/:id', authenticate, (req, res) => {
  const rs = db.prepare(`
    SELECT r.*, t.full_name as teacher_name 
    FROM results r LEFT JOIN teachers t ON r.teacher_id = t.id 
    WHERE r.student_id = ? ORDER BY r.term DESC, r.subject ASC
  `).all(req.params.id);
  res.json({ success: true, results: rs });
});

// GET /api/results/me (Logged in student)
router.get('/me', authenticate, requireRole('student'), (req, res) => {
  const { term, session } = req.query;
  let q = `
    SELECT r.*, t.full_name as teacher_name, 
           (r.ca_score + r.exam_score) as total_val
    FROM results r 
    LEFT JOIN teachers t ON r.teacher_id = t.id 
    WHERE r.student_id = (SELECT id FROM students WHERE user_id = ?)
  `;
  const p = [req.user.userId];
  if (term)    { q += ' AND r.term = ?';    p.push(term); }
  if (session) { q += ' AND r.session = ?'; p.push(session); }
  q += ' ORDER BY r.subject ASC';
  res.json({ success: true, results: db.prepare(q).all(...p) });
});

// GET /api/results/class/:cls
router.get('/class/:cls', authenticate, requireRole('admin','teacher'), (req, res) => {
  const { subject, term, session } = req.query;
  if (!subject || !term || !session) return res.status(400).json({ success: false, message: 'subject, term, session required' });
  const rs = db.prepare(
    'SELECT * FROM results WHERE class = ? AND subject = ? AND term = ? AND session = ?'
  ).all(req.params.cls, subject, term, session);
  res.json({ success: true, results: rs });
});

// PUT /api/results/:id/comment
router.put('/:id/comment', authenticate, requireRole('admin','teacher'), (req, res) => {
  const { teacher_comment, principal_comment } = req.body;
  const updates = []; const p = [];
  if (teacher_comment !== undefined) { updates.push('teacher_comment=?'); p.push(teacher_comment); }
  if (principal_comment !== undefined && req.user.role === 'admin') { updates.push('principal_comment=?'); p.push(principal_comment); }
  
  if (!updates.length) return res.json({ success: true });
  
  p.push(req.params.id);
  db.prepare(`UPDATE results SET ${updates.join(', ')} WHERE id=?`).run(...p);
  res.json({ success: true, message: 'Comment saved' });
});

// POST /api/results/bulk
router.post('/bulk', authenticate, requireRole('teacher', 'admin'), (req, res) => {
  let { results, subject, class: cls, term, session } = req.body;
  if (!Array.isArray(results) || !subject || !cls || !term || !session)
    return res.status(400).json({ success: false, message: 'Missing fields' });

  const teacher = req.user.role === 'teacher' 
    ? db.prepare('SELECT id FROM teachers WHERE user_id = ?').get(req.user.userId) : null;

  const upsert = db.prepare(`
    INSERT INTO results (student_id, teacher_id, subject, term, session, class, ca_score, exam_score, grade, remark)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(student_id, subject, term, session) DO UPDATE SET
      ca_score=excluded.ca_score, exam_score=excluded.exam_score, grade=excluded.grade, remark=excluded.remark, teacher_id=excluded.teacher_id
  `);

  const saveAll = db.transaction((rows) => {
    for (const r of rows) {
      if (!r.student_id) continue;
      const t = Number(r.ca_score||0) + Number(r.exam_score||0);
      const { grade, remark } = db.computeGrade(t);
      upsert.run(r.student_id, teacher?.id || null, subject, term, session, cls, Number(r.ca_score||0), Number(r.exam_score||0), grade, remark);
    }
  });
  
  saveAll(results);
  
  // Re-compute positional rank for the entire class/term/session
  computeClassPositions(cls, term, session);

  db.logAudit(req.user.userId, req.user.username, 'BULK_RESULTS', 'results', null, `Uploaded ${subject} for ${cls}`);
  res.json({ success: true, message: 'Results saved and class positions computed' });
});

// DELETE /api/results/:id
router.delete('/:id', authenticate, requireRole('admin'), (req, res) => {
  const r = db.prepare('SELECT class, term, session FROM results WHERE id=?').get(req.params.id);
  db.prepare('DELETE FROM results WHERE id = ?').run(req.params.id);
  if (r) computeClassPositions(r.class, r.term, r.session);
  res.json({ success: true, message: 'Result deleted' });
});

module.exports = router;
