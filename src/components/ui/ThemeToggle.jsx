import { motion } from 'framer-motion'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme()

    return (
        <button
            onClick={toggleTheme}
            className="relative flex h-10 w-20 items-center rounded-full bg-muted p-1 transition-colors focus:outline-none"
        >
            <motion.div
                layout
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm dark:bg-slate-900"
                style={{ x: theme === 'light' ? 0 : 40 }}
            >
                {theme === 'light' ? (
                    <Sun size={18} className="text-amber-500" />
                ) : (
                    <Moon size={18} className="text-indigo-400" />
                )}
            </motion.div>
        </button>
    )
}

export default ThemeToggle
