import React from 'react'
import { Bell, AlertTriangle, AlertCircle, Info, Trash2, CheckCircle2 } from 'lucide-react'
import { useTransactions } from '../context/TransactionContext'
import { motion, AnimatePresence } from 'framer-motion'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { cn } from '../lib/utils'
import { useMockLoading } from '../hooks/useMockLoading'
import { ListSkeleton } from '../skeletons/ListSkeleton'

const Notifications = () => {
    const isLoading = useMockLoading()
    const { alerts, markAlertRead, clearAlerts } = useTransactions()

    if (isLoading) return <ListSkeleton />

    const getIcon = (type) => {
        switch (type) {
            case 'warning': return <AlertTriangle className="text-amber-500" size={20} />
            case 'error': return <AlertCircle className="text-rose-500" size={20} />
            case 'info': return <Info className="text-blue-500" size={20} />
            default: return <Bell className="text-primary" size={20} />
        }
    }

    const unreadCount = alerts.filter(a => !a.read).length

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700 pb-10 max-w-4xl mx-auto">
            <header className="flex flex-col gap-1">
                <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">Notification Center</h2>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Stay updated with your flux activity</p>
            </header>

            <Card className="p-0 overflow-hidden border-none shadow-premium glass min-h-[600px] flex flex-col">
                <div className="p-6 sm:p-8 border-b border-border bg-card-muted/30 flex items-center justify-between sticky top-0 bg-background/50 backdrop-blur-md z-10">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-glow">
                            <Bell size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-foreground tracking-tight">Recent Activity</h3>
                            <p className="text-[10px] font-black text-primary uppercase tracking-widest">{unreadCount} Unread Alerts</p>
                        </div>
                    </div>
                    {alerts.length > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearAlerts}
                            className="bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white border-transparent transition-all h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest gap-2"
                        >
                            <Trash2 size={16} />
                            <span className="hidden sm:inline">Clear All</span>
                        </Button>
                    )}
                </div>

                <div className="flex-1 p-6 sm:p-8 space-y-4">
                    <AnimatePresence mode="popLayout">
                        {alerts.length > 0 ? (
                            alerts.map((alert) => (
                                <motion.div
                                    key={alert.id}
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className={cn(
                                        "p-6 rounded-3xl border border-border group transition-all relative overflow-hidden flex gap-5 items-start",
                                        !alert.read ? "bg-primary/5 border-primary/20 shadow-sm" : "bg-card/50 hover:bg-card/80"
                                    )}
                                >
                                    <div className={cn(
                                        "h-10 w-10 shrink-0 rounded-xl flex items-center justify-center shadow-sm mt-1",
                                        !alert.read ? "bg-background shadow-glow" : "bg-muted"
                                    )}>
                                        {getIcon(alert.type)}
                                    </div>

                                    <div className="flex-1 space-y-1">
                                        <div className="flex justify-between items-start gap-4">
                                            <p className={cn(
                                                "text-sm sm:text-base font-bold leading-relaxed",
                                                !alert.read ? "text-foreground" : "text-muted-foreground"
                                            )}>
                                                {alert.message}
                                            </p>
                                            <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest shrink-0 whitespace-nowrap">
                                                {new Date(alert.date || alert.id).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>

                                        {!alert.read && (
                                            <div className="pt-2 flex justify-end">
                                                <button
                                                    onClick={() => markAlertRead(alert.id)}
                                                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary/80 transition-colors"
                                                >
                                                    <CheckCircle2 size={14} />
                                                    Mark as read
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {!alert.read && (
                                        <div className="absolute top-6 right-6 w-2 h-2 rounded-full bg-primary shadow-glow animate-pulse md:hidden" />
                                    )}
                                </motion.div>
                            ))
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center py-32 text-center opacity-60">
                                <div className="h-24 w-24 bg-muted/50 rounded-[2rem] flex items-center justify-center mb-6 shadow-inner">
                                    <Bell size={48} className="text-muted-foreground/50" />
                                </div>
                                <h4 className="text-xl font-black text-foreground tracking-tight">All Caught Up</h4>
                                <p className="text-sm font-medium text-muted-foreground mt-2 max-w-xs mx-auto">
                                    You have no new notifications. Enjoy the silence of your vault.
                                </p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </Card>
        </div>
    )
}

export default Notifications
