import { API_BASE_URL } from './config'
import { fixtureLeadsFor } from '../mocks/leadFixtures'
import { normalizeLead } from '../models/leads'

/**
 * Leads API.
 *
 *   GET   /api/ai-config/:company_id/leads/
 *   GET   /api/ai-config/:company_id/leads/:id/
 *   PATCH /api/ai-config/:company_id/leads/:id/     - status / notes / assignment
 *   POST  /api/ai-config/:company_id/leads/         - the bot, at end of call.
 *                                                     Idempotent on call_id.
 *   PATCH /api/ai-config/:company_id/leads/:id/     - recording_url, once
 *                                                     Twilio's async callback fires
 *
 * Live by default. Run with VITE_USE_FIXTURE_LEADS=true to fall back to the
 * sample data in ../mocks/leadFixtures.js, which is useful when the backend is
 * down or when working on layout without a network.
 */
export const USE_FIXTURES = import.meta.env.VITE_USE_FIXTURE_LEADS === 'true'

/**
 * Django routes leads under `<uuid:company_id>`, so a non-UUID id is rejected
 * by the URL matcher before any view runs. Unsaved accounts carry local ids
 * like `draft_1754500000000`, which would 404 confusingly.
 */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
export const isPersistedAccount = id => UUID_RE.test(id ?? '')

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  const data = response.status === 204 ? null : await response.json()
  if (!response.ok) throw data
  return data
}

// ── Fixture-backed in-memory store ────────────────────────────────────────────
// Mutations survive navigation within a session but not a page reload. That is
// deliberate: nothing here should be mistaken for persistence.

const overrides = new Map() // leadId -> partial lead

function applyOverrides(lead) {
  const patch = overrides.get(lead.id)
  return patch ? { ...lead, ...patch } : lead
}

function fixtureList(companyId, accountIndex) {
  return fixtureLeadsFor(companyId, accountIndex)
    .map(payload => normalizeLead(payload, { company: companyId }))
    .map(applyOverrides)
    .sort((a, b) => new Date(b.started_at) - new Date(a.started_at))
}

const delay = (ms = 180) => new Promise(resolve => setTimeout(resolve, ms))

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * @param {string} companyId
 * @param {{ accountIndex?: number }} opts - fixture-only; picks which themed
 *        dataset this account gets. Ignored against the real backend.
 */
export async function getLeads(companyId, { accountIndex = 0 } = {}) {
  if (USE_FIXTURES) {
    await delay()
    return fixtureList(companyId, accountIndex)
  }
  const data = await request(`/api/ai-config/${companyId}/leads/`)
  return (Array.isArray(data) ? data : data.results ?? [])
    .map(payload => normalizeLead(payload, { company: companyId }))
}

export async function getLead(companyId, leadId, { accountIndex = 0 } = {}) {
  if (USE_FIXTURES) {
    await delay(120)
    const lead = fixtureList(companyId, accountIndex).find(l => l.id === leadId)
    if (!lead) throw { detail: 'Lead not found.' }
    return lead
  }
  return normalizeLead(
    await request(`/api/ai-config/${companyId}/leads/${leadId}/`),
    { company: companyId },
  )
}

/** Firm-side workflow updates: status, notes, assignment. */
export async function updateLead(companyId, leadId, body) {
  if (USE_FIXTURES) {
    await delay(120)
    overrides.set(leadId, { ...(overrides.get(leadId) ?? {}), ...body })
    return { id: leadId, ...body }
  }
  return request(`/api/ai-config/${companyId}/leads/${leadId}/`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}

/**
 * What the bots call at end of call. Not used by the dashboard, but here so the
 * contract lives in one place and Lamarck/Priyanshi can code against it.
 */
export async function createLead(companyId, body) {
  if (USE_FIXTURES) throw { detail: 'createLead requires the real backend.' }
  return request(`/api/ai-config/${companyId}/leads/`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}
