import { useEffect, useState } from 'react';
import { Users, CheckSquare, Clock, AlertCircle, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/shared/StatCard';
import { dashboardApi } from '../api/dashboardApi';
import toast from 'react-hot-toast';

export default function Dashboard() {
    const { isAdmin, user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await dashboardApi.getAll();
                setStats(res.data);
            } catch {
                toast.error('Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div>
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">
                    {isAdmin() ? 'Admin Dashboard' : 'My Dashboard'}
                </h1>
                <p className="text-gray-500 mt-1">
                    Welcome back, <span className="font-medium text-gray-700">{user?.fullName}</span> 👋
                </p>
            </div>

            {/* Admin Stats */}
            {isAdmin() && stats && (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                        <StatCard icon={Users} label="Total Employees" value={stats.totalEmployees} color="purple" />
                        <StatCard icon={CheckSquare} label="Total Tasks" value={stats.totalTasks} color="blue" />
                        <StatCard icon={TrendingUp} label="Completed Tasks" value={stats.completedTasks} color="green" />
                        <StatCard icon={Clock} label="Pending Tasks" value={stats.pendingTasks} color="yellow" />
                    </div>

                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                        <h2 className="text-base font-semibold text-gray-900 mb-4">Task Overview</h2>
                        <div className="space-y-3">
                            {[
                                { label: 'Completed', count: stats.completedTasks, total: stats.totalTasks, color: 'bg-green-500' },
                                { label: 'Pending', count: stats.pendingTasks, total: stats.totalTasks, color: 'bg-yellow-400' },
                            ].map(({ label, count, total, color }) => (
                                <div key={label}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-600">{label}</span>
                                        <span className="font-medium">{count}</span>
                                    </div>
                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${color} transition-all duration-500`}
                                            style={{ width: total ? `${(count / total) * 100}%` : '0%' }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {/* Employee Stats */}
            {!isAdmin() && stats && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    <StatCard icon={CheckSquare} label="My Total Tasks" value={stats.myTasks} color="blue" />
                    <StatCard icon={TrendingUp} label="Completed" value={stats.completed} color="green" />
                    <StatCard icon={Clock} label="Pending" value={stats.pending} color="yellow" />
                    <StatCard icon={AlertCircle} label="Overdue" value={stats.overdue} color="red" />
                </div>
            )}
        </div>
    );
}