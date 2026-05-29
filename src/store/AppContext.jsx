import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { DEFAULT_ACCOUNT_CONFIG, DEFAULT_INTAKE_TEMPLATES, DEFAULT_CONFIRMATION_QUESTIONS, DEFAULT_SERVICES } from '../models/defaults'
import { getAIConfigs, deleteAIConfig } from '../api/core'

const AppContext = createContext(null)

function backendRecordToAccount(r) {
  return {
    id: r.id,               // backend UUID
    isDraft: false,
    accountConfig: { ...DEFAULT_ACCOUNT_CONFIG, ...r, backendId: r.id },
    intakeTemplates: DEFAULT_INTAKE_TEMPLATES,
    confirmationQuestions: DEFAULT_CONFIRMATION_QUESTIONS,
    services: DEFAULT_SERVICES,
  }
}

export function AppProvider({ children }) {
  const [accounts, setAccounts] = useState([])
  const [activeAccountId, setActiveAccountId] = useState(null)
  const [accountsLoading, setAccountsLoading] = useState(true)

  // Load all accounts from backend on app start
  useEffect(() => {
    getAIConfigs()
      .then(records => {
        if (Array.isArray(records)) {
          setAccounts(records.map(backendRecordToAccount))
        }
      })
      .catch(() => {})
      .finally(() => setAccountsLoading(false))
  }, [])

  const activeAccount = accounts.find(a => a.id === activeAccountId) ?? null

  const selectAccount = useCallback((id) => setActiveAccountId(id), [])

  // Create a LOCAL draft — no API call. AccountPage POSTs on first Save.
  const createAccount = useCallback((firmName) => {
    const tempId = `draft_${Date.now()}`
    const draft = {
      id: tempId,
      isDraft: true,
      accountConfig: { ...DEFAULT_ACCOUNT_CONFIG, name: firmName },
      intakeTemplates: DEFAULT_INTAKE_TEMPLATES,
      confirmationQuestions: DEFAULT_CONFIRMATION_QUESTIONS,
      services: DEFAULT_SERVICES,
    }
    setAccounts(prev => [...prev, draft])
    setActiveAccountId(tempId)
    return tempId
  }, [])

  // After AccountPage successfully POSTs, replace the draft with the real backend record
  const promoteDraft = useCallback((tempId, backendRecord) => {
    setAccounts(prev =>
      prev.map(a => a.id === tempId ? backendRecordToAccount(backendRecord) : a)
    )
    setActiveAccountId(backendRecord.id)
  }, [])

  // Delete — if it's a draft just remove locally, otherwise hit backend
  const deleteAccount = useCallback(async (id) => {
    const account = accounts.find(a => a.id === id)
    if (account && !account.isDraft) {
      await deleteAIConfig(id)
    }
    setAccounts(prev => prev.filter(a => a.id !== id))
    setActiveAccountId(prev => prev === id ? null : prev)
  }, [accounts])

  const saveAccountConfig = useCallback((data) => {
    setAccounts(prev =>
      prev.map(a => a.id === activeAccountId ? { ...a, accountConfig: data } : a)
    )
  }, [activeAccountId])

  const saveIntakeTemplates = useCallback((data) => {
    setAccounts(prev =>
      prev.map(a => a.id === activeAccountId ? { ...a, intakeTemplates: data } : a)
    )
  }, [activeAccountId])

  const saveConfirmationQuestions = useCallback((data) => {
    setAccounts(prev =>
      prev.map(a => a.id === activeAccountId ? { ...a, confirmationQuestions: data } : a)
    )
  }, [activeAccountId])

  const saveServices = useCallback((data) => {
    setAccounts(prev =>
      prev.map(a => a.id === activeAccountId ? { ...a, services: data } : a)
    )
  }, [activeAccountId])

  return (
    <AppContext.Provider value={{
      accounts,
      accountsLoading,
      activeAccountId,
      activeAccount,
      selectAccount,
      createAccount,
      promoteDraft,
      deleteAccount,
      accountConfig:         activeAccount?.accountConfig         ?? null,
      intakeTemplates:       activeAccount?.intakeTemplates       ?? [],
      confirmationQuestions: activeAccount?.confirmationQuestions ?? [],
      services:              activeAccount?.services              ?? [],
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
