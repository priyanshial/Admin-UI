import { useState } from 'react'
import { Save, Info } from 'lucide-react'
import { useAppStore } from '../store/AppContext'
import { CONFIRM_METHODS } from '../models/constants'

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
        checked ? 'bg-blue-600' : 'bg-gray-200'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition-transform ${
          checked ? 'translate-x-4' : 'translate-x-0'
        }`}
      />
    </button>
  )
}

export default function ConfirmQuestionsPage() {
  const { confirmationQuestions, saveConfirmationQuestions } = useAppStore()
  const [questions, setQuestions] = useState(confirmationQuestions)
  const [saved, setSaved] = useState(false)

  function toggleConfirm(id) {
    setQuestions(prev =>
      prev.map(q => q.id === id ? { ...q, confirmEnabled: !q.confirmEnabled } : q)
    )
    setSaved(false)
  }

  function setMethod(id, method) {
    setQuestions(prev =>
      prev.map(q => q.id === id ? { ...q, confirmMethod: method } : q)
    )
    setSaved(false)
  }

  function handleSave() {
    saveConfirmationQuestions(questions)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Confirm Questions</h2>
          <p className="text-sm text-gray-500 mt-0.5">Choose which answers the agent reads back for caller confirmation.</p>
        </div>
        <div className="flex items-center gap-2">
          {saved && <span className="text-sm text-green-600 font-medium">Saved!</span>}
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Save className="w-4 h-4" />
            Save
          </button>
        </div>
      </div>

      <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 mb-5">
        <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
        <p className="text-xs text-blue-700">
          When confirmation is enabled, the agent reads back the collected value using the selected method before proceeding. The caller can correct mistakes at this step.
        </p>
      </div>

      <div className="space-y-3">
        {questions.map(q => (
          <div
            key={q.id}
            className={`bg-white rounded-xl border px-5 py-4 transition-colors ${
              q.confirmEnabled ? 'border-gray-200' : 'border-gray-100'
            }`}
          >
            <div className="flex items-center gap-4">
              <Toggle checked={q.confirmEnabled} onChange={() => toggleConfirm(q.id)} />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{q.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{q.description}</p>
              </div>
            </div>

            {q.confirmEnabled && (
              <div className="mt-4 ml-12">
                <p className="text-xs font-medium text-gray-600 mb-2">Confirmation method</p>
                <div className="flex gap-2 flex-wrap">
                  {CONFIRM_METHODS.map(m => (
                    <button
                      key={m.value}
                      onClick={() => setMethod(q.id, m.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        q.confirmMethod === m.value
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
