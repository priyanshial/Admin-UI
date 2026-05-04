import { createContext, useContext, useState, useCallback } from 'react'
import { loadFromStorage, saveToStorage } from './storage'
import { createDefaultAccount } from '../models/defaults'

const KEYS = {
  ACCOUNTS: 'accounts',
  ACTIVE_ID: 'active_account_id',
}

const AppContext = createContext(null)

function loadAccounts() {
  const stored = loadFromStorage(KEYS.ACCOUNTS, null)
  if (stored && stored.length > 0) return stored
  // First run: seed one default account
  const seed = createDefaultAccount('Law Office of Moira Rose')
  saveToStorage(KEYS.ACCOUNTS, [seed])
  return [seed]
}

export function AppProvider({ children }) {
  const [accounts, setAccounts] = useState(loadAccounts)
  const [activeAccountId, setActiveAccountId] = useState(() =>
    loadFromStorage(KEYS.ACTIVE_ID, null)
  )

  const activeAccount = accounts.find(a => a.id === activeAccountId) ?? null

  // ── Account management ────────────────────────────────────────────────────

  const selectAccount = useCallback((id) => {
    setActiveAccountId(id)
    saveToStorage(KEYS.ACTIVE_ID, id)
  }, [])

  const createAccount = useCallback((firmName) => {
    const account = createDefaultAccount(firmName)
    setAccounts(prev => {
      const updated = [...prev, account]
      saveToStorage(KEYS.ACCOUNTS, updated)
      return updated
    })
    setActiveAccountId(account.id)
    saveToStorage(KEYS.ACTIVE_ID, account.id)
    return account.id
  }, [])

  const deleteAccount = useCallback((id) => {
    setAccounts(prev => {
      const updated = prev.filter(a => a.id !== id)
      saveToStorage(KEYS.ACCOUNTS, updated)
      return updated
    })
    setActiveAccountId(prev => {
      if (prev !== id) return prev
      saveToStorage(KEYS.ACTIVE_ID, null)
      return null
    })
  }, [])

  // ── Helpers for updating active account's config domains ─────────────────

  function updateActive(patch) {
    setAccounts(prev => {
      const updated = prev.map(a => a.id === activeAccountId ? { ...a, ...patch } : a)
      saveToStorage(KEYS.ACCOUNTS, updated)
      return updated
    })
  }

  const saveAccountConfig = useCallback((data) => {
    updateActive({ accountConfig: data })
  }, [activeAccountId])

  const saveIntakeTemplates = useCallback((data) => {
    updateActive({ intakeTemplates: data })
  }, [activeAccountId])

  const saveConfirmationQuestions = useCallback((data) => {
    updateActive({ confirmationQuestions: data })
  }, [activeAccountId])

  const saveServices = useCallback((data) => {
    updateActive({ services: data })
  }, [activeAccountId])

  return (
    <AppContext.Provider value={{
      // account list
      accounts,
      activeAccountId,
      activeAccount,
      selectAccount,
      createAccount,
      deleteAccount,
      // active account config (null when no account selected)
      accountConfig:          activeAccount?.accountConfig          ?? null,
      intakeTemplates:        activeAccount?.intakeTemplates        ?? [],
      confirmationQuestions:  activeAccount?.confirmationQuestions  ?? [],
      services:               activeAccount?.services               ?? [],
      // save actions
      saveAccountConfig,
      saveIntakeTemplates,
      saveConfirmationQuestions,
      saveServices,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useAppStore() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppStore must be used within AppProvider')
  return ctx
}
