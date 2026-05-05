import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { Lock, User, Mail, Check, Info, Eye, EyeOff } from 'lucide-react'
import Button from '../components/ui/Button'

const LoginPage = () => {
    const { login, register } = useAuth()
    const [formData, setFormData] = useState({ username: '', password: '' })
    const [showPassword, setShowPassword] = useState(false)
    const [isRegisterMode, setIsRegisterMode] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            if (isRegisterMode) {
                const created = await register(formData.username, formData.password)
                if (created) {
                    setIsRegisterMode(false)
                }
            } else {
                await login(formData.username, formData.password)
            }
        } catch (error) {
            console.error("Auth error:", error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-6 relative overflow-hidden">
            {/* Enhanced Premium Mesh Background */}
            <div className="absolute inset-0 bg-background" />
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] opacity-40 animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-theme/10 rounded-full blur-[120px] opacity-30" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="w-full max-w-[420px] relative z-10"
            >
                <div className="bg-card/40 backdrop-blur-2xl border border-white/10 rounded-[3rem] p-10 shadow-premium relative overflow-hidden text-center">
                    {/* Top Glow Overlay */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

                    <div className="flex flex-col items-center mb-10">
                        <div className="h-24 w-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6 shadow-inner relative group">
                            <div className="absolute inset-0 rounded-full bg-primary/5 scale-0 group-hover:scale-110 transition-transform duration-500" />
                            <User size={48} className="text-primary/60" strokeWidth={1.5} />
                        </div>
                        <h1 className="text-2xl font-black text-foreground tracking-tight">Finance OS</h1>
                        <p className="text-[10px] font-black text-primary/60 uppercase tracking-[0.3em] mt-2">
                            {isRegisterMode ? 'Create Secure Vault' : 'Access Secure Vault'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-4">
                            <div className="space-y-1.5 text-left">
                                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">
                                    Identity Access <span className="text-red-500 ml-1">*</span>
                                </label>
                                <div className="relative group border-b border-border/50 focus-within:border-primary transition-all">
                                    <Mail className="absolute left-0 top-1/2 -translate-y-1/2 text-muted-foreground/50 group-hover:text-primary/60 transition-colors" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Username or Email"
                                        className="w-full h-12 pl-8 bg-transparent border-none outline-none text-sm font-bold placeholder:text-muted-foreground/30 text-foreground"
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5 text-left">
                                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">
                                    Security Key <span className="text-red-500 ml-1">*</span>
                                </label>
                                <div className="relative group border-b border-border/50 focus-within:border-primary transition-all">
                                    <Lock className="absolute left-0 top-1/2 -translate-y-1/2 text-muted-foreground/50 group-hover:text-primary/60 transition-colors" size={16} />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Access Code"
                                        className="w-full h-12 pl-8 pr-10 bg-transparent border-none outline-none text-sm font-bold placeholder:text-muted-foreground/30 text-foreground"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground/30 hover:text-primary transition-colors p-2"
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <div className="h-4 w-4 rounded-md border border-border flex items-center justify-center transition-all group-hover:border-primary overflow-hidden">
                                    <Check size={10} className="text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <span className="text-[10px] font-bold text-muted-foreground uppercase">Remember</span>
                            </label>
                            <button
                                type="button"
                                onClick={() => setIsRegisterMode(prev => !prev)}
                                className="text-[10px] font-bold text-primary/60 uppercase tracking-widest hover:text-primary transition-colors italic"
                            >
                                {isRegisterMode ? 'Have Access?' : 'Create Account?'}
                            </button>
                        </div>

                        <Button
                            type="submit"
                            loading={loading}
                            className="w-full h-14 bg-primary text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all relative overflow-hidden group"
                        >
                            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                            <span className="relative z-10">{isRegisterMode ? 'Create Account' : 'Initialize Session'}</span>
                        </Button>
                    </form>

                </div>
            </motion.div>
        </div>
    )
}

export default LoginPage
