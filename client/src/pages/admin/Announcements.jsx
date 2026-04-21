import { useEffect, useState } from 'react'
import { Plus, Trash2, X, Send } from 'lucide-react'
import api from '../../utils/api'
import toast from 'react-hot-toast'

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title:'', body:'', target:'all' })
  const [saving, setSaving] = useState(false)

  const load = () => { api.get('/admin/announcements').then(r => setAnnouncements(r.data.announcements || [])).finally(()=>setLoading(false)) }
  useEffect(() => { load() }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.title || !form.body) return toast.error('Title and message are required')
    setSaving(true)
    try {
      await api.post('/admin/announcements', form)
      toast.success('Announcement posted')
      setShowForm(false); setForm({ title:'', body:'', target:'all' }); load()
    } catch { toast.error('Failed to post') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this announcement?')) return
    await api.delete(`/admin/announcements/${id}`)
    toast.success('Deleted'); setAnnouncements(prev => prev.filter(a=>a.id!==id))
  }

  const targetColor = (t) => ({
    all:      'bg-brand-100 text-brand-700',
    students: 'bg-green-100 text-green-700',
    teachers: 'bg-purple-100 text-purple-700',
  }[t] || 'bg-gray-100 text-gray-600')

  return (
    <div className="space-y-5 fade-up max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Announcements</h1>
          <p className="text-gray-400 text-sm">{announcements.length} total</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16}/> New Announcement
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"/></div>
      ) : announcements.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-4xl mb-3">📢</p>
          <p className="text-gray-400">No announcements yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map(a => (
            <div key={a.id} className="card">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${targetColor(a.target)}`}>
                      📢 {a.target === 'all' ? 'Everyone' : a.target === 'students' ? 'Students' : 'Teachers'}
                    </span>
                    <span className="text-gray-400 text-xs">{new Date(a.created_at).toLocaleDateString('en-NG', { dateStyle:'medium' })}</span>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-1">{a.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{a.body}</p>
                </div>
                <button onClick={() => handleDelete(a.id)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all flex-shrink-0">
                  <Trash2 size={15}/>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">New Announcement</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div>
                <label className="label">Send To</label>
                <div className="grid grid-cols-3 gap-2">
                  {[['all','Everyone'],['students','Students'],['teachers','Teachers']].map(([v,l]) => (
                    <button key={v} type="button" onClick={() => setForm(f=>({...f,target:v}))}
                      className={`py-2 rounded-xl text-sm font-medium border transition-all ${form.target===v ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-gray-600 border-gray-200 hover:border-brand-300'}`}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label">Title *</label>
                <input className="input" placeholder="Announcement title" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} required/>
              </div>
              <div>
                <label className="label">Message *</label>
                <textarea className="input min-h-[100px] resize-y" placeholder="Write the announcement here..." value={form.body} onChange={e=>setForm(f=>({...f,body:e.target.value}))} required/>
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2 flex-1 justify-center">
                  {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <Send size={15}/>}
                  Post Announcement
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
