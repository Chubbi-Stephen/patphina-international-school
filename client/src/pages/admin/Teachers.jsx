import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, X, Save } from 'lucide-react'
import api from '../../utils/api'
import toast from 'react-hot-toast'

const blank = { staff_id:'', full_name:'', subject:'', email:'', phone:'', password:'teacher123' }

export default function AdminTeachers() {
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(blank)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)

  const load = () => api.get('/teachers').then(r => setTeachers(r.data.teachers || [])).finally(() => setLoading(false))
  useEffect(load, [])

  const openEdit = (t) => {
    setForm({ staff_id:t.staff_id, full_name:t.full_name, subject:t.subject, email:t.email||'', phone:t.phone||'', password:'' })
    setEditing(t.id); setShowForm(true)
  }
  const openNew = () => { setForm(blank); setEditing(null); setShowForm(true) }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.staff_id || !form.full_name || !form.subject) return toast.error('Staff ID, Name and Subject are required')
    setSaving(true)
    try {
      if (editing) { await api.put(`/teachers/${editing}`, form); toast.success('Teacher updated') }
      else { await api.post('/teachers', form); toast.success('Teacher created') }
      setShowForm(false); load()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save') }
    finally { setSaving(false) }
  }

  const handleDelete = async (t) => {
    if (!confirm(`Delete ${t.full_name}?`)) return
    await api.delete(`/teachers/${t.id}`)
    toast.success('Teacher deleted'); load()
  }

  const subjects = ['Mathematics','English Language','Physics','Chemistry','Biology','Further Maths','Economics','Commerce','Accounting','Basic Science','Social Studies','Civic Education','CRS','Computer Studies','Fine Art','Agricultural Science','Geography']

  return (
    <div className="space-y-5 fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Teachers</h1>
          <p className="text-gray-400 text-sm">{teachers.length} staff members</p>
        </div>
        <button onClick={openNew} className="btn-primary flex items-center gap-2"><Plus size={16}/> Add Teacher</button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-3 flex justify-center py-12"><div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"/></div>
        ) : teachers.length === 0 ? (
          <div className="col-span-3 card text-center py-12">
            <p className="text-4xl mb-3">👨‍🏫</p>
            <p className="text-gray-400">No teachers yet.</p>
          </div>
        ) : teachers.map(t => (
          <div key={t.id} className="card hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-11 h-11 rounded-full bg-green-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                {t.full_name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 truncate">{t.full_name}</p>
                <p className="text-green-600 text-xs font-medium">{t.staff_id}</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(t)} className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"><Pencil size={13}/></button>
                <button onClick={() => handleDelete(t)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={13}/></button>
              </div>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between"><span className="text-gray-400">Subject</span><span className="font-medium text-gray-700">{t.subject}</span></div>
              {t.email && <div className="flex justify-between"><span className="text-gray-400">Email</span><span className="text-gray-600 truncate ml-4">{t.email}</span></div>}
              {t.phone && <div className="flex justify-between"><span className="text-gray-400">Phone</span><span className="text-gray-600">{t.phone}</span></div>}
            </div>
            {t.classes?.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-400 mb-2">Assigned Classes</p>
                <div className="flex flex-wrap gap-1">
                  {t.classes.map((c,i) => (
                    <span key={i} className="bg-green-50 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">{c}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">{editing ? 'Edit Teacher' : 'Add Teacher'}</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-3">
              {!editing && <div>
                <label className="label">Staff ID *</label>
                <input className="input" placeholder="e.g. TCH006" value={form.staff_id} onChange={e=>setForm(f=>({...f,staff_id:e.target.value}))} required/>
              </div>}
              <div>
                <label className="label">Full Name *</label>
                <input className="input" placeholder="Teacher's full name" value={form.full_name} onChange={e=>setForm(f=>({...f,full_name:e.target.value}))} required/>
              </div>
              <div>
                <label className="label">Subject *</label>
                <select className="input" value={form.subject} onChange={e=>setForm(f=>({...f,subject:e.target.value}))} required>
                  <option value="">— Select subject —</option>
                  {subjects.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Email</label>
                <input type="email" className="input" placeholder="teacher@patphina.edu.ng" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))}/>
              </div>
              <div>
                <label className="label">Phone</label>
                <input className="input" placeholder="+234..." value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))}/>
              </div>
              {!editing && <div>
                <label className="label">Default Password</label>
                <input className="input" value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))}/>
              </div>}
              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2 flex-1 justify-center">
                  {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <Save size={15}/>}
                  {editing ? 'Update' : 'Create Teacher'}
                </button>
                <button type="button" onClick={()=>setShowForm(false)} className="btn-ghost">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
