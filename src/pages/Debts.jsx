import { useState } from 'react'
import { Users, Plus, CheckCircle2, AlertCircle, TrendingUp, TrendingDown, DollarSign, Wallet, History, Sparkles, Trash2 } from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import Input from '../components/ui/Input'
import Dropdown from '../components/ui/Dropdown'
import { useTransactions } from '../context/TransactionContext'
import { motion, AnimatePresence } from 'framer-motion'
import PrivacyValue from '../components/ui/PrivacyValue'
import { cn } from '../lib/utils'
import Calendar from '../components/ui/Calendar'
import ConfirmationModal from '../components/ui/ConfirmationModal'
import { useMockLoading } from '../hooks/useMockLoading'
import toast from 'react-hot-toast'
import { DashboardSkeleton } from '../skeletons/DashboardSkeleton'

const Debts = () => {
    const isLoading = useMockLoading()
    const { debts, addDebt, settleDebt, deleteDebt, currencySymbol } = useTransactions()

    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
    const [confirmAction, setConfirmAction] = useState({ title: '', message: '', onConfirm: () => { } })
    const [newDebt, setNewDebt] = useState({
        person: '',
        amount: '',
        type: 'OWED_TO_ME',
        date: new Date().toISOString().split('T')[0],
        note: ''
    })

    const totalOwedToMe = (debts || []).filter(d => !d.is_settled && d.type === 'OWED_TO_ME').reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0)
    const totalIOwe = (debts || []).filter(d => !d.is_settled && d.type === 'I_OWE').reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0)

    const handleAdd = (e) => {
        e.preventDefault()
        if (!newDebt.person || !newDebt.amount) return

        setConfirmAction({
            title: 'Verify Capital Entry',
            message: `Do you want to record a ${currencySymbol}${newDebt.amount} ${newDebt.type === 'OWED_TO_ME' ? 'receivable from' : 'payable to'} ${newDebt.person}?`,
            type: 'primary',
            onConfirm: async () => {
                await addDebt({
                    ...newDebt,
                    amount: parseFloat(newDebt.amount)
                })
                setIsAddModalOpen(false)
                setIsConfirmModalOpen(false)
                setNewDebt({
                    person: '',
                    amount: '',
                    type: 'OWED_TO_ME',
                    date: new Date().toISOString().split('T')[0],
                    note: ''
                })
                toast.success('Debt record added')
            }
        })
        setIsConfirmModalOpen(true)
    }

    const handleSettleClick = (debt) => {
        setConfirmAction({
            title: 'Reconciliation Check',
            message: `Confirm that total settlement of ${currencySymbol}${debt.amount} has been ${debt.type === 'OWED_TO_ME' ? 'received from' : 'paid to'} ${debt.person_name}.`,
            type: 'primary',
            onConfirm: async () => {
                await settleDebt(debt.id)
                toast.success('Debt settled')
                setIsConfirmModalOpen(false)
            }
        })
        setIsConfirmModalOpen(true)
    }

    const handleDelete = (debt) => {
        setConfirmAction({
            title: 'Expunge Record',
            message: `Are you sure you want to permanently delete this record with ${debt.person_name}? This action cannot be undone.`,
            type: 'danger',
            onConfirm: async () => {
                await deleteDebt(debt.id)
                toast.success('Debt record deleted')
                setIsConfirmModalOpen(false)
            }
        })
        setIsConfirmModalOpen(true)
    }

    if (isLoading) return <DashboardSkeleton />

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700 pb-10">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                <div className="space-y-1">
                    <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">Social Capital</h2>
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground">Trace and settle mutual capital obligations</p>
                </div>
                <Button onClick={() => setIsAddModalOpen(true)} className="h-14 px-8 rounded-2xl shadow-xl shadow-primary/20 gap-3">
                    <Users size={20} />
                    <span className="font-black uppercase tracking-widest text-[10px]">Add Debt Record</span>
                </Button>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-8 border-none shadow-premium bg-gradient-to-br from-emerald-500 to-emerald-600 text-white flex flex-col justify-between h-48 rounded-[2.5rem] relative overflow-hidden group">
                    <div className="absolute -right-4 -bottom-4 h-24 w-24 bg-white/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                    <div className="relative z-10">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Total Receivable</p>
                        <h3 className="text-4xl font-black mt-1 tracking-tight">
                            <PrivacyValue>{currencySymbol}</PrivacyValue>
                            <PrivacyValue>{totalOwedToMe.toLocaleString()}</PrivacyValue>
                        </h3>
                    </div>
                    <div className="flex items-center gap-2 relative z-10">
                        <TrendingUp size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Capital waiting for return</span>
                    </div>
                </Card>

                <Card className="p-8 border-none shadow-premium bg-gradient-to-br from-rose-500 to-rose-600 text-white flex flex-col justify-between h-48 rounded-[2.5rem] relative overflow-hidden group">
                    <div className="absolute -right-4 -bottom-4 h-24 w-24 bg-white/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                    <div className="relative z-10">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Total Payable</p>
                        <h3 className="text-4xl font-black mt-1 tracking-tight">
                            <PrivacyValue>{currencySymbol}</PrivacyValue>
                            <PrivacyValue>{totalIOwe.toLocaleString()}</PrivacyValue>
                        </h3>
                    </div>
                    <div className="flex items-center gap-2 relative z-10">
                        <TrendingDown size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Active liabilities</span>
                    </div>
                </Card>
            </div>

            {/* Active Debts List */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-lg font-black text-foreground tracking-tight">Pending Reconciliation</h3>
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{debts.filter(d => !d.is_settled).length} Active Records</span>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    <AnimatePresence mode="popLayout">
                        {debts.filter(d => !d.is_settled).map((debt, i) => (
                            <motion.div
                                key={debt.id}
                                layout
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: i * 0.05 }}
                            >
                                <Card className="p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between border-none shadow-premium rounded-[2.5rem] group transition-all duration-300">
                                    <div className="flex items-center gap-6">
                                        <div className={cn(
                                            "h-16 w-16 rounded-[1.5rem] flex items-center justify-center transition-all group-hover:scale-110",
                                            debt.type === 'OWED_TO_ME' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                                        )}>
                                            <Users size={28} />
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-black text-foreground tracking-tight">{debt.person_name}</h4>
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">{debt.note || 'No description provided'}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between sm:justify-end gap-3 mt-6 sm:mt-0 pt-6 sm:pt-0 border-t sm:border-t-0 border-border/50">
                                        <div className="sm:text-right mr-4">
                                            <h4 className={cn(
                                                "text-2xl font-black tracking-tight",
                                                debt.type === 'OWED_TO_ME' ? 'text-emerald-500' : 'text-rose-500'
                                            )}>
                                                {debt.type === 'OWED_TO_ME' ? '+' : '-'}
                                                <PrivacyValue>{currencySymbol}</PrivacyValue>
                                                <PrivacyValue>{debt.amount.toLocaleString()}</PrivacyValue>
                                            </h4>
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase mt-0.5">{new Date(debt.due_date).toLocaleDateString()}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleSettleClick(debt)}
                                                className="h-12 w-12 rounded-xl bg-card border border-border shadow-sm flex items-center justify-center text-muted-foreground hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all duration-300"
                                                title="Mark as Settled"
                                            >
                                                <CheckCircle2 size={20} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(debt)}
                                                className="h-12 w-12 rounded-xl bg-card border border-border shadow-sm flex items-center justify-center text-muted-foreground hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all duration-300"
                                                title="Delete Record"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            {/* Recently Settled */}
            <div className="space-y-4 pt-10">
                <h3 className="text-lg font-black text-muted-foreground tracking-tight px-2">Recently Settled</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {debts.filter(d => d.is_settled).slice(0, 6).map((debt, i) => (
                        <Card key={debt.id} className="p-6 border-none shadow-premium rounded-[2rem] opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
                            <div className="flex items-center justify-between mb-4">
                                <h5 className="font-black text-foreground text-sm tracking-tight">{debt.person_name}</h5>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleDelete(debt)}
                                        className="h-8 w-8 flex items-center justify-center text-muted-foreground hover:text-rose-500 transition-colors"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                    <CheckCircle2 size={16} className="text-emerald-500" />
                                </div>
                            </div>
                            <p className="text-lg font-black text-foreground mb-1">
                                <PrivacyValue>{currencySymbol}</PrivacyValue>
                                <PrivacyValue>{debt.amount.toLocaleString()}</PrivacyValue>
                            </p>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase">{debt.type === 'OWED_TO_ME' ? 'Received' : 'Paid'}</p>
                        </Card>
                    ))}
                </div>
            </div>

            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="New Capital Obligation">
                <form onSubmit={handleAdd} className="space-y-6">
                    <Input
                        label="Entity Name"
                        placeholder="Person or Business"
                        value={newDebt.person}
                        onChange={e => setNewDebt({ ...newDebt, person: e.target.value })}
                        required
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label={`Amount (${currencySymbol})`}
                            type="number"
                            step="0.01"
                            value={newDebt.amount}
                            onChange={e => setNewDebt({ ...newDebt, amount: e.target.value })}
                            required
                        />
                        <Dropdown
                            label="Flow Direction"
                            options={[
                                { label: 'Owed to Me', value: 'OWED_TO_ME' },
                                { label: 'I Owe Him/Her', value: 'I_OWE' }
                            ]}
                            value={newDebt.type}
                            onChange={val => setNewDebt({ ...newDebt, type: val })}
                        />
                    </div>
                    <Calendar
                        label="Obligation Date"
                        value={newDebt.date}
                        onChange={val => setNewDebt({ ...newDebt, date: val })}
                    />
                    <Input
                        label="Note (Optional)"
                        placeholder="Purpose of debt"
                        value={newDebt.note}
                        onChange={e => setNewDebt({ ...newDebt, note: e.target.value })}
                    />
                    <Button type="submit" className="w-full h-14 font-black shadow-lg">Confirm Debt Entry</Button>
                </form>
            </Modal>
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

export default Debts
