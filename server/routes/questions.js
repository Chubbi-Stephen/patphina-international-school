const express = require('express');
const db      = require('../db/database');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/questions/student (Secure: Omit answers)
router.get('/student', authenticate, requireRole('student'), (req, res) => {
  const { subject, term, session } = req.query;
  const student = db.prepare('SELECT class FROM students WHERE user_id = ?').get(req.user.userId);
  if (!student) return res.status(403).json({ success: false, message: 'Student profile not found' });

  // Exclude 'answer' to prevent cheating
  const q = `SELECT id, question, option_a, option_b, option_c, option_d, marks 
             FROM questions WHERE class = ? AND subject = ? AND term = ? AND session = ?`;
  
  const exams = db.prepare(q).all(student.class, subject, term, session);
  res.json({ success: true, questions: exams });
});

// POST /api/questions/submit (Auto-grader)
router.post('/submit', authenticate, requireRole('student'), (req, res) => {
  const { subject, term, session, answers } = req.body; // answers: { [questionId]: 'A'|'B'|'C'|'D' }
  const student = db.prepare('SELECT id, class FROM students WHERE user_id = ?').get(req.user.userId);
  if (!student) return res.status(403).json({ success: false, message: 'Student profile not found' });

  const questions = db.prepare(`SELECT id, answer, marks FROM questions WHERE class=? AND subject=? AND term=? AND session=?`)
    .all(student.class, subject, term, session);

  let totalScore = 0;
  let maxScore = 0;

  questions.forEach(q => {
    maxScore += q.marks;
    if (answers[q.id] === q.answer) {
      totalScore += q.marks;
    }
  });

  // Scale score to 70 marks (Standard Exam Weight)
  const finalExamScore = maxScore > 0 ? Math.round((totalScore / maxScore) * 70) : 0;

  // Save to results system
  const existing = db.prepare(`SELECT id FROM results WHERE student_id=? AND subject=? AND term=? AND session=?`)
    .get(student.id, subject, term, session);

  if (existing) {
    db.prepare(`UPDATE results SET exam_score=? WHERE id=?`).run(finalExamScore, existing.id);
  } else {
    // If no CA exists, insert with 0 CA
    db.prepare(`INSERT INTO results (student_id, subject, class, term, session, exam_score, ca_score) VALUES (?,?,?,?,?,?,?)`)
      .run(student.id, subject, student.class, term, session, finalExamScore, 0);
  }
  
  // Recompute class positions after auto-grading
  try {
    const { computeClassPositions } = require('./results');
    computeClassPositions(subject, student.class, term, session);
  } catch (e) {
    // Failsafe if external function errors out
  }

  db.logAudit(req.user.userId, req.user.username, 'SUBMIT_EXAM', 'results', student.id, `Scored ${finalExamScore}/70 in ${subject}`);
  res.json({ success: true, score: finalExamScore, max: 70 });
});

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
  if (!cls || !subject || !term || !session || !question || !option_a || !option_b || !option_c || !option_d || !answer)
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
