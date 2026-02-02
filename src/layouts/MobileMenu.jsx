import { motion, AnimatePresence } from 'framer-motion'
import { X, Home, List, PlusCircle, Settings, LogOut, Repeat, Wallet, Target, History, BarChart2, FileText, Users } from 'lucide-react'
import { cn } from '../lib/utils'
import { useTransactions } from '../context/TransactionContext'

const MobileMenu = ({ isOpen, onClose, activeTab, setActiveTab }) => {
    const { user, logout } = useTransactions()

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: Home },
        { id: 'add', label: 'New Entry', icon: PlusCircle },
        { id: 'accounts', label: 'Vault', icon: Wallet },
        { id: 'debts', label: 'Split bills', icon: Users },
        { id: 'transactions', label: 'History', icon: List },
        { id: 'activity_log', label: 'Operation Log', icon: History },
        { id: 'goals', label: 'Targets', icon: Target },
        { id: 'subscriptions', label: 'Subscription', icon: Repeat },
        { id: 'analytics', label: 'Insight', icon: BarChart2 },
        { id: 'reports', label: 'Report', icon: FileText },
        { id: 'settings', label: 'Settings', icon: Settings },
    ]

    const handleItemClick = (id) => {
        setActiveTab(id)
        onClose()
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] lg:hidden"
                    />

                    {/* Menu Content */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed inset-y-0 right-0 w-[80%] max-w-sm bg-card/95 backdrop-blur-2xl border-l border-white/10 z-[70] lg:hidden flex flex-col p-8"
                    >
                        <div className="flex items-center justify-between mb-10">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-2xl bg-primary flex items-center justify-center text-white shadow-glow">
                                    <span className="font-black italic">AG</span>
                                </div>
                                <div>
                                    <h2 className="text-lg font-black text-foreground tracking-tight">Antigravity</h2>
                                    <p className="text-[9px] font-black text-primary uppercase tracking-widest">Mobile Sync</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 text-muted-foreground hover:text-foreground transition-all"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <nav className="flex-1 overflow-y-auto space-y-2 pr-2 -mr-2 scrollbar-none">
                            {menuItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => handleItemClick(item.id)}
                                    className={cn(
                                        "w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300",
                                        activeTab === item.id
                                            ? "bg-primary text-white shadow-glow translate-x-1"
                                            : "text-muted-foreground hover:bg-white/5 hover:text-foreground active:scale-95"
                                    )}
                                >
                                    <item.icon size={20} className={cn(activeTab === item.id ? "opacity-100" : "opacity-40")} />
                                    <span className="text-xs font-black uppercase tracking-widest">{item.label}</span>
                                </button>
                            ))}
                        </nav>

                        <div className="mt-8 pt-8 border-t border-white/5 space-y-4">
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                                <div className="h-10 w-10 rounded-xl bg-primary text-white flex items-center justify-center font-black text-xs">
                                    {user?.name?.charAt(0) || 'U'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-black text-foreground truncate">{user?.name || 'User'}</p>
                                    <p className="text-[9px] font-black text-primary uppercase tracking-widest mt-1">Active Vault</p>
                                </div>
                            </div>
                            <button
                                onClick={logout}
                                className="w-full h-14 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-2 hover:bg-rose-500 hover:text-white transition-all active:scale-95"
                            >
                                <LogOut size={16} />
                                Terminate Session
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}

export default MobileMenu
