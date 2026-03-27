import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import api from '../../utils/api'

export default function AdminAuditLog() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    setLoading(true)
    const t = setTimeout(() => {
      api.get(`/audit?limit=100${search ? `&username=${encodeURIComponent(search)}` : ''}`)
        .then(r => setLogs(r.data.logs || [])).finally(()=>setLoading(false))
    }, 400)
    return () => clearTimeout(t)
  }, [search])

  return (
    <div className="space-y-4 fade-up">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">System Audit Log</h1>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input className="input pl-9 text-sm py-2 w-64" placeholder="Search by username..." value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
      </div>

      <div className="card overflow-x-auto">
        {loading ? <div className="p-8 text-center text-gray-400">Loading...</div> : (
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs">
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Entity</th>
                <th className="px-4 py-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.map(l => (
                <tr key={l.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{new Date(l.created_at).toLocaleString()}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{l.username || 'System'}</td>
                  <td className="px-4 py-3"><span className="bg-gray-100 px-2 py-0.5 rounded text-xs text-gray-600 font-mono">{l.action}</span></td>
                  <td className="px-4 py-3 text-gray-500 text-xs uppercase">{l.entity} (ID: {l.entity_id||'-'})</td>
                  <td className="px-4 py-3 text-gray-600 truncate max-w-md">{l.detail||'-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
