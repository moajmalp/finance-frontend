import { createContext, useContext, useState, useEffect, useMemo } from 'react'

/**
 * @typedef {Object} Transaction
 * @property {string|number} id
 * @property {'income'|'expense'|'transfer'} type
 * @property {string} category
 * @property {number} amount
 * @property {string} accountId
 * @property {string} date - ISO 8601 Format
 * @property {string} [note]
 * @property {string} [transferId] - Linked ID for double-entry transfers
 * @property {string} [receiptUrl] - Mock URL for receipt images
 * @property {boolean} [isSplit]
 */

/**
 * @typedef {Object} Account
 * @property {string} id
 * @property {string} name
 * @property {'bank'|'cash'|'credit_card'|'vault'} type
 * @property {number} initialBalance
 * @property {string} color
 */

/**
 * @typedef {Object} Subscription
 * @property {string} id
 * @property {string} name
 * @property {number} amount
 * @property {'monthly'|'yearly'} frequency
 * @property {string} category
 * @property {string} accountId
 * @property {string} nextBilling - ISO Date
 * @property {boolean} active
 */

/**
 * @typedef {Object} Debt
 * @property {string} id
 * @property {string} person
 * @property {number} amount
 * @property {'owed_to_me'|'i_owe'} type
 * @property {string} date - ISO Date
 * @property {string} [note]
 * @property {boolean} settled
 */

const TransactionContext = createContext()

export const useTransactions = () => useContext(TransactionContext)

