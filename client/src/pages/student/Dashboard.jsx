import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FileText, User, Megaphone, BookOpen, ChevronRight } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import api from '../../utils/api'
import { CURRENT_TERM, CURRENT_SESSION } from '../../utils/config'

export default function StudentDashboard() {
  const { user } = useAuth()
  const [results, setResults] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get(`/results/me?term=${encodeURIComponent(CURRENT_TERM)}&session=${encodeURIComponent(CURRENT_SESSION)}`),
      api.get('/admin/announcements?target=students'),
    ]).then(([r, a]) => {
      setResults(r.data.results || [])
      setAnnouncements(a.data.announcements || [])
    }).finally(() => setLoading(false))
  }, [])

  const avg = results.length
    ? Math.round(results.reduce((s, r) => s + (r.ca_score + r.exam_score), 0) / results.length)
    : 0

  const gradeColor = (g = '') => {
    if (g.startsWith('A')) return 'bg-green-100 text-green-700'
    if (g.startsWith('B')) return 'bg-blue-100 text-blue-700'
    if (g.startsWith('C')) return 'bg-yellow-100 text-yellow-700'
    return 'bg-red-100 text-red-700'
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"/>
    </div>
  )

  return (
    <div className="space-y-6 fade-up">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-brand-700 to-brand-900 rounded-2xl p-6 text-white">
        <p className="text-white/60 text-sm mb-1">Welcome back,</p>
        <h1 className="font-display text-2xl font-bold">{user?.full_name}</h1>
        <div className="flex flex-wrap gap-4 mt-4 text-sm">
          <span className="bg-white/10 px-3 py-1 rounded-full">📋 {user?.reg_no}</span>
          <span className="bg-white/10 px-3 py-1 rounded-full">🏫 Class: {user?.class}</span>
          <span className="bg-white/10 px-3 py-1 rounded-full">📅 2nd Term 2025/2026</span>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="card text-center">
          <p className="text-3xl font-bold text-brand-700">{results.length}</p>
          <p className="text-gray-500 text-sm mt-1">Subjects</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-green-600">{avg}%</p>
          <p className="text-gray-500 text-sm mt-1">Average Score</p>
        </div>
        <div className="card text-center col-span-2 md:col-span-1">
          <p className="text-3xl font-bold text-purple-600">
            {results.filter(r => (r.grade || '').startsWith('A') || (r.grade || '').startsWith('B')).length}
          </p>
          <p className="text-gray-500 text-sm mt-1">A/B Grades</p>
        </div>
      </div>

      {/* Results preview */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2">
            <FileText size={18} className="text-brand-600"/> Recent Results
          </h2>
          <Link to="/student/results" className="text-brand-600 text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all">
            View all <ChevronRight size={14}/>
          </Link>
        </div>
        {results.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-6">No results uploaded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <th className="pb-2 font-medium">Subject</th>
                  <th className="pb-2 font-medium text-right">CA</th>
                  <th className="pb-2 font-medium text-right">Exam</th>
                  <th className="pb-2 font-medium text-right">Total</th>
                  <th className="pb-2 font-medium text-right">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {results.slice(0, 5).map(r => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="py-2.5 font-medium text-gray-700">{r.subject}</td>
                    <td className="py-2.5 text-right text-gray-500">{r.ca_score}</td>
                    <td className="py-2.5 text-right text-gray-500">{r.exam_score}</td>
                    <td className="py-2.5 text-right font-semibold text-gray-800">{Number(r.ca_score) + Number(r.exam_score)}</td>
                    <td className="py-2.5 text-right">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${gradeColor(r.grade)}`}>{r.grade}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Announcements */}
      <div className="card">
        <h2 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
          <Megaphone size={18} className="text-brand-600"/> Announcements
        </h2>
        {announcements.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-4">No announcements.</p>
        ) : (
          <div className="space-y-3">
            {announcements.map(a => (
              <div key={a.id} className="bg-brand-50 border border-brand-100 rounded-xl p-4">
                <p className="font-semibold text-brand-800 text-sm">{a.title}</p>
                <p className="text-gray-600 text-sm mt-1">{a.body}</p>
                <p className="text-gray-400 text-xs mt-2">{new Date(a.created_at).toLocaleDateString('en-NG', { dateStyle: 'medium' })}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
