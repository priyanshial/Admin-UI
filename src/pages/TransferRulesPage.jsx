import { useState, useEffect } from 'react'
import { Save, ChevronRight, ChevronDown, Plus, Trash2, ChevronUp } from 'lucide-react'
import { useAppStore } from '../store/AppContext'
import { getIntakeTemplates, getContacts, getTransferRules, setTransferRules } from '../api/core'
import { parseApiError } from '../api/config'

const TOGGLES = [
  { key: 'patch_enabled',            label: 'Patch' },
  { key: 'dispatch_enabled',         label: 'Dispatch' },
  { key: 'sms_enabled',              label: 'SMS' },
  { key: 'email_enabled',            label: 'Email' },
  { key: 'additional_email_enabled', label: 'Alt Email' },
]

const DEFAULT_FLAGS = {
  patch_enabled: false,
  dispatch_enabled: false,
  sms_enabled: false,
  email_enabled: false,
  additional_email_enabled: false,
}

function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      title={label}
      className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors ${
        checked
          ? 'bg-blue-600 text-white border-blue-600'
          : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300'
      }`}
    >
      {label}
    </button>
  )
}

function FlagButton({ flagKey, label, checked, patchOn, dispatchOn, onToggle }) {
  const isDisabled =
    (flagKey === 'patch_enabled'    && dispatchOn) ||
    (flagKey === 'dispatch_enabled' && patchOn)
  const disabledTitle = flagKey === 'patch_enabled' ? 'Disable Dispatch first' : 'Disable Patch first'
  return (
    <button
      type="button"
      onClick={() => onToggle(flagKey)}
      disabled={isDisabled}
      title={isDisabled ? disabledTitle : label}
      className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
        checked
          ? 'bg-blue-600 text-white border-blue-600'
          : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300'
      }`}
    >
      {label}
    </button>
  )
}