const STORAGE_KEYS = {
    TRANSACTIONS: 'finance_transactions_v2',
    ACCOUNTS: 'finance_accounts_v2',
    CATEGORIES: 'finance_categories_v2',
    BUDGETS: 'finance_budgets_v2',
    SUBSCRIPTIONS: 'finance_subscriptions_v2',
    DEBTS: 'finance_debts_v2',
    ALERTS: 'finance_alerts_v2',
    AUTH: 'finance_auth_v2',
    GOALS: 'finance_goals_v2',
    LOGS: 'finance_logs_v2',
    PRIVACY: 'finance_privacy_mode',
    CURRENCY: 'finance_currency',
    TIMEZONE: 'finance_timezone'
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

const DEFAULT_ACCOUNTS = [
    { id: 'acc_1', name: 'Main Bank', type: 'bank', initialBalance: 5000, color: 'bg-indigo-500' },
    { id: 'acc_2', name: 'Cash Wallet', type: 'cash', initialBalance: 200, color: 'bg-emerald-500' },
    { id: 'acc_3', name: 'Credit Card', type: 'credit_card', initialBalance: 0, color: 'bg-rose-500' }
]

const DEFAULT_CATEGORIES = {
    expense: ['Food', 'Rent', 'Transport', 'Entertainment', 'Shopping', 'Health', 'Bills', 'Subscriptions', 'Other'],
    income: ['Salary', 'Freelance', 'Investment', 'Gift', 'Other']
}

export const TransactionProvider = ({ children }) => {
    // Persistent State initialization
    const [transactions, setTransactions] = useState(() => getSafeStorage(STORAGE_KEYS.TRANSACTIONS, []))
    const [accounts, setAccounts] = useState(() => getSafeStorage(STORAGE_KEYS.ACCOUNTS, DEFAULT_ACCOUNTS))
    const [categories, setCategories] = useState(() => getSafeStorage(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES))
    const [budgets, setBudgets] = useState(() => getSafeStorage(STORAGE_KEYS.BUDGETS, {}))
    const [subscriptions, setSubscriptions] = useState(() => getSafeStorage(STORAGE_KEYS.SUBSCRIPTIONS, []))
    const [debts, setDebts] = useState(() => getSafeStorage(STORAGE_KEYS.DEBTS, []))
    const [alerts, setAlerts] = useState(() => getSafeStorage(STORAGE_KEYS.ALERTS, []))
    const [isPrivacyMode, setIsPrivacyMode] = useState(() => getSafeStorage(STORAGE_KEYS.PRIVACY, false))
    const [currency, setCurrency] = useState(() => getSafeStorage(STORAGE_KEYS.CURRENCY, 'INR'))
    const [timezone, setTimezone] = useState(() => getSafeStorage(STORAGE_KEYS.TIMEZONE, Intl.DateTimeFormat().resolvedOptions().timeZone))

    const currencySymbol = useMemo(() => currency === 'INR' ? '₹' : '$', [currency])

    const [authData, setAuthData] = useState(() => {
        const defaultAuth = {
            isAuthenticated: false,
            user: null,
            credentials: { username: 'demo', password: 'demo123' }
        }
        const saved = getSafeStorage(STORAGE_KEYS.AUTH, defaultAuth)
        return { ...defaultAuth, ...saved }
    })

    const isAuthenticated = authData.isAuthenticated
    const user = authData.user

    const [goals, setGoals] = useState(() => getSafeStorage(STORAGE_KEYS.GOALS, []))
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

    // Dynamic Balance Calculation
    const calculateBalance = (accountId) => {
        const account = accounts.find(acc => acc.id === accountId)
        if (!account) return 0

        const netTransactions = transactions
            .filter(t => t.accountId === accountId)
            .reduce((sum, t) => {
                const amount = parseFloat(t.amount) || 0
                if (t.type === 'income') return sum + amount
                if (t.type === 'expense') return sum - amount
                return sum
            }, 0)

        return (parseFloat(account.initialBalance) || 0) + netTransactions
    }

    // Totals calculation using dynamic balances
    const totals = useMemo(() => {
        const currentMonthTransactions = transactions.filter(t => t.date.startsWith(selectedMonth))

        const income = currentMonthTransactions
            .filter(t => t.type === 'income')
            .reduce((acc, t) => acc + (parseFloat(t.amount) || 0), 0)

        const expenses = currentMonthTransactions
            .filter(t => t.type === 'expense')
            .reduce((acc, t) => acc + (parseFloat(t.amount) || 0), 0)

        const balance = accounts.reduce((acc, curr) => acc + (calculateBalance(curr.id) || 0), 0)

        const liabilities = accounts
            .filter(acc => acc.type === 'credit_card')
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

    // Sync to LocalStorage
    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions))
        localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts))
        localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories))
        localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets))
        localStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(subscriptions))
        localStorage.setItem(STORAGE_KEYS.DEBTS, JSON.stringify(debts))
        localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alerts))
        localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals))
        localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(activityLog))
        localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(authData))
        localStorage.setItem(STORAGE_KEYS.PRIVACY, JSON.stringify(isPrivacyMode))
        localStorage.setItem(STORAGE_KEYS.CURRENCY, JSON.stringify(currency))
        localStorage.setItem(STORAGE_KEYS.TIMEZONE, JSON.stringify(timezone))
    }, [transactions, accounts, categories, budgets, subscriptions, debts, alerts, goals, activityLog, authData, isPrivacyMode, currency, timezone])

    // Actions
    const addAccount = (account) => {
        setAccounts(prev => [...prev, { ...account, id: `acc_${Date.now()}`, initialBalance: parseFloat(account.initialBalance) || 0 }])
        logActivity('Account Created', `New vault: ${account.name}`)
    }

    const addTransaction = (transaction) => {
        const newTransaction = {
            ...transaction,
            id: Date.now(),
            date: transaction.date || new Date().toISOString()
        }
        setTransactions(prev => [newTransaction, ...prev])

        logActivity(
            transaction.type === 'income' ? 'Income Received' : 'Expense Logged',
            `${transaction.category}: ${currencySymbol}${transaction.amount}`
        )

        // Split Bill Logic
        if (transaction.isSplit && transaction.splitAmount) {
            addDebt({
                person: transaction.splitWith || 'Someone',
                amount: transaction.splitAmount,
                type: 'owed_to_me',
                date: newTransaction.date,
                note: `Split for ${transaction.category}`
            })
        }
    }

    // Double-Entry Transfers
    const addTransfer = (fromId, toId, amount, date) => {
        const transferId = `tr_${Date.now()}`
        const isoDate = date ? new Date(date).toISOString() : new Date().toISOString()

        const outTransaction = {
            id: `${transferId}_out`,
            transferId,
            type: 'expense',
            category: 'Transfer',
            amount,
            accountId: fromId,
            date: isoDate,
            note: 'Outbound Transfer'
        }

        const inTransaction = {
            id: `${transferId}_in`,
            transferId,
            type: 'income',
            category: 'Transfer',
            amount,
            accountId: toId,
            date: isoDate,
            note: 'Inbound Transfer'
        }

        setTransactions(prev => [outTransaction, inTransaction, ...prev])
        logActivity('Internal Transfer', `${currencySymbol}${amount} moved between vaults`)
    }

    const addSubscription = (sub) => {
        setSubscriptions(prev => [...prev, { ...sub, id: `sub_${Date.now()}`, active: true }])
        logActivity('Subscription Added', `${sub.name}: ${currencySymbol}${sub.amount}/${sub.frequency}`)
    }

    const deleteSubscription = (id) => {
        const sub = subscriptions.find(s => s.id === id)
        setSubscriptions(prev => prev.filter(s => s.id !== id))
        if (sub) logActivity('Subscription Deleted', `${sub.name} removed from registry`)
    }

    const addDebt = (debt) => {
        setDebts(prev => [...prev, { ...debt, id: `debt_${Date.now()}`, settled: false }])
        logActivity('Debt Recorded', `${debt.person}: ${currencySymbol}${debt.amount}`)
    }

    const deleteDebt = (id) => {
        const debt = debts.find(d => d.id === id)
        setDebts(prev => prev.filter(d => d.id !== id))
        if (debt) logActivity('Debt Deleted', `Record with ${debt.person} cleared`)
    }

    const settleDebt = (id) => {
        setDebts(prev => prev.map(d => d.id === id ? { ...d, settled: true } : d))
        logActivity('Debt Settled', 'Repayment confirmed')
    }

    const deleteTransaction = (id) => {
        const transaction = transactions.find(t => t.id === id)
        if (!transaction) return

        // If it's a transfer, delete both entries
        if (transaction.transferId) {
            setTransactions(prev => prev.filter(t => t.transferId !== transaction.transferId))
        } else {
            setTransactions(prev => prev.filter(t => t.id !== id))
        }

        logActivity('Transaction Deleted', `${transaction.category}: ${currencySymbol}${transaction.amount}`)
        setLastDeleted(transaction)
    }

    const undoDelete = () => {
        if (!lastDeleted) return
        if (lastDeleted.transferId) {
            // Restore both if it was a transfer
            // (Note: Simplified for mock, ideally we'd find and restore both)
            addTransaction(lastDeleted)
        } else {
            addTransaction(lastDeleted)
        }
        setLastDeleted(null)
    }

    // Forecasting Logic
    const predictFutureBalance = (days = 30) => {
        let currentBal = totals.balance
        const forecast = []
        const today = new Date()

        for (let i = 0; i <= days; i++) {
            const date = new Date(today)
            date.setDate(today.getDate() + i)
            const dateStr = date.toISOString().split('T')[0]

            // Apply subscriptions due on this date
            subscriptions.forEach(sub => {
                if (!sub.active) return
                // Simple logic: if billing date matches day of month (approx)
                const billingDate = new Date(sub.nextBilling)
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
        setBudgets(prev => ({ ...prev, [category]: amount }))
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

    const updateTransaction = (id, updatedData) => {
        setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updatedData } : t))
        logActivity('Transaction Updated', `Modifications applied to ${updatedData.category || 'record'}`)
    }

    const updateUserCredentials = (username, password) => {
        setAuthData(prev => ({
            ...prev,
            credentials: { username, password }
        }))
        logActivity('Security Updated', 'Access credentials modified')
    }

    const updateUserProfile = (profileData) => {
        setAuthData(prev => ({
            ...prev,
            user: { ...prev.user, ...profileData }
        }))
        logActivity('Profile Updated', 'Identity details modified')
    }

    const login = (username, password) => {
        if (username === authData.credentials?.username && password === authData.credentials?.password) {
            setAuthData(prev => ({
                ...prev,
                isAuthenticated: true,
                user: prev.user || { id: 'u_1', name: 'Alara Vance', email: 'alara@finance.os' }
            }))
            return true
        }
        return false
    }

    const logout = () => {
        setAuthData(prev => ({ ...prev, isAuthenticated: false }))
    }

    const addGoal = (goal) => {
        setGoals(prev => [...prev, { ...goal, id: `goal_${Date.now()}`, currentAmount: 0 }])
    }

    const deleteGoal = (id) => {
        setGoals(prev => prev.filter(g => g.id !== id))
    }

    const updateGoalProgress = (id, amount) => {
        setGoals(prev => prev.map(g => g.id === id ? { ...g, currentAmount: amount } : g))
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
            deleteAccount: (id) => {
                const acc = accounts.find(a => a.id === id)
                setAccounts(prev => prev.filter(a => a.id !== id))
                if (acc) logActivity('Vault Decommissioned', `${acc.name} removed from system`)
            },
            addSubscription,
            deleteSubscription,
            addDebt,
            deleteDebt,
            settleDebt,
            predictFutureBalance,
            setBudget,
            markAlertRead,
            clearAlerts,
            login,
            logout,
            updateUserCredentials,
            updateUserProfile,
            addGoal,
            deleteGoal,
            updateGoalProgress,
            undoDelete,
            goals,
            activityLog,
            insights,
            isAuthenticated,
            user,
            setCategories,
            setAccounts
        }}>
            {children}
        </TransactionContext.Provider>
    )
}
