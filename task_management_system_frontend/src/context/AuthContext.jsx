import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Try localStorage first (remember me), then sessionStorage
        const storedToken =
            localStorage.getItem('token') || sessionStorage.getItem('token');
        const storedUser =
            localStorage.getItem('user') || sessionStorage.getItem('user');

        if (storedToken && storedUser) {
            try {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
            } catch {
                localStorage.clear();
                sessionStorage.clear();
            }
        }
        setLoading(false);
    }, []);

    const login = (userData, tokenValue, rememberMe = false) => {
        setUser(userData);
        setToken(tokenValue);
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem('token', tokenValue);
        storage.setItem('user', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
    };

    const isAdmin = () => user?.role === 'admin' || user?.role === 'Admin';

    return (
        <AuthContext.Provider value={{ user, token, loading, login, logout, isAdmin }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};
