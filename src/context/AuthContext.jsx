import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { login as apiLogin, register as apiRegister, fetchProfile, updateProfile as apiUpdateProfile } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    const loadProfile = useCallback(async () => {
        try {
            const profileData = await fetchProfile();
            setUser(profileData);
        } catch (error) {
            console.error("Failed to load profile", error);
            // If token is invalid, logout
            if (error.response?.status === 401) {
                logout();
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isAuthenticated) {
            loadProfile();
        } else {
            setLoading(false);
        }
    }, [isAuthenticated, loadProfile]);

    const login = async (username, password) => {
        try {
            const data = await apiLogin(username, password);
            const accessToken = data.access_token;
            localStorage.setItem('token', accessToken);
            setToken(accessToken);
            setIsAuthenticated(true);
            toast.success('Successfully logged in');
            return true;
        } catch (error) {
            console.error("Login failed", error);
            toast.error(error.response?.data?.detail || 'Login failed');
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setIsAuthenticated(false);
        setUser(null);
        toast.success('Logged out successfully');
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
            token,
            isAuthenticated,
            login,
            logout,
            register,
            loading,
            updateUserProfile,
            updateUserCredentials,
            refreshProfile: loadProfile
        }}>
            {children}
        </AuthContext.Provider>
    );
};
