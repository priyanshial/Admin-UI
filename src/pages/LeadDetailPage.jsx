import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ChevronLeft, Phone, Mail, PhoneIncoming, Clock, CalendarClock,
  ArrowRightLeft, ClipboardList, Save, Code2, HelpCircle,
} from 'lucide-react'
import { useAppStore } from '../store/AppContext'
import { getLead, updateLead } from '../api/leads'
import Badge from '../components/Badge'
import {
  DISPOSITIONS, LEAD_STATUSES, dispositionLabel,
  fullName, formatDuration, formatDateTime, formatPhone,
} from '../models/leads'

function MetaItem({ icon: Icon, label, value, tone }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${tone ?? 'text-gray-400'}`} />
      <div className="min-w-0">
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm text-gray-800 truncate">{value}</p>
      </div>
    </div>
  )
}

function AnswersTab({ lead }) {
  if (lead.answers.length === 0) {
    return (
      <p className="text-sm text-gray-400 py-8 text-center">
        No answers were captured on this call.
      </p>
    )
  }

  return (
    <div className="divide-y divide-gray-100">
      {lead.answers.map(a => (
        <div key={a.question_id} className="py-3 grid grid-cols-5 gap-4">
          <div className="col-span-2">
            <p className="text-sm text-gray-500">{a.question_text}</p>
            <p className="text-xs text-gray-300 font-mono mt-0.5">{a.question_id}</p>
          </div>
          <div className="col-span-3">
            <div className="flex items-start gap-2 flex-wrap">
              <p className="text-sm text-gray-900">{a.value || <span className="text-gray-300">-</span>}</p>
              {a.needs_review && <Badge tone="amber">Low confidence</Badge>}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function RawTab({ lead }) {
  return (
    <div className="py-2">
      <p className="text-xs text-gray-400 mb-2">
        Exactly what the bot POSTed. Useful while the contract is still moving.
      </p>
      <pre className="text-xs font-mono bg-gray-50 border border-gray-200 rounded-lg p-3 overflow-x-auto text-gray-700">
        {JSON.stringify(lead.raw, null, 2)}
      </pre>
    </div>
  )
}

const TABS = [
  { id: 'answers',  label: 'Intake answers', icon: ClipboardList, Component: AnswersTab },
  { id: 'raw',      label: 'Raw payload',    icon: Code2,         Component: RawTab },
]

export default function LeadDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { activeAccountId, accounts } = useAppStore()
  const accountIndex = Math.max(0, accounts.findIndex(a => a.id === activeAccountId))

  const [lead, setLead] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('answers')
  const [notes, setNotes] = useState('')
  const [savingNotes, setSavingNotes] = useState(false)

  useEffect(() => {
    let cancelled = false
    getLead(activeAccountId, id, { accountIndex })
      .then(data => {
        if (cancelled) return
        setLead(data)
        setNotes(data.notes ?? '')
      })
      .catch(() => { if (!cancelled) setError('Could not load this lead.') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [activeAccountId, id, accountIndex])

  async function changeStatus(next) {
    setLead(prev => ({ ...prev, status: next }))
    try {
      await updateLead(activeAccountId, id, { status: next })
    } catch {
      setError('Could not update status.')
    }
  }

  async function saveNotes() {
    setSavingNotes(true)
    try {
      await updateLead(activeAccountId, id, { notes })
      setLead(prev => ({ ...prev, notes }))
    } catch {
      setError('Could not save notes.')
    } finally {
      setSavingNotes(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-sm text-gray-400">Loading lead…</p>
      </div>
    )
  }

  if (!lead) {
    return (
      <div className="text-center py-24">
        <p className="text-sm text-gray-500">{error || 'Lead not found.'}</p>
        <button
          onClick={() => navigate('/leads')}
          className="mt-3 text-sm text-blue-600 hover:text-blue-700"
        >
          Back to leads
        </button>
      </div>
    )
  }

  const name = fullName(lead)
  const dispo = DISPOSITIONS[lead.disposition]
  const aniMismatch = lead.callback_phone
    && lead.callback_phone.replace(/\D/g, '').slice(-10) !== lead.caller_ani.replace(/\D/g, '').slice(-10)

  const ActiveTab = TABS.find(t => t.id === tab).Component

  return (
    <div>
      <button
        onClick={() => navigate('/leads')}
        className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-gray-700 transition-colors mb-4"
      >
        <ChevronLeft className="w-3.5 h-3.5" />
        All leads
      </button>

      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl font-semibold text-gray-900">
              {name || 'Unidentified caller'}
            </h2>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {lead.case_type_label || 'Uncategorised'} · {formatDateTime(lead.started_at)}
          </p>
        </div>

        <select
          value={lead.status}
          onChange={e => changeStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shrink-0"
        >
          {Object.entries(LEAD_STATUSES).map(([key, s]) => (
            <option key={key} value={key}>{s.label}</option>
          ))}
        </select>
      </div>

      {lead.abandoned_at_question && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm font-medium text-red-900">Intake did not finish</p>
          <p className="text-xs text-red-700 mt-0.5">
            Caller dropped at “{lead.abandoned_at_question}”.
          </p>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3 mb-3">
        <div className="col-span-2 bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-gray-900">Contact</h3>
          <div className="grid grid-cols-2 gap-4">
            <MetaItem icon={Phone} label="Callback number" value={formatPhone(lead.callback_phone)} />
            <MetaItem
              icon={PhoneIncoming} label="Called from (caller ID)"
              value={formatPhone(lead.caller_ani)}
              tone={aniMismatch ? 'text-amber-500' : undefined}
            />
            <MetaItem icon={Mail} label="Email" value={lead.email || '-'} />
            <MetaItem icon={ArrowRightLeft} label="Line dialled" value={formatPhone(lead.dialed_number)} />
          </div>
          {aniMismatch && (
            <p className="text-xs text-amber-700">
              Caller ID differs from the callback number they gave, so they may have
              called from a different phone.
            </p>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-gray-900">Call</h3>
          <MetaItem icon={Clock} label="Length" value={formatDuration(lead.duration_sec)} />
          <MetaItem icon={CalendarClock} label="Received" value={formatDateTime(lead.started_at)} />
          <div>
            <p className="text-xs text-gray-400 mb-1">Outcome</p>
            <Badge tone={dispo?.tone}>{dispositionLabel(lead.disposition)}</Badge>
            {lead.attorney_name && (
              <p className="text-xs text-gray-500 mt-1">Attorney: {lead.attorney_name}</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-3">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-sm font-semibold text-gray-900">Summary</h3>
          {lead.summary_is_fallback && (
            <Badge tone="amber">Caller's own words, no summary generated</Badge>
          )}
        </div>
        {lead.summary
          ? <p className="text-sm text-gray-700 leading-relaxed">{lead.summary}</p>
          : <p className="text-sm text-gray-400 italic">The bot did not return a summary for this call.</p>}

        {lead.summary && !lead.summary_is_fallback && lead.caller_description && (
          <p className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-100">
            Caller opened with: “{lead.caller_description}”
          </p>
        )}

      </div>

      {(lead.additional_concerns.length > 0 || lead.faq_topics_asked.length > 0) && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-3">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            Raised by the caller
          </h3>
          {lead.additional_concerns.length > 0 && (
            <ul className="space-y-1.5 mb-3">
              {lead.additional_concerns.map((c, i) => (
                <li key={i} className="text-sm text-gray-700 flex gap-2">
                  <span className="text-gray-300">•</span>
                  {c}
                </li>
              ))}
            </ul>
          )}
          {lead.faq_topics_asked.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <HelpCircle className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs text-gray-500">Asked about:</span>
              {lead.faq_topics_asked.map(topic => (
                <Badge key={topic} tone="blue">{topic.replace(/_/g, ' ')}</Badge>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl mb-3">
        <div className="flex border-b border-gray-200 px-2">
          {TABS.map(({ id: tabId, label, icon: Icon }) => (
            <button
              key={tabId}
              onClick={() => setTab(tabId)}
              className={`flex items-center gap-1.5 px-3 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
                tab === tabId
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
        <div className="px-5 py-2">
          <ActiveTab lead={lead} />
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Firm notes</h3>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={3}
          placeholder="Add a note for whoever picks this lead up…"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <div className="flex justify-end mt-2">
          <button
            onClick={saveNotes}
            disabled={savingNotes || notes === (lead.notes ?? '')}
            className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            {savingNotes ? 'Saving…' : 'Save note'}
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
    </div>
  )
}
