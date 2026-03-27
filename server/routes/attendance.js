const express = require('express');
const db      = require('../db/database');
const { authenticate, requireRole } = require('../middleware/auth');
const router  = express.Router();

// GET /api/attendance — admin/teacher view
router.get('/', authenticate, requireRole('admin','teacher'), (req, res) => {
  const { class: cls, date, term, session } = req.query;
  let q = `SELECT a.*, s.full_name as student_name, s.reg_no
           FROM attendance a JOIN students s ON s.id = a.student_id WHERE 1=1`;
  const p = [];
  if (cls)     { q += ' AND a.class = ?';   p.push(cls); }
  if (date)    { q += ' AND a.date = ?';    p.push(date); }
  if (term)    { q += ' AND a.term = ?';    p.push(term); }
  if (session) { q += ' AND a.session = ?'; p.push(session); }
  q += ' ORDER BY a.date DESC, s.full_name';
  res.json({ success: true, attendance: db.prepare(q).all(...p) });
});

// POST /api/attendance/bulk — teacher records for entire class
router.post('/bulk', authenticate, requireRole('teacher','admin'), (req, res) => {
  const { records, date, term, session, class: cls } = req.body;
  if (!Array.isArray(records) || !records.length || !date || !term || !session || !cls)
    return res.status(400).json({ success: false, message: 'records, date, term, session and class are required' });

  const teacher = req.user.role === 'teacher'
    ? db.prepare('SELECT id FROM teachers WHERE user_id = ?').get(req.user.userId)
    : null;

  const upsert = db.prepare(`
    INSERT INTO attendance (student_id, teacher_id, class, date, status, term, session, note)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(student_id, date) DO UPDATE SET
      status=excluded.status, note=excluded.note, teacher_id=excluded.teacher_id
  `);
  const insertAll = db.transaction((rows) => {
    for (const r of rows)
      upsert.run(r.student_id, teacher?.id || null, cls, date, r.status || 'present', term, session, r.note || null);
  });
  insertAll(records);

  db.logAudit(req.user.userId, req.user.username, 'RECORD_ATTENDANCE', 'attendance', null,
    `Recorded ${records.length} entries for ${cls} on ${date}`);
  res.json({ success: true, message: `${records.length} attendance records saved` });
});

// GET /api/attendance/summary/:studentId
router.get('/summary/:studentId', authenticate, (req, res) => {
  const { term, session } = req.query;
  let q = 'SELECT status, COUNT(*) as count FROM attendance WHERE student_id = ?';
  const p = [req.params.studentId];
  if (term)    { q += ' AND term = ?';    p.push(term); }
  if (session) { q += ' AND session = ?'; p.push(session); }
  q += ' GROUP BY status';
  const summary = db.prepare(q).all(...p);
  const details = db.prepare(
    `SELECT * FROM attendance WHERE student_id = ? ${term ? 'AND term = ?' : ''} ${session ? 'AND session = ?' : ''} ORDER BY date DESC`
  ).all(...p);
  res.json({ success: true, summary, details });
});

// GET /api/attendance/report — class report
router.get('/report', authenticate, requireRole('admin','teacher'), (req, res) => {
  const { class: cls, term, session } = req.query;
  if (!cls) return res.status(400).json({ success: false, message: 'class required' });
  const p = [cls];
  let cond = 'WHERE a.class = ?';
  if (term)    { cond += ' AND a.term = ?';    p.push(term); }
  if (session) { cond += ' AND a.session = ?'; p.push(session); }
  const rows = db.prepare(`
    SELECT s.id, s.full_name, s.reg_no,
      SUM(CASE WHEN a.status='present' THEN 1 ELSE 0 END) as present,
      SUM(CASE WHEN a.status='absent'  THEN 1 ELSE 0 END) as absent,
      SUM(CASE WHEN a.status='late'    THEN 1 ELSE 0 END) as late,
      COUNT(a.id) as total_days
    FROM students s
    LEFT JOIN attendance a ON a.student_id = s.id ${cond.replace('WHERE a.','AND a.')}
    WHERE s.class = ? AND s.is_active = 1
    GROUP BY s.id ORDER BY s.full_name
  `).all(...p, cls);
  res.json({ success: true, report: rows });
});

module.exports = router;
