import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import haptics from '../lib/haptics';

const SecurityContext = createContext();

export const useSecurity = () => useContext(SecurityContext);

const STORAGE_KEYS = {
    BIOMETRIC: 'finance_security_biometric',
    PIN_ENABLED: 'finance_security_pin_enabled',
    PIN_HASH: 'finance_security_pin_hash',
    INTRUDER_ENABLED: 'finance_security_intruder_enabled',
    INTRUDER_LOGS: 'mock_intruder_logs',
    CREDENTIAL_ID: 'finance_security_credential_id'
};

const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes
const WARNING_BEFORE = 60 * 1000; // 1 minute warning

// Utility to hash PIN using Web Crypto API
const hashPIN = async (pin) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(pin);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

export const SecurityProvider = ({ children }) => {
    const [isBiometricEnabled, setIsBiometricEnabled] = useState(() => 
        JSON.parse(localStorage.getItem(STORAGE_KEYS.BIOMETRIC) || 'false')
    );
    const [biometricCredentialId, setBiometricCredentialId] = useState(() =>
        localStorage.getItem(STORAGE_KEYS.CREDENTIAL_ID)
    );
    const [isPatternLockEnabled, setIsPatternLockEnabled] = useState(() => 
        JSON.parse(localStorage.getItem(STORAGE_KEYS.PIN_ENABLED) || 'false')
    );
    const [isIntruderSnapshotEnabled, setIsIntruderSnapshotEnabled] = useState(() => 
        JSON.parse(localStorage.getItem(STORAGE_KEYS.INTRUDER_ENABLED) || 'false')
    );
    const [savedPINHash, setSavedPINHash] = useState(() => 
        localStorage.getItem(STORAGE_KEYS.PIN_HASH)
    );
    
    // LOCK ON LAUNCH: Always start locked if a PIN exists
    const [isAppLocked, setIsAppLocked] = useState(!!localStorage.getItem(STORAGE_KEYS.PIN_HASH));
    
    const [intruderLogs, setIntruderLogs] = useState(() => 
        JSON.parse(localStorage.getItem(STORAGE_KEYS.INTRUDER_LOGS) || '[]')
    );

    const timerRef = useRef(null);
    const warningRef = useRef(null);
    const warningToastId = useRef(null);

    const resetTimer = useCallback(() => {
        if (!savedPINHash || isAppLocked) return;

        if (timerRef.current) clearTimeout(timerRef.current);
        if (warningRef.current) clearTimeout(warningRef.current);
        if (warningToastId.current) {
            toast.dismiss(warningToastId.current);
            warningToastId.current = null;
        }

        // Warning timer
        warningRef.current = setTimeout(() => {
            warningToastId.current = toast.custom((t) => (
                <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-slate-900 shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-white/10 p-4 border border-primary/20`}>
                    <div className="flex-1 w-0 p-1">
                        <div className="flex items-start">
                            <div className="ml-3 flex-1">
                                <p className="text-sm font-black text-white uppercase tracking-tight">Security Protocol</p>
                                <p className="mt-1 text-xs font-medium text-slate-400">Session expiring in 60 seconds due to inactivity.</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex border-l border-white/5">
                        <button
                            onClick={() => {
                                haptics.light();
                                resetTimer();
                            }}
                            className="w-full border border-transparent rounded-none rounded-r-2xl p-4 flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary/80 transition-colors"
                        >
                            Stay Logged In
                        </button>
                    </div>
                </div>
            ), { duration: Infinity, position: 'top-center' });
        }, INACTIVITY_TIMEOUT - WARNING_BEFORE);

        // Auto-lock timer
        timerRef.current = setTimeout(() => {
            haptics.heavy(); // Short vibration/feedback for security lock
            setIsAppLocked(true);
            toast.error('Session locked due to inactivity', { icon: '🛡️' });
        }, INACTIVITY_TIMEOUT);
    }, [savedPINHash, isAppLocked]);

    useEffect(() => {
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
        
        if (savedPINHash && !isAppLocked) {
            events.forEach(event => window.addEventListener(event, resetTimer));
            resetTimer(); // Start timer immediately
        }

        return () => {
            events.forEach(event => window.removeEventListener(event, resetTimer));
            if (timerRef.current) clearTimeout(timerRef.current);
            if (warningRef.current) clearTimeout(warningRef.current);
        };
    }, [savedPINHash, isAppLocked, resetTimer]);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.BIOMETRIC, JSON.stringify(isBiometricEnabled));
    }, [isBiometricEnabled]);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.PIN_ENABLED, JSON.stringify(isPatternLockEnabled));
    }, [isPatternLockEnabled]);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.INTRUDER_ENABLED, JSON.stringify(isIntruderSnapshotEnabled));
    }, [isIntruderSnapshotEnabled]);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.INTRUDER_LOGS, JSON.stringify(intruderLogs));
    }, [intruderLogs]);

    const setPIN = async (pin) => {
        const hash = await hashPIN(pin);
        localStorage.setItem(STORAGE_KEYS.PIN_HASH, hash);
        setSavedPINHash(hash);
        setIsAppLocked(false);
        toast.success('Security PIN saved successfully');
    };

    const verifyPIN = async (pin) => {
        const inputHash = await hashPIN(pin);
        return inputHash === savedPINHash;
    };

    const clearPIN = () => {
        localStorage.removeItem(STORAGE_KEYS.PIN_HASH);
        setSavedPINHash(null);
        setIsAppLocked(false);
    };

    const logIntruder = (snapshot) => {
        const newLog = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            snapshot // Base64 image
        };
        const updatedLogs = [newLog, ...intruderLogs];
        setIntruderLogs(updatedLogs);
        console.warn('INTRUDER DETECTED: Snapshot captured.');
    };

    const deleteLog = (id) => {
        const updatedLogs = intruderLogs.filter(log => log.id !== id);
        setIntruderLogs(updatedLogs);
        toast.success('Log entry deleted');
    };

    const clearAllLogs = () => {
        setIntruderLogs([]);
        localStorage.setItem(STORAGE_KEYS.INTRUDER_LOGS, '[]');
        toast.success('All security logs cleared');
    };

    const isWebAuthnSupported = () => {
        return !!(window.PublicKeyCredential && navigator.credentials && navigator.credentials.create);
    };

    const registerBiometrics = async () => {
        if (!isWebAuthnSupported()) {
            return { success: false, error: 'Biometrics not supported on this device.' };
        }
        try {
            const challenge = new Uint8Array(32);
            crypto.getRandomValues(challenge);
            const credential = await navigator.credentials.create({
                publicKey: {
                    challenge,
                    rp: { name: 'AJ Finance', id: window.location.hostname },
                    user: {
                        id: new Uint8Array(16),
                        name: 'finance-user',
                        displayName: 'Finance User'
                    },
                    pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
                    authenticatorSelection: {
                        authenticatorAttachment: 'platform',
                        userVerification: 'required'
                    },
                    timeout: 60000
                }
            });
            // Save a mock credential ID (base64 of the raw ID)
            const credId = btoa(String.fromCharCode(...new Uint8Array(credential.rawId)));
            localStorage.setItem(STORAGE_KEYS.CREDENTIAL_ID, credId);
            localStorage.setItem(STORAGE_KEYS.BIOMETRIC, 'true');
            setBiometricCredentialId(credId);
            setIsBiometricEnabled(true);
            haptics.success();
            return { success: true };
        } catch (err) {
            if (err.name === 'NotAllowedError') {
                return { success: false, error: 'Authentication was cancelled or timed out.' };
            }
            return { success: false, error: err.message || 'Biometric registration failed.' };
        }
    };

    const authenticateBiometrically = async () => {
        if (!isWebAuthnSupported() || !biometricCredentialId) {
            return false;
        }
        try {
            const challenge = new Uint8Array(32);
            crypto.getRandomValues(challenge);
            await navigator.credentials.get({
                publicKey: {
                    challenge,
                    rpId: window.location.hostname,
                    userVerification: 'required',
                    timeout: 60000
                }
            });
            haptics.success();
            return true;
        } catch (err) {
            return false;
        }
    };

    const deregisterBiometrics = () => {
        setIsBiometricEnabled(false);
        setBiometricCredentialId(null);
        localStorage.removeItem(STORAGE_KEYS.BIOMETRIC);
        localStorage.removeItem(STORAGE_KEYS.CREDENTIAL_ID);
        toast.success('Biometric credentials deregistered');
    };

    return (
        <SecurityContext.Provider value={{
            isBiometricEnabled,
            setIsBiometricEnabled,
            biometricCredentialId,
            isPatternLockEnabled,
            setIsPatternLockEnabled,
            isIntruderSnapshotEnabled,
            setIsIntruderSnapshotEnabled,
            isAppLocked,
            setIsAppLocked,
            savedPINHash,
            setPIN,
            verifyPIN,
            clearPIN,
            logIntruder,
            deleteLog,
            clearAllLogs,
            intruderLogs,
            isWebAuthnSupported,
            registerBiometrics,
            authenticateBiometrically,
            deregisterBiometrics
        }}>
            {children}
        </SecurityContext.Provider>
    );
};
