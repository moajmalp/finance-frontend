import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '../../lib/utils'
import { createPortal } from 'react-dom'

const Modal = ({ isOpen, onClose, title, children, className }) => {
    const modalContent = (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[999] bg-slate-950/20 dark:bg-slate-950/60 backdrop-blur-sm transition-all duration-500"
                    />
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className={cn(
                                'w-full bg-card dark:bg-slate-900 text-foreground rounded-[2.5rem] shadow-premium pointer-events-auto relative overflow-hidden flex flex-col max-h-[90vh] border border-border/50',
                                className || 'max-w-lg p-6 sm:p-8'
                            )}
                        >
                            {/* Decorative Top Accent */}
                            <div className={cn("absolute top-0 left-0 right-0 h-1.5 opacity-50", className?.includes('rose') ? 'bg-rose-500' : 'bg-primary')} />

                            {(title || !className?.includes('p-0')) && (
                                <div className="flex items-center justify-between mb-4 shrink-0 px-2 pt-2">
                                    <h3 className="text-xl font-black tracking-tight">{title}</h3>
                                    {!className?.includes('hide-close') && (
                                        <button
                                            onClick={onClose}
                                            className="p-2.5 -mr-2 rounded-xl border border-transparent hover:border-border/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-all group"
                                        >
                                            <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                                        </button>
                                    )}
                                </div>
                            )}
                            <div className="overflow-y-auto pr-2 scrollbar-none flex-1">
                                {children}
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    )

    return createPortal(modalContent, document.body)
}

export default Modal
