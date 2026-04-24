import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import haptics from '../lib/haptics';
import api from '../services/api';
import { useAuth } from './AuthContext';

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
    const { isAuthenticated } = useAuth();
    const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
    const [biometricCredentialId, setBiometricCredentialId] = useState(null);
    const [isPatternLockEnabled, setIsPatternLockEnabled] = useState(false);
    const [isIntruderSnapshotEnabled, setIsIntruderSnapshotEnabled] = useState(false);
    const [savedPINHash, setSavedPINHash] = useState(null);
    const [isSyncing, setIsSyncing] = useState(true);
    const [isSettingPIN, setIsSettingPIN] = useState(false);
    
    // LOCK ON LAUNCH: Always start locked if a PIN exists
    const [isAppLocked, setIsAppLocked] = useState(true);
    
    const [intruderLogs, setIntruderLogs] = useState([]);

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

    // FETCH SECURITY CONFIG FROM CLOUD
    useEffect(() => {
        if (!isAuthenticated) {
            setIsSyncing(false);
            return;
        }

        const syncSecurity = async () => {
            setIsSyncing(true);
            try {
                const [config, logs] = await Promise.all([
                    api.fetchSecurityConfig(),
                    api.fetchSecurityLogs()
                ]);

                if (config) {
                    setSavedPINHash(config.hashed_pin);
                    setIsPatternLockEnabled(config.is_pin_enabled); // USE PERSISTED STATE
                    setIsBiometricEnabled(config.is_biometric_enabled);
                    setBiometricCredentialId(config.biometric_credential_id);
                    setIsIntruderSnapshotEnabled(config.is_intruder_snapshot_enabled);
                    
                    // LOCK ON LAUNCH: Only lock if a PIN exists AND it's enabled
                    setIsAppLocked(config.is_pin_enabled && !!config.hashed_pin);
                }
                
                if (logs) {
                    setIntruderLogs(logs.map(log => ({
                        id: log.id,
                        timestamp: log.timestamp,
                        snapshot: log.snapshot_data
                    })));
                }
            } catch (error) {
                // If 401, ignore here because AuthContext will handle logout/redirect
                if (error.response?.status !== 401) {
                    console.error('Failed to sync security config:', error);
                    toast.error('Security synchronization failed');
                }
            } finally {
                setIsSyncing(false);
            }
        };

        syncSecurity();
    }, [isAuthenticated]);

    const setPIN = async (pin) => {
        setIsSyncing(true);
        try {
            const hash = await hashPIN(pin);
            await api.updateSecurityConfig({ pin_hash: hash, is_pin_enabled: true }); // PERSIST AS ENABLED
            setSavedPINHash(hash);
            setIsPatternLockEnabled(true);
            setIsAppLocked(false);
            toast.success('Security PIN saved successfully');
            return true;
        } catch (error) {
            console.error("SecurityContext: setPIN failed:", error.response?.status, error);
            if (error.response?.status !== 401) {
                toast.error('Failed to save PIN to cloud');
            }
            return false;
        } finally {
            setIsSyncing(false);
        }
    };

    const verifyPIN = async (pin) => {
        const inputHash = await hashPIN(pin);
        return inputHash === savedPINHash;
    };

    const clearPIN = async () => {
        setIsSyncing(true);
        try {
            await api.updateSecurityConfig({ pin_hash: null, is_pin_enabled: false }); // CLEAR AND DISABLE PERSISTENCE
            setSavedPINHash(null);
            setIsPatternLockEnabled(false);
            setIsAppLocked(false);
            toast.success('Security PIN removed');
            return true;
        } catch (error) {
            if (error.response?.status !== 401) {
                toast.error('Failed to remove PIN from cloud');
            }
            return false;
        } finally {
            setIsSyncing(false);
        }
    };

    const logIntruder = async (snapshot) => {
        try {
            const newLog = await api.logIntruder(snapshot);
            setIntruderLogs(prev => [{
                id: newLog.id,
                timestamp: newLog.timestamp,
                snapshot: newLog.snapshot_data
            }, ...prev]);
            console.warn('INTRUDER DETECTED: Snapshot uploaded.');
        } catch (error) {
            console.error('Failed to upload intruder log');
        }
    };

    const deleteLog = async (id) => {
        setIsSyncing(true);
        try {
            await api.deleteSecurityLog(id);
            const updatedLogs = intruderLogs.filter(log => log.id !== id);
            setIntruderLogs(updatedLogs);
            toast.success('Log entry removed from cloud');
        } catch (error) {
            if (error.response?.status !== 401) {
                toast.error('Failed to delete log');
            }
        } finally {
            setIsSyncing(false);
        }
    };

    const clearAllLogs = async () => {
        setIsSyncing(true);
        try {
            await api.clearAllSecurityLogs();
            setIntruderLogs([]);
            toast.success('All security logs cleared from cloud');
        } catch (error) {
            toast.error('Failed to clear logs');
        } finally {
            setIsSyncing(false);
        }
    };

    const isWebAuthnSupported = () => {
        return !!(window.PublicKeyCredential && navigator.credentials && navigator.credentials.create);
    };

    const registerBiometrics = async () => {
        if (!isWebAuthnSupported()) {
            return { success: false, error: 'Biometrics not supported on this device.' };
        }
        setIsSyncing(true);
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
            
            await api.registerBiometric(credId);
            
            setBiometricCredentialId(credId);
            setIsBiometricEnabled(true);
            haptics.success();
            return { success: true };
        } catch (err) {
            if (err.name === 'NotAllowedError') {
                return { success: false, error: 'Authentication was cancelled or timed out.' };
            }
            return { success: false, error: err.message || 'Biometric registration failed.' };
        } finally {
            setIsSyncing(false);
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

    const deregisterBiometrics = async () => {
        setIsSyncing(true);
        try {
            await api.updateSecurityConfig({ 
                biometric_credential_id: null,
                is_biometric_enabled: false
            });
            setIsBiometricEnabled(false);
            setBiometricCredentialId(null);
            toast.success('Biometric credentials deregistered');
        } catch (error) {
            toast.error('Failed to deregister biometrics');
        } finally {
            setIsSyncing(false);
        }
    };

    const toggleIntruderSnapshot = async (enabled) => {
        setIsSyncing(true);
        try {
            await api.updateSecurityConfig({ is_intruder_snapshot_enabled: enabled });
            setIsIntruderSnapshotEnabled(enabled);
            toast.success(enabled ? 'Intruder snapshots enabled' : 'Intruder snapshots disabled');
            return true;
        } catch (error) {
            if (error.response?.status !== 401) {
                toast.error('Failed to update security preference');
            }
            return false;
        } finally {
            setIsSyncing(false);
        }
    };

    const triggerPINSetup = () => {
        setIsSettingPIN(true);
        setIsAppLocked(true);
    };

    const togglePINLock = async (enabled) => {
        setIsSyncing(true);
        try {
            await api.updateSecurityConfig({ is_pin_enabled: enabled });
            setIsPatternLockEnabled(enabled);
            toast.success(enabled ? 'PIN Lock enabled' : 'PIN Lock disabled');
            return true;
        } catch (error) {
            if (error.response?.status !== 401) {
                toast.error('Failed to update PIN preference');
            }
            return false;
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <SecurityContext.Provider value={{
            isBiometricEnabled,
            setIsBiometricEnabled,
            biometricCredentialId,
            isPatternLockEnabled,
            setIsPatternLockEnabled,
            isIntruderSnapshotEnabled,
            toggleIntruderSnapshot,
            isAppLocked,
            setIsAppLocked,
            savedPINHash,
            isSyncing,
            setPIN,
            verifyPIN,
            clearPIN,
            logIntruder,
            deleteLog,
            clearAllLogs,
            intruderLogs,
            isSettingPIN,
            setIsSettingPIN,
            triggerPINSetup,
            togglePINLock,
            isWebAuthnSupported,
            registerBiometrics,
            authenticateBiometrically,
            deregisterBiometrics
        }}>
            {children}
        </SecurityContext.Provider>
    );
};
