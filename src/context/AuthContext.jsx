import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { login as apiLogin, register as apiRegister, fetchProfile, updateProfile as apiUpdateProfile } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    // Intercept impersonation token from URL before state initialization
    let urlToken = null;
    if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        urlToken = params.get('impersonate_token');
        if (urlToken) {
            sessionStorage.setItem('impersonateToken', urlToken);
            sessionStorage.setItem('isImpersonating', 'true');
            // Immediately clean URL for security
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }

    const isImpersonatingSession = sessionStorage.getItem('isImpersonating') === 'true';
    const initialToken = urlToken || sessionStorage.getItem('impersonateToken') || localStorage.getItem('token');
    const initialRole = sessionStorage.getItem('impersonateRole') || localStorage.getItem('role');

    const [user, setUser] = useState(null);
    const [role, setRole] = useState(initialRole);
    const [token, setToken] = useState(initialToken);
    const [isAuthenticated, setIsAuthenticated] = useState(!!initialToken);
    const [isImpersonating, setIsImpersonating] = useState(isImpersonatingSession);
    const [loading, setLoading] = useState(true);

    const logout = useCallback((options = {}) => {
        const { silent = false } = options;
        if (sessionStorage.getItem('isImpersonating') === 'true') {
            sessionStorage.removeItem('impersonateToken');
            sessionStorage.removeItem('impersonateRole');
            sessionStorage.removeItem('isImpersonating');
            if (!silent) toast.success('Impersonation ended');
            setTimeout(() => window.close(), 500);
            return;
        }

        localStorage.removeItem('token');
        localStorage.removeItem('role');
        setToken(null);
        setRole(null);
        setIsAuthenticated(false);
        setUser(null);
        if (!silent) {
            toast.success('Logged out successfully');
        }
    }, []);

    const loadProfile = useCallback(async () => {
        try {
            const profileData = await fetchProfile();
            setUser(profileData);
            setRole(profileData.role);
            setRole(profileData.role);
            if (sessionStorage.getItem('isImpersonating') === 'true') {
                sessionStorage.setItem('impersonateRole', profileData.role);
            } else {
                localStorage.setItem('role', profileData.role);
            }
        } catch (error) {
            console.error("Failed to load profile", error);
            if (error.response?.status === 401) {
                logout({ silent: true });
            }
        } finally {
            setLoading(false);
        }
    }, [logout]);

    useEffect(() => {
        if (isAuthenticated) {
            loadProfile();
        } else {
            setLoading(false);
        }

        const handleUnauthorized = () => {
            console.warn("AuthContext: 'unauthorized' event received. Calling logout()...");
            logout({ silent: true });
        };

        window.addEventListener('unauthorized', handleUnauthorized);
        return () => {
            window.removeEventListener('unauthorized', handleUnauthorized);
        };
    }, [isAuthenticated, loadProfile, logout]);

    const login = async (username, password) => {
        try {
            const data = await apiLogin(username, password);
            const accessToken = data.access_token;
            const userRole = data.role;
            if (!accessToken) {
                throw new Error("No access token received from server");
            }
            localStorage.setItem('token', accessToken);
            localStorage.setItem('role', userRole);
            setToken(accessToken);
            setRole(userRole);
            setIsAuthenticated(true);
            toast.success('Successfully logged in');
            return true;
        } catch (error) {
            console.error("AuthContext: Login failed", error);
            const errorMessage = error.response?.data?.detail || error.message || 'Login failed';
            toast.error(errorMessage);
            return false;
        }
    };


    const register = async (username, password) => {
        try {
            await apiRegister(username, password);
            toast.success('Account created! You can now log in.');
            return true;
        } catch (error) {
            console.error("Registration failed", error);
            toast.error(error.response?.data?.detail || 'Registration failed');
            throw error;
        }
    };

    const updateUserProfile = async (profileData) => {
        try {
            const updatedUser = await apiUpdateProfile(profileData);
            setUser(updatedUser);
            setRole(updatedUser.role);
            toast.success('Profile updated successfully');
            return true;
        } catch (error) {
            console.error("Profile update failed", error);
            toast.error(error.response?.data?.detail || 'Failed to update profile');
            return false;
        }
    };

    const updateUserCredentials = async (username, password) => {
        try {
            const updatedUser = await apiUpdateProfile({ username, password });
            setUser(updatedUser);
            toast.success('Security credentials updated');
            return true;
        } catch (error) {
            console.error("Credentials update failed", error);
            toast.error(error.response?.data?.detail || 'Failed to update credentials');
            return false;
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            role,
            token,
            isAuthenticated,
            isImpersonating,
            login,
            logout,
            register,
            loading,
            updateUserProfile,
            updateUserCredentials,
            refreshProfile: loadProfile,
            isSuperAdmin: role === 'SUPER_ADMIN'
        }}>
            {children}
        </AuthContext.Provider>
    );
};
