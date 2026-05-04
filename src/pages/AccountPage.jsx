import { useState } from 'react'
import { Save, Bot } from 'lucide-react'
import { useAppStore } from '../store/AppContext'
import { LLM_MODELS, TTS_PROVIDERS, ASR_PROVIDERS } from '../models/constants'

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
      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />
  )
}

function Select({ children, ...props }) {
  return (
    <select
      {...props}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    >
      {children}
    </select>
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
  const { accountConfig, saveAccountConfig } = useAppStore()
  const [form, setForm] = useState(accountConfig)
  const [saved, setSaved] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setSaved(false)
  }

  function handleSubmit(e) {
    e.preventDefault()
    saveAccountConfig(form)
    setSaved(true)
    setIsEditing(false)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">AI Account</h2>
          <p className="text-sm text-gray-500 mt-0.5">Configure your voice agent identity and integrations</p>
        </div>
        <div className="flex items-center gap-2">
          {saved && (
            <span className="text-sm text-green-600 font-medium">Saved!</span>
          )}
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Edit
            </button>
          ) : (
            <button
              form="account-form"
              type="submit"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              Save changes
            </button>
          )}
        </div>
      </div>

      <form id="account-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Identity */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <SectionHeader title="Firm Identity" description="Basic information about your law firm and AI agent." />
          <div className="space-y-4">
            <Field label="Firm Name">
              <Input
                name="firmName"
                value={form.firmName}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="Law Office of..."
              />
            </Field>
            <Field label="Agent Name" hint="The name the AI will use to introduce itself to callers.">
              <Input
                name="agentName"
                value={form.agentName}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="e.g. Ava"
              />
            </Field>
            <Field label="Timezone">
              <Input
                name="timezone"
                value={form.timezone}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="America/New_York"
              />
            </Field>
          </div>
        </div>

        {/* LLM */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <SectionHeader title="Language Model" description="LLM used for conversation understanding and slot extraction." />
          <div className="space-y-4">
            <Field label="Model">
              <Select name="llmModel" value={form.llmModel} onChange={handleChange} disabled={!isEditing}>
                {LLM_MODELS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </Select>
            </Field>
            <Field label="Custom LLM Endpoint" hint="Leave blank to use OpenAI. Set for self-hosted vLLM instances.">
              <Input
                name="llmEndpoint"
                value={form.llmEndpoint}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="http://192.168.20.25:8000/v1"
              />
            </Field>
            <Field label="OpenAI API Key">
              <Input
                name="openaiApiKey"
                type="password"
                value={form.openaiApiKey}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="sk-..."
              />
            </Field>
          </div>
        </div>

        {/* Voice */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <SectionHeader title="Voice Providers" description="ASR (speech-to-text) and TTS (text-to-speech) configuration." />
          <div className="space-y-4">
            <Field label="ASR Provider">
              <Select name="asrProvider" value={form.asrProvider} onChange={handleChange} disabled={!isEditing}>
                {ASR_PROVIDERS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </Select>
            </Field>
            <Field label="TTS Provider">
              <Select name="ttsProvider" value={form.ttsProvider} onChange={handleChange} disabled={!isEditing}>
                {TTS_PROVIDERS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </Select>
            </Field>
          </div>
        </div>

        {/* Call Transfer */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <SectionHeader title="Call Transfer" description="Phone numbers used for routing live calls." />
          <div className="space-y-4">
            <Field label="Transfer-to Phone" hint="Attorney's phone number for blind transfer.">
              <Input
                name="transferPhone"
                value={form.transferPhone}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="+1 (555) 000-0000"
              />
            </Field>
            <Field label="Outbound Caller ID" hint="The number displayed when the agent dials out.">
              <Input
                name="outboundPhone"
                value={form.outboundPhone}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="+1 (555) 000-0000"
              />
            </Field>
          </div>
        </div>
      </form>
    </div>
  )
}
