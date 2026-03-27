import { useState, useEffect } from 'react'
import { CreditCard, History, AlertCircle, CheckCircle } from 'lucide-react'
import api from '../../utils/api'
import { useAuth } from '../../context/AuthContext'

export default function StudentFees() {
  const { user } = useAuth()
  const [fees, setFees] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // user.studentId is not directly in JWT, need to fetch from profile or use me endpoint
    // Since our route `/api/fees/student/:studentId` needs ID, let's fetch profile first
    api.get(`/students/me`).then(r => { // We'll add a /me route if not exists, or adjust JWT.
      // Wait, we can modify the backend to accept /api/fees/me
      // Actually, we don't have a /fees/me route. I will add it to server/routes/fees.js!
      api.get('/fees/me').then(res => setFees(res.data.fees || []))
        .catch(e => console.error(e))
        .finally(()=>setLoading(false))
    }).catch(()=>setLoading(false))
  }, [])

  const totalOwed = fees.reduce((sum, f) => sum + f.balance, 0)
  const totalPaid = fees.reduce((sum, f) => sum + f.paid, 0)

  return (
    <div className="space-y-6 fade-up max-w-4xl">
      <h1 className="text-xl font-bold text-gray-800">My Fees & Payments</h1>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="card bg-gradient-to-br from-red-500 to-red-600 text-white border-none p-6 relative overflow-hidden">
          <p className="text-red-100 mb-1 flex items-center gap-2"><AlertCircle size={16}/> Total Outstanding</p>
          <p className="text-4xl font-bold tracking-tight">₦{totalOwed.toLocaleString()}</p>
          <div className="absolute -right-4 -bottom-4 opacity-20"><CreditCard size={100}/></div>
        </div>
        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white border-none p-6 relative overflow-hidden">
          <p className="text-green-100 mb-1 flex items-center gap-2"><CheckCircle size={16}/> Total Paid This Session</p>
          <p className="text-4xl font-bold tracking-tight">₦{totalPaid.toLocaleString()}</p>
          <div className="absolute -right-4 -bottom-4 opacity-20"><History size={100}/></div>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <h3 className="font-bold text-gray-800 p-4 border-b">Fee History</h3>
        {loading ? <div className="p-8 text-center text-gray-400">Loading...</div> : (
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs">
                <th className="px-4 py-3">Term / Session</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Paid</th>
                <th className="px-4 py-3 text-right">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {fees.map(f => (
                <tr key={f.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-600">{f.term} ({f.session})</td>
                  <td className="px-4 py-3 text-gray-800">{f.category}</td>
                  <td className="px-4 py-3 font-mono">₦{f.amount.toLocaleString()}</td>
                  <td className="px-4 py-3 font-mono text-green-600">₦{f.paid.toLocaleString()}</td>
                  <td className={`px-4 py-3 font-bold text-right font-mono ${f.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    ₦{f.balance.toLocaleString()}
                  </td>
                </tr>
              ))}
              {fees.length === 0 && <tr><td colSpan={5} className="text-center py-8 text-gray-400">No fee records found.</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
