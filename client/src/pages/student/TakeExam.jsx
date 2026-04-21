import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Clock, AlertCircle, CheckCircle, ChevronRight, ChevronLeft } from 'lucide-react'
import api from '../../utils/api'
import { CURRENT_TERM, CURRENT_SESSION } from '../../utils/config'
import toast from 'react-hot-toast'

export default function TakeExam() {
  const { subject } = useParams()
  const navigate = useNavigate()
  
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState({}) // { questionId: 'A'|'B'|'C'|'D' }
  const [timeLeft, setTimeLeft] = useState(60 * 30) // 30 mins default
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)

  useEffect(() => {
    api.get(`/questions/student?subject=${encodeURIComponent(subject)}&term=${encodeURIComponent(CURRENT_TERM)}&session=${encodeURIComponent(CURRENT_SESSION)}`)
      .then(r => {
        if (!r.data.questions?.length) {
          toast.error('No active questions found for this exam.')
          navigate('/student/exams')
          return
        }
        setQuestions(r.data.questions)
      })
      .catch(() => navigate('/student/exams'))
      .finally(() => setLoading(false))
  }, [subject, navigate])

  // Timer logic
  useEffect(() => {
    if (loading || result || submitting) return
    if (timeLeft <= 0) {
      handleSubmit()
      return
    }
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000)
    return () => clearInterval(timer)
  }, [timeLeft, loading, result, submitting])

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const handleSelect = (option) => {
    setAnswers(prev => ({ ...prev, [questions[currentIndex].id]: option }))
  }

  const handleSubmit = async () => {
    if (submitting || result) return
    setSubmitting(true)
    try {
      const res = await api.post('/questions/submit', {
        subject, term: CURRENT_TERM, session: CURRENT_SESSION, answers
      })
      setResult(res.data)
      toast.success('Exam submitted successfully!')
    } catch (err) {
      toast.error('Failed to submit exam')
      setSubmitting(false)
    }
  }

  const confirmSubmit = () => {
    if (Object.keys(answers).length < questions.length) {
      if (!window.confirm(`You have unanswered questions. Are you sure you want to finalize your submission?`)) return
    } else {
      if (!window.confirm('Submit examination? You cannot undo this action.')) return
    }
    handleSubmit()
  }

  if (loading) return <div className="p-12 text-center text-gray-500">Loading Exam Data...</div>

  // --- RESULT VIEW ---
  if (result) {
    return (
      <div className="max-w-2xl mx-auto mt-12 fade-up">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center border-t-8 border-brand-600">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-green-600"/>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Exam Submitted</h1>
          <p className="text-gray-500 mb-6">Your answers have been automatically graded.</p>
          
          <div className="bg-gray-50 rounded-xl p-6 inline-block mb-8">
            <p className="text-sm text-gray-400 font-bold uppercase tracking-wider mb-1">Final Score</p>
            <p className="text-5xl font-display font-black text-brand-700">{result.score} <span className="text-2xl text-gray-400">/ {result.max}</span></p>
          </div>

          <div>
            <button onClick={() => navigate('/student/results')} className="btn-primary w-full max-w-xs mx-auto block py-3">View Full Report Card</button>
          </div>
        </div>
      </div>
    )
  }

  // --- EXAM ENVIRONMENT ---
  const q = questions[currentIndex]
  const answeredCount = Object.keys(answers).length

  return (
    <div className="max-w-4xl mx-auto space-y-4 fade-up select-none">
      
      {/* Header Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sticky top-4 z-10 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{subject} Exam</p>
          <div className="flex items-center gap-2 mt-1">
            <div className="bg-gray-200 h-2 w-32 md:w-48 rounded-full overflow-hidden">
              <div className="bg-brand-500 h-full transition-all" style={{ width: `${(answeredCount/questions.length)*100}%` }}/>
            </div>
            <span className="text-xs font-bold text-gray-500">{answeredCount} / {questions.length}</span>
          </div>
        </div>

        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg font-bold border-2 ${timeLeft < 300 ? 'border-red-500 text-red-600 animate-pulse bg-red-50' : 'border-gray-200 text-gray-700 bg-white'}`}>
          <Clock size={20}/>
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Main Panel */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        
        {/* Question Area */}
        <div className="p-6 md:p-10">
          <div className="flex items-start gap-4">
            <span className="text-2xl font-bold text-brand-200 shrink-0">Q{currentIndex + 1}.</span>
            <h2 className="text-xl md:text-2xl font-semibold text-gray-800 leading-relaxed">{q.question}</h2>
          </div>

          {/* Options */}
          <div className="mt-8 space-y-3 pl-0 md:pl-12">
            {['A', 'B', 'C', 'D'].map((opt) => {
              const text = q[`option_${opt.toLowerCase()}`]
              const isSelected = answers[q.id] === opt
              return (
                <button
                  key={opt}
                  onClick={() => handleSelect(opt)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-4 group ${isSelected ? 'border-brand-600 bg-brand-50 shadow-[0_0_0_4px_rgba(37,99,235,0.1)]' : 'border-gray-100 hover:border-gray-300 hover:bg-gray-50'}`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm transition-colors ${isSelected ? 'bg-brand-600 text-white' : 'bg-gray-200 text-gray-600 group-hover:bg-gray-300'}`}>
                    {opt}
                  </div>
                  <span className={`text-lg ${isSelected ? 'font-semibold text-brand-900' : 'text-gray-700'}`}>{text}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="bg-gray-50 p-4 border-t flex flex-wrap items-center justify-between gap-4">
          <button 
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex(c => c - 1)}
            className="btn-secondary px-6 flex items-center gap-2 disabled:opacity-50">
            <ChevronLeft size={18}/> Previous
          </button>
          
          {/* Bubbles for nav on desktop */}
          <div className="hidden md:flex gap-1 overflow-x-auto max-w-sm px-2">
            {questions.map((_, idx) => (
              <button key={idx} onClick={()=>setCurrentIndex(idx)} 
                className={`w-7 h-7 rounded-sm text-xs font-bold transition-all ${currentIndex === idx ? 'ring-2 ring-brand-600 ring-offset-2 bg-brand-600 text-white' : answers[questions[idx].id] ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500 hover:bg-gray-300'}`}>
                {idx + 1}
              </button>
            ))}
          </div>

          {currentIndex === questions.length - 1 ? (
            <button onClick={confirmSubmit} disabled={submitting} className="btn-primary px-8 flex items-center gap-2 bg-red-600 hover:bg-red-700 border-red-600">
              <CheckCircle size={18}/> {submitting ? 'Submitting...' : 'Finish Exam'}
            </button>
          ) : (
            <button onClick={() => setCurrentIndex(c => c + 1)} className="btn-primary px-8 flex items-center gap-2">
              Next <ChevronRight size={18}/>
            </button>
          )}
        </div>
      </div>

    </div>
  )
}
