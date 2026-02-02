import { motion } from 'framer-motion'
import Button from './Button'

const EmptyState = ({ icon: Icon, title, message, actionText, onAction }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 px-6 text-center"
        >
            <div className="flex h-24 w-24 items-center justify-center rounded-[2rem] bg-card border border-border text-muted-foreground mb-8 shadow-premium group-hover:scale-105 transition-transform duration-500">
                <Icon size={48} className="opacity-80" />
            </div>
            <h3 className="text-2xl font-black text-foreground tracking-tight mb-2">{title}</h3>
            <p className="text-sm font-medium text-muted-foreground max-w-[320px] mb-10 leading-relaxed">{message}</p>
            {actionText && (
                <Button onClick={onAction} className="h-14 px-10 font-black text-[11px] uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20">
                    {actionText}
                </Button>
            )}
        </motion.div>
    )
}

export default EmptyState
