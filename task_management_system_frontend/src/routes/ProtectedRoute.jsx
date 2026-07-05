import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Requires any authenticated user
export const PrivateRoute = () => {
    const { user, loading } = useAuth();
    if (loading) return <div className="flex items-center justify-center h-screen"><span className="text-gray-400">Loading...</span></div>;
    return user ? <Outlet /> : <Navigate to="/login" replace />;
};

// Requires admin role
export const AdminRoute = () => {
    const { user, loading, isAdmin } = useAuth();
    if (loading) return <div className="flex items-center justify-center h-screen"><span className="text-gray-400">Loading...</span></div>;
    if (!user) return <Navigate to="/login" replace />;
    if (!isAdmin()) return <Navigate to="/dashboard" replace />;
    return <Outlet />;
};
