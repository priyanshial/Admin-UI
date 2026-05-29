import { API_BASE_URL } from './config'

// Shared fetch wrapper — attaches credentials and Content-Type headers.
// Throws the parsed error body on non-2xx responses.
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

// ── Company (AI Config) ───────────────────────────────────────────────────────
// GET    /api/ai-config/
export const getAIConfigs = () => request('/api/ai-config/')
// GET    /api/ai-config/:id/
export const getAIConfig = (id) => request(`/api/ai-config/${id}/`)
// POST   /api/ai-config/create/
export const createAIConfig = (body) => request('/api/ai-config/create/', { method: 'POST', body: JSON.stringify(body) })
// PATCH  /api/ai-config/:id/update/
export const updateAIConfig = (id, body) => request(`/api/ai-config/${id}/update/`, { method: 'PATCH', body: JSON.stringify(body) })
// DELETE /api/ai-config/:id/delete/
export const deleteAIConfig = (id) => request(`/api/ai-config/${id}/delete/`, { method: 'DELETE' })

// ── Contacts ──────────────────────────────────────────────────────────────────
// GET    /api/ai-config/:company_id/contacts/
export const getContacts = (companyId) => request(`/api/ai-config/${companyId}/contacts/`)
// GET    /api/ai-config/:company_id/contacts/:id/
export const getContact = (companyId, id) => request(`/api/ai-config/${companyId}/contacts/${id}/`)
// POST   /api/ai-config/:company_id/contacts/
export const createContact = (companyId, body) => request(`/api/ai-config/${companyId}/contacts/`, { method: 'POST', body: JSON.stringify(body) })
// PATCH  /api/ai-config/:company_id/contacts/:id/
export const updateContact = (companyId, id, body) => request(`/api/ai-config/${companyId}/contacts/${id}/`, { method: 'PATCH', body: JSON.stringify(body) })
// DELETE /api/ai-config/:company_id/contacts/:id/
export const deleteContact = (companyId, id) => request(`/api/ai-config/${companyId}/contacts/${id}/`, { method: 'DELETE' })

// ── Intake Templates (Case Types) ─────────────────────────────────────────────
// GET    /api/ai-config/intake-templates/?company_id=:id
export const getIntakeTemplates = (companyId) => request(`/api/ai-config/intake-templates/?company_id=${companyId}`)
// PATCH  /api/ai-config/intake-templates/
export const updateIntakeTemplates = (body) => request('/api/ai-config/intake-templates/', { method: 'PATCH', body: JSON.stringify(body) })

// ── Transfer Rules ────────────────────────────────────────────────────────────
// GET    /api/ai-config/transfer-rules/?company_id=:id
export const getTransferRules = (companyId) => request(`/api/ai-config/transfer-rules/?company_id=${companyId}`)
// GET    /api/ai-config/transfer-rules/?company_id=:id&case_type_id=:id
export const getTransferRulesByCaseType = (companyId, caseTypeId) =>
  request(`/api/ai-config/transfer-rules/?company_id=${companyId}&case_type_id=${caseTypeId}`)
// POST   /api/ai-config/transfer-rules/
export const createTransferRule = (body) => request('/api/ai-config/transfer-rules/', { method: 'POST', body: JSON.stringify(body) })
// PATCH  /api/ai-config/transfer-rules/:id/
export const updateTransferRule = (id, body) => request(`/api/ai-config/transfer-rules/${id}/`, { method: 'PATCH', body: JSON.stringify(body) })
// DELETE /api/ai-config/transfer-rules/:id/
export const deleteTransferRule = (id) => request(`/api/ai-config/transfer-rules/${id}/`, { method: 'DELETE' })
