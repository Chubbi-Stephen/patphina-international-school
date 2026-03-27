import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'

// Public pages
import PublicLayout   from './components/layout/PublicLayout'
import Home           from './pages/public/Home'
import About          from './pages/public/About'
import Admissions     from './pages/public/Admissions'
import Login          from './pages/public/Login'

// Student pages
import StudentLayout  from './components/layout/StudentLayout'
import StudentDash    from './pages/student/Dashboard'
import StudentResults from './pages/student/Results'
import StudentProfile from './pages/student/Profile'
import StudentFees    from './pages/student/Fees'
import StudentExams   from './pages/student/Exams'

// Teacher pages
import TeacherLayout    from './components/layout/TeacherLayout'
import TeacherDash      from './pages/teacher/Dashboard'
import TeacherResults   from './pages/teacher/Results'
import TeacherQuestions from './pages/teacher/Questions'
import TeacherStudents  from './pages/teacher/Students'
import TeacherAttendance from './pages/teacher/Attendance'

// Admin pages
import AdminLayout        from './components/layout/AdminLayout'
import AdminDash          from './pages/admin/Dashboard'
import AdminStudents      from './pages/admin/Students'
import AdminTeachers      from './pages/admin/Teachers'
import AdminResults       from './pages/admin/Results'
import AdminAnnouncements from './pages/admin/Announcements'
import AdminAttendance    from './pages/admin/Attendance'
import AdminFees          from './pages/admin/Fees'
import AdminAdmissions    from './pages/admin/Admissions'
import AdminTimetable     from './pages/admin/Timetable'
import AdminSessions      from './pages/admin/Sessions'
import AdminSubjects      from './pages/admin/Subjects'
import AdminAuditLog      from './pages/admin/AuditLog'
import AdminProfile       from './pages/admin/Profile'

function ProtectedRoute({ children, role }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (role && user.role !== role) return <Navigate to="/login" replace />
  return children
}

function RoleRedirect() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.role === 'admin')   return <Navigate to="/admin" replace />
  if (user.role === 'teacher') return <Navigate to="/teacher" replace />
  if (user.role === 'student') return <Navigate to="/student" replace />
  return <Navigate to="/login" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public */}
        <Route element={<PublicLayout />}>
          <Route path="/"           element={<Home />} />
          <Route path="/about"      element={<About />} />
          <Route path="/admissions" element={<Admissions />} />
        </Route>
        <Route path="/login"  element={<Login />} />
        <Route path="/portal" element={<RoleRedirect />} />

        {/* Student */}
        <Route path="/student" element={<ProtectedRoute role="student"><StudentLayout /></ProtectedRoute>}>
          <Route index          element={<StudentDash />} />
          <Route path="results" element={<StudentResults />} />
          <Route path="profile" element={<StudentProfile />} />
          <Route path="fees"    element={<StudentFees />} />
          <Route path="exams"   element={<StudentExams />} />
        </Route>

        {/* Teacher */}
        <Route path="/teacher" element={<ProtectedRoute role="teacher"><TeacherLayout /></ProtectedRoute>}>
          <Route index             element={<TeacherDash />} />
          <Route path="results"    element={<TeacherResults />} />
          <Route path="questions"  element={<TeacherQuestions />} />
          <Route path="students"   element={<TeacherStudents />} />
          <Route path="attendance" element={<TeacherAttendance />} />
        </Route>

        {/* Admin */}
        <Route path="/admin" element={<ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>}>
          <Route index                  element={<AdminDash />} />
          <Route path="students"        element={<AdminStudents />} />
          <Route path="teachers"        element={<AdminTeachers />} />
          <Route path="results"         element={<AdminResults />} />
          <Route path="announcements"   element={<AdminAnnouncements />} />
          <Route path="attendance"      element={<AdminAttendance />} />
          <Route path="fees"            element={<AdminFees />} />
          <Route path="admissions"      element={<AdminAdmissions />} />
          <Route path="timetable"       element={<AdminTimetable />} />
          <Route path="sessions"        element={<AdminSessions />} />
          <Route path="subjects"        element={<AdminSubjects />} />
          <Route path="audit-log"       element={<AdminAuditLog />} />
          <Route path="profile"         element={<AdminProfile />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
