import { useState } from 'react'
import { Target, Plus, Trash2, Calendar as CalendarIcon, TrendingUp, DollarSign, Wallet, CheckCircle2, AlertCircle } from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import Input from '../components/ui/Input'
import Dropdown from '../components/ui/Dropdown'
import Calendar from '../components/ui/Calendar'
import { useTransactions } from '../context/TransactionContext'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../lib/utils'
import PrivacyValue from '../components/ui/PrivacyValue'
import ConfirmationModal from '../components/ui/ConfirmationModal'
import { useMockLoading } from '../hooks/useMockLoading'
import toast from 'react-hot-toast'
import { GridSkeleton } from '../skeletons/GridSkeleton'

const Goals = () => {
    const isLoading = useMockLoading()
    const { goals, addGoal, deleteGoal, updateGoal, accounts, calculateBalance, currencySymbol } = useTransactions()

    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
    const [confirmAction, setConfirmAction] = useState({ title: '', message: '', onConfirm: () => { } })
    const [newGoal, setNewGoal] = useState({
        name: '',
        targetAmount: '',
        targetDate: '',
        accountId: accounts[0]?.id || '',
        icon: 'Target'
    })

    const handleAddGoal = (e) => {
        e.preventDefault()
        if (!newGoal.name || !newGoal.targetAmount) return

        setConfirmAction({
            title: 'Confirm Strategic Target',
            message: `Establish "${newGoal.name}" as a long-term objective with a target of ${currencySymbol}${newGoal.targetAmount}?`,
            type: 'primary',
            onConfirm: async () => {
                await addGoal({
                    ...newGoal,
                    targetAmount: parseFloat(newGoal.targetAmount),
                    deadline: newGoal.targetDate
                })
                setIsAddModalOpen(false)
                setIsConfirmModalOpen(false)
                setNewGoal({ name: '', targetAmount: '', targetDate: '', accountId: accounts[0]?.id || '', icon: 'Target' })
                toast.success('Target established')
            }
        })
        setIsConfirmModalOpen(true)
    }

    const handleDeleteClick = (goal) => {
        setConfirmAction({
            title: 'Terminate Objective',
            message: `Are you sure you want to delete the "${goal.name}" target? All progress data will be permanently cleared.`,
            type: 'danger',
            onConfirm: async () => {
                await deleteGoal(goal.id)
                toast.success('Target terminated')
                setIsConfirmModalOpen(false)
            }
        })
        setIsConfirmModalOpen(true)
    }

    const calculateRemaining = (target, current) => {
        return Math.max(0, target - current)
    }

    const calculateDaysLeft = (targetDate) => {
        if (!targetDate) return null
        const diffTime = new Date(targetDate) - new Date()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays > 0 ? diffDays : 0
    }

    if (isLoading) return <GridSkeleton />

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700 pb-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex flex-col gap-1">
                    <h2 className="text-3xl sm:text-4xl font-black text-gradient tracking-tight">Milestone Radar</h2>
                    <p className="text-[10px] sm:text-xs font-black text-primary uppercase tracking-[0.3em] mt-2 opacity-80">Strategic Long-Term Objective Tracking</p>
                </div>
                <Button onClick={() => setIsAddModalOpen(true)} className="h-14 sm:h-12 w-full sm:w-auto px-8 rounded-2xl gap-2 shadow-xl shadow-primary/20">
                    <Plus size={20} />
                    Create New Target
                </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                    {goals.map((goal, i) => {
                        const currentAmount = goal.current_amount || 0
                        const targetAmount = goal.target_amount || 0
                        const percent = Math.min((currentAmount / (targetAmount || 1)) * 100, 100)
                        const daysLeft = calculateDaysLeft(goal.deadline)

                        return (
                            <motion.div
                                key={goal.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: i * 0.05 }}
                            >
                                <Card className="group relative overflow-hidden transition-all duration-500 border border-border/40 dark:border-white/5 shadow-premium hover:-translate-y-1.5 hover:scale-[1.01] rounded-[2.5rem] p-6 sm:p-8 bg-card dark:bg-slate-900/60 backdrop-blur-xl">
                                    <div className="space-y-6 relative z-10">
                                        <div className="flex items-center justify-between">
                                            <div className="h-14 w-14 rounded-2xl bg-indigo-theme-bg text-indigo-theme flex items-center justify-center shadow-lg shadow-indigo-theme/10">
                                                <Target size={28} />
                                            </div>
                                            <button
                                                onClick={() => handleDeleteClick(goal)}
                                                className="h-10 w-10 flex items-center justify-center text-muted-foreground hover:text-rose-theme hover:bg-rose-theme-bg rounded-xl transition-all active:scale-90"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>

                                        <div>
                                            <h4 className="text-xl font-black text-foreground tracking-tight leading-tight">{goal.name}</h4>
                                            <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mt-1.5 opacity-80">
                                                {accounts.find(a => a.id === goal.account_id)?.name || 'General Savings Vault'}
                                            </p>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex justify-between text-[11px] font-black uppercase tracking-widest leading-none">
                                                <span className="text-muted-foreground group-hover:text-foreground transition-colors">Completion</span>
                                                <span className="text-indigo-theme-foreground bg-indigo-theme px-2 py-0.5 rounded-md text-[9px]">{percent.toFixed(0)}%</span>
                                            </div>
                                            <div className="h-3 w-full bg-muted dark:bg-slate-800/50 rounded-full overflow-hidden border border-border/50">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${percent}%` }}
                                                    className="h-full bg-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.4)]"
                                                    transition={{ duration: 1.5, ease: [0.34, 1.56, 0.64, 1] }}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 pt-6 mt-2 border-t border-border/50">
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Accumulated</p>
                                                <p className="text-lg font-black text-foreground tracking-tight flex items-baseline">
                                                    {currencySymbol}<PrivacyValue>{currentAmount.toLocaleString()}</PrivacyValue>
                                                </p>
                                            </div>
                                            <div className="text-right space-y-1">
                                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Requirement</p>
                                                <p className="text-lg font-black text-foreground tracking-tight flex items-baseline justify-end">
                                                    {currencySymbol}<PrivacyValue>{targetAmount.toLocaleString()}</PrivacyValue>
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground group-hover:text-primary transition-colors">
                                            <CalendarIcon size={12} className="opacity-60" />
                                            {daysLeft !== null ? `${daysLeft} days until deadline` : 'Indefinite timeline'}
                                        </div>
                                    </div>

                                    {/* Progress background glow */}
                                    {percent > 0 && (
                                        <div
                                            className="absolute bottom-0 left-0 h-1.5 bg-primary/30 blur-md pointer-events-none transition-all duration-1000"
                                            style={{ width: `${percent}%` }}
                                        />
                                    )}
                                </Card>
                            </motion.div>
                        )
                    })}

                    {goals.length === 0 && (
                        <div className="col-span-full py-20 text-center border-2 border-dashed border-border rounded-[2.5rem]">
                            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-4 opacity-50">
                                <Target size={32} className="text-muted-foreground" />
                            </div>
                            <h3 className="text-xl font-black text-foreground tracking-tight">No Active Targets</h3>
                            <p className="text-muted-foreground font-medium mt-1">Set a goal to gamify your savings</p>
                            <Button onClick={() => setIsAddModalOpen(true)} variant="outline" className="mt-8 gap-2 h-11">
                                <Plus size={18} />
                                Define New Target
                            </Button>
                        </div>
                    )}
                </AnimatePresence>
            </div>

            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Define New Target">
                <form onSubmit={handleAddGoal} className="space-y-6">
                    <Input
                        label="Goal Name"
                        placeholder="e.g. New Macbook Pro"
                        value={newGoal.name}
                        onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                        required
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-[102]">
                        <Input
                            label={`Target Amount (${currencySymbol})`}
                            type="number"
                            placeholder="0.00"
                            value={newGoal.targetAmount}
                            onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
                            required
                        />
                        <Calendar
                            label="Target Date"
                            value={newGoal.targetDate}
                            onChange={(val) => setNewGoal({ ...newGoal, targetDate: val })}
                        />
                    </div>

                    <Dropdown
                        label="Linked Vault"
                        options={accounts.map(acc => ({
                            label: `${acc.name} (${currencySymbol}${(calculateBalance(acc.id) || 0).toLocaleString()})`,
                            value: acc.id
                        }))}
                        value={newGoal.accountId}
                        onChange={(val) => setNewGoal({ ...newGoal, accountId: val })}
                    />

                    <Button type="submit" className="w-full py-4 text-lg font-black shadow-xl">
                        Launch Target
                    </Button>
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

export default Goals
