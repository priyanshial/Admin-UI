import { useState, useEffect } from 'react'
import { Save } from 'lucide-react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/AppContext'
import { createAIConfig, updateAIConfig, getAIConfig } from '../api/core'
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
  const { id: routeId } = useParams()
  const navigate = useNavigate()
  const { activeAccount, promoteDraft, saveAccountConfig } = useAppStore()

  const isDraft = routeId?.startsWith('draft_') ?? false

  const [form, setForm] = useState(DEFAULT_ACCOUNT_CONFIG)
  const [loading, setLoading] = useState(!isDraft)
  const [saved, setSaved] = useState(false)
  const [isEditing, setIsEditing] = useState(isDraft)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isDraft) {
      setForm({ ...DEFAULT_ACCOUNT_CONFIG, ...activeAccount?.accountConfig })
      setLoading(false)
      return
    }
    if (!routeId) return
    getAIConfig(routeId)
      .then(data => setForm({ ...DEFAULT_ACCOUNT_CONFIG, ...data }))
      .catch(() => setForm(activeAccount?.accountConfig ?? DEFAULT_ACCOUNT_CONFIG))
      .finally(() => setLoading(false))
  }, [routeId])

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setSaved(false)
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      if (isDraft) {
        const created = await createAIConfig(form)
        promoteDraft(routeId, created)
        navigate(`/account/${created.id}`, { replace: true })
      } else {
        await updateAIConfig(routeId, form)
        saveAccountConfig({ ...form, backendId: routeId })
      }
      setSaved(true)
      setIsEditing(false)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(parseApiError(err))
    }
  }

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
          <SectionHeader title="Firm Identity" description="Basic information for the law firm." />
          <div className="space-y-4">
            <Field label="Firm Name">
              <Input
                name="name"
                value={form.name ?? ''}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="Law Office of…"
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
                name="additional_address"
                value={form.additional_address ?? ''}
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

        {/* Voice Agent */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <SectionHeader title="Voice Agent" description="AI agent identity and call routing." />
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Field label="Agent Name" hint="Name the AI agent introduces itself as.">
                  <Input
                    name="agent_name"
                    value={form.agent_name ?? ''}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="e.g. Alexis"
                  />
                </Field>
              </div>
              <div className="flex-1">
                <Field label="Timezone">
                  <Input
                    name="timezone"
                    value={form.timezone ?? ''}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="America/New_York"
                  />
                </Field>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <Field label="Inbound DID" hint="The phone number callers dial to reach this firm.">
                  <Input
                    name="incoming_call"
                    value={form.incoming_call ?? ''}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="+1 (555) 000-0000"
                  />
                </Field>
              </div>
              <div className="flex-1">
                <Field label="Transfer-to Phone" hint="Attorney's private number for call transfers.">
                  <Input
                    name="transfer_to_phone"
                    value={form.transfer_to_phone ?? ''}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="+1 (555) 000-0000"
                  />
                </Field>
              </div>
              <div className="flex-1">
                <Field label="Outbound Caller ID">
                  <Input
                    name="outbound_caller_id"
                    value={form.outbound_caller_id ?? ''}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="+1 (555) 000-0000"
                  />
                </Field>
              </div>
            </div>
          </div>
        </div>

        {/* AI Configuration */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <SectionHeader title="AI Configuration" description="Language model and provider settings." />
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Field label="LLM Model">
                  <Input
                    name="llm_model"
                    value={form.llm_model ?? ''}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="e.g. gpt-4o"
                  />
                </Field>
              </div>
              <div className="flex-1">
                <Field label="ASR Provider" hint="Speech-to-text service.">
                  <Input
                    name="asr_provider"
                    value={form.asr_provider ?? ''}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="e.g. deepgram"
                  />
                </Field>
              </div>
              <div className="flex-1">
                <Field label="TTS Provider" hint="Text-to-speech service.">
                  <Input
                    name="tts_provider"
                    value={form.tts_provider ?? ''}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="e.g. elevenlabs"
                  />
                </Field>
              </div>
            </div>
            <Field label="Custom LLM Endpoint" hint="Leave blank to use OpenAI directly.">
              <Input
                name="custom_llm_endpoint"
                value={form.custom_llm_endpoint ?? ''}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="https://…"
              />
            </Field>
            <Field label="OpenAI API Key">
              <Input
                name="openai_api_key"
                value={form.openai_api_key ?? ''}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="sk-…"
                type="password"
              />
            </Field>
          </div>
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
