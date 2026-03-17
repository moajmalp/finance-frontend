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
import toast from 'react-hot-toast'
import Calendar from '../components/ui/Calendar'
import { cn } from '../lib/utils'
import PrivacyValue from '../components/ui/PrivacyValue'
import { useMockLoading } from '../hooks/useMockLoading'
import { ListSkeleton } from '../skeletons/ListSkeleton'

const Transactions = () => {
    const isLoading = useMockLoading()
    const { transactions, deleteTransaction, accounts, categories, undoDelete, currencySymbol } = useTransactions()

    const [search, setSearch] = useState('')
    const [viewMode, setViewMode] = useState('list') // 'list' or 'calendar'
    const [heatmapDate, setHeatmapDate] = useState(new Date())
    const [selectedCalendarDate, setSelectedCalendarDate] = useState(null)
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
        const searchTerm = search.trim().toLowerCase()

        const matchesSearch = !searchTerm ||
            (t.category && t.category.toLowerCase().includes(searchTerm)) ||
            (t.note && t.note.toLowerCase().includes(searchTerm)) ||
            (t.amount !== undefined && t.amount !== null && t.amount.toString().includes(searchTerm))

        const matchesType = filters.type === 'all' || t.type === filters.type
        const matchesAccount = filters.accountId === 'all' || t.account_id === filters.accountId
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

    // --- Cash Flow Calendar Helpers ---
    const calendarMonthKey = `${heatmapDate.getFullYear()}-${String(heatmapDate.getMonth() + 1).padStart(2, '0')}`

    const calendarTransactions = filteredTransactions.filter(t => t.date && t.date.startsWith(calendarMonthKey))

    const dailyBuckets = calendarTransactions.reduce((acc, t) => {
        const dayStr = t.date.slice(8, 10)
        const day = parseInt(dayStr, 10)
        if (!acc[day]) {
            acc[day] = { income: 0, expense: 0, net: 0, transactions: [] }
        }
        const amount = parseFloat(t.amount) || 0
        if (t.type === 'INCOME') {
            acc[day].income += amount
            acc[day].net += amount
        } else if (t.type === 'EXPENSE') {
            acc[day].expense += amount
            acc[day].net -= amount
        }
        acc[day].transactions.push(t)
        return acc
    }, {})

    const maxAbsNet = Object.values(dailyBuckets).reduce((max, bucket) => {
        const absNet = Math.abs(bucket.net)
        return absNet > max ? absNet : max
    }, 0)

    const getDayIntensityClass = (day) => {
        const bucket = dailyBuckets[day]
        if (!bucket || maxAbsNet === 0) {
            return 'bg-muted/40 border-dashed border-border/60 text-muted-foreground'
        }
        const absNet = Math.abs(bucket.net)
        const ratio = absNet / maxAbsNet

        let tone = ''
        if (bucket.net >= 0) {
            // Net positive cash flow
            if (ratio < 0.33) tone = 'bg-emerald-500/10 border-emerald-500/40 text-emerald-500'
            else if (ratio < 0.66) tone = 'bg-emerald-500/20 border-emerald-500/60 text-emerald-500'
            else tone = 'bg-emerald-500/30 border-emerald-500 text-emerald-50'
        } else {
            // Net negative cash flow
            if (ratio < 0.33) tone = 'bg-rose-500/10 border-rose-500/40 text-rose-500'
            else if (ratio < 0.66) tone = 'bg-rose-500/20 border-rose-500/60 text-rose-500'
            else tone = 'bg-rose-500/30 border-rose-500 text-rose-50'
        }
        return tone
    }

    const getMonthLabel = (date) =>
        date.toLocaleString('default', { month: 'long', year: 'numeric' })

    const handleDeleteClick = (transaction) => {
        setTransactionToDelete(transaction)
        setIsDeleteModalOpen(true)
    }

    const handleEditClick = (transaction) => {
        setTransactionToEdit(transaction)
        setIsEditModalOpen(true)
    }

    const confirmDelete = async () => {
        if (transactionToDelete) {
            await deleteTransaction(transactionToDelete.id)
            setTransactionToDelete(null)
            toast.success('Transaction deleted')
            setIsDeleteModalOpen(false)
        }
    }

    const filterOptions = [
        { label: 'All Transactions', value: 'all' },
        { label: 'Income Only', value: 'INCOME' },
        { label: 'Expenses Only', value: 'EXPENSE' }
    ]

    if (isLoading) return <ListSkeleton />

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
                                            { label: 'Inflow Only', value: 'INCOME' },
                                            { label: 'Outflow Only', value: 'EXPENSE' }
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
                                                        (t.type === 'INCOME' ? 'bg-emerald-theme text-emerald-theme' : 'bg-rose-theme text-rose-theme')
                                                    )}>
                                                        {(t.type === 'INCOME' ? <TrendingUp size={20} /> : <TrendingDown size={20} />)}
                                                    </div>
                                                    <div>
                                                        <span className="font-bold text-foreground block">{t.category}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-sm font-medium text-muted-foreground whitespace-nowrap">{t.date}</td>
                                            <td className="px-8 py-6 text-sm text-muted-foreground max-w-[200px] truncate italic">{t.note || '-'}</td>
                                            <td className={`px-8 py-6 text-right font-black text-lg ${t.type === 'INCOME' ? 'text-emerald-theme' : 'text-foreground'}`}>
                                                {t.type === 'INCOME' ? '+' : '-'}
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
                                                    (t.type === 'INCOME' ? 'bg-emerald-theme text-emerald-theme' : 'bg-rose-theme text-rose-theme')
                                                )}>
                                                    {(t.type === 'INCOME' ? <TrendingUp size={24} /> : <TrendingDown size={24} />)}
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="font-black text-foreground text-base tracking-tight">{t.category}</p>
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">{t.date}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-3">
                                                <p className={`font-black text-lg tracking-tight ${t.type === 'INCOME' ? 'text-emerald-theme' : 'text-foreground'}`}>
                                                    {t.type === 'INCOME' ? '+' : '-'}
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
                                    {getMonthLabel(heatmapDate)}
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

                            {/* Calendar Grid */}
                            <div className="mt-4">
                                <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
                                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                                        <span key={d} className="text-[10px] font-black text-muted-foreground text-center uppercase">
                                            {d}
                                        </span>
                                    ))}
                                </div>
                                <div className="grid grid-cols-7 gap-1 sm:gap-2">
                                    {Array.from({ length: new Date(heatmapDate.getFullYear(), heatmapDate.getMonth(), 1).getDay() }).map((_, idx) => (
                                        <div key={`empty-${idx}`} />
                                    ))}
                                    {Array.from({ length: new Date(heatmapDate.getFullYear(), heatmapDate.getMonth() + 1, 0).getDate() }).map((_, idx) => {
                                        const day = idx + 1
                                        const dateStr = `${calendarMonthKey}-${String(day).padStart(2, '0')}`
                                        const isSelected = selectedCalendarDate === dateStr
                                        const bucket = dailyBuckets[day]
                                        const netLabel = bucket ? bucket.net : 0
 
                                        return (
                                            <button
                                                key={day}
                                                type="button"
                                                onClick={() => setSelectedCalendarDate(dateStr)}
                                                className={cn(
                                                    'h-11 sm:h-16 rounded-xl sm:rounded-2xl border text-[10px] sm:text-xs flex flex-col items-center justify-center gap-0.5 sm:gap-1 transition-all font-bold',
                                                    getDayIntensityClass(day),
                                                    isSelected && 'ring-2 ring-offset-2 ring-primary ring-offset-background scale-105'
                                                )}
                                            >
                                                <span className="text-[10px] sm:text-[11px]">{day}</span>
                                                <span className="text-[8px] sm:text-[9px] font-black opacity-80">
                                                    {bucket
                                                        ? `${bucket.net >= 0 ? '+' : '-'}${Math.abs(netLabel).toFixed(0)}`
                                                        : '—'}
                                                </span>
                                            </button>
                                        )
                                    })}
                                </div>

                            </div>

                            {/* Legend */}
                            <div className="mt-6 flex flex-wrap gap-4 justify-center">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-emerald-500/10 border border-emerald-500/40" />
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Net Inflow</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-rose-500/10 border border-rose-500/40" />
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Net Outflow</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-muted/40 border border-border/60" />
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">No Activity</span>
                                </div>
                            </div>

                            {/* Transactions for selected date */}
                            {selectedCalendarDate && (
                                <div className="mt-8 border-t border-border/60 pt-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Transactions on</p>
                                            <p className="text-sm font-black text-foreground">
                                                {new Date(selectedCalendarDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                            <CalendarIcon size={14} />
                                            <span>{dailyBuckets[parseInt(selectedCalendarDate.slice(8, 10), 10)]?.transactions.length || 0} items</span>
                                        </div>
                                    </div>

                                    <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                                        {dailyBuckets[parseInt(selectedCalendarDate.slice(8, 10), 10)]?.transactions.map((t) => (
                                            <div
                                                key={t.id}
                                                className="flex items-center justify-between p-3 rounded-2xl bg-muted/40 border border-border/60"
                                            >
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-black text-foreground tracking-tight">{t.category}</span>
                                                    <span className="text-[11px] text-muted-foreground truncate max-w-[160px]">{t.note || 'No description'}</span>
                                                </div>
                                                <div className="text-right">
                                                    <p className={cn(
                                                        'text-sm font-black',
                                                        t.type === 'INCOME' ? 'text-emerald-theme' : 'text-foreground'
                                                    )}>
                                                        {t.type === 'INCOME' ? '+' : '-'}
                                                        <PrivacyValue>{currencySymbol}</PrivacyValue>
                                                        <PrivacyValue>{t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</PrivacyValue>
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                        {!dailyBuckets[parseInt(selectedCalendarDate.slice(8, 10), 10)] && (
                                            <p className="text-[11px] text-muted-foreground italic">No transactions recorded for this date.</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </Card>
                    </div>
                )
            }

            {/* Confirmation Modal */}
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

        </div>
    )
}

export default Transactions
