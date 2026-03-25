import { Outlet, Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { Menu, X, Phone, Mail, GraduationCap } from 'lucide-react'

export default function PublicLayout() {
  const [open, setOpen] = useState(false)
  const loc = useLocation()
  const active = (path) => loc.pathname === path ? 'text-brand-400 font-semibold' : 'text-white/80 hover:text-white'

  return (
    <div className="min-h-screen flex flex-col">
      {/* Topbar */}
      <div className="bg-brand-900 text-white/70 text-xs py-2 px-6 flex justify-between flex-wrap gap-2">
        <div className="flex gap-4 items-center">
          <span className="flex items-center gap-1"><Phone size={11}/> +234 000 000 0000</span>
          <span className="flex items-center gap-1"><Mail size={11}/> info@patphina.edu.ng</span>
        </div>
        <span>Mon – Fri: 7:30am – 3:30pm</span>
      </div>

      {/* Nav */}
      <nav className="bg-brand-800 sticky top-0 z-50 shadow-lg">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
              <GraduationCap size={20} className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">Patphina International School</p>
              <p className="text-white/50 text-xs">Nursery · Primary · Secondary</p>
            </div>
          </Link>

          <ul className="hidden md:flex items-center gap-6 text-sm">
            <li><Link to="/"           className={active('/')}>Home</Link></li>
            <li><Link to="/about"      className={active('/about')}>About</Link></li>
            <li><Link to="/admissions" className={active('/admissions')}>Admissions</Link></li>
            <li>
              <Link to="/login" className="bg-white text-brand-700 hover:bg-brand-50 font-semibold px-4 py-2 rounded-lg text-sm transition-all">
                Student Portal
              </Link>
            </li>
          </ul>

          <button className="md:hidden text-white" onClick={() => setOpen(!open)}>
            {open ? <X size={22}/> : <Menu size={22}/>}
          </button>
        </div>

        {open && (
          <div className="md:hidden bg-brand-900 border-t border-white/10 px-6 py-4 flex flex-col gap-3 text-sm">
            <Link to="/"           className="text-white/80" onClick={() => setOpen(false)}>Home</Link>
            <Link to="/about"      className="text-white/80" onClick={() => setOpen(false)}>About</Link>
            <Link to="/admissions" className="text-white/80" onClick={() => setOpen(false)}>Admissions</Link>
            <Link to="/login"      className="text-brand-300 font-semibold" onClick={() => setOpen(false)}>Student Portal →</Link>
          </div>
        )}
      </nav>

      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-brand-900 text-white/60 py-10 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <p className="text-white font-semibold mb-2">Patphina International School</p>
            <p className="text-sm leading-relaxed">Providing quality education in the heart of Ojo, Lagos. Nurturing minds, building futures since [YEAR].</p>
          </div>
          <div>
            <p className="text-white font-semibold mb-3 text-sm">Quick Links</p>
            <ul className="space-y-2 text-sm">
              <li><Link to="/"           className="hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/about"      className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/admissions" className="hover:text-white transition-colors">Admissions</Link></li>
              <li><Link to="/login"      className="hover:text-white transition-colors">Student Portal</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-white font-semibold mb-3 text-sm">Contact</p>
            <ul className="space-y-2 text-sm">
              <li>📍 Ojo Barracks, Lagos</li>
              <li>📞 +234 000 000 0000</li>
              <li>✉️ info@patphina.edu.ng</li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-white/10 text-center text-xs">
          © {new Date().getFullYear()} Patphina International School. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
