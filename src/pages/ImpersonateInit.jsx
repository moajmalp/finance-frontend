import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const ImpersonateInit = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const token = queryParams.get('token');

        if (token) {
            sessionStorage.setItem('impersonateToken', token);
            sessionStorage.setItem('isImpersonating', 'true');
            // Remove token from URL history
            window.history.replaceState({}, document.title, '/dashboard');
            // Refresh to trigger AuthContext re-render with new session storage
            window.location.href = '/dashboard';
        } else {
            navigate('/');
        }
    }, [navigate, location]);

    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="flex flex-col items-center space-y-4">
                <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-muted-foreground text-sm tracking-widest uppercase">Initializing Secure Session...</p>
            </div>
        </div>
    );
};

export default ImpersonateInit;
