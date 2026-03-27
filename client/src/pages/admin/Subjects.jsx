import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
import api from '../../utils/api'
import toast from 'react-hot-toast'

export default function AdminSubjects() {
  const [subjects, setSubjects] = useState([])
  const [classes, setClasses] = useState([])
  const [filterClass, setFilterClass] = useState('')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  
  const [form, setForm] = useState({ id: null, class: '', name: '', is_active: 1 })

  const load = () => {
    setLoading(true)
    api.get(`/subjects${filterClass ? `?class=${filterClass}` : ''}`).then(r => setSubjects(r.data.subjects || [])).finally(()=>setLoading(false))
  }

  useEffect(() => {
    api.get('/admin/classes').then(r => setClasses(r.data.classes || []))
  }, [])

  useEffect(load, [filterClass])

  const openNew = () => { setForm({ id: null, class: filterClass || classes[0] || '', name: '', is_active: 1 }); setShowForm(true) }
  const openEdit = (s) => { setForm({ id: s.id, class: s.class, name: s.name, is_active: s.is_active }); setShowForm(true) }

  const handleSave = async (e) => {
    e.preventDefault()
    try {
      if (form.id) { await api.put(`/subjects/${form.id}`, form); toast.success('Updated') }
      else         { await api.post('/subjects', form); toast.success('Created') }
      setShowForm(false)
      load()
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to save subject') }
  }

  const handleDelete = async (id) => {
    if(!confirm('Deactivate this subject?')) return
    await api.delete(`/subjects/${id}`)
    toast.success('Deactivated')
    load()
  }

  return (
    <div className="space-y-5 fade-up max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">Subjects Registry</h1>
        <button onClick={openNew} className="btn-primary flex items-center gap-2"><Plus size={16}/> Add Subject</button>
      </div>

      <div className="flex items-center gap-3">
        <select className="input max-w-xs text-sm py-2" value={filterClass} onChange={e=>setFilterClass(e.target.value)}>
          <option value="">All Classes</option>
          {classes.map(c=><option key={c}>{c}</option>)}
        </select>
        <span className="text-gray-400 text-sm">{subjects.length} subjects found</span>
      </div>

      <div className="card overflow-x-auto">
        {loading ? <div className="p-12 text-center text-gray-400">Loading...</div> : (
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs">
                <th className="px-4 py-3">Class</th>
                <th className="px-4 py-3">Subject Name</th>
                <th className="px-4 py-3 w-20">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {subjects.map(s => (
                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-semibold text-gray-600">{s.class}</td>
                  <td className="px-4 py-3 text-gray-800 font-medium">{s.name}</td>
                  <td className="px-4 py-3 flex gap-2">
                    <button onClick={()=>openEdit(s)} className="p-1 text-gray-400 hover:text-blue-600"><Pencil size={14}/></button>
                    <button onClick={()=>handleDelete(s.id)} className="p-1 text-gray-400 hover:text-red-600"><Trash2 size={14}/></button>
                  </td>
                </tr>
              ))}
              {subjects.length===0 && <tr><td colSpan={3} className="text-center py-6 text-gray-400">No subjects found</td></tr>}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl p-5">
            <div className="flex justify-between items-center mb-4 pb-2 border-b">
              <h3 className="font-bold">{form.id ? 'Edit' : 'Add'} Subject</h3>
              <button onClick={()=>setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="label">Class</label>
                <select required className="input" value={form.class} onChange={e=>setForm({...form, class:e.target.value})}>
                  <option value="">Select class...</option>
                  {classes.map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Subject Name</label>
                <input required className="input" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} placeholder="e.g. Mathematics" />
              </div>
              <button type="submit" className="btn-primary w-full mt-2">Save Subject</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
