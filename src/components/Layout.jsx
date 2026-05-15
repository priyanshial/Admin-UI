import { NavLink, useNavigate } from 'react-router-dom'
import { Bot, ListChecks, Shield, Settings2, ChevronLeft, Users } from 'lucide-react'
import { useAppStore } from '../store/AppContext'

const configNavItems = [
  { to: '/account',           label: 'AI Account',        icon: Bot },
  { to: '/intake-templates',  label: 'Intake Templates',  icon: ListChecks },
  { to: '/confirm-questions', label: 'Confirm Questions', icon: Shield },
  { to: '/toggle-service',    label: 'Toggle Service',    icon: Settings2 },
]

export default function Layout({ children }) {
  const { accountConfig, activeAccountId } = useAppStore()
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 shrink-0 bg-white border-r border-gray-200 flex flex-col">

        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200">
          <h1 className="text-lg font-semibold text-gray-900">AI Config</h1>
          <p className="text-xs text-gray-500 mt-0.5">Voice Agent Dashboard</p>
        </div>

        {/* All Accounts link */}
        <div className="px-3 pt-3">
          <button
            onClick={() => navigate('/accounts')}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs font-medium text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            All Accounts
          </button>
        </div>

        {/* Config nav — only when an account is selected */}
        {activeAccountId && (
          <nav className="flex-1 px-3 py-2 space-y-1">
            {configNavItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </NavLink>
            ))}
          </nav>
        )}

        {!activeAccountId && (
          <nav className="flex-1 px-3 py-2 space-y-1">
            <NavLink
              to="/accounts"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
            >
              <Users className="w-4 h-4 shrink-0" />
              Accounts
            </NavLink>
          </nav>
        )}

        {/* Footer — shows active firm name */}
        <div className="px-6 py-4 border-t border-gray-200">
          <p className="text-xs text-gray-400 truncate">
            {accountConfig?.name ?? 'No account selected'}
          </p>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="max-w-3xl mx-auto px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
