import { useState, useRef, useEffect } from 'react'
import { ArrowLeft, CheckCircle2, Image as ImageIcon, Users, Camera, Trash2, X, Sparkles } from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Dropdown from '../components/ui/Dropdown'
import Calendar from '../components/ui/Calendar'
import { useTransactions } from '../context/TransactionContext'
import ConfirmationModal from '../components/ui/ConfirmationModal'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../lib/utils'
import { useMockLoading } from '../hooks/useMockLoading'
import { FormSkeleton } from '../skeletons/FormSkeleton'
import toast from 'react-hot-toast'
import api from '../services/api'

const AddTransaction = ({ onSuccess }) => {
    const isLoading = useMockLoading()
    const { addTransaction, addSubscription, categories, accounts, calculateBalance, currencySymbol, subscriptionKeywords } = useTransactions()

    const fileInputRef = useRef(null)
    const [formData, setFormData] = useState({
        amount: '',
        type: 'EXPENSE',
        category: '',
        accountId: accounts[0]?.id || '',
        date: new Date().toISOString().split('T')[0],
        note: '',
        isSplit: false,
        splitAmount: '',
        splitWith: '',
        receiptUrl: null
    })
    const [errors, setErrors] = useState({})
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Subscription Detection State
    const [isSubscriptionDetected, setIsSubscriptionDetected] = useState(false)
    const [createSubscription, setCreateSubscription] = useState(false)

    // Feature 1: Receipt Scanning State
    const [isScanning, setIsScanning] = useState(false)
    const [scanSuccess, setScanSuccess] = useState(false)

    const handleScanReceipt = () => {
        fileInputRef.current.click()
    }

    const handleNoteChange = (e) => {
        const val = e.target.value
        setFormData({ ...formData, note: val })

        const hasKeyword = subscriptionKeywords.some(keyword =>
            val.toLowerCase().includes(keyword.toLowerCase())
        )
        setIsSubscriptionDetected(hasKeyword)

        if (!hasKeyword) {
            setCreateSubscription(false)
        }
    }

    const validate = () => {
        const newErrors = {}
        if (!formData.amount || isNaN(formData.amount) || Number(formData.amount) <= 0) {
            newErrors.amount = 'Valid amount is required'
        }
        if (!formData.category) {
            newErrors.category = 'Please select a category'
        }
        if (!formData.accountId) {
            newErrors.accountId = 'Please select an account'
        }
        if (!formData.date) {
            newErrors.date = 'Date is required'
        }
        if (formData.isSplit) {
            if (!formData.splitAmount || isNaN(formData.splitAmount)) newErrors.splitAmount = 'Required'
            if (!formData.splitWith) newErrors.splitWith = 'Required'
        }
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleFileChange = async (e) => {
        const file = e.target.files[0]
        if (file) {
            const url = URL.createObjectURL(file)
            setFormData(prev => ({ ...prev, receiptUrl: url }))

            setIsScanning(true)
            try {
                const data = await api.scanReceipt(file)

                setFormData(prev => ({
                    ...prev,
                    amount: data.amount ? String(data.amount) : prev.amount,
                    date: data.date || prev.date,
                    // Map category if it exists in our categories, else maybe Default or Other?
                    // For now, just try to set it. Alternatively, check if valid.
                    category: data.category || prev.category,
                    note: data.merchant || prev.note
                }))

                setScanSuccess(true)
                toast.success('Receipt Scanned Successfully!')
                setTimeout(() => setScanSuccess(false), 3000)
            } catch (error) {
                console.error("Scan failed:", error)
                toast.error("Failed to analyze receipt")
            } finally {
                setIsScanning(false)
            }
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (validate()) {
            setIsConfirmModalOpen(true)
        }
    }

    const confirmSubmit = async () => {
        setIsSubmitting(true)
        setIsConfirmModalOpen(false)

        const mainTask = async () => {
            // 1. Add Transaction
            await addTransaction({
                ...formData,
                amount: Number(formData.amount),
                splitAmount: formData.isSplit ? Number(formData.splitAmount) : undefined
            })

            // 2. Add Subscription if detected and checked
            if (isSubscriptionDetected && createSubscription) {
                const nextDueDate = new Date()
                nextDueDate.setDate(nextDueDate.getDate() + 30)

                await addSubscription({
                    name: formData.note || 'New Subscription',
                    amount: Number(formData.amount),
                    category: formData.category,
                    accountId: formData.accountId,
                    frequency: 'MONTHLY',
                    nextBilling: nextDueDate.toISOString(),
                    active: true
                })
            }
        }

        toast.promise(mainTask(), {
            loading: 'Recording operation...',
            success: () => {
                setTimeout(onSuccess, 500)
                return 'Transaction committed successfully'
            },
            error: (err) => `Failed to record: ${err.response?.data?.detail || 'Unknown error'}`,
        })

        setIsSubmitting(false)
    }

    if (isLoading) return <FormSkeleton />

    return (
        <div className="max-w-xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700 pb-10">
            <div className="flex items-center gap-5">
                <button onClick={onSuccess} className="lg:hidden h-12 w-12 flex items-center justify-center bg-card border border-border rounded-2xl text-muted-foreground hover:text-foreground active:scale-90 transition-all">
                    <ArrowLeft size={24} />
                </button>
                <div className="flex flex-col gap-0.5">
                    <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">Record Operation</h2>
                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] opacity-80">Syncing with secure ledger...</p>
                </div>
            </div>

            <Card className="shadow-2xl shadow-indigo-500/5 relative rounded-[2.5rem] border-none p-6 sm:p-10">

                <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                    <div className="flex p-1.5 bg-card-muted/50 border border-border/50 rounded-2xl">
                        {['EXPENSE', 'INCOME'].map((type) => (
                            <button
                                key={type}
                                type="button"
                                onClick={() => setFormData({ ...formData, type, category: '' })}
                                className={cn(
                                    "flex-1 py-3 text-xs font-black rounded-xl transition-all capitalize tracking-widest",
                                    formData.type === type
                                        ? "bg-primary text-white shadow-lg shadow-primary/20"
                                        : "text-muted-foreground hover:text-foreground opacity-60 hover:opacity-100"
                                )}
                            >
                                {type}
                            </button>
                        ))}
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-4">
                            <Input
                                label="Transaction Amount"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                error={errors.amount}
                                required
                                className={cn(
                                    "h-16 text-2xl font-black rounded-2xl bg-card/50 transition-all duration-500",
                                    scanSuccess && "border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-500/5"
                                )}
                            />

                            {/* Quick Select Amounts */}
                            <div className="flex flex-wrap gap-2 px-1">
                                {[10, 20, 50, 100, 200, 500].map((amt) => (
                                    <button
                                        key={amt}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, amount: String(amt) })}
                                        className={cn(
                                            "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border",
                                            formData.amount === String(amt)
                                                ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                                                : "bg-card border-border/50 text-muted-foreground hover:border-primary/30 hover:text-foreground"
                                        )}
                                    >
                                        {currencySymbol}{amt}
                                    </button>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, amount: '' })}
                                    className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border bg-card border-border/50 text-rose-500 hover:bg-rose-500/5 hover:border-rose-500/30"
                                >
                                    Clear
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-[102]">
                            <Dropdown
                                label="Category"
                                options={categories[formData.type]}
                                value={formData.category}
                                onChange={(val) => setFormData({ ...formData, category: val })}
                                error={errors.category}
                                required
                                placeholder="Classification..."
                                className="h-14"
                            />

                            <Dropdown
                                label="Source Vault"
                                options={accounts.map(acc => ({
                                    label: `${acc.name} (${currencySymbol}${(calculateBalance(acc.id) || 0).toLocaleString()})`,
                                    value: acc.id
                                }))}
                                value={formData.accountId}
                                onChange={(val) => setFormData({ ...formData, accountId: val })}
                                error={errors.accountId}
                                required
                                placeholder="Select vault..."
                                className="h-14"
                            />
                        </div>

                        {/* Split Bill UI */}
                        {formData.type === 'EXPENSE' && (
                            <div className="p-5 bg-card border border-border rounded-3xl space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Users size={18} className="text-primary" />
                                        <span className="text-xs font-black uppercase tracking-widest">Split this Bill</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, isSplit: !formData.isSplit })}
                                        className={cn("w-12 h-6 rounded-full transition-colors relative", formData.isSplit ? 'bg-primary' : 'bg-muted')}
                                    >
                                        <div className={cn("absolute top-1 w-4 h-4 rounded-full bg-white transition-all", formData.isSplit ? 'left-7' : 'left-1')} />
                                    </button>
                                </div>

                                <AnimatePresence>
                                    {formData.isSplit && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="grid grid-cols-2 gap-4 pt-2 overflow-hidden"
                                        >
                                            <Input
                                                label={`Their Share (${currencySymbol})`}
                                                type="number"
                                                placeholder="0.00"
                                                value={formData.splitAmount}
                                                onChange={e => setFormData({ ...formData, splitAmount: e.target.value })}
                                                error={errors.splitAmount}
                                                required
                                                className="bg-card-muted/50"
                                            />
                                            <Input
                                                label="Split With"
                                                placeholder="Name"
                                                value={formData.splitWith}
                                                onChange={e => setFormData({ ...formData, splitWith: e.target.value })}
                                                error={errors.splitWith}
                                                required
                                                className="bg-card-muted/50"
                                            />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}

                        {/* Receipt Handler */}
                        <div className="space-y-4">
                            <span className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Evidence Capture</span>
                            <div className="relative group">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                                {formData.receiptUrl ? (
                                    <div className="relative rounded-3xl overflow-hidden aspect-[4/3] border-2 border-primary/20 shadow-xl">
                                        <img src={formData.receiptUrl} alt="Receipt Preview" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, receiptUrl: null })}
                                            className="absolute top-4 right-4 h-10 w-10 bg-rose-500 text-white rounded-xl shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current.click()}
                                        className="w-full py-10 border-2 border-dashed border-border rounded-3xl flex flex-col items-center justify-center gap-4 hover:bg-muted/30 hover:border-primary/30 transition-all group"
                                    >
                                        <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-white transition-all">
                                            <Camera size={28} />
                                        </div>
                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Attach Digital Receipt</p>
                                    </button>
                                )}
                            </div>

                            {/* Smart OCR Button */}
                            <button
                                type="button"
                                onClick={handleScanReceipt}
                                disabled={isScanning}
                                className={cn(
                                    "w-full h-12 rounded-xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest transition-all",
                                    isScanning
                                        ? "bg-primary/10 text-primary cursor-wait"
                                        : "bg-card border border-border/50 text-muted-foreground hover:text-primary hover:border-primary/50"
                                )}
                            >
                                {isScanning ? (
                                    <>
                                        <Sparkles size={16} className="animate-spin" />
                                        Scanning Intelligence...
                                    </>
                                ) : (
                                    <>
                                        <Camera size={16} />
                                        Scan Receipt (Auto-Fill)
                                    </>
                                )}
                            </button>
                        </div>

                        <Calendar
                            label="Execution Date"
                            value={formData.date}
                            onChange={(val) => setFormData({ ...formData, date: val })}
                            error={errors.date}
                            required
                        />

                        <div>
                            <Input
                                label="Narrative (Optional)"
                                placeholder="Add transaction context..."
                                value={formData.note}
                                onChange={handleNoteChange}
                                className={cn(
                                    "h-14 rounded-2xl bg-card/50 transition-all duration-500",
                                    scanSuccess && "border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-500/5"
                                )}
                            />

                            {/* Smart Subscription Detection UI */}
                            <AnimatePresence>
                                {isSubscriptionDetected && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0, y: -10 }}
                                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                                        exit={{ opacity: 0, height: 0, y: -10 }}
                                        className="mt-3 overflow-hidden"
                                    >
                                        <div
                                            className={cn(
                                                "flex items-center gap-3 p-4 rounded-xl border transition-colors cursor-pointer",
                                                createSubscription
                                                    ? "bg-primary/10 border-primary/50"
                                                    : "bg-card border-purple-500/50 hover:bg-muted/50"
                                            )}
                                            onClick={() => setCreateSubscription(!createSubscription)}
                                        >
                                            <div className={cn(
                                                "h-5 w-5 rounded-md border flex items-center justify-center transition-colors",
                                                createSubscription ? "bg-primary border-primary" : "border-primary/50"
                                            )}>
                                                {createSubscription && <CheckCircle2 size={14} className="text-white" />}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-foreground">Detected potential subscription</span>
                                                <span className="text-[10px] text-muted-foreground">Automatically track repeats</span>
                                            </div>
                                            <Sparkles size={16} className="ml-auto text-primary animate-pulse" />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    <Button type="submit" className="w-full h-16 text-sm font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/30 transition-all active:scale-95">
                        Commit Transaction
                    </Button>
                </form>
            </Card>

            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={confirmSubmit}
                title="Verify Record Entry"
                message={`Check the details before committing to vault:\n\n${formData.type.toUpperCase()}: ${formData.category}\nAmount: ${currencySymbol}${formData.amount}\nDate: ${formData.date}${createSubscription ? '\n\n(+ New Subscription Created)' : ''}`}
                confirmText="Commit Record"
                type="primary"
            />

        </div>
    )
}

export default AddTransaction
