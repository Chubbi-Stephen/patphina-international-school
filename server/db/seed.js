require("dotenv").config({
	path: require("path").join(__dirname, "../../.env"),
});
const bcrypt = require("bcryptjs");
const db = require("./database");

console.log("🌱 Seeding Patphina database...\n");

const hash = (pw) => bcrypt.hashSync(pw, 10);

db.pragma("foreign_keys = OFF");
db.exec(`
  DELETE FROM questions;
  DELETE FROM results;
  DELETE FROM announcements;
  DELETE FROM admin_users;
  DELETE FROM teachers;
  DELETE FROM students;
  DELETE FROM users;
`);
db.pragma("foreign_keys = ON");

// ── ADMIN ─────────────────────────────────────────────────────────────────────
const adminUser = db
	.prepare(`INSERT INTO users(username,password,role) VALUES(?,?,?)`)
	.run("admin", hash("admin123"), "admin");
db.prepare(
	`INSERT INTO admin_users(user_id,full_name,role_title) VALUES(?,?,?)`,
).run(adminUser.lastInsertRowid, "Mrs. Patricia Okonkwo", "Principal");
console.log("✅ Admin created   → username: admin | password: admin123");

// ── TEACHERS ──────────────────────────────────────────────────────────────────
const teachersData = [
	{
		staff_id: "TCH001",
		name: "Mr. Emmanuel Okafor",
		subject: "Mathematics",
		classes: JSON.stringify(["SS1A", "SS1B", "SS2A", "SS2B"]),
		phone: "08011112222",
		email: "okafor@patphina.edu.ng",
	},
	{
		staff_id: "TCH002",
		name: "Mrs. Grace Adeyemi",
		subject: "English Language",
		classes: JSON.stringify(["JSS3A", "JSS3B", "SS1A", "SS1B"]),
		phone: "08033334444",
		email: "adeyemi@patphina.edu.ng",
	},
	{
		staff_id: "TCH003",
		name: "Mr. Segun Babatunde",
		subject: "Physics",
		classes: JSON.stringify(["SS1A", "SS2A", "SS3A"]),
		phone: "08055556666",
		email: "babatunde@patphina.edu.ng",
	},
	{
		staff_id: "TCH004",
		name: "Mrs. Chioma Eze",
		subject: "Biology",
		classes: JSON.stringify(["SS1B", "SS2A", "SS2B", "SS3A"]),
		phone: "08077778888",
		email: "eze@patphina.edu.ng",
	},
];

const teacherIds = {};
teachersData.forEach((t) => {
	const u = db
		.prepare(`INSERT INTO users(username,password,role) VALUES(?,?,?)`)
		.run(t.staff_id, hash("teacher123"), "teacher");
	const tr = db
		.prepare(
			`INSERT INTO teachers(user_id,staff_id,full_name,subject,classes,phone,email) VALUES(?,?,?,?,?,?,?)`,
		)
		.run(
			u.lastInsertRowid,
			t.staff_id,
			t.name,
			t.subject,
			t.classes,
			t.phone,
			t.email,
		);
	teacherIds[t.staff_id] = tr.lastInsertRowid;
	console.log(
		`✅ Teacher created  → staff_id: ${t.staff_id} | password: teacher123`,
	);
});

// ── STUDENTS ──────────────────────────────────────────────────────────────────
const studentsData = [
	{
		reg_no: "PIS/2024/001",
		name: "Amara Okonkwo",
		class: "SS2A",
		dob: "2008-03-14",
		gender: "Female",
		parent: "Mrs. Ngozi Okonkwo",
		parent_phone: "08012345678",
		address: "12 Broad St, Ojo Lagos",
	},
	{
		reg_no: "PIS/2024/002",
		name: "Chidi Adeyemi",
		class: "JSS3B",
		dob: "2010-07-22",
		gender: "Male",
		parent: "Mr. Seun Adeyemi",
		parent_phone: "08098765432",
		address: "5 Apapa Rd, Lagos",
	},
	{
		reg_no: "PIS/2024/003",
		name: "Fatima Bello",
		class: "SS1C",
		dob: "2009-11-05",
		gender: "Female",
		parent: "Alhaji Bello",
		parent_phone: "08033334444",
		address: "3 Mile 2, Lagos",
	},
	{
		reg_no: "PIS/2024/004",
		name: "Tunde Fashola",
		class: "SS2A",
		dob: "2008-06-18",
		gender: "Male",
		parent: "Mr. Bisi Fashola",
		parent_phone: "08055667788",
		address: "7 Badagry Expy, Lagos",
	},
	{
		reg_no: "PIS/2024/005",
		name: "Blessing Nwosu",
		class: "JSS2A",
		dob: "2011-01-30",
		gender: "Female",
		parent: "Mrs. Ada Nwosu",
		parent_phone: "08099001122",
		address: "22 Abeokuta St, Ojo",
	},
	{
		reg_no: "PIS/2024/006",
		name: "Samuel Dike",
		class: "SS3A",
		dob: "2007-09-12",
		gender: "Male",
		parent: "Dr. Felix Dike",
		parent_phone: "08111223344",
		address: "4 Ijanikin Rd, Lagos",
	},
];

