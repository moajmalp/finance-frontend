import { cn } from '../../lib/utils'

const Button = ({ className, variant = 'primary', ...props }) => {
    const variants = {
        primary: 'bg-primary text-white shadow-twilight hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] hover:-translate-y-1',
        secondary: 'background: rgba(255, 255, 255, 0.05) border border-white/10 text-white backdrop-blur-md hover:bg-white/10',
        outline: 'border border-white/10 bg-white/5 backdrop-blur-md text-white hover:bg-white/10 hover:-translate-y-0.5',
        ghost: 'text-slate-400 hover:text-white hover:bg-white/5 transition-all',
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
