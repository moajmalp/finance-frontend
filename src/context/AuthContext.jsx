import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { login as apiLogin, register as apiRegister, fetchProfile, updateProfile as apiUpdateProfile } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(localStorage.getItem('role'));
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    const logout = useCallback((options = {}) => {
        const { silent = false } = options;
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
            localStorage.setItem('role', profileData.role);
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
