import { Outlet } from 'react-router-dom'
import { useState } from 'react'
import { LayoutDashboard, Users, UserCheck, FileText, Megaphone, Menu, Calendar, BookOpen, Clock, CreditCard, ClipboardList, ShieldAlert, UserCog } from 'lucide-react'
import Sidebar from './Sidebar'

const links = [
  { to: '/admin',                icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/students',       icon: Users,           label: 'Students' },
  { to: '/admin/teachers',       icon: UserCheck,       label: 'Teachers' },
  { to: '/admin/results',        icon: FileText,        label: 'Results' },
  { to: '/admin/attendance',     icon: ClipboardList,   label: 'Attendance' },
  { to: '/admin/timetable',      icon: Clock,           label: 'Timetable' },
  { to: '/admin/subjects',       icon: BookOpen,        label: 'Subjects' },
  { to: '/admin/fees',           icon: CreditCard,      label: 'Fees & Payments' },
  { to: '/admin/admissions',     icon: Users,           label: 'Admissions' },
  { to: '/admin/announcements',  icon: Megaphone,       label: 'Announcements' },
  { to: '/admin/sessions',       icon: Calendar,        label: 'Sessions & Terms' },
  { to: '/admin/audit-log',      icon: ShieldAlert,     label: 'Audit Log' },
  { to: '/admin/profile',        icon: UserCog,         label: 'Profile & Settings' },
]

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  return (
    <div className="flex min-h-screen bg-gray-50">
      {sidebarOpen && <div className="fixed inset-0 bg-black/30 z-30 md:hidden" onClick={() => setSidebarOpen(false)}/>}
      <div className={`fixed md:static z-40 md:z-auto transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <Sidebar links={links} roleLabel="Admin Panel" roleColor="purple" onClose={() => setSidebarOpen(false)}/>
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        <div className="md:hidden flex items-center gap-3 bg-white px-4 py-3 border-b border-gray-100 sticky top-0 z-20">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-600"><Menu size={22}/></button>
          <p className="font-semibold text-gray-800 text-sm">Admin Panel</p>
        </div>
        <main className="flex-1 p-4 md:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
