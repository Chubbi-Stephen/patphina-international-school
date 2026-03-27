const express = require('express');
const db      = require('../db/database');
const { authenticate, requireRole } = require('../middleware/auth');
const router  = express.Router();

// GET /api/timetable — filter by class, term, session
router.get('/', authenticate, (req, res) => {
  const { class: cls, term, session } = req.query;
  if (!cls) return res.status(400).json({ success: false, message: 'class required' });
  let q = `SELECT t.*, te.full_name as teacher_name FROM timetable t
           LEFT JOIN teachers te ON te.id = t.teacher_id
           WHERE t.class = ?`;
  const p = [cls];
  if (term)    { q += ' AND t.term = ?';    p.push(term); }
  if (session) { q += ' AND t.session = ?'; p.push(session); }
  q += ' ORDER BY t.day, t.period';
  res.json({ success: true, timetable: db.prepare(q).all(...p) });
});

// POST /api/timetable
router.post('/', authenticate, requireRole('admin','teacher'), (req, res) => {
  const { class: cls, day, period, start_time, end_time, subject, teacher_id, term, session } = req.body;
  if (!cls || !day || !period || !start_time || !end_time || !subject || !term || !session)
    return res.status(400).json({ success: false, message: 'All fields required' });
  try {
    const r = db.prepare(`INSERT INTO timetable (class,day,period,start_time,end_time,subject,teacher_id,term,session)
      VALUES (?,?,?,?,?,?,?,?,?)`).run(cls, day, period, start_time, end_time, subject, teacher_id||null, term, session);
    db.logAudit(req.user.userId, req.user.username, 'CREATE_TIMETABLE', 'timetable', r.lastInsertRowid,
      `${cls} ${day} P${period} — ${subject}`);
    res.status(201).json({ success: true, slot: db.prepare('SELECT * FROM timetable WHERE id=?').get(r.lastInsertRowid) });
  } catch (e) {
    res.status(409).json({ success: false, message: 'That period already exists for this class/term/session' });
  }
});

// PUT /api/timetable/:id
router.put('/:id', authenticate, requireRole('admin','teacher'), (req, res) => {
  const { start_time, end_time, subject, teacher_id } = req.body;
  db.prepare('UPDATE timetable SET start_time=?,end_time=?,subject=?,teacher_id=? WHERE id=?')
    .run(start_time, end_time, subject, teacher_id||null, req.params.id);
  db.logAudit(req.user.userId, req.user.username, 'UPDATE_TIMETABLE', 'timetable', req.params.id, null);
  res.json({ success: true, slot: db.prepare('SELECT * FROM timetable WHERE id=?').get(req.params.id) });
});

// DELETE /api/timetable/:id
router.delete('/:id', authenticate, requireRole('admin','teacher'), (req, res) => {
  db.prepare('DELETE FROM timetable WHERE id=?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
