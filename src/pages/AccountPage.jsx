import { useState, useEffect } from 'react'
import { Save } from 'lucide-react'
import { useAppStore } from '../store/AppContext'
import { createAIConfig, updateAIConfig, getCaseTypes, getGreetings, getAIConfigs } from '../api/core'
import { parseApiError } from '../api/config'
import { DEFAULT_ACCOUNT_CONFIG } from '../models/defaults'

function Field({ label, hint, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {hint && <p className="text-xs text-gray-400 mb-1.5">{hint}</p>}
      {children}
    </div>
  )
}

function Input({ ...props }) {
  return (
    <input
      {...props}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
    />
  )
}

function SectionHeader({ title, description }) {
  return (
    <div className="mb-4">
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
    </div>
  )
}

export default function AccountPage() {
  const { activeAccountId, accountConfig, saveAccountConfig } = useAppStore()
  const [form, setForm] = useState(DEFAULT_ACCOUNT_CONFIG)
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [error, setError] = useState('')
  const [caseTypes, setCaseTypes] = useState([])
  const [greetings, setGreetings] = useState([])
  console.log('form', form)

  useEffect(() => {
    async function loadBackendData() {
      try {
        const [configs, caseTypesData, greetingsData] = await Promise.all([
          getAIConfigs(),
          getCaseTypes(),
          getGreetings(),
        ])

        setCaseTypes(caseTypesData ?? [])
        setGreetings(greetingsData ?? [])

        // activeAccountId is the backend UUID — find it directly
        if (activeAccountId && Array.isArray(configs)) {
          const serverRecord = configs.find(c => c.id === activeAccountId)
          if (serverRecord) {
            const synced = { ...serverRecord, backendId: serverRecord.id }
            saveAccountConfig(synced)
            setForm(synced)
          }
        }
      } catch {
        setForm(accountConfig ?? DEFAULT_ACCOUNT_CONFIG)
        setCaseTypes([])
        setGreetings([])
      } finally {
        setLoading(false)
      }
    }

    loadBackendData()
  }, [activeAccountId])

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setSaved(false)
    setError('')
  }

  function handleCaseTypeToggle(id) {
    setForm(prev => {
      const current = prev.case_types ?? []
      const updated = current.includes(id)
        ? current.filter(c => c !== id)
        : [...current, id]
      return { ...prev, case_types: updated }
    })
    setSaved(false)
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      if (activeAccountId) {
        await updateAIConfig(activeAccountId, form)
        saveAccountConfig({ ...form, backendId: activeAccountId })
      } else {
        const created = await createAIConfig(form)
        saveAccountConfig({ ...form, backendId: created.id })
      }
      setSaved(true)
      setIsEditing(false)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(parseApiError(err))
    }
  }

  const selectedCaseTypes = form.case_types ?? []

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-sm text-gray-400">Loading account data…</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">AI Account</h2>
          <p className="text-sm text-gray-500 mt-0.5">Configure your firm's details and AI settings.</p>
        </div>
        <div className="flex items-center gap-2">
          {error && <span className="text-sm text-red-600">{error}</span>}
          {saved && <span className="text-sm text-green-600 font-medium">Saved!</span>}
          {!isEditing && (
            <button
              type="button"
              onClick={() => { setIsEditing(true); setSaved(false) }}
              className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Edit
            </button>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Firm Identity */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <SectionHeader title="Firm Identity" description="Basic contact information for the law firm." />
          <div className="space-y-4">
            <Field label="Firm Name">
              <Input
                name="firm_name"
                value={form.firm_name }
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="Law Office of..."
              />
            </Field>
            <div className="flex gap-4">
              <div className="flex-1">
                <Field label="Email">
                  <Input
                    name="email"
                    type="email"
                    value={form.email ?? ''}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="contact@lawfirm.com"
                  />
                </Field>
              </div>
              <div className="flex-1">
                <Field label="Additional Email">
                  <Input
                    name="additional_email"
                    type="email"
                    value={form.additional_email ?? ''}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="secondary@lawfirm.com"
                  />
                </Field>
              </div>
            </div>
            <Field label="Notes" hint="Any extra information about this firm.">
              <textarea
                name="notes"
                value={form.notes ?? ''}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="Internal notes about this account…"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 resize-y"
              />
            </Field>
          </div>
        </div>

        {/* Phone Numbers */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <SectionHeader title="Phone Numbers" description="Primary and secondary contact numbers." />
          <div className="flex gap-4">
            <div className="flex-1">
              <Field label="Phone">
                <Input
                  name="phone"
                  value={form.phone ?? ''}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="+1 (555) 000-0000"
                />
              </Field>
            </div>
            <div className="flex-1">
              <Field label="Additional Phone">
                <Input
                  name="additional_phone"
                  value={form.additional_phone ?? ''}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="+1 (555) 000-0000"
                />
              </Field>
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <SectionHeader title="Address" description="Physical address of the firm." />
          <div className="space-y-4">
            <Field label="Address Line 1">
              <Input
                name="address"
                value={form.address ?? ''}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="123 Main St"
              />
            </Field>
            <Field label="Address Line 2">
              <Input
                name="address2"
                value={form.address2 ?? ''}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="Suite 100"
              />
            </Field>
            <div className="flex gap-4">
              <div className="flex-1">
                <Field label="City">
                  <Input
                    name="city"
                    value={form.city ?? ''}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="New York"
                  />
                </Field>
              </div>
              <div className="w-24">
                <Field label="State">
                  <Input
                    name="state"
                    value={form.state ?? ''}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="NY"
                    maxLength={2}
                  />
                </Field>
              </div>
              <div className="w-32">
                <Field label="ZIP Code">
                  <Input
                    name="zip"
                    value={form.zip ?? ''}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="10001"
                  />
                </Field>
              </div>
            </div>
          </div>
        </div>

        {/* AI Configuration */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <SectionHeader title="AI Configuration" description="Language model used by the voice agent." />
          <Field label="LLM Type" hint="The AI model powering the voice agent.">
            <Input
              name="llm_type"
              value={form.llm_type ?? ''}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="e.g. gpt-4o"
            />
          </Field>
        </div>

        {/* Greeting */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <SectionHeader
            title="Greeting"
            description="The greeting script the voice agent uses when a call begins."
          />
          {greetings.length === 0 ? (
            <p className="text-sm text-gray-400">No greetings configured on the server.</p>
          ) : (
            <Field label="Select Greeting">
              <select
                name="greeting_id"
                value={form.greeting_id ?? ''}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
              >
                <option value="">— None —</option>
                {greetings.map(g => (
                  <option key={g.id} value={g.id}>{g.name ?? g.text ?? g.id}</option>
                ))}
              </select>
            </Field>
          )}
        </div>

        {/* Voice Agent */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <SectionHeader
            title="Voice Agent"
            description="Phone number assigned to the AI voice agent for this firm."
          />
          <Field
            label="DID Phone Number"
            hint="The phone number callers will dial to reach this firm's AI agent."
          >
            <Input
              name="did_phone"
              value={form.did_phone ?? ''}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="+1 (555) 000-0000"
            />
          </Field>
        </div>

        {/* Case Types */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <SectionHeader
            title="Case Types"
            description="Select the practice areas this firm handles."
          />
          {caseTypes.length === 0 ? (
            <p className="text-sm text-gray-400">No case types available from the server.</p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {caseTypes.map(ct => {
                const selected = selectedCaseTypes.includes(ct.id)
                return (
                  <button
                    key={ct.id}
                    type="button"
                    disabled={!isEditing}
                    onClick={() => handleCaseTypeToggle(ct.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm text-left transition-colors disabled:cursor-default ${
                      selected
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                    } ${!isEditing && !selected ? 'opacity-50' : ''}`}
                  >
                    <span className={`w-3.5 h-3.5 rounded-sm border shrink-0 flex items-center justify-center ${
                      selected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                    }`}>
                      {selected && (
                        <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 10" fill="none">
                          <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                    <span className="truncate">{ct.name}</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {isEditing && (
          <div className="flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              Save changes
            </button>
          </div>
        )}

      </form>
    </div>
  )
}
