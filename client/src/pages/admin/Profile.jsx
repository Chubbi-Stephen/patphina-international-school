import { useState } from 'react'
import { Save } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import api from '../../utils/api'
import toast from 'react-hot-toast'

export default function AdminProfile() {
  const { user } = useAuth()
  const [password, setPassword] = useState('')
  const [saving, setSaving] = useState(false)

  const handlePassword = async (e) => {
    e.preventDefault()
    if (password.length < 6) return toast.error('Password must be at least 6 characters')
    setSaving(true)
    try {
      await api.post('/auth/change-password', { newPassword: password })
      toast.success('Password updated successfully')
      setPassword('')
    } catch { toast.error('Failed to update password') }
    finally { setSaving(false) }
  }

  return (
    <div className="space-y-6 fade-up max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-gray-800">Admin Profile</h1>
      </div>

      <div className="card p-6">
        <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Account Details</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><p className="text-gray-400 text-xs">Username / ID</p><p className="font-semibold text-gray-800">{user?.username}</p></div>
          <div><p className="text-gray-400 text-xs">Role</p><p className="font-semibold text-gray-800 uppercase text-brand-600">{user?.role}</p></div>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Change Password</h3>
        <form onSubmit={handlePassword} className="space-y-4 max-w-sm">
          <div>
            <label className="label">New Password</label>
            <input type="password" placeholder="At least 6 characters" className="input" value={password} onChange={e=>setPassword(e.target.value)} required minLength={6}/>
          </div>
          <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
            {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <Save size={16}/>}
            Update Password
          </button>
        </form>
      </div>
    </div>
  )
}
