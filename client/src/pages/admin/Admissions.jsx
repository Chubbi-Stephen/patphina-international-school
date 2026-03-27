import { useState, useEffect } from 'react'
import { Plus, Check, Clock, X, Eye } from 'lucide-react'
import api from '../../utils/api'
import toast from 'react-hot-toast'

export default function AdminAdmissions() {
  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewing, setViewing] = useState(null)
  const [sessions, setSessions] = useState([])
  
  const [enrollForm, setEnrollForm] = useState({ id: null, reg_no: '', class: '' })

  const load = () => api.get('/admissions').then(r => setApps(r.data.admissions || [])).finally(()=>setLoading(false))
  
  useEffect(() => {
    api.get('/sessions').then(r => setSessions(r.data.sessions || []))
    load()
  }, [])

  const updateStatus = async (id, status) => {
    try { await api.put(`/admissions/${id}/status`, { status }); toast.success(`Marked as ${status}`); load(); setViewing(null) }
    catch { toast.error('Error') }
  }

  const handleEnroll = async (e) => {
    e.preventDefault()
    try {
      await api.post(`/admissions/${enrollForm.id}/enroll`, enrollForm)
      toast.success('Applicant enrolled as a student!')
      setEnrollForm({ id: null, reg_no: '', class: '' }); setViewing(null); load()
    } catch(err) { toast.error(err.response?.data?.message || 'Error enrolling') }
  }

  const statusBadge = (s) => {
    if(s==='pending') return <span className="text-yellow-700 bg-yellow-100 flex items-center gap-1 font-semibold text-xs px-2.5 py-1 rounded-full"><Clock size={12}/> Pending</span>
    if(s==='approved') return <span className="text-green-700 bg-green-100 font-semibold text-xs px-2.5 py-1 rounded-full">Approved</span>
    if(s==='enrolled') return <span className="text-blue-700 bg-blue-100 font-semibold text-xs px-2.5 py-1 rounded-full flex items-center gap-1"><Check size={12}/> Enrolled</span>
    return <span className="text-red-700 bg-red-100 font-semibold text-xs px-2.5 py-1 rounded-full">Rejected</span>
  }

  return (
    <div className="space-y-5 fade-up">
      <h1 className="text-xl font-bold text-gray-800">Admissions Manager</h1>

      <div className="card overflow-x-auto">
        {loading ? <div className="p-8 text-center text-gray-400">Loading...</div> : (
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="px-4 py-3">Applicant Name</th>
                <th className="px-4 py-3">Class</th>
                <th className="px-4 py-3">Parent / Contact</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 w-20">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {apps.map(a => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 font-semibold text-gray-800">{a.full_name}</td>
                  <td className="px-4 py-4 font-medium text-gray-600">{a.class_applied}</td>
                  <td className="px-4 py-4">
                    <p className="font-semibold text-gray-700">{a.parent_name}</p>
                    <p className="text-xs text-gray-500">{a.parent_phone}</p>
                  </td>
                  <td className="px-4 py-4">{statusBadge(a.status)}</td>
                  <td className="px-4 py-4">
                    <button onClick={()=>setViewing(a)} className="btn-secondary px-2 !py-1 text-xs flex items-center gap-1"><Eye size={13}/> View</button>
                  </td>
                </tr>
              ))}
              {apps.length===0 && <tr><td colSpan={5} className="text-center py-10 text-gray-500">No applications received yet.</td></tr>}
            </tbody>
          </table>
        )}
      </div>

      {viewing && !enrollForm.id && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
          <div className="bg-white w-full max-w-md h-full overflow-y-auto shadow-2xl p-6 relative animate-slide-left">
            <button onClick={()=>setViewing(null)} className="absolute top-4 right-4 text-gray-400 hover:bg-gray-100 p-2 rounded-full"><X size={20}/></button>
            <h2 className="text-2xl font-bold mb-6 pt-2">Application Details</h2>
            
            <div className="space-y-6">
              <div><p className="text-gray-400 text-xs mb-1">Status</p>{statusBadge(viewing.status)}</div>
              
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-gray-400 text-xs mb-1">Full Name</p><p className="font-semibold">{viewing.full_name}</p></div>
                <div><p className="text-gray-400 text-xs mb-1">D.O.B / Gender</p><p className="font-semibold">{viewing.dob || '—'} / {viewing.gender}</p></div>
                <div><p className="text-gray-400 text-xs mb-1">Class Applied</p><p className="font-semibold text-brand-600">{viewing.class_applied}</p></div>
                <div><p className="text-gray-400 text-xs mb-1">Session</p><p className="font-semibold">{viewing.session}</p></div>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl space-y-3 border border-gray-100">
                <h4 className="font-bold text-xs text-gray-500 uppercase tracking-widest">Parent Details</h4>
                <div><p className="text-gray-400 text-xs">Name</p><p className="font-semibold">{viewing.parent_name}</p></div>
                <div className="grid grid-cols-2">
                  <div><p className="text-gray-400 text-xs">Phone</p><p className="font-semibold">{viewing.parent_phone}</p></div>
                  <div><p className="text-gray-400 text-xs">Email</p><p className="font-semibold">{viewing.parent_email||'—'}</p></div>
                </div>
                <div><p className="text-gray-400 text-xs">Address</p><p className="text-sm">{viewing.address||'—'}</p></div>
              </div>

              {viewing.status === 'pending' && (
                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  <button onClick={()=>updateStatus(viewing.id, 'approved')} className="flex-1 bg-green-100 text-green-700 font-bold py-2 rounded-xl hover:bg-green-200">Approve</button>
                  <button onClick={()=>updateStatus(viewing.id, 'rejected')} className="flex-1 bg-red-100 text-red-700 font-bold py-2 rounded-xl hover:bg-red-200">Reject</button>
                </div>
              )}

              {viewing.status === 'approved' && (
                <div className="pt-4 border-t border-gray-100">
                  <button onClick={()=>setEnrollForm({ id: viewing.id, reg_no: '', class: viewing.class_applied })} className="btn-primary w-full shadow-lg">⚡ Officially Enroll Student</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {enrollForm.id && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-2xl w-full max-w-sm">
            <h3 className="font-bold text-lg mb-4">Enroll Applicant</h3>
            <form onSubmit={handleEnroll} className="space-y-4">
              <div>
                <label className="label">Assign Registration Number</label>
                <input required className="input font-mono" placeholder="e.g. STD001" value={enrollForm.reg_no} onChange={e=>setEnrollForm({...enrollForm, reg_no:e.target.value.toUpperCase()})}/>
              </div>
              <p className="text-xs text-brand-600 bg-brand-50 p-2 rounded">A student account will be created automatically with password <code>student123</code></p>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="btn-primary flex-1">Enroll</button>
                <button type="button" className="btn-ghost" onClick={()=>setEnrollForm({id:null})}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
