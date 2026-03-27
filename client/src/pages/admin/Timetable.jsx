import { useState, useEffect } from 'react'
import { Plus, Trash2, X, Save } from 'lucide-react'
import api from '../../utils/api'
import toast from 'react-hot-toast'

export default function AdminTimetable() {
  const [timetable, setTimetable] = useState([])
  const [classes, setClasses] = useState([])
  const [teachers, setTeachers] = useState([])
  const [selectedClass, setSelectedClass] = useState('')
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  
  const [form, setForm] = useState({ day: 'Monday', period: 1, start_time: '08:00', end_time: '08:40', subject: '', teacher_id: '' })

  useEffect(() => {
    Promise.all([
      api.get('/admin/classes'),
      api.get('/teachers')
    ]).then(([c, t]) => {
      setClasses(c.data.classes || [])
      setTeachers(t.data.teachers || [])
      if (c.data.classes?.length > 0) setSelectedClass(c.data.classes[0])
    })
  }, [])

  useEffect(() => {
    if (!selectedClass) return
    setLoading(true)
    api.get(`/timetable?class=${encodeURIComponent(selectedClass)}&term=2nd Term&session=${encodeURIComponent('2025/2026')}`)
      .then(r => setTimetable(r.data.timetable || []))
      .finally(() => setLoading(false))
  }, [selectedClass])

  const handleSave = async (e) => {
    e.preventDefault()
    try {
      await api.post('/timetable', { ...form, class: selectedClass, term: '2nd Term', session: '2025/2026' })
      toast.success('Period added')
      setShowForm(false)
      api.get(`/timetable?class=${encodeURIComponent(selectedClass)}&term=2nd Term&session=${encodeURIComponent('2025/2026')}`).then(r => setTimetable(r.data.timetable || []))
    } catch (err) { toast.error(err.response?.data?.message || 'Error saving period') }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this period?')) return
    await api.delete(`/timetable/${id}`)
    toast.success('Deleted')
    setTimetable(prev => prev.filter(t => t.id !== id))
  }

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

  return (
    <div className="space-y-5 fade-up">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">Class Timetable</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2"><Plus size={16}/> Add Period</button>
      </div>

      <div className="card p-3 flex gap-3">
        <select className="input max-w-xs" value={selectedClass} onChange={e=>setSelectedClass(e.target.value)}>
          {classes.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"/></div>
      ) : (
        <div className="grid grid-cols-5 gap-4 overflow-x-auto min-w-[800px]">
          {days.map(day => (
            <div key={day} className="space-y-3">
              <h3 className="font-bold text-center bg-gray-100 py-2 rounded-lg text-gray-700">{day}</h3>
              {timetable.filter(t => t.day === day).map(t => (
                <div key={t.id} className="card p-3 relative group">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-bold text-brand-600">P{t.period}</span>
                    <span className="text-xs text-gray-400">{t.start_time}-{t.end_time}</span>
                  </div>
                  <p className="font-semibold text-gray-800 text-sm">{t.subject}</p>
                  <p className="text-xs text-gray-500 mt-1">{t.teacher_name || 'No teacher'}</p>
                  <button onClick={() => handleDelete(t.id)} className="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 rounded p-1">
                    <Trash2 size={14}/>
                  </button>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl">
            <div className="flex justify-between p-4 border-b border-gray-100">
              <h3 className="font-bold">Add Period ({selectedClass})</h3>
              <button onClick={()=>setShowForm(false)} className="text-gray-400"><X size={20}/></button>
            </div>
            <form onSubmit={handleSave} className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Day</label>
                  <select className="input" value={form.day} onChange={e=>setForm({...form, day: e.target.value})}>
                    {days.map(d=><option key={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Period #</label>
                  <input type="number" className="input" min="1" max="10" value={form.period} onChange={e=>setForm({...form, period: e.target.value})} required/>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Start Time</label>
                  <input type="time" className="input" value={form.start_time} onChange={e=>setForm({...form, start_time: e.target.value})} required/>
                </div>
                <div>
                  <label className="label">End Time</label>
                  <input type="time" className="input" value={form.end_time} onChange={e=>setForm({...form, end_time: e.target.value})} required/>
                </div>
              </div>
              <div>
                <label className="label">Subject</label>
                <input type="text" className="input" value={form.subject} onChange={e=>setForm({...form, subject: e.target.value})} required/>
              </div>
              <div>
                <label className="label">Teacher</label>
                <select className="input" value={form.teacher_id} onChange={e=>setForm({...form, teacher_id: e.target.value})}>
                  <option value="">— Unassigned —</option>
                  {teachers.map(t=><option key={t.id} value={t.id}>{t.full_name}</option>)}
                </select>
              </div>
              <button type="submit" className="btn-primary w-full mt-4">Save Period</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
