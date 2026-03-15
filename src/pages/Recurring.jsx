import { useState } from 'react'
import { Repeat, Plus, Trash2, Calendar as CalendarIcon, Tag, AlertCircle, CheckCircle2, Play, Pause, DollarSign } from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import Input from '../components/ui/Input'
import Dropdown from '../components/ui/Dropdown'
import Calendar from '../components/ui/Calendar'
import { useTransactions } from '../context/TransactionContext'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../lib/utils'

const Recurring = () => {
    const { recurring, setRecurring, categories, accounts } = useTransactions()
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [newRecurring, setNewRecurring] = useState({
        type: 'EXPENSE',
        category: '',
        amount: '',
        frequency: 'MONTHLY',
        startDate: new Date().toISOString().split('T')[0],
        accountId: accounts[0]?.id || '',
        note: ''
    })

    const handleAdd = (e) => {
        e.preventDefault()
        const entry = {
            ...newRecurring,
            id: Date.now(),
            amount: parseFloat(newRecurring.amount),
            active: true,
            lastRun: null
        }
        setRecurring([...recurring, entry])
        setIsAddModalOpen(false)
        setNewRecurring({
            type: 'EXPENSE',
            category: '',
            amount: '',
            frequency: 'MONTHLY',
            startDate: new Date().toISOString().split('T')[0],
            accountId: accounts[0]?.id || '',
            note: ''
        })
    }

    const toggleStatus = (id) => {
        setRecurring(recurring.map(r => r.id === id ? { ...r, active: !r.active } : r))
    }

    const removeRecurring = (id) => {
        setRecurring(recurring.filter(r => r.id !== id))
    }

    const getFrequencyLabel = (freq) => {
        const labels = { DAILY: 'Every Day', WEEKLY: 'Every Week', MONTHLY: 'Every Month' }
        return labels[freq] || freq
    }

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700 pb-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex flex-col gap-1">
                    <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">Recurring Ledger</h2>
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground">Automated subscriptions & scheduled capital flows</p>
                </div>
                <Button onClick={() => setIsAddModalOpen(true)} className="h-14 sm:h-12 w-full sm:w-auto px-8 rounded-2xl gap-2 shadow-xl shadow-primary/20">
                    <Plus size={20} />
                    Schedule Operation
                </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                    {recurring.map((rec, i) => (
                        <motion.div
                            key={rec.id}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ delay: i * 0.05 }}
                        >
                            <Card className={cn(
                                "group relative overflow-hidden transition-all duration-500 border-none shadow-2xl shadow-indigo-500/5 rounded-[2.5rem] p-6 sm:p-8",
                                !rec.active && "opacity-60 grayscale-[0.8] scale-[0.98]"
                            )}>
                                <div className="absolute -right-8 -top-8 p-10 opacity-[0.03] pointer-events-none group-hover:scale-125 group-hover:rotate-12 transition-all duration-1000 text-foreground">
                                    <Repeat size={120} />
                                </div>

                                <div className="space-y-6 relative z-10">
                                    <div className="flex items-center justify-between">
                                        <div className={cn(
                                            "h-14 w-14 rounded-2xl flex items-center justify-center shadow-lg shadow-current/10",
                                            rec.type === 'INCOME' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                                        )}>
                                            <Repeat size={24} />
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => toggleStatus(rec.id)}
                                                className={cn(
                                                    "h-10 w-10 flex items-center justify-center rounded-xl transition-all active:scale-90",
                                                    rec.active
                                                        ? 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20'
                                                        : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'
                                                )}
                                            >
                                                {rec.active ? <Pause size={18} /> : <Play size={18} />}
                                            </button>
                                            <button
                                                onClick={() => removeRecurring(rec.id)}
                                                className="h-10 w-10 flex items-center justify-center bg-rose-500/10 text-rose-500 rounded-xl hover:bg-rose-500/20 transition-all active:scale-90"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-xl font-black text-foreground tracking-tight leading-tight">{rec.category}</h4>
                                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mt-2 opacity-80">{getFrequencyLabel(rec.frequency)}</p>
                                    </div>

                                    <div className="flex items-end justify-between pt-6 mt-2 border-t border-border/50">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">Last Execution</p>
                                            <p className="text-xs font-bold text-foreground opacity-80">{rec.lastRun || 'No previous execution'}</p>
                                        </div>
                                        <div className="text-right space-y-1">
                                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">Amount</p>
                                            <p className={cn(
                                                "text-2xl font-black tracking-tight",
                                                rec.type === 'INCOME' ? 'text-emerald-500' : 'text-foreground'
                                            )}>
                                                {rec.type === 'INCOME' ? '+' : '-'}${rec.amount.toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                    {recurring.length === 0 && (
                        <div className="col-span-full py-20 text-center border-2 border-dashed border-border rounded-[2rem]">
                            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-4">
                                <Repeat size={32} className="text-muted-foreground" />
                            </div>
                            <h3 className="text-xl font-black text-foreground tracking-tight">No Recurring Entries</h3>
                            <p className="text-muted-foreground font-medium mt-1">Schedule your bills or subscriptions here</p>
                            <Button onClick={() => setIsAddModalOpen(true)} variant="outline" className="mt-8 gap-2">
                                <Plus size={18} />
                                New Schedule
                            </Button>
                        </div>
                    )}
                </AnimatePresence>
            </div>

            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Schedule Transaction">
                <form onSubmit={handleAdd} className="space-y-6">
                    <div className="flex p-1.5 bg-muted rounded-[1.25rem]">
                        {['EXPENSE', 'INCOME'].map((type) => (
                            <button
                                key={type}
                                type="button"
                                onClick={() => setNewRecurring({ ...newRecurring, type, category: '' })}
                                className={cn(
                                    "flex-1 py-3 text-sm font-black rounded-[0.9rem] transition-all capitalize",
                                    newRecurring.type === type
                                        ? "bg-card text-primary shadow-premium"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {type}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-[102]">
                        <Input
                            label="Amount ($)"
                            type="number"
                            placeholder="0.00"
                            value={newRecurring.amount}
                            onChange={(e) => setNewRecurring({ ...newRecurring, amount: e.target.value })}
                            className="text-lg font-black"
                        />
                        <Dropdown
                            label="Frequency"
                            options={[
                                { label: 'Daily', value: 'DAILY' },
                                { label: 'Weekly', value: 'WEEKLY' },
                                { label: 'Monthly', value: 'MONTHLY' }
                            ]}
                            value={newRecurring.frequency}
                            onChange={(val) => setNewRecurring({ ...newRecurring, frequency: val })}
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-[101]">
                        <Dropdown
                            label="Category"
                            options={categories[newRecurring.type]}
                            value={newRecurring.category}
                            onChange={(val) => setNewRecurring({ ...newRecurring, category: val })}
                            placeholder="Select Category"
                        />
                        <Dropdown
                            label="Vault"
                            options={accounts.map(acc => ({ label: acc.name, value: acc.id }))}
                            value={newRecurring.accountId}
                            onChange={(val) => setNewRecurring({ ...newRecurring, accountId: val })}
                            placeholder="Select Vault"
                        />
                    </div>

                    <Calendar
                        label="Start Date"
                        value={newRecurring.startDate}
                        onChange={(val) => setNewRecurring({ ...newRecurring, startDate: val })}
                    />

                    <Input
                        label="Note (Optional)"
                        placeholder="e.g. Netflix Subscription"
                        value={newRecurring.note}
                        onChange={(e) => setNewRecurring({ ...newRecurring, note: e.target.value })}
                    />

                    <Button type="submit" className="w-full h-14 text-lg font-black shadow-xl">
                        Schedule Autopay
                    </Button>
                </form>
            </Modal>
        </div>
    )
}

export default Recurring
