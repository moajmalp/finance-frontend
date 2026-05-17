import { useState, useEffect, useRef } from 'react'
import RootLayout from './layouts/RootLayout'
import Dashboard from './pages/Dashboard'
import AddTransaction from './pages/AddTransaction'
import Transactions from './pages/Transactions'
import SettingsPage from './pages/SettingsPage'
import LoginPage from './pages/LoginPage'
import Accounts from './pages/Accounts'
import Subscriptions from './pages/Subscriptions'
import Debts from './pages/Debts'
import Goals from './pages/Goals'
import Activity from './pages/Activity'
import Analytics from './pages/Analytics'
import Reports from './pages/Reports'
import Profile from './pages/Profile'
import Simulation from './pages/Simulation'
import Notifications from './pages/Notifications'
import AdminPanel from './pages/AdminPanel'
import { TransactionProvider, useTransactions } from './context/TransactionContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import { useTheme } from './context/ThemeContext'
import { AnimatePresence, motion } from 'framer-motion'
import { Home, List, PlusCircle, Settings, Wallet, Repeat, Target, History, BarChart2, FileText, Users, TrendingUp, ShieldAlert } from 'lucide-react'

function AppContent() {
  const isInitialMount = useRef(true)
  const { isPrivacyMode, setIsPrivacyMode, alerts } = useTransactions()
  const { isAuthenticated, loading, isImpersonating, logout, user } = useAuth()
  const { toggleTheme } = useTheme()

  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('activeTab') || 'dashboard'
  })

  // Persist activeTab to localStorage
  useEffect(() => {
    localStorage.setItem('activeTab', activeTab)
  }, [activeTab])

  // Global Shortcut: Ctrl/Cmd + Space (Privacy) | Shift + Space (Theme)
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
      const cmdKey = isMac ? e.metaKey : e.ctrlKey

      // Toggle Privacy Mode (Ctrl/Cmd + Space)
      if (cmdKey && e.code === 'Space') {
        e.preventDefault()
        setIsPrivacyMode(prev => !prev)
      }

      // Toggle Theme (Shift + Space)
      if (e.shiftKey && e.code === 'Space') {
        const activeElement = document.activeElement
        const isInput = activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA' || activeElement.isContentEditable

        if (!isInput) {
          e.preventDefault()
          toggleTheme()
        }
      }

      // Quick Add (Ctrl/Cmd + E)
      if (cmdKey && e.code === 'KeyE') {
        e.preventDefault()
        setActiveTab('add')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [setIsPrivacyMode, toggleTheme])

  // Redirect to dashboard on new login, but preserve tab on refresh
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (isAuthenticated) {
      setActiveTab('dashboard')
    }
  }, [isAuthenticated])

  if (loading) {
    return <div className="min-h-screen bg-background" />
  }

  if (!isAuthenticated) {
    return <LoginPage />
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />
      case 'add':
        return <AddTransaction onSuccess={() => setActiveTab('dashboard')} />
      case 'transactions':
        return <Transactions />
      case 'accounts':
        return <Accounts />
      case 'subscriptions':
        return <Subscriptions />
      case 'debts':
        return <Debts />
      case 'goals':
        return <Goals />
      case 'simulation':
        return <Simulation />
      case 'activity_log':
        return <Activity setActiveTab={setActiveTab} />
      case 'analytics':
        return <Analytics />
      case 'reports':
        return <Reports />
      case 'profile':
        return <Profile />
      case 'settings':
        return <SettingsPage />
      case 'notifications':
        return <Notifications />
      case 'admin':
        return <AdminPanel />
      default:
        return <Dashboard />
    }
  }

  const navItems = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'accounts', label: 'Vault', icon: Wallet },
    { id: 'analytics', label: 'Insights', icon: BarChart2 },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'subscriptions', label: 'Autopay', icon: Repeat },
    { id: 'debts', label: 'Splits', icon: Users },
    { id: 'goals', label: 'Targets', icon: Target },
    { id: 'simulation', label: 'Simulate', icon: TrendingUp },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  return (
    <>
      {/* Impersonation Mode Banner */}
      <AnimatePresence>
        {isImpersonating && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-50 bg-rose-500 text-white px-4 py-2 flex items-center justify-between shadow-lg"
          >
            <div className="flex items-center gap-2">
              <ShieldAlert size={18} className="animate-pulse" />
              <span className="text-sm font-semibold tracking-wide">
                IMPERSONATE MODE
              </span>
              <span className="text-sm opacity-90 hidden sm:inline">
                — You are currently viewing the dashboard of {user?.username}.
              </span>
            </div>
            <button
              onClick={() => logout()}
              className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-bold transition-all"
            >
              EXIT IMPERSONATION
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="h-screen w-full">
        <RootLayout
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenNotifications={() => setActiveTab('notifications')}
          unreadNotifications={alerts.filter(a => !a.read).length}
          navItems={navItems}
          isImpersonating={isImpersonating}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
          <PatternLockOverlay />
        </RootLayout>
      </div>
    </>
  )
}

import { Toaster } from 'react-hot-toast'
import { SecurityProvider } from './context/SecurityContext'
import PatternLockOverlay from './components/security/PatternLockOverlay'
import VersionCheck from './components/VersionCheck'

function App() {
  return (
    <AuthProvider>
      <SecurityProvider>
        <TransactionProvider>
          <AppContent />
          <VersionCheck />
          <Toaster position="top-right" reverseOrder={false} />
        </TransactionProvider>
      </SecurityProvider>
    </AuthProvider>
  )
}

export default App
