import { useState, useMemo } from 'react'
import { Wallet, Landmark, CreditCard, Banknote, Plus, ArrowRightLeft, TrendingUp, TrendingDown, Edit3, Trash2 } from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { useTransactions } from '../context/TransactionContext'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../lib/utils'
import Modal from '../components/ui/Modal'
import Input from '../components/ui/Input'
import Dropdown from '../components/ui/Dropdown'
import Calendar from '../components/ui/Calendar'
import PrivacyValue from '../components/ui/PrivacyValue'
import ConfirmationModal from '../components/ui/ConfirmationModal'
import { useMockLoading } from '../hooks/useMockLoading'
import toast from 'react-hot-toast'
import { GridSkeleton } from '../skeletons/GridSkeleton'

const Accounts = () => {
    const isLoading = useMockLoading()
    const { accounts, addTransfer, netWorthDelta, liabilities, addAccount, updateAccount, deleteAccount, calculateBalance, currencySymbol } = useTransactions()

    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false)
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
    const [confirmAction, setConfirmAction] = useState({ title: '', message: '', onConfirm: () => { } })
    const [transferData, setTransferData] = useState({
        fromId: '',
        toId: '',
        amount: '',
        date: new Date().toISOString().split('T')[0]
    })
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [editingAccount, setEditingAccount] = useState(null)
    const [newAccount, setNewAccount] = useState({
        name: '',
        type: 'BANK',
        initialBalance: '',
        color: 'bg-indigo-500'
    })

    const getIcon = (type) => {
        switch (type) {
            case 'BANK': return Landmark
            case 'CREDIT_CARD': return CreditCard
            case 'CASH': return Banknote
            default: return Wallet
        }
    }

    const handleTransfer = (e) => {
        e.preventDefault()
        if (!transferData.fromId || !transferData.toId || !transferData.amount) return

        const fromName = accounts.find(a => a.id === transferData.fromId)?.name
        const toName = accounts.find(a => a.id === transferData.toId)?.name

        setConfirmAction({
            title: 'Verify Transfer',
            message: `Are you sure you want to transfer ${currencySymbol}${transferData.amount} from ${fromName} to ${toName}?`,
            type: 'primary',
            onConfirm: async () => {
                await addTransfer(transferData.fromId, transferData.toId, parseFloat(transferData.amount), transferData.date)
                setIsTransferModalOpen(false)
                setIsConfirmModalOpen(false)
                setTransferData({ fromId: '', toId: '', amount: '', date: new Date().toISOString().split('T')[0] })
                toast.success('Transfer complete')
            }
        })
        setIsConfirmModalOpen(true)
    }

    const handleAddAccount = (e) => {
        e.preventDefault()
        if (!newAccount.name || !newAccount.initialBalance) return

        setConfirmAction({
            title: 'Confirm New Vault',
            message: `Do you want to establish "${newAccount.name}" as a new financial vault with an initial balance of ${currencySymbol}${newAccount.initialBalance}?`,
            type: 'primary',
            onConfirm: async () => {
                await addAccount(newAccount)
                setIsAddModalOpen(false)
                setIsConfirmModalOpen(false)
                setNewAccount({ name: '', type: 'BANK', initialBalance: '', color: 'bg-indigo-500' })
                toast.success('Vault created')
            }
        })
        setIsConfirmModalOpen(true)
    }

    const handleEditAccount = (e) => {
        e.preventDefault()
        if (!editingAccount.name) return

        setConfirmAction({
            title: 'Confirm Changes',
            message: `Apply modifications to "${editingAccount.name}"?`,
            type: 'primary',
            onConfirm: async () => {
                await updateAccount(editingAccount.id, {
                    name: editingAccount.name,
                    type: editingAccount.type,
                    color: editingAccount.color
                })
                setIsEditModalOpen(false)
                setIsConfirmModalOpen(false)
            }
        })
        setIsConfirmModalOpen(true)
    }

    const handleDeleteAccount = (acc) => {
        setConfirmAction({
            title: 'Decommission Vault',
            message: `Are you sure you want to permanently remove "${acc.name}"? This action cannot be reversed within the ledger.`,
            type: 'danger',
            onConfirm: async () => {
                await deleteAccount(acc.id)
                setIsConfirmModalOpen(false)
            }
        })
        setIsConfirmModalOpen(true)
    }

    const totalNetWorth = useMemo(() =>
        accounts.reduce((acc, curr) => acc + calculateBalance(curr.id), 0)
        , [accounts, calculateBalance])

    if (isLoading) return <GridSkeleton />

    const colors = [
        { name: 'Indigo', value: 'bg-indigo-500' },
        { name: 'Emerald', value: 'bg-emerald-500' },
        { name: 'Rose', value: 'bg-rose-500' },
        { name: 'Amber', value: 'bg-amber-500' },
        { name: 'Sky', value: 'bg-sky-500' },
        { name: 'Violet', value: 'bg-violet-500' },
    ]

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700 pb-10">
            <div className="flex flex-col gap-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">Financial Vault</h2>
                        <p className="text-xs sm:text-sm font-medium text-muted-foreground mt-1 leading-relaxed">Secure management of your capital assets</p>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                    <Button onClick={() => setIsTransferModalOpen(true)} variant="outline" className="flex-1 h-14 rounded-2xl font-black text-[11px] uppercase tracking-widest gap-2 bg-card/50">
                        <ArrowRightLeft size={18} />
                        Transfer
                    </Button>
                    <Button onClick={() => setIsAddModalOpen(true)} className="flex-1 h-14 rounded-2xl font-black text-[11px] uppercase tracking-widest gap-2 shadow-xl shadow-primary/20">
                        <Plus size={18} />
                        New Vault
                    </Button>
                </div>
            </div>

            {/* Net Worth Summary */}
            <Card className="bg-gradient-to-br from-primary to-indigo-600 text-white border-none relative overflow-hidden group shadow-2xl shadow-primary/30 p-8 sm:p-10 rounded-[3rem]">
                <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[150%] bg-white/10 rounded-full blur-[100px] group-hover:scale-125 transition-transform duration-[2000ms]" />
                <div className="relative z-10">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/60">Total Capital Balance</p>
                    <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black mt-4 tracking-tighter leading-tight flex flex-wrap items-baseline gap-x-2">
                        <PrivacyValue>{currencySymbol}</PrivacyValue>
                        <PrivacyValue>{totalNetWorth.toLocaleString(undefined, { minimumFractionDigits: 2 })}</PrivacyValue>
                    </h2>

                    <div className="grid grid-cols-2 gap-8 mt-10">
                        <div className="space-y-2">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Monthly Flow</p>
                            <div className="flex items-center gap-2">
                                <div className={cn("p-1.5 rounded-lg", netWorthDelta >= 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300')}>
                                    {netWorthDelta >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                </div>
                                <div className={cn("text-base font-black tracking-tight flex", netWorthDelta >= 0 ? 'text-emerald-300' : 'text-rose-300')}>
                                    {netWorthDelta >= 0 ? '+' : '-'}
                                    <PrivacyValue>{currencySymbol}</PrivacyValue>
                                    <PrivacyValue>{Math.abs(netWorthDelta).toLocaleString()}</PrivacyValue>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Liability</p>
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-rose-500/20 text-rose-300 rounded-lg">
                                    <TrendingDown size={14} />
                                </div>
                                <div className="text-base font-black text-rose-300 tracking-tight flex">
                                    - <PrivacyValue>{currencySymbol}</PrivacyValue>
                                    <PrivacyValue>{liabilities.toLocaleString()}</PrivacyValue>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Accounts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                    {accounts.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="col-span-full py-12 text-center border-2 border-dashed border-border/50 rounded-[2rem]"
                        >
                            <p className="text-muted-foreground font-medium">No vaults found. Create one to get started.</p>
                        </motion.div>
                    )}
                    {accounts.map((acc, i) => {
                        if (!acc) return null;
                        const Icon = getIcon(acc.type || 'BANK')
                        const balance = calculateBalance(acc.id)
                        return (
                            <motion.div
                                key={acc.id || i}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <Card className="hover:shadow-premium hover:-translate-y-1.5 hover:scale-[1.01] transition-all duration-500 cursor-pointer group h-full flex flex-col border-border/40 dark:border-white/5">
                                    <div className="flex items-start justify-between">
                                        <div className="flex gap-2 relative z-20">
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    setEditingAccount({...acc})
                                                    setIsEditModalOpen(true)
                                                }}
                                                className="p-2 rounded-xl bg-card border border-border/50 text-muted-foreground hover:text-primary transition-all shadow-sm"
                                            >
                                                <Edit3 size={16} />
                                            </button>
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleDeleteAccount(acc)
                                                }}
                                                className="p-2 rounded-xl bg-card border border-border/50 text-muted-foreground hover:text-rose-500 transition-all shadow-sm"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                        <div className={cn("p-4 rounded-2xl text-white shadow-lg group-hover:rotate-6 transition-transform duration-500", acc.color || 'bg-gray-500')}>
                                            <Icon size={24} />
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{(acc.type || 'unknown').replace('_', ' ')}</p>
                                            <h3 className="text-lg font-black text-foreground mt-1">{acc.name || 'Unnamed Vault'}</h3>
                                        </div>
                                    </div>
                                    <div className="mt-8 flex-1">
                                        <p className="text-xs font-black text-muted-foreground uppercase tracking-widest font-bold">Available Balance</p>
                                        <div className={cn("text-2xl sm:text-3xl font-black mt-2 tracking-tight flex flex-wrap items-baseline gap-x-1", balance < 0 ? 'text-rose-theme' : 'text-foreground')}>
                                            <PrivacyValue>{currencySymbol}</PrivacyValue>
                                            <PrivacyValue>{balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</PrivacyValue>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        )
                    })}
                </AnimatePresence>
            </div>

            {/* Transfer Modal */}
            <Modal isOpen={isTransferModalOpen} onClose={() => setIsTransferModalOpen(false)} title="Internal Transfer">
                <form onSubmit={handleTransfer} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-[102]">
                        <Dropdown
                            label="From Vault"
                            options={accounts.map(a => ({
                                label: `${a.name} (${currencySymbol}${(calculateBalance(a.id) || 0).toLocaleString()})`,
                                value: a.id
                            }))}
                            value={transferData.fromId}
                            onChange={(val) => setTransferData({ ...transferData, fromId: val })}
                            placeholder="Select..."
                            required
                        />
                        <Dropdown
                            label="To Vault"
                            options={accounts.map(a => ({
                                label: `${a.name} (${currencySymbol}${(calculateBalance(a.id) || 0).toLocaleString()})`,
                                value: a.id
                            }))}
                            value={transferData.toId}
                            onChange={(val) => setTransferData({ ...transferData, toId: val })}
                            placeholder="Select..."
                            required
                        />
                    </div>
                    <Input label={`Amount (${currencySymbol})`} type="number" step="0.01" placeholder="0.00" value={transferData.amount} onChange={(e) => setTransferData({ ...transferData, amount: e.target.value })} required className="font-black" />
                    <Calendar label="Date" value={transferData.date} onChange={(val) => setTransferData({ ...transferData, date: val })} />
                    <Button type="submit" className="w-full h-14 text-lg font-black shadow-xl shadow-primary/20">Execute Transfer</Button>
                </form>
            </Modal>

            {/* Add Account Modal */}
            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="New Vault Creation">
                <form onSubmit={handleAddAccount} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <Input label="Account Name" placeholder="e.g. Savings Hub" value={newAccount.name} onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })} required />
                        <Dropdown
                            label="Vault Type"
                            options={[
                                { label: 'Bank Account', value: 'BANK' },
                                { label: 'Credit Card', value: 'CREDIT_CARD' },
                                { label: 'Cash Wallet', value: 'CASH' },
                                { label: 'Investment Wallet', value: 'WALLET' }
                            ]}
                            value={newAccount.type}
                            onChange={(val) => setNewAccount({ ...newAccount, type: val })}
                        />
                    </div>
                    <Input label="Initial Deposit" type="number" step="0.1" placeholder="0.00" value={newAccount.initialBalance} onChange={(e) => setNewAccount({ ...newAccount, initialBalance: e.target.value })} required />
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Identity Color</label>
                        <div className="flex flex-wrap gap-3">
                            {colors.map(c => (
                                <button
                                    key={c.value}
                                    type="button"
                                    onClick={() => setNewAccount({ ...newAccount, color: c.value })}
                                    className={`h-10 w-10 rounded-xl transition-all ${c.value} ${newAccount.color === c.value ? 'ring-4 ring-primary/30 scale-110 shadow-lg' : 'opacity-60 hover:opacity-100'}`}
                                />
                            ))}
                        </div>
                    </div>
                    <Button type="submit" className="w-full py-4 text-lg font-black shadow-xl">Create Vault</Button>
                </form>
            </Modal>
            {/* Edit Account Modal */}
            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Update Vault Parameters">
                {editingAccount && (
                    <form onSubmit={handleEditAccount} className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <Input label="Account Name" placeholder="e.g. Savings Hub" value={editingAccount.name} onChange={(e) => setEditingAccount({ ...editingAccount, name: e.target.value })} required />
                            <Dropdown
                                label="Vault Type"
                                options={[
                                    { label: 'Bank Account', value: 'BANK' },
                                    { label: 'Credit Card', value: 'CREDIT_CARD' },
                                    { label: 'Cash Wallet', value: 'CASH' },
                                    { label: 'Investment Wallet', value: 'WALLET' }
                                ]}
                                value={editingAccount.type}
                                onChange={(val) => setEditingAccount({ ...editingAccount, type: val })}
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Identity Color</label>
                            <div className="flex flex-wrap gap-3">
                                {colors.map(c => (
                                    <button
                                        key={c.value}
                                        type="button"
                                        onClick={() => setEditingAccount({ ...editingAccount, color: c.value })}
                                        className={`h-10 w-10 rounded-xl transition-all ${c.value} ${editingAccount.color === c.value ? 'ring-4 ring-primary/30 scale-110 shadow-lg' : 'opacity-60 hover:opacity-100'}`}
                                    />
                                ))}
                            </div>
                        </div>
                        <Button type="submit" className="w-full py-4 text-lg font-black shadow-xl">Apply Modifications</Button>
                    </form>
                )}
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

export default Accounts
