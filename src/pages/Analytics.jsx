import { useTransactions } from '../context/TransactionContext'
import Card from '../components/ui/Card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, TrendingDown, PieChart as PieIcon, LineChart, Calendar, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'

const Analytics = () => {
    const { transactions, categories, budgets, currencySymbol, subscriptions } = useTransactions()

    // Generate 6-month trend data
    const last6Months = Array.from({ length: 6 }).map((_, i) => {
        const d = new Date()
        d.setMonth(d.getMonth() - i)
        return d.toISOString().slice(0, 7)
    }).reverse()

    const trendData = last6Months.map(month => {
        const monthTransactions = transactions.filter(t => t.date.startsWith(month))
        const income = monthTransactions.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.amount, 0)
        const expense = monthTransactions.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + t.amount, 0)

        const dateObj = new Date(month + '-01')
        return {
            month: dateObj.toLocaleDateString(undefined, { month: 'short' }),
            income,
            expense,
            savings: income - expense
        }
    })

    // Category Breakdown (All time or current selected - let's do all time for analytics)
    const categoryData = transactions
        .filter(t => t.type === 'EXPENSE')
        .reduce((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + t.amount
            return acc
        }, {})

    const pieData = Object.entries(categoryData)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)

    const COLORS = ['var(--primary)', 'var(--emerald)', 'var(--amber)', 'var(--rose)', 'var(--indigo)', '#8b5cf6', '#ec4899', '#06b6d4']

    // Derived from real data: sustainability based on savings rate
    const avgIncome = trendData.length ? trendData.reduce((acc, d) => acc + d.income, 0) / trendData.length : 0
    const avgExpense = trendData.length ? trendData.reduce((acc, d) => acc + d.expense, 0) / trendData.length : 0
    const savingsRate = avgIncome > 0 ? Math.max(0, Math.min(100, ((avgIncome - avgExpense) / avgIncome) * 100)) : 0
    const sustainabilityScore = Math.round(savingsRate)

    // Days until next major billing (from subscriptions)
    const daysUntilNextBilling = (() => {
        if (!subscriptions?.length) return null
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        let nearest = null
        subscriptions.filter(s => s.is_active).forEach(sub => {
            const d = new Date(sub.next_billing)
            d.setHours(0, 0, 0, 0)
            const diff = Math.ceil((d - today) / (1000 * 60 * 60 * 24))
            if (diff >= 0 && (nearest === null || diff < nearest)) nearest = diff
        })
        return nearest
    })()

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700 pb-10">
            <div className="flex flex-col gap-1">
                <h2 className="text-3xl sm:text-4xl font-black text-gradient tracking-tight">System Analytics</h2>
                <p className="text-[10px] sm:text-xs font-black text-primary uppercase tracking-[0.3em] mt-2 opacity-80">Deep Pattern Recognition & Capital Flows</p>
            </div>

            {/* Trends Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                <Card className="p-6 sm:p-8 border-none shadow-2xl shadow-indigo-500/5 flex flex-col gap-8 rounded-[2.5rem]">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-black text-foreground tracking-tight">Vault Flow Trend</h3>
                            <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-1">6-Month Capital Flow</p>
                        </div>
                        <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                            <LineChart size={24} />
                        </div>
                    </div>
                    <div className="h-[280px] sm:h-[350px] w-full min-h-[280px]">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={1}>
                            <AreaChart data={trendData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 9, fontWeight: 900 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 9, fontWeight: 900 }} />
                                <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: 'var(--shadow-premium)', backgroundColor: 'var(--card)' }} />
                                <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={4} fill="url(#colorInc)" />
                                <Area type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={4} fill="url(#colorExp)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card className="p-6 sm:p-8 border-none shadow-2xl shadow-indigo-500/5 flex flex-col gap-8 rounded-[2.5rem]">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-black text-foreground tracking-tight">Category Spread</h3>
                            <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-1">Resource Allocation</p>
                        </div>
                        <div className="h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                            <PieIcon size={24} />
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-10">
                        <div className="h-[240px] w-full sm:w-1/2 min-h-[240px]">
                            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={1}>
                                <PieChart>
                                    <Pie data={pieData} innerRadius={60} outerRadius={85} paddingAngle={10} dataKey="value" stroke="none">
                                        {pieData.map((entry, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="w-full sm:w-1/2 grid grid-cols-1 gap-3">
                            {pieData.slice(0, 4).map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-card-muted/50 border border-border/50">
                                    <div className="flex items-center gap-3">
                                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                        <span className="text-[11px] font-black text-foreground uppercase tracking-tight">{item.name}</span>
                                    </div>
                                    <span className="text-xs font-black text-foreground">{currencySymbol}{item.value.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>
            </div>

            {/* Savings Capacity Section */}
            <Card className="p-8 sm:p-10 border-none shadow-2xl shadow-indigo-500/5 rounded-[3rem] relative overflow-hidden group">
                <div className="absolute -right-10 -bottom-10 h-40 w-40 bg-primary/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 relative z-10">
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-xl font-black text-foreground tracking-tight">Savings Volatility</h3>
                            <p className="text-xs font-medium text-muted-foreground mt-1 max-w-sm leading-relaxed">Analysis of month-over-month capital retention and stability metrics.</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-8 pt-2">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">Avg. Monthly Inflow</p>
                                <p className="text-3xl font-black text-emerald-500 tracking-tight">{currencySymbol}{(trendData.reduce((acc, d) => acc + d.income, 0) / 6).toFixed(0)}</p>
                            </div>
                            <div className="hidden sm:block w-px h-12 bg-border/50" />
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">Avg. Monthly Outflow</p>
                                <p className="text-3xl font-black text-rose-500 tracking-tight">{currencySymbol}{(trendData.reduce((acc, d) => acc + d.expense, 0) / 6).toFixed(0)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 max-w-md space-y-4">
                        <div className="p-5 rounded-[1.5rem] bg-indigo-500/5 border border-indigo-500/10 flex items-center gap-4 group/item hover:bg-indigo-500/10 transition-colors">
                            <div className="h-12 w-12 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
                                <TrendingUp size={24} />
                            </div>
                            <div>
                                <p className="text-xs font-black text-foreground tracking-tight">Sustainability Score: {sustainabilityScore}/100</p>
                                <p className="text-[10px] font-bold text-muted-foreground mt-0.5 leading-tight">
                                    {sustainabilityScore >= 50 ? 'Your income comfortably covers your recurring operations.' : 'Consider reducing expenses or increasing income for better stability.'}
                                </p>
                            </div>
                        </div>
                        {daysUntilNextBilling !== null && (
                            <div className="p-5 rounded-[1.5rem] bg-amber-500/5 border border-amber-500/10 flex items-center gap-4 group/item hover:bg-amber-500/10 transition-colors">
                                <div className="h-12 w-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                                    <Calendar size={24} />
                                </div>
                                <div>
                                    <p className="text-xs font-black text-foreground tracking-tight">Next Billing: {daysUntilNextBilling === 0 ? 'Today' : daysUntilNextBilling === 1 ? 'Tomorrow' : `${daysUntilNextBilling} days`}</p>
                                    <p className="text-[10px] font-bold text-muted-foreground mt-0.5 leading-tight">Upcoming subscription or recurring billing.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </Card>
        </div>
    )
}

export default Analytics
