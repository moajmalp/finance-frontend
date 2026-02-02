import { useState } from 'react'
import { Calendar as CalendarIcon, CreditCard, Plus, Repeat, Trash2, Zap, TrendingUp, AlertCircle, ChevronRight } from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import Input from '../components/ui/Input'
import Dropdown from '../components/ui/Dropdown'
import { useTransactions } from '../context/TransactionContext'
import { motion } from 'framer-motion'
import PrivacyValue from '../components/ui/PrivacyValue'
import { cn } from '../lib/utils'
import Calendar from '../components/ui/Calendar'
import ConfirmationModal from '../components/ui/ConfirmationModal'

const Subscriptions = () => {
    const { subscriptions, addSubscription, deleteSubscription, accounts, categories, currencySymbol } = useTransactions()
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
    const [confirmAction, setConfirmAction] = useState({ title: '', message: '', onConfirm: () => { } })
    const [newSub, setNewSub] = useState({
        name: '',
        amount: '',
        frequency: 'monthly',
        category: 'Subscriptions',
        accountId: accounts[0]?.id || '',
        nextBilling: new Date().toISOString().split('T')[0]
    })

    const totalMonthly = (subscriptions || [])
        .filter(s => s.active && s.frequency === 'monthly')
        .reduce((sum, s) => sum + (parseFloat(s.amount) || 0), 0)

    const annualCost = (subscriptions || [])
        .filter(s => s.active)
        .reduce((sum, s) => {
            const amount = parseFloat(s.amount) || 0
            return sum + (s.frequency === 'monthly' ? amount * 12 : amount)
        }, 0)

    const upcomingBills = subscriptions
        .filter(s => {
            const billDate = new Date(s.nextBilling)
            const today = new Date()
            const diffTime = billDate - today
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
            return diffDays >= 0 && diffDays <= 7
        })
        .sort((a, b) => new Date(a.nextBilling) - new Date(b.nextBilling))

    const handleAdd = (e) => {
        e.preventDefault()
        if (!newSub.name || !newSub.amount) return

        setConfirmAction({
            title: 'Confirm Operation Activation',
            message: `Do you want to activate the "${newSub.name}" subscription at ${currencySymbol}${newSub.amount}/${newSub.frequency}?`,
            type: 'primary',
            onConfirm: () => {
                addSubscription({
                    ...newSub,
                    amount: parseFloat(newSub.amount)
                })
                setIsAddModalOpen(false)
                setNewSub({
                    name: '',
                    amount: '',
                    frequency: 'monthly',
                    category: 'Subscriptions',
                    accountId: accounts[0]?.id || '',
                    nextBilling: new Date().toISOString().split('T')[0]
                })
            }
        })
        setIsConfirmModalOpen(true)
    }

    const handleDelete = (sub) => {
        setConfirmAction({
            title: 'Deactivate Subscription',
            message: `Are you sure you want to remove "${sub.name}" from your recurring operations? This will stop future billing predictions.`,
            type: 'danger',
            onConfirm: () => {
                deleteSubscription(sub.id)
            }
        })
        setIsConfirmModalOpen(true)
    }

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700 pb-10">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                <div className="space-y-1">
                    <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">Recurring Capital</h2>
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground">Manage your automated service commitments</p>
                </div>
                <Button onClick={() => setIsAddModalOpen(true)} className="h-14 px-8 rounded-2xl shadow-xl shadow-primary/20 gap-3">
                    <Plus size={20} />
                    <span className="font-black uppercase tracking-widest text-[10px]">Add Subscription</span>
                </Button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-8 border-none shadow-premium bg-gradient-to-br from-primary to-indigo-600 text-white flex flex-col justify-between h-48 rounded-[2.5rem] relative overflow-hidden group">
                    <Zap className="absolute -right-4 -bottom-4 h-24 w-24 opacity-10 group-hover:scale-125 transition-transform duration-700" />
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Monthly Burn</p>
                        <h3 className="text-4xl font-black mt-1 tracking-tight">
                            <PrivacyValue>{currencySymbol}</PrivacyValue>
                            <PrivacyValue>{totalMonthly.toLocaleString()}</PrivacyValue>
                        </h3>
                    </div>
                </Card>

                <Card className="p-8 border-none shadow-premium flex flex-col justify-between h-48 rounded-[2.5rem] bg-card dark:bg-slate-900/40">
                    <div>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Projected Annual</p>
                        <h3 className="text-4xl font-black text-foreground mt-1 tracking-tight">
                            <PrivacyValue>{currencySymbol}</PrivacyValue>
                            <PrivacyValue>{annualCost.toLocaleString()}</PrivacyValue>
                        </h3>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-theme">
                        <TrendingUp size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Across {subscriptions.length} active items</span>
                    </div>
                </Card>

                <Card className="p-0 border-none shadow-premium rounded-[2.5rem] overflow-hidden flex flex-col h-48 bg-card dark:bg-slate-900/40">
                    <div className="bg-amber-theme-bg p-5 border-b border-amber-theme/10 flex items-center justify-between">
                        <span className="text-[10px] font-black text-amber-theme uppercase tracking-widest">7-Day Horizon</span>
                        <AlertCircle size={16} className="text-amber-theme" />
                    </div>
                    <div className="p-5 flex-1 overflow-y-auto scrollbar-none space-y-3">
                        {upcomingBills.length > 0 ? upcomingBills.map((bill, i) => (
                            <div key={i} className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-black text-foreground">{bill.name}</p>
                                    <p className="text-[9px] font-bold text-muted-foreground uppercase">{new Date(bill.nextBilling).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
                                </div>
                                <p className="text-xs font-black text-amber-500">{currencySymbol}{bill.amount}</p>
                            </div>
                        )) : (
                            <p className="text-xs font-bold text-muted-foreground italic text-center py-4">No bills due this week.</p>
                        )}
                    </div>
                </Card>
            </div>

            {/* Subscriptions Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {subscriptions.map((sub, i) => (
                    <motion.div
                        key={sub.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                    >
                        <Card className="p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between border-none shadow-premium rounded-[2.5rem] group hover:-translate-y-1 transition-all duration-300 gap-6">
                            <div className="flex items-center gap-6">
                                <div className="h-16 w-16 rounded-[1.5rem] bg-muted/50 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shrink-0">
                                    <CreditCard size={28} />
                                </div>
                                <div>
                                    <h4 className="text-xl font-black text-foreground tracking-tight">{sub.name}</h4>
                                    <div className="flex flex-wrap items-center gap-3 mt-1">
                                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{sub.frequency}</span>
                                        <div className="h-1 w-1 rounded-full bg-border" />
                                        <span className="text-[10px] font-black text-primary uppercase tracking-widest">{sub.category}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col items-end justify-center">
                                <h4 className="text-2xl font-black text-foreground tracking-tight">
                                    <PrivacyValue>{currencySymbol}</PrivacyValue>
                                    <PrivacyValue>{sub.amount.toLocaleString()}</PrivacyValue>
                                </h4>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase mt-0.5">Due {new Date(sub.nextBilling).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
                            </div>
                            <div className="flex items-center gap-4 pt-6 sm:pt-0 border-t sm:border-t-0 border-border/50">
                                <button
                                    onClick={() => handleDelete(sub)}
                                    className="h-10 w-10 flex items-center justify-center text-muted-foreground hover:text-rose-theme hover:bg-rose-theme-bg rounded-xl transition-all active:scale-90"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add Subscribed Operation">
                <form onSubmit={handleAdd} className="space-y-6">
                    <Input
                        label="Service Name"
                        placeholder="e.g. Netflix, AWS, Gym"
                        value={newSub.name}
                        onChange={e => setNewSub({ ...newSub, name: e.target.value })}
                        required
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label={`Amount (${currencySymbol})`}
                            type="number"
                            step="0.01"
                            value={newSub.amount}
                            onChange={e => setNewSub({ ...newSub, amount: e.target.value })}
                            required
                        />
                        <Dropdown
                            label="Frequency"
                            options={[
                                { label: 'Monthly', value: 'monthly' },
                                { label: 'Yearly', value: 'yearly' }
                            ]}
                            value={newSub.frequency}
                            onChange={val => setNewSub({ ...newSub, frequency: val })}
                        />
                    </div>
                    <Dropdown
                        label="Vault to Charge"
                        options={accounts.map(acc => ({ label: acc.name, value: acc.id }))}
                        value={newSub.accountId}
                        onChange={val => setNewSub({ ...newSub, accountId: val })}
                    />
                    <Calendar
                        label="Next Billing Date"
                        value={newSub.nextBilling}
                        onChange={val => setNewSub({ ...newSub, nextBilling: val })}
                    />
                    <Button type="submit" className="w-full h-14 font-black shadow-lg">Activate Subscription</Button>
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

export default Subscriptions
