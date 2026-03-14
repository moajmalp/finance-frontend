import { useState, useEffect } from 'react'
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
    const [type, setType] = useState('expense')
    const [note, setNote] = useState('')
    const [date, setDate] = useState('')
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)

    useEffect(() => {
        if (transaction) {
            setAmount(transaction.amount.toString())
            setCategory(transaction.category)
            setType(transaction.type)
            setNote(transaction.note || '')
            setDate(transaction.date)
        }
    }, [transaction])

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
            date
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
                        onClick={() => setType('expense')}
                        className={`flex-1 py-3 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all ${type === 'expense' ? 'bg-card dark:bg-slate-900 text-rose-theme shadow-lg' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        Expense
                    </button>
                    <button
                        type="button"
                        onClick={() => setType('income')}
                        className={`flex-1 py-3 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all ${type === 'income' ? 'bg-card dark:bg-slate-900 text-emerald-theme shadow-lg' : 'text-muted-foreground hover:text-foreground'}`}
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
