import { useEffect, useState } from 'react'
import { Search, Trash2 } from 'lucide-react'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { useDebounce } from '../../hooks/useDebounce'

export default function AdminResults() {
  const [students, setStudents] = useState([])
  const [selected, setSelected] = useState(null)
  const [results, setResults] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [classes, setClasses] = useState([])
  const [filterClass, setFilterClass] = useState('')
  const debouncedSearch = useDebounce(search, 300)

  useEffect(() => {
    api.get('/admin/classes').then(r => setClasses(r.data.classes || []))
  }, [])

  useEffect(() => {
    let url = '/students?'
    if (filterClass) url += `class=${filterClass}&`
    if (debouncedSearch) url += `search=${debouncedSearch}&`
    api.get(url).then(r => setStudents(r.data.students || []))
  }, [filterClass, debouncedSearch])

  const loadResults = (s) => {
    setSelected(s); setLoading(true)
    api.get(`/results/student/${s.id}`)
      .then(r => setResults(r.data.results || []))
      .finally(() => setLoading(false))
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this result?')) return
    await api.delete(`/results/${id}`)
    toast.success('Result deleted')
    setResults(prev => prev.filter(r => r.id !== id))
  }

  const gradeColor = (g='') => {
    if (g.startsWith('A')) return 'bg-green-100 text-green-700'
    if (g.startsWith('B')) return 'bg-blue-100 text-blue-700'
    if (g.startsWith('C')) return 'bg-yellow-100 text-yellow-700'
    return 'bg-red-100 text-red-700'
  }

  return (
    <div className="space-y-5 fade-up">
      <h1 className="text-xl font-bold text-gray-800">Results Management</h1>

      <div className="grid md:grid-cols-3 gap-5">
        {/* Student list */}
        <div className="space-y-3">
          <div className="card p-3 space-y-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
              <input className="input pl-9 py-2 text-sm" placeholder="Search student..." value={search} onChange={e=>setSearch(e.target.value)}/>
            </div>
            <select className="input text-sm py-2" value={filterClass} onChange={e=>setFilterClass(e.target.value)}>
              <option value="">All Classes</option>
              {classes.map(c=><option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="space-y-1.5 max-h-[600px] overflow-y-auto">
            {students.map(s => (
              <button key={s.id} onClick={() => loadResults(s)}
                className={`w-full text-left p-3 rounded-xl border transition-all text-sm ${selected?.id===s.id ? 'bg-brand-600 text-white border-brand-600' : 'bg-white border-gray-100 hover:border-brand-200 hover:bg-brand-50'}`}>
                <p className="font-semibold truncate">{s.full_name}</p>
                <p className={`text-xs ${selected?.id===s.id ? 'text-white/70' : 'text-gray-400'}`}>{s.reg_no} · {s.class}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="md:col-span-2">
          {!selected ? (
            <div className="card text-center py-16">
              <p className="text-4xl mb-3">📋</p>
              <p className="text-gray-400">Select a student to view their results</p>
            </div>
          ) : loading ? (
            <div className="card flex justify-center py-12"><div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"/></div>
          ) : (
            <div className="card">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="font-semibold text-gray-800">{selected.full_name}</h2>
                  <p className="text-gray-400 text-xs">{selected.reg_no} · {selected.class}</p>
                </div>
                <span className="text-sm text-gray-500">{results.length} subjects</span>
              </div>
              {results.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">No results uploaded for this student.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 text-gray-500 text-xs">
                        <th className="text-left px-3 py-2.5">Subject</th>
                        <th className="text-center px-3 py-2.5">Term</th>
                        <th className="text-center px-3 py-2.5">CA</th>
                        <th className="text-center px-3 py-2.5">Exam</th>
                        <th className="text-center px-3 py-2.5">Total</th>
                        <th className="text-center px-3 py-2.5">Grade</th>
                        <th className="text-center px-3 py-2.5">Teacher</th>
                        <th className="text-center px-3 py-2.5">Del</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {results.map(r => (
                        <tr key={r.id} className="hover:bg-gray-50">
                          <td className="px-3 py-2.5 font-medium text-gray-800">{r.subject}</td>
                          <td className="px-3 py-2.5 text-center text-gray-400 text-xs">{r.term}</td>
                          <td className="px-3 py-2.5 text-center text-gray-600">{r.ca_score}</td>
                          <td className="px-3 py-2.5 text-center text-gray-600">{r.exam_score}</td>
                          <td className="px-3 py-2.5 text-center font-bold text-gray-800">{Number(r.ca_score) + Number(r.exam_score)}</td>
                          <td className="px-3 py-2.5 text-center">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${gradeColor(r.grade)}`}>{r.grade}</span>
                          </td>
                          <td className="px-3 py-2.5 text-center text-gray-400 text-xs">{r.teacher_name || '—'}</td>
                          <td className="px-3 py-2.5 text-center">
                            <button onClick={() => handleDelete(r.id)} className="p-1 text-gray-300 hover:text-red-500 transition-colors">
                              <Trash2 size={13}/>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
