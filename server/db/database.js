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
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      teacher_id INTEGER REFERENCES teachers(id),
      subject    TEXT    NOT NULL,
      term       TEXT    NOT NULL,
      session    TEXT    NOT NULL,
      class      TEXT    NOT NULL,
      ca_score   REAL    DEFAULT 0,
      exam_score REAL    DEFAULT 0,
      grade      TEXT,
      remark     TEXT,
      created_at TEXT    DEFAULT (datetime('now')),
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
  `);
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

const instance = getDb();
instance.computeGrade = computeGrade;
instance.getDb = getDb;
module.exports = instance;
