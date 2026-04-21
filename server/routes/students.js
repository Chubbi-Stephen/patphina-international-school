const express = require('express');
const bcrypt  = require('bcryptjs');
const multer  = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const path    = require('path');
const db      = require('../db/database');
const { authenticate, requireRole } = require('../middleware/auth');
const router  = express.Router();

// Smart storage: Use Cloudinary if env var exists, else fallback to local disk
let storage;
if (process.env.CLOUDINARY_URL) {
  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: { folder: 'patphina_students', allowed_formats: ['jpg', 'png', 'jpeg'] },
  });
} else {
  storage = multer.diskStorage({
    destination: 'uploads/photos/',
    filename: (req, file, cb) => cb(null, `student_${Date.now()}${path.extname(file.originalname)}`)
  });
}
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit

// Add photo upload endpoint
router.post('/upload-photo', authenticate, upload.single('photo'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
  
  const photoUrl = process.env.CLOUDINARY_URL ? req.file.path : `/uploads/photos/${req.file.filename}`;
  
  // Allow student to update their own, or admin to update any
  const userId = req.body.studentId ? 
    db.prepare('SELECT user_id FROM students WHERE id=?').get(req.body.studentId)?.user_id : req.user.userId;
  
  if (req.user.role === 'student' && userId !== req.user.userId)
    return res.status(403).json({ success: false, message: 'Unauthorized' });

  db.prepare('UPDATE students SET photo_url=? WHERE user_id=?').run(photoUrl, userId);
  res.json({ success: true, photo_url: photoUrl });
});

// Bulk Import
router.post('/bulk-import', authenticate, requireRole('admin'), (req, res) => {
  const { students } = req.body;
  if (!Array.isArray(students)) return res.status(400).json({ success: false, message: 'Expected array' });
  
  let added = 0, skipped = 0;
  const insUser = db.prepare("INSERT INTO users (username,password,role) VALUES (?,?,'student')");
  const insStd  = db.prepare(`INSERT INTO students (user_id,reg_no,full_name,class,gender,parent_name,parent_phone) VALUES (?,?,?,?,?,?,?)`);
  const check   = db.prepare("SELECT id FROM users WHERE username=?");

  const insertAll = db.transaction((list) => {
    for (const s of list) {
      if (check.get(s.reg_no)) { skipped++; continue; }
      const u = insUser.run(s.reg_no, bcrypt.hashSync(s.password || 'student123', 10));
      insStd.run(u.lastInsertRowid, s.reg_no, s.full_name, s.class, s.gender||null, s.parent_name||null, s.parent_phone||null);
      added++;
    }
  });
  insertAll(students);
  db.logAudit(req.user.userId, req.user.username, 'BULK_IMPORT', 'students', null, `Imported ${added} students`);
  res.json({ success: true, message: `Imported ${added} students. Skipped ${skipped} duplicates.` });
});

// Promote Class
router.post('/promote', authenticate, requireRole('admin'), (req, res) => {
  const { from_class, to_class } = req.body;
  if (!from_class || !to_class) return res.status(400).json({ success: false, message: 'from_class and to_class required' });
  const r = db.prepare('UPDATE students SET class=? WHERE class=? AND is_active=1').run(to_class, from_class);
  db.logAudit(req.user.userId, req.user.username, 'PROMOTE_CLASS', 'students', null, `Promoted ${r.changes} students from ${from_class} to ${to_class}`);
  res.json({ success: true, message: `Promoted ${r.changes} students` });
});

// GET /api/students/me
router.get('/me', authenticate, requireRole('student'), (req, res) => {
  const student = db.prepare('SELECT * FROM students WHERE user_id = ?').get(req.user.userId);
  if (!student) return res.status(404).json({ success: false, message: 'Student profile not found' });
  res.json({ success: true, student });
});

// GET /api/students
router.get('/', authenticate, requireRole('admin', 'teacher'), (req, res) => {
  const { class: cls, search, limit = 500, offset = 0 } = req.query;
  let query = 'SELECT * FROM students WHERE is_active=1';
  const params = [];

  if (cls) { query += ' AND class = ?'; params.push(cls); }
  if (search) {
    query += ' AND (full_name LIKE ? OR reg_no LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }
  query += ' ORDER BY full_name LIMIT ? OFFSET ?';
  params.push(Number(limit), Number(offset));
  
  res.json({ success: true, students: db.prepare(query).all(...params) });
});

// GET /api/students/:id
router.get('/:id', authenticate, (req, res) => {
  const student = db.prepare('SELECT * FROM students WHERE id = ?').get(req.params.id);
  if (!student) return res.status(404).json({ success: false, message: 'Not found' });
  res.json({ success: true, student });
});

// POST /api/students (Single)
router.post('/', authenticate, requireRole('admin'), (req, res) => {
  const { reg_no, full_name, class: cls, dob, gender, parent_name, parent_phone, address, password } = req.body;
  
  if (!reg_no || !full_name || !cls)
    return res.status(400).json({ success: false, message: 'Reg No, Name and Class are required' });

  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(reg_no);
  if (existing) return res.status(400).json({ success: false, message: 'Reg No already exists' });

  try {
    const insertTx = db.transaction(() => {
      const uResult = db.prepare("INSERT INTO users (username, password, role) VALUES (?, ?, 'student')")
        .run(reg_no, bcrypt.hashSync(password || 'student123', 10));
      
      const sResult = db.prepare(`
        INSERT INTO students (user_id, reg_no, full_name, class, dob, gender, parent_name, parent_phone, address)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(uResult.lastInsertRowid, reg_no, full_name, cls, dob||null, gender||null, parent_name||null, parent_phone||null, address||null);
      
      return sResult.lastInsertRowid;
    });

    const studentId = insertTx();
    db.logAudit(req.user.userId, req.user.username, 'CREATE_STUDENT', 'students', studentId, `${reg_no}: ${full_name}`);
    res.status(201).json({ success: true, message: 'Student created automatically' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

// PUT /api/students/:id
router.put('/:id', authenticate, requireRole('admin'), (req, res) => {
  const { full_name, class: cls, dob, gender, parent_name, parent_phone, address } = req.body;
  if (!full_name || !cls) return res.status(400).json({ success: false, message: 'Name and class required' });

  db.prepare(`
    UPDATE students SET full_name=?, class=?, dob=?, gender=?, parent_name=?, parent_phone=?, address=?
    WHERE id=?
  `).run(full_name, cls, dob||null, gender||null, parent_name||null, parent_phone||null, address||null, req.params.id);
  
  db.logAudit(req.user.userId, req.user.username, 'UPDATE_STUDENT', 'students', req.params.id, null);
  res.json({ success: true, message: 'Student updated' });
});

// DELETE /api/students/:id
router.delete('/:id', authenticate, requireRole('admin'), (req, res) => {
  const student = db.prepare('SELECT user_id, reg_no FROM students WHERE id = ?').get(req.params.id);
  if (student) {
    db.prepare('DELETE FROM users WHERE id = ?').run(student.user_id); // Cascades
    db.logAudit(req.user.userId, req.user.username, 'DELETE_STUDENT', 'students', req.params.id, student.reg_no);
  }
  res.json({ success: true, message: 'Student deleted' });
});

module.exports = router;
