import { useState } from 'react'
import { Plus, Trash2, Tag, ChevronRight, Monitor, Palette, Bell, Shield, Download, Activity, Eye, EyeOff, Globe, Clock, Landmark } from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Dropdown from '../components/ui/Dropdown'
import ThemeToggle from '../components/ui/ThemeToggle'
import EmptyState from '../components/ui/EmptyState'
import { useTransactions } from '../context/TransactionContext'

import { motion, AnimatePresence } from 'framer-motion'
import Toast from '../components/ui/Toast'
import { cn } from '../lib/utils'

import ConfirmationModal from '../components/ui/ConfirmationModal'

const SettingsPage = () => {
    const { categories, addCategory, deleteCategory, budgets, setBudget, isPrivacyMode, setIsPrivacyMode, currency, setCurrency, timezone, setTimezone, currencySymbol } = useTransactions()
    const [activeType, setActiveType] = useState('expense')
    const [newCategory, setNewCategory] = useState('')
    const [toast, setToast] = useState({ isOpen: false, message: '' })
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
    const [confirmAction, setConfirmAction] = useState({ title: '', message: '', onConfirm: () => { } })
    const [tempCurrency, setTempCurrency] = useState(currency)
    const [tempTimezone, setTempTimezone] = useState(timezone)

    const handleAdd = (e) => {
        e.preventDefault()
        if (!newCategory.trim()) return

        const currentCats = Array.isArray(categories[activeType]) ? categories[activeType] : []
        if (currentCats.includes(newCategory)) {
            setToast({ isOpen: true, message: 'Category already exists' })
            return
        }

        setConfirmAction({
            title: 'Define New Category',
            message: `Do you want to add "${newCategory}" to the system's ${activeType} classification list?`,
            type: 'primary',
            onConfirm: () => {
                addCategory(activeType, newCategory)
                setNewCategory('')
                setToast({ isOpen: true, message: 'Category added successfully' })
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
                setToast({ isOpen: true, message: 'Category deleted' })
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
                setToast({ isOpen: true, message: 'Regional settings updated successfully' })
            }
        })
        setIsConfirmModalOpen(true)
    }

    const expenseCategories = Array.isArray(categories.expense) ? categories.expense : []
    const categoryList = Array.isArray(categories[activeType]) ? categories[activeType] : []

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700 pb-10">
            <div className="flex flex-col gap-1">
                <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">System Core</h2>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Configure categories, budgets, and operational parameters</p>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
                {/* Category Management */}
                <Card className="flex flex-col gap-8 shadow-2xl shadow-indigo-500/5 border-none rounded-[2.5rem] p-6 sm:p-8">
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
                        {['expense', 'income'].map((type) => (
                            <button
                                key={type}
                                onClick={() => setActiveType(type)}
                                className={cn(
                                    "flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all capitalize",
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
                <Card className="flex flex-col gap-8 shadow-2xl shadow-indigo-500/5 border-none rounded-[2.5rem] p-6 sm:p-8">
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
                                    <span className="text-sm font-black text-foreground tracking-tight uppercase tracking-widest">{cat}</span>
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
                        <div className="flex items-center justify-between p-6 sm:p-8 rounded-[2rem] bg-card/40 dark:bg-slate-800/20 border border-border/50 hover:bg-card/60 dark:hover:bg-slate-800/40 transition-all group/item shadow-sm">
                            <div className="flex items-center gap-5">
                                <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover/item:scale-110 transition-transform">
                                    <Palette size={24} />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-foreground tracking-tight uppercase tracking-widest leading-none">Interface Theme</p>
                                    <p className="text-[10px] font-bold text-muted-foreground mt-1.5 opacity-60">Visual System Mode (Shift + Space)</p>
                                </div>
                            </div>
                            <ThemeToggle />
                        </div>

                        <div className="flex items-center justify-between p-6 sm:p-8 rounded-[2rem] bg-card/40 dark:bg-slate-800/20 border border-border/50 hover:bg-card/60 dark:hover:bg-slate-800/40 transition-all group/item shadow-sm">
                            <div className="flex items-center gap-5">
                                <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover/item:scale-110 transition-transform">
                                    {isPrivacyMode ? <EyeOff size={24} /> : <Eye size={24} />}
                                </div>
                                <div>
                                    <p className="text-sm font-black text-foreground tracking-tight uppercase tracking-widest leading-none">Privacy Vault</p>
                                    <p className="text-[10px] font-bold text-muted-foreground mt-1.5 opacity-60">Mask Sensitive Data (Ctrl + Space)</p>
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

                    {/* Regional Settings */}
                    <div className="pt-10 mt-2 border-t border-border/50">
                        <div className="flex items-center gap-5 mb-8 relative z-10">
                            <div className="flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-emerald-500/10 text-emerald-500 shadow-lg shadow-emerald-500/10">
                                <Globe size={28} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-foreground tracking-tight">Regional Settings</h3>
                                <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mt-1">Localization & Formatting</p>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6 relative z-10">
                            <div className="flex items-center justify-between p-6 sm:p-8 rounded-[2rem] bg-card/40 dark:bg-slate-800/20 border border-border/50 hover:bg-card/60 dark:hover:bg-slate-800/40 transition-all group/item shadow-sm">
                                <div className="flex items-center gap-5">
                                    <div className="h-12 w-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center group-hover/item:scale-110 transition-transform">
                                        <Landmark size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-foreground tracking-tight uppercase tracking-widest leading-none">Default Currency</p>
                                        <p className="text-[10px] font-bold text-muted-foreground mt-1.5 opacity-60">System-wide Denomination</p>
                                    </div>
                                </div>
                                <Dropdown
                                    options={[
                                        { label: 'USD ($)', value: 'USD' },
                                        { label: 'INR (₹)', value: 'INR' }
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
                                        <p className="text-sm font-black text-foreground tracking-tight uppercase tracking-widest leading-none">Access Timezone</p>
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
                                        onClick={handleSaveRegional}
                                        className="h-12 px-10 rounded-xl shadow-xl shadow-primary/20 gap-2 overflow-hidden relative group"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-primary to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <span className="relative z-10 font-black uppercase tracking-widest text-[10px]">Save Regional Changes</span>
                                    </Button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>


                    <div className="pt-10 mt-2 border-t border-border/50 flex flex-col sm:flex-row justify-between items-center gap-6 relative z-10">
                        <div className="flex items-center gap-4 w-full sm:w-auto">
                            <Button variant="ghost" className="h-12 px-6 gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-xl w-full sm:w-auto">
                                <Download size={18} />
                                Export Ledger (CSV)
                            </Button>
                        </div>
                        <div className="flex items-center gap-2 group/version">
                            <div className="h-2 w-2 rounded-full bg-emerald-theme animate-pulse" />
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] opacity-40 group-hover:opacity-80 transition-opacity">AJ Finance Core v4.2.0</p>
                        </div>
                    </div>
                </Card>
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

            <Toast
                isOpen={toast.isOpen}
                message={toast.message}
                onClose={() => setToast({ ...toast, isOpen: false })}
            />
        </div>
    )
}

export default SettingsPage
