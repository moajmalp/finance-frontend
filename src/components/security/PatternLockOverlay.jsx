import { useState, useRef, useEffect } from 'react';
import { useSecurity } from '../../context/SecurityContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, Fingerprint, AlertCircle, Delete, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '../../lib/utils';
import haptics from '../../lib/haptics';

const PINLockOverlay = () => {
    const { 
        isAppLocked, 
        setIsAppLocked, 
        savedPINHash, 
        setPIN, 
        verifyPIN, 
        clearPIN,
        isIntruderSnapshotEnabled,
        logIntruder,
        isBiometricEnabled,
        biometricCredentialId,
        authenticateBiometrically,
        isSyncing,
    } = useSecurity();

    const [pin, setPin] = useState('');
    const [status, setStatus] = useState('DEFAULT'); // DEFAULT, SUCCESS, ERROR
    const [attempts, setAttempts] = useState(0);
    const [isSettingMode, setIsSettingMode] = useState(false);
    const [isResetMode, setIsResetMode] = useState(false);
    const [securityAnswer, setSecurityAnswer] = useState('');
    const [firstPin, setFirstPin] = useState(null);
    const [cameraError, setCameraError] = useState(null);
    const [biometricStatus, setBiometricStatus] = useState('idle'); // idle, scanning, failed

    // Initialize setting mode correctly after sync
    useEffect(() => {
        if (!isSyncing && !savedPINHash) {
            setIsSettingMode(true);
        } else if (!isSyncing && savedPINHash) {
            setIsSettingMode(false);
        }
    }, [isSyncing, savedPINHash]);

    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    // Auto-trigger biometric auth when lock screen appears
    useEffect(() => {
        if (isAppLocked && isBiometricEnabled && biometricCredentialId && !isSettingMode) {
            triggerBiometricAuth();
        }
    }, [isAppLocked]);

    const triggerBiometricAuth = async () => {
        setBiometricStatus('scanning');
        const success = await authenticateBiometrically();
        if (success) {
            setBiometricStatus('idle');
            setStatus('SUCCESS');
            setTimeout(() => setIsAppLocked(false), 400);
        } else {
            setBiometricStatus('failed');
            haptics.error();
        }
    };

    useEffect(() => {
        if (isIntruderSnapshotEnabled) {
            setupCamera();
        }
    }, [isIntruderSnapshotEnabled]);

    const setupCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Camera access denied:", err);
            setCameraError("Camera permission required for Intruder Snapshot");
        }
    };

    const captureSnapshot = () => {
        if (canvasRef.current && videoRef.current) {
            const context = canvasRef.current.getContext('2d');
            canvasRef.current.width = videoRef.current.videoWidth;
            canvasRef.current.height = videoRef.current.videoHeight;
            context.drawImage(videoRef.current, 0, 0);
            const dataUrl = canvasRef.current.toDataURL('image/png');
            logIntruder(dataUrl);
        }
    };

    const handleNumberClick = (num) => {
        haptics.light();
        if (pin.length < 6) {
            setPin(prev => prev + num);
        }
    };

    const handleDelete = () => {
        haptics.light();
        setPin(prev => prev.slice(0, -1));
    };

    const handleSubmit = async () => {
        if (pin.length < 4) {
            haptics.error();
            toast.error('PIN must be at least 4 digits');
            return;
        }

        if (isSettingMode) {
            if (!firstPin) {
                haptics.medium();
                setFirstPin(pin);
                setPin('');
                toast('Confirm your PIN');
            } else {
                if (firstPin === pin) {
                    haptics.success();
                    await setPIN(pin);
                    setIsSettingMode(false);
                    setStatus('SUCCESS');
                    setTimeout(() => setIsAppLocked(false), 500);
                } else {
                    haptics.error();
                    setStatus('ERROR');
                    setFirstPin(null);
                    setPin('');
                    toast.error('PINs do not match. Try again.');
                    setTimeout(() => setStatus('DEFAULT'), 1000);
                }
            }
        } else {
            const isValid = await verifyPIN(pin);
            if (isValid) {
                haptics.success();
                setStatus('SUCCESS');
                setTimeout(() => setIsAppLocked(false), 500);
            } else {
                haptics.error();
                setStatus('ERROR');
                const newAttempts = attempts + 1;
                setAttempts(newAttempts);
                setPin('');
                
                if (isIntruderSnapshotEnabled && newAttempts >= 3) {
                    captureSnapshot();
                }

                toast.error('Incorrect PIN');
                setTimeout(() => setStatus('DEFAULT'), 1000);
            }
        }
    };

    const handleResetPIN = () => {
        if (securityAnswer.toLowerCase() === 'pagenow') {
            haptics.success();
            clearPIN();
            toast.success('PIN Reset Successful. Set a new one.');
            setIsResetMode(false);
            setIsSettingMode(true);
            setSecurityAnswer('');
        } else {
            haptics.error();
            toast.error('Incorrect Security Answer');
        }
    };

    if (!isAppLocked && savedPINHash) return null;
    if (!isAppLocked && !isSyncing && !savedPINHash && !isSettingMode) return null;

    const keypad = [1, 2, 3, 4, 5, 6, 7, 8, 9, 'DELETE', 0, 'SUBMIT'];

    if (isSyncing && isAppLocked) {
        return (
            <div className="fixed inset-0 z-9999 flex flex-col items-center justify-center bg-slate-950 text-white">
                <motion.div 
                    animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="h-20 w-20 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6"
                >
                    <Shield size={40} className="text-primary" />
                </motion.div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary animate-pulse">Initializing Encryption...</p>
            </div>
        );
    }

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-9999 flex flex-col items-center justify-center bg-slate-950/95 backdrop-blur-3xl text-white p-6"
        >
            <video ref={videoRef} autoPlay hidden />
            <canvas ref={canvasRef} hidden />

            <div className="w-full max-w-sm flex flex-col items-center gap-8 text-center">
                <div className="space-y-4">
                    <div className="flex justify-center">
                        <motion.div 
                            animate={status === 'ERROR' ? { x: [-10, 10, -10, 10, 0] } : {}}
                            className="h-16 w-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-2xl shadow-primary/20"
                        >
                            <Shield size={32} className={cn("transition-colors", status === 'ERROR' ? 'text-rose-500' : 'text-primary')} />
                        </motion.div>
                    </div>
                    <div>
                        <h2 className="text-xl font-black tracking-tight uppercase">
                            {isResetMode ? 'Identity Verification' : isSettingMode ? (firstPin ? 'Confirm Security PIN' : 'Set Security PIN') : 'Access Restricted'}
                        </h2>
                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mt-2 opacity-70">
                            {isResetMode ? 'Answer Security Question' : isSettingMode ? 'Secure your vault' : 'Verification Required'}
                        </p>
                    </div>
                </div>

                {isResetMode ? (
                    <div className="w-full space-y-6 animate-in fade-in zoom-in duration-300">
                        <div className="space-y-2 text-left bg-white/5 p-6 rounded-3xl border border-white/5">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Question:</p>
                            <p className="text-sm font-bold text-slate-200">What is my agency's name?</p>
                        </div>
                        <input
                            type="text"
                            value={securityAnswer}
                            onChange={(e) => setSecurityAnswer(e.target.value)}
                            placeholder="Enter your answer"
                            className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 text-sm focus:outline-none focus:border-primary/50 transition-all text-center placeholder:text-slate-600 font-bold"
                        />
                        <div className="flex gap-4">
                            <button
                                onClick={() => { haptics.light(); setIsResetMode(false); }}
                                className="flex-1 h-14 rounded-2xl border border-white/5 bg-white/5 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                            >
                                Back
                            </button>
                            <button
                                onClick={() => { haptics.medium(); handleResetPIN(); }}
                                className="flex-2 h-14 rounded-2xl bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                            >
                                Verify & Reset
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* PIN Display Dots */}
                        <div className="flex gap-4 my-4">
                            {[...Array(isSettingMode && firstPin ? firstPin.length : Math.max(pin.length, 4))].map((_, i) => (
                                <motion.div
                                    key={i}
                                    initial={false}
                                    animate={{
                                        scale: i < pin.length ? 1.2 : 1,
                                        backgroundColor: i < pin.length ? 'rgb(99, 102, 241)' : 'rgba(255, 255, 255, 0.1)',
                                        boxShadow: i < pin.length ? '0 0 15px rgba(99, 102, 241, 0.5)' : 'none'
                                    }}
                                    className="h-3 w-3 rounded-full border border-white/5 transition-all duration-200"
                                />
                            ))}
                        </div>

                        {cameraError && isIntruderSnapshotEnabled && (
                            <div className="flex items-center gap-2 p-3 px-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[8px] font-bold uppercase tracking-widest">
                                <AlertCircle size={12} />
                                {cameraError}
                            </div>
                        )}

                        {/* Numeric Keypad */}
                        <div className="grid grid-cols-3 gap-6 sm:gap-8 w-full">
                            {keypad.map((key, i) => {
                                const isSpecial = typeof key === 'string';
                                return (
                                    <motion.button
                                        key={i}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.9, backgroundColor: 'rgba(99, 102, 241, 0.2)', boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)' }}
                                        onClick={() => {
                                            if (key === 'DELETE') handleDelete();
                                            else if (key === 'SUBMIT') handleSubmit();
                                            else handleNumberClick(key);
                                        }}
                                        className={cn(
                                            "h-16 w-16 sm:h-20 sm:w-20 rounded-full flex items-center justify-center text-xl font-bold transition-all border border-white/5 bg-white/5 backdrop-blur-sm self-center mx-auto",
                                            key === 'SUBMIT' && "bg-primary/20 border-primary/40 text-primary h-16 w-16 sm:h-20 sm:w-20",
                                            key === 'DELETE' && "text-rose-400 h-16 w-16 sm:h-20 sm:w-20"
                                        )}
                                    >
                                        {key === 'DELETE' ? <Delete size={24} /> : 
                                        key === 'SUBMIT' ? <CheckCircle2 size={24} /> : 
                                        key}
                                    </motion.button>
                                );
                            })}
                        </div>
                    </>
                )}

                <div className="mt-4 space-y-4">
                    {!isResetMode && !isSettingMode && (
                        <button 
                            onClick={() => { haptics.light(); setIsResetMode(true); }}
                            className="text-[10px] font-black text-primary/60 uppercase tracking-widest hover:text-primary transition-all"
                        >
                            Forgot PIN?
                        </button>
                    )}
                    
                    <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">
                        {isResetMode ? "Temporary recovery using security protocol." : isSettingMode 
                            ? "Use 4-6 digits for maximum session integrity."
                            : "Enter credentials to initialize sync."}
                    </p>

                    {/* Biometric section */}
                    {isBiometricEnabled && biometricCredentialId && !isSettingMode && !isResetMode && (
                        <div className="flex flex-col items-center gap-3 pt-2 border-t border-white/5">
                            {biometricStatus === 'scanning' ? (
                                <motion.div
                                    animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                    className="flex flex-col items-center gap-2"
                                >
                                    <Fingerprint size={28} className="text-indigo-400" />
                                    <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Scanning...</span>
                                </motion.div>
                            ) : (
                                <button
                                    onClick={() => { haptics.medium(); triggerBiometricAuth(); }}
                                    className="flex items-center gap-2 text-[10px] font-black text-indigo-400 uppercase tracking-widest hover:text-indigo-300 transition-all"
                                >
                                    <Fingerprint size={14} />
                                    {biometricStatus === 'failed' ? 'Try Fingerprint Again' : 'Use Fingerprint'}
                                </button>
                            )}
                        </div>
                    )}
                    
                    <div className="flex items-center justify-center gap-6 opacity-20">
                        <Fingerprint size={16} />
                        <Lock size={16} />
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default PINLockOverlay;
