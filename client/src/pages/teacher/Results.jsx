import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Save, CheckCircle } from 'lucide-react'
import api from '../../utils/api'
import toast from 'react-hot-toast'

export default function TeacherResults() {
  const { user } = useAuth()
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [term, setTerm]       = useState('2nd Term')
  const [session, setSession] = useState('2025/2026')
  const [students, setStudents] = useState([])
  const [scores, setScores]   = useState({})
  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)

  // classes is a plain array of strings e.g. ['SS1A','SS2A']
  const classList = user?.classes || []

  // subjects taught by this teacher — derive from their profile subject field
  const subject = user?.subject || ''

  useEffect(() => {
    if (classList.length > 0 && !selectedClass) {
      setSelectedClass(classList[0])
      setSelectedSubject(subject)
    }
  }, [user])

  useEffect(() => {
    if (!selectedClass) return
    setSaved(false)
    api.get(`/students?class=${selectedClass}`).then(r => {
      const list = r.data.students || []
      setStudents(list)
      const init = {}
      list.forEach(s => { init[s.id] = { ca_score: '', exam_score: '' } })
      setScores(init)
    })
  }, [selectedClass])

  const handleScore = (id, field, value) => {
    const max = field === 'ca_score' ? 30 : 70
    const num = Math.min(Math.max(0, Number(value)), max)
    setScores(prev => ({ ...prev, [id]: { ...prev[id], [field]: num } }))
  }

  const gradeFromTotal = (t) => {
    if (t >= 75) return 'A1'; if (t >= 70) return 'B2'; if (t >= 65) return 'B3'
    if (t >= 60) return 'C4'; if (t >= 55) return 'C5'; if (t >= 50) return 'C6'
    if (t >= 45) return 'D7'; if (t >= 40) return 'E8'; return 'F9'
  }

  const handleSubmit = async () => {
    const results = students
      .filter(s => scores[s.id]?.ca_score !== '' && scores[s.id]?.exam_score !== '')
      .map(s => ({ student_id: s.id, subject: selectedSubject, ca_score: Number(scores[s.id].ca_score), exam_score: Number(scores[s.id].exam_score) }))

    if (!results.length) return toast.error('Enter at least one score')
    setSaving(true)
    try {
      await api.post('/results/bulk', { results, term, session })
      toast.success(`${results.length} results saved!`)
      setSaved(true)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save')
    } finally { setSaving(false) }
  }

  const filled = Object.values(scores).filter(s => s.ca_score !== '' && s.exam_score !== '').length

  return (
    <div className="space-y-5 fade-up">
      <h1 className="text-xl font-bold text-gray-800">Upload Results</h1>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="label">Class</label>
            <select className="input" value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
              <option value="">— Select class —</option>
              {classList.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Subject</label>
            <input className="input bg-gray-50 cursor-not-allowed" value={selectedSubject} readOnly/>
          </div>
          <div>
            <label className="label">Term</label>
            <select className="input" value={term} onChange={e => setTerm(e.target.value)}>
              <option>1st Term</option><option>2nd Term</option><option>3rd Term</option>
            </select>
          </div>
          <div>
            <label className="label">Session</label>
            <select className="input" value={session} onChange={e => setSession(e.target.value)}>
              <option>2025/2026</option><option>2024/2025</option>
            </select>
          </div>
        </div>
      </div>

      {/* Score table */}
      <div className="card overflow-x-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-gray-800">{selectedClass} — {selectedSubject}</h2>
            <p className="text-gray-400 text-xs mt-0.5">{filled} / {students.length} filled · CA max 30, Exam max 70</p>
          </div>
          {saved && (
            <span className="flex items-center gap-1.5 text-green-600 text-sm font-medium bg-green-50 px-3 py-1.5 rounded-full">
              <CheckCircle size={15}/> Saved
            </span>
          )}
        </div>

        {!selectedClass ? (
          <p className="text-center text-gray-400 py-8">Select a class above to load students.</p>
        ) : students.length === 0 ? (
          <p className="text-center text-gray-400 py-8">No students in this class.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-3 py-3 text-gray-500 font-medium">Student Name</th>
                <th className="px-3 py-3 text-gray-500 font-medium">Reg No</th>
                <th className="px-3 py-3 text-gray-500 font-medium text-center">CA (30)</th>
                <th className="px-3 py-3 text-gray-500 font-medium text-center">Exam (70)</th>
                <th className="px-3 py-3 text-gray-500 font-medium text-center">Total / Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {students.map(s => {
                const sc = scores[s.id] || {}
                const total = sc.ca_score !== '' && sc.exam_score !== '' ? Number(sc.ca_score) + Number(sc.exam_score) : null
                const grade = total !== null ? gradeFromTotal(total) : ''
                const gc = grade.startsWith('A') ? 'text-green-600' : grade.startsWith('B') ? 'text-blue-600' : grade.startsWith('C') ? 'text-yellow-600' : grade ? 'text-red-600' : ''
                return (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2.5 font-medium text-gray-800">{s.full_name}</td>
                    <td className="px-3 py-2.5 text-gray-400 text-xs">{s.reg_no}</td>
                    <td className="px-3 py-2.5 text-center">
                      <input type="number" min="0" max="30" placeholder="0"
                        className="w-20 text-center border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                        value={sc.ca_score ?? ''} onChange={e => handleScore(s.id, 'ca_score', e.target.value)}/>
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <input type="number" min="0" max="70" placeholder="0"
                        className="w-20 text-center border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                        value={sc.exam_score ?? ''} onChange={e => handleScore(s.id, 'exam_score', e.target.value)}/>
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      {total !== null
                        ? <span className={`font-bold ${gc}`}>{total} ({grade})</span>
                        : <span className="text-gray-300">—</span>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}

        {students.length > 0 && (
          <div className="mt-5 flex justify-end">
            <button onClick={handleSubmit} disabled={saving || !filled}
              className="btn-primary flex items-center gap-2 px-6">
              {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <Save size={15}/>}
              {saving ? 'Saving...' : `Save ${filled} Results`}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
