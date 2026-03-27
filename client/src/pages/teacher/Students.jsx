import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Search, ChevronDown, ChevronUp } from 'lucide-react'
import api from '../../utils/api'

export default function TeacherStudents() {
  const { user } = useAuth()
  const [students, setStudents]   = useState([])
  const [loading, setLoading]     = useState(false)
  const [selectedClass, setSelectedClass] = useState('')
  const [search, setSearch]       = useState('')
  const [expanded, setExpanded]   = useState(null)
  const [results, setResults]     = useState({})

  const classList = user?.classes || []  // plain string array

  useEffect(() => {
    if (classList.length && !selectedClass) setSelectedClass(classList[0])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classList.join(',')])

  useEffect(() => {
    if (!selectedClass) return
    setLoading(true)
    api.get(`/students?class=${selectedClass}`)
      .then(r => setStudents(r.data.students || []))
      .finally(() => setLoading(false))
  }, [selectedClass])

  const loadResults = async (studentId) => {
    if (expanded === studentId) { setExpanded(null); return }
    if (!results[studentId]) {
      const r = await api.get(`/results/student/${studentId}`)
      setResults(prev => ({ ...prev, [studentId]: r.data.results || [] }))
    }
    setExpanded(studentId)
  }

  const filtered = students.filter(s =>
    s.full_name.toLowerCase().includes(search.toLowerCase()) ||
    s.reg_no.toLowerCase().includes(search.toLowerCase())
  )

  const gradeColor = (g = '') =>
    g.startsWith('A') ? 'text-green-600' : g.startsWith('B') ? 'text-blue-600' :
    g.startsWith('C') ? 'text-yellow-600' : 'text-red-600'

  return (
    <div className="space-y-5 fade-up">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">My Students</h1>
        <span className="text-sm text-gray-400">{filtered.length} students</span>
      </div>

      <div className="card flex flex-wrap gap-3">
        <div className="flex flex-wrap gap-1.5">
          {classList.map(c => (
            <button key={c} onClick={() => setSelectedClass(c)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all
                ${selectedClass === c ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {c}
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-[180px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input className="input pl-9 py-2 text-sm" placeholder="Search student..."
            value={search} onChange={e => setSearch(e.target.value)}/>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"/>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-4xl mb-3">👥</p>
          <p className="text-gray-400">No students found.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(s => (
            <div key={s.id} className="card p-0 overflow-hidden">
              <div className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => loadResults(s.id)}>
                <div className="w-9 h-9 rounded-full bg-green-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {s.full_name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm truncate">{s.full_name}</p>
                  <p className="text-gray-400 text-xs">{s.reg_no} · {s.gender || '—'}</p>
                </div>
                {expanded === s.id ? <ChevronUp size={16} className="text-gray-400"/> : <ChevronDown size={16} className="text-gray-400"/>}
              </div>

              {expanded === s.id && (
                <div className="border-t border-gray-100 p-4 bg-gray-50">
                  <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">
                    Results — {selectedClass}
                  </p>
                  {(results[s.id] || []).length === 0 ? (
                    <p className="text-gray-400 text-sm">No results uploaded yet.</p>
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-gray-400 text-xs">
                          <th className="text-left pb-2">Subject</th>
                          <th className="text-center pb-2">CA</th>
                          <th className="text-center pb-2">Exam</th>
                          <th className="text-center pb-2">Total</th>
                          <th className="text-center pb-2">Grade</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {results[s.id].map(r => (
                          <tr key={r.id}>
                            <td className="py-1.5 text-gray-700">{r.subject}</td>
                            <td className="py-1.5 text-center text-gray-500">{r.ca_score}</td>
                            <td className="py-1.5 text-center text-gray-500">{r.exam_score}</td>
                            <td className="py-1.5 text-center font-bold text-gray-800">{Number(r.ca_score) + Number(r.exam_score)}</td>
                            <td className={`py-1.5 text-center font-bold text-xs ${gradeColor(r.grade)}`}>{r.grade}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
