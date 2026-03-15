import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Calendar, Shield, CameraOff, AlertCircle } from 'lucide-react';
import { useSecurity } from '../../context/SecurityContext';
import haptics from '../../lib/haptics';
import { cn } from '../../lib/utils';

const SecurityLogModal = ({ isOpen, onClose }) => {
    const { intruderLogs, deleteLog, clearAllLogs } = useSecurity();

    const formatDate = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleDateString('en-US', { 
            month: 'long', 
            day: 'numeric', 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
        });
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-100 flex items-center justify-center bg-slate-950/95 backdrop-blur-2xl p-4 sm:p-8"
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    className="w-full max-w-5xl h-[85vh] bg-slate-900/50 border border-white/5 rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl relative"
                >
                    {/* Header */}
                    <div className="p-8 border-b border-white/5 flex items-center justify-between sticky top-0 bg-slate-900/80 backdrop-blur-md z-10">
                        <div className="flex items-center gap-5">
                            <div className="h-14 w-14 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center shadow-lg shadow-rose-500/5">
                                <Shield size={28} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-white tracking-tight">Security Log Viewer</h2>
                                <p className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] mt-1">Intruder Snapshot Registry</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            {intruderLogs.length > 0 && (
                                <button
                                    onClick={() => { haptics.medium(); clearAllLogs(); }}
                                    className="px-6 py-3 rounded-xl bg-rose-500/10 text-rose-500 text-[10px] font-black uppercase tracking-widest hover:bg-rose-500/20 transition-all flex items-center gap-2"
                                >
                                    <Trash2 size={16} />
                                    Clear All
                                </button>
                            )}
                            <button
                                onClick={() => { haptics.light(); onClose(); }}
                                className="h-12 w-12 rounded-xl bg-white/5 text-white hover:bg-white/10 transition-all flex items-center justify-center"
                            >
                                <X size={24} />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-8 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                        {intruderLogs.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                                <CameraOff size={80} className="text-slate-500 mb-6" />
                                <h3 className="text-xl font-black text-white uppercase tracking-widest">No Intrusions Detected</h3>
                                <p className="text-xs text-slate-400 mt-2 max-w-xs">Your vault currently has zero recorded security breaches.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {intruderLogs.map((log) => (
                                    <motion.div
                                        key={log.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="group bg-white/5 border border-white/5 rounded-3xl overflow-hidden hover:bg-white/10 transition-all flex flex-col"
                                    >
                                        <div className="aspect-video relative overflow-hidden bg-black">
                                            <img 
                                                src={log.snapshot} 
                                                alt="Intruder Snapshot" 
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                            
                                            <button
                                                onClick={() => { haptics.light(); deleteLog(log.id); }}
                                                className="absolute top-4 right-4 h-10 w-10 rounded-full bg-rose-500/20 text-rose-500 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                        <div className="p-6 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Calendar size={14} className="text-rose-500" />
                                                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest leading-none">
                                                    {formatDate(log.timestamp)}
                                                </span>
                                            </div>
                                            <div className="h-2 w-2 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer Info */}
                    <div className="p-6 border-t border-white/5 bg-slate-900/50 flex items-center justify-center gap-2 text-[8px] font-black text-slate-500 uppercase tracking-[0.3em]">
                        <AlertCircle size={12} />
                        Snapshots are stored locally on your device
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default SecurityLogModal;
