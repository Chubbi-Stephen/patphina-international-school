import { useEffect, useState } from 'react'
import { Plus, Search, Pencil, Trash2, X, Save, Eye } from 'lucide-react'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { useDebounce } from '../../hooks/useDebounce'

const blank = { reg_no:'', full_name:'', class:'', dob:'', gender:'', parent_name:'', parent_phone:'', address:'', password:'student123' }

export default function AdminStudents() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterClass, setFilterClass] = useState('')
  const [classes, setClasses] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(blank)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [viewing, setViewing] = useState(null)
  const [viewResults, setViewResults] = useState([])
  const debouncedSearch = useDebounce(search, 300)

  const load = () => {
    let url = '/students?'
    if (filterClass) url += `class=${filterClass}&`
    if (debouncedSearch) url += `search=${debouncedSearch}&`
    api.get(url).then(r => setStudents(r.data.students || [])).finally(() => setLoading(false))
  }
  useEffect(load, [filterClass, debouncedSearch])
  useEffect(() => {
    api.get('/admin/classes').then(r => setClasses(r.data.classes || []))
  }, [])

  const openEdit = (s) => {
    setForm({ reg_no:s.reg_no, full_name:s.full_name, class:s.class, dob:s.dob||'', gender:s.gender||'', parent_name:s.parent_name||'', parent_phone:s.parent_phone||'', address:s.address||'', password:'' })
    setEditing(s.id)
    setShowForm(true)
  }
  const openNew = () => { setForm(blank); setEditing(null); setShowForm(true) }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.reg_no || !form.full_name || !form.class) return toast.error('Reg No, Name and Class are required')
    setSaving(true)
    try {
      if (editing) {
        await api.put(`/students/${editing}`, form)
        toast.success('Student updated')
      } else {
        await api.post('/students', form)
        toast.success('Student created')
      }
      setShowForm(false); load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save')
    } finally { setSaving(false) }
  }

  const handleDelete = async (s) => {
    if (!confirm(`Delete ${s.full_name}? This cannot be undone.`)) return
    await api.delete(`/students/${s.id}`)
    toast.success('Student deleted')
    load()
  }

  const viewStudent = async (s) => {
    setViewing(s)
    const r = await api.get(`/results/student/${s.id}`)
    setViewResults(r.data.results || [])
  }

  const gradeColor = (g='') => g.startsWith('A') ? 'text-green-600' : g.startsWith('B') ? 'text-blue-600' : g.startsWith('C') ? 'text-yellow-600' : 'text-red-500'

  return (
    <div className="space-y-5 fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Students</h1>
          <p className="text-gray-400 text-sm">{students.length} records</p>
        </div>
        <button onClick={openNew} className="btn-primary flex items-center gap-2"><Plus size={16}/> Add Student</button>
      </div>

      {/* Filters */}
      <div className="card flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input className="input pl-9 py-2 text-sm" placeholder="Search name or reg no..."
            value={search} onChange={e => setSearch(e.target.value)}/>
        </div>
        <select className="input !w-auto text-sm py-2" value={filterClass} onChange={e => setFilterClass(e.target.value)}>
          <option value="">All Classes</option>
          {classes.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-x-auto">
        {loading ? (
          <div className="flex justify-center py-10"><div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"/></div>
        ) : students.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">👥</p>
            <p className="text-gray-400">No students found.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs">
                <th className="text-left px-3 py-3 rounded-tl-lg">Name</th>
                <th className="text-left px-3 py-3">Reg No</th>
                <th className="text-left px-3 py-3">Class</th>
                <th className="text-left px-3 py-3 hide-mobile">Gender</th>
                <th className="text-left px-3 py-3 hide-mobile">Parent</th>
                <th className="text-center px-3 py-3 rounded-tr-lg">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {students.map(s => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {s.full_name.charAt(0)}
                      </div>
                      <span className="font-medium text-gray-800">{s.full_name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-gray-500 text-xs">{s.reg_no}</td>
                  <td className="px-3 py-3"><span className="bg-brand-50 text-brand-700 text-xs px-2 py-0.5 rounded-full font-medium">{s.class}</span></td>
                  <td className="px-3 py-3 text-gray-500 hide-mobile">{s.gender || '—'}</td>
                  <td className="px-3 py-3 text-gray-500 hide-mobile text-xs">{s.parent_name || '—'}</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => viewStudent(s)} className="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all"><Eye size={14}/></button>
                      <button onClick={() => openEdit(s)} className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"><Pencil size={14}/></button>
                      <button onClick={() => handleDelete(s)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={14}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Student View Modal */}
      {viewing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">Student Profile</h3>
              <button onClick={() => setViewing(null)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-brand-600 flex items-center justify-center text-white text-xl font-bold">
                  {viewing.full_name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-gray-800">{viewing.full_name}</p>
                  <p className="text-brand-600 text-sm">{viewing.reg_no} · Class {viewing.class}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[['DOB', viewing.dob ? new Date(viewing.dob).toLocaleDateString('en-NG',{dateStyle:'medium'}) : '—'],
                  ['Gender', viewing.gender||'—'],['Parent', viewing.parent_name||'—'],['Phone', viewing.parent_phone||'—'],
                  ['Address', viewing.address||'—','col-span-2']
                ].map(([k,v,cls]) => (
                  <div key={k} className={`bg-gray-50 rounded-lg p-3 ${cls||''}`}>
                    <p className="text-xs text-gray-400">{k}</p>
                    <p className="font-medium text-gray-800">{v}</p>
                  </div>
                ))}
              </div>
              <div>
                <p className="font-semibold text-gray-700 text-sm mb-2">Results</p>
                {viewResults.length === 0 ? <p className="text-gray-400 text-sm">No results yet.</p> : (
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-gray-400">
                        <th className="text-left pb-1">Subject</th>
                        <th className="text-center pb-1">CA</th>
                        <th className="text-center pb-1">Exam</th>
                        <th className="text-center pb-1">Total</th>
                        <th className="text-center pb-1">Grade</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {viewResults.map(r => (
                        <tr key={r.id}>
                          <td className="py-1.5 text-gray-700">{r.subject}</td>
                          <td className="py-1.5 text-center">{r.ca_score}</td>
                          <td className="py-1.5 text-center">{r.exam_score}</td>
                          <td className="py-1.5 text-center font-bold">{Number(r.ca_score) + Number(r.exam_score)}</td>
                          <td className={`py-1.5 text-center font-bold ${gradeColor(r.grade)}`}>{r.grade}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">{editing ? 'Edit Student' : 'Add New Student'}</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {!editing && <div className="col-span-2">
                  <label className="label">Reg Number *</label>
                  <input className="input" placeholder="e.g. PIS/2025/008" value={form.reg_no} onChange={e=>setForm(f=>({...f,reg_no:e.target.value}))} required/>
                </div>}
                <div className="col-span-2">
                  <label className="label">Full Name *</label>
                  <input className="input" placeholder="Student's full name" value={form.full_name} onChange={e=>setForm(f=>({...f,full_name:e.target.value}))} required/>
                </div>
                <div>
                  <label className="label">Class *</label>
                  <select className="input" value={form.class} onChange={e=>setForm(f=>({...f,class:e.target.value}))} required>
                    <option value="">— Select —</option>
                    {['Pre-Nursery','Nursery 1','Nursery 2','Primary 1','Primary 2','Primary 3','Primary 4','Primary 5','Primary 6','JSS1A','JSS1B','JSS2A','JSS2B','JSS3A','JSS3B','SS1A','SS1B','SS2A','SS2B','SS3A','SS3B'].map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Gender</label>
                  <select className="input" value={form.gender} onChange={e=>setForm(f=>({...f,gender:e.target.value}))}>
                    <option value="">—</option><option>Male</option><option>Female</option>
                  </select>
                </div>
                <div>
                  <label className="label">Date of Birth</label>
                  <input type="date" className="input" value={form.dob} onChange={e=>setForm(f=>({...f,dob:e.target.value}))}/>
                </div>
                <div>
                  <label className="label">Parent / Guardian</label>
                  <input className="input" placeholder="Parent name" value={form.parent_name} onChange={e=>setForm(f=>({...f,parent_name:e.target.value}))}/>
                </div>
                <div>
                  <label className="label">Parent Phone</label>
                  <input className="input" placeholder="+234..." value={form.parent_phone} onChange={e=>setForm(f=>({...f,parent_phone:e.target.value}))}/>
                </div>
                {!editing && <div>
                  <label className="label">Default Password</label>
                  <input className="input" placeholder="student123" value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))}/>
                </div>}
                <div className="col-span-2">
                  <label className="label">Address</label>
                  <input className="input" placeholder="Home address" value={form.address} onChange={e=>setForm(f=>({...f,address:e.target.value}))}/>
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2 flex-1 justify-center">
                  {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <Save size={15}/>}
                  {editing ? 'Update Student' : 'Create Student'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
