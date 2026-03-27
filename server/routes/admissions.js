const express = require('express');
const bcrypt  = require('bcryptjs');
const db      = require('../db/database');
const { authenticate, requireRole } = require('../middleware/auth');
const router  = express.Router();

// POST /api/admissions/apply — public (no auth)
router.post('/apply', (req, res) => {
  const { full_name, dob, gender, parent_name, parent_phone, parent_email, class_applied, session, address, prev_school } = req.body;
  if (!full_name || !parent_name || !parent_phone || !class_applied || !session)
    return res.status(400).json({ success: false, message: 'full_name, parent_name, parent_phone, class_applied and session are required' });
  const r = db.prepare(`INSERT INTO admissions (full_name,dob,gender,parent_name,parent_phone,parent_email,class_applied,session,address,prev_school)
    VALUES (?,?,?,?,?,?,?,?,?,?)`).run(full_name, dob||null, gender||null, parent_name, parent_phone, parent_email||null, class_applied, session, address||null, prev_school||null);
  res.status(201).json({ success: true, message: 'Application submitted successfully', id: r.lastInsertRowid });
});

// GET /api/admissions — admin view all
router.get('/', authenticate, requireRole('admin'), (req, res) => {
  const { status, session } = req.query;
  let q = 'SELECT * FROM admissions WHERE 1=1';
  const p = [];
  if (status)  { q += ' AND status = ?';  p.push(status); }
  if (session) { q += ' AND session = ?'; p.push(session); }
  q += ' ORDER BY created_at DESC';
  res.json({ success: true, admissions: db.prepare(q).all(...p) });
});

// PUT /api/admissions/:id/status — admin updates status
router.put('/:id/status', authenticate, requireRole('admin'), (req, res) => {
  const { status, notes } = req.body;
  if (!['pending','approved','rejected','enrolled'].includes(status))
    return res.status(400).json({ success: false, message: 'Invalid status' });
  db.prepare('UPDATE admissions SET status=?, notes=? WHERE id=?').run(status, notes||null, req.params.id);
  db.logAudit(req.user.userId, req.user.username, 'UPDATE_ADMISSION', 'admissions', req.params.id, `Status → ${status}`);
  res.json({ success: true, admission: db.prepare('SELECT * FROM admissions WHERE id=?').get(req.params.id) });
});

// POST /api/admissions/:id/enroll — admin enrolls applicant as student
router.post('/:id/enroll', authenticate, requireRole('admin'), (req, res) => {
  const { reg_no, password, class: cls } = req.body;
  if (!reg_no || !cls)
    return res.status(400).json({ success: false, message: 'reg_no and class required' });
  const app = db.prepare('SELECT * FROM admissions WHERE id=?').get(req.params.id);
  if (!app) return res.status(404).json({ success: false, message: 'Application not found' });
  if (db.prepare('SELECT id FROM users WHERE username=?').get(reg_no))
    return res.status(409).json({ success: false, message: 'Reg number already exists' });

  const enroll = db.transaction(() => {
    const u = db.prepare("INSERT INTO users (username,password,role) VALUES (?,?,'student')")
      .run(reg_no, bcrypt.hashSync(password || 'student123', 10));
    db.prepare(`INSERT INTO students (user_id,reg_no,full_name,class,dob,gender,parent_name,parent_phone,address)
      VALUES (?,?,?,?,?,?,?,?,?)`)
      .run(u.lastInsertRowid, reg_no, app.full_name, cls, app.dob||null, app.gender||null, app.parent_name, app.parent_phone, app.address||null);
    db.prepare("UPDATE admissions SET status='enrolled' WHERE id=?").run(req.params.id);
  });
  enroll();
  db.logAudit(req.user.userId, req.user.username, 'ENROLL_STUDENT', 'admissions', req.params.id,
    `Enrolled ${app.full_name} as ${reg_no}`);
  res.json({ success: true, message: `${app.full_name} enrolled as ${reg_no}` });
});

// DELETE /api/admissions/:id
router.delete('/:id', authenticate, requireRole('admin'), (req, res) => {
  db.prepare('DELETE FROM admissions WHERE id=?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
