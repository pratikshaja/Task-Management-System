import { useEffect, useState } from 'react';
import { FileDown, FileText, BarChart2, Users, CheckCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { reportApi } from '../../api/reportApi';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const tabs = [
    { id: 'completed', label: 'Completed Tasks', icon: CheckCircle },
    { id: 'pending', label: 'Pending Tasks', icon: Clock },
    { id: 'employee', label: 'Employee-wise', icon: Users },
];

function downloadCSV(data, filename) {
    if (!data || data.length === 0) { toast.error('No data to export'); return; }
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map((row) => Object.values(row).map((v) => `"${v ?? ''}"`).join(',')).join('\n');
    const blob = new Blob([`${headers}\n${rows}`], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, filename);
    toast.success('CSV exported!');
}

function downloadExcel(data, filename) {
    if (!data || data.length === 0) { toast.error('No data to export'); return; }
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Report');
    const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([buffer], { type: 'application/octet-stream' }), filename);
    toast.success('Excel exported!');
}

const badgeClass = {
    completed: 'badge-completed',
    pending: 'badge-pending',
    overdue: 'badge-overdue',
    in_progress: 'badge-in-progress',
    low: 'text-green-600 bg-green-50 px-2 py-0.5 rounded-full text-xs font-medium',
    medium: 'text-yellow-700 bg-yellow-50 px-2 py-0.5 rounded-full text-xs font-medium',
    high: 'text-red-600 bg-red-50 px-2 py-0.5 rounded-full text-xs font-medium',
};
export default function ReportPage() {
    const [activeTab, setActiveTab] = useState('completed');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchReport = async () => {
            setLoading(true);
            setData([]);
            try {
                let res;
               if (activeTab === 'completed') {
    res = await reportApi.getCompleted();

    console.log("Completed Report:", res.data);

    setData(Array.isArray(res.data?.tasks) ? res.data.tasks : []);
}
else if (activeTab === 'pending') {
    res = await reportApi.getPending();

    console.log("Pending Report:", res.data);

    setData(Array.isArray(res.data?.tasks) ? res.data.tasks : []);
}
else {
    res = await reportApi.getEmployeeWise();

    console.log("Employee Report:", res.data);

    setData(
        Array.isArray(res.data?.employees)
            ? res.data.employees
            : Array.isArray(res.data)
                ? res.data
                : []
    );
}
            } catch {
                toast.error('Failed to load report');
            } finally {
                setLoading(false);
            }
        };
        fetchReport();
    }, [activeTab]);

   const exportData = () => {
    if (!Array.isArray(data)) return [];

    return data.map(({ id, ...rest }) => rest);
};

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
                    <p className="text-gray-500 text-sm mt-0.5">Generate and export task reports</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => downloadCSV(exportData(), `${activeTab}-report.csv`)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                        <FileText size={16} /> Export CSV
                    </button>
                    <button
                        onClick={() => downloadExcel(exportData(), `${activeTab}-report.xlsx`)}
                        className="btn-primary flex items-center gap-2 text-sm"
                    >
                        <FileDown size={16} /> Export Excel
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-gray-200">
                {tabs.map(({ id, label, icon: Icon }) => (
                    <button
                        key={id}
                        onClick={() => setActiveTab(id)}
                        className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${activeTab === id
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <Icon size={16} />
                        <span className="hidden sm:inline">{label}</span>
                    </button>
                ))}
            </div>

            {/* Summary */}
            {!loading && Array.isArray(data) && data.length > 0 && (
                <div className="mb-4 flex items-center gap-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <BarChart2 size={16} className="text-blue-500" />
                        <span><strong>{data.length}</strong> records found</span>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-48">
                        <div className="animate-spin h-7 w-7 border-4 border-blue-600 border-t-transparent rounded-full" />
                    </div>
                ) : data.length === 0 ? (
                    <div className="py-16 text-center text-gray-400">No data available</div>
                ) : (
                    <div className="overflow-x-auto">
                        {/* Completed / Pending Tasks Table */}
                        {(activeTab === 'completed' || activeTab === 'pending') && (
                            <table className="min-w-full text-sm">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-5 py-3 text-left font-semibold text-gray-600">Task</th>
                                        <th className="px-5 py-3 text-left font-semibold text-gray-600">Assigned To</th>
                                        <th className="px-5 py-3 text-left font-semibold text-gray-600">Due Date</th>
                                        <th className="px-5 py-3 text-left font-semibold text-gray-600">Priority</th>
                                        <th className="px-5 py-3 text-left font-semibold text-gray-600">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {data.map((task, i) => (
                                        <tr key={task.id || i} className="hover:bg-gray-50">
                                            <td className="px-5 py-4">
                                                <div>
                                                    <p className="font-medium text-gray-900">{task.title}</p>
                                                    <p className="text-xs text-gray-400 line-clamp-1">{task.description}</p>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-gray-600">
                                            {task.assignee?.fullName || "Not Assigned"}
                                        </td>

                                        <td className="px-5 py-4 text-gray-600">
                                            {task.dueDate
                                                ? format(new Date(task.dueDate), "MMM d, yyyy")
                                                : "—"}
                                        </td>
                                        <td className='px-5 py-4'>
                                             <span
                                                className={
                                                    badgeClass[task.priority?.toLowerCase()] ||
                                                    "badge-pending"
                                                }
                                            >
                                                {task.priority}
                                            </span>
                                        </td>

                                        <td className="px-5 py-4">
                                            <span
                                                className={
                                                    badgeClass[task.status?.toLowerCase()] ||
                                                    "badge-pending"
                                                }
                                            >
                                                {task.status}
                                            </span>
                                        </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}

                        {/* Employee-wise Table */}
                        {activeTab === 'employee' && (
                            <table className="min-w-full text-sm">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-5 py-3 text-left font-semibold text-gray-600">Employee</th>
                                        <th className="px-5 py-3 text-left font-semibold text-gray-600">Total Tasks</th>
                                        <th className="px-5 py-3 text-left font-semibold text-gray-600">Completed</th>
                                        <th className="px-5 py-3 text-left font-semibold text-gray-600">Pending</th>
                                        <th className="px-5 py-3 text-left font-semibold text-gray-600">In Progress</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {data.map((row, i) => (
                                        <tr key={row.employee_id || i} className="hover:bg-gray-50">
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold text-xs">
                                                        {(row.name || row.employee_name || '?').charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{row.name || row.employee_name}</p>
                                                        <p className="text-xs text-gray-400">{row.department}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 font-semibold text-gray-900">{row.total_tasks}</td>
                                            <td className="px-5 py-4 text-green-600 font-medium">{row.completed}</td>
                                            <td className="px-5 py-4 text-yellow-600 font-medium">{row.pending}</td>
                                            <td className="px-5 py-4 text-blue-600 font-medium">{row.in_progress}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