const studentIds = {};
studentsData.forEach((s) => {
	const u = db
		.prepare(`INSERT INTO users(username,password,role) VALUES(?,?,?)`)
		.run(s.reg_no, hash("student123"), "student");
	const st = db
		.prepare(
			`INSERT INTO students(user_id,reg_no,full_name,class,dob,gender,parent_name,parent_phone,address) VALUES(?,?,?,?,?,?,?,?,?)`,
		)
		.run(
			u.lastInsertRowid,
			s.reg_no,
			s.name,
			s.class,
			s.dob,
			s.gender,
			s.parent,
			s.parent_phone,
			s.address,
		);
	studentIds[s.reg_no] = st.lastInsertRowid;
	console.log(
		`✅ Student created  → reg_no: ${s.reg_no} | password: student123`,
	);
});

// ── RESULTS ───────────────────────────────────────────────────────────────────
const term = "2nd Term",
	session = "2025/2026";

const resultsData = [
	// Amara SS2A
	{
		reg: "PIS/2024/001",
		teacher: "TCH001",
		subject: "Mathematics",
		ca: 28,
		exam: 62,
	},
	{
		reg: "PIS/2024/001",
		teacher: "TCH002",
		subject: "English Language",
		ca: 25,
		exam: 60,
	},
	{
		reg: "PIS/2024/001",
		teacher: "TCH003",
		subject: "Physics",
		ca: 22,
		exam: 58,
	},
	{
		reg: "PIS/2024/001",
		teacher: "TCH004",
		subject: "Biology",
		ca: 27,
		exam: 65,
	},
	{
		reg: "PIS/2024/001",
		teacher: "TCH001",
		subject: "Further Maths",
		ca: 20,
		exam: 55,
	},
	// Chidi JSS3B
	{
		reg: "PIS/2024/002",
		teacher: "TCH001",
		subject: "Mathematics",
		ca: 30,
		exam: 68,
	},
	{
		reg: "PIS/2024/002",
		teacher: "TCH002",
		subject: "English Language",
		ca: 26,
		exam: 64,
	},
	{
		reg: "PIS/2024/002",
		teacher: "TCH004",
		subject: "Basic Science",
		ca: 24,
		exam: 60,
	},
	// Fatima SS1C
	{
		reg: "PIS/2024/003",
		teacher: "TCH001",
		subject: "Mathematics",
		ca: 18,
		exam: 45,
	},
	{
		reg: "PIS/2024/003",
		teacher: "TCH002",
		subject: "English Language",
		ca: 22,
		exam: 52,
	},
	{
		reg: "PIS/2024/003",
		teacher: "TCH003",
		subject: "Physics",
		ca: 19,
		exam: 44,
	},
	// Tunde SS2A
	{
		reg: "PIS/2024/004",
		teacher: "TCH001",
		subject: "Mathematics",
		ca: 29,
		exam: 66,
	},
	{
		reg: "PIS/2024/004",
		teacher: "TCH002",
		subject: "English Language",
		ca: 27,
		exam: 63,
	},
	{
		reg: "PIS/2024/004",
		teacher: "TCH003",
		subject: "Physics",
		ca: 25,
		exam: 60,
	},
	{
		reg: "PIS/2024/004",
		teacher: "TCH004",
		subject: "Biology",
		ca: 26,
		exam: 62,
	},
];

