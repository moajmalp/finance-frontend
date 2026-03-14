import { cn } from '../../lib/utils'

const Card = ({ className, children, ...props }) => {
    return (
        <div
            className={cn(
                'rounded-[1.5rem] sm:rounded-[2.5rem] p-6 sm:p-8 glass-card shadow-premium',
                className
            )}
            {...props}
        >
            {children}
        </div>
    )
}

export default Card
