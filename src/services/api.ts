import axios from 'axios';
import toast from 'react-hot-toast';

// --- Types & Interfaces ---

export type VaultType = 'BANK' | 'CASH' | 'CREDIT_CARD' | 'WALLET';

export interface VaultData {
    name: string;
    type: VaultType;
    initial_balance: number;
    color?: string;
    fluidity_score?: number;
}

export type TransactionType = 'INCOME' | 'EXPENSE';

export interface TransactionData {
    amount: number;
    type: TransactionType;
    category: string;
    account_id: number;
    date: string; // ISO date string YYYY-MM-DD
    note?: string;
    is_split?: boolean;
    split_amount?: number;
    split_with?: string;
    receipt_url?: string;
}

export type SubscriptionFrequency = 'MONTHLY' | 'YEARLY';

export interface SubscriptionData {
    name: string;
    amount: number;
    frequency: SubscriptionFrequency;
    category?: string;
    account_id: number;
    next_billing: string; // ISO date string YYYY-MM-DD
    auto_renewal?: boolean;
    is_active?: boolean;
}

export type DebtType = 'OWED_TO_ME' | 'I_OWE';

export interface DebtData {
    person_name: string;
    amount: number;
    type: DebtType;
    due_date?: string; // ISO date string YYYY-MM-DD
    is_settled?: boolean;
    note?: string;
    transaction_id?: number;
}

export interface GoalData {
    name: string;
    target_amount: number;
    current_amount?: number;
    deadline?: string;
    user_id?: number;
    account_id?: number;
    icon?: string;
}

export interface UserConfigData {
    currency?: string;
    theme?: string;
    timezone?: string;
    is_privacy_mode?: boolean;
    monthly_spending_limits?: Record<string, number>;
    categories?: {
        expense: string[];
        income: string[];
    };
    subscription_keywords?: string[];
    send_welcome_email?: boolean;
}

export interface BudgetAlertEmailPayload {
    category: string;
    month: string;
    spent: number;
    limit: number;
    level: 'approaching' | 'exceeded';
}

export interface SecurityConfigData {
    hashed_pin?: string;
    security_answer?: string;
    biometric_credential_id?: string;
    is_biometric_enabled?: boolean;
}

export interface IntruderLogData {
    snapshot: string; // Base64
}

export interface SecurityLog {
    id: number;
    timestamp: string;
    snapshot_data: string;
    status: string;
}

// --- Axios Instance ---

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor to add token to requests
apiClient.interceptors.request.use((config) => {
    // Check for impersonation token first, then fallback to normal token
    const token = sessionStorage.getItem('impersonateToken') || localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Interceptor for global error handling
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const requestUrl = error.config?.url || '';
        const isAuthAttempt = requestUrl.includes('/token');

        console.log("apiClient: Response error interceptor caught:", status, requestUrl);
        if (status === 401 && !isAuthAttempt) {
            console.warn("apiClient: 401 Unauthorized detected. Clearing token and dispatching 'unauthorized' event.");
            // Clear appropriate token storage
            if (sessionStorage.getItem('impersonateToken')) {
                sessionStorage.removeItem('impersonateToken');
                sessionStorage.removeItem('isImpersonating');
            } else {
                localStorage.removeItem('token');
            }
            // Dispatch custom event for AuthContext to pick up
            window.dispatchEvent(new Event('unauthorized'));
        } else if (status >= 500) {
            toast.error('Something went wrong on our end. Please try again later.');
        }
        return Promise.reject(error);
    }
);

// --- Service Functions ---

// Vaults
export const fetchVaults = async () => {
    const response = await apiClient.get('/vaults/');
    return response.data;
};

export const createVault = async (data: VaultData) => {
    const response = await apiClient.post('/vaults/', data);
    return response.data;
};

export const updateVault = async (id: number | string, data: Partial<VaultData>) => {
    const response = await apiClient.put(`/vaults/${id}`, data);
    return response.data;
};

export const deleteVault = async (id: number | string) => {
    const response = await apiClient.delete(`/vaults/${id}`);
    return response.data;
};

// Transactions
export const fetchTransactions = async (skip: number = 0, limit: number = 100) => {
    const response = await apiClient.get('/transactions/', {
        params: { skip, limit },
    });
    return response.data;
};

export const createTransaction = async (data: TransactionData) => {
    const response = await apiClient.post('/transactions/', data);
    return response.data;
};

export const updateTransaction = async (id: number | string, data: Partial<TransactionData>) => {
    const response = await apiClient.put(`/transactions/${id}`, data);
    return response.data;
};

export const deleteTransaction = async (id: number | string) => {
    const response = await apiClient.delete(`/transactions/${id}`);
    return response.data;
};

// Subscriptions
export const fetchActiveSubscriptions = async () => {
    const response = await apiClient.get('/subscriptions/');
    return response.data;
};

export const createSubscription = async (data: SubscriptionData) => {
    const response = await apiClient.post('/subscriptions/', data);
    return response.data;
};

export const updateSubscription = async (id: number | string, data: Partial<SubscriptionData>) => {
    const response = await apiClient.put(`/subscriptions/${id}`, data);
    return response.data;
};

export const deleteSubscription = async (id: number | string) => {
    const response = await apiClient.delete(`/subscriptions/${id}`);
    return response.data;
};

// Social Capital (Debts)
export const fetchPendingDebts = async () => {
    const response = await apiClient.get('/debts/');
    return response.data;
};

