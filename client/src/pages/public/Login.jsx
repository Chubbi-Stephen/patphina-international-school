import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { GraduationCap, Eye, EyeOff, LogIn } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

export default function Login() {
  const [form, setForm] = useState({ identifier: '', password: '', role: 'student' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const roles = [
    { value: 'student', label: 'Student', hint: 'Use your Reg Number' },
    { value: 'teacher', label: 'Teacher', hint: 'Use your Staff ID' },
    { value: 'admin',   label: 'Admin',   hint: 'Use your username' },
  ]

  const placeholders = { student: 'e.g. PIS/2024/001', teacher: 'e.g. TCH001', admin: 'admin' }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.identifier || !form.password) return toast.error('All fields are required')
    setLoading(true)
    const res = await login(form.identifier.trim(), form.password, form.role)
    setLoading(false)
    if (res.success) {
      toast.success(`Welcome back!`)
      navigate(`/${form.role}`)
    } else {
      toast.error(res.message)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-900 via-brand-800 to-brand-700 flex items-center justify-center px-4 py-12">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none"
        style={{ backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`, backgroundSize: '40px 40px' }}/>

      <div className="w-full max-w-md relative">
        {/* Header */}
        <div className="text-center mb-8 fade-up">
          <div className="w-16 h-16 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <GraduationCap size={30} className="text-white" />
          </div>
          <h1 className="text-white text-2xl font-display font-bold">Patphina International</h1>
          <p className="text-white/60 text-sm mt-1">School Management Portal</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 fade-up" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Sign In</h2>

          {/* Role tabs */}
          <div className="grid grid-cols-3 gap-1.5 bg-gray-100 rounded-xl p-1 mb-6">
            {roles.map(r => (
              <button
                key={r.value}
                type="button"
                onClick={() => setForm(f => ({ ...f, role: r.value, identifier: '' }))}
                className={`py-2 rounded-lg text-sm font-medium transition-all ${
                  form.role === r.value
                    ? 'bg-white text-brand-700 shadow-sm font-semibold'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">
                {roles.find(r => r.value === form.role)?.label} ID
              </label>
              <input
                className="input"
                placeholder={placeholders[form.role]}
                value={form.identifier}
                onChange={e => setForm(f => ({ ...f, identifier: e.target.value }))}
                autoComplete="username"
              />
              <p className="text-xs text-gray-400 mt-1">{roles.find(r => r.value === form.role)?.hint}</p>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  className="input pr-10"
                  type={showPw ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-2">
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
              ) : <LogIn size={16}/>}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center mb-3">Demo credentials</p>
            <div className="space-y-1.5 text-xs text-gray-500">
              <div className="flex justify-between bg-gray-50 rounded-lg px-3 py-2">
                <span className="text-brand-600 font-medium">Student</span>
                <span>PIS/2024/001 / student123</span>
              </div>
              <div className="flex justify-between bg-gray-50 rounded-lg px-3 py-2">
                <span className="text-green-600 font-medium">Teacher</span>
                <span>TCH001 / teacher123</span>
              </div>
              <div className="flex justify-between bg-gray-50 rounded-lg px-3 py-2">
                <span className="text-purple-600 font-medium">Admin</span>
                <span>admin / admin123</span>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-white/50 text-xs mt-6">
          <Link to="/" className="hover:text-white transition-colors">← Back to school website</Link>
        </p>
      </div>
    </div>
  )
}
