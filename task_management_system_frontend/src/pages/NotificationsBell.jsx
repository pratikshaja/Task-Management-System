// src/components/shared/NotificationBell.jsx
import { useEffect, useState, useRef } from 'react';
import { Bell } from 'lucide-react';
import { notificationsApi } from '../api/notificationsApi';
import { format } from 'date-fns';

export default function NotificationsBell() {
    const [notifications, setNotifications] = useState([]);
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);

    const fetchNotifications = async () => {
        try {
            const res = await notificationsApi.getAll();
            setNotifications(Array.isArray(res.data) ? res.data : []);
        } catch {
            console.error();
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    const handleMarkRead = async (id) => {
        try {
            await notificationsApi.markAsRead(id);
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
            );
        } catch {
            // ignore
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setOpen((o) => !o)}
                className="relative p-2 text-gray-500 bg-gray-100  hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                        {unreadCount}
                    </span>
                )}
            </button>

           {open && (
            <div 
                className="fixed top-16 left-4 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-[100] max-h-96 overflow-y-auto"
                style={{ maxWidth: 'calc(100vw - 2rem)' }}
            >
                <div className="px-4 py-3 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900 text-sm">Notifications</h3>
                </div>
                {notifications.length === 0 ? (
                    <p className="px-4 py-6 text-center text-sm text-gray-400">No notifications</p>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {notifications.map((n) => (
                            <div
                                key={n.id}
                                onClick={() => !n.isRead && handleMarkRead(n.id)}
                                className={`px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${!n.isRead ? 'bg-blue-50/50' : ''}`}
                            >
                                <p className="text-sm text-gray-700">{n.message}</p>
                                <p className="text-xs text-gray-400 mt-1">
                                    {format(new Date(n.createdAt), 'MMM d, h:mm a')}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )}
        </div>
    );
}