import { useState, useEffect, useRef } from 'react'
import { Camera, X } from 'lucide-react'
import Modal from './Modal'
import Input from './Input'
import Button from './Button'
import Dropdown from './Dropdown'
import Calendar from './Calendar'
import { useTransactions } from '../../context/TransactionContext'
import ConfirmationModal from './ConfirmationModal'
import { cn } from '../../lib/utils'

const EditTransactionModal = ({ isOpen, onClose, transaction }) => {
    const { updateTransaction, categories, currencySymbol } = useTransactions()
    const [amount, setAmount] = useState('')
    const [category, setCategory] = useState('')
    const [type, setType] = useState('EXPENSE')
    const [note, setNote] = useState('')
    const [date, setDate] = useState('')
    const [receiptUrl, setReceiptUrl] = useState(null)
    const fileInputRef = useRef(null)
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)

    useEffect(() => {
        if (transaction) {
            setAmount(transaction.amount.toString())
            setCategory(transaction.category)
            setType(transaction.type)
            setNote(transaction.note || '')
            setDate(transaction.date)
            setReceiptUrl(transaction.receipt_url || null)
        }
    }, [transaction])

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setReceiptUrl(reader.result)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!amount || !category) return
        setIsConfirmModalOpen(true)
    }

    const handleConfirmUpdate = () => {
        updateTransaction(transaction.id, {
            amount: parseFloat(amount),
            category,
            type,
            note,
            date,
            receiptUrl
        })
        onClose()
    }

    if (!transaction) return null

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit Transaction">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex p-1.5 bg-muted/50 rounded-[1.25rem] border border-border/50">
                    <button
                        type="button"
                        onClick={() => setType('EXPENSE')}
                        className={`flex-1 py-3 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all ${type === 'EXPENSE' ? 'bg-card dark:bg-slate-900 text-rose-theme shadow-lg' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        Expense
                    </button>
                    <button
                        type="button"
                        onClick={() => setType('INCOME')}
                        className={`flex-1 py-3 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all ${type === 'INCOME' ? 'bg-card dark:bg-slate-900 text-emerald-theme shadow-lg' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        Income
                    </button>
                </div>

                <Input
                    label={`Amount (${currencySymbol})`}
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    className="text-lg font-black"
                />

                <Dropdown
                    label="Category"
                    options={(categories[type] || []).map(c => ({ label: c, value: c }))}
                    value={category}
                    onChange={setCategory}
                    className="w-full"
                />

                <Calendar
                    label="Date"
                    value={date}
                    onChange={setDate}
                />

                <Input
                    label="Note (Optional)"
                    placeholder="Add a description..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                />

                <div className="space-y-4 pt-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Receipt Attachment</span>
                    <div className="relative group">
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                        {receiptUrl ? (
                            <div className="relative rounded-2xl overflow-hidden aspect-[16/9] border-2 border-primary/20 shadow-sm bg-card/50">
                                {receiptUrl.startsWith('data:image/') || receiptUrl.startsWith('http') || receiptUrl.startsWith('blob:') ? (
                                    <img src={receiptUrl} alt="Receipt" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
                                        <Camera size={24} />
                                        <span className="text-[10px] font-bold">Document Attached</span>
                                    </div>
                                )}
                                <button
                                    type="button"
                                    onClick={() => setReceiptUrl(null)}
                                    className="absolute top-3 right-3 h-8 w-8 bg-rose-500/90 hover:bg-rose-500 text-white rounded-lg shadow-md flex items-center justify-center hover:scale-105 transition-transform"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full py-6 border-2 border-dashed border-border/60 rounded-2xl flex flex-col items-center justify-center gap-3 hover:bg-muted/30 hover:border-primary/30 transition-all group"
                            >
                                <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-white transition-all">
                                    <Camera size={20} />
                                </div>
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Add Receipt</p>
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex gap-4 pt-4">
                    <Button type="button" variant="outline" onClick={onClose} className="flex-1 h-14 font-black">
                        Cancel
                    </Button>
                    <Button type="submit" className="flex-1 h-14 font-black shadow-lg shadow-primary/20">
                        Save Changes
                    </Button>
                </div>
            </form>

            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={handleConfirmUpdate}
                title="Verify Update"
                message={`Are you sure you want to update this record?\n\nNew Amount: ${currencySymbol}${amount}\nNew Category: ${category}`}
                confirmText="Confirm Changes"
                type="primary"
            />
        </Modal>
    )
}

export default EditTransactionModal
