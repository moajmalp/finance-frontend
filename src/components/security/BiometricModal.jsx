import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Fingerprint, ShieldCheck, ShieldX, X } from 'lucide-react';
import { useSecurity } from '../../context/SecurityContext';
import haptics from '../../lib/haptics';

const STATUS = {
    IDLE: 'IDLE',
    WAITING: 'WAITING',
    SUCCESS: 'SUCCESS',
    ERROR: 'ERROR',
};

const BiometricModal = ({ isOpen, onClose, onSuccess }) => {
    const { registerBiometrics, isWebAuthnSupported, isSyncing } = useSecurity();
    const [status, setStatus] = useState(STATUS.IDLE);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (isOpen) {
            setStatus(STATUS.IDLE);
            setErrorMessage('');
            // Auto-trigger the flow after a brief moment
            const t = setTimeout(() => handleRegister(), 600);
            return () => clearTimeout(t);
        }
    }, [isOpen]);

    const handleRegister = async () => {
        if (!isWebAuthnSupported()) {
            setStatus(STATUS.ERROR);
            setErrorMessage('Biometrics not supported on this device.');
            haptics.error();
            return;
        }
        setStatus(STATUS.WAITING);
        const result = await registerBiometrics();
        if (result.success) {
            setStatus(STATUS.SUCCESS);
            haptics.success();
            setTimeout(() => {
                onSuccess?.();
                onClose?.();
            }, 1200);
        } else {
            setStatus(STATUS.ERROR);
            setErrorMessage(result.error);
            haptics.error();
        }
    };

    const fingerprintVariants = {
        idle: { scale: 1, opacity: 0.4 },
        waiting: {
            scale: [1, 1.08, 1],
            opacity: [0.6, 1, 0.6],
            transition: { duration: 1.6, repeat: Infinity, ease: 'easeInOut' }
        },
        success: { scale: 1.1, opacity: 1 },
        error: { scale: 1, opacity: 0.5 }
    };

    const ringVariants = {
        waiting: {
            scale: [1, 1.5, 1],
            opacity: [0.3, 0, 0.3],
            transition: { duration: 1.6, repeat: Infinity, ease: 'easeOut' }
        }
    };

    const statusColor = {
        [STATUS.IDLE]: 'text-slate-400',
        [STATUS.WAITING]: 'text-indigo-400',
        [STATUS.SUCCESS]: 'text-emerald-400',
        [STATUS.ERROR]: 'text-rose-400',
    };

    const statusMessage = {
        [STATUS.IDLE]: 'Initializing secure channel...',
        [STATUS.WAITING]: isSyncing ? 'Synchronizing with cloud...' : 'Waiting for System Authentication...',
        [STATUS.SUCCESS]: 'Biometric Access Linked Successfully.',
        [STATUS.ERROR]: errorMessage || 'Authentication failed.',
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-9999 flex items-center justify-center bg-slate-950/90 backdrop-blur-2xl p-4"
                >
                    <motion.div
                        initial={{ scale: 0.92, y: 20, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.92, y: 20, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        className="w-full max-w-sm bg-slate-900 border border-white/5 rounded-[2.5rem] p-10 shadow-2xl relative"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-5 right-5 h-9 w-9 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
                        >
                            <X size={16} />
                        </button>

                        <div className="flex flex-col items-center gap-8 text-center">
                            <div>
                                <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-3">Security Protocol</p>
                                <h2 className="text-xl font-black text-white tracking-tight">Biometric Registration</h2>
                            </div>

                            {/* Fingerprint Animation */}
                            <div className="relative flex items-center justify-center h-36 w-36">
                                {status === STATUS.WAITING && (
                                    <motion.div
                                        variants={ringVariants}
                                        animate="waiting"
                                        className="absolute inset-0 rounded-full border-2 border-indigo-400"
                                    />
                                )}
                                <motion.div
                                    className={`h-28 w-28 rounded-full flex items-center justify-center ${
                                        status === STATUS.SUCCESS
                                            ? 'bg-emerald-500/15 border-2 border-emerald-500/30'
                                            : status === STATUS.ERROR
                                            ? 'bg-rose-500/15 border-2 border-rose-500/30'
                                            : 'bg-indigo-500/10 border-2 border-indigo-500/20'
                                    } transition-all duration-500`}
                                >
                                    <motion.div
                                        variants={fingerprintVariants}
                                        animate={status.toLowerCase()}
                                        initial="idle"
                                    >
                                        {status === STATUS.SUCCESS ? (
                                            <ShieldCheck size={52} className="text-emerald-400" />
                                        ) : status === STATUS.ERROR ? (
                                            <ShieldX size={52} className="text-rose-400" />
                                        ) : (
                                            <Fingerprint size={52} className={status === STATUS.WAITING ? 'text-indigo-400' : 'text-slate-500'} />
                                        )}
                                    </motion.div>
                                </motion.div>
                            </div>

                            <div className="space-y-2">
                                <p className={`text-sm font-bold transition-colors duration-300 ${statusColor[status]}`}>
                                    {statusMessage[status]}
                                </p>
                                {status === STATUS.ERROR && (
                                    <button
                                        onClick={handleRegister}
                                        className="text-[10px] font-black text-primary uppercase tracking-widest hover:text-primary/70 transition-all mt-2"
                                    >
                                        Try Again
                                    </button>
                                )}
                            </div>

                            {status === STATUS.IDLE && (
                                <p className="text-[10px] font-medium text-slate-600 uppercase tracking-widest">
                                    Touch your fingerprint sensor when prompted
                                </p>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default BiometricModal;
