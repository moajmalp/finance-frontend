import React from 'react'
import Sidebar from './Sidebar'
import BottomNav from './BottomNav'
import { useTransactions } from '../context/TransactionContext'
import { useTheme } from '../context/ThemeContext'
import { Bell, Sun, Moon, Eye, EyeOff, Plus } from 'lucide-react'
import { cn } from '../lib/utils'

const RootLayout = ({ children, activeTab, setActiveTab, onOpenNotifications, unreadNotifications }) => {
    const { user, isPrivacyMode, setIsPrivacyMode } = useTransactions()
    const { theme, toggleTheme } = useTheme()
    const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false)

    return (
        <div className={cn(
            "min-h-screen pb-24 lg:pb-0 transition-all duration-500 transition-colors duration-500",
            isSidebarCollapsed ? "lg:pl-24" : "lg:pl-64"
        )}>
            <Sidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onOpenNotifications={onOpenNotifications}
                unreadNotifications={unreadNotifications}
                isCollapsed={isSidebarCollapsed}
                setIsCollapsed={setIsSidebarCollapsed}
            />

            {/* Desktop Top Bar */}
            <header className={cn(
                "fixed top-0 right-0 h-20 glass border-b border-border/50 z-30 hidden lg:flex items-center justify-between px-12 transition-all duration-500",
                isSidebarCollapsed ? "left-24" : "left-64"
            )}>
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-black text-gradient tracking-tight capitalize">{activeTab.replace('_', ' ')}</h1>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 border-r border-border/50 pr-4 mr-2">
                        <button
                            onClick={() => setActiveTab('add')}
                            className="h-10 w-10 flex items-center justify-center rounded-xl bg-card-muted/50 text-muted-foreground hover:bg-card-muted hover:text-foreground hover:border-border/50 border border-transparent transition-all group/header-plus"
                            title="Quick Add (New Entry) (Ctrl + E)"
                        >
                            <Plus size={18} className="group-hover/header-plus:scale-110 transition-transform" />
                        </button>
                        <button
                            onClick={() => setIsPrivacyMode(!isPrivacyMode)}
                            className={cn(
                                "h-10 w-10 flex items-center justify-center rounded-xl transition-all border border-transparent hover:border-border/50",
                                isPrivacyMode ? "bg-primary/20 text-primary" : "bg-card-muted/50 text-muted-foreground hover:bg-card-muted"
                            )}
                            title={isPrivacyMode ? "Disable Privacy Mode (Ctrl + Space)" : "Enable Privacy Mode (Ctrl + Space)"}
                        >
                            {isPrivacyMode ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>

                        <button
                            onClick={toggleTheme}
                            className="h-10 w-10 flex items-center justify-center rounded-xl bg-card-muted/50 text-muted-foreground hover:bg-card-muted hover:border-border/50 border border-transparent transition-all"
                            title={theme === 'light' ? "Switch to Dark Mode (Shift + Space)" : "Switch to Light Mode (Shift + Space)"}
                        >
                            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                        </button>
                    </div>

                    <button
                        onClick={onOpenNotifications}
                        className="p-2.5 rounded-xl border border-transparent hover:border-border/50 hover:bg-card-muted/50 text-muted-foreground transition-all relative group"
                    >
                        <Bell size={20} className="group-hover:scale-110 transition-transform" />
                        {unreadNotifications > 0 && (
                            <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full ring-2 ring-background shadow-glow" />
                        )}
                    </button>
                    <div
                        className="flex items-center gap-3 p-1.5 pr-4 rounded-2xl border border-transparent hover:border-border/50 hover:bg-card-muted/30 transition-all cursor-pointer group"
                        onClick={() => setActiveTab('profile')}
                    >
                        <div className="h-9 w-9 rounded-xl bg-primary text-white flex items-center justify-center font-black text-xs shadow-glow group-hover:rotate-6 transition-all">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                        <div className="hidden xl:block">
                            <p className="text-xs font-black text-foreground leading-none">{user?.name || 'User'}</p>
                            <p className="text-[9px] font-black text-primary uppercase tracking-widest mt-1 opacity-70">Personal Plan</p>
                        </div>
                    </div>
                </div>
            </header>


            <main className="mx-auto max-w-7xl min-h-screen">
                {/* Mobile App Header */}
                <header className="fixed top-0 left-0 right-0 h-16 glass border-b border-border/50 z-40 flex lg:hidden items-center justify-between px-6">
                    <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-primary animate-pulse shadow-glow" />
                        <h1 className="text-sm font-black text-gradient uppercase tracking-[0.2em]">{activeTab.replace('_', ' ')}</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setActiveTab('add')}
                            className="p-2 rounded-lg text-muted-foreground transition-all"
                        >
                            <Plus size={18} />
                        </button>
                        <button
                            onClick={() => setIsPrivacyMode(!isPrivacyMode)}
                            className={cn(
                                "p-2 rounded-lg transition-all",
                                isPrivacyMode ? "bg-primary/20 text-primary" : "text-muted-foreground"
                            )}
                        >
                            {isPrivacyMode ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>

                        <button
                            onClick={toggleTheme}
                            className="p-2 text-muted-foreground transition-all"
                        >
                            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                        </button>
                        <button
                            onClick={onOpenNotifications}
                            className="relative p-2 text-muted-foreground active:scale-95 transition-all"
                        >
                            <Bell size={18} />
                            {unreadNotifications > 0 && (
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full ring-2 ring-background shadow-glow" />
                            )}
                        </button>
                    </div>
                </header>


                <div className="pt-20 pb-28 px-4 lg:p-12 lg:pt-32 max-w-6xl mx-auto">
                    {children}
                </div>
            </main>

            <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
    )
}

export default RootLayout
