import { createContext, useContext, useState, useEffect, useMemo } from 'react'
import api from '../services/api'
import { useAuth } from './AuthContext'
import toast from 'react-hot-toast'

const TransactionContext = createContext()

export const useTransactions = () => useContext(TransactionContext)

const STORAGE_KEYS = {
    // Legacy keys kept for settings/auth
    ALERTS: 'finance_alerts_v2',
    AUTH: 'finance_auth_v2',
    LOGS: 'finance_logs_v2',
    PRIVACY: 'finance_privacy_mode',
    CURRENCY: 'finance_currency',
    TIMEZONE: 'finance_timezone',
    SUB_KEYWORDS: 'finance_sub_keywords_v2',
    CATEGORIES: 'finance_categories_v2',
    BUDGETS: 'finance_budgets_v2'
}


const getSafeStorage = (key, defaultValue) => {
    try {
        const item = localStorage.getItem(key)
        return item ? JSON.parse(item) : defaultValue
    } catch (e) {
        console.error(`Error loading state for ${key}:`, e)
        return defaultValue
    }
}

const DEFAULT_CATEGORIES = {
    EXPENSE: ['Food', 'Rent', 'Transport', 'Entertainment', 'Shopping', 'Health', 'Bills', 'Subscriptions', 'Other'],
    INCOME: ['Salary', 'Freelance', 'Investment', 'Gift', 'Other']
}

const DEFAULT_SUB_KEYWORDS = ['Netflix', 'Spotify', 'Youtube', 'Prime', 'Hotstar', 'Gym', 'Wifi', 'Rent']

