import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Users, CheckSquare, FileBarChart2,
    LogOut, Menu, X, ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const navItems = (isAdmin) => [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    ...(isAdmin ? [{ to: '/employees', icon: Users, label: 'Employees' }] : []),
    { to: '/tasks', icon: CheckSquare, label: 'Tasks' },
    ...(isAdmin ? [{ to: '/reports', icon: FileBarChart2, label: 'Reports' }] : []),
];

export default function Sidebar() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const { user, logout, isAdmin } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        toast.success('Logged out successfully');
        navigate('/login');
    };

    const links = navItems(isAdmin());

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* Brand */}
            <div className="flex items-center gap-3 px-6 py-5 border-b border-blue-700">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                    <CheckSquare className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-white font-bold text-lg">TaskManager</span>
            </div>

            {/* User info */}
            <div className="px-6 py-4 border-b border-blue-700">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-400 flex items-center justify-center text-white font-semibold text-sm">
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-white text-sm font-medium truncate">{user?.name || 'User'}</p>
                        <p className="text-blue-300 text-xs capitalize">{user?.role || 'employee'}</p>
                    </div>
                </div>
            </div>

            {/* Nav Links */}
            <nav className="flex-1 px-4 py-4 space-y-1">
                {links.map(({ to, icon: Icon, label }) => (
                    <NavLink
                        key={to}
                        to={to}
                        onClick={() => setMobileOpen(false)}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${isActive
                                ? 'bg-white text-blue-700 shadow-sm'
                                : 'text-blue-100 hover:bg-blue-700 hover:text-white'
                            }`
                        }
                    >
                        <Icon size={18} />
                        <span className="flex-1">{label}</span>
                        <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </NavLink>
                ))}
            </nav>

            {/* Logout */}
            <div className="px-4 py-4 border-t border-blue-700">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-blue-100 hover:bg-red-500 hover:text-white transition-all duration-200"
                >
                    <LogOut size={18} />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile Hamburger */}
            <button
                className="fixed top-4 left-4 z-50 lg:hidden bg-blue-600 text-white p-2 rounded-lg shadow-lg"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle menu"
            >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Mobile Overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Mobile Drawer */}
            <aside
                className={`fixed top-0 left-0 h-full w-64 bg-blue-600 z-40 transform transition-transform duration-300 lg:hidden ${mobileOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <SidebarContent />
            </aside>

            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-blue-600 shadow-xl">
                <SidebarContent />
            </aside>
        </>
    );
}
