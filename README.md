# Patphina International School Management System

A full-stack school management platform with:
- **Public website** — school info, admissions, contact
- **Student portal** — login with reg number, view bio-data & results
- **Teacher portal** — set exam questions, upload & manage results
- **Admin dashboard** — manage students, teachers, classes, and reports

## Tech Stack
- **Backend:** Node.js, Express, SQLite (via better-sqlite3), JWT auth, bcrypt
- **Frontend:** React 18, Tailwind CSS, Lucide Icons, React Router, Axios

---

## Quick Start (3 steps)

### 1. Install all dependencies
```bash
npm run install:all
```

### 2. Seed the database (creates sample students, teachers, admin)
```bash
cd server && npm run seed
```

### 3. Start the app
```bash
# From root folder — starts both backend and frontend together
npm run dev
```

Then open: **http://localhost:5173**

---

## Default Login Credentials (after seeding)

| Role    | Username / Reg No | Password     |
|---------|-------------------|--------------|
| Admin   | `admin`           | `admin123`   |
| Teacher | `TCH001`          | `teacher123` |
| Teacher | `TCH002`          | `teacher123` |
| Student | `PIS/2024/001`    | `student123` |
| Student | `PIS/2024/002`    | `student123` |
| Student | `PIS/2024/003`    | `student123` |

---

## Folder Structure
```
patphina/
├── package.json          ← root (runs both server + client)
├── server/
│   ├── index.js          ← Express entry point
│   ├── package.json
│   ├── .env              ← JWT_SECRET, PORT (auto-created on first run)
│   ├── db/
│   │   ├── database.js   ← SQLite connection + schema
│   │   └── seed.js       ← seed script
│   ├── middleware/
│   │   └── auth.js       ← JWT verify middleware
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── studentController.js
│   │   ├── teacherController.js
│   │   └── adminController.js
│   └── routes/
│       ├── auth.js
│       ├── students.js
│       ├── teachers.js
│       └── admin.js
└── client/
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── context/
        │   └── AuthContext.jsx
        ├── lib/
        │   └── api.js          ← Axios instance
        ├── hooks/
        │   └── useAuth.js
        ├── components/
        │   ├── layout/         ← Sidebar, Navbar, ProtectedRoute
        │   ├── ui/             ← Button, Card, Badge, Modal, Table
        │   ├── public/         ← Landing page sections
        │   ├── student/        ← Student portal components
        │   ├── teacher/        ← Teacher portal components
        │   └── admin/          ← Admin dashboard components
        └── pages/
            ├── LandingPage.jsx
            ├── LoginPage.jsx
            ├── student/
            ├── teacher/
            └── admin/
```

---

## Connecting to a Real Form (Admissions)
In `client/src/components/public/AdmissionForm.jsx`, replace the mock submit with:
```js
await api.post('/api/admissions', formData)
```

## Going Live
1. Set `NODE_ENV=production` in server `.env`
2. Run `npm run build` to build the React app
3. The Express server will serve the built frontend automatically
4. Deploy to any VPS (DigitalOcean, Render, Railway)
