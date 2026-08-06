/**
 * Lead model + wire-format adapter.
 *
 * The bots POST the payload documented in `normalizeLead` below at end of call.
 * The UI never touches that shape directly. Everything goes through
 * `normalizeLead`, so when the contract changes we change one function.
 */
import { DEFAULT_INTAKE_TEMPLATES } from './defaults'

export const DISPOSITIONS = {
  transferred:                   { label: 'Transferred',        tone: 'green' },
  callback:                      { label: 'Callback requested', tone: 'blue'  },
  callback_attorney_unavailable: { label: 'No attorney, callback', tone: 'amber' },
  abandoned:                     { label: 'Caller hung up',     tone: 'gray'  },
  spam:                          { label: 'Spam / wrong number',tone: 'gray'  },
}

/** Renders an outcome we have not seen before rather than printing a raw slug. */
export function dispositionLabel(value) {
  const known = DISPOSITIONS[value]?.label
  if (known) return known
  const humanised = String(value ?? '').replace(/_/g, ' ').replace(/^./, c => c.toUpperCase())
  return humanised || 'Unknown'
}

export const LEAD_STATUSES = {
  new:       { label: 'New',       tone: 'blue'   },
  viewed:    { label: 'Viewed',    tone: 'gray'   },
  contacted: { label: 'Contacted', tone: 'indigo' },
  converted: { label: 'Converted', tone: 'green'  },
  junk:      { label: 'Junk',      tone: 'gray'   },
}

/** Confidence below this is surfaced as a low-confidence field. */
export const LOW_CONFIDENCE_THRESHOLD = 0.75


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

/** Answers the bot flagged as low-confidence speech recognition. */
export function fieldsNeedingReview(lead) {
  return (lead.answers ?? []).filter(a => a.needs_review)
}

// ── Wire format → view model ──────────────────────────────────────────────────

const templateById = Object.fromEntries(DEFAULT_INTAKE_TEMPLATES.map(t => [t.id, t]))

/** Backend sends a UUID in `case_type`; `case_type_slug` is the template key. */
function caseTypeKey(payload) {
  return payload.case_type_slug ?? payload.case_type ?? null
}

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

  const template = templateById[caseTypeKey(payload)]
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
      needs_review: lowConfidence.has(qid),
    }
  })
}

/**
 * Bot payload → the shape every component in this app consumes.
 *
 * Backend response fields (GET /api/ai-config/<uuid>/leads/):
 *   id, company, call_id, caller_number, dialed_number,
 *   received_at, completed_at, call_duration_seconds,
 *   case_type (uuid), case_type_slug, case_type_label,
 *   outcome, attorney, attorney_name,
 *   caller_description, summary,
 *   answers {}, low_confidence_fields [],
 *   additional_concerns [], faq_topics_asked [], abandoned_at_question
 *
 * The bot's POST shape uses received_at_iso/completed_at_iso; both are accepted.
 */
export function normalizeLead(payload, { company = null } = {}) {
  const answers = expandAnswers(payload)
  const byId = Object.fromEntries(answers.map(a => [a.question_id, a.value]))

  // Django serializes `received_at`; the bot posts `received_at_iso`.
  const started_at = payload.received_at ?? payload.received_at_iso ?? null
  const ended_at = payload.completed_at ?? payload.completed_at_iso ?? null

  // Derived only when the backend leaves it null.
  const duration_sec = payload.call_duration_seconds
    ?? (started_at && ended_at
      ? Math.max(0, Math.round((new Date(ended_at) - new Date(started_at)) / 1000))
      : null)

  const contact = {}
  for (const [answerKey, field] of Object.entries(CONTACT_KEYS)) {
    contact[field] = byId[answerKey] ?? ''
  }

  return {
    id: payload.id ?? payload.call_id,
    company: company ?? payload.company ?? null,
    call_id: payload.call_id,

    caller_ani: payload.caller_number ?? payload.caller_ani ?? '',
    dialed_number: payload.dialed_number ?? '',
    started_at,
    ended_at,
    duration_sec,

    ...contact,

    // `case_type` is a UUID on the backend; `case_type_slug` is the template key.
    case_type: caseTypeKey(payload),
    case_type_label: payload.case_type_label ?? templateById[caseTypeKey(payload)]?.label ?? '',

    // `summary` is the field Sean wants saved per lead. Until the bots populate
    // it, fall back to the caller's own opening words so the row is not blank.
    // This is flagged so the UI can say which one it is showing.
    summary: payload.summary || payload.caller_description || '',
    summary_is_fallback: !payload.summary && Boolean(payload.caller_description),
    caller_description: payload.caller_description ?? '',

    disposition: payload.outcome ?? payload.disposition,
    attorney_name: payload.attorney_name ?? null,

    abandoned_at_question: payload.abandoned_at_question || null,
    low_confidence_fields: payload.low_confidence_fields ?? [],
    additional_concerns: payload.additional_concerns ?? [],
    faq_topics_asked: payload.faq_topics_asked ?? [],

    status: payload.status ?? 'new',
    notes: payload.notes ?? '',

    answers,
    raw: payload,
  }
}

