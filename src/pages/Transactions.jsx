import { useState } from 'react'
import { Search, TrendingUp, TrendingDown, Filter, Edit2, Trash2, Calendar as CalendarIcon, ArrowLeftRight, ChevronLeft, ChevronRight } from 'lucide-react'
import Card from '../components/ui/Card'
import Dropdown from '../components/ui/Dropdown'
import Button from '../components/ui/Button'
import ConfirmationModal from '../components/ui/ConfirmationModal'
import EmptyState from '../components/ui/EmptyState'
import { useTransactions } from '../context/TransactionContext'
import { motion, AnimatePresence } from 'framer-motion'
import EditTransactionModal from '../components/ui/EditTransactionModal'
import Toast from '../components/ui/Toast'
import Calendar from '../components/ui/Calendar'
import { cn } from '../lib/utils'
import PrivacyValue from '../components/ui/PrivacyValue'

const Transactions = () => {
    const { transactions, deleteTransaction, accounts, categories, undoDelete, currencySymbol } = useTransactions()
    const [search, setSearch] = useState('')
    const [viewMode, setViewMode] = useState('list') // 'list' or 'calendar'
    const [heatmapDate, setHeatmapDate] = useState(new Date())
    const [isToastOpen, setIsToastOpen] = useState(false)
    const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false)
    const [filters, setFilters] = useState({
        type: 'all',
        dateStart: '',
        dateEnd: '',
        minAmount: '',
        maxAmount: '',
        accountId: 'all',
        categories: []
    })

    // Delete state
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [transactionToDelete, setTransactionToDelete] = useState(null)

    // Edit state
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [transactionToEdit, setTransactionToEdit] = useState(null)

    const filteredTransactions = transactions.filter(t => {
        const matchesSearch = !search ||
            t.category.toLowerCase().includes(search.toLowerCase()) ||
            (t.note && t.note.toLowerCase().includes(search.toLowerCase()))

        const matchesType = filters.type === 'all' || t.type === filters.type
        const matchesAccount = filters.accountId === 'all' || t.accountId === filters.accountId
        const matchesDateStart = !filters.dateStart || t.date >= filters.dateStart
        const matchesDateEnd = !filters.dateEnd || t.date <= filters.dateEnd
        const matchesMinAmount = !filters.minAmount || t.amount >= parseFloat(filters.minAmount)
        const matchesMaxAmount = !filters.maxAmount || t.amount <= parseFloat(filters.maxAmount)
        const matchesCategories = filters.categories.length === 0 || filters.categories.includes(t.category)

        return matchesSearch && matchesType && matchesAccount &&
            matchesDateStart && matchesDateEnd &&
            matchesMinAmount && matchesMaxAmount && matchesCategories
    })

    const resetFilters = () => {
        setFilters({
            type: 'all',
            dateStart: '',
            dateEnd: '',
            minAmount: '',
            maxAmount: '',
            accountId: 'all',
            categories: []
        })
        setSearch('')
    }

    const handleDeleteClick = (transaction) => {
        setTransactionToDelete(transaction)
        setIsDeleteModalOpen(true)
    }

    const handleEditClick = (transaction) => {
        setTransactionToEdit(transaction)
        setIsEditModalOpen(true)
    }

    const confirmDelete = () => {
        if (transactionToDelete) {
            deleteTransaction(transactionToDelete.id)
            setTransactionToDelete(null)
            setIsToastOpen(true)
        }
    }

    const filterOptions = [
        { label: 'All Transactions', value: 'all' },
        { label: 'Income Only', value: 'income' },
        { label: 'Expenses Only', value: 'expense' }
    ]

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
            <div className="flex flex-col gap-6">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">Financial History</h2>
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground mt-1">Detailed record of all vault operations</p>
                </div>

                <div className="flex items-center gap-3 w-full">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" size={18} />
                        <input
                            type="text"
                            placeholder="Find operation..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-16 w-full rounded-2xl border border-border/50 bg-card/50 backdrop-blur-md pl-14 pr-4 text-base font-bold text-foreground focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-premium placeholder:text-muted-foreground/40"
                        />
                    </div>
                    <Button
                        variant={isFilterPanelOpen ? 'primary' : 'outline'}
                        onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
                        className="h-16 w-16 p-0 rounded-2xl shrink-0 shadow-premium transition-transform active:scale-95 border-border/50"
                    >
                        <Filter size={20} />
                    </Button>
                </div>
            </div>

            {/* View Toggle */}
            <div className="flex bg-muted/30 p-1 rounded-xl w-fit border border-border/50">
                <button
                    onClick={() => setViewMode('list')}
                    className={cn(
                        "px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all",
                        viewMode === 'list'
                            ? "bg-primary text-white shadow-lg shadow-primary/20"
                            : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    List View
                </button>
                <button
                    onClick={() => setViewMode('calendar')}
                    className={cn(
                        "px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all",
                        viewMode === 'calendar'
                            ? "bg-primary text-white shadow-lg shadow-primary/20"
                            : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    Heatmap
                </button>
            </div>

            {/* Advanced Filter Panel */}
            <AnimatePresence>
                {isFilterPanelOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <Card className="border-none shadow-premium bg-muted/30 mb-8 p-6">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Flow Type</label>
                                    <Dropdown
                                        options={[
                                            { label: 'All Flows', value: 'all' },
                                            { label: 'Inflow Only', value: 'income' },
                                            { label: 'Outflow Only', value: 'expense' }
                                        ]}
                                        value={filters.type}
                                        onChange={(val) => setFilters({ ...filters, type: val })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Vault</label>
                                    <Dropdown
                                        options={[
                                            { label: 'All Vaults', value: 'all' },
                                            ...accounts.map(acc => ({ label: acc.name, value: acc.id }))
                                        ]}
                                        value={filters.accountId}
                                        onChange={(val) => setFilters({ ...filters, accountId: val })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Date Range</label>
                                    <div className="flex gap-2">
                                        <Calendar
                                            value={filters.dateStart}
                                            onChange={(val) => setFilters({ ...filters, dateStart: val })}
                                            className="h-auto"
                                        />
                                        <Calendar
                                            value={filters.dateEnd}
                                            onChange={(val) => setFilters({ ...filters, dateEnd: val })}
                                            className="h-auto"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Amount Range ({currencySymbol})</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="number"
                                            placeholder="Min"
                                            value={filters.minAmount}
                                            onChange={(e) => setFilters({ ...filters, minAmount: e.target.value })}
                                            className="h-12 w-full rounded-xl border border-border bg-card px-3 text-xs font-bold"
                                        />
                                        <input
                                            type="number"
                                            placeholder="Max"
                                            value={filters.maxAmount}
                                            onChange={(e) => setFilters({ ...filters, maxAmount: e.target.value })}
                                            className="h-12 w-full rounded-xl border border-border bg-card px-3 text-xs font-bold"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between">
                                <div className="flex gap-4">
                                    <Button variant="ghost" size="sm" onClick={resetFilters} className="text-rose-500 font-black tracking-widest text-[10px]">RESET ALL</Button>
                                </div>
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{filteredTransactions.length} results found</p>
                            </div>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {viewMode === 'list' && (
                <Card className="overflow-hidden p-0 border-none shadow-2xl shadow-indigo-100/30 dark:shadow-none">
                    <div className="overflow-x-auto">
                        {/* Desktop Table View */}
                        <table className="w-full text-left hidden sm:table">
                            <thead className="bg-muted border-b border-border">
                                <tr>
                                    <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Transaction</th>
                                    <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Date</th>
                                    <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Details</th>
                                    <th className="px-8 py-5 text-right text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Amount</th>
                                    <th className="px-8 py-5 text-center text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                <AnimatePresence mode="popLayout">
                                    {filteredTransactions.map((t) => (
                                        <motion.tr
                                            key={t.id}
                                            layout
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="group hover:bg-muted/50 transition-colors"
                                        >
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className={cn(
                                                        "flex h-12 w-12 shrink-0 items-center justify-center rounded-[1rem] transition-transform group-hover:scale-110 shadow-sm",
                                                        t.transferId ? "bg-primary/10 text-primary" : (t.type === 'income' ? 'bg-emerald-theme text-emerald-theme' : 'bg-rose-theme text-rose-theme')
                                                    )}>
                                                        {t.transferId ? <ArrowLeftRight size={20} /> : (t.type === 'income' ? <TrendingUp size={20} /> : <TrendingDown size={20} />)}
                                                    </div>
                                                    <div>
                                                        <span className="font-bold text-foreground block">{t.category}</span>
                                                        {t.transferId && <span className="text-[9px] font-black text-primary uppercase tracking-widest">Linked Transfer</span>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-sm font-medium text-muted-foreground whitespace-nowrap">{t.date}</td>
                                            <td className="px-8 py-6 text-sm text-muted-foreground max-w-[200px] truncate italic">{t.note || '-'}</td>
                                            <td className={`px-8 py-6 text-right font-black text-lg ${t.type === 'income' ? 'text-emerald-theme' : 'text-foreground'}`}>
                                                {t.type === 'income' ? '+' : '-'}
                                                <PrivacyValue>{currencySymbol}</PrivacyValue>
                                                <PrivacyValue>{t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</PrivacyValue>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleEditClick(t)}
                                                        className="p-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-lg transition-colors"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(t)}
                                                        className="p-2 text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>

                        {/* Mobile Card View */}
                        <div className="sm:hidden divide-y divide-border/50">
                            <AnimatePresence mode="popLayout">
                                {filteredTransactions.map((t) => (
                                    <motion.div
                                        key={t.id}
                                        layout
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="p-1 px-4 active:bg-muted/50 transition-colors"
                                    >
                                        <div className="py-6 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className={cn(
                                                    "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-sm",
                                                    t.transferId ? "bg-primary/10 text-primary" : (t.type === 'income' ? 'bg-emerald-theme text-emerald-theme' : 'bg-rose-theme text-rose-theme')
                                                )}>
                                                    {t.transferId ? <ArrowLeftRight size={24} /> : (t.type === 'income' ? <TrendingUp size={24} /> : <TrendingDown size={24} />)}
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="font-black text-foreground text-base tracking-tight">{t.category}</p>
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">{t.date}</p>
                                                        {t.transferId && <span className="text-[9px] font-black text-primary uppercase tracking-widest px-1.5 py-0.5 bg-primary/5 rounded-md">Transfer</span>}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-3">
                                                <p className={`font-black text-lg tracking-tight ${t.type === 'income' ? 'text-emerald-theme' : 'text-foreground'}`}>
                                                    {t.type === 'income' ? '+' : '-'}
                                                    <PrivacyValue>{currencySymbol}</PrivacyValue>
                                                    <PrivacyValue>{t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</PrivacyValue>
                                                </p>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleEditClick(t)}
                                                        className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground active:text-primary active:bg-primary/10 transition-colors"
                                                    >
                                                        <Edit2 size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(t)}
                                                        className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground active:text-rose-500 active:bg-rose-500/10 transition-colors"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        {filteredTransactions.length === 0 && (
                            <div className="py-24 text-center">
                                <EmptyState
                                    icon={Filter}
                                    title="No matches found"
                                    message="Try adjusting your filters or search terms"
                                    actionText="Clear Filters"
                                    onAction={resetFilters}
                                />
                            </div>
                        )}
                    </div>
                </Card>
            )}

            {/* Feature 2: Calendar Heatmap View */}
            {
                viewMode === 'calendar' && (
                    <div className="animate-in fade-in slide-in-from-bottom-5 duration-500">
                        <Card className="p-6 sm:p-8 bg-card border-none shadow-2xl">
                            {/* Heatmap Header */}
                            <div className="flex items-center justify-between mb-6">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setHeatmapDate(new Date(heatmapDate.setMonth(heatmapDate.getMonth() - 1)))}
                                    className="h-8 w-8 rounded-xl"
                                >
                                    <ChevronLeft size={16} />
                                </Button>
                                <span className="text-sm font-black uppercase tracking-widest text-foreground">
                                    {heatmapDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                                </span>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setHeatmapDate(new Date(heatmapDate.setMonth(heatmapDate.getMonth() + 1)))}
                                    className="h-8 w-8 rounded-xl"
                                >
                                    <ChevronRight size={16} />
                                </Button>
                            </div>

                            <div className="grid grid-cols-7 gap-2 sm:gap-4 mb-4">
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                    <div key={day} className="text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground py-2">
                                        {day}
                                    </div>
                                ))}
                            </div>
                            <div className="grid grid-cols-7 gap-2 sm:gap-4">
                                {Array.from({ length: 35 }).map((_, i) => {
                                    // Mock Logic for Heatmap
                                    const day = i + 1
                                    const daysInMonth = new Date(heatmapDate.getFullYear(), heatmapDate.getMonth() + 1, 0).getDate()

                                    if (day > daysInMonth) return <div key={i} />

                                    // Deterministic Random for consistency in mock based on month
                                    const seed = heatmapDate.getMonth() + 1
                                    const hasSpend = (day * 13 * seed) % 3 !== 0
                                    const amount = hasSpend ? (day * 123 * seed) % 3500 : 0
                                    let bgClass = "bg-emerald-500/10 border-emerald-500/20" // Zero Spend
                                    let textClass = "text-muted-foreground"

                                    if (amount > 2000) {
                                        bgClass = "bg-rose-500/20 border-rose-500/30 dark:bg-rose-500/10 relative overflow-hidden" // High Spend
                                        textClass = "text-rose-500"
                                    } else if (amount > 0) {
                                        bgClass = "bg-purple-500/20 border-purple-500/30 dark:bg-purple-500/10" // Medium Spend
                                        textClass = "text-purple-500"
                                    }

                                    return (
                                        <div
                                            key={i}
                                            className={cn(
                                                "aspect-square rounded-2xl border flex flex-col items-center justify-center relative group transition-all hover:scale-105 cursor-pointer",
                                                bgClass
                                            )}
                                        >
                                            <span className={cn("text-sm font-black mb-1", textClass)}>{day}</span>
                                            {amount > 0 && (
                                                <span className="text-[9px] font-bold opacity-80 text-foreground">
                                                    -{currencySymbol}{amount}
                                                </span>
                                            )}

                                            {/* High Spend Dot */}
                                            {amount > 2000 && (
                                                <div className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                                            )}

                                            {/* Tooltip */}
                                            <div className="absolute bottom-full mb-2 hidden group-hover:block z-20 min-w-[120px] bg-popover text-popover-foreground text-xs p-2 rounded-xl shadow-xl border border-border">
                                                <p className="font-bold border-b border-border/50 pb-1 mb-1">{heatmapDate.toLocaleString('default', { month: 'short' })} {day}</p>
                                                {amount > 0 ? (
                                                    <div className="space-y-1">
                                                        <p>Grocery: {currencySymbol}{Math.floor(amount * 0.4)}</p>
                                                        <p>Transport: {currencySymbol}{Math.floor(amount * 0.6)}</p>
                                                    </div>
                                                ) : (
                                                    <p className="text-emerald-500 font-bold">No Spending</p>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </Card>
                        <div className="mt-4 flex gap-6 justify-center">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/50" />
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Zero Spend</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-purple-500/20 border border-purple-500/50" />
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Moderate</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-rose-500/20 border border-rose-500/50" />
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">High Intensity</span>
                            </div>
                        </div>
                    </div>
                )
            }

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Transaction"
                message={`Are you sure you want to delete this transaction?\n\n${transactionToDelete?.category} - ${currencySymbol}${transactionToDelete?.amount.toFixed(2)}`}
            />

            <EditTransactionModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false)
                    setTransactionToEdit(null)
                }}
                transaction={transactionToEdit}
            />

            <Toast
                isOpen={isToastOpen}
                onClose={() => setIsToastOpen(false)}
                message="Transaction moved to trash"
                actionLabel="Undo"
                onAction={undoDelete}
            />
        </div >
    )
}

export default Transactions
