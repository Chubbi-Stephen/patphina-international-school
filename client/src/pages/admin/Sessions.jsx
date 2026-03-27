import { useState, useEffect } from 'react'
import { Plus, CheckCircle, ShieldAlert } from 'lucide-react'
import api from '../../utils/api'
import toast from 'react-hot-toast'

export default function AdminSessions() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: '', current_term: '1st Term' })

  const load = () => api.get('/sessions').then(r => setSessions(r.data.sessions || [])).finally(()=>setLoading(false))
  useEffect(() => { load() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      await api.post('/sessions', form)
      toast.success('Session created')
      setForm({ name: '', current_term: '1st Term' })
      load()
    } catch { toast.error('Failed to create session') }
  }

  const handleActivate = async (id) => {
    await api.put(`/sessions/${id}/activate`)
    toast.success('Session activated')
    load()
  }

  const handleTermChange = async (id, term) => {
    await api.put(`/sessions/${id}`, { current_term: term })
    toast.success('Term updated')
    load()
  }

  return (
    <div className="space-y-6 fade-up max-w-4xl">
      <div className="flex items-center gap-3 bg-brand-50 text-brand-800 p-4 rounded-xl border border-brand-100">
        <ShieldAlert className="flex-shrink-0"/>
        <p className="text-sm"><strong>Warning:</strong> Changing the active session or term affects the entire school portal. Students and teachers will immediately see results and records for the new active session.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="card h-fit">
          <h3 className="font-bold mb-4">Create New Session</h3>
          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <label className="label">Session Name (e.g. 2026/2027)</label>
              <input className="input" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} required/>
            </div>
            <div>
              <label className="label">Initial Term</label>
              <select className="input" value={form.current_term} onChange={e=>setForm({...form, current_term:e.target.value})}>
                <option>1st Term</option><option>2nd Term</option><option>3rd Term</option>
              </select>
            </div>
            <button type="submit" className="btn-primary w-full flex justify-center gap-2"><Plus size={16}/> Create Session</button>
          </form>
        </div>

        <div className="md:col-span-2 space-y-3">
          <h3 className="font-bold">Academic Sessions</h3>
          {loading ? <p>Loading...</p> : sessions.map(s => (
            <div key={s.id} className={`card border-2 transition-all ${s.is_active ? 'border-brand-500 shadow-md' : 'border-transparent'}`}>
              <div className="flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-lg">{s.name}</h4>
                    {s.is_active === 1 && <span className="bg-brand-100 text-brand-700 text-xs px-2 py-0.5 rounded-full font-bold flex items-center gap-1"><CheckCircle size={12}/> ACTIVE</span>}
                  </div>
                  <p className="text-gray-500 text-sm mt-1">Current term for this session:</p>
                  <div className="mt-2 flex gap-2">
                    {['1st Term','2nd Term','3rd Term'].map(t => (
                      <button key={t} onClick={() => handleTermChange(s.id, t)}
                        className={`text-xs px-3 py-1.5 rounded-full font-medium border transition-colors ${s.current_term === t ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'}`}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                {s.is_active === 0 && (
                  <button onClick={() => handleActivate(s.id)} className="btn-secondary text-sm">Set Active</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
