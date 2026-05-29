import { Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './store/AppContext'
import { useAppStore } from './store/AppContext'
import Layout from './components/Layout'
import AccountsPage from './pages/AccountsPage'
import AccountPage from './pages/AccountPage'
import IntakeTemplatesPage from './pages/IntakeTemplatesPage'
import ToggleServicePage from './pages/ToggleServicePage'
import ConfirmQuestionsPage from './pages/ConfirmQuestionsPage'
import ContactsPage from './pages/ContactsPage'

// Rendered inside AppProvider so it can read activeAccountId from context
function AppRoutes() {
  const { activeAccountId } = useAppStore()

  return (
    <Routes key={activeAccountId ?? 'none'}>
      <Route path="/accounts" element={<AccountsPage />} />
      <Route path="/account/:id" element={<AccountPage />} />
      {activeAccountId ? (
        <>
          <Route path="/contacts"          element={<ContactsPage />} />
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
// export default function App() {
//   const [isAuthenticated, setIsAuthenticated] = useState(false)

//   if (!isAuthenticated) {
//     return <LoginPage onLogin={() => setIsAuthenticated(true)} />
//   }

//   return (
//     <AppProvider>
//       <Layout><AppRoutes /></Layout>
//     </AppProvider>
//   )
// }

//(bypass — login skipped):
export default function App() {
  return (
    <AppProvider>
      <Layout>
        <AppRoutes />
      </Layout>
    </AppProvider>
  )
}
