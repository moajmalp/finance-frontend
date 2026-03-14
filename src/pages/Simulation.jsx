import { useState, useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { Sliders, TrendingUp, Zap, Calendar, DollarSign, Wallet } from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { cn } from '../lib/utils'
import { motion } from 'framer-motion'
import { useTransactions } from '../context/TransactionContext'

const Simulation = () => {
    const { currencySymbol, income, expenses, balance } = useTransactions()

    // Simulation Parameters State
    const [cutDining, setCutDining] = useState(false)
    const [cancelSubs, setCancelSubs] = useState(false)
    const [investIncrease, setInvestIncrease] = useState(0)

    // Constants for calculation
    const BASE_MONTHLY_SAVINGS = Math.max(0, (income || 0) - (expenses || 0)) // Use real data if positive, else 0
    const DINING_SAVINGS = 5000
    const SUBS_SAVINGS = 1200

    // Generate Chart Data
    const data = useMemo(() => {
        const months = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug']
        let currentWealth = balance ?? 0
        let simulatedWealth = currentWealth

        return months.map((month, index) => {
            // Basline Path
            currentWealth += BASE_MONTHLY_SAVINGS

            // Simulated Path
            let monthlyRefinement = 0
            if (cutDining) monthlyRefinement += DINING_SAVINGS
            if (cancelSubs) monthlyRefinement += SUBS_SAVINGS
            monthlyRefinement += Number(investIncrease)

            simulatedWealth += (BASE_MONTHLY_SAVINGS + monthlyRefinement)

            // Compound interest assumption: 0.5% monthly (6% annual)
            if (index > 0) simulatedWealth *= 1.005

            return {
                name: month,
                baseline: currentWealth,
                simulation: simulatedWealth,
                gain: simulatedWealth - currentWealth
            }
        })
    }, [cutDining, cancelSubs, investIncrease, balance, BASE_MONTHLY_SAVINGS])

    const potentialGain = data[data.length - 1].gain

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
            <div className="flex flex-col gap-1">
                <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">The Simulation</h2>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Predictive wealth modeling playground</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Left Column: Controls */}
                <div className="lg:col-span-1 space-y-8">
                    <Card className="p-6 sm:p-8 space-y-8 h-full bg-card/60 backdrop-blur-xl border-none shadow-premium">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/10">
                                <Sliders size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-foreground">Parameters</h3>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Adjust Variables</p>
                            </div>
                        </div>

                        <div className="space-y-8">
                            {/* Toggle 1 */}
                            <div className="flex items-center justify-between group cursor-pointer" onClick={() => setCutDining(!cutDining)}>
                                <div className="space-y-1">
                                    <p className="text-sm font-black text-foreground">Cut Dining 50%</p>
                                    <p className="text-[10px] text-muted-foreground">Save ~{currencySymbol}5,000/mo</p>
                                </div>
                                <div className={cn(
                                    "w-12 h-7 rounded-full transition-colors relative",
                                    cutDining ? "bg-primary" : "bg-muted"
                                )}>
                                    <div className={cn(
                                        "absolute top-1 w-5 h-5 rounded-full bg-white transition-all shadow-sm",
                                        cutDining ? "left-6" : "left-1"
                                    )} />
                                </div>
                            </div>

                            {/* Toggle 2 */}
                            <div className="flex items-center justify-between group cursor-pointer" onClick={() => setCancelSubs(!cancelSubs)}>
                                <div className="space-y-1">
                                    <p className="text-sm font-black text-foreground">Optimize Subs</p>
                                    <p className="text-[10px] text-muted-foreground">Save ~{currencySymbol}1,200/mo</p>
                                </div>
                                <div className={cn(
                                    "w-12 h-7 rounded-full transition-colors relative",
                                    cancelSubs ? "bg-primary" : "bg-muted"
                                )}>
                                    <div className={cn(
                                        "absolute top-1 w-5 h-5 rounded-full bg-white transition-all shadow-sm",
                                        cancelSubs ? "left-6" : "left-1"
                                    )} />
                                </div>
                            </div>

                            {/* Slider */}
                            <div className="space-y-4 pt-4 border-t border-border/50">
                                <div className="flex justify-between items-end">
                                    <label className="text-sm font-black text-foreground">Invest Increment</label>
                                    <span className="text-xs font-black text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg">
                                        +{currencySymbol}{Number(investIncrease).toLocaleString()}
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="20000"
                                    step="1000"
                                    value={investIncrease}
                                    onChange={(e) => setInvestIncrease(e.target.value)}
                                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary hover:accent-primary-hover transition-all"
                                />
                                <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                    <span>{currencySymbol}0</span>
                                    <span>{currencySymbol}20k/mo</span>
                                </div>
                            </div>
                        </div>

                        {/* Summary Box */}
                        <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 mt-auto">
                            <div className="flex items-center gap-3 mb-2">
                                <Zap size={16} className="text-indigo-500 fill-indigo-500" />
                                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Projected Impact</span>
                            </div>
                            <p className="text-3xl font-black text-foreground tracking-tight">
                                +{currencySymbol}{potentialGain.toLocaleString()}
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-1">Extra wealth over 6 months</p>
                        </div>
                    </Card>
                </div>

                {/* Right Column: Chart */}
                <div className="lg:col-span-2">
                    <Card className="p-6 sm:p-8 h-full bg-card border-none shadow-2xl relative overflow-hidden">
                        <div className="flex items-center justify-between mb-8 relative z-10">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/10">
                                    <TrendingUp size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-foreground">Trajectory Projection</h3>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Current vs Simulated Path</p>
                                </div>
                            </div>
                        </div>

                        <div className="h-[400px] w-full relative z-10">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorSim" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorBase" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#64748b" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#64748b" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }}
                                        dy={10}
                                    />
                                    <YAxis
                                        hide
                                        domain={['auto', 'auto']}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: 'none', borderRadius: '12px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
                                        itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                                        labelStyle={{ color: '#94a3b8', marginBottom: '5px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                                        formatter={(value) => [`${currencySymbol}${value.toLocaleString()}`, '']}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="baseline"
                                        stackId="1"
                                        stroke="#64748b"
                                        fill="url(#colorBase)"
                                        strokeWidth={2}
                                        strokeDasharray="5 5"
                                        name="Current Path"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="simulation"
                                        stackId="2"
                                        stroke="#10b981"
                                        fill="url(#colorSim)"
                                        strokeWidth={3}
                                        name="Simulated Path"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Background Decor */}
                        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                            <TrendingUp size={200} />
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default Simulation
