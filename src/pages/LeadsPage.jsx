import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Inbox, PhoneMissed, Clock, ChevronUp, ChevronDown, FlaskConical } from 'lucide-react'
import { useAppStore } from '../store/AppContext'
import { getLeads, USE_FIXTURES, isPersistedAccount } from '../api/leads'
import Badge from '../components/Badge'
import {
  DISPOSITIONS, LEAD_STATUSES, dispositionLabel,
  fullName, formatDuration, formatRelative, formatDateTime,
  fieldsNeedingReview,
} from '../models/leads'

const RANGES = {
  all:  { label: 'All time', days: null },
  1:    { label: 'Today',    days: 1 },
  7:    { label: 'Last 7 days',  days: 7 },
  30:   { label: 'Last 30 days', days: 30 },
}

function Stat({ icon: Icon, label, value, sub, tone = 'gray' }) {
  const iconTone = {
    gray:  'text-gray-400 bg-gray-100',
    blue:  'text-blue-600 bg-blue-50',
    amber: 'text-amber-600 bg-amber-50',
    indigo:'text-indigo-600 bg-indigo-50',
  }[tone]

  return (
    <div className="bg-white border border-gray-200 rounded-xl px-4 py-3.5">
      <div className="flex items-center gap-2 mb-2">
        <span className={`w-6 h-6 rounded-md flex items-center justify-center ${iconTone}`}>
          <Icon className="w-3.5 h-3.5" />
        </span>
        <p className="text-xs font-medium text-gray-500">{label}</p>
      </div>
      <p className="text-2xl font-semibold text-gray-900 leading-none">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1.5">{sub}</p>}
    </div>
  )
}

function Select({ value, onChange, children, ...props }) {
  return (
    <select
      value={value}
      onChange={onChange}
      className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      {...props}
    >
      {children}
    </select>
  )
}

