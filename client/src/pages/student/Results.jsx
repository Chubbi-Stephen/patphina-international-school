import { useEffect, useState } from 'react'
import { Printer, TrendingUp, Download } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import api from '../../utils/api'
import { CURRENT_TERM, CURRENT_SESSION } from '../../utils/config'
import { generateReportCardPDF } from '../../components/pdf/ReportCardDoc'

const gradeColor = (g = '') => {
  if (g.startsWith('A')) return 'bg-green-100 text-green-700'
  if (g.startsWith('B')) return 'bg-blue-100 text-blue-700'
  if (g.startsWith('C')) return 'bg-yellow-100 text-yellow-700'
  if (g.startsWith('D')) return 'bg-orange-100 text-orange-700'
  return 'bg-red-100 text-red-700'
}

const gradeRemark = (g = '') => {
  const map = { A1:'Excellent', B2:'Very Good', B3:'Good', C4:'Credit', C5:'Credit', C6:'Credit', D7:'Pass', E8:'Pass', F9:'Fail' }
  return map[g] || '-'
}

export default function StudentResults() {
  const { user } = useAuth()
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [term, setTerm] = useState(CURRENT_TERM)
  const [session, setSession] = useState(CURRENT_SESSION)

  useEffect(() => {
    setLoading(true)
    api.get(`/results/me?term=${encodeURIComponent(term)}&session=${encodeURIComponent(session)}`)
      .then(r => setResults(r.data.results || []))
      .finally(() => setLoading(false))
  }, [term, session])

  // Compute total from actual columns (no `total` column in DB)
  const getTotal = (r) => Number(r.ca_score) + Number(r.exam_score)

  const totalScore = results.reduce((s, r) => s + getTotal(r), 0)
  const avg        = results.length ? Math.round(totalScore / results.length) : 0
  const highest    = results.length ? Math.max(...results.map(getTotal)) : 0
  const lowest     = results.length ? Math.min(...results.map(getTotal)) : 0

  const handlePrint = () => window.print()

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"/>
    </div>
  )

  return (
    <div className="space-y-5 fade-up">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Academic Results</h1>
          <p className="text-gray-500 text-sm">{user?.full_name} · {user?.class}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <select className="input !w-auto text-sm py-2" value={term} onChange={e => setTerm(e.target.value)}>
            <option>1st Term</option>
            <option>2nd Term</option>
            <option>3rd Term</option>
          </select>
          <select className="input !w-auto text-sm py-2" value={session} onChange={e => setSession(e.target.value)}>
            <option>2025/2026</option>
            <option>2024/2025</option>
          </select>
          <button onClick={handlePrint} className="btn-secondary flex items-center gap-2 py-2">
            <Printer size={15}/> Print
          </button>
          <button 
            onClick={() => generateReportCardPDF(user, results, { term, session }, { totalScore, maxScore: results.length * 100, average: avg, studentPos: results[0]?.position || '-', classSize: results[0]?.class_size || '-' })}
            className="flex items-center gap-2 py-2 px-4 bg-gray-800 hover:bg-gray-900 text-white font-medium rounded-lg text-sm transition-colors shadow-sm">
            <Download size={15}/> Official PDF
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label:'Total Score',  value: totalScore, color:'text-brand-700' },
          { label:'Average',      value: `${avg}%`,  color:'text-green-600' },
          { label:'Highest',      value: highest,    color:'text-blue-600' },
          { label:'Lowest',       value: lowest,     color:'text-orange-600' },
        ].map(s => (
          <div key={s.label} className="card text-center py-4">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-gray-400 text-xs mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Result sheet */}
      <div className="card overflow-x-auto print:shadow-none">
        {/* Print header */}
        <div className="hidden print:flex items-center gap-4 mb-6 pb-4 border-b-2 border-brand-700">
          <div className="w-16 h-16 rounded-full bg-brand-700 flex items-center justify-center text-white text-2xl font-bold">P</div>
          <div>
            <h2 className="text-xl font-display font-bold text-brand-900">Patphina International School</h2>
            <p className="text-gray-500 text-sm">Ojo Barracks, Lagos  ·  info@patphina.edu.ng</p>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4 print:hidden">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2">
            <TrendingUp size={18} className="text-brand-600"/> Result Sheet
          </h2>
          <span className="text-sm text-gray-500">{term} — {session}</span>
        </div>

        {/* Student info row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5 p-4 bg-gray-50 rounded-xl text-sm">
          <div><p className="text-gray-400 text-xs">Student Name</p><p className="font-semibold text-gray-800">{user?.full_name}</p></div>
          <div><p className="text-gray-400 text-xs">Reg Number</p><p className="font-semibold text-gray-800">{user?.reg_no}</p></div>
          <div><p className="text-gray-400 text-xs">Class</p><p className="font-semibold text-gray-800">{user?.class}</p></div>
          <div><p className="text-gray-400 text-xs">Term / Session</p><p className="font-semibold text-gray-800">{term} / {session}</p></div>
        </div>

        {results.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">📋</p>
            <p className="text-gray-400">No results available for this term.</p>
          </div>
        ) : (
          <>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-brand-700 text-white">
                  <th className="text-left px-4 py-3 rounded-tl-lg">Subject</th>
                  <th className="px-4 py-3 text-center">CA (30)</th>
                  <th className="px-4 py-3 text-center">Exam (70)</th>
                  <th className="px-4 py-3 text-center">Total (100)</th>
                  <th className="px-4 py-3 text-center">Grade</th>
                  <th className="px-4 py-3 text-center rounded-tr-lg">Remark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {results.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{r.subject}</td>
                    <td className="px-4 py-3 text-center text-gray-600">{r.ca_score}</td>
                    <td className="px-4 py-3 text-center text-gray-600">{r.exam_score}</td>
                    <td className="px-4 py-3 text-center font-bold text-gray-800">{getTotal(r)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${gradeColor(r.grade)}`}>{r.grade}</span>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-500 text-xs">{gradeRemark(r.grade)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-brand-50 font-semibold">
                  <td className="px-4 py-3 text-brand-800">TOTAL / AVERAGE</td>
                  <td colSpan={2} className="px-4 py-3"/>
                  <td className="px-4 py-3 text-center text-brand-800 font-bold">{totalScore} / {avg}%</td>
                  <td colSpan={2} className="px-4 py-3"/>
                </tr>
              </tfoot>
            </table>

            {/* Grade key */}
            <div className="mt-5 p-4 bg-gray-50 rounded-xl">
              <p className="text-xs font-semibold text-gray-500 mb-2">Grade Key</p>
              <div className="flex flex-wrap gap-2 text-xs">
                {[['A1','75-100','Excellent'],['B2','70-74','Very Good'],['B3','65-69','Good'],['C4','60-64','Credit'],['C5','55-59','Credit'],['C6','50-54','Credit'],['D7','45-49','Pass'],['E8','40-44','Pass'],['F9','0-39','Fail']].map(([g,r,l])=>(
                  <span key={g} className={`px-2 py-1 rounded-full font-medium ${gradeColor(g)}`}>{g}: {r} ({l})</span>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
