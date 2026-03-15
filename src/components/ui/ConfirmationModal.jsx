import Modal from './Modal'
import Button from './Button'
import { AlertCircle } from 'lucide-react'
import { cn } from '../../lib/utils'

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Delete', type = 'danger' }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} className={cn("max-w-[400px] p-8 hide-close", type === 'danger' && 'rose-accent')}>
            <div className="flex flex-col items-center text-center gap-5">
                <div className={cn(
                    "flex h-20 w-20 items-center justify-center rounded-[2rem] transition-all duration-500 shadow-2xl relative group",
                    type === 'danger' ? 'bg-gradient-to-br from-rose-500 to-rose-600 text-white shadow-rose-500/40' :
                        type === 'primary' ? 'bg-gradient-to-br from-indigo-500 to-primary text-white shadow-primary/40' :
                            'bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-amber-500/40'
                )}>
                    {/* Inner Glow Effect */}
                    <div className="absolute inset-0.5 rounded-[1.9rem] bg-white/10 blur-[1px] opacity-50" />
                    <AlertCircle size={36} className="relative z-10 group-hover:scale-110 transition-transform duration-500" />
                </div>

                <div className="space-y-1.5 mt-2">
                    <h3 className="text-2xl font-black text-foreground tracking-tight leading-none">
                        {title}
                    </h3>
                    <p className="text-xs font-bold text-muted-foreground whitespace-pre-wrap max-w-[280px] leading-relaxed opacity-70">
                        {message}
                    </p>
                </div>

                <div className="flex w-full gap-4 mt-4">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="flex-1 h-14 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] border-border/50 bg-card/50 hover:bg-muted"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={() => {
                            onConfirm?.()
                            onClose()
                        }}
                        className={cn(
                            "flex-1 h-14 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl transition-all duration-300",
                            type === 'danger' ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/30' :
                                type === 'primary' ? 'bg-primary hover:bg-primary/90 text-white shadow-primary/30' :
                                    'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/30'
                        )}
                    >
                        {confirmText}
                    </Button>
                </div>
            </div>
        </Modal>
    )
}

export default ConfirmationModal
