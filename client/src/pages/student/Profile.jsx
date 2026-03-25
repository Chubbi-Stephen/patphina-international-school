import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { User, Lock, Save } from 'lucide-react'
import api from '../../utils/api'
import toast from 'react-hot-toast'

export default function StudentProfile() {
  const { user } = useAuth()
  const [pwForm, setPwForm] = useState({ currentPassword:'', newPassword:'', confirm:'' })
  const [saving, setSaving] = useState(false)

  const handlePwChange = async (e) => {
    e.preventDefault()
    if (pwForm.newPassword !== pwForm.confirm) return toast.error('Passwords do not match')
    if (pwForm.newPassword.length < 6) return toast.error('Password must be at least 6 characters')
    setSaving(true)
    try {
      await api.post('/auth/change-password', { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword })
      toast.success('Password changed successfully')
      setPwForm({ currentPassword:'', newPassword:'', confirm:'' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password')
    } finally { setSaving(false) }
  }

  const info = [
    { label:'Full Name',       value: user?.full_name },
    { label:'Reg Number',      value: user?.reg_no },
    { label:'Class',           value: user?.class },
    { label:'Date of Birth',   value: user?.dob ? new Date(user.dob).toLocaleDateString('en-NG', { dateStyle:'medium' }) : '—' },
    { label:'Gender',          value: user?.gender || '—' },
    { label:'Parent / Guardian', value: user?.parent_name || '—' },
    { label:'Parent Phone',    value: user?.parent_phone || '—' },
    { label:'Home Address',    value: user?.address || '—' },
    { label:'Session',         value: user?.session || '2025/2026' },
  ]

  return (
    <div className="space-y-6 fade-up max-w-2xl">
      <h1 className="text-xl font-bold text-gray-800">My Profile</h1>

      {/* Bio card */}
      <div className="card">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-brand-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
            {(user?.full_name || 'S').charAt(0)}
          </div>
          <div>
            <h2 className="font-bold text-gray-800 text-lg">{user?.full_name}</h2>
            <p className="text-brand-600 text-sm font-medium">{user?.reg_no}</p>
            <p className="text-gray-400 text-xs mt-0.5">Class {user?.class}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {info.map(i => (
            <div key={i.label} className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-400 font-medium mb-0.5">{i.label}</p>
              <p className="text-gray-800 text-sm font-medium">{i.value}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-4 italic">
          To update your bio-data, please contact the school administrator.
        </p>
      </div>

      {/* Change password */}
      <div className="card">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-5">
          <Lock size={16} className="text-brand-600"/> Change Password
        </h3>
        <form onSubmit={handlePwChange} className="space-y-4">
          <div>
            <label className="label">Current Password</label>
            <input type="password" className="input" placeholder="••••••••"
              value={pwForm.currentPassword} onChange={e => setPwForm(f=>({...f,currentPassword:e.target.value}))} required/>
          </div>
          <div>
            <label className="label">New Password</label>
            <input type="password" className="input" placeholder="Min 6 characters"
              value={pwForm.newPassword} onChange={e => setPwForm(f=>({...f,newPassword:e.target.value}))} required/>
          </div>
          <div>
            <label className="label">Confirm New Password</label>
            <input type="password" className="input" placeholder="Re-enter new password"
              value={pwForm.confirm} onChange={e => setPwForm(f=>({...f,confirm:e.target.value}))} required/>
          </div>
          <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
            {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <Save size={15}/>}
            Save Password
          </button>
        </form>
      </div>
    </div>
  )
}
