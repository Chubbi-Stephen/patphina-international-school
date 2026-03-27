import { useState, useEffect } from 'react'
import { Plus, CheckCircle, CreditCard, Copy, Eye } from 'lucide-react'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { CURRENT_TERM, CURRENT_SESSION } from '../../utils/config'

export default function AdminFees() {
  const [arrears, setArrears] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    api.get(`/fees/arrears?term=${encodeURIComponent(CURRENT_TERM)}&session=${encodeURIComponent(CURRENT_SESSION)}`)
      .then(r => setArrears(r.arrears || r.data.arrears || [])).finally(()=>setLoading(false))
  }
  useEffect(load, [])

  const totalArrears = arrears.reduce((s,f) => s + f.balance, 0)

  return (
    <div className="space-y-6 fade-up">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Fees & Arrears Management</h1>
          <p className="text-gray-400 text-sm">Showing debtors for {CURRENT_TERM} {CURRENT_SESSION}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Outstanding Total Card */}
        <div className="card bg-gradient-to-br from-red-500 to-red-700 text-white p-6 rounded-2xl md:col-span-1 shadow-lg border-none relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-red-100 font-medium mb-1 flex items-center gap-2"><CreditCard size={18}/> Total Outstanding Array</p>
            <p className="text-4xl font-bold tracking-tight">₦{totalArrears.toLocaleString()}</p>
            <p className="mt-4 text-sm text-red-50">{arrears.length} students have unpaid fees</p>
          </div>
          <div className="absolute -right-8 -bottom-8 opacity-10"><CreditCard size={150}/></div>
        </div>

        {/* Detailed Arrears List */}
        <div className="md:col-span-2 card p-0 overflow-hidden">
          <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
            <h3 className="font-bold text-gray-800">Defaulters List</h3>
            <span className="text-xs bg-red-100 text-red-700 font-bold px-2 py-1 rounded-full">{arrears.length} Students</span>
          </div>
          {loading ? <div className="p-8 text-center text-gray-400">Loading...</div> : arrears.length===0 ? <div className="p-12 text-center text-green-500 font-bold"><CheckCircle className="mx-auto mb-2" size={40}/> No Defaulters!</div> : (
            <div className="max-h-[500px] overflow-y-auto divide-y divide-gray-100">
              {arrears.map(f => (
                <div key={f.id} className="p-4 flex gap-4 hover:bg-gray-50 transition-colors items-center">
                  <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 font-bold flex items-center justify-center flex-shrink-0">
                    {f.full_name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-800">{f.full_name} <span className="text-xs text-gray-400 font-normal">({f.reg_no})</span></p>
                    <p className="text-sm font-medium text-brand-600">{f.class}</p>
                    <p className="text-xs text-gray-500 flex gap-2 mt-1">
                      <span>Total Billed: ₦{f.amount.toLocaleString()}</span>
                      <span>•</span>
                      <span className="text-green-600">Paid: ₦{(f.amount - f.balance).toLocaleString()}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500 uppercase font-semibold">Owes</p>
                    <p className="text-xl font-bold text-red-600">₦{f.balance.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
