import { useState } from 'react'
import { Save, Phone, Calendar, Brain, Mic, PhoneForwarded, FileText, AlertTriangle } from 'lucide-react'
import { useAppStore } from '../store/AppContext'

const SERVICE_ICONS = {
  voice_agent: Phone,
  blind_transfer: PhoneForwarded,
  llm_rephraser: Brain,
  call_summary: FileText,
  asr_deepgram: Mic,
  google_calendar: Calendar,
  microsoft_calendar: Calendar,
}

function Toggle({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      disabled={disabled}
      className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
        disabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'
      } ${checked ? 'bg-blue-600' : 'bg-gray-200'}`}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition-transform ${
          checked ? 'translate-x-4' : 'translate-x-0'
        }`}
      />
    </button>
  )
}

export default function ToggleServicePage() {
  const { services: savedServices, saveServices } = useAppStore()
  const [services, setServices] = useState(savedServices)
  const [saved, setSaved] = useState(false)
  const [confirmDisable, setConfirmDisable] = useState(null)

  function handleToggle(id) {
    const service = services.find(s => s.id === id)
    if (service.critical && service.enabled) {
      setConfirmDisable(id)
      return
    }
    apply(id)
  }

  function apply(id) {
    setServices(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s))
    setSaved(false)
    setConfirmDisable(null)
  }

  function handleSave() {
    saveServices(services)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const confirmService = services.find(s => s.id === confirmDisable)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Toggle Service</h2>
          <p className="text-sm text-gray-500 mt-0.5">Enable or disable individual services and integrations.</p>
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

      <div className="space-y-2">
        {services.map(s => {
          const Icon = SERVICE_ICONS[s.id]
          return (
            <div
              key={s.id}
              className={`bg-white rounded-xl border px-5 py-4 flex items-center gap-4 transition-colors ${
                s.enabled ? 'border-gray-200' : 'border-gray-100 opacity-70'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                s.enabled ? 'bg-blue-50' : 'bg-gray-100'
              }`}>
                <Icon className={`w-4 h-4 ${s.enabled ? 'text-blue-600' : 'text-gray-400'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-900">{s.label}</p>
                  {s.critical && (
                    <span className="text-xs px-1.5 py-0.5 bg-amber-50 text-amber-600 border border-amber-200 rounded-full">
                      Critical
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{s.description}</p>
              </div>
              <Toggle checked={s.enabled} onChange={() => handleToggle(s.id)} />
            </div>
          )
        })}
      </div>

      {/* Confirm disable dialog for critical services */}
      {confirmDisable && confirmService && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
              </div>
              <h3 className="text-base font-semibold text-gray-900">Disable {confirmService.label}?</h3>
            </div>
            <p className="text-sm text-gray-500 mb-5">
              This is a critical service. Disabling it may interrupt active calls or prevent the agent from functioning correctly.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDisable(null)}
                className="flex-1 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => apply(confirmDisable)}
                className="flex-1 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Disable anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
