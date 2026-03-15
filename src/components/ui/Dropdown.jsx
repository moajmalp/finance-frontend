import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Search, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../../lib/utils'

const Dropdown = ({
    options,
    value,
    onChange,
    placeholder = "Select option",
    label,
    className,
    searchable = true,
    error,
    required
}) => {
    const [isOpen, setIsOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const dropdownRef = useRef(null)

    // Handle both array of strings and array of objects
    const normalizedOptions = (options || []).map(opt => {
        if (typeof opt === 'string') return { label: opt, value: opt }
        return opt
    })

    const selectedOption = normalizedOptions.find(opt => opt.value === value || opt.id === value)

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const filteredOptions = normalizedOptions.filter(opt =>
        opt.label.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className={cn("space-y-2 w-full", className)} ref={dropdownRef}>
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
                        "w-full h-12 px-4 rounded-2xl bg-card dark:bg-slate-900 border border-border/50 flex items-center justify-between transition-all group hover:border-primary/30",
                        isOpen && "ring-4 ring-primary/10 border-primary shadow-lg",
                        error && "border-error ring-error/10"
                    )}
                >
                    <span className={cn("text-sm font-bold truncate", !selectedOption && "text-muted-foreground")}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                    <ChevronDown size={18} className={cn("text-muted-foreground transition-transform duration-300", isOpen && "rotate-180")} />
                </button>

                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute z-50 w-full mt-2 glass-premium border border-border/50 rounded-[2rem] shadow-premium overflow-hidden origin-top"
                        >
                            {searchable && (
                                <div className="p-3 border-b border-border/50 bg-muted/30 dark:bg-slate-900/50">
                                    <div className="relative">
                                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                        <input
                                            autoFocus
                                            type="text"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            placeholder="Search..."
                                            className="w-full h-10 pl-9 pr-4 bg-background dark:bg-slate-950 border border-border/50 rounded-xl text-[11px] font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all placeholder:text-muted-foreground/50"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="max-h-60 overflow-y-auto p-2 scrollbar-none">
                                {filteredOptions.length > 0 ? (
                                    filteredOptions.map((option, idx) => {
                                        const isSelected = value === option.value || value === option.id
                                        return (
                                            <button
                                                key={option.value || option.id || idx}
                                                type="button"
                                                onClick={() => {
                                                    onChange(option.value || option.id)
                                                    setIsOpen(false)
                                                    setSearchTerm('')
                                                }}
                                                className={cn(
                                                    "w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all group",
                                                    isSelected
                                                        ? "bg-primary text-white shadow-md shadow-primary/20"
                                                        : "hover:bg-muted text-foreground"
                                                )}
                                            >
                                                <div className="flex items-center gap-3">
                                                    {option.icon && <option.icon size={16} className={cn(isSelected ? "text-white" : "text-muted-foreground")} />}
                                                    <span>{option.label}</span>
                                                </div>
                                                {isSelected && <Check size={16} />}
                                            </button>
                                        )
                                    })
                                ) : (
                                    <div className="p-4 text-center text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                        No results
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            {error && <p className="text-[10px] font-black text-error uppercase tracking-widest ml-1">{error}</p>}
        </div>
    )
}

export default Dropdown
