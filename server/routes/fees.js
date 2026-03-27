const express = require('express');
const db      = require('../db/database');
const { authenticate, requireRole } = require('../middleware/auth');
const router  = express.Router();

// GET /api/fees/me (Student view)
router.get('/me', authenticate, requireRole('student'), (req, res) => {
  const fees = db.prepare(`
    SELECT f.*, COALESCE(SUM(fp.amount_paid),0) as paid
    FROM fees f LEFT JOIN fee_payments fp ON fp.fee_id = f.id
    WHERE f.student_id = (SELECT id FROM students WHERE user_id = ?) 
    GROUP BY f.id ORDER BY f.created_at DESC
  `).all(req.user.userId);
  const withBalance = fees.map(f => ({ ...f, balance: f.amount - f.paid }));
  res.json({ success: true, fees: withBalance });
});

// GET /api/fees/student/:studentId
router.get('/student/:studentId', authenticate, (req, res) => {
  const fees = db.prepare(`
    SELECT f.*, COALESCE(SUM(fp.amount_paid),0) as paid
    FROM fees f LEFT JOIN fee_payments fp ON fp.fee_id = f.id
    WHERE f.student_id = ? GROUP BY f.id ORDER BY f.created_at DESC
  `).all(req.params.studentId);
  const withBalance = fees.map(f => ({ ...f, balance: f.amount - f.paid }));
  res.json({ success: true, fees: withBalance });
});

// GET /api/fees — all fees (admin, with optional filters)
router.get('/', authenticate, requireRole('admin'), (req, res) => {
  const { term, session, class: cls } = req.query;
  let q = `SELECT f.*, s.full_name, s.reg_no, s.class,
             COALESCE(SUM(fp.amount_paid),0) as paid
           FROM fees f
           JOIN students s ON s.id = f.student_id
           LEFT JOIN fee_payments fp ON fp.fee_id = f.id WHERE 1=1`;
  const p = [];
  if (term)    { q += ' AND f.term = ?';    p.push(term); }
  if (session) { q += ' AND f.session = ?'; p.push(session); }
  if (cls)     { q += ' AND s.class = ?';   p.push(cls); }
  q += ' GROUP BY f.id ORDER BY s.class, s.full_name';
  const fees = db.prepare(q).all(...p).map(f => ({ ...f, balance: f.amount - f.paid }));
  res.json({ success: true, fees });
});

// GET /api/fees/arrears — students with outstanding balance
router.get('/arrears', authenticate, requireRole('admin'), (req, res) => {
  const { term, session } = req.query;
  let q = `SELECT f.*, s.full_name, s.reg_no, s.class,
             COALESCE(SUM(fp.amount_paid),0) as paid
           FROM fees f JOIN students s ON s.id=f.student_id
           LEFT JOIN fee_payments fp ON fp.fee_id=f.id WHERE 1=1`;
  const p = [];
  if (term)    { q += ' AND f.term = ?';    p.push(term); }
  if (session) { q += ' AND f.session = ?'; p.push(session); }
  q += ' GROUP BY f.id HAVING (f.amount - paid) > 0 ORDER BY s.class, s.full_name';
  const rows = db.prepare(q).all(...p).map(f => ({ ...f, balance: f.amount - f.paid }));
  res.json({ success: true, arrears: rows });
});

// POST /api/fees — create fee record (admin only)
router.post('/', authenticate, requireRole('admin'), (req, res) => {
  const { student_id, category, amount, term, session, due_date, description } = req.body;
  if (!student_id || !amount || !term || !session)
    return res.status(400).json({ success: false, message: 'student_id, amount, term and session required' });
  const r = db.prepare(`INSERT INTO fees (student_id,category,amount,term,session,due_date,description,created_by)
    VALUES (?,?,?,?,?,?,?,?)`).run(student_id, category || 'School Fees', amount, term, session, due_date||null, description||null, req.user.userId);
  db.logAudit(req.user.userId, req.user.username, 'CREATE_FEE', 'fees', r.lastInsertRowid,
    `Created ${category||'School Fees'} ₦${amount} for student ${student_id}`);
  res.status(201).json({ success: true, fee: db.prepare('SELECT * FROM fees WHERE id=?').get(r.lastInsertRowid) });
});

// POST /api/fees/:id/pay — record a payment
router.post('/:id/pay', authenticate, requireRole('admin'), (req, res) => {
  const { amount_paid, payment_date, receipt_no, notes } = req.body;
  if (!amount_paid) return res.status(400).json({ success: false, message: 'amount_paid required' });
  const fee = db.prepare('SELECT * FROM fees WHERE id=?').get(req.params.id);
  if (!fee) return res.status(404).json({ success: false, message: 'Fee not found' });
  const r = db.prepare(`INSERT INTO fee_payments (fee_id,amount_paid,payment_date,receipt_no,notes,recorded_by)
    VALUES (?,?,?,?,?,?)`).run(req.params.id, amount_paid, payment_date||null, receipt_no||null, notes||null, req.user.userId);
  db.logAudit(req.user.userId, req.user.username, 'RECORD_PAYMENT', 'fee_payments', r.lastInsertRowid,
    `Payment ₦${amount_paid} for fee ${req.params.id}`);
  res.json({ success: true, payment: db.prepare('SELECT * FROM fee_payments WHERE id=?').get(r.lastInsertRowid) });
});

// GET /api/fees/:id/payments — payment history for a fee
router.get('/:id/payments', authenticate, requireRole('admin'), (req, res) => {
  const payments = db.prepare('SELECT * FROM fee_payments WHERE fee_id=? ORDER BY created_at DESC').all(req.params.id);
  res.json({ success: true, payments });
});

// DELETE /api/fees/:id
router.delete('/:id', authenticate, requireRole('admin'), (req, res) => {
  db.prepare('DELETE FROM fees WHERE id=?').run(req.params.id);
  db.logAudit(req.user.userId, req.user.username, 'DELETE_FEE', 'fees', req.params.id, null);
  res.json({ success: true });
});

module.exports = router;
