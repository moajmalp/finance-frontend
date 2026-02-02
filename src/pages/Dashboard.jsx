import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight, PieChart as PieChartIcon, Activity, Target, Sparkles } from 'lucide-react'
import Card from '../components/ui/Card'
import Dropdown from '../components/ui/Dropdown'
import { useTransactions } from '../context/TransactionContext'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart as RePieChart, Pie } from 'recharts'
import { motion } from 'framer-motion'
import { cn } from '../lib/utils'
import EmptyState from '../components/ui/EmptyState'
import Button from '../components/ui/Button'
import ForecastChart from '../components/charts/ForecastChart'
import PrivacyValue from '../components/ui/PrivacyValue'

const Dashboard = () => {
    const { balance, income, expenses, transactions, accounts, budgets, goals, insights, selectedMonth, setSelectedMonth, calculateBalance, currencySymbol } = useTransactions()


    const filteredTransactions = transactions.filter(t => t.date.startsWith(selectedMonth))

    // Compute Category Breakdown for Pie Chart
    const categoryTotals = filteredTransactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + t.amount
            return acc
        }, {})

    const pieData = Object.entries(categoryTotals)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)

    const summary = [
        {
            label: 'Total Balance',
            amount: balance || 0,
            icon: Wallet,
            color: 'text-indigo-theme',
            bg: 'bg-indigo-theme-bg',
            fill: 'bg-indigo-theme',
            glow: 'shadow-indigo-theme/10',
            trend: '+2.5%'
        },
        {
            label: 'Monthly Income',
            amount: income || 0,
            icon: TrendingUp,
            color: 'text-emerald-theme',
            bg: 'bg-emerald-theme-bg',
            fill: 'bg-emerald-theme',
            glow: 'shadow-emerald-theme/10',
            trend: '+12.3%'
        },
        {
            label: 'Monthly Expenses',
            amount: expenses || 0,
            icon: TrendingDown,
            color: 'text-rose-theme',
            bg: 'bg-rose-theme-bg',
            fill: 'bg-rose-theme',
            glow: 'shadow-rose-theme/10',
            trend: '-4.1%'
        },
    ]

    const monthOptions = [
        { label: 'March 2024', value: '2024-03' },
        { label: 'February 2024', value: '2024-02' },
        { label: 'January 2024', value: '2024-01' },
    ]

    const COLORS = ['#4338ca', '#059669', '#d97706', '#dc2626', '#7c3aed', '#db2777']

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl sm:text-4xl font-black text-gradient tracking-tight leading-tight">Financial Intelligence</h2>
                    <p className="text-[10px] sm:text-xs font-black text-primary uppercase tracking-[0.3em] mt-2 opacity-80">Quantum Ledger Analysis & Insights</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">Period:</span>
                    <Dropdown
                        options={monthOptions}
                        value={selectedMonth}
                        onChange={setSelectedMonth}
                        className="w-full sm:w-48 h-12"
                    />
                </div>
            </div>

            {/* Smart Insights */}
            {insights && insights.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {insights.map((insight) => (
                        <Card key={insight.id} className="p-5 border-none bg-card/40 hover:bg-card/60 transition-all group rounded-3xl backdrop-blur-sm">
                            <div className="flex gap-4">
                                <div className={`h-12 w-12 shrink-0 flex items-center justify-center rounded-2xl bg-background shadow-sm text-primary transition-colors`}>
                                    <Sparkles size={20} />
                                </div>
                                <div className="space-y-0.5">
                                    <h4 className="text-sm font-black text-foreground tracking-tight">{insight.title}</h4>
                                    <p className="text-[11px] font-bold text-muted-foreground mt-1 leading-relaxed opacity-70">{insight.description}</p>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Summary Cards */}
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {summary.map((item, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1, type: 'spring', stiffness: 200, damping: 20 }}
                    >
                        <Card className="flex flex-col gap-6 group hover:-translate-y-2 transition-all duration-500 cursor-pointer overflow-hidden relative border-none rounded-[2.5rem] p-8 glass-premium">
                            <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full ${item.fill} blur-3xl opacity-10 group-hover:scale-150 transition-transform duration-700`} />
                            <div className="flex items-center justify-between relative z-10">
                                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${item.bg} ${item.color} shadow-lg ${item.glow} group-hover:rotate-12 transition-all duration-500`}>
                                    <item.icon size={28} />
                                </div>
                                <div className={cn("flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full backdrop-blur-md",
                                    item.amount < 0 ? 'bg-rose-theme-bg text-rose-theme' : 'bg-emerald-theme-bg text-emerald-theme')}>
                                    {item.amount < 0 ? <ArrowDownRight size={12} strokeWidth={3} /> : <ArrowUpRight size={12} strokeWidth={3} />}
                                    {item.trend}
                                </div>
                            </div>
                            <div className="relative z-10">
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">{item.label}</p>
                                <h3 className="text-3xl font-black text-foreground mt-2 tracking-tight">
                                    <PrivacyValue>{currencySymbol}</PrivacyValue>
                                    <PrivacyValue>{(item.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</PrivacyValue>
                                </h3>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Middle Section: Accounts & Flow */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Vault Quick View */}
                    <Card className="p-0 overflow-hidden border-none shadow-premium glass">
                        <div className="p-6 border-b border-border/50 flex items-center justify-between bg-card-muted/30">
                            <h3 className="text-lg font-black text-foreground tracking-tight flex items-center gap-2">
                                <Wallet size={20} className="text-primary" />
                                Vault Summary
                            </h3>
                            <Button variant="ghost" size="sm" onClick={() => setActiveTab('accounts')} className="text-[10px] font-black tracking-widest h-8">GO TO VAULT</Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border/50">
                            {accounts && accounts.slice(0, 3).map(acc => (
                                <div key={acc.id} className="p-6 hover:bg-card-muted/50 transition-colors cursor-pointer group">
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{acc.name}</p>
                                    <h4 className="text-xl font-black text-foreground mt-1">
                                        <PrivacyValue>{currencySymbol}</PrivacyValue>
                                        <PrivacyValue>{(calculateBalance(acc.id) || 0).toLocaleString()}</PrivacyValue>
                                    </h4>
                                    <div className="mt-3 h-1 w-full bg-muted dark:bg-white/10 rounded-full overflow-hidden">
                                        <div className={`h-full ${acc.color} opacity-60`} style={{ width: '70%' }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Forecast Chart */}
                    <Card className="flex flex-col gap-8 shadow-premium border-none overflow-hidden p-8 glass-premium">
                        <div>
                            <h3 className="text-xl font-black text-foreground tracking-tight">30-Day Liquidity Forecast</h3>
                            <p className="text-sm font-medium text-muted-foreground">Predictive analysis based on current burn Rate</p>
                        </div>
                        <div className="h-[320px] w-full">
                            <ForecastChart />
                        </div>
                    </Card>
                </div>

                {/* Right Column: Budgets & Progress */}
                <div className="space-y-8">
                    {/* Budget Monitor */}
                    <Card className="flex flex-col gap-6 shadow-premium border-none glass">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
                                <Activity size={18} className="text-amber-500" />
                                Budget Monitor
                            </h3>
                            <Button variant="ghost" size="sm" className="h-8 px-2 text-[10px]">SETTINGS</Button>
                        </div>
                        <div className="space-y-6">
                            {budgets && Object.entries(budgets).length > 0 ? (
                                Object.entries(budgets).slice(0, 4).map(([cat, limit]) => {
                                    const spent = filteredTransactions
                                        .filter(t => t.category === cat && t.type === 'expense')
                                        .reduce((acc, t) => acc + t.amount, 0)
                                    const percent = Math.min((spent / limit) * 100, 100)
                                    const color = percent >= 100 ? 'bg-rose-500' : percent >= 80 ? 'bg-amber-500' : 'bg-emerald-500'

                                    return (
                                        <div key={cat} className="space-y-2">
                                            <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                                                <span className="text-muted-foreground">{cat}</span>
                                                <span className={percent >= 100 ? 'text-rose-500 font-black' : 'text-foreground'}>{percent.toFixed(0)}%</span>
                                            </div>
                                            <div className="h-2 w-full bg-muted dark:bg-slate-800 rounded-full overflow-hidden">
                                                <motion.div initial={{ width: 0 }} animate={{ width: `${percent}%` }} className={`h-full ${color}`} transition={{ duration: 1 }} />
                                            </div>
                                            <div className="flex justify-between text-[10px] font-bold text-muted-foreground opacity-60">
                                                <span>Spent: <PrivacyValue>{currencySymbol}{spent.toFixed(0)}</PrivacyValue></span>
                                                <span>Limit: <PrivacyValue>{currencySymbol}{limit.toFixed(0)}</PrivacyValue></span>
                                            </div>
                                        </div>
                                    )
                                })
                            ) : (
                                <div className="py-8 text-center border-2 border-dashed border-border/50 rounded-3xl">
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">No Active Budgets</p>
                                    <Button variant="outline" size="sm" className="mt-4 h-8 text-[10px]">SET BUDGET</Button>
                                </div>
                            )}
                        </div>
                    </Card>

                    <Card className="flex flex-col gap-6 shadow-premium border-none glass">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-black tracking-tight">Targets Progress</h3>
                            <Target size={18} className="text-primary" />
                        </div>
                        <div className="space-y-6">
                            {goals && goals.length > 0 ? (
                                goals.slice(0, 3).map(goal => {
                                    const percent = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)
                                    return (
                                        <div key={goal.id} className="space-y-2">
                                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                                <span>{goal.name}</span>
                                                <span>{percent.toFixed(0)}%</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-muted dark:bg-slate-800 rounded-full overflow-hidden">
                                                <div className="h-full bg-primary" style={{ width: `${percent}%` }} />
                                            </div>
                                        </div>
                                    )
                                })
                            ) : (
                                <p className="text-xs font-bold text-muted-foreground opacity-60 text-center py-4">No active targets</p>
                            )}
                        </div>
                    </Card>

                    {/* Expense Pie Chart */}
                    <Card className="flex flex-col gap-6 shadow-premium border-none glass">
                        <h3 className="text-lg font-black tracking-tight">Distribution</h3>
                        <div className="h-[240px] w-full min-h-[240px] relative">
                            {pieData && pieData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <RePieChart>
                                        <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={8} dataKey="value" stroke="none">
                                            {pieData.map((entry, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                                        </Pie>
                                        <Tooltip />
                                    </RePieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center opacity-40">
                                    <PieChartIcon size={48} />
                                </div>
                            )}
                        </div>
                        <div className="space-y-2">
                            {pieData && pieData.slice(0, 3).map((item, i) => (
                                <div key={i} className="flex items-center justify-between text-xs font-bold">
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                        <span className="text-muted-foreground">{item.name}</span>
                                    </div>
                                    <span className="text-foreground"><PrivacyValue>{currencySymbol}{(item.value || 0).toFixed(0)}</PrivacyValue></span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default Dashboard
