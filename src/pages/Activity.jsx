import { useTransactions } from '../context/TransactionContext'
import Card from '../components/ui/Card'
import { motion, AnimatePresence } from 'framer-motion'
import { History, PlusCircle, Trash2, RefreshCcw, Wallet, Target, Settings, ArrowRight } from 'lucide-react'

const Activity = ({ setActiveTab }) => {
    const { activityLog } = useTransactions()

    const handleLogClick = (type) => {
        if (!type || !setActiveTab) return

        if (type.includes('Income') || type.includes('Expense') || type.includes('Transaction') || type.includes('Transfer')) {
            setActiveTab('transactions')
        } else if (type.includes('Vault') || type.includes('Account')) {
            setActiveTab('accounts')
        } else if (type.includes('Subscription')) {
            setActiveTab('subscriptions')
        } else if (type.includes('Debt')) {
            setActiveTab('debts')
        } else if (type.includes('Goal')) {
            setActiveTab('goals')
        } else if (type.includes('Security') || type.includes('Budget')) {
            setActiveTab('settings')
        } else if (type.includes('Profile')) {
            setActiveTab('profile')
        }
    }

    const getIcon = (type) => {
        const action = type || ''
        if (action.includes('Income')) return <PlusCircle className="text-emerald-500" />
        if (action.includes('Expense')) return <ArrowRight className="text-rose-theme" />
        if (action.includes('Deleted')) return <Trash2 className="text-rose-theme opacity-80" />
        if (action.includes('Transfer')) return <RefreshCcw className="text-indigo-theme" />
        if (action.includes('Vault') || action.includes('Account')) return <Wallet className="text-amber-500" />
        if (action.includes('Goal')) return <Target className="text-primary" />
        if (action.includes('Budget')) return <Settings className="text-muted-foreground" />
        return <History className="text-muted-foreground" />
    }

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700 pb-10 max-w-4xl mx-auto">
            <div className="flex flex-col gap-1">
                <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">System Logs</h2>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Detailed trace of all financial operations in your vault</p>
            </div>

            <div className="relative">
                {/* Vertical Line */}
                <div className="absolute left-[23px] top-4 bottom-4 w-0.5 bg-border hidden md:block" />

                <div className="space-y-6">
                    <AnimatePresence initial={false}>
                        {activityLog.length > 0 ? (
                            activityLog.map((log, i) => (
                                <motion.div
                                    key={log.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.03 }}
                                    onClick={() => handleLogClick(log.type)}
                                    className="relative flex gap-5 group cursor-pointer"
                                >
                                    {/* Icon Column */}
                                    <div className="relative z-10 shrink-0">
                                        <div className="h-14 w-14 rounded-2xl bg-card border border-border shadow-sm flex items-center justify-center group-active:scale-90 group-active:border-primary/20 transition-all duration-300">
                                            <div className="scale-110">
                                                {getIcon(log.type)}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content Column */}
                                    <Card
                                        className="flex-1 border-none shadow-premium py-4 px-6 group-hover:bg-muted/30 group-active:scale-[0.99] transition-all rounded-3xl"
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div className="space-y-1">
                                                <h4 className="font-black text-foreground tracking-tight text-base">{log.type}</h4>
                                                <p className="text-xs font-bold text-muted-foreground leading-relaxed opacity-80">{log.details}</p>
                                            </div>
                                            <div className="sm:text-right flex flex-row sm:flex-col items-center sm:items-end gap-3 sm:gap-1.5 border-t sm:border-t-0 border-border/50 pt-3 sm:pt-0">
                                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">
                                                    {new Date(log.date || Date.now()).toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' })}
                                                </p>
                                                <p className="text-[10px] font-black text-primary tracking-widest uppercase mt-0.5">
                                                    {new Date(log.date || Date.now()).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true })}
                                                </p>
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            ))
                        ) : (
                            <div className="py-20 text-center border-2 border-dashed border-border rounded-[2.5rem]">
                                <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-4 opacity-50">
                                    <History size={32} className="text-muted-foreground" />
                                </div>
                                <h3 className="text-xl font-black text-foreground tracking-tight">Pristine Timeline</h3>
                                <p className="text-muted-foreground font-medium mt-1">Actions taken across the app will appear here</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}

export default Activity
