// ── Fill in the backend base URL before testing ──────────────────────────────
//export const API_BASE_URL = 'http://localhost:8000'

export const API_BASE_URL = ''

// Helper: extracts a readable error message from DRF error responses.
// DRF can return { detail: '...' }, { field: ['msg'] }, or { non_field_errors: ['msg'] }
export function parseApiError(data) {
  if (!data) return 'An unexpected error occurred.'
  if (typeof data === 'string') return data
  if (data.detail) return data.detail
  if (data.non_field_errors) return data.non_field_errors[0]
  const firstKey = Object.keys(data)[0]
  if (firstKey) {
    const msg = Array.isArray(data[firstKey]) ? data[firstKey][0] : data[firstKey]
    return `${firstKey}: ${msg}`
  }
  return 'An unexpected error occurred.'
}
