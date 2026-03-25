import { useEffect, useState } from 'react'
import { Users, UserCheck, FileText, HelpCircle, TrendingUp } from 'lucide-react'
import api from '../../utils/api'

export default function AdminDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/dashboard').then(r => setData(r.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"/>
    </div>
  )

  const { stats, classCounts, recentStudents, announcements, gradeDistribution } = data

  const statCards = [
    { label:'Total Students',  value: stats.totalStudents,  icon: Users,      color:'bg-brand-50 text-brand-600' },
    { label:'Total Teachers',  value: stats.totalTeachers,  icon: UserCheck,  color:'bg-green-50 text-green-600' },
    { label:'Results Uploaded',value: stats.totalResults,   icon: FileText,   color:'bg-yellow-50 text-yellow-600' },
    { label:'Questions Set',   value: stats.totalQuestions, icon: HelpCircle, color:'bg-purple-50 text-purple-600' },
  ]

  return (
    <div className="space-y-6 fade-up">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-purple-700 to-purple-900 rounded-2xl p-6 text-white">
        <p className="text-white/60 text-sm mb-1">Admin Panel</p>
        <h1 className="font-display text-2xl font-bold">Patphina International School</h1>
        <p className="text-white/60 text-sm mt-2">2nd Term — 2025/2026 Academic Session</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map(s => (
          <div key={s.label} className="card flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${s.color}`}>
              <s.icon size={20}/>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{s.value}</p>
              <p className="text-gray-400 text-xs">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Class breakdown */}
        <div className="card">
          <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-purple-600"/> Students by Class
          </h2>
          {classCounts.length === 0 ? (
            <p className="text-gray-400 text-sm">No data.</p>
          ) : (
            <div className="space-y-2">
              {classCounts.map(c => {
                const pct = Math.round((c.count / stats.totalStudents) * 100)
                return (
                  <div key={c.class}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700 font-medium">{c.class}</span>
                      <span className="text-gray-400">{c.count} students</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500 rounded-full transition-all" style={{ width:`${pct}%` }}/>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Grade distribution */}
        <div className="card">
          <h2 className="font-semibold text-gray-800 mb-4">Grade Distribution</h2>
          {gradeDistribution.length === 0 ? (
            <p className="text-gray-400 text-sm">No results yet.</p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {gradeDistribution.map(g => {
                const color = g.grade?.startsWith('A') ? 'bg-green-100 text-green-700' : g.grade?.startsWith('B') ? 'bg-blue-100 text-blue-700' : g.grade?.startsWith('C') ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                return (
                  <div key={g.grade} className={`rounded-xl p-3 text-center ${color}`}>
                    <p className="text-2xl font-bold">{g.count}</p>
                    <p className="text-xs font-semibold">{g.grade}</p>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent students */}
      <div className="card">
        <h2 className="font-semibold text-gray-800 mb-4">Recently Added Students</h2>
        {recentStudents.length === 0 ? (
          <p className="text-gray-400 text-sm">No students yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 text-xs border-b border-gray-100">
                  <th className="text-left pb-2 font-medium">Name</th>
                  <th className="text-left pb-2 font-medium">Reg No</th>
                  <th className="text-left pb-2 font-medium">Class</th>
                  <th className="text-left pb-2 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentStudents.map(s => (
                  <tr key={s.reg_no} className="hover:bg-gray-50">
                    <td className="py-2.5 font-medium text-gray-800">{s.full_name}</td>
                    <td className="py-2.5 text-gray-500">{s.reg_no}</td>
                    <td className="py-2.5"><span className="bg-brand-50 text-brand-700 text-xs px-2 py-0.5 rounded-full font-medium">{s.class}</span></td>
                    <td className="py-2.5 text-gray-400 text-xs">{new Date(s.created_at).toLocaleDateString('en-NG', { dateStyle:'medium' })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent announcements */}
      <div className="card">
        <h2 className="font-semibold text-gray-800 mb-4">Recent Announcements</h2>
        {announcements.length === 0 ? <p className="text-gray-400 text-sm">None yet.</p> : (
          <div className="space-y-3">
            {announcements.map(a => (
              <div key={a.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="mt-0.5 w-2 h-2 rounded-full bg-purple-500 flex-shrink-0"/>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{a.title}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{a.body.slice(0,80)}…</p>
                  <span className="text-xs text-gray-400">{a.target} · {new Date(a.created_at).toLocaleDateString('en-NG', { dateStyle:'medium' })}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