export const TransactionProvider = ({ children }) => {
    // Persistent State initialization
    const [transactions, setTransactions] = useState([])
    const [accounts, setAccounts] = useState([])
    const [categories, setCategories] = useState(DEFAULT_CATEGORIES)
    const [budgets, setBudgets] = useState(() => getSafeStorage(STORAGE_KEYS.BUDGETS, {}))
    const [subscriptions, setSubscriptions] = useState([])
    const [debts, setDebts] = useState([])
    const [alerts, setAlerts] = useState(() => getSafeStorage(STORAGE_KEYS.ALERTS, []))
    const [isPrivacyMode, setIsPrivacyMode] = useState(() => getSafeStorage(STORAGE_KEYS.PRIVACY, false))
    const [currency, setCurrencyState] = useState('INR')
    
    // Wrapper to persist currency
    const setCurrency = async (newCurrency) => {
        setCurrencyState(newCurrency)
        try {
            await api.updateUserConfig({ currency: newCurrency })
        } catch (e) {
            console.error("Failed to persist currency change", e)
        }
    }
    const [timezone, setTimezoneState] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone)
    const setTimezone = async (newTimezone) => {
        setTimezoneState(newTimezone)
        try {
            await api.updateUserConfig({ timezone: newTimezone })
        } catch (e) {
            console.error("Failed to persist timezone change", e)
        }
    }
    const [subscriptionKeywords, setSubscriptionKeywords] = useState(DEFAULT_SUB_KEYWORDS)
    const [goals, setGoals] = useState([])

    // Budget alert control flags
    const [enableBudgetAlerts, setEnableBudgetAlerts] = useState(true)
    const [enableEmailBudgetAlerts, setEnableEmailBudgetAlerts] = useState(false)

    // Track which categories have already fired alerts for the current month
    const [budgetAlertState, setBudgetAlertState] = useState({})

    // Track bill reminders sent per day (subscriptions, debts, goals)
    const [billReminderState, setBillReminderState] = useState({})

    const currencySymbol = currency === 'USD' ? '$' : '₹'


    const { isAuthenticated, user, logout, updateUserCredentials = () => Promise.resolve(false), updateUserProfile = () => Promise.resolve(false) } = useAuth()

    const [activityLog, setActivityLog] = useState(() => getSafeStorage(STORAGE_KEYS.LOGS, []))
    const [insights, setInsights] = useState([])
    const [lastDeleted, setLastDeleted] = useState(null)

    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))

    const logActivity = (type, details) => {
        const newLog = {
            id: Date.now(),
            type,
            details,
            date: new Date().toISOString()
        }
        setActivityLog(prev => [newLog, ...prev])
    }

    // Initial Data Fetch
    useEffect(() => {
        if (!isAuthenticated) {
            // Clear data if not authenticated
            setAccounts([])
            setTransactions([])
            setSubscriptions([])
            setDebts([])
            setGoals([])
            return
        }

        const loadData = async () => {
            try {
                const [vaultsData, txData, subsData, debtsData, goalsData, configData] = await Promise.all([
                    api.fetchVaults(),
                    api.fetchTransactions(),
                    api.fetchActiveSubscriptions(),
                    api.fetchPendingDebts(),
                    api.fetchGoals(),
                    api.fetchUserConfig()
                ])

                setAccounts(vaultsData)
                setTransactions(txData)
                setSubscriptions(subsData)
                setDebts(debtsData)
                setGoals(goalsData.map(goal => ({
                    ...goal,
                    targetAmount: goal.target_amount ?? goal.targetAmount,
                    currentAmount: goal.current_amount ?? goal.currentAmount,
                    accountId: goal.account_id ?? goal.accountId,
                })))

                if (configData) {
                    const backendCurrency = configData.currency || 'INR'
                    setCurrencyState(backendCurrency)
                    setTimezoneState(configData.timezone || 'UTC')
                    setIsPrivacyMode(configData.is_privacy_mode || false)
                    if (configData.categories) {
                        const normalizedCategories = {}
                        Object.entries(configData.categories).forEach(([key, value]) => {
                            normalizedCategories[key.toUpperCase()] = value
                        })
                        setCategories(normalizedCategories)
                    }
                    if (configData.subscription_keywords) setSubscriptionKeywords(configData.subscription_keywords)
                    if (configData.monthly_spending_limits) setBudgets(configData.monthly_spending_limits)
                }
            } catch (error) {
                console.error("Failed to fetch initial data:", error)
            }
        }
        loadData()
    }, [isAuthenticated])

    // Dynamic Balance Calculation
    const calculateBalance = (accountId) => {
        const account = accounts.find(acc => acc.id === accountId)
        if (!account) return 0

        const netTransactions = transactions
            .filter(t => t.account_id === accountId)
            .reduce((sum, t) => {
                const amount = parseFloat(t.amount) || 0
                if (t.type === 'INCOME') return sum + amount
                if (t.type === 'EXPENSE') return sum - amount
                return sum
            }, 0)

        // snake_case initial_balance
        return (parseFloat(account.initial_balance) || 0) + netTransactions
    }

    // Totals calculation using dynamic balances
    const totals = useMemo(() => {
        const currentMonthTransactions = transactions.filter(t => t.date.startsWith(selectedMonth))

        const income = currentMonthTransactions
            .filter(t => t.type === 'INCOME')
            .reduce((acc, t) => acc + (parseFloat(t.amount) || 0), 0)

        const expenses = currentMonthTransactions
            .filter(t => t.type === 'EXPENSE')
            .reduce((acc, t) => acc + (parseFloat(t.amount) || 0), 0)

        const balance = accounts.reduce((acc, curr) => acc + (calculateBalance(curr.id) || 0), 0)

        const liabilities = accounts
            .filter(acc => acc.type === 'CREDIT_CARD')
            .reduce((acc, curr) => {
                const bal = calculateBalance(curr.id) || 0
                return acc + (bal < 0 ? Math.abs(bal) : 0)
            }, 0)

        return {
            balance: balance || 0,
            income: income || 0,
            expenses: expenses || 0,
            netWorthDelta: (income || 0) - (expenses || 0),
            liabilities: liabilities || 0
        }
    }, [transactions, accounts, selectedMonth])

    // Sync UI prefs to LocalStorage
    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories))
        localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets))
        localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alerts))
        localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(activityLog))
        localStorage.setItem(STORAGE_KEYS.PRIVACY, JSON.stringify(isPrivacyMode))
        localStorage.setItem(STORAGE_KEYS.CURRENCY, JSON.stringify(currency))
        localStorage.setItem(STORAGE_KEYS.TIMEZONE, JSON.stringify(timezone))
        localStorage.setItem(STORAGE_KEYS.SUB_KEYWORDS, JSON.stringify(subscriptionKeywords))
    }, [categories, budgets, alerts, activityLog, isPrivacyMode, currency, timezone, subscriptionKeywords])

    // Reset budget alert state when month changes
    useEffect(() => {
        setBudgetAlertState({})
    }, [selectedMonth])

    // Budget alert watcher
    useEffect(() => {
        if (!enableBudgetAlerts) return
        if (!transactions.length) return

        const currentMonthTransactions = transactions.filter(t => t.date && t.date.startsWith(selectedMonth))

        const byCategory = currentMonthTransactions.reduce((acc, t) => {
            const cat = t.category || 'Uncategorized'
            const amount = parseFloat(t.amount) || 0
            if (!acc[cat]) acc[cat] = 0
            if (t.type === 'EXPENSE') {
                acc[cat] += amount
            }
            return acc
        }, {})

        Object.entries(budgets).forEach(([category, limit]) => {
            const numericLimit = parseFloat(limit)
            if (!numericLimit || numericLimit <= 0) return

            const spent = byCategory[category] || 0
            if (spent <= 0) return

            const utilization = spent / numericLimit

            const stateKey = `${selectedMonth}:${category}`
            const state = budgetAlertState[stateKey] || { approaching: false, exceeded: false }

            // Approaching threshold (e.g. 80%)
            if (utilization >= 0.8 && utilization < 1 && !state.approaching) {
                const message = `You're approaching your ${category} budget: ${currencySymbol}${spent.toFixed(2)} of ${currencySymbol}${numericLimit.toFixed(2)}`
                addAlert(message, 'warning')
                toast((t) => (
                    <div className="text-sm">
                        <div className="font-bold mb-1">Budget Approaching</div>
                        <div>{message}</div>
                    </div>
                ), { id: `budget-${stateKey}-approaching` })

                setBudgetAlertState(prev => ({
                    ...prev,
                    [stateKey]: { ...prev[stateKey], approaching: true }
                }))

                if (enableEmailBudgetAlerts && isAuthenticated && user?.email) {
                    // Fire and forget; errors are logged in api layer or console
                    api.sendBudgetAlertEmail?.({
                        category,
                        month: selectedMonth,
                        spent,
                        limit: numericLimit,
                        level: 'approaching'
                    }).catch(() => { })
                }
            }

            // Exceeded threshold
            if (utilization >= 1 && !state.exceeded) {
                const message = `You've exceeded your ${category} budget: ${currencySymbol}${spent.toFixed(2)} of ${currencySymbol}${numericLimit.toFixed(2)}`
                addAlert(message, 'danger')
                toast.error(message, { id: `budget-${stateKey}-exceeded` })

                setBudgetAlertState(prev => ({
                    ...prev,
                    [stateKey]: { ...prev[stateKey], exceeded: true }
                }))

                if (enableEmailBudgetAlerts && isAuthenticated && user?.email) {
                    api.sendBudgetAlertEmail?.({
                        category,
                        month: selectedMonth,
                        spent,
                        limit: numericLimit,
                        level: 'exceeded'
                    }).catch(() => { })
                }
            }
        })
    }, [transactions, budgets, selectedMonth, enableBudgetAlerts, enableEmailBudgetAlerts, currencySymbol, budgetAlertState, isAuthenticated, user])

    // Bill reminders: subscriptions (next_billing), debts (due_date), goals (deadline)
    useEffect(() => {
        if (!subscriptions.length && !debts.length && !goals.length) return

        const today = new Date()
        const todayStr = today.toISOString().split('T')[0]
        const todayMidnight = new Date(todayStr)
        const msPerDay = 1000 * 60 * 60 * 24

        const getDiffDays = (dateStr) => {
            if (!dateStr) return null
            const target = new Date(dateStr)
            if (Number.isNaN(target.getTime())) return null
            const diff = (target - todayMidnight) / msPerDay
            return Math.round(diff)
        }

        const maybeNotify = (key, message, severity = 'info') => {
            const stateKey = `${todayStr}:${key}`
            if (billReminderState[stateKey]) return

            addAlert(message, severity)
            if (severity === 'danger') {
                toast.error(message)
            } else {
                toast(message)
            }

            setBillReminderState(prev => ({
                ...prev,
                [stateKey]: true
            }))
        }

        // Upcoming subscription renewals
        subscriptions.forEach(sub => {
            if (!sub.is_active) return
            const diffDays = getDiffDays(sub.next_billing)
            if (diffDays === null) return
            if (diffDays < 0 || diffDays > 7) return

            let descriptor = ''
            let severity = 'info'
            if (diffDays === 0) {
                descriptor = 'today'
                severity = 'danger'
            } else if (diffDays === 1) {
                descriptor = 'tomorrow'
                severity = 'warning'
            } else {
                descriptor = `in ${diffDays} days`
            }

            const message = `Subscription ${sub.name} (${currencySymbol}${parseFloat(sub.amount || 0).toFixed(2)}) is due ${descriptor}.`
            maybeNotify(`sub:${sub.id}`, message, severity)
        })

        // Upcoming debt due dates (only pending debts)
        debts.forEach(debt => {
            if (debt.is_settled) return
            const diffDays = getDiffDays(debt.due_date)
            if (diffDays === null) return
            if (diffDays < 0 || diffDays > 7) return

            let descriptor = ''
            let severity = 'info'
            if (diffDays === 0) {
                descriptor = 'today'
                severity = 'danger'
            } else if (diffDays === 1) {
                descriptor = 'tomorrow'
                severity = 'warning'
            } else {
                descriptor = `in ${diffDays} days`
            }

            const message = `Debt with ${debt.person_name} (${currencySymbol}${parseFloat(debt.amount || 0).toFixed(2)}) is due ${descriptor}.`
            maybeNotify(`debt:${debt.id}`, message, severity)
        })

        // Upcoming goal deadlines
        goals.forEach(goal => {
            if (!goal.deadline) return
            const diffDays = getDiffDays(goal.deadline)
            if (diffDays === null) return
            if (diffDays < 0 || diffDays > 7) return

            let descriptor = ''
            let severity = 'info'
            if (diffDays === 0) {
                descriptor = 'today'
                severity = 'danger'
            } else if (diffDays === 1) {
                descriptor = 'tomorrow'
                severity = 'warning'
            } else {
                descriptor = `in ${diffDays} days`
            }

            const message = `Goal "${goal.name}" deadline is ${descriptor}.`
            maybeNotify(`goal:${goal.id}`, message, severity)
        })
    }, [subscriptions, debts, goals, currencySymbol, billReminderState])

    // Actions
    const addAccount = async (account) => {
        try {
            const payload = {
                name: account.name,
                type: account.type,
                initial_balance: parseFloat(account.initialBalance),
                color: account.color,
                fluidity_score: 0.65
            }
            const newVault = await api.createVault(payload)
            setAccounts(prev => [...prev, newVault]) // Ideally refetch or update state
            logActivity('Account Created', `New vault: ${newVault.name}`)
            toast.success(`Vault '${newVault.name}' created`)
            return newVault
        } catch (error) {
            console.error("Failed to create vault:", error.response?.data || error.message)
            toast.error(`Creation failed: ${error.response?.data?.detail || 'Server error'}`)
            throw error
        }
    }

    const deleteAccount = async (id) => {
        try {
            await api.deleteVault(id)
            setAccounts(prev => prev.filter(a => a.id !== id))
            logActivity('Vault Decommissioned', `Vault removed from system`)
            toast.success('Vault deleted successfully')
        } catch (e) {
            console.error("Failed to delete vault", e)
            toast.error('Failed to delete vault')
        }
    }

    const updateAccount = async (id, updatedData) => {
        try {
            // Map camelCase to snake_case if necessary
            const payload = { ...updatedData }
            if (payload.initialBalance) { payload.initial_balance = parseFloat(payload.initialBalance); delete payload.initialBalance }
            
            const updated = await api.updateVault(id, payload)
            setAccounts(prev => prev.map(a => a.id === id ? updated : a))
            logActivity('Vault Updated', `Changes applied to ${updated.name}`)
            toast.success('Vault updated successfully')
            return updated
        } catch (e) {
            console.error("Failed to update vault", e)
            toast.error('Failed to update vault')
            throw e
        }
    }

    const addTransaction = async (transaction) => {
        const payload = {
            amount: parseFloat(transaction.amount),
            type: transaction.type,
            category: transaction.category,
            account_id: transaction.accountId || transaction.account_id,
            date: transaction.date,
            note: transaction.note,
            is_split: transaction.isSplit || false,
            split_amount: transaction.splitAmount || null,
            split_with: transaction.splitWith || null,
            receipt_url: transaction.receiptUrl || null
        }
        const newTx = await api.createTransaction(payload)
        setTransactions(prev => [newTx, ...prev])

        logActivity(
            newTx.type === 'INCOME' ? 'Income Received' : 'Expense Logged',
            `${newTx.category}: ${currencySymbol}${newTx.amount}`
        )

        if (payload.is_split && payload.split_amount) {
            await addDebt({
                person_name: payload.split_with || 'Someone',
                amount: payload.split_amount,
                type: 'OWED_TO_ME',
                note: `Split for ${payload.category}`,
                transaction_id: newTx.id
            })
        }
        return newTx
    }

    // Double-Entry Transfers
    const addTransfer = async (fromId, toId, amount, date) => {
        const isoDate = date ? new Date(date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
        try {
            // Out
            await addTransaction({
                amount: parseFloat(amount),
                type: 'EXPENSE',
                category: 'Transfer',
                accountId: fromId,
                date: isoDate,
                note: 'Outbound Transfer'
            })
            // In
            await addTransaction({
                amount: parseFloat(amount),
                type: 'INCOME',
                category: 'Transfer',
                accountId: toId,
                date: isoDate,
                note: 'Inbound Transfer'
            })
            logActivity('Internal Transfer', `${currencySymbol}${amount} moved between vaults`)
        } catch (e) {
            console.error("Transfer failed", e)
        }
    }

    const addSubscription = async (sub) => {
        try {
            const payload = {
                name: sub.name,
                amount: parseFloat(sub.amount),
                frequency: sub.frequency,
                category: sub.category,
                account_id: sub.accountId || sub.account_id,
                next_billing: sub.nextBilling || sub.next_billing,
                auto_renewal: sub.autoRenewal || true,
                is_active: sub.active !== undefined ? sub.active : true
            }
            const newSub = await api.createSubscription(payload)
            setSubscriptions(prev => [...prev, newSub])
            logActivity('Subscription Added', `${newSub.name}: ${currencySymbol}${newSub.amount}/${newSub.frequency}`)
        } catch (e) {
            console.error("Failed to add subscription", e)
        }
    }

    const deleteSubscription = async (id) => {
        try {
            await api.deleteSubscription(id)
            setSubscriptions(prev => prev.filter(s => s.id !== id))
            logActivity('Subscription Deleted', `Subscription removed from registry`)
        } catch (e) {
            console.error("Failed to delete subscription", e)
        }
    }

    const updateSubscription = async (id, updatedData) => {
        try {
            const payload = { ...updatedData }
            if (payload.accountId) { payload.account_id = payload.accountId; delete payload.accountId }
            if (payload.nextBilling) { payload.next_billing = payload.nextBilling; delete payload.nextBilling }
            if (payload.autoRenewal !== undefined) { payload.auto_renewal = payload.autoRenewal; delete payload.autoRenewal }

            const updated = await api.updateSubscription(id, payload)
            setSubscriptions(prev => prev.map(s => s.id === id ? updated : s))
            logActivity('Subscription Updated', `Updated ${updated.name}`)
            return updated
        } catch (e) {
            console.error("Failed to update subscription", e)
            throw e
        }
    }

    const addDebt = async (debt) => {
        try {
            const payload = {
                person_name: debt.person || debt.person_name,
                amount: parseFloat(debt.amount),
                type: debt.type,
                due_date: debt.date || debt.due_date,
                is_settled: false,
                note: debt.note || '',
                transaction_id: debt.transaction_id || null
            }
            const newDebt = await api.createDebt(payload)
            setDebts(prev => [...prev, newDebt])
            logActivity('Debt Recorded', `${newDebt.person_name}: ${currencySymbol}${newDebt.amount}`)
        } catch (e) {
            console.error("Failed to add debt", e)
        }
    }

    const deleteDebt = async (id) => {
        try {
            await api.deleteDebt(id)
            setDebts(prev => prev.filter(d => d.id !== id))
            logActivity('Debt Deleted', `Debt record cleared`)
        } catch (e) {
            console.error("Failed to delete debt", e)
        }
    }

    const settleDebt = async (id) => {
        try {
            await api.updateDebt(id, { is_settled: true })
            setDebts(prev => prev.map(d => d.id === id ? { ...d, is_settled: true } : d))
            logActivity('Debt Settled', 'Repayment confirmed')
        } catch (e) {
            console.error("Failed to settle debt", e)
        }
    }

    const deleteTransaction = async (id) => {
        try {
            await api.deleteTransaction(id)
            setTransactions(prev => prev.filter(t => t.id !== id))
            logActivity('Transaction Deleted', `Record removed`)
            // Logic for Last Deleted if needed for undo... difficult with API but can cache locally
        } catch (e) {
            console.error("Failed to delete transaction", e)
        }
    }

    const undoDelete = () => {
        // Undo implementation with API is complex - requires restoring deleted ID? 
        // Or re-creating. For now, leave empty or alert unavailable.
        alert("Undo not yet implemented with live API")
    }

    const updateTransaction = async (id, updatedData) => {
        try {
            // UpdatedData keys need to match backend snake_case
            // Map common camelCase to snake_case if necessary
            const payload = { ...updatedData }
            if ('accountId' in payload) { payload.account_id = payload.accountId; delete payload.accountId }
            if ('receiptUrl' in payload) { payload.receipt_url = payload.receiptUrl; delete payload.receiptUrl }

            const updated = await api.updateTransaction(id, payload)
            setTransactions(prev => prev.map(t => t.id === id ? updated : t))
            logActivity('Transaction Updated', `Modifications applied`)
        } catch (e) {
            console.error("Failed to update transaction", e)
        }
    }

    // Goal Actions
    const addGoal = async (goal) => {
        const payload = {
            name: goal.name,
            target_amount: parseFloat(goal.targetAmount || goal.target_amount),
            current_amount: parseFloat(goal.currentAmount || goal.current_amount || 0),
            deadline: goal.deadline,
            account_id: goal.accountId || goal.account_id,
            icon: goal.icon || 'Target'
        }
        const newGoal = await api.createGoal(payload)
        setGoals(prev => [...prev, newGoal])
        logActivity('Goal Set', `New target: ${newGoal.name}`)
        toast.success(`Goal '${newGoal.name}' set`)
        return newGoal
    }

    const deleteGoal = async (id) => {
        try {
            await api.deleteGoal(id)
            setGoals(prev => prev.filter(g => g.id !== id))
            logActivity('Goal Deleted', 'Milestone removed')
        } catch (e) {
            console.error("Failed to delete goal", e)
        }
    }

    const updateGoal = async (id, updatedData) => {
        try {
            const payload = { ...updatedData }
            // Mapping
            if (payload.targetAmount) { payload.target_amount = payload.targetAmount; delete payload.targetAmount }
            if (payload.currentAmount) { payload.current_amount = payload.currentAmount; delete payload.currentAmount }
            if (payload.accountId) { payload.account_id = payload.accountId; delete payload.accountId }

            const result = await api.updateGoal(id, payload)
            setGoals(prev => prev.map(g => g.id === id ? result : g))
        } catch (e) {
            console.error("Failed to update goal", e)
        }
    }

    // Forecasting Logic (Client-side mainly, using local state)
    const predictFutureBalance = (days = 30) => {
        let currentBal = totals.balance
        const forecast = []
        const today = new Date()

        for (let i = 0; i <= days; i++) {
            const date = new Date(today)
            date.setDate(today.getDate() + i)
            const dateStr = date.toISOString().split('T')[0]

            subscriptions.forEach(sub => {
                if (!sub.is_active) return
                const billingDate = new Date(sub.next_billing)
                if (billingDate.getDate() === date.getDate()) {
                    currentBal -= sub.amount
                }
            })

            forecast.push({
                date: dateStr,
                balance: currentBal
            })
        }
        return forecast
    }

    const setBudget = (category, amount) => {
        setBudgets(prev => {
            const nextBudgets = { ...prev, [category]: amount }
            api.updateUserConfig({ monthly_spending_limits: nextBudgets }).catch((e) => {
                console.error("Failed to persist budget change", e)
            })
            return nextBudgets
        })
    }

    const addAlert = (message, type = 'info') => {
        const newAlert = { id: Date.now(), message, type, date: new Date().toISOString(), read: false }
        setAlerts(prev => [newAlert, ...prev])
    }

    const markAlertRead = (id) => {
        setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a))
    }

    const clearAlerts = () => {
        setAlerts([])
    }

    const addSubscriptionKeyword = async (keyword) => {
        if (!subscriptionKeywords.includes(keyword)) {
            const newKeywords = [...subscriptionKeywords, keyword]
            setSubscriptionKeywords(newKeywords)
            logActivity('Configuration Updated', `Added '${keyword}' to subscription detector`)
            try {
                await api.updateUserConfig({ subscription_keywords: newKeywords })
            } catch (e) {
                console.error("Failed to persist subscription keyword", e)
            }
        }
    }

    const addCategory = async (type, name) => {
        const upType = type.toUpperCase()
        const newTypeCategories = [...(categories[upType] || []), name]
        const newCategories = {
            ...categories,
            [upType]: newTypeCategories
        }
        setCategories(newCategories)
        logActivity('Configuration Updated', `New ${type} category: ${name}`)
        try {
            await api.updateUserConfig({ categories: newCategories })
        } catch (e) {
            console.error("Failed to persist new category", e)
        }
    }

    const deleteCategory = async (type, name) => {
        const upType = type.toUpperCase()
        const newTypeCategories = (categories[upType] || []).filter(c => c !== name)
        const newCategories = {
            ...categories,
            [upType]: newTypeCategories
        }
        setCategories(newCategories)
        logActivity('Configuration Updated', `Removed ${type} category: ${name}`)
        try {
            await api.updateUserConfig({ categories: newCategories })
        } catch (e) {
            console.error("Failed to persist category deletion", e)
        }
    }

    const deleteSubscriptionKeyword = async (keyword) => {
        const newKeywords = subscriptionKeywords.filter(k => k !== keyword)
        setSubscriptionKeywords(newKeywords)
        logActivity('Configuration Updated', `Removed '${keyword}' from subscription detector`)
        try {
            await api.updateUserConfig({ subscription_keywords: newKeywords })
        } catch (e) {
            console.error("Failed to persist keyword deletion", e)
        }
    }

    return (
        <TransactionContext.Provider value={{
            transactions,
            accounts,
            categories,
            budgets,
            subscriptions,
            debts,
            alerts,
            ...totals,
            isPrivacyMode,
            setIsPrivacyMode,
            currency,
            setCurrency,
            currencySymbol,
            timezone,
            setTimezone,
            selectedMonth,
            setSelectedMonth,
            calculateBalance,
            addTransaction,
            updateTransaction,
            deleteTransaction,
            addTransfer,
            addAccount,
            updateAccount,
            deleteAccount,
            addSubscription,
            updateSubscription,
            deleteSubscription,
            addDebt,
            deleteDebt,
            settleDebt,
            predictFutureBalance,
            setBudget,
            markAlertRead,
            clearAlerts,
            updateUserCredentials,
            updateUserProfile,
            addGoal,
            deleteGoal,
            updateGoal,
            undoDelete,
            goals,
            activityLog,
            insights,
            isAuthenticated,
            user,
            setCategories,
            addCategory,
            deleteCategory,
            setAccounts,
            subscriptionKeywords,
            addSubscriptionKeyword,
            deleteSubscriptionKeyword,
            enableBudgetAlerts,
            setEnableBudgetAlerts,
            enableEmailBudgetAlerts,
            setEnableEmailBudgetAlerts,
            logout
        }}>
            {children}
        </TransactionContext.Provider>
    )
}
