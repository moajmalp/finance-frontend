import { cn } from '../../lib/utils'

const Button = ({ className, variant = 'primary', ...props }) => {
    const variants = {
        primary: 'bg-primary text-white shadow-twilight hover:shadow-primary/30 hover:-translate-y-1',
        secondary: 'bg-card-muted border border-border/50 text-foreground backdrop-blur-md hover:bg-card-muted/80',
        outline: 'border border-border/50 bg-transparent backdrop-blur-md text-foreground hover:bg-muted hover:-translate-y-0.5',
        ghost: 'text-muted-foreground hover:text-foreground hover:bg-muted transition-all',
    }

    return (
        <button
            className={cn(
                'inline-flex items-center justify-center rounded-xl sm:rounded-2xl px-8 py-4 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.95]',
                variants[variant],
                className
            )}
            {...props}
        />
    )
}

export default Button
