import { NavLink, useNavigate } from 'react-router-dom'
import { LogOut, GraduationCap, X } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

export default function Sidebar({ links, roleLabel, roleColor = 'brand', onClose }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  const colorMap = {
    brand:  { bg: 'bg-brand-600',  text: 'text-brand-600',  light: 'bg-brand-50' },
    green:  { bg: 'bg-green-600',  text: 'text-green-600',  light: 'bg-green-50' },
    purple: { bg: 'bg-purple-600', text: 'text-purple-600', light: 'bg-purple-50' },
  }
  const c = colorMap[roleColor] || colorMap.brand

  return (
    <aside className="w-64 bg-white border-r border-gray-100 min-h-screen flex flex-col shadow-sm">
      {/* Logo */}
      <div className={`${c.bg} px-5 py-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
              <GraduationCap size={18} className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-xs leading-tight">Patphina International</p>
              <p className="text-white/60 text-xs">{roleLabel}</p>
            </div>
          </div>
          {onClose && (
            <button onClick={onClose} className="text-white/70 hover:text-white md:hidden">
              <X size={18}/>
            </button>
          )}
        </div>
      </div>

      {/* User info */}
      <div className="px-4 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-full ${c.bg} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
            {(user?.full_name || user?.name || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">{user?.full_name || user?.name || 'User'}</p>
            <p className={`text-xs ${c.text} truncate`}>{user?.reg_no || user?.staff_id || user?.username}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to.split('/').length <= 2}
            className={({ isActive }) =>
              `flex items-center gap-3 mx-2 px-3 py-2.5 rounded-lg text-sm mb-0.5 transition-all border-l-4 ${
                isActive
                  ? `${c.light} ${c.text} border-current font-semibold`
                  : 'text-gray-600 hover:bg-gray-50 border-transparent'
              }`
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-4 py-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-all"
        >
          <LogOut size={17}/>
          Sign Out
        </button>
      </div>
    </aside>
  )
}
