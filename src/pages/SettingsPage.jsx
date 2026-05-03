import { useState } from 'react'
import { 
    Plus, Trash2, Tag, ChevronRight, Monitor, Palette, Bell, Shield, 
    Download, Activity, Eye, EyeOff, Globe, Clock, Landmark, Sparkles, 
    X, Fingerprint, Camera, KeyRound, History, CheckCircle2, Shield as ShieldIcon
} from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Dropdown from '../components/ui/Dropdown'
import ThemeToggle from '../components/ui/ThemeToggle'
import EmptyState from '../components/ui/EmptyState'
import { useTransactions } from '../context/TransactionContext'
import { useSecurity } from '../context/SecurityContext'
import haptics from '../lib/haptics'
import api from '../services/api'
import SecurityLogModal from '../components/security/SecurityLogModal'
import BiometricModal from '../components/security/BiometricModal'

import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { cn } from '../lib/utils'
import ConfirmationModal from '../components/ui/ConfirmationModal'
import { useMockLoading } from '../hooks/useMockLoading'
import { GridSkeleton } from '../skeletons/GridSkeleton'

const SettingsPage = () => {
    const isLoading = useMockLoading()
    const { categories, addCategory, deleteCategory, budgets, setBudget, isPrivacyMode, setIsPrivacyMode, currency, setCurrency, timezone, setTimezone, currencySymbol, subscriptionKeywords, addSubscriptionKeyword, deleteSubscriptionKeyword, enableBudgetAlerts, setEnableBudgetAlerts, enableEmailBudgetAlerts, setEnableEmailBudgetAlerts } = useTransactions()
    const { 
        isBiometricEnabled,
        isPatternLockEnabled,
        isIntruderSnapshotEnabled, toggleIntruderSnapshot,
        verifyPIN, clearPIN, deregisterBiometrics, savedPINHash,
        biometricCredentialId, triggerPINSetup, togglePINLock
    } = useSecurity()

    const [showLogModal, setShowLogModal] = useState(false)
    const [showBiometricModal, setShowBiometricModal] = useState(false)
    const [isVerifyingToChange, setIsVerifyingToChange] = useState(false)
    const [currentPinCheck, setCurrentPinCheck] = useState('')
    const [, setPinChangeError] = useState('')

    const [activeType, setActiveType] = useState('EXPENSE')
    const [newCategory, setNewCategory] = useState('')
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
    const [confirmAction, setConfirmAction] = useState({ title: '', message: '', onConfirm: () => { } })
    const [tempCurrency, setTempCurrency] = useState(currency)
    const [tempTimezone, setTempTimezone] = useState(timezone)
    const [newKeyword, setNewKeyword] = useState('')

    const handleAdd = (e) => {
        e.preventDefault()
        if (!newCategory.trim()) return

        const currentCats = Array.isArray(categories[activeType]) ? categories[activeType] : []
        if (currentCats.includes(newCategory)) {
            toast.error('Category already exists')
            return
        }

        setConfirmAction({
            title: 'Define New Category',
            message: `Do you want to add "${newCategory}" to the system's ${activeType} classification list?`,
            type: 'primary',
            onConfirm: () => {
                addCategory(activeType, newCategory)
                setNewCategory('')
                toast.success('Category added successfully')
                setIsConfirmModalOpen(false)
            }
        })
        setIsConfirmModalOpen(true)
    }

    const handleDeleteClick = (type, name) => {
        setConfirmAction({
            title: 'Remove Category',
            message: `Are you sure you want to delete the "${name}" category? This will affect transaction filtering.`,
            type: 'danger',
            onConfirm: () => {
                deleteCategory(type, name)
                toast.success('Category deleted')
                setIsConfirmModalOpen(false)
            }
        })
        setIsConfirmModalOpen(true)
    }

    const handleBudgetChange = (cat, amount) => {
        setBudget(cat, parseFloat(amount) || 0)
    }

    const handleSaveRegional = () => {
        setConfirmAction({
            title: 'Apply Regional Shift',
            message: `Are you sure you want to update your localization settings? Denomination will be set to ${tempCurrency} and temporal sync to ${tempTimezone}.`,
            type: 'primary',
            onConfirm: () => {
                setCurrency(tempCurrency)
                setTimezone(tempTimezone)
                toast.success('Regional settings updated successfully')
                setIsConfirmModalOpen(false)
            }
        })
        setIsConfirmModalOpen(true)
    }
    
    const handleExportLedgerCsv = async () => {
        try {
            const blob = await api.downloadTransactionsExcel()
            const fileName = `ledger-${new Date().toISOString().slice(0, 10)}.xlsx`
            const objectUrl = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = objectUrl
            link.download = fileName
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.URL.revokeObjectURL(objectUrl)
            toast.success('Ledger export started')
        } catch (error) {
            console.error('Failed to export ledger', error)
            toast.error('Failed to export ledger')
        }
    }

    const expenseCategories = Array.isArray(categories.expense) ? categories.expense : []
    const categoryList = Array.isArray(categories[activeType]) ? categories[activeType] : []

    if (isLoading) return <GridSkeleton />

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700 pb-10">
            <div className="flex flex-col gap-1">
                <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">System Core</h2>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Configure categories, budgets, and operational parameters</p>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
                {/* Category Management */}
                <Card className="flex flex-col gap-8 shadow-2xl shadow-indigo-500/5 border-none rounded-4xl p-6 sm:p-8">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500 shadow-lg shadow-indigo-500/10">
                            <Tag size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-foreground tracking-tight">Classification</h3>
                            <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-1">Transaction Groups</p>
                        </div>
                    </div>

                    <div className="flex p-1.5 bg-card-muted/50 border border-border/50 rounded-2xl">
                        {['EXPENSE', 'INCOME'].map((type) => (
                            <button
                                key={type}
                                onClick={() => setActiveType(type)}
                                className={cn(
                                    "flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
                                    activeType === type
                                        ? "bg-primary text-white shadow-lg shadow-primary/20"
                                        : "text-muted-foreground hover:text-foreground opacity-60 hover:opacity-100"
                                )}
                            >
                                {type}s
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleAdd} className="flex gap-3">
                        <Input
                            placeholder="Identify new category..."
                            className="flex-1 h-12 rounded-xl bg-card/50"
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            required
                        />
                        <Button type="submit" className="h-12 w-12 p-0 rounded-xl group shrink-0 shadow-lg shadow-primary/20">
                            <Plus size={24} className="group-hover:rotate-90 transition-transform" />
                        </Button>
                    </form>

                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 scrollbar-none">
                        <AnimatePresence initial={false} mode="popLayout">
                            {categoryList.map((cat) => (
                                <motion.div
                                    key={cat}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="flex items-center justify-between p-4 rounded-xl bg-card-muted/30 border border-border/50 group hover:border-primary/20 transition-all"
                                >
                                    <span className="text-sm font-bold text-foreground opacity-80">{cat}</span>
                                    <button
                                        onClick={() => handleDeleteClick(activeType, cat)}
                                        className="h-8 w-8 flex items-center justify-center text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all active:scale-90"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </Card>

                {/* Budget Management */}
                <Card className="flex flex-col gap-8 shadow-2xl shadow-indigo-500/5 border-none rounded-4xl p-6 sm:p-8">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 shadow-lg shadow-amber-500/10">
                            <Activity size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-foreground tracking-tight">Constraints</h3>
                            <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-1">Monthly Spending Limits</p>
                        </div>
                    </div>

                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 scrollbar-none">
                        {expenseCategories.map(cat => (
                            <div key={cat} className="p-4 rounded-2xl bg-card-muted/30 border border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:bg-card-muted/50">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-card flex items-center justify-center shadow-sm border border-border/50">
                                        <Tag size={18} className="text-primary opacity-60" />
                                    </div>
                                    <span className="text-sm font-black text-foreground uppercase tracking-widest">{cat}</span>
                                </div>
                                <div className="flex items-center gap-3 bg-card/50 p-1 pl-4 rounded-xl border border-border/50">
                                    <span className="text-xs font-black text-primary">{currencySymbol}</span>
                                    <input
                                        type="number"
                                        placeholder="0"
                                        value={budgets[cat] || ''}
                                        onChange={(e) => handleBudgetChange(cat, e.target.value)}
                                        className="w-20 sm:w-24 h-10 bg-transparent border-none px-0 text-sm font-black text-foreground focus:outline-none focus:ring-0"
                                    />
                                    <div className="h-6 w-px bg-border/50 mx-1" />
                                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest pr-3">Month</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Smart Subscription Detection Card */}
                <Card className="flex flex-col gap-8 shadow-2xl shadow-purple-500/5 border-none rounded-4xl lg:col-span-2 p-6 sm:p-10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                        <Sparkles size={120} />
                    </div>

                    <div className="flex items-center gap-4 relative z-10">
                        <div className="flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-purple-500/10 text-purple-500 shadow-lg shadow-purple-500/10">
                            <Sparkles size={28} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-foreground tracking-tight">Smart Detection</h3>
                            <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mt-1">Subscription Auto-Discovery & Keywords</p>
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-8 relative z-10">
                        <div className="flex-1 space-y-6">
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Define keywords that should trigger automatic subscription tracking. When you use these words in a transaction narrative, the system will suggest creating a recurring subscription.
                            </p>

                            <div className="flex gap-3">
                                <Input
                                    placeholder="Add keyword (e.g., 'Apple TV')"
                                    value={newKeyword}
                                    onChange={(e) => setNewKeyword(e.target.value)}
                                    className="flex-1 h-14 rounded-2xl bg-card-muted/50 border-border/50 focus:bg-card transition-all"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault()
                                            if (newKeyword.trim()) {
                                                addSubscriptionKeyword(newKeyword.trim())
                                                setNewKeyword('')
                                                toast.success('Keyword added')
                                            }
                                        }
                                    }}
                                />
                                <Button
                                    onClick={() => {
                                        if (newKeyword.trim()) {
                                            addSubscriptionKeyword(newKeyword.trim())
                                            setNewKeyword('')
                                            toast.success('Keyword added')
                                        }
                                    }}
                                    className="h-14 px-8 rounded-2xl shadow-xl shadow-purple-500/20 bg-purple-600 hover:bg-purple-700 text-white font-bold uppercase tracking-widest text-xs"
                                >
                                    Add
                                </Button>
                            </div>
                        </div>

                        <div className="flex-1 bg-card-muted/30 rounded-3xl p-6 border border-border/50">
                            <div className="flex flex-wrap gap-3">
                                <AnimatePresence mode="popLayout">
                                    {subscriptionKeywords.map(keyword => (
                                        <motion.div
                                            key={keyword}
                                            layout
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                            className="group flex items-center gap-2 pl-4 pr-2 py-2.5 rounded-xl bg-card border border-border/50 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/5 transition-all cursor-default"
                                        >
                                            <span className="text-sm font-bold text-foreground">{keyword}</span>
                                            <button
                                                onClick={() => deleteSubscriptionKeyword(keyword)}
                                                className="h-6 w-6 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-rose-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                <X size={14} />
                                            </button>
                                        </motion.div>
                                    ))}
                                    {subscriptionKeywords.length === 0 && (
                                        <div className="w-full text-center py-8 text-muted-foreground text-sm italic opacity-60">
                                            No keywords defined. Add one to get started.
                                        </div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* System Preferences */}
                <Card className="flex flex-col gap-10 shadow-premium border border-border/40 dark:border-white/5 rounded-[3rem] lg:col-span-2 p-8 sm:p-12 relative overflow-hidden group bg-card dark:bg-slate-900/60 backdrop-blur-xl">
                    <div className="absolute -right-20 -bottom-20 h-64 w-64 bg-primary/5 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-1000" />

                    <div className="flex items-center gap-5 relative z-10">
                        <div className="flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-indigo-theme-bg text-indigo-theme shadow-lg shadow-indigo-theme/10">
                            <Monitor size={28} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-foreground tracking-tight">Configuration</h3>
                            <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mt-1">General Operational Parameters</p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 relative z-10">
                        <div className="flex items-center justify-between p-6 sm:p-8 rounded-4xl bg-card/40 dark:bg-slate-800/20 border border-border/50 hover:bg-card/60 dark:hover:bg-slate-800/40 transition-all group/item shadow-sm">
                            <div className="flex items-center gap-5">
                                <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover/item:scale-110 transition-transform">
                                    <Palette size={24} />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-foreground tracking-tight">Interface Theme</p>
                                    <p className="text-[10px] font-bold text-muted-foreground mt-1.5 opacity-60">Visual System Mode (⇧ + Space)</p>
                                </div>
                            </div>
                            <ThemeToggle />
                        </div>

                        <div className="flex items-center justify-between p-6 sm:p-8 rounded-4xl bg-card/40 dark:bg-slate-800/20 border border-border/50 hover:bg-card/60 dark:hover:bg-slate-800/40 transition-all group/item shadow-sm">
                            <div className="flex items-center gap-5">
                                <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover/item:scale-110 transition-transform">
                                    {isPrivacyMode ? <EyeOff size={24} /> : <Eye size={24} />}
                                </div>
                                <div>
                                    <p className="text-sm font-black text-foreground tracking-tight">Privacy Vault</p>
                                    <p className="text-[10px] font-bold text-muted-foreground mt-1.5 opacity-60">Mask Sensitive Data (⌃/⌘ + Space)</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsPrivacyMode(!isPrivacyMode)}
                                className={cn(
                                    "relative flex h-10 w-20 items-center rounded-full p-1 transition-colors focus:outline-none",
                                    isPrivacyMode ? "bg-primary" : "bg-muted"
                                )}
                            >
                                <motion.div
                                    layout
                                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                    className="h-8 w-8 rounded-full bg-white shadow-sm"
                                    style={{ x: isPrivacyMode ? 40 : 0 }}
                                />
                            </button>
                        </div>
                    </div>

                    {/* Alerting preferences */}
                    <div className="grid md:grid-cols-2 gap-6 mt-10 relative z-10">
                        <div className="flex items-center justify-between p-6 sm:p-8 rounded-4xl bg-card/40 dark:bg-slate-800/20 border border-border/50 hover:bg-card/60 dark:hover:bg-slate-800/40 transition-all group/item shadow-sm">
                            <div className="flex items-center gap-5">
                                <div className="h-12 w-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center group-hover/item:scale-110 transition-transform">
                                    <Bell size={24} />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-foreground tracking-tight">Budget Alerts</p>
                                    <p className="text-[10px] font-bold text-muted-foreground mt-1.5 opacity-60">In-app and toast notifications</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setEnableBudgetAlerts(!enableBudgetAlerts)}
                                className={cn(
                                    "relative flex h-10 w-20 items-center rounded-full p-1 transition-colors focus:outline-none",
                                    enableBudgetAlerts ? "bg-primary" : "bg-muted"
                                )}
                            >
                                <motion.div
                                    layout
                                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                    className="h-8 w-8 rounded-full bg-white shadow-sm"
                                    style={{ x: enableBudgetAlerts ? 40 : 0 }}
                                />
                            </button>
                        </div>

                        <div className="flex items-center justify-between p-6 sm:p-8 rounded-4xl bg-card/40 dark:bg-slate-800/20 border border-border/50 hover:bg-card/60 dark:hover:bg-slate-800/40 transition-all group/item shadow-sm">
                            <div className="flex items-center gap-5">
                                <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover/item:scale-110 transition-transform">
                                    <Shield size={24} />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-foreground tracking-tight">Email Budget Alerts</p>
                                    <p className="text-[10px] font-bold text-muted-foreground mt-1.5 opacity-60">Requires a configured email and SMTP</p>
                                </div>
                            </div>
                            <button
                                onClick={() => { haptics.light(); setEnableEmailBudgetAlerts(!enableEmailBudgetAlerts); }}
                                className={cn(
                                    "relative flex h-10 w-20 items-center rounded-full p-1 transition-colors focus:outline-none",
                                    enableEmailBudgetAlerts ? "bg-primary" : "bg-muted"
                                )}
                            >
                                <motion.div
                                    layout
                                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                    className="h-8 w-8 rounded-full bg-white shadow-sm"
                                    style={{ x: enableEmailBudgetAlerts ? 40 : 0 }}
                                />
                            </button>
                            </div>
                        </div>
                    </Card>
                </div>


                    {/* Privacy & Security Controls */}
                    <div className="pt-10 mt-10 border-t border-border/50">
                        <div className="flex items-center gap-5 mb-8 relative z-10">
                            <div className="flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-rose-500/10 text-rose-500 shadow-lg shadow-rose-500/10">
                                <Shield size={28} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-foreground tracking-tight">Privacy & Security</h3>
                                <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mt-1">High-Security Vault Protocols</p>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
                            {/* Biometric Card */}
                            <div className="flex flex-col gap-4 p-6 rounded-4xl bg-card/40 dark:bg-slate-800/20 border border-border/50 hover:bg-card/60 dark:hover:bg-slate-800/40 transition-all group/item shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-5">
                                        <div className="h-12 w-12 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center group-hover/item:scale-110 transition-transform">
                                            <Fingerprint size={24} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-foreground tracking-tight">Biometric Access</p>
                                            <p className="text-[10px] font-bold text-muted-foreground mt-1.5 opacity-60">WebAuthn Systems</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            haptics.light();
                                            if (!isBiometricEnabled) {
                                                setShowBiometricModal(true);
                                            } else {
                                                deregisterBiometrics();
                                            }
                                        }}
                                        className={cn(
                                            "relative flex h-8 w-14 items-center rounded-full p-1 transition-colors focus:outline-none",
                                            isBiometricEnabled ? "bg-primary" : "bg-muted"
                                        )}
                                    >
                                        <motion.div
                                            layout
                                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                            className="h-6 w-6 rounded-full bg-white shadow-sm"
                                            style={{ x: isBiometricEnabled ? 24 : 0 }}
                                        />
                                    </button>
                                </div>
                                {isBiometricEnabled && biometricCredentialId ? (
                                    <button
                                        onClick={() => { haptics.medium(); deregisterBiometrics(); }}
                                        className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-rose-500 transition-all pt-2 border-t border-white/5"
                                    >
                                        <Trash2 size={12} />
                                        Deregister Credentials
                                    </button>
                                ) : !isBiometricEnabled ? (
                                    <button
                                        onClick={() => { haptics.light(); setShowBiometricModal(true); }}
                                        className="flex items-center gap-2 text-[10px] font-black text-indigo-400 uppercase tracking-widest hover:text-indigo-300 transition-all pt-2 border-t border-white/5"
                                    >
                                        <Fingerprint size={12} />
                                        Tap to Register Fingerprint
                                    </button>
                                ) : null}
                            </div>

                            {/* PIN Card */}
                            <div className="flex flex-col gap-4 p-6 rounded-4xl bg-card/40 dark:bg-slate-800/20 border border-border/50 hover:bg-card/60 dark:hover:bg-slate-800/40 transition-all group/item shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-5">
                                        <div className="h-12 w-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center group-hover/item:scale-110 transition-transform">
                                            <Shield size={24} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-foreground tracking-tight">PIN Lock</p>
                                            <p className="text-[10px] font-bold text-muted-foreground mt-1.5 opacity-60">System Security Key</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => { 
                                            haptics.light(); 
                                            if (!isPatternLockEnabled) {
                                                if (!savedPINHash) {
                                                    triggerPINSetup();
                                                } else {
                                                    togglePINLock(true);
                                                }
                                            } else {
                                                togglePINLock(false);
                                            }
                                        }}
                                        className={cn(
                                            "relative flex h-8 w-14 items-center rounded-full p-1 transition-colors focus:outline-none",
                                            isPatternLockEnabled ? "bg-primary" : "bg-muted"
                                        )}
                                    >
                                        <motion.div
                                            layout
                                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                            className="h-6 w-6 rounded-full bg-white shadow-sm"
                                            style={{ x: isPatternLockEnabled ? 24 : 0 }}
                                        />
                                    </button>
                                </div>
                                {savedPINHash && (
                                    <button
                                        onClick={() => { haptics.light(); setIsVerifyingToChange(true); }}
                                        className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-primary transition-all pt-2 border-t border-white/5"
                                    >
                                        <KeyRound size={12} />
                                        Change Master PIN
                                    </button>
                                )}
                            </div>

                            {/* Intruder Toggle Card */}
                            <AnimatePresence>
                                {isPatternLockEnabled && (
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="flex items-center justify-between p-6 rounded-4xl bg-card/40 dark:bg-slate-800/20 border border-border/50 hover:bg-card/60 dark:hover:bg-slate-800/40 transition-all group/item shadow-sm"
                                    >
                                        <div className="flex items-center gap-5">
                                            <div className="h-12 w-12 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center group-hover/item:scale-110 transition-transform">
                                                <Camera size={24} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-foreground tracking-tight">Intruder Snapshot</p>
                                                <p className="text-[10px] font-bold text-muted-foreground mt-1.5 opacity-60">Auto-Capture Log</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => { haptics.light(); toggleIntruderSnapshot(!isIntruderSnapshotEnabled); }}
                                            className={cn(
                                                "relative flex h-8 w-14 items-center rounded-full p-1 transition-colors focus:outline-none",
                                                isIntruderSnapshotEnabled ? "bg-rose-500" : "bg-muted"
                                            )}
                                        >
                                            <motion.div
                                                layout
                                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                                className="h-6 w-6 rounded-full bg-white shadow-sm"
                                                style={{ x: isIntruderSnapshotEnabled ? 24 : 0 }}
                                            />
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Log Viewer Card/Button (Unified width) */}
                            {isIntruderSnapshotEnabled && (
                                <button
                                    onClick={() => { haptics.light(); setShowLogModal(true); }}
                                    className="col-span-1 md:col-span-2 lg:col-span-3 flex items-center justify-center gap-3 p-4 rounded-3xl border border-dashed border-white/10 hover:border-rose-500/30 hover:bg-rose-500/5 transition-all group"
                                >
                                    <History size={18} className="text-rose-500 group-hover:scale-110 transition-transform" />
                                    <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">View Intruder Snapshot Logs</span>
                                </button>
                            )}
                        </div>

                        {/* PIN Change Verification Modal */}
                        <AnimatePresence>
                            {isVerifyingToChange && (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="fixed inset-0 z-100 flex items-center justify-center bg-slate-950/80 backdrop-blur-xl p-4"
                                >
                                    <motion.div 
                                        initial={{ scale: 0.9, y: 20 }}
                                        animate={{ scale: 1, y: 0 }}
                                        className="w-full max-w-sm bg-slate-900 border border-white/5 rounded-[2.5rem] p-8 shadow-2xl"
                                    >
                                        <div className="text-center space-y-4 mb-8">
                                            <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                                                <ShieldIcon size={28} />
                                            </div>
                                            <h3 className="text-xl font-black text-white uppercase tracking-tight">Security Check</h3>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Verify current PIN to proceed</p>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="flex justify-center gap-3">
                                                {[...Array(6)].map((_, i) => (
                                                    <div 
                                                        key={i}
                                                        className={cn(
                                                            "h-3 w-3 rounded-full border border-white/10 transition-all",
                                                            i < currentPinCheck.length ? "bg-primary shadow-[0_0_10px_rgba(99,102,241,0.5)]" : "bg-white/5"
                                                        )}
                                                    />
                                                ))}
                                            </div>

                                            <div className="grid grid-cols-3 gap-4">
                                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'DEL', 0, 'OK'].map((key) => (
                                                    <button
                                                        key={key}
                                                        onClick={async () => {
                                                            haptics.light();
                                                            if (key === 'DEL') setCurrentPinCheck(prev => prev.slice(0, -1));
                                                            else if (key === 'OK') {
                                                                const isValid = await verifyPIN(currentPinCheck);
                                                                if (isValid) {
                                                                    haptics.success();
                                                                    setIsVerifyingToChange(false);
                                                                    setCurrentPinCheck('');
                                                                    clearPIN();
                                                                    triggerPINSetup();
                                                                    toast.success('Identity Verified. Set new PIN.');
                                                                } else {
                                                                    haptics.error();
                                                                    setPinChangeError('Incorrect PIN');
                                                                    setTimeout(() => setPinChangeError(''), 2000);
                                                                }
                                                            } else if (currentPinCheck.length < 6) {
                                                                setCurrentPinCheck(prev => prev + key);
                                                            }
                                                        }}
                                                        className="h-14 rounded-2xl bg-white/5 border border-white/5 text-sm font-bold hover:bg-white/10 transition-all"
                                                    >
                                                        {key}
                                                    </button>
                                                ))}
                                            </div>

                                            <button
                                                onClick={() => { haptics.light(); setIsVerifyingToChange(false); setCurrentPinCheck(''); }}
                                                className="w-full py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-all"
                                            >
                                                Abort Operation
                                            </button>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <SecurityLogModal 
                            isOpen={showLogModal} 
                            onClose={() => setShowLogModal(false)} 
                        />
                        <BiometricModal
                            isOpen={showBiometricModal}
                            onClose={() => setShowBiometricModal(false)}
                            onSuccess={() => setShowBiometricModal(false)}
                        />
                    </div>



                    {/* Regional Settings */}
                    <div className="pt-10 mt-2 border-t border-border/50">
                        <div className="flex items-center gap-5 mb-8 relative z-10">
                            <div className="flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-emerald-500/10 text-emerald-500 shadow-lg shadow-emerald-500/10">
                                <Globe size={28} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-foreground tracking-tight">Regional Settings</h3>
                                <p className="text-[10px] font-black text-primary uppercase mt-1">Personalization & Formatting</p>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6 relative z-10">
                            <div className="flex items-center justify-between p-6 sm:p-8 rounded-4xl bg-card/40 dark:bg-slate-800/20 border border-border/50 hover:bg-card/60 dark:hover:bg-slate-800/40 transition-all group/item shadow-sm">
                                <div className="flex items-center gap-5">
                                    <div className="h-12 w-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center group-hover/item:scale-110 transition-transform">
                                        <Landmark size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-foreground uppercase tracking-widest leading-none">Default Currency</p>
                                        <p className="text-[10px] font-bold text-muted-foreground mt-1.5 opacity-60">System-wide Denomination</p>
                                    </div>
                                </div>
                                <Dropdown
                                    options={[
                                        { label: 'INR (₹)', value: 'INR' },
                                        { label: 'USD ($)', value: 'USD' }
                                    ]}
                                    value={tempCurrency}
                                    onChange={setTempCurrency}
                                    className="w-32 h-10 rounded-xl"
                                />
                            </div>

                            <div className="flex items-center justify-between p-6 sm:p-8 rounded-[2rem] bg-card/40 dark:bg-slate-800/20 border border-border/50 hover:bg-card/60 dark:hover:bg-slate-800/40 transition-all group/item shadow-sm">
                                <div className="flex items-center gap-5">
                                    <div className="h-12 w-12 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center group-hover/item:scale-110 transition-transform">
                                        <Clock size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-foreground uppercase tracking-widest leading-none">Access Timezone</p>
                                        <p className="text-[10px] font-bold text-muted-foreground mt-1.5 opacity-60">Temporal Synchronization</p>
                                    </div>
                                </div>
                                <Dropdown
                                    options={[
                                        { label: 'UTC', value: 'UTC' },
                                        { label: 'Asia/Kolkata', value: 'Asia/Kolkata' },
                                        { label: 'America/New_York', value: 'America/New_York' },
                                        { label: 'Europe/London', value: 'Europe/London' },
                                        { label: 'System Default', value: Intl.DateTimeFormat().resolvedOptions().timeZone }
                                    ]}
                                    value={tempTimezone}
                                    onChange={setTempTimezone}
                                    className="w-48 h-10 rounded-xl"
                                />
                            </div>
                        </div>

                        <AnimatePresence>
                            {(tempCurrency !== currency || tempTimezone !== timezone) && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 20 }}
                                    className="flex justify-end mt-8 relative z-50"
                                >
                                    <Button
                                        onClick={() => { haptics.medium(); handleSaveRegional(); }}
                                        className="h-12 px-10 rounded-xl shadow-xl shadow-primary/20 gap-2 overflow-hidden relative group"
                                    >
                                        <div className="absolute inset-0 bg-linear-to-r from-primary to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <span className="relative z-10 font-black uppercase tracking-widest text-[10px]">Save Regional Changes</span>
                                    </Button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>


                    <div className="pt-10 mt-2 border-t border-border/50 flex flex-col sm:flex-row justify-between items-center gap-6 relative z-10">
                        <div className="flex items-center gap-4 w-full sm:w-auto">
                            <Button onClick={handleExportLedgerCsv} variant="ghost" className="h-12 px-6 gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-xl w-full sm:w-auto">
                                <Download size={18} />
                                Export Ledger (Excel)
                            </Button>
                        </div>
                        <div className="flex items-center gap-2 group/version">
                            <div className="h-2 w-2 rounded-full bg-emerald-theme animate-pulse" />
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] opacity-40 group-hover:opacity-80 transition-opacity">AJ Finance Core v4.2.0</p>
                        </div>
                    </div>
            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={confirmAction.onConfirm}
                title={confirmAction.title}
                message={confirmAction.message}
                confirmText="Verify Action"
                type={confirmAction.type}
            />

        </div>
    )
}

export default SettingsPage
