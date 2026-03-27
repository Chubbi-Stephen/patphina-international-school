import { useState, useEffect } from 'react'
import { Save, Check, X } from 'lucide-react'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { CURRENT_TERM, CURRENT_SESSION } from '../../utils/config'

export default function TeacherAttendance() {
  const [classes, setClasses] = useState([])
  const [selectedClass, setSelectedClass] = useState('')
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(false)
  
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [attendance, setAttendance] = useState({}) // student_id -> status

  useEffect(() => {
    api.get('/admin/classes').then(r => {
      setClasses(r.data.classes || [])
      if(r.data.classes?.length) setSelectedClass(r.data.classes[0])
    })
  }, [])

  useEffect(() => {
    if(!selectedClass) return
    setLoading(true)
    api.get(`/students?class=${encodeURIComponent(selectedClass)}&limit=1000`)
      .then(r => {
        const stds = r.data.students || []
        setStudents(stds)
        
        // Check if attendance already recorded today
        api.get(`/attendance?class=${encodeURIComponent(selectedClass)}&date=${date}`)
          .then(ar => {
            const existing = ar.data.attendance || []
            const map = {}
            if (existing.length) {
              existing.forEach(a => map[a.student_id] = a.status)
            } else {
              stds.forEach(s => map[s.id] = 'present') // default
            }
            setAttendance(map)
          })
      }).finally(()=>setLoading(false))
  }, [selectedClass, date])

  const handleStatus = (id, status) => setAttendance(prev => ({...prev, [id]: status}))

  const handleSave = async () => {
    const records = Object.entries(attendance).map(([id, status]) => ({ student_id: Number(id), status }))
    const payload = { records, date, class: selectedClass, term: CURRENT_TERM, session: CURRENT_SESSION }
    
    try {
      await api.post('/attendance/bulk', payload)
      toast.success('Attendance saved for ' + date)
    } catch { toast.error('Failed to save attendance') }
  }

  return (
    <div className="space-y-6 fade-up max-w-4xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Daily Attendance Tracker</h1>
          <p className="text-gray-500 text-sm">Mark students present, absent, or late.</p>
        </div>
        <button onClick={handleSave} className="btn-primary flex items-center gap-2"><Save size={16}/> Save Register</button>
      </div>

      <div className="card p-4 flex gap-4 bg-white border border-gray-100 shadow-sm">
        <div>
          <label className="text-xs text-brand-600 font-bold block mb-1">Select Class</label>
          <select className="input min-w-[200px]" value={selectedClass} onChange={e=>setSelectedClass(e.target.value)}>
            {classes.map(c=><option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-brand-600 font-bold block mb-1">Date</label>
          <input type="date" className="input min-w-[150px]" value={date} onChange={e=>setDate(e.target.value)} max={new Date().toISOString().split('T')[0]}/>
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        {loading ? <div className="p-8 text-center text-gray-400">Loading students...</div> : students.length === 0 ? <div className="p-8 text-center text-gray-400">No students found in this class.</div> : (
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3">Student Name</th>
                <th className="px-4 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {students.map(s => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-semibold text-gray-800">{s.full_name} <span className="text-xs font-normal text-gray-400 ml-2">{s.reg_no}</span></td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center gap-2">
                       <button onClick={()=>handleStatus(s.id, 'present')} className={`flex items-center gap-1 font-bold text-xs px-3 py-1.5 rounded-full transition-colors ${attendance[s.id]==='present' ? 'bg-green-100 text-green-700 ring-2 ring-green-500':'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}><Check size={14}/> Present</button>
                       <button onClick={()=>handleStatus(s.id, 'absent')} className={`flex items-center gap-1 font-bold text-xs px-3 py-1.5 rounded-full transition-colors ${attendance[s.id]==='absent' ? 'bg-red-100 text-red-700 ring-2 ring-red-500':'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}><X size={14}/> Absent</button>
                       <button onClick={()=>handleStatus(s.id, 'late')} className={`flex items-center gap-1 font-bold text-xs px-3 py-1.5 rounded-full transition-colors ${attendance[s.id]==='late' ? 'bg-orange-100 text-orange-700 ring-2 ring-orange-500':'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}>Late</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
