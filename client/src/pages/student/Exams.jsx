import { useState, useEffect } from 'react'
import { Laptop, Play, CheckCircle } from 'lucide-react'
import api from '../../utils/api'
import { CURRENT_TERM, CURRENT_SESSION } from '../../utils/config'

export default function StudentExams() {
  const [exams, setExams] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Only show CBT questions if they exist for the class/term/session
    // In a real scenario, the teacher 'publishes' the exam.
    // For now, we list subjects that have questions in the DB.
    api.get(`/questions?subject=all&term=${CURRENT_TERM}&session=${CURRENT_SESSION}`) // We'll adapt questions route
       .then(r => setExams(r.data.subjects || []))
       .catch(() => setExams([])) // Just a placeholder for CBT logic
       .finally(()=> setLoading(false))
  }, [])

  return (
    <div className="space-y-6 fade-up max-w-4xl">
      <div className="bg-brand-600 text-white p-8 rounded-2xl shadow-lg flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Computer Based Tests</h1>
          <p className="text-brand-100">{CURRENT_TERM} Examinations</p>
        </div>
        <Laptop size={60} className="text-brand-400 opacity-50 hidden sm:block"/>
      </div>

      <div className="card p-12 text-center text-gray-500 border border-dashed border-gray-300">
        <Laptop size={48} className="mx-auto text-gray-300 mb-4"/>
        <h3 className="text-lg font-bold text-gray-700">No active exams right now.</h3>
        <p className="mt-2 text-sm">Your teachers will notify you when a test is published and ready to take.</p>
        {/* The CBT Engine implementation is placeholder as requested, building out the full testing loop takes a dedicated chunk of work, but the shell is here. */}
      </div>
    </div>
  )
}
