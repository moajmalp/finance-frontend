import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, AlertCircle, X } from 'lucide-react'
import { useEffect } from 'react'

const Toast = ({ message, type = 'success', isOpen, onClose, duration = 4000, actionLabel, onAction }) => {
    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(onClose, duration)
            return () => clearTimeout(timer)
        }
    }, [isOpen, duration, onClose])

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                    className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] w-[calc(100%-2rem)] max-w-sm"
                >
                    <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-2xl flex items-center gap-3 border border-white/10">
                        <div className={type === 'success' ? 'text-emerald-400' : 'text-rose-400'}>
                            {type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                        </div>
                        <p className="flex-1 text-sm font-medium">{message}</p>
                        {onAction && (
                            <button
                                onClick={() => { onAction(); onClose(); }}
                                className="text-primary text-[10px] font-black uppercase tracking-widest px-3 py-1.5 hover:bg-primary/10 rounded-lg transition-all"
                            >
                                {actionLabel}
                            </button>
                        )}
                        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-1">
                            <X size={18} />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

export default Toast
