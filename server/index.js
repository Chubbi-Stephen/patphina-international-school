require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');
require('./utils/backup'); // Initialize daily automated backups

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth',       require('./routes/auth'));
app.use('/api/students',   require('./routes/students'));
app.use('/api/teachers',   require('./routes/teachers'));
app.use('/api/results',    require('./routes/results'));
app.use('/api/questions',  require('./routes/questions'));
app.use('/api/admin',      require('./routes/admin'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/fees',       require('./routes/fees'));
app.use('/api/admissions', require('./routes/admissions'));
app.use('/api/subjects',   require('./routes/subjects'));
app.use('/api/sessions',   require('./routes/sessions'));
app.use('/api/timetable',  require('./routes/timetable'));
app.use('/api/audit',      require('./routes/audit'));

app.get('/api/health', (_, res) => res.json({ status: 'ok', app: 'Patphina School System' }));

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get('*', (_, res) => res.sendFile(path.join(__dirname, '../client/dist/index.html')));
}

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Server error' });
});

app.listen(PORT, () => {
  console.log(`\n🏫 Patphina Server → http://localhost:${PORT}`);
  console.log(`📚 Run 'npm run dev' to start with hot reload\n`);
});
