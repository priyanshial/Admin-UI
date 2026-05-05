import { API_BASE_URL } from './config'

// All requests use credentials: 'include' so the browser sends the JWT cookies
// that the backend sets as httpOnly cookies on login/refresh.

// ── POST /api/auth/register/ ─────────────────────────────────────────────────
export async function registerUser({ firstName, lastName, username, email, password }) {
  const response = await fetch(`${API_BASE_URL}/api/auth/register/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      first_name: firstName,
      last_name:  lastName,
      username,
      email,
      password,
    }),
  })
  const data = await response.json()
  if (!response.ok) throw data
  return data // { message: 'Account created successfully.' }
}

// ── POST /api/auth/login/ ────────────────────────────────────────────────────
export async function loginUser({ username, password }) {
  const response = await fetch(`${API_BASE_URL}/api/auth/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ username, password }),
  })
  const data = await response.json()
  if (!response.ok) throw data
  return data // { message: 'Login successful.', user: { id, username, email, first_name, last_name } }
}

// ── POST /api/auth/logout/ ───────────────────────────────────────────────────
export async function logoutUser() {
  const response = await fetch(`${API_BASE_URL}/api/auth/logout/`, {
    method: 'POST',
    credentials: 'include',
  })
  if (!response.ok) throw await response.json()
}

// ── POST /api/auth/refresh/ ──────────────────────────────────────────────────
// Call this automatically when a request returns 401 to get a new access token.
export async function refreshToken() {
  const response = await fetch(`${API_BASE_URL}/api/auth/refresh/`, {
    method: 'POST',
    credentials: 'include',
  })
  if (!response.ok) throw await response.json()
}

// ── GET /api/auth/me/ ────────────────────────────────────────────────────────
// Returns the currently authenticated user. Use on app load to check session.
export async function getMe() {
  const response = await fetch(`${API_BASE_URL}/api/auth/me/`, {
    credentials: 'include',
  })
  if (!response.ok) throw await response.json()
  return response.json() // { id, username, email, first_name, last_name }
}