const insertResult = db.prepare(
	`INSERT OR REPLACE INTO results(student_id,teacher_id,subject,term,session,class,ca_score,exam_score,grade,remark) VALUES(?,?,?,?,?,?,?,?,?,?)`,
);
const getClass = db.prepare(`SELECT class FROM students WHERE id = ?`);

resultsData.forEach((r) => {
	const sid = studentIds[r.reg];
	const tid = teacherIds[r.teacher];
	const total = r.ca + r.exam;
	const { grade, remark } = db.computeGrade(total);
	const { class: cls } = getClass.get(sid);
	insertResult.run(
		sid,
		tid,
		r.subject,
		term,
		session,
		cls,
		r.ca,
		r.exam,
		grade,
		remark,
	);
});
console.log(`\n✅ Results seeded (${resultsData.length} entries)`);

// ── EXAM QUESTIONS ────────────────────────────────────────────────────────────
const insertQ = db.prepare(
	`INSERT INTO questions(teacher_id,subject,class,term,session,question,option_a,option_b,option_c,option_d,answer,marks) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)`,
);
const questionsData = [
	{
		tid: "TCH001",
		sub: "Mathematics",
		cls: "SS2A",
		q: "If 2x + 5 = 17, find x.",
		a: "4",
		b: "6",
		c: "7",
		d: "8",
		ans: "6",
	},
	{
		tid: "TCH001",
		sub: "Mathematics",
		cls: "SS2A",
		q: "Simplify: (3²)³",
		a: "27",
		b: "81",
		c: "729",
		d: "243",
		ans: "729",
	},
	{
		tid: "TCH001",
		sub: "Mathematics",
		cls: "SS2A",
		q: "What is the gradient of y = 3x + 7?",
		a: "7",
		b: "3",
		c: "10",
		d: "1",
		ans: "3",
	},
	{
		tid: "TCH002",
		sub: "English Language",
		cls: "JSS3B",
		q: "Which is a pronoun?",
		a: "Run",
		b: "She",
		c: "Beautiful",
		d: "Quickly",
		ans: "She",
	},
	{
		tid: "TCH002",
		sub: "English Language",
		cls: "JSS3B",
		q: 'The opposite of "abundant" is:',
		a: "Scarce",
		b: "Plenty",
		c: "Full",
		d: "Rich",
		ans: "Scarce",
	},
	{
		tid: "TCH003",
		sub: "Physics",
		cls: "SS2A",
		q: "What is the SI unit of force?",
		a: "Joule",
		b: "Watt",
		c: "Newton",
		d: "Pascal",
		ans: "Newton",
	},
	{
		tid: "TCH003",
		sub: "Physics",
		cls: "SS2A",
		q: "Speed = Distance ÷ ?",
		a: "Mass",
		b: "Time",
		c: "Force",
		d: "Area",
		ans: "Time",
	},
];

questionsData.forEach((q) => {
	insertQ.run(
		teacherIds[q.tid],
		q.sub,
		q.cls,
		term,
		session,
		q.q,
		q.a,
		q.b,
		q.c,
		q.d,
		q.ans,
		1,
	);
});
console.log(`✅ Questions seeded (${questionsData.length} entries)`);

// ── ANNOUNCEMENTS ─────────────────────────────────────────────────────────────
const insertAnn = db.prepare(
	`INSERT INTO announcements(title,body,target,created_by) VALUES(?,?,?,?)`,
);
insertAnn.run(
	"Welcome Back!",
	"2nd Term 2025/2026 has officially begun. All students are expected to be punctual.",
	"all",
	adminUser.lastInsertRowid,
);
insertAnn.run(
	"WAEC Registration",
	"SS3 students should submit WAEC registration forms by end of this week.",
	"students",
	adminUser.lastInsertRowid,
);
insertAnn.run(
	"Staff Meeting",
	"All teachers are reminded of the monthly staff meeting on Friday at 2pm.",
	"teachers",
	adminUser.lastInsertRowid,
);
console.log("✅ Announcements seeded");

console.log("\n🎉 Database seeding complete!\n");
console.log("━".repeat(50));
console.log("  Login credentials:");
console.log("  Admin   → admin / admin123");
console.log("  Teacher → TCH001 / teacher123");
console.log("  Student → PIS/2024/001 / student123");
console.log("━".repeat(50));
