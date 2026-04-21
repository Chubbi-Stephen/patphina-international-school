import { useState, useEffect } from 'react'
import { Laptop, Play, CheckCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '../../utils/api'
import { CURRENT_TERM, CURRENT_SESSION } from '../../utils/config'

export default function StudentExams() {
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    // List subjects that have active questions registered in the system
    api.get(`/questions/student?subject=all&term=${CURRENT_TERM}&session=${CURRENT_SESSION}`)
       .then(r => {
         // Because we queried the backend for 'all', we might just fetch the unique subject list, OR 
         // Realistically we can query `GET /subjects` since students take tests for their class subjects.
       }).catch(() => {})
       
    // Fetch user's class subjects to display as Exams
    api.get('/students/me').then(r => {
      const cls = r.data.student.class
      api.get(`/subjects?class=${encodeURIComponent(cls)}`).then(res => {
        setSubjects(res.data.subjects || [])
      }).finally(()=>setLoading(false))
    })
  }, [])

  return (
    <div className="space-y-6 fade-up max-w-4xl">
      <div className="bg-brand-600 text-white p-8 rounded-2xl shadow-lg flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Computer Based Tests</h1>
          <p className="text-brand-100">{CURRENT_TERM} Examinations</p>
        </div>
        <Laptop size={60} className="text-brand-400 opacity-50 hidden sm:block"/>
      </div>

      {loading ? <div className="text-center p-12 text-gray-400">Loading exams...</div> : (
        <div className="grid md:grid-cols-2 gap-4">
          {subjects.map(s => (
            <div key={s.id} className="card p-5 hover:shadow-lg transition-all border border-gray-100 flex items-center justify-between group">
              <div>
                <h3 className="font-bold text-gray-800 text-lg">{s.name}</h3>
                <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest">{CURRENT_TERM}</p>
              </div>
              <button 
                onClick={() => navigate(`/student/exams/${encodeURIComponent(s.name)}`)}
                className="w-10 h-10 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center group-hover:bg-brand-600 group-hover:text-white transition-colors">
                <Play size={16} fill="currentColor"/>
              </button>
            </div>
          ))}
          {subjects.length === 0 && <div className="col-span-2 text-center p-12 text-gray-400">No exams available for your class.</div>}
        </div>
      )}
    </div>
  )
}
