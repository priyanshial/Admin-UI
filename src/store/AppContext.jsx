import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { DEFAULT_ACCOUNT_CONFIG, DEFAULT_INTAKE_TEMPLATES, DEFAULT_CONFIRMATION_QUESTIONS, DEFAULT_SERVICES } from '../models/defaults'
import { getAIConfigs, createAIConfig, deleteAIConfig } from '../api/core'

const AppContext = createContext(null)

function backendRecordToAccount(r) {
  return {
    id: r.id,
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

  const selectAccount = useCallback((id) => {
    setActiveAccountId(id)
  }, [])


//   {
//       "name": "Smith & Partners Law",
//       "email": "contact@smithpartners.com",
//       "additional_email": "billing@smithpartners.com",
//       "phone": "212-555-0100",
//       "additional_phone": "212-555-0101",
//       "llm_type": "gpt-4",
//       "incoming_call": "12125550100",
//       "transfer_call": "12125550101",
//       "address": "350 Fifth Avenue",
//       "address2": "Suite 410",
//       "city": "New York",
//       "state": "NY",
//       "zip": "10118",
//       "did_phone_number": "12125550199",
//       "notes": "Personal injury and criminal defense firm",
//       "case_types": []
//   }
  // Create on backend, then add to local list
  const createAccount = useCallback(async (firmName) => {
    const created = await createAIConfig({ name: firmName })
    const account = backendRecordToAccount(created)
    setAccounts(prev => [...prev, account])
    setActiveAccountId(account.id)
    return account.id
  }, [])

  // Delete on backend, then remove from local list
  const deleteAccount = useCallback(async (id) => {
    const account = accounts.find(a => a.id === id)
    const backendId = account?.accountConfig?.backendId
    if (backendId) {
      await deleteAIConfig(backendId)
    }
    setAccounts(prev => prev.filter(a => a.id !== id))
    setActiveAccountId(prev => prev === id ? null : prev)
  }, [accounts])

  // Update active account's in-memory config after a successful backend save
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
