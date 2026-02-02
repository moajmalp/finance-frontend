import { useState } from 'react'
import { Home, List, PlusCircle, Settings, LogOut, Repeat, Bell, ChevronRight, Wallet, Target, History, BarChart2, FileText, Receipt, Users, Plus } from 'lucide-react'
import { cn } from '../lib/utils'
import { useTransactions } from '../context/TransactionContext'

import ConfirmationModal from '../components/ui/ConfirmationModal'

const Sidebar = ({ activeTab, setActiveTab, onOpenNotifications, unreadNotifications, isCollapsed, setIsCollapsed }) => {
    const { user, logout } = useTransactions()

    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: Home },
        { id: 'add', label: 'New Entry', icon: PlusCircle },
        { id: 'accounts', label: 'Vault', icon: Wallet },
        { id: 'debts', label: 'Split bills', icon: Users },
        { id: 'transactions', label: 'History', icon: List },
        { id: 'activity_log', label: 'operation log', icon: History },
        { id: 'goals', label: 'Targets', icon: Target },
        { id: 'subscriptions', label: 'Subscription', icon: Repeat },
        { id: 'analytics', label: 'Insight', icon: BarChart2 },
        { id: 'reports', label: 'Report', icon: FileText },
        { id: 'settings', label: 'Settings', icon: Settings },
    ]


    return (
        <aside className={cn(
            "fixed left-0 top-0 hidden h-screen glass-premium border-r border-border/50 p-6 lg:flex flex-col z-40 transition-all duration-500",
            isCollapsed ? "w-24 items-center" : "w-64"
        )}>
            {/* Logo Section */}
            <div className={cn(
                "mb-10 flex items-center justify-between w-full",
                isCollapsed ? "px-0 flex-col gap-4" : "px-2"
            )}>
                <div
                    className="flex items-center gap-3 cursor-pointer group/logo"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                >
                    <img src="/favicon.svg" alt="AJ Finance Logo" className="h-11 w-11 shrink-0 shadow-[0_0_20px_rgba(168,85,247,0.4)] group-hover/logo:scale-110 transition-transform duration-300 rounded-2xl" />
                    {!isCollapsed && (
                        <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                            <h1 className="text-xl font-black text-gradient tracking-tight">AJ Finance</h1>
                            <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mt-1 opacity-80">Syncing Flux</p>
                        </div>
                    )}
                </div>
                {!isCollapsed && (
                    <button
                        onClick={() => setIsCollapsed(true)}
                        className="p-1.5 rounded-lg border border-border/50 text-muted-foreground hover:bg-white/5 hover:text-white transition-all hidden lg:block"
                    >
                        <ChevronRight size={16} className="rotate-180" />
                    </button>
                )}
            </div>


            {/* Navigation - Scrollable area */}

            <nav className={cn(
                "flex-1 overflow-y-auto space-y-1.5 pr-2 -mr-2 scrollbar-none w-full",
                isCollapsed && "flex flex-col items-center"
            )}>
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={cn(
                            "group flex items-center gap-3 rounded-2xl transition-all duration-300",
                            isCollapsed
                                ? "h-12 w-12 justify-center p-0"
                                : "w-full px-4 py-4 text-[11px] sm:text-xs font-black uppercase tracking-[0.1em]",
                            activeTab === item.id
                                ? "bg-gradient-to-r from-primary/30 to-primary/10 text-white shadow-[0_0_20px_rgba(168,85,247,0.15)] ring-1 ring-white/10 translate-x-1"
                                : "text-slate-400 hover:bg-white/5 hover:text-white hover:translate-x-1"
                        )}
                        title={isCollapsed ? item.label : ""}
                    >
                        <item.icon size={20} className={cn("shrink-0 transition-transform duration-300 group-hover:scale-110", activeTab === item.id ? "" : "text-muted-foreground")} />
                        {!isCollapsed && (
                            <span className="tracking-tight animate-in fade-in slide-in-from-left-2 duration-300">{item.label}</span>
                        )}
                        {!isCollapsed && item.id === 'subscriptions' && (
                            <span className="ml-auto text-[8px] font-black bg-primary/20 text-primary px-1.5 py-0.5 rounded-md">AUTO</span>
                        )}
                    </button>
                ))}
            </nav>

            {/* Profile & Logout */}
            <div className={cn(
                "mt-auto space-y-6 pt-6 border-t border-border w-full",
                isCollapsed && "flex flex-col items-center"
            )}>
                <div
                    className={cn(
                        "flex items-center rounded-2xl border border-transparent hover:border-primary/10 transition-all cursor-pointer group",
                        isCollapsed ? "h-12 w-12 justify-center p-0" : "gap-4 p-2 bg-muted/20"
                    )}
                    onClick={() => setActiveTab('profile')}
                >
                    <div className="h-10 w-10 shrink-0 rounded-2xl bg-primary shadow-lg shadow-primary/20 flex items-center justify-center text-white font-black text-xs uppercase transition-transform group-hover:scale-110">
                        {user?.name?.charAt(0) || 'U'}
                    </div>
                    {!isCollapsed && (
                        <>
                            <div className="flex-1 min-w-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <p className="text-sm font-black text-foreground truncate tracking-tight">{user?.name || 'Power User'}</p>
                                <p className="text-[10px] font-bold text-muted-foreground truncate uppercase tracking-[0.15em]">Admin Tier</p>
                            </div>
                            <button
                                onClick={(e) => { e.stopPropagation(); setShowLogoutConfirm(true); }}
                                className="p-2 text-muted-foreground hover:text-rose-500 rounded-xl hover:bg-rose-500/10 transition-all"
                            >
                                <LogOut size={18} />
                            </button>
                        </>
                    )}
                </div>
                {isCollapsed && (
                    <button
                        onClick={() => setShowLogoutConfirm(true)}
                        className="h-12 w-12 flex items-center justify-center text-muted-foreground hover:text-rose-500 rounded-2xl hover:bg-rose-500/10 transition-all"
                        title="Logout"
                    >
                        <LogOut size={20} />
                    </button>
                )}
            </div>


            <ConfirmationModal
                isOpen={showLogoutConfirm}
                onClose={() => setShowLogoutConfirm(false)}
                onConfirm={logout}
                title="End Secure Session?"
                message="Are you sure you want to log out? You will need your access key to enter the vault again."
                confirmText="Log Out"
                type="primary"
            />
        </aside>
    )
}

export default Sidebar
