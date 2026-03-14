import { Bell, X, Info, AlertTriangle, AlertCircle, CheckCircle2, Trash2 } from 'lucide-react'
import { useTransactions } from '../context/TransactionContext'
import { motion, AnimatePresence } from 'framer-motion'
import Card from './ui/Card'
import { cn } from '../lib/utils'

const NotificationCenter = ({ isOpen, onClose }) => {
    const { alerts, markAlertRead, clearAlerts } = useTransactions()

    const getIcon = (type) => {
        switch (type) {
            case 'warning': return <AlertTriangle className="text-amber-500" size={18} />
            case 'error': return <AlertCircle className="text-rose-500" size={18} />
            case 'info': return <Info className="text-blue-500" size={18} />
            default: return <Bell className="text-primary" size={18} />
        }
    }

    const unreadCount = alerts.filter(a => !a.read).length

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
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 lg:hidden"
                    />

                    {/* Notification Panel */}
                    <motion.div
                        initial={{ opacity: 0, x: 100, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 50, scale: 0.95 }}
                        className="fixed top-4 right-4 bottom-4 w-[calc(100vw-32px)] md:w-[400px] bg-card/95 backdrop-blur-xl border border-border rounded-[2.5rem] shadow-premium z-[60] overflow-hidden flex flex-col"
                    >
                        <div className="p-8 border-b border-white/10 flex items-center justify-between bg-primary/5">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 flex items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                    <Bell size={20} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-foreground tracking-tight">Activity</h3>
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{unreadCount} New Notifications</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-muted rounded-xl transition-all">
                                <X size={20} className="text-muted-foreground" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                            <AnimatePresence mode="popLayout">
                                {alerts.length > 0 ? (
                                    alerts.map((alert, i) => (
                                        <motion.div
                                            key={alert.id}
                                            layout
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            className={cn(
                                                "p-5 rounded-3xl border border-border group transition-all relative overflow-hidden",
                                                !alert.read ? "bg-primary/5 border-primary/20 shadow-sm" : "bg-muted/30"
                                            )}
                                        >
                                            <div className="flex gap-4">
                                                <div className="shrink-0 mt-1">
                                                    {getIcon(alert.type)}
                                                </div>
                                                <div className="flex-1 space-y-1">
                                                    <p className={cn(
                                                        "text-sm font-bold leading-relaxed",
                                                        !alert.read ? "text-foreground" : "text-muted-foreground"
                                                    )}>
                                                        {alert.message}
                                                    </p>
                                                    <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">
                                                        {new Date(alert.id).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                            </div>
                                            {!alert.read && (
                                                <button
                                                    onClick={() => markAlertRead(alert.id)}
                                                    className="absolute top-4 right-4 w-2 h-2 rounded-full bg-primary"
                                                />
                                            )}
                                            <button
                                                onClick={() => markAlertRead(alert.id)} // For now just mark read or delete
                                                className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 p-1.5 hover:bg-primary/10 text-primary rounded-lg transition-all"
                                            >
                                                <CheckCircle2 size={14} />
                                            </button>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center py-20 text-center">
                                        <div className="h-20 w-20 bg-muted rounded-3xl flex items-center justify-center mb-4 opacity-50">
                                            <Bell size={40} className="text-muted-foreground" />
                                        </div>
                                        <h4 className="text-lg font-black text-foreground tracking-tight">Silent as a Vault</h4>
                                        <p className="text-sm font-medium text-muted-foreground mt-1 max-w-[200px]">No notifications to show right now.</p>
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>

                        {alerts.length > 0 && (
                            <div className="p-6 border-t border-white/10 bg-primary/5">
                                <Button
                                    onClick={clearAlerts}
                                    variant="outline"
                                    className="w-full gap-2 text-xs font-black tracking-widest uppercase hover:bg-rose-500 hover:text-white hover:border-transparent transition-all h-12"
                                >
                                    <Trash2 size={16} />
                                    Clear All activity
                                </Button>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}

export default NotificationCenter
