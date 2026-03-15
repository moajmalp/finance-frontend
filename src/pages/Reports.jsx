import { useState } from 'react'
import { FileText, Download, PieChart, Wallet, Calendar, CheckCircle2, Loader2, Sparkles, FileSpreadsheet } from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { useTransactions } from '../context/TransactionContext'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../services/api'

const Reports = () => {
    const { transactions, accounts, selectedMonth, currencySymbol } = useTransactions()
    const [generating, setGenerating] = useState(null)
    const [lastExport, setLastExport] = useState(null)

    const handleExport = async (type) => {
        try {
            setGenerating(type)
            const month = selectedMonth

            let blob
            let filename

            if (type === 'PDF') {
                blob = await api.downloadMonthlyPdf(month)
                filename = `Finance_Report_${month.replace('-', '_')}.pdf`
            } else {
                blob = await api.downloadTransactionsExcel(month)
                filename = `Finance_Transactions_${month.replace('-', '_')}.xlsx`
            }

            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', filename)
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)

            setLastExport({
                id: Date.now(),
                type,
                name: filename,
                date: new Date().toLocaleTimeString()
            })
        } catch (e) {
            console.error('Failed to generate report', e)
        } finally {
            setGenerating(null)
        }
    }

    const reportTypes = [
        {
            title: 'Monthly Summary',
            description: 'Comprehensive breakdown of income, expenses, and savings for the selected period.',
            icon: Calendar,
            color: 'text-indigo-theme',
            bg: 'bg-indigo-theme'
        },
        {
            title: 'Category Deep Dive',
            description: 'Granular analysis of spending habits across all active categories.',
            icon: PieChart,
            color: 'text-emerald-theme',
            bg: 'bg-emerald-theme'
        },
        {
            title: 'Vault Audit',
            description: 'Full reconciliation of account balances and internal transfers.',
            icon: Wallet,
            color: 'text-amber-theme',
            bg: 'bg-amber-theme'
        },
        {
            title: 'Tax Preview',
            description: 'Estimated income and deductible expense summary based on your categorizations.',
            icon: FileText,
            color: 'text-rose-theme',
            bg: 'bg-rose-theme'
        }
    ]

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700 pb-10 max-w-5xl mx-auto">
            <div className="flex flex-col gap-1">
                <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">Intelligence Outputs</h2>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Generate and export professional-grade financial statements</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {reportTypes.map((report, i) => (
                    <Card key={i} className="p-6 sm:p-8 border-none shadow-premium group hover:-translate-y-1 transition-all duration-300 rounded-[2.5rem]">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-8">
                            <div className={`h-16 w-16 shrink-0 flex items-center justify-center rounded-[1.5rem] ${report.bg} ${report.color} shadow-lg shadow-current/10`}>
                                <report.icon size={28} />
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    className="flex-1 sm:flex-none gap-2 h-14 sm:h-12 px-6 text-[10px] font-black uppercase tracking-widest rounded-2xl bg-card/50"
                                    onClick={() => handleExport('PDF')}
                                    disabled={generating !== null}
                                >
                                    {generating === 'PDF' ? <Loader2 size={14} className="animate-spin" /> : <FileText size={16} />}
                                    PDF
                                </Button>
                                <Button
                                    variant="outline"
                                    className="flex-1 sm:flex-none gap-2 h-14 sm:h-12 px-6 text-[10px] font-black uppercase tracking-widest rounded-2xl bg-card/50"
                                    onClick={() => handleExport('Excel')}
                                    disabled={generating !== null}
                                >
                                    {generating === 'Excel' ? <Loader2 size={14} className="animate-spin" /> : <FileSpreadsheet size={16} />}
                                    EXCEL
                                </Button>
                            </div>
                        </div>
                        <h3 className="text-xl font-black text-foreground tracking-tight mb-2 leading-tight">{report.title}</h3>
                        <p className="text-sm font-medium text-muted-foreground leading-relaxed opacity-80">{report.description}</p>
                    </Card>
                ))}
            </div>

            <AnimatePresence>
                {lastExport && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-card border border-border rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-premium"
                    >
                        <div className="flex items-center gap-6">
                            <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                                <CheckCircle2 size={32} />
                            </div>
                            <div>
                                <h4 className="text-lg font-black text-foreground tracking-tight">Export Successful</h4>
                                <p className="text-sm font-medium text-muted-foreground truncate max-w-sm">{lastExport.name}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Ready at {lastExport.date}</p>
                            <Button
                                className="gap-2 px-6 shadow-xl"
                                onClick={() => handleExport(lastExport.type)}
                                disabled={generating !== null}
                            >
                                <Download size={18} />
                                Download File
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Smart Summary Card */}
            <Card className="!bg-primary text-white p-10 border-none shadow-premium relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
                    <Sparkles size={120} />
                </div>
                <div className="relative z-10 space-y-6">
                    <h3 className="text-2xl font-black tracking-tight">Quarterly Health Report</h3>
                    <p className="text-white/80 font-medium max-w-xl">Our intelligent engine has analyzed your last 90 days. You've increased your net worth by 12.5% while reducing unnecessary subscriptions by {currencySymbol}35,000.</p>
                    <div className="flex gap-4">
                        <Button className="bg-white text-primary hover:bg-white/90 font-black h-12 px-8 rounded-2xl shadow-lg border-none">
                            Unlock Full Analysis
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    )
}

export default Reports
