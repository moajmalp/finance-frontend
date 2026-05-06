import Modal from './Modal'
import { AlertCircle, HelpCircle, ShieldAlert } from 'lucide-react'
import { cn } from '../../lib/utils'

/**
 * ConfirmationModal Component
 * A premium, minimal confirmation dialog for critical actions.
 */
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', type = 'primary' }) => {
    
    // Icon selection based on type
    const Icon = type === 'danger' ? ShieldAlert : type === 'primary' ? HelpCircle : AlertCircle

    return (
        <Modal isOpen={isOpen} onClose={onClose} className={cn("max-w-[380px] p-0 hide-close overflow-hidden rounded-[2.5rem] border-none shadow-2xl bg-card")}>
            <div className="relative p-10 flex flex-col items-center text-center">
                {/* Subtle Background Glow */}
                <div className={cn(
                    "absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 blur-[100px] opacity-20 pointer-events-none rounded-full",
                    type === 'danger' ? "bg-rose-500" : type === 'primary' ? "bg-primary" : "bg-amber-500"
                )} />

                <div className={cn(
                    "h-14 w-14 rounded-2xl flex items-center justify-center mb-6 relative z-10 transition-transform duration-500 group-hover:scale-110",
                    type === 'danger' ? "bg-rose-500/10 text-rose-500" : 
                    type === 'primary' ? "bg-primary/10 text-primary" : 
                    "bg-amber-500/10 text-amber-500"
                )}>
                    <Icon size={28} strokeWidth={1.5} />
                </div>

                <div className="space-y-2 relative z-10">
                    <h3 className="text-xl font-black text-foreground tracking-tight leading-none uppercase tracking-widest">
                        {title}
                    </h3>
                    <p className="text-xs font-medium text-muted-foreground/70 leading-relaxed max-w-[260px] mx-auto">
                        {message}
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-3 w-full mt-10 relative z-10">
                    <button
                        onClick={onClose}
                        className="h-12 px-6 rounded-xl font-black text-[9px] uppercase tracking-widest text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-300"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            onConfirm?.()
                            onClose()
                        }}
                        className={cn(
                            "h-12 px-6 rounded-xl font-black text-[9px] uppercase tracking-widest text-white shadow-xl transition-all duration-300 active:scale-95",
                            type === 'danger' ? "bg-rose-500 shadow-rose-500/20 hover:bg-rose-600" : 
                            type === 'primary' ? "bg-primary shadow-primary/20 hover:bg-primary/90" : 
                            "bg-amber-500 shadow-amber-500/20 hover:bg-amber-600"
                        )}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </Modal>
    )
}

export default ConfirmationModal
