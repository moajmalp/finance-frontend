import { cn } from '../../lib/utils'

const Input = ({ className, label, error, required, ...props }) => {
    return (
        <div className="space-y-1.5 w-full">
            {label && (
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            <input
                className={cn(
                    'flex h-12 w-full rounded-2xl border border-border bg-card dark:bg-slate-900 px-4 py-2 text-sm text-foreground ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/10 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 shadow-sm hover:shadow-md focus:shadow-lg focus:shadow-primary/5',
                    error && 'border-error focus-visible:ring-error/10',
                    className
                )}
                {...props}
            />
            {error && <p className="text-xs text-red-500 ml-1">{error}</p>}
        </div>
    )
}

export default Input
