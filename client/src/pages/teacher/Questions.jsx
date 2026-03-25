import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Plus, Trash2, Pencil, X, Save } from 'lucide-react'
import api from '../../utils/api'
import toast from 'react-hot-toast'

const blank = { class:'', subject:'', term:'2nd Term', session:'2025/2026', question:'', option_a:'', option_b:'', option_c:'', option_d:'', answer:'A', marks:1 }

export default function TeacherQuestions() {
  const { user } = useAuth()
  const [questions, setQuestions] = useState([])
  const [loading, setLoading]     = useState(true)
  const [showForm, setShowForm]   = useState(false)
  const [form, setForm]           = useState(blank)
  const [editing, setEditing]     = useState(null)
  const [filterClass, setFilterClass] = useState('')

  const classList = user?.classes || []
  const subject   = user?.subject  || ''

  const load = () => api.get('/questions').then(r => setQuestions(r.data.questions || [])).finally(() => setLoading(false))
  useEffect(load, [])

  const openNew = () => {
    setForm({ ...blank, class: classList[0] || '', subject })
    setEditing(null)
    setShowForm(true)
  }

  const openEdit = (q) => {
    setForm({ class:q.class, subject:q.subject, term:q.term, session:q.session,
      question:q.question, option_a:q.option_a, option_b:q.option_b,
      option_c:q.option_c, option_d:q.option_d, answer:q.answer, marks:q.marks })
    setEditing(q.id)
    setShowForm(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.question || !form.option_a || !form.option_b || !form.option_c || !form.option_d)
      return toast.error('All fields required')
    try {
      if (editing) { await api.put(`/questions/${editing}`, form); toast.success('Updated') }
      else         { await api.post('/questions', form);           toast.success('Question added') }
      setShowForm(false); load()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this question?')) return
    await api.delete(`/questions/${id}`)
    toast.success('Deleted')
    setQuestions(p => p.filter(q => q.id !== id))
  }

  const filtered = filterClass ? questions.filter(q => q.class === filterClass) : questions
  const optMap = { A:'option_a', B:'option_b', C:'option_c', D:'option_d' }

  return (
    <div className="space-y-5 fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Exam Questions</h1>
          <p className="text-gray-400 text-sm">{questions.length} questions</p>
        </div>
        <button onClick={openNew} className="btn-primary flex items-center gap-2">
          <Plus size={16}/> Add Question
        </button>
      </div>

      {/* Class filter pills */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setFilterClass('')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all
            ${!filterClass ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
          All
        </button>
        {classList.map(c => (
          <button key={c} onClick={() => setFilterClass(c)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all
              ${filterClass === c ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {c}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"/>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-4xl mb-3">❓</p>
          <p className="text-gray-400">No questions yet. Click "Add Question".</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((q, i) => (
            <div key={q.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className="bg-brand-100 text-brand-700 text-xs font-semibold px-2 py-0.5 rounded-full">{q.class}</span>
                    <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">{q.subject}</span>
                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{q.term}</span>
                    <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded-full">{q.marks} mark{q.marks > 1 ? 's' : ''}</span>
                  </div>
                  <p className="font-medium text-gray-800 mb-3">
                    <span className="text-gray-400 mr-2">Q{i + 1}.</span>{q.question}
                  </p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {['A','B','C','D'].map(opt => (
                      <div key={opt}
                        className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg
                          ${q.answer === opt ? 'bg-green-100 text-green-700 font-semibold' : 'bg-gray-50 text-gray-600'}`}>
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
                          ${q.answer === opt ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>{opt}</span>
                        {q[optMap[opt]]}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => openEdit(q)}
                    className="p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all">
                    <Pencil size={15}/>
                  </button>
                  <button onClick={() => handleDelete(q.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                    <Trash2 size={15}/>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">{editing ? 'Edit Question' : 'New Question'}</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Class</label>
                  <select className="input" value={form.class} onChange={e => setForm(f => ({ ...f, class: e.target.value }))}>
                    <option value="">— Select —</option>
                    {classList.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Subject</label>
                  <input className="input bg-gray-50 cursor-not-allowed" value={form.subject} readOnly/>
                </div>
                <div>
                  <label className="label">Term</label>
                  <select className="input" value={form.term} onChange={e => setForm(f => ({ ...f, term: e.target.value }))}>
                    <option>1st Term</option><option>2nd Term</option><option>3rd Term</option>
                  </select>
                </div>
                <div>
                  <label className="label">Marks</label>
                  <input type="number" className="input" min="1" max="10"
                    value={form.marks} onChange={e => setForm(f => ({ ...f, marks: e.target.value }))}/>
                </div>
              </div>
              <div>
                <label className="label">Question *</label>
                <textarea className="input min-h-[70px] resize-y" placeholder="Type the question..."
                  value={form.question} onChange={e => setForm(f => ({ ...f, question: e.target.value }))} required/>
              </div>
              {['A','B','C','D'].map(opt => (
                <div key={opt}>
                  <label className="label">Option {opt}</label>
                  <input className="input" placeholder={`Option ${opt}`}
                    value={form[`option_${opt.toLowerCase()}`]}
                    onChange={e => setForm(f => ({ ...f, [`option_${opt.toLowerCase()}`]: e.target.value }))} required/>
                </div>
              ))}
              <div>
                <label className="label">Correct Answer</label>
                <select className="input" value={form.answer} onChange={e => setForm(f => ({ ...f, answer: e.target.value }))}>
                  <option value="A">Option A</option>
                  <option value="B">Option B</option>
                  <option value="C">Option C</option>
                  <option value="D">Option D</option>
                </select>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="submit" className="btn-primary flex items-center gap-2 flex-1 justify-center">
                  <Save size={15}/> {editing ? 'Update' : 'Save Question'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
