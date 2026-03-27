const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'patphina.db');
let db;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initSchema();
  }
  return db;
}

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      username   TEXT    NOT NULL UNIQUE,
      password   TEXT    NOT NULL,
      role       TEXT    NOT NULL CHECK(role IN ('student','teacher','admin')),
      created_at TEXT    DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS admin_users (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      full_name  TEXT    NOT NULL DEFAULT 'Administrator',
      role_title TEXT    DEFAULT 'Admin'
    );

    CREATE TABLE IF NOT EXISTS teachers (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      staff_id    TEXT    NOT NULL UNIQUE,
      full_name   TEXT    NOT NULL,
      subject     TEXT    NOT NULL,
      classes     TEXT    DEFAULT '[]',
      phone       TEXT,
      email       TEXT,
      is_active   INTEGER DEFAULT 1,
      created_at  TEXT    DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS students (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      reg_no       TEXT    NOT NULL UNIQUE,
      full_name    TEXT    NOT NULL,
      class        TEXT    NOT NULL,
      dob          TEXT,
      gender       TEXT,
      parent_name  TEXT,
      parent_phone TEXT,
      address      TEXT,
      photo_url    TEXT,
      is_active    INTEGER DEFAULT 1,
      created_at   TEXT    DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS results (
      id                INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id        INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      teacher_id        INTEGER REFERENCES teachers(id),
      subject           TEXT    NOT NULL,
      term              TEXT    NOT NULL,
      session           TEXT    NOT NULL,
      class             TEXT    NOT NULL,
      ca_score          REAL    DEFAULT 0,
      exam_score        REAL    DEFAULT 0,
      grade             TEXT,
      remark            TEXT,
      position          INTEGER,
      class_size        INTEGER,
      teacher_comment   TEXT,
      principal_comment TEXT,
      approved          INTEGER DEFAULT 0,
      created_at        TEXT    DEFAULT (datetime('now')),
      UNIQUE(student_id, subject, term, session)
    );

    CREATE TABLE IF NOT EXISTS questions (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      teacher_id INTEGER REFERENCES teachers(id) ON DELETE CASCADE,
      subject    TEXT    NOT NULL,
      class      TEXT    NOT NULL,
      term       TEXT    NOT NULL,
      session    TEXT    NOT NULL,
      question   TEXT    NOT NULL,
      option_a   TEXT    NOT NULL,
      option_b   TEXT    NOT NULL,
      option_c   TEXT    NOT NULL,
      option_d   TEXT    NOT NULL,
      answer     TEXT    NOT NULL,
      marks      INTEGER DEFAULT 1,
      created_at TEXT    DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS announcements (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      title      TEXT    NOT NULL,
      body       TEXT    NOT NULL,
      target     TEXT    DEFAULT 'all',
      created_by INTEGER REFERENCES users(id),
      created_at TEXT    DEFAULT (datetime('now'))
    );

    -- ATTENDANCE
    CREATE TABLE IF NOT EXISTS attendance (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      teacher_id INTEGER REFERENCES teachers(id),
      class      TEXT    NOT NULL,
      date       TEXT    NOT NULL,
      status     TEXT    NOT NULL CHECK(status IN ('present','absent','late','excused')),
      term       TEXT    NOT NULL,
      session    TEXT    NOT NULL,
      note       TEXT,
      created_at TEXT    DEFAULT (datetime('now')),
      UNIQUE(student_id, date)
    );

    -- FEES
    CREATE TABLE IF NOT EXISTS fees (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id  INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      category    TEXT    NOT NULL DEFAULT 'School Fees',
      amount      REAL    NOT NULL,
      term        TEXT    NOT NULL,
      session     TEXT    NOT NULL,
      due_date    TEXT,
      description TEXT,
      created_by  INTEGER REFERENCES users(id),
      created_at  TEXT    DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS fee_payments (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      fee_id       INTEGER NOT NULL REFERENCES fees(id) ON DELETE CASCADE,
      amount_paid  REAL    NOT NULL,
      payment_date TEXT    NOT NULL DEFAULT (date('now')),
      receipt_no   TEXT,
      notes        TEXT,
      recorded_by  INTEGER REFERENCES users(id),
      created_at   TEXT    DEFAULT (datetime('now'))
    );

    -- ADMISSIONS
    CREATE TABLE IF NOT EXISTS admissions (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name     TEXT    NOT NULL,
      dob           TEXT,
      gender        TEXT,
      parent_name   TEXT    NOT NULL,
      parent_phone  TEXT    NOT NULL,
      parent_email  TEXT,
      class_applied TEXT    NOT NULL,
      session       TEXT    NOT NULL,
      address       TEXT,
      prev_school   TEXT,
      status        TEXT    DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected','enrolled')),
      notes         TEXT,
      created_at    TEXT    DEFAULT (datetime('now'))
    );

    -- TIMETABLE
    CREATE TABLE IF NOT EXISTS timetable (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      class       TEXT    NOT NULL,
      day         TEXT    NOT NULL CHECK(day IN ('Monday','Tuesday','Wednesday','Thursday','Friday')),
      period      INTEGER NOT NULL,
      start_time  TEXT    NOT NULL,
      end_time    TEXT    NOT NULL,
      subject     TEXT    NOT NULL,
      teacher_id  INTEGER REFERENCES teachers(id) ON DELETE SET NULL,
      term        TEXT    NOT NULL,
      session     TEXT    NOT NULL,
      created_at  TEXT    DEFAULT (datetime('now')),
      UNIQUE(class, day, period, term, session)
    );

    -- SUBJECTS
    CREATE TABLE IF NOT EXISTS subjects (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      class        TEXT    NOT NULL,
      name         TEXT    NOT NULL,
      is_active    INTEGER DEFAULT 1,
      created_at   TEXT    DEFAULT (datetime('now')),
      UNIQUE(class, name)
    );

    -- SESSIONS
    CREATE TABLE IF NOT EXISTS sessions (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      name         TEXT    NOT NULL UNIQUE,
      current_term TEXT    NOT NULL DEFAULT '1st Term',
      is_active    INTEGER DEFAULT 0,
      created_at   TEXT    DEFAULT (datetime('now'))
    );

    -- AUDIT LOG
    CREATE TABLE IF NOT EXISTS audit_log (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id    INTEGER REFERENCES users(id),
      username   TEXT,
      action     TEXT    NOT NULL,
      entity     TEXT    NOT NULL,
      entity_id  INTEGER,
      detail     TEXT,
      created_at TEXT    DEFAULT (datetime('now'))
    );
  `);

  // Seed default session if none exists
  const sessionExists = db.prepare('SELECT id FROM sessions LIMIT 1').get();
  if (!sessionExists) {
    db.prepare("INSERT INTO sessions (name, current_term, is_active) VALUES ('2025/2026', '2nd Term', 1)").run();
  }

  // Seed default subjects if none exist
  const subjectExists = db.prepare('SELECT id FROM subjects LIMIT 1').get();
  if (!subjectExists) {
    const defaultSubjects = [
      ['JSS1A','Mathematics'],['JSS1A','English Language'],['JSS1A','Basic Science'],['JSS1A','Social Studies'],['JSS1A','CRS'],['JSS1A','Computer Studies'],['JSS1A','Fine Art'],['JSS1A','Civic Education'],
      ['JSS1B','Mathematics'],['JSS1B','English Language'],['JSS1B','Basic Science'],['JSS1B','Social Studies'],['JSS1B','CRS'],['JSS1B','Computer Studies'],['JSS1B','Fine Art'],['JSS1B','Civic Education'],
      ['JSS2A','Mathematics'],['JSS2A','English Language'],['JSS2A','Basic Science'],['JSS2A','Social Studies'],['JSS2A','CRS'],['JSS2A','Computer Studies'],['JSS2A','Fine Art'],['JSS2A','Civic Education'],
      ['JSS2B','Mathematics'],['JSS2B','English Language'],['JSS2B','Basic Science'],['JSS2B','Social Studies'],['JSS2B','CRS'],['JSS2B','Computer Studies'],['JSS2B','Fine Art'],['JSS2B','Civic Education'],
      ['JSS3A','Mathematics'],['JSS3A','English Language'],['JSS3A','Physics'],['JSS3A','Chemistry'],['JSS3A','Biology'],['JSS3A','CRS'],['JSS3A','Computer Studies'],['JSS3A','Civic Education'],
      ['JSS3B','Mathematics'],['JSS3B','English Language'],['JSS3B','Physics'],['JSS3B','Chemistry'],['JSS3B','Biology'],['JSS3B','CRS'],['JSS3B','Computer Studies'],['JSS3B','Civic Education'],
      ['SS1A','Mathematics'],['SS1A','English Language'],['SS1A','Physics'],['SS1A','Chemistry'],['SS1A','Biology'],['SS1A','Further Maths'],['SS1A','Economics'],['SS1A','Commerce'],['SS1A','Accounting'],['SS1A','Geography'],
      ['SS1B','Mathematics'],['SS1B','English Language'],['SS1B','Physics'],['SS1B','Chemistry'],['SS1B','Biology'],['SS1B','Further Maths'],['SS1B','Economics'],['SS1B','Commerce'],['SS1B','Accounting'],['SS1B','Geography'],
      ['SS2A','Mathematics'],['SS2A','English Language'],['SS2A','Physics'],['SS2A','Chemistry'],['SS2A','Biology'],['SS2A','Further Maths'],['SS2A','Economics'],['SS2A','Commerce'],['SS2A','Accounting'],['SS2A','Geography'],
      ['SS2B','Mathematics'],['SS2B','English Language'],['SS2B','Physics'],['SS2B','Chemistry'],['SS2B','Biology'],['SS2B','Further Maths'],['SS2B','Economics'],['SS2B','Commerce'],['SS2B','Accounting'],['SS2B','Geography'],
      ['SS3A','Mathematics'],['SS3A','English Language'],['SS3A','Physics'],['SS3A','Chemistry'],['SS3A','Biology'],['SS3A','Further Maths'],['SS3A','Economics'],['SS3A','Commerce'],['SS3A','Accounting'],['SS3A','Geography'],
      ['SS3B','Mathematics'],['SS3B','English Language'],['SS3B','Physics'],['SS3B','Chemistry'],['SS3B','Biology'],['SS3B','Further Maths'],['SS3B','Economics'],['SS3B','Commerce'],['SS3B','Accounting'],['SS3B','Geography'],
    ];
    const ins = db.prepare("INSERT OR IGNORE INTO subjects (class, name) VALUES (?, ?)");
    const insertAll = db.transaction((rows) => { for (const r of rows) ins.run(...r); });
    insertAll(defaultSubjects);
  }
}

function computeGrade(total) {
  if (total >= 75) return { grade: 'A1', remark: 'Excellent' };
  if (total >= 70) return { grade: 'B2', remark: 'Very Good' };
  if (total >= 65) return { grade: 'B3', remark: 'Good' };
  if (total >= 60) return { grade: 'C4', remark: 'Credit' };
  if (total >= 55) return { grade: 'C5', remark: 'Credit' };
  if (total >= 50) return { grade: 'C6', remark: 'Credit' };
  if (total >= 45) return { grade: 'D7', remark: 'Pass' };
  if (total >= 40) return { grade: 'E8', remark: 'Pass' };
  return { grade: 'F9', remark: 'Fail' };
}

function logAudit(userId, username, action, entity, entityId, detail) {
  try {
    getDb().prepare(
      'INSERT INTO audit_log (user_id, username, action, entity, entity_id, detail) VALUES (?,?,?,?,?,?)'
    ).run(userId || null, username || null, action, entity, entityId || null, detail || null);
  } catch (e) {}
}

const instance = getDb();
instance.computeGrade = computeGrade;
instance.logAudit     = logAudit;
instance.getDb        = getDb;
module.exports = instance;
