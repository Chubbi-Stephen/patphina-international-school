import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import api from '../../utils/api'

export default function AdminAuditLog() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 50

  useEffect(() => {
    setLoading(true)
    const t = setTimeout(() => {
      const offset = (page - 1) * limit
      api.get(`/audit?limit=${limit}&offset=${offset}${search ? `&username=${encodeURIComponent(search)}` : ''}`)
        .then(r => {
          setLogs(r.data.logs || [])
          setTotal(r.data.total || 0)
        }).finally(()=>setLoading(false))
    }, 400)
    return () => clearTimeout(t)
  }, [search, page])

  // Reset page when search term changes
  useEffect(() => setPage(1), [search])

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

        {/* Pagination Footer */}
        <div className="p-4 border-t flex items-center justify-between text-sm text-gray-500 bg-gray-50">
          <div>Showing {total === 0 ? 0 : (page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} entries</div>
          <div className="flex gap-2">
            <button 
              disabled={page === 1} 
              onClick={() => setPage(p => p - 1)} 
              className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 disabled:opacity-50 font-medium text-gray-700 transition-colors">
              Previous
            </button>
            <button 
              disabled={page * limit >= total} 
              onClick={() => setPage(p => p + 1)} 
              className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 disabled:opacity-50 font-medium text-gray-700 transition-colors">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
