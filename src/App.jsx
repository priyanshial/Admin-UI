import { Routes, Route, Navigate } from 'react-router-dom'
import { useState } from 'react'
import { AppProvider } from './store/AppContext'
import { useAppStore } from './store/AppContext'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import AccountsPage from './pages/AccountsPage'
import AccountPage from './pages/AccountPage'
import IntakeTemplatesPage from './pages/IntakeTemplatesPage'
import ToggleServicePage from './pages/ToggleServicePage'
import ConfirmQuestionsPage from './pages/ConfirmQuestionsPage'

// Rendered inside AppProvider so it can read activeAccountId from context
function AppRoutes() {
  const { activeAccountId } = useAppStore()

  return (
    <Routes key={activeAccountId ?? 'none'}>
      <Route path="/accounts" element={<AccountsPage />} />
      <Route
        path="/"
        element={<Navigate to={activeAccountId ? '/account' : '/accounts'} replace />}
      />
      {activeAccountId ? (
        <>
          <Route path="/account"           element={<AccountPage />} />
          <Route path="/intake-templates"  element={<IntakeTemplatesPage />} />
          <Route path="/confirm-questions" element={<ConfirmQuestionsPage />} />
          <Route path="/toggle-service"    element={<ToggleServicePage />} />
        </>
      ) : (
        <Route path="*" element={<Navigate to="/accounts" replace />} />
      )}
    </Routes>
  )
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  if (!isAuthenticated) {
    return <LoginPage onLogin={() => setIsAuthenticated(true)} />
  }

  return (
    <AppProvider>
      <Layout>
        <AppRoutes />
      </Layout>
    </AppProvider>
  )
}
