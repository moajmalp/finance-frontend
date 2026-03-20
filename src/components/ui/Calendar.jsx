import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'
import { cn } from '../../lib/utils'

const Calendar = ({ value, onChange, label, error, className, required }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [viewDate, setViewDate] = useState(value ? new Date(value) : new Date())
    const containerRef = useRef(null)

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate()
    const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay()

    const year = viewDate.getFullYear()
    const month = viewDate.getMonth()

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ]

    const prevMonth = () => setViewDate(new Date(year, month - 1, 1))
    const nextMonth = () => setViewDate(new Date(year, month + 1, 1))

    const handleDateClick = (day) => {
        const selectedDate = new Date(year, month, day)
        onChange(selectedDate.toISOString().split('T')[0])
        setIsOpen(false)
    }

    const isSelected = (day) => {
        if (!value) return false
        const d = new Date(value)
        return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year
    }

    const isToday = (day) => {
        const today = new Date()
        return today.getDate() === day && today.getMonth() === month && today.getFullYear() === year
    }

    const formattedDisplay = value ? new Date(value).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    }) : 'Select Date'

    return (
        <div className={cn('space-y-2 w-full', className)} ref={containerRef}>
            {label && (
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            <div className="relative">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className={cn(
                        'flex h-12 w-full items-center justify-between rounded-2xl border border-border bg-card px-4 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all group hover:border-primary/30',
                        isOpen && 'ring-2 ring-primary/20 border-primary shadow-lg',
                        error && 'border-error ring-error/10',
                        !value && 'text-muted-foreground'
                    )}
                >
                    <span className="truncate">{formattedDisplay}</span>
                    <CalendarIcon size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
                </button>

                <AnimatePresence mode="wait">
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 4, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="absolute z-50 mt-2 w-[calc(100vw-3rem)] sm:w-80 p-5 glass-premium rounded-[2.5rem] shadow-premium border border-border origin-top left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-0 max-h-[75vh] md:max-h-[80vh] overflow-y-auto scrollbar-none"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <button type="button" onClick={prevMonth} className="p-2 hover:bg-muted rounded-xl text-muted-foreground transition-all">
                                    <ChevronLeft size={20} />
                                </button>
                                <span className="text-sm font-black text-foreground uppercase tracking-widest">
                                    {monthNames[month]} {year}
                                </span>
                                <button type="button" onClick={nextMonth} className="p-2 hover:bg-muted rounded-xl text-muted-foreground transition-all">
                                    <ChevronRight size={20} />
                                </button>
                            </div>

                            <div className="grid grid-cols-7 gap-1 mb-4">
                                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                                    <span key={d} className="text-[10px] font-black text-muted-foreground text-center uppercase">
                                        {d}
                                    </span>
                                ))}
                            </div>

                            <div className="grid grid-cols-7 gap-1">
                                {Array.from({ length: firstDayOfMonth(year, month) }).map((_, i) => (
                                    <div key={`empty-${i}`} />
                                ))}
                                {Array.from({ length: daysInMonth(year, month) }).map((_, i) => {
                                    const day = i + 1
                                    const selected = isSelected(day)
                                    const today = isToday(day)
                                    return (
                                        <button
                                            key={day}
                                            type="button"
                                            onClick={() => handleDateClick(day)}
                                            className={cn(
                                                'h-9 w-9 text-xs rounded-xl flex items-center justify-center transition-all font-bold',
                                                selected
                                                    ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-110 z-10'
                                                    : today
                                                        ? 'bg-primary/10 text-primary hover:bg-primary/20'
                                                        : 'text-foreground hover:bg-muted'
                                            )}
                                        >
                                            {day}
                                        </button>
                                    )
                                })}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            {error && <p className="text-[10px] font-black text-error uppercase tracking-widest ml-1">{error}</p>}
        </div>
    )
}

export default Calendar
