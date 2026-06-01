import { useState, useEffect } from 'react'
import { Save, ChevronRight, ChevronDown, Plus, Trash2, ChevronUp } from 'lucide-react'
import { useAppStore } from '../store/AppContext'
import { getIntakeTemplates, getContacts, getTransferRulesByCaseType, setTransferRules, updateTransferRule, deleteTransferRule } from '../api/core'
import { parseApiError } from '../api/config'

const TRANSFER_TYPES = [
  { value: 'warm',      label: 'Warm',      hint: 'Agent stays on line' },
  { value: 'cold',      label: 'Cold',      hint: 'Agent drops off' },
  { value: 'voicemail', label: 'Voicemail', hint: 'Send to voicemail' },
]

const TYPE_STYLES = {
  warm:      'bg-green-50 text-green-700 border-green-200',
  cold:      'bg-blue-50 text-blue-700 border-blue-200',
  voicemail: 'bg-gray-100 text-gray-500 border-gray-200',
}

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={e => { e.stopPropagation(); onChange() }}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
        checked ? 'bg-blue-600' : 'bg-gray-200'
      }`}
    >
      <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition-transform ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
    </button>
  )
}

// Single row for an assigned contact — shows priority, up/down reorder, name, transfer type, remove
function RuleRow({ rule, index, total, onMoveUp, onMoveDown, onChangeType, onRemove }) {
  return (
    <div className={`bg-white border rounded-xl px-4 py-3 flex items-center gap-3 ${rule.is_active === false ? 'opacity-50' : 'border-gray-200'}`}>
      {/* Priority badge */}
      <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
        <span className="text-xs font-bold text-gray-500">{index + 1}</span>
      </div>
      {/* Up / down arrows */}
      <div className="flex flex-col gap-0.5 shrink-0">
        <button
          type="button"
          onClick={onMoveUp}
          disabled={index === 0}
          className="p-0.5 text-gray-300 hover:text-gray-600 disabled:opacity-20 transition-colors"
          title="Move up (higher priority)"
        >
          <ChevronUp className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={onMoveDown}
          disabled={index === total - 1}
          className="p-0.5 text-gray-300 hover:text-gray-600 disabled:opacity-20 transition-colors"
          title="Move down (lower priority)"
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>
      <p className="flex-1 text-sm font-medium text-gray-900">{rule.contact_name}</p>
      <div className="flex gap-1">
        {TRANSFER_TYPES.map(t => (
          <button
            key={t.value}
            type="button"
            onClick={() => onChangeType(t.value)}
            title={t.hint}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors ${
              rule.transfer_type === t.value
                ? TYPE_STYLES[t.value]
                : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="p-1.5 text-gray-300 hover:text-red-500 transition-colors"
        title="Remove"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  )
}

// Case type section — expand to see/edit rules
function CaseTypeSection({ caseType, contacts, onToggle }) {
  const [expanded, setExpanded] = useState(false)
  const [rules, setRules] = useState([])    // current ordered list
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [addContactId, setAddContactId] = useState('')
  const [addTransferType, setAddTransferType] = useState('warm')
  const { activeAccountId } = useAppStore()

  // Load rules when expanded for the first time
  useEffect(() => {
    if (!expanded || !caseType.enabled) return
    setLoading(true)
    getTransferRulesByCaseType(activeAccountId, caseType.id)
      .then(data => {
        // Response: [{ case_type, contacts: [...] }] sorted by priority — pick the contacts array
        const group = Array.isArray(data) ? data[0] : null
        const sorted = (group?.contacts ?? []).slice().sort((a, b) => a.priority - b.priority)
        setRules(sorted)
      })
      .catch(() => setRules([]))
      .finally(() => setLoading(false))
  }, [expanded, caseType.id, caseType.enabled, activeAccountId])

  function handleAddContact() {
    if (!addContactId) return
    const contact = contacts.find(c => c.id === addContactId)
    if (!contact) return
    if (rules.some(r => r.contact === addContactId)) return // already added
    setRules(prev => [...prev, {
      id: null, // not yet persisted
      contact: addContactId,
      contact_name: [contact.first_name, contact.last_name].filter(Boolean).join(' '),
      transfer_type: addTransferType,
      is_active: true,
      notes: '',
    }])
    setAddContactId('')
    setSaved(false)
  }

  function handleMove(index, direction) {
    setRules(prev => {
      const next = [...prev]
      const swapWith = index + direction
      if (swapWith < 0 || swapWith >= next.length) return prev
      ;[next[index], next[swapWith]] = [next[swapWith], next[index]]
      return next
    })
    setSaved(false)
  }

  function handleChangeType(index, transferType) {
    setRules(prev => prev.map((r, i) => i === index ? { ...r, transfer_type: transferType } : r))
    setSaved(false)
  }

  function handleRemove(index) {
    setRules(prev => prev.filter((_, i) => i !== index))
    setSaved(false)
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    try {
      const result = await setTransferRules({
        company: activeAccountId,
        case_type: caseType.id,
        // Order in array = priority (index 0 = priority 1)
        contacts: rules.map(r => ({ id: r.contact, transfer_type: r.transfer_type })),
      })
      // Refresh rules from response
      const group = Array.isArray(result) ? result[0] : null
      setRules(group?.contacts ?? rules)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(parseApiError(err))
    } finally {
      setSaving(false)
    }
  }

  const unusedContacts = contacts.filter(c => !rules.some(r => r.contact === c.id))

  return (
    <div className={`bg-white rounded-xl border transition-colors ${caseType.enabled ? 'border-gray-200' : 'border-gray-100'}`}>
      {/* Header */}
      <div
        className="flex items-center gap-3 px-5 py-4 cursor-pointer select-none"
        onClick={() => setExpanded(e => !e)}
      >
        <span className="text-gray-400 shrink-0">
          {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </span>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${caseType.enabled ? 'text-gray-900' : 'text-gray-400'}`}>
            {caseType.label}
          </p>
          {caseType.enabled && !loading && (
            <p className="text-xs text-gray-400 mt-0.5">
              {rules.length} contact{rules.length !== 1 ? 's' : ''} assigned
            </p>
          )}
        </div>
        <Toggle
          checked={caseType.enabled}
          onChange={onToggle}
        />
      </div>

      {/* Expanded body */}
      {expanded && (
        <div className="border-t border-gray-100 px-5 pb-5 pt-4">
          {!caseType.enabled ? (
            <p className="text-xs text-gray-400 text-center py-4">
              Enable this case type to configure transfer rules.
            </p>
          ) : loading ? (
            <p className="text-xs text-gray-400 text-center py-4">Loading…</p>
          ) : (
            <div className="space-y-3">
              {/* Existing rules */}
              {rules.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-3">
                  No contacts assigned yet. Add one below.
                </p>
              )}
              {rules.map((rule, i) => (
                <RuleRow
                  key={rule.contact}
                  rule={rule}
                  index={i}
                  total={rules.length}
                  onMoveUp={() => handleMove(i, -1)}
                  onMoveDown={() => handleMove(i, 1)}
                  onChangeType={type => handleChangeType(i, type)}
                  onRemove={() => handleRemove(i)}
                />
              ))}

              {/* Add contact row */}
              {unusedContacts.length > 0 && (
                <div className="flex items-center gap-2 pt-1">
                  <select
                    value={addContactId}
                    onChange={e => setAddContactId(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">Add a contact…</option>
                    {unusedContacts.map(c => (
                      <option key={c.id} value={c.id}>
                        {[c.first_name, c.last_name].filter(Boolean).join(' ')}
                        {c.phone ? ` — ${c.phone}` : ''}
                      </option>
                    ))}
                  </select>
                  <select
                    value={addTransferType}
                    onChange={e => setAddTransferType(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    {TRANSFER_TYPES.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleAddContact}
                    disabled={!addContactId}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add
                  </button>
                </div>
              )}

              {contacts.length === 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-xs text-amber-700">
                  No contacts on this account. Add contacts from the Contacts page first.
                </div>
              )}

              {/* Save row */}
              <div className="flex items-center justify-end gap-2 pt-1">
                {error && <span className="text-xs text-red-600">{error}</span>}
                {saved && <span className="text-xs text-green-600 font-medium">Saved!</span>}
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function TransferRulesPage() {
  const { activeAccountId } = useAppStore()

  const [caseTypes, setCaseTypes] = useState([])
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!activeAccountId) return
    Promise.all([
      getIntakeTemplates(activeAccountId).catch(() => []),
      getContacts(activeAccountId).catch(() => []),
    ])
      .then(([tmpl, ctcts]) => {
        setCaseTypes(tmpl)
        setContacts(ctcts)
      })
      .finally(() => setLoading(false))
  }, [activeAccountId])

  const practiceAreas = caseTypes.filter(ct => ct.category === 'practice_area')
  const thirdParty    = caseTypes.filter(ct => ct.category === 'third_party')
  const general       = caseTypes.filter(ct => ct.category === 'general')

  const sections = [
    { title: 'Practice Areas',      items: practiceAreas },
    { title: 'Third-Party Callers', items: thirdParty },
    { title: 'General',             items: general },
  ].filter(s => s.items.length > 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-sm text-gray-400">Loading…</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Transfer Rules</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Assign contacts to each case type and set the transfer order. Priority 1 is attempted first.
        </p>
      </div>

      {caseTypes.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-16">No case types found for this account.</p>
      ) : (
        <div className="space-y-8">
          {sections.map(({ title, items }) => (
            <section key={title}>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">{title}</h3>
              <div className="space-y-2">
                {items.map(ct => (
                  <CaseTypeSection
                    key={ct.id}
                    caseType={ct}
                    contacts={contacts}
                    onToggle={() => setCaseTypes(prev =>
                      prev.map(c => c.id === ct.id ? { ...c, enabled: !c.enabled } : c)
                    )}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
