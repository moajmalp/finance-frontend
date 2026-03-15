import { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const SecurityContext = createContext();

export const useSecurity = () => useContext(SecurityContext);

const STORAGE_KEYS = {
    BIOMETRIC: 'finance_security_biometric',
    PIN_ENABLED: 'finance_security_pin_enabled',
    PIN_HASH: 'finance_security_pin_hash',
    INTRUDER_ENABLED: 'finance_security_intruder_enabled',
    INTRUDER_LOGS: 'mock_intruder_logs'
};

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
    const [isPatternLockEnabled, setIsPatternLockEnabled] = useState(() => 
        JSON.parse(localStorage.getItem(STORAGE_KEYS.PIN_ENABLED) || 'false')
    );
    const [isIntruderSnapshotEnabled, setIsIntruderSnapshotEnabled] = useState(() => 
        JSON.parse(localStorage.getItem(STORAGE_KEYS.INTRUDER_ENABLED) || 'false')
    );
    const [savedPINHash, setSavedPINHash] = useState(() => 
        localStorage.getItem(STORAGE_KEYS.PIN_HASH)
    );
    const [isAppLocked, setIsAppLocked] = useState(!!localStorage.getItem(STORAGE_KEYS.PIN_HASH));
    const [intruderLogs, setIntruderLogs] = useState(() => 
        JSON.parse(localStorage.getItem(STORAGE_KEYS.INTRUDER_LOGS) || '[]')
    );

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

    const deregisterBiometrics = () => {
        setIsBiometricEnabled(false);
        localStorage.removeItem(STORAGE_KEYS.BIOMETRIC);
        toast.success('Biometric credentials deregistered');
    };

    return (
        <SecurityContext.Provider value={{
            isBiometricEnabled,
            setIsBiometricEnabled,
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
            deregisterBiometrics
        }}>
            {children}
        </SecurityContext.Provider>
    );
};
