import { useState } from 'react'
import { Lock, UserPlus, Check, X } from 'lucide-react'

const PASSWORD_RULES = [
  { id: 'length',  label: 'At least 8 characters',           test: p => p.length >= 8 },
  { id: 'upper',   label: 'At least 1 uppercase letter',     test: p => /[A-Z]/.test(p) },
  { id: 'number',  label: 'At least 1 number',               test: p => /[0-9]/.test(p) },
  { id: 'special', label: 'At least 1 special character',    test: p => /[^A-Za-z0-9]/.test(p) },
]

function PasswordStrength({ password }) {
  if (!password) return null
  return (
    <ul className="mt-2 space-y-1">
      {PASSWORD_RULES.map(rule => {
        const passed = rule.test(password)
        return (
          <li key={rule.id} className={`flex items-center gap-1.5 text-xs ${passed ? 'text-green-600' : 'text-gray-400'}`}>
            {passed
              ? <Check className="w-3 h-3 shrink-0" />
              : <X className="w-3 h-3 shrink-0" />
            }
            {rule.label}
          </li>
        )
      })}
    </ul>
  )
}

const EMPTY_FORM = { firstName: '', lastName: '', username: '', email: '', password: '', confirmPassword: '' }

export default function LoginPage({ onLogin }) {
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const isSignup = mode === 'signup'

  function switchMode(next) {
    setMode(next)
    setForm(EMPTY_FORM)
    setError('')
  }

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (isSignup) {
      if (!form.firstName.trim() || !form.lastName.trim()) {
        setError('Please enter your first and last name.')
        return
      }
      if (!form.username.trim()) {
        setError('Please choose a username.')
        return
      }
      if (!/^[a-zA-Z0-9_]+$/.test(form.username)) {
        setError('Username can only contain letters, numbers, and underscores.')
        return
      }
      if (!form.email) {
        setError('Please enter your email.')
        return
      }
      const failedRules = PASSWORD_RULES.filter(r => !r.test(form.password))
      if (failedRules.length > 0) {
        setError(`Password must meet all requirements below.`)
        return
      }
      if (form.password !== form.confirmPassword) {
        setError('Passwords do not match.')
        return
      }
    } else {
      if (!form.email || !form.password) {
        setError('Please fill in all fields.')
        return
      }
    }

    setLoading(true)
    // Placeholder: replace with real auth call
    await new Promise(r => setTimeout(r, 600))
    setLoading(false)
    onLogin()
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">

          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
              {isSignup
                ? <UserPlus className="w-5 h-5 text-blue-600" />
                : <Lock className="w-5 h-5 text-blue-600" />
              }
            </div>
          </div>

          <h2 className="text-xl font-semibold text-gray-900 text-center mb-1">
            {isSignup ? 'Create your account' : 'Sign in to AI Config'}
          </h2>
          <p className="text-sm text-gray-500 text-center mb-6">Voice Agent Dashboard</p>

          <form onSubmit={handleSubmit} className="space-y-4">

            {isSignup && (
              <>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={form.firstName}
                      onChange={handleChange}
                      placeholder="Jane"
                      autoFocus
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={form.lastName}
                      onChange={handleChange}
                      placeholder="Smith"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <input
                    type="text"
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    placeholder="jane_smith"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-400 mt-1">Letters, numbers, and underscores only.</p>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@lawfirm.com"
                autoFocus={!isSignup}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {isSignup && <PasswordStrength password={form.password} />}
            </div>

            {isSignup && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}

            {error && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {loading
                ? (isSignup ? 'Creating account…' : 'Signing in…')
                : (isSignup ? 'Create account' : 'Sign in')
              }
            </button>
          </form>

          <div className="mt-5 text-center">
            {isSignup ? (
              <p className="text-sm text-gray-500">
                Already have an account?{' '}
                <button onClick={() => switchMode('login')} className="text-blue-600 font-medium hover:underline">
                  Sign in
                </button>
              </p>
            ) : (
              <p className="text-sm text-gray-500">
                Don&apos;t have an account?{' '}
                <button onClick={() => switchMode('signup')} className="text-blue-600 font-medium hover:underline">
                  Sign up
                </button>
              </p>
            )}
          </div>

        </div>
        <p className="text-center text-xs text-gray-400 mt-4">Answering Legal — Internal Use Only</p>
      </div>
    </div>
  )
}