function RuleRow({ rule, index, total, onMoveUp, onMoveDown, onToggle, onRemove }) {
  function handleToggle(key) {
    if (key === 'patch_enabled'    && !rule.patch_enabled    && rule.dispatch_enabled) onToggle('dispatch_enabled')
    if (key === 'dispatch_enabled' && !rule.dispatch_enabled && rule.patch_enabled)    onToggle('patch_enabled')
    onToggle(key)
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl px-4 py-4">
      {/* Top row: priority + reorder + name + remove */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
          <span className="text-xs font-bold text-gray-500">{index + 1}</span>
        </div>
        <div className="flex flex-col gap-0.5 shrink-0">
          <button type="button" onClick={onMoveUp} disabled={index === 0}
            className="p-0.5 text-gray-300 hover:text-gray-600 disabled:opacity-20 transition-colors" title="Move up">
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
          <button type="button" onClick={onMoveDown} disabled={index === total - 1}
            className="p-0.5 text-gray-300 hover:text-gray-600 disabled:opacity-20 transition-colors" title="Move down">
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
        <p className="flex-1 text-sm font-semibold text-gray-900">{rule.contact_name}</p>
        <button type="button" onClick={onRemove}
          className="p-1.5 text-gray-300 hover:text-red-500 transition-colors shrink-0" title="Remove">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Bottom rows: phone / email — label grows, buttons pinned right */}
      <div className="ml-[52px] mr-8 space-y-2">
        {/* Phone row */}
        <div className="flex items-center gap-3">
          <span className="flex-1 text-xs text-gray-500 min-w-0">{rule.contact_phone || '—'}</span>
          <div className="flex gap-1.5 shrink-0">
            {[
              { key: 'patch_enabled',    label: 'Patch' },
              { key: 'dispatch_enabled', label: 'Dispatch' },
              { key: 'sms_enabled',      label: 'SMS' },
            ].map(t => (
              <FlagButton
                key={t.key}
                flagKey={t.key}
                label={t.label}
                checked={!!rule[t.key]}
                patchOn={!!rule.patch_enabled}
                dispatchOn={!!rule.dispatch_enabled}
                onToggle={handleToggle}
              />
            ))}
          </div>
        </div>

        {/* Email row */}
        <div className="flex items-center gap-3">
          <span className="flex-1 text-xs text-gray-500 min-w-0">{rule.contact_email || '—'}</span>
          <div className="flex gap-1.5 shrink-0">
            {[
              { key: 'email_enabled',           label: 'Email' },
              { key: 'additional_email_enabled', label: 'Alt Email' },
            ].map(t => (
              <FlagButton
                key={t.key}
                flagKey={t.key}
                label={t.label}
                checked={!!rule[t.key]}
                patchOn={!!rule.patch_enabled}
                dispatchOn={!!rule.dispatch_enabled}
                onToggle={handleToggle}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function rulesKey(rules) {
  return JSON.stringify(
    rules.map(r => ({
      id: r.contact,
      patch_enabled: !!r.patch_enabled,
      dispatch_enabled: !!r.dispatch_enabled,
      sms_enabled: !!r.sms_enabled,
      email_enabled: !!r.email_enabled,
      additional_email_enabled: !!r.additional_email_enabled,
    }))
  )
}

function CaseTypeSection({ caseType, contacts, initialRules }) {
  const [expanded, setExpanded] = useState(false)
  // Rules arrive from the page-level fetch, so the assigned-contact count is
  // correct while collapsed -- no per-section request on expand.
  const [rules, setRules] = useState(initialRules)
  const [savedKey, setSavedKey] = useState(() => rulesKey(initialRules))
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [addContactId, setAddContactId] = useState('')
  const { activeAccountId } = useAppStore()

  const isDirty = rulesKey(rules) !== savedKey

  function handleAddContact() {
    if (!addContactId) return
    const contact = contacts.find(c => c.id === addContactId)
    if (!contact || rules.some(r => r.contact === addContactId)) return
    setRules(prev => [...prev, {
      contact: addContactId,
      contact_name:  [contact.first_name, contact.last_name].filter(Boolean).join(' '),
      contact_phone: contact.phone ?? '',
      contact_email: contact.email ?? '',
      ...DEFAULT_FLAGS,
    }])
    setAddContactId('')
  }

  function handleMove(index, direction) {
    setRules(prev => {
      const next = [...prev]
      const swapWith = index + direction
      if (swapWith < 0 || swapWith >= next.length) return prev
      ;[next[index], next[swapWith]] = [next[swapWith], next[index]]
      return next
    })
  }

  function handleToggle(index, key) {
    setRules(prev => prev.map((r, i) => i === index ? { ...r, [key]: !r[key] } : r))
  }

  function handleRemove(index) {
    setRules(prev => prev.filter((_, i) => i !== index))
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    try {
      const result = await setTransferRules({
        company: activeAccountId,
        case_type: caseType.id,
        contacts: rules.map(r => ({
          id: r.contact,
          patch_enabled:            !!r.patch_enabled,
          dispatch_enabled:         !!r.dispatch_enabled,
          sms_enabled:              !!r.sms_enabled,
          email_enabled:            !!r.email_enabled,
          additional_email_enabled: !!r.additional_email_enabled,
        })),
      })
      const group = Array.isArray(result) ? result[0] : null
      const refreshed = group?.contacts ?? rules
      setRules(refreshed)
      setSavedKey(rulesKey(refreshed))
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
          <p className="text-xs text-gray-400 mt-0.5">
            {rules.length} contact{rules.length !== 1 ? 's' : ''} assigned
          </p>
        </div>
        {!caseType.enabled && (
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full shrink-0">Disabled in Intake</span>
        )}
      </div>

      {expanded && (
        <div className="border-t border-gray-100 px-5 pb-5 pt-4">
          <div className="space-y-3">
              {rules.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-3">No contacts assigned yet. Add one below.</p>
              )}
              {rules.map((rule, i) => (
                <RuleRow
                  key={rule.contact}
                  rule={rule}
                  index={i}
                  total={rules.length}
                  onMoveUp={() => handleMove(i, -1)}
                  onMoveDown={() => handleMove(i, 1)}
                  onToggle={key => handleToggle(i, key)}
                  onRemove={() => handleRemove(i)}
                />
              ))}

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
                        {[c.first_name, c.last_name].filter(Boolean).join(' ')}{c.phone ? ` — ${c.phone}` : ''}
                      </option>
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

              <div className="flex items-center justify-end gap-2 pt-1">
                {error && <span className="text-xs text-red-600">{error}</span>}
                {saved && <span className="text-xs text-green-600 font-medium">Saved!</span>}
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving || !isDirty}
                  className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
          </div>
        </div>
      )}
    </div>
  )
}

/** The case type a rule group belongs to; the field name varies by serializer. */
function groupCaseTypeId(group) {
  const raw = group?.case_type ?? group?.case_type_id ?? group?.caseType
  return typeof raw === 'object' ? raw?.id : raw
}

/**
 * Groups the company-wide transfer rules by case type id, sorted by priority
 * and enriched with phone/email from the contacts list (the rules endpoint may
 * not return them).
 */
function rulesByCaseType(groups, contacts) {
  const map = {}
  for (const group of Array.isArray(groups) ? groups : []) {
    const caseTypeId = groupCaseTypeId(group)
    if (!caseTypeId) continue
    map[caseTypeId] = (group.contacts ?? [])
      .slice()
      .sort((a, b) => a.priority - b.priority)
      .map(r => {
        const match = contacts.find(c => c.id === r.contact)
        return {
          ...r,
          contact_phone: r.contact_phone ?? match?.phone ?? '',
          contact_email: r.contact_email ?? match?.email ?? '',
        }
      })
  }
  return map
}

export default function TransferRulesPage() {
  const { activeAccountId } = useAppStore()
  const [caseTypes, setCaseTypes] = useState([])
  const [contacts, setContacts] = useState([])
  const [rulesMap, setRulesMap] = useState({})
  const [loading, setLoading] = useState(true)

  // One request per resource for the whole page, including every case type's
  // transfer rules -- so the assigned-contact counts are right before anything
  // is expanded.
  useEffect(() => {
    if (!activeAccountId) return
    Promise.all([
      getIntakeTemplates(activeAccountId).catch(() => []),
      getContacts(activeAccountId).catch(() => []),
      getTransferRules(activeAccountId).catch(() => []),
    ])
      .then(([tmpl, ctcts, rules]) => {
        setCaseTypes(tmpl)
        setContacts(ctcts)
        setRulesMap(rulesByCaseType(rules, ctcts))
      })
      .finally(() => setLoading(false))
  }, [activeAccountId])

  const practiceAreas = caseTypes.filter(ct => ct.category === 'practice_area')
  const thirdParty    = caseTypes.filter(ct => ct.category === 'third_party')
  const general       = caseTypes.filter(ct => ct.category === 'general')
  const sections      = [
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
          Assign contacts to each case type and configure how they are notified. Priority 1 is attempted first.
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
                    initialRules={rulesMap[ct.id] ?? []}
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
