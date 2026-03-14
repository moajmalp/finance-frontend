import { useState, useEffect } from 'react'
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
import { TransactionProvider, useTransactions } from './context/TransactionContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import { useTheme } from './context/ThemeContext'
import { AnimatePresence, motion } from 'framer-motion'
import { Home, List, PlusCircle, Settings, Wallet, Repeat, Target, History, BarChart2, FileText, Users, TrendingUp } from 'lucide-react'

function AppContent() {
  const { isPrivacyMode, setIsPrivacyMode, alerts } = useTransactions()
  const { isAuthenticated } = useAuth()
  const { toggleTheme } = useTheme()

  const [activeTab, setActiveTab] = useState('dashboard')

  // Global Shortcut: Ctrl + Space (Privacy) | Shift + Space (Theme)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Toggle Privacy Mode (Ctrl + Space)
      if (e.ctrlKey && e.code === 'Space') {
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

      // Quick Add (Ctrl + E)
      if (e.ctrlKey && e.code === 'KeyE') {
        e.preventDefault()
        setActiveTab('add')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [setIsPrivacyMode, toggleTheme])

  // Reset to dashboard on login
  useEffect(() => {
    if (isAuthenticated) {
      setActiveTab('dashboard')
    }
  }, [isAuthenticated])

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
    <RootLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      onOpenNotifications={() => setActiveTab('notifications')}
      unreadNotifications={alerts.filter(a => !a.read).length}
      navItems={navItems}
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
    </RootLayout>
  )
}

import { Toaster } from 'react-hot-toast'

function App() {
  return (
    <AuthProvider>
      <TransactionProvider>
        <AppContent />
        <Toaster position="top-right" reverseOrder={false} />
      </TransactionProvider>
    </AuthProvider>
  )
}

export default App
