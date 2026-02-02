import { Home, List, Wallet, PlusCircle, User, Menu } from 'lucide-react'
import { cn } from '../lib/utils'
import { motion } from 'framer-motion'

const BottomNav = ({ activeTab, setActiveTab, onOpenMenu }) => {
    const items = [
        { id: 'dashboard', label: 'Home', icon: Home },
        { id: 'accounts', label: 'Vault', icon: Wallet },
        { id: 'add', label: 'Add', icon: PlusCircle, isMain: true },
        { id: 'transactions', label: 'History', icon: List },
        { id: 'menu', label: 'Menu', icon: Menu, action: onOpenMenu },
    ]

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-24 items-center justify-around glass-premium border-t border-white/5 px-6 pb-6 lg:hidden">
            {items.map((item) => (
                <button
                    key={item.id}
                    onClick={() => item.action ? item.action() : setActiveTab(item.id)}
                    className={cn(
                        'flex flex-col items-center justify-center gap-1 transition-all relative py-2 flex-1 outline-none',
                        activeTab === item.id ? 'text-primary' : 'text-slate-400'
                    )}
                >
                    {item.isMain ? (
                        <div className="absolute -top-8 h-16 w-16 rounded-[1.25rem] bg-primary text-white flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.4)] ring-4 ring-black transform active:scale-90 transition-all">
                            <PlusCircle size={32} strokeWidth={2.5} />
                        </div>
                    ) : (
                        <>
                            <item.icon
                                size={22}
                                className={cn(
                                    'transition-all duration-300',
                                    activeTab === item.id ? 'scale-110 opacity-100' : 'opacity-40'
                                )}
                            />
                            <span className="text-[10px] font-black uppercase tracking-[0.1em] mt-1">{item.label}</span>
                        </>
                    )}

                    {activeTab === item.id && !item.isMain && (
                        <motion.div
                            layoutId="bottom-indicator"
                            className="absolute bottom-[-10px] h-1 w-6 bg-primary rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        />
                    )}
                </button>
            ))}
        </nav>
    )
}

export default BottomNav