export default function LeadsPage() {
  const { activeAccountId, accounts } = useAppStore()
  const navigate = useNavigate()

  const accountIndex = Math.max(0, accounts.findIndex(a => a.id === activeAccountId))

  // A draft account has no backend row yet, so there is nothing to fetch.
  const unsavedAccount = !USE_FIXTURES && !isPersistedAccount(activeAccountId)

  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(!unsavedAccount)
  const [error, setError] = useState('')

  // Pinned at mount: Date.now() during render is impure and makes the date
  // filter recompute against a moving target.
  const [now] = useState(() => Date.now())

  const [search, setSearch] = useState('')
  const [caseType, setCaseType] = useState('all')
  const [status, setStatus] = useState('all')
  const [disposition, setDisposition] = useState('all')
  const [range, setRange] = useState('all')
  const [sortDesc, setSortDesc] = useState(true)

  useEffect(() => {
    if (unsavedAccount) return
    let cancelled = false
    getLeads(activeAccountId, { accountIndex })
      .then(data => { if (!cancelled) setLeads(data) })
      .catch(err => {
        if (cancelled) return
        setError(err?.detail
          ? `Could not load leads: ${err.detail}`
          : 'Could not load leads. Is the backend reachable?')
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [activeAccountId, accountIndex, unsavedAccount])

  const caseTypes = useMemo(() => {
    const seen = new Map()
    leads.forEach(l => seen.set(l.case_type, l.case_type_label))
    return [...seen.entries()]
  }, [leads])

  const filtered = useMemo(() => {
    const cutoff = RANGES[range]?.days
      ? now - RANGES[range].days * 86400000
      : null
    const q = search.trim().toLowerCase()

    return leads.filter(l => {
      if (cutoff && new Date(l.started_at).getTime() < cutoff) return false
      if (caseType !== 'all' && l.case_type !== caseType) return false
      if (status !== 'all' && l.status !== status) return false
      if (disposition !== 'all' && l.disposition !== disposition) return false
      if (q) {
        const haystack = [
          fullName(l), l.email, l.callback_phone, l.caller_ani,
          l.case_type_label, l.summary,
        ].filter(Boolean).join(' ').toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })
  }, [leads, search, caseType, status, disposition, range, now])

  const sorted = useMemo(() => {
    const ts = l => new Date(l.started_at).getTime() || 0
    return [...filtered].sort((a, b) => sortDesc ? ts(b) - ts(a) : ts(a) - ts(b))
  }, [filtered, sortDesc])

  // Every figure here reads straight off the payload. Nothing is inferred.
  const stats = useMemo(() => {
    const total = filtered.length
    const awaitingCallback = filtered.filter(l => String(l.disposition ?? '').startsWith('callback')).length
    const durations = filtered.map(l => l.duration_sec).filter(d => typeof d === 'number')
    const avgDuration = durations.length
      ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
      : null
    return { total, awaitingCallback, avgDuration }
  }, [filtered])

  const hasFilters = search || caseType !== 'all' || status !== 'all'
    || disposition !== 'all' || range !== 'all'

  function clearFilters() {
    setSearch(''); setCaseType('all'); setStatus('all')
    setDisposition('all'); setRange('all')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-sm text-gray-400">Loading leads…</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-gray-900">Leads</h2>
            {USE_FIXTURES && (
              <Badge tone="amber">
                <FlaskConical className="w-3 h-3" />
                Demo data
              </Badge>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-0.5">
            Every call the voice agent handled for this account.
          </p>
        </div>
      </div>

      {USE_FIXTURES && (
        <div className="mb-5 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-xs text-amber-800">
            These leads are fixtures. Nothing is saved to the backend yet. The
            Django <code className="font-mono">Lead</code> model still needs to be
            built; this UI switches over with no changes once it exists.
          </p>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3 mb-6">
        <Stat
          icon={Inbox} label="Leads captured" value={stats.total} tone="blue"
          sub={RANGES[range].label.toLowerCase()}
        />
        <Stat
          icon={PhoneMissed} label="Awaiting callback" value={stats.awaitingCallback} tone="amber"
          sub="caller was not connected"
        />
        <Stat
          icon={Clock} label="Average call" value={formatDuration(stats.avgDuration)} tone="indigo"
          sub="time on the phone"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative flex-1 min-w-56">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search name, email, phone, summary…"
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <Select value={range} onChange={e => setRange(e.target.value)}>
          {Object.entries(RANGES).map(([key, r]) => (
            <option key={key} value={key}>{r.label}</option>
          ))}
        </Select>

        <Select value={caseType} onChange={e => setCaseType(e.target.value)}>
          <option value="all">All case types</option>
          {caseTypes.map(([id, label]) => (
            <option key={id} value={id}>{label}</option>
          ))}
        </Select>

        <Select value={status} onChange={e => setStatus(e.target.value)}>
          <option value="all">Any status</option>
          {Object.entries(LEAD_STATUSES).map(([key, s]) => (
            <option key={key} value={key}>{s.label}</option>
          ))}
        </Select>

        <Select value={disposition} onChange={e => setDisposition(e.target.value)}>
          <option value="all">Any outcome</option>
          {Object.entries(DISPOSITIONS).map(([key, d]) => (
            <option key={key} value={key}>{d.label}</option>
          ))}
        </Select>

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600 mb-4">{error}</p>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400 bg-white border border-gray-200 rounded-xl">
          <Inbox className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">
            {unsavedAccount ? 'Account not saved yet'
              : leads.length === 0 ? 'No leads yet'
              : 'No leads match these filters'}
          </p>
          <p className="text-xs mt-1">
            {unsavedAccount
              ? 'Save this account on the AI Account page before calls can be attributed to it.'
              : leads.length === 0
              ? 'Leads appear here automatically when the voice agent finishes a call.'
              : 'Try widening the date range or clearing filters.'}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                {['Caller', 'Case type'].map(h => (
                  <th key={h} className="text-left px-4 py-2.5 text-xs font-medium text-gray-500">{h}</th>
                ))}
                <th className="text-left px-4 py-2.5">
                  <button
                    onClick={() => setSortDesc(d => !d)}
                    className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-800 transition-colors"
                  >
                    Received
                    {sortDesc
                      ? <ChevronDown className="w-3.5 h-3.5" />
                      : <ChevronUp className="w-3.5 h-3.5" />}
                  </button>
                </th>
                {['Length', 'Outcome', 'Status'].map(h => (
                  <th key={h} className="text-left px-4 py-2.5 text-xs font-medium text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map(lead => {
                const name = fullName(lead)
                const review = fieldsNeedingReview(lead).length
                const dispo = DISPOSITIONS[lead.disposition]
                const st = LEAD_STATUSES[lead.status]

                return (
                  <tr
                    key={lead.id}
                    onClick={() => navigate(`/leads/${lead.id}`)}
                    className="border-b border-gray-100 last:border-0 hover:bg-blue-50/40 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900">
                          {name || 'Unidentified caller'}
                        </p>
                        {review > 0 && (
                          <Badge tone="amber" className="font-normal">
                            {review} low confidence
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5 truncate max-w-md">
                        {lead.summary}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-700">{lead.case_type_label || '-'}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {lead.answers.length} answers
                      </p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="text-sm text-gray-700">{formatRelative(lead.started_at)}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{formatDateTime(lead.started_at)}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                      {formatDuration(lead.duration_sec)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={dispo?.tone}>{dispositionLabel(lead.disposition)}</Badge>
                      {lead.attorney_name && (
                        <p className="text-xs text-gray-400 mt-1">{lead.attorney_name}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={st?.tone}>{st?.label ?? lead.status}</Badge>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {filtered.length > 0 && (
        <p className="text-xs text-gray-400 mt-3">
          Showing {filtered.length} of {leads.length} leads
        </p>
      )}
    </div>
  )
}
