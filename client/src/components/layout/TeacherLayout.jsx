import { Outlet } from 'react-router-dom'
import { useState } from 'react'
import { LayoutDashboard, Upload, HelpCircle, Users, Menu, ClipboardCheck } from 'lucide-react'
import Sidebar from './Sidebar'

const links = [
  { to: '/teacher',            icon: LayoutDashboard,  label: 'Dashboard' },
  { to: '/teacher/students',   icon: Users,            label: 'My Students' },
  { to: '/teacher/attendance', icon: ClipboardCheck,   label: 'Mark Attendance' },
  { to: '/teacher/results',    icon: Upload,           label: 'Upload Results' },
  { to: '/teacher/questions',  icon: HelpCircle,       label: 'Exam Questions' },
]

export default function TeacherLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  return (
    <div className="flex min-h-screen bg-gray-50">
      {sidebarOpen && <div className="fixed inset-0 bg-black/30 z-30 md:hidden" onClick={() => setSidebarOpen(false)}/>}
      <div className={`fixed md:static z-40 md:z-auto transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <Sidebar links={links} roleLabel="Teacher Portal" roleColor="green" onClose={() => setSidebarOpen(false)}/>
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        <div className="md:hidden flex items-center gap-3 bg-white px-4 py-3 border-b border-gray-100 sticky top-0 z-20">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-600"><Menu size={22}/></button>
          <p className="font-semibold text-gray-800 text-sm">Teacher Portal</p>
        </div>
        <main className="flex-1 p-4 md:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
