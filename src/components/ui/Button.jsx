import { cn } from '../../lib/utils'
import { Loader2 } from 'lucide-react'

const Button = ({ className, variant = 'primary', loading, children, ...props }) => {
    const variants = {
        primary: 'bg-primary text-white shadow-twilight hover:shadow-primary/30 hover:-translate-y-1',
        secondary: 'bg-card-muted border border-border/50 text-foreground backdrop-blur-md hover:bg-card-muted/80',
        outline: 'border border-border/50 bg-transparent backdrop-blur-md text-foreground hover:bg-muted hover:-translate-y-0.5',
        ghost: 'text-muted-foreground hover:text-foreground hover:bg-muted transition-all',
    }

    return (
        <button
            disabled={loading}
            className={cn(
                'inline-flex items-center justify-center rounded-xl sm:rounded-2xl px-8 py-4 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.95]',
                variants[variant],
                className
            )}
            {...props}
        >
            {loading ? (
                <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Processing...</span>
                </div>
            ) : (
                children
            )}
        </button>
    )
}

export default Button
