import { useState, useEffect } from 'react'
import { Printer } from 'lucide-react'
import api from '../../utils/api'
import { CURRENT_TERM, CURRENT_SESSION } from '../../utils/config'

export default function AdminAttendance() {
  const [classes, setClasses] = useState([])
  const [selectedClass, setSelectedClass] = useState('')
  const [report, setReport] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get('/admin/classes').then(r => {
      setClasses(r.data.classes || [])
      if(r.data.classes?.length) setSelectedClass(r.data.classes[0])
    })
  }, [])

  useEffect(() => {
    if(!selectedClass) return
    setLoading(true)
    api.get(`/attendance/report?class=${encodeURIComponent(selectedClass)}&term=${encodeURIComponent(CURRENT_TERM)}&session=${encodeURIComponent(CURRENT_SESSION)}`)
      .then(r => setReport(r.data.report || [])).finally(()=>setLoading(false))
  }, [selectedClass])

  const color = (status) => ({ present:'text-green-600', absent:'text-red-600', late:'text-orange-600' }[status] || 'text-gray-500')

  return (
    <div className="space-y-5 fade-up max-w-5xl items-start">
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Attendance Register</h1>
          <p className="text-sm text-gray-400">{CURRENT_TERM} / {CURRENT_SESSION}</p>
        </div>
        <button onClick={()=>window.print()} className="btn-secondary gap-2"><Printer size={15}/> Print Report</button>
      </div>

      <div className="card p-4 flex gap-4 print:hidden">
        <select className="input max-w-xs" value={selectedClass} onChange={e=>setSelectedClass(e.target.value)}>
          {classes.map(c=><option key={c}>{c}</option>)}
        </select>
        <div className="flex bg-gray-50 rounded-lg p-2 gap-4 border text-sm">
           <div className="text-center px-4 border-r"><p className="text-gray-400 text-xs">Total Students</p><p className="font-bold text-gray-700">{report.length}</p></div>
           <div className="text-center px-4"><p className="text-gray-400 text-xs">Avg Total Days</p><p className="font-bold text-gray-700">{Math.round(report.reduce((s,r)=>s+(r.total_days||0),0)/(report.length||1))||0}</p></div>
        </div>
      </div>

      {loading ? <div className="p-12 text-center text-gray-400">Loading...</div> : (
        <div className="card overflow-x-auto print:shadow-none print:border-none">
          <h2 className="hidden print:block text-center font-bold text-2xl mb-4 border-b pb-4">Attendance Report: {selectedClass}</h2>
          <table className="w-full text-sm text-center">
            <thead>
              <tr className="bg-gray-50 text-gray-600">
                <th className="text-left px-4 py-3 border-b">Student</th>
                <th className="px-4 py-3 border-b">Reg No</th>
                <th className="px-4 py-3 border-b">Present</th>
                <th className="px-4 py-3 border-b">Absent</th>
                <th className="px-4 py-3 border-b">Late</th>
                <th className="px-4 py-3 border-b bg-brand-50 text-brand-700">Total Recorded</th>
                <th className="px-4 py-3 border-b">Performance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {report.map(r => {
                const perc = r.total_days > 0 ? Math.round((r.present / r.total_days)*100) : 0;
                return (
                  <tr key={r.id}>
                    <td className="px-4 py-3 text-left font-bold text-gray-800">{r.full_name}</td>
                    <td className="px-4 py-3 text-gray-500">{r.reg_no}</td>
                    <td className="px-4 py-3 font-semibold text-green-600">{r.present||0}</td>
                    <td className="px-4 py-3 font-semibold text-red-600">{r.absent||0}</td>
                    <td className="px-4 py-3 font-semibold text-orange-600">{r.late||0}</td>
                    <td className="px-4 py-3 font-bold bg-brand-50/50">{r.total_days||0}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 max-w-[100px] mx-auto">
                        <div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden">
                          <div className={`h-full ${perc>75?'bg-green-500':perc>50?'bg-yellow-500':'bg-red-500'}`} style={{width:`${perc}%`}}/>
                        </div>
                        <span className="text-xs font-bold w-6">{perc}%</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
