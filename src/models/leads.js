/**
 * Lead model + wire-format adapter.
 *
 * The bots POST the payload documented in `normalizeLead` below at end of call.
 * The UI never touches that shape directly. Everything goes through
 * `normalizeLead`, so when the contract changes we change one function.
 */
import { DEFAULT_INTAKE_TEMPLATES } from './defaults'

export const DISPOSITIONS = {
  transferred:          { label: 'Transferred',         tone: 'green' },
  callback_requested:   { label: 'Callback requested',  tone: 'blue'  },
  attorney_unavailable: { label: 'No attorney',         tone: 'amber' },
  abandoned:            { label: 'Caller hung up',      tone: 'gray'  },
  spam:                 { label: 'Spam / wrong number', tone: 'gray'  },
}

export const LEAD_STATUSES = {
  new:       { label: 'New',       tone: 'blue'   },
  viewed:    { label: 'Viewed',    tone: 'gray'   },
  contacted: { label: 'Contacted', tone: 'indigo' },
  converted: { label: 'Converted', tone: 'green'  },
  junk:      { label: 'Junk',      tone: 'gray'   },
}

export const URGENCIES = {
  high:   { label: 'Urgent', tone: 'red'  },
  normal: { label: 'Normal', tone: 'gray' },
  low:    { label: 'Low',    tone: 'gray' },
}

/** Answers below this are surfaced in the UI as "needs review". */
export const LOW_CONFIDENCE_THRESHOLD = 0.75

/** Firm business hours backing the after-hours metric. Mon–Fri, 9am–5pm. */
export const BUSINESS_HOURS = { startHour: 9, endHour: 17, days: [1, 2, 3, 4, 5] }

/**
 * After-hours is the metric that sells the product: calls that would otherwise
 * have hit voicemail, where most callers never call back.
 */
export function isAfterHours(isoOrDate, hours = BUSINESS_HOURS) {
  const d = isoOrDate instanceof Date ? isoOrDate : new Date(isoOrDate)
  if (!hours.days.includes(d.getDay())) return true
  return d.getHours() < hours.startHour || d.getHours() >= hours.endHour
}

export function fullName(lead) {
  return [lead.first_name, lead.middle_name, lead.last_name, lead.suffix]
    .filter(Boolean).join(' ').trim()
}

export function formatDuration(seconds) {
  if (seconds == null) return '-'
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
}

/** +19342278405 → (934) 227-8405 */
export function formatPhone(e164) {
  if (!e164) return '-'
  const digits = e164.replace(/\D/g, '')
  const local = digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits
  if (local.length !== 10) return e164
  return `(${local.slice(0, 3)}) ${local.slice(3, 6)}-${local.slice(6)}`
}

export function formatDateTime(iso) {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  })
}

