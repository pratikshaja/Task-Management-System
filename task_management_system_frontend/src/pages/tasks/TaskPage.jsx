import { useEffect, useState, useCallback } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Plus, Search, Pencil, Trash2, Paperclip, X, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { taskApi } from '../../api/taskApi';
import { employeeApi } from '../../api/employeeApi';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';

const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

const taskSchema = Yup.object({
    title: Yup.string().min(2, 'Title too short').required('Title is required'),
    description: Yup.string(),
    assignedTo: Yup.string().required('Please assign to an employee'),
    dueDate: Yup.string().required('Due date is required'),
    startDate: Yup.string().required('Start date is required'),
    status: Yup.string().required('Status is required'),
    priority: Yup.string().required('Priority is required'),
});

const STATUS_OPTIONS = ['Pending', 'In Progress', 'Completed'];
const PRIORITY_OPTIONS = ['Low', 'Medium', 'High'];

const badgeClass = { Completed: 'badge-completed', Pending: 'badge-pending', 'In Progress': 'badge-in-progress', Overdue: 'badge-overdue' };
const priorityColor = { Low: 'text-green-600 bg-green-50', Medium: 'text-yellow-700 bg-yellow-50', High: 'text-red-600 bg-red-50' };

// ── Task Modal ────────────────────────────────────────────────────────────────
function TaskModal({ isOpen, onClose, onSuccess, editData, employees }) {
    const isEdit = Boolean(editData);
    const [fileError, setFileError] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            title: editData?.title || '',
            description: editData?.description || '',
            assignedTo: editData?.assignedTo || '',
            startDate: editData?.startDate ? editData.startDate.slice(0, 10) : new Date().toISOString().slice(0, 10),
            dueDate: editData?.dueDate ? editData.dueDate.slice(0, 10) : '',
            status: editData?.status || 'Pending',
            priority: editData?.priority || 'Medium',
        },
        validationSchema: taskSchema,
        onSubmit: async (values, { setSubmitting, resetForm }) => {
                try {
                let taskId;
                if (isEdit) {
                    await taskApi.update(editData.id, values); 
                    taskId = editData.id;
                    toast.success('Task updated!');
                } else {
                    const res = await taskApi.create(values); 
                    taskId = res.data.task.id;
                    toast.success('Task created!');
                }

                if (selectedFile) {
                    const fd = new FormData();
                    fd.append('file', selectedFile); 
                    await taskApi.uploadFile(taskId, fd);
                }

                resetForm();
                setSelectedFile(null);
                onSuccess();
                onClose();
            } catch (err) {
                toast.error(err.response?.data?.message || 'Operation failed');
            } finally {
                setSubmitting(false);
            }
        },
    });

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!ALLOWED_TYPES.includes(file.type)) {
            setFileError('Only PDF, JPG, PNG files are allowed');
            return;
        }
        if (file.size > MAX_SIZE) {
            setFileError('File size must not exceed 5 MB');
            return;
        }
        setFileError('');
        setSelectedFile(file);
    };

    if (!isOpen) return null;

    const inp = (field) =>
        `input-field ${formik.touched[field] && formik.errors[field] ? 'border-red-400 focus:ring-red-400' : ''}`;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
            <div className="fixed inset-0 bg-black/40" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-bold text-gray-900">{isEdit ? 'Edit Task' : 'Create Task'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                </div>

                <form onSubmit={formik.handleSubmit} noValidate>
                    {/* Title */}
                    <div className="mb-4">
                        <label className="label">Task Title</label>
                        <input placeholder="Fix login bug" className={inp('title')} {...formik.getFieldProps('title')} />
                        {formik.touched.title && formik.errors.title && <p className="error-text">{formik.errors.title}</p>}
                    </div>

                    {/* Description */}
                    <div className="mb-4">
                        <label className="label">Description</label>
                        <textarea rows={3} placeholder="Describe the task..." className={`${inp('description')} resize-none`} {...formik.getFieldProps('description')} />
                        {formik.touched.description && formik.errors.description && <p className="error-text">{formik.errors.description}</p>}
                    </div>

                    {/* Assigned To */}
                   <select className={inp('assignedTo')} {...formik.getFieldProps('assignedTo')}>
                    <option value="">Select employee</option>
                    {employees.map((e) => (
                        <option key={e.id} value={e.userId}>{e.name}</option>
                    ))}
                </select>

                    {/* Due Date + Status */}
                   <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="label">Start Date</label>
                        <input type="date" className={inp('startDate')} {...formik.getFieldProps('startDate')} />
                    </div>
                    <div>
                        <label className="label">Due Date</label>
                        <input type="date" className={inp('dueDate')} {...formik.getFieldProps('dueDate')} />
                        {formik.touched.dueDate && formik.errors.dueDate && <p className="error-text">{formik.errors.dueDate}</p>}
                    </div>
                </div>

                    {/* Priority */}
                    <div className="mb-4">
                        <label className="label">Priority</label>
                        <select className={inp('priority')} {...formik.getFieldProps('priority')}>
                            {PRIORITY_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>

                    {/* File Upload */}
                    <div className="mb-6">
                        <label className="label">Attachment (optional)</label>
                        <label className="flex items-center gap-3 cursor-pointer border-2 border-dashed border-gray-200 rounded-xl px-4 py-3 hover:border-blue-300 transition-colors">
                            <Paperclip size={18} className="text-gray-400" />
                            <span className="text-sm text-gray-500">
                                {selectedFile ? selectedFile.name : 'Click to upload PDF, JPG, or PNG (max 5 MB)'}
                            </span>
                            <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} />
                        </label>
                        {fileError && <p className="error-text">{fileError}</p>}
                    </div>

                    <div className="flex gap-3 justify-end">
                        <button type="button" onClick={onClose} className="btn-secondary px-5">Cancel</button>
                        <button type="submit" disabled={formik.isSubmitting} className="btn-primary px-6">
                            {formik.isSubmitting ? 'Saving...' : isEdit ? 'Update' : 'Create Task'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function TaskPage() {
    const { isAdmin } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editTask, setEditTask] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const PER_PAGE = 10;

   const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
        const params = { page, limit: PER_PAGE };
        if (statusFilter) params.status = statusFilter;
        const res = await taskApi.getAll(params);
        const data = res.data?.tasks || [];
        setTasks(Array.isArray(data) ? data : []);
        const total = res.data?.total || data.length;
        setTotalPages(Math.max(1, Math.ceil(total / PER_PAGE)));
    } catch {
        toast.error('Failed to load tasks');
    } finally {
        setLoading(false);
    }
}, [statusFilter, page]);

    useEffect(() => { fetchTasks(); }, [fetchTasks]);

    useEffect(() => {
    if (isAdmin()) {
        employeeApi.getAll({ limit: 200 }).then((res) => {
            const data = res.data?.employees || [];
            setEmployees(Array.isArray(data) ? data : []);
        }).catch(() => { });
    }
}, [isAdmin]);

    const handleDelete = async () => {
        try {
            await taskApi.delete(deleteTarget.id);
            toast.success('Task deleted');
            setDeleteTarget(null);
            fetchTasks();
        } catch {
            toast.error('Delete failed');
        }
    };

  const handleStatusChange = async (task, newStatus) => {
    try {
        await taskApi.update(task.id, { status: newStatus }); // PUT, PATCH नाही
        toast.success('Status updated');
        fetchTasks();
    } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to update status');
    }
};

    const isOverdue = (task) =>
        task.status !== 'Completed' && new Date(task.due_date) < new Date();

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
                    <p className="text-gray-500 text-sm mt-0.5">{isAdmin() ? 'Manage all tasks' : 'Your assigned tasks'}</p>
                </div>
                {isAdmin() && (
                    <button onClick={() => { setEditTask(null); setModalOpen(true); }} className="btn-primary flex items-center gap-2">
                        <Plus size={18} /> Create Task
                    </button>
                )}
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
                <div className="relative flex-1 max-w-sm">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" placeholder="Search tasks..." value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="input-field pl-9" />
                </div>
                <div className="flex items-center gap-2">
                    <Filter size={16} className="text-gray-400" />
                    <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                        className="input-field w-40">
                        <option value="">All Statuses</option>
                        {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                    </select>
                </div>
            </div>

            {/* Task Cards */}
            {loading ? (
                <div className="flex items-center justify-center h-48">
                    <div className="animate-spin h-7 w-7 border-4 border-blue-600 border-t-transparent rounded-full" />
                </div>
            ) : tasks.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm py-16 text-center">
                    <p className="text-gray-400">No tasks found</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {tasks.map((task) => (
                        <div key={task.id} className={`bg-white rounded-xl border shadow-sm p-5 hover:shadow-md transition-shadow ${isOverdue(task) ? 'border-red-200' : 'border-gray-100'}`}>
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                        <h3 className="font-semibold text-gray-900 truncate">{task.title}</h3>
                                        <span className={`${badgeClass[isOverdue(task) ? 'Overdue' : task.status]}`}>
                                            {isOverdue(task) ? 'Overdue' : task.status}
                                        </span>
                                       <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColor[task.priority] || 'text-gray-600 bg-gray-100'}`}>
                                            {task.priority}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 line-clamp-2 mb-2">{task.description}</p>
                                   <div className="flex flex-wrap gap-4 text-xs text-gray-400">
                                        {task.assignee?.fullName && <span>👤 {task.assignee.fullName}</span>}
                                        {task.dueDate && <span>📅 {format(new Date(task.dueDate), 'MMM d, yyyy')}</span>}
                                        {task.filePath && <span className="flex items-center gap-1"><Paperclip size={12} />Attachment</span>}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {/* Quick status update for employee */}
                                    {!isAdmin() && task.status !== 'completed' && (
                                        <button onClick={() => handleStatusChange(task, 'Completed')}
                                            className="text-xs bg-green-50 text-green-700 hover:bg-green-100 px-3 py-1.5 rounded-lg font-medium transition-colors">
                                            Mark Complete
                                        </button>
                                    )}
                                    {isAdmin() && (
                                        <>
                                            <button onClick={() => { setEditTask(task); setModalOpen(true); }}
                                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                                <Pencil size={16} />
                                            </button>
                                            <button onClick={() => setDeleteTarget(task)}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                    <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
                    <div className="flex gap-2">
                        <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}
                            className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">Previous</button>
                        <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}
                            className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">Next</button>
                    </div>
                </div>
            )}

            {/* Modals */}
            <TaskModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSuccess={fetchTasks}
                editData={editTask}
                employees={employees}
            />
            <ConfirmDialog
                isOpen={Boolean(deleteTarget)}
                title="Delete Task"
                message={`Delete "${deleteTarget?.title}"? This action cannot be undone.`}
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
            />
        </div>
    );
}
