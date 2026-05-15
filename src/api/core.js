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

// ── AI Config ─────────────────────────────────────────────────────────────────
// GET    /api/ai-config/
export const getAIConfigs = () => request('/api/ai-config/')
// POST   /api/ai-config/create/
export const createAIConfig = (body) => request('/api/ai-config/create/', { method: 'POST', body: JSON.stringify(body) })
// PUT    /api/ai-config/:id/update/
export const updateAIConfig = (id, body) => request(`/api/ai-config/${id}/update/`, { method: 'PATCH', body: JSON.stringify(body) })
// DELETE /api/ai-config/:id/delete/
export const deleteAIConfig = (id) => request(`/api/ai-config/${id}/delete/`, { method: 'DELETE' })

// ── Companies ─────────────────────────────────────────────────────────────────
// GET    /api/companies/
export const getCompanies = () => request('/api/companies/')
// POST   /api/companies/
export const createCompany = (body) => request('/api/companies/', { method: 'POST', body: JSON.stringify(body) })
// GET    /api/companies/:id/
export const getCompany = (id) => request(`/api/companies/${id}/`)
// PUT    /api/companies/:id/
export const updateCompany = (id, body) => request(`/api/companies/${id}/`, { method: 'PUT', body: JSON.stringify(body) })
// DELETE /api/companies/:id/
export const deleteCompany = (id) => request(`/api/companies/${id}/`, { method: 'DELETE' })

// ── Company Fields ────────────────────────────────────────────────────────────
// GET    /api/company-fields/
export const getCompanyFields = () => request('/api/company-fields/')
// POST   /api/company-fields/
export const createCompanyField = (body) => request('/api/company-fields/', { method: 'POST', body: JSON.stringify(body) })
// PUT    /api/company-fields/:id/
export const updateCompanyField = (id, body) => request(`/api/company-fields/${id}/`, { method: 'PUT', body: JSON.stringify(body) })
// DELETE /api/company-fields/:id/
export const deleteCompanyField = (id) => request(`/api/company-fields/${id}/`, { method: 'DELETE' })

// ── Law Office Contacts ───────────────────────────────────────────────────────
// GET    /api/law-office-contacts/
export const getLawOfficeContacts = () => request('/api/law-office-contacts/')
// POST   /api/law-office-contacts/
export const createLawOfficeContact = (body) => request('/api/law-office-contacts/', { method: 'POST', body: JSON.stringify(body) })
// PUT    /api/law-office-contacts/:id/
export const updateLawOfficeContact = (id, body) => request(`/api/law-office-contacts/${id}/`, { method: 'PUT', body: JSON.stringify(body) })
// DELETE /api/law-office-contacts/:id/
export const deleteLawOfficeContact = (id) => request(`/api/law-office-contacts/${id}/`, { method: 'DELETE' })

// ── Greetings ─────────────────────────────────────────────────────────────────
// GET    /api/greetings/
export const getGreetings = () => request('/api/greetings/')
// POST   /api/greetings/
export const createGreeting = (body) => request('/api/greetings/', { method: 'POST', body: JSON.stringify(body) })
// PUT    /api/greetings/:id/
export const updateGreeting = (id, body) => request(`/api/greetings/${id}/`, { method: 'PUT', body: JSON.stringify(body) })
// DELETE /api/greetings/:id/
export const deleteGreeting = (id) => request(`/api/greetings/${id}/`, { method: 'DELETE' })

// ── Case Types ────────────────────────────────────────────────────────────────
// GET    /api/case-types/
export const getCaseTypes = () => request('/api/case-types/')
// POST   /api/case-types/
export const createCaseType = (body) => request('/api/case-types/', { method: 'POST', body: JSON.stringify(body) })
// PUT    /api/case-types/:id/
export const updateCaseType = (id, body) => request(`/api/case-types/${id}/`, { method: 'PUT', body: JSON.stringify(body) })
// DELETE /api/case-types/:id/
export const deleteCaseType = (id) => request(`/api/case-types/${id}/`, { method: 'DELETE' })

// ── Questions ─────────────────────────────────────────────────────────────────
// GET    /api/questions/
export const getQuestions = () => request('/api/questions/')
// POST   /api/questions/
export const createQuestion = (body) => request('/api/questions/', { method: 'POST', body: JSON.stringify(body) })
// PUT    /api/questions/:id/
export const updateQuestion = (id, body) => request(`/api/questions/${id}/`, { method: 'PUT', body: JSON.stringify(body) })
// DELETE /api/questions/:id/
export const deleteQuestion = (id) => request(`/api/questions/${id}/`, { method: 'DELETE' })

// ── Question Options ──────────────────────────────────────────────────────────
// GET    /api/question-options/
export const getQuestionOptions = () => request('/api/question-options/')
// POST   /api/question-options/
export const createQuestionOption = (body) => request('/api/question-options/', { method: 'POST', body: JSON.stringify(body) })
// PUT    /api/question-options/:id/
export const updateQuestionOption = (id, body) => request(`/api/question-options/${id}/`, { method: 'PUT', body: JSON.stringify(body) })
// DELETE /api/question-options/:id/
export const deleteQuestionOption = (id) => request(`/api/question-options/${id}/`, { method: 'DELETE' })