export function formatRelative(iso) {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

/** Answers the firm should eyeball before trusting, because ASR was unsure. */
export function fieldsNeedingReview(lead) {
  return (lead.answers ?? []).filter(a => a.needs_review)
}

// ── Wire format → view model ──────────────────────────────────────────────────

const templateById = Object.fromEntries(DEFAULT_INTAKE_TEMPLATES.map(t => [t.id, t]))

/** Answer keys that carry contact details rather than case details. */
const CONTACT_KEYS = {
  first_name: 'first_name',
  middle_name: 'middle_name',
  last_name: 'last_name',
  suffix: 'suffix',
  email: 'email',
  phone_number: 'callback_phone',
}

/**
 * Expands the bot's flat `answers` map into the array the UI renders.
 *
 * INTERIM: question_text is looked up from the frontend's copy of the intake
 * template, which means an edited template will re-label historical leads with
 * wording that was never spoken. The fix is for the backend to snapshot
 * question_text per answer at write time. Once it does, this falls through to
 * the value already on the payload.
 */
function expandAnswers(payload) {
  const raw = payload.answers ?? {}

  // Already in the array shape we asked for, so pass it through.
  if (Array.isArray(raw)) {
    return raw.map(a => ({
      ...a,
      needs_review: a.confidence != null
        ? a.confidence < LOW_CONFIDENCE_THRESHOLD
        : (payload.low_confidence_fields ?? []).includes(a.question_id),
    }))
  }

  const template = templateById[payload.case_type]
  const questionById = Object.fromEntries((template?.questions ?? []).map(q => [q.id, q]))
  const lowConfidence = new Set(payload.low_confidence_fields ?? [])

  // Preserve template order where we can; anything unrecognised goes last.
  const ordered = (template?.questions ?? [])
    .map(q => q.id)
    .filter(qid => raw[qid] !== undefined)
  const extras = Object.keys(raw).filter(qid => !ordered.includes(qid))

  return [...ordered, ...extras].map(qid => {
    const q = questionById[qid]
    return {
      question_id: qid,
      question_text: q?.question || q?.label || qid.replace(/_/g, ' '),
      question_text_is_inferred: !q,
      field_type: q?.fieldType ?? 'text',
      value: String(raw[qid] ?? ''),
      confidence: lowConfidence.has(qid) ? 0.5 : null,
      needs_review: lowConfidence.has(qid),
    }
  })
}

function deriveUrgency(payload, answers) {
  const byId = Object.fromEntries(answers.map(a => [a.question_id, a.value]))
  if (byId.has_court_date === 'Yes' || byId.court_date) return 'high'
  const text = [payload.caller_description, payload.summary, byId.immigration_issue, byId.message]
    .filter(Boolean).join(' ').toLowerCase()
  if (/\b(court date|hearing|expires|expiring|deadline|emergency|urgent|notice to appear)\b/.test(text)) {
    return 'high'
  }
  return 'normal'
}

/**
 * Bot payload → the shape every component in this app consumes.
 *
 * Wire format (as of the contract Lamarck/Priyanshi are sending):
 *   call_id, firm_name, caller_number, dialed_number,
 *   received_at_iso, completed_at_iso, call_duration_seconds,
 *   case_type, case_type_label, case_type_corrected, case_type_original_guess,
 *   outcome, attorney_name, attorney_id,
 *   caller_description, summary,
 *   answers {}, low_confidence_fields [],
 *   additional_concerns [], faq_topics_asked [],
 *   abandoned_at_question, questions_total, questions_answered
 */
export function normalizeLead(payload, { company = null } = {}) {
  const answers = expandAnswers(payload)
  const byId = Object.fromEntries(answers.map(a => [a.question_id, a.value]))

  const started_at = payload.received_at_iso ?? payload.started_at
  const ended_at = payload.completed_at_iso ?? payload.ended_at

  // The bot sends null more often than not; the timestamps are authoritative.
  const duration_sec = payload.call_duration_seconds
    ?? (started_at && ended_at
      ? Math.max(0, Math.round((new Date(ended_at) - new Date(started_at)) / 1000))
      : null)

  const contact = {}
  for (const [answerKey, field] of Object.entries(CONTACT_KEYS)) {
    contact[field] = byId[answerKey] ?? ''
  }

  const total = payload.questions_total ?? 0
  const answered = payload.questions_answered ?? 0

  return {
    id: payload.id ?? payload.call_id,
    company: company ?? payload.company ?? null,
    call_id: payload.call_id,
    firm_name: payload.firm_name ?? null,

    caller_ani: payload.caller_number ?? payload.caller_ani ?? '',
    dialed_number: payload.dialed_number ?? '',
    started_at,
    ended_at,
    duration_sec,
    recording_url: payload.recording_url ?? null,

    ...contact,

    case_type: payload.case_type,
    case_type_label: payload.case_type_label ?? templateById[payload.case_type]?.label ?? payload.case_type,
    case_type_corrected: payload.case_type_corrected ?? false,
    case_type_original_guess: payload.case_type_original_guess ?? null,

    // `summary` is the field Sean wants saved per lead. Until the bots populate
    // it, fall back to the caller's own opening words so the row is not blank.
    // This is flagged so the UI can say which one it is showing.
    summary: payload.summary || payload.caller_description || '',
    summary_is_fallback: !payload.summary && Boolean(payload.caller_description),
    caller_description: payload.caller_description ?? '',

    urgency: payload.urgency ?? deriveUrgency(payload, answers),
    caller_state: payload.caller_state ?? null,

    disposition: payload.outcome ?? payload.disposition,
    transferred_to_name: payload.attorney_name ?? null,
    transferred_to_id: payload.attorney_id ?? null,

    intake_completion_pct: total ? Math.round((answered / total) * 100) : 0,
    questions_total: total,
    questions_answered: answered,
    abandoned_at_question: payload.abandoned_at_question ?? null,
    low_confidence_fields: payload.low_confidence_fields ?? [],
    additional_concerns: payload.additional_concerns ?? [],
    faq_topics_asked: payload.faq_topics_asked ?? [],

    status: payload.status ?? 'new',
    notes: payload.notes ?? '',

    answers,
    transcript: payload.transcript ?? null,
    raw: payload,
  }
}

/**
 * Reconstructs a call timeline from the fields the bot actually sends. The
 * contract has no event log, so this is derived rather than recorded: good
 * enough to show the shape of a call, not good enough for real diagnostics.
 * Ask for a `events[]` array if we want the real thing.
 */
export function deriveTimeline(lead) {
  const events = []
  if (lead.started_at) {
    events.push({
      ts: lead.started_at,
      type: 'call_started',
      detail: `Inbound from ${formatPhone(lead.caller_ani)} to ${formatPhone(lead.dialed_number)}`,
    })
  }
  if (lead.case_type_corrected) {
    events.push({
      ts: lead.started_at,
      type: 'case_type_corrected',
      detail: `Reclassified from ${lead.case_type_original_guess ?? 'an earlier guess'} to ${lead.case_type_label}`,
    })
  }
  for (const topic of lead.faq_topics_asked) {
    events.push({ ts: lead.started_at, type: 'faq_asked', detail: `Caller asked about ${topic.replace(/_/g, ' ')}` })
  }
  if (lead.abandoned_at_question) {
    events.push({
      ts: lead.ended_at,
      type: 'abandoned',
      detail: `Caller dropped at "${lead.abandoned_at_question}"`,
    })
  }
  if (lead.disposition === 'transferred') {
    events.push({ ts: lead.ended_at, type: 'transfer_completed', detail: `Connected to ${lead.transferred_to_name ?? 'an attorney'}` })
  } else if (lead.disposition === 'attorney_unavailable') {
    events.push({ ts: lead.ended_at, type: 'transfer_failed', detail: 'No attorney answered' })
  }
  if (lead.ended_at) {
    events.push({ ts: lead.ended_at, type: 'call_ended', detail: `Duration ${formatDuration(lead.duration_sec)}` })
  }
  return events
}