export const createDebt = async (data: DebtData) => {
    const response = await apiClient.post('/debts/', data);
    return response.data;
};

export const updateDebt = async (id: number | string, data: Partial<DebtData>) => {
    const response = await apiClient.put(`/debts/${id}`, data);
    return response.data;
};

export const deleteDebt = async (id: number | string) => {
    const response = await apiClient.delete(`/debts/${id}`);
    return response.data;
};

// Goals
export const fetchGoals = async () => {
    const response = await apiClient.get('/goals/');
    return response.data;
};

export const createGoal = async (data: GoalData) => {
    const response = await apiClient.post('/goals/', data);
    return response.data;
};

export const updateGoal = async (id: number | string, data: Partial<GoalData>) => {
    const response = await apiClient.put(`/goals/${id}`, data);
    return response.data;
};

export const deleteGoal = async (id: number | string) => {
    const response = await apiClient.delete(`/goals/${id}`);
    return response.data;
};

// Config
export const fetchUserConfig = async () => {
    const response = await apiClient.get('/config/');
    return response.data;
};

export const updateUserConfig = async (data: UserConfigData) => {
    const response = await apiClient.put('/config/', data);
    return response.data;
};

// --- Alerts ---

export const sendBudgetAlertEmail = async (payload: BudgetAlertEmailPayload) => {
    const response = await apiClient.post('/alerts/budget-email', payload);
    return response.data;
};

// --- Auth ---
export const login = async (username: string, password: string) => {
    const params = new URLSearchParams();
    params.append('username', username);
    params.append('password', password);
    const response = await apiClient.post('/token', params, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    });
    return response.data;
};

export const register = async (username: string, password: string) => {
    const response = await apiClient.post('/register', { username, password });
    return response.data;
};

export const fetchProfile = async () => {
    const response = await apiClient.get('/users/me');
    return response.data;
};

export const updateProfile = async (data: any) => {
    const response = await apiClient.put('/users/me', data);
    return response.data;
};

// --- AI Service ---
export const scanReceipt = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/scan-receipt', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

// --- Reports / Exports ---

export const downloadMonthlyPdf = async (month: string) => {
    const response = await apiClient.get('/reports/monthly-pdf', {
        params: { month },
        responseType: 'blob',
    });
    return response.data as Blob;
};

export const downloadTransactionsExcel = async (month?: string) => {
    const response = await apiClient.get('/reports/transactions-excel', {
        params: month ? { month } : {},
        responseType: 'blob',
    });
    return response.data as Blob;
};

// --- Security ---

export const fetchSecurityConfig = async () => {
    const response = await apiClient.get('/api/security/config');
    return response.data;
};

export const updateSecurityConfig = async (data: any) => {
    const response = await apiClient.put('/api/security/config', data);
    return response.data;
};

export const registerBiometric = async (credentialId: string) => {
    const response = await apiClient.post('/api/security/register-biometric', { credential_id: credentialId });
    return response.data;
};

export const logIntruder = async (snapshot: string) => {
    const response = await apiClient.post('/api/security/log-intruder', { snapshot });
    return response.data;
};

export const fetchSecurityLogs = async () => {
    const response = await apiClient.get('/api/security/logs');
    return response.data;
};

export const deleteSecurityLog = async (logId: number) => {
    const response = await apiClient.delete(`/api/security/logs/${logId}`);
    return response.data;
};

export const clearAllSecurityLogs = async () => {
    const response = await apiClient.delete('/api/security/logs');
    return response.data;
};

// --- Default Export ---


const api = {
    fetchVaults,
    createVault,
    updateVault,
    deleteVault,
    fetchTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    fetchActiveSubscriptions,
    createSubscription,
    updateSubscription,
    deleteSubscription,
    fetchPendingDebts,
    createDebt,
    updateDebt,
    deleteDebt,
    fetchGoals,
    createGoal,
    updateGoal,
    deleteGoal,
    fetchUserConfig,
    updateUserConfig,
    login,
    register,
    fetchProfile,
    updateProfile,
    scanReceipt,
    sendBudgetAlertEmail,
    downloadMonthlyPdf,
    downloadTransactionsExcel,
    fetchSecurityConfig,
    updateSecurityConfig,
    registerBiometric,
    logIntruder,
    fetchSecurityLogs,
  deleteSecurityLog,
  clearAllSecurityLogs,
  adminDeleteUser: async (userId: number) => {
    const response = await apiClient.delete(`/admin/users/${userId}`);
    return response.data;
  },
  // Admin
  adminFetchUsers: async () => {
    const response = await apiClient.get('/admin/users');
    return response.data;
  },
  adminCreateUser: async (data: any) => {
    const response = await apiClient.post('/admin/users', data);
    return response.data;
  },
  adminUpdateUser: async (userId: number, data: any) => {
    const response = await apiClient.put(`/admin/users/${userId}`, data);
    return response.data;
  },
  adminFetchLogs: async (targetUserId: number) => {
    const response = await apiClient.get('/admin/logs', { params: { target_user_id: targetUserId } });
    return response.data;
  },
  adminDeleteUser: async (userId: number) => {
    const response = await apiClient.delete(`/admin/users/${userId}`);
    return response.data;
  },
  adminImpersonateUser: async (userId: number) => {
    const response = await apiClient.post(`/admin/impersonate/${userId}`);
    return response.data;
  },
};

export default api;
