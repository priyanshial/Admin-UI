import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Bot, Trash2, ChevronRight } from 'lucide-react'
import { useAppStore } from '../store/AppContext'

function NewAccountForm({ onCreate, onCancel, existingNames }) {
  const [firmName, setFirmName] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  const isDuplicate = firmName.trim() &&
    existingNames.some(n => n.toLowerCase() === firmName.trim().toLowerCase())

  async function handleSubmit(e) {
    e.preventDefault()
    if (!firmName.trim()) return
    if (isDuplicate) {
      setError('An account with this firm name already exists.')
      return
    }
    setCreating(true)
    setError('')
    try {
      await onCreate(firmName.trim())
    } catch {
      setError('Failed to create account. Is the server running?')
      setCreating(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-4 space-y-2"
    >
      <div className="flex items-center gap-3">
        <Bot className="w-5 h-5 text-blue-500 shrink-0" />
        <input
          autoFocus
          type="text"
          value={firmName}
          onChange={e => { setFirmName(e.target.value); setError('') }}
          placeholder="Firm name…"
          className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 border-0 border-b border-blue-300 focus:border-blue-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!firmName.trim() || creating || isDuplicate}
          className="px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 transition-colors"
        >
          {creating ? 'Creating…' : 'Create'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors"
        >
          Cancel
        </button>
      </div>
      {isDuplicate && !error && (
        <p className="text-xs text-amber-600 pl-8">An account with this name already exists.</p>
      )}
      {error && <p className="text-xs text-red-500 pl-8">{error}</p>}
    </form>
  )
}

function AccountCard({ account, onOpen, onDelete }) {
  const { accountConfig } = account
  const enabledServices = account.services?.filter(s => s.enabled).length ?? 0
  const totalServices = account.services?.length ?? 0

  return (
    <div className="bg-white border border-gray-200 rounded-xl px-5 py-4 flex items-center gap-4 hover:border-blue-200 hover:shadow-sm transition-all group">
      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
        <Bot className="w-5 h-5 text-blue-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{accountConfig.firm_name || 'Unnamed Firm'}</p>
        <p className="text-xs text-gray-400 mt-0.5">
          {enabledServices}/{totalServices} services enabled
        </p>
      </div>
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={e => { e.stopPropagation(); onDelete() }}
          className="p-1.5 text-gray-300 hover:text-red-500 transition-colors"
          title="Delete account"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      <button
        onClick={onOpen}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors shrink-0"
      >
        Open
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

export default function AccountsPage() {
  const { accounts, accountsLoading, selectAccount, createAccount, deleteAccount } = useAppStore()
  const navigate = useNavigate()
  const [showNewForm, setShowNewForm] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const existingNames = accounts.map(a => a.accountConfig?.firm_name ?? '')

  function handleOpen(id) {
    selectAccount(id)
    navigate(`/account/${id}`)
  }

  async function handleCreate(firmName) {
    const id = await createAccount(firmName)
    setShowNewForm(false)
    navigate(`/account/${id}`)
  }

  async function handleDelete(id) {
    try { await deleteAccount(id) } catch {}
    setConfirmDelete(null)
  }

  const accountToDelete = accounts.find(a => a.id === confirmDelete)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Accounts</h2>
          <p className="text-sm text-gray-500 mt-0.5">Select an account to configure, or create a new one.</p>
        </div>
        {!showNewForm && (
          <button
            onClick={() => setShowNewForm(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Account
          </button>
        )}
      </div>

      <div className="space-y-2">
        {showNewForm && (
          <NewAccountForm
            onCreate={handleCreate}
            onCancel={() => setShowNewForm(false)}
            existingNames={existingNames}
          />
        )}

        {accountsLoading && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-sm">Loading accounts…</p>
          </div>
        )}

        {!accountsLoading && accounts.length === 0 && !showNewForm && (
          <div className="text-center py-16 text-gray-400">
            <Bot className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">No accounts yet</p>
            <p className="text-xs mt-1">Create your first account to get started.</p>
          </div>
        )}

        {!accountsLoading && accounts.map(account => (
          <AccountCard
            key={account.id}
            account={account}
            onOpen={() => handleOpen(account.id)}
            onDelete={() => setConfirmDelete(account.id)}
          />
        ))}
      </div>

      {confirmDelete && accountToDelete && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-2">
              Delete {accountToDelete.accountConfig.firm_name || 'this account'}?
            </h3>
            <p className="text-sm text-gray-500 mb-5">
              This will permanently remove the account and all its configuration. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="flex-1 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
