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
import ContactsPage from './pages/ContactsPage'
import TransferRulesPage from './pages/TransferRulesPage'
import LeadsPage from './pages/LeadsPage'
import LeadDetailPage from './pages/LeadDetailPage'

// Rendered inside AppProvider so it can read activeAccountId from context
function AppRoutes() {
  const { activeAccountId } = useAppStore()

  return (
    <Routes key={activeAccountId ?? 'none'}>
      <Route path="/accounts" element={<AccountsPage />} />
      <Route path="/account/:id" element={<AccountPage />} />
      {activeAccountId ? (
        <>
          <Route path="/leads"             element={<LeadsPage />} />
          <Route path="/leads/:id"         element={<LeadDetailPage />} />
          <Route path="/contacts"          element={<ContactsPage />} />
          <Route path="/transfer-rules"    element={<TransferRulesPage />} />
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

// // ORIGINAL (with login gate):
export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  if (!isAuthenticated) {
    return <LoginPage onLogin={() => setIsAuthenticated(true)} />
  }

  return (
    <AppProvider>
      <Layout><AppRoutes /></Layout>
    </AppProvider>
  )
}

//(bypass — login skipped):
// export default function App() {
//   return (
//     <AppProvider>
//       <Layout>
//         <AppRoutes />
//       </Layout>
//     </AppProvider>
//   )
// }
