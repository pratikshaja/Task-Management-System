import { useEffect, useState, useCallback } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Plus, Search, Pencil, Trash2, ChevronUp, ChevronDown, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { employeeApi } from '../../api/employeeApi';
import ConfirmDialog from '../../components/shared/ConfirmDialog';

const employeeSchema = (isEdit) => Yup.object({
    name: Yup.string().min(2, 'Name too short').required('Name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    department: Yup.string().required('Department is required'),
    designation: Yup.string().required('Designation is required'),
    password: isEdit
        ? Yup.string() // edit वेळी optional
        : Yup.string()
              .min(8, 'Password must be at least 8 characters')
              .matches(/[A-Z]/, 'Must contain an uppercase letter')
              .matches(/[a-z]/, 'Must contain a lowercase letter')
              .matches(/[0-9]/, 'Must contain a number')
              .required('Password is required'),
});

// ── Modal ────────────────────────────────────────────────────────────────────
function EmployeeModal({ isOpen, onClose, onSuccess, editData }) {
    const isEdit = Boolean(editData);

    const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
        name: editData?.name || '',
        email: editData?.email || '',
        department: editData?.department || '',
        designation: editData?.designation || '',
        password: '',
    },
    validationSchema: employeeSchema(isEdit), // function call करून schema मिळव
    onSubmit: async (values, { setSubmitting, resetForm }) => {
        try {
            if (isEdit) {
                const { password, ...updateValues } = values; // edit वेळी password पाठवायची गरज नाही
                await employeeApi.update(editData.id, updateValues);
                toast.success('Employee updated!');
            } else {
                await employeeApi.create(values);
                toast.success(`Employee added! Share these credentials — Email: ${values.email}, Password: ${values.password}`, { duration: 10000 });
            }
            resetForm();
            onSuccess();
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Operation failed');
        } finally {
            setSubmitting(false);
        }
    },
});

    if (!isOpen) return null;

    const inputCls = (field) =>
        `input-field ${formik.touched[field] && formik.errors[field] ? 'border-red-400 focus:ring-red-400' : ''}`;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="fixed inset-0 bg-black/40" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 w-full max-w-md">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-bold text-gray-900">{isEdit ? 'Edit Employee' : 'Add Employee'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                </div>
                <form onSubmit={formik.handleSubmit} noValidate>
                    {[
                        { id: 'name', label: 'Full Name', placeholder: 'Alice Johnson' },
                        { id: 'email', label: 'Email Address', placeholder: 'alice@company.com', type: 'email' },
                        { id: 'department', label: 'Department', placeholder: 'Engineering' },
                        { id: 'designation', label: 'Designation', placeholder: 'Software Developer' },
                        ...(!isEdit ? [{ id: 'password', label: 'Password', placeholder: 'Min 8 chars, Aa1...', type: 'text' }] : []),
                    ].map(({ id, label, placeholder, type = 'text' }) => (
                        <div key={id} className="mb-4">
                            <label htmlFor={id} className="label">{label}</label>
                            <input id={id} type={type} placeholder={placeholder} className={inputCls(id)} {...formik.getFieldProps(id)} />
                            {formik.touched[id] && formik.errors[id] && <p className="error-text">{formik.errors[id]}</p>}
                        </div>
                    ))}
                    <div className="flex gap-3 justify-end mt-6">
                        <button type="button" onClick={onClose} className="btn-secondary px-5">Cancel</button>
                        <button type="submit" disabled={formik.isSubmitting} className="btn-primary px-6">
                            {formik.isSubmitting ? 'Saving...' : isEdit ? 'Update' : 'Add Employee'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function EmployeePage() {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [sortKey, setSortKey] = useState('name');
    const [sortDir, setSortDir] = useState('asc');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [modalOpen, setModalOpen] = useState(false);
    const [editEmployee, setEditEmployee] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const PER_PAGE = 8;

    const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
        const res = await employeeApi.getAll({ search, sort: sortKey, order: sortDir, page, limit: PER_PAGE });
        const data = res.data?.employees || [];
        setEmployees(Array.isArray(data) ? data : []);
        const total = res.data?.meta?.totalItems || data.length;
        setTotalPages(Math.max(1, Math.ceil(total / PER_PAGE)));
    } catch {
        toast.error('Failed to load employees');
    } finally {
        setLoading(false);
    }
}, [search, sortKey, sortDir, page]);

    useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

    const handleSort = (key) => {
        if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
        else { setSortKey(key); setSortDir('asc'); }
        setPage(1);
    };

    const handleDelete = async () => {
        try {
            await employeeApi.delete(deleteTarget.id);
            toast.success('Employee deleted');
            setDeleteTarget(null);
            fetchEmployees();
        } catch {
            toast.error('Delete failed');
        }
    };

    const SortIcon = ({ field }) => {
        if (sortKey !== field) return <ChevronUp size={14} className="text-gray-300" />;
        return sortDir === 'asc' ? <ChevronUp size={14} className="text-blue-500" /> : <ChevronDown size={14} className="text-blue-500" />;
    };

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
                    <p className="text-gray-500 text-sm mt-0.5">Manage your team members</p>
                </div>
                <button onClick={() => { setEditEmployee(null); setModalOpen(true); }} className="btn-primary flex items-center gap-2">
                    <Plus size={18} /> Add Employee
                </button>
            </div>

            {/* Search */}
            <div className="relative mb-5 max-w-sm">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search by name, email, department..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    className="input-field pl-9"
                />
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                {[
                                    { key: 'fullName', label: 'Name' },
                                    { key: 'email', label: 'Email' },
                                    { key: 'department', label: 'Department' },
                                    { key: 'designation', label: 'Designation' },
                                ].map(({ key, label }) => (
                                    <th key={key} className="text-left px-5 py-3 font-semibold text-gray-600 cursor-pointer select-none whitespace-nowrap" onClick={() => handleSort(key)}>
                                        <div className="flex items-center gap-1">{label}<SortIcon field={key} /></div>
                                    </th>
                                ))}
                                <th className="px-5 py-3 text-right font-semibold text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan={5} className="px-5 py-10 text-center text-gray-400">Loading...</td></tr>
                            ) : employees.length === 0 ? (
                                <tr><td colSpan={5} className="px-5 py-10 text-center text-gray-400">No employees found</td></tr>
                            ) : employees.map((emp) => (
                                <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold text-xs">
                                                {emp.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="font-medium text-gray-900">{emp.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 text-gray-600">{emp.email}</td>
                                    <td className="px-5 py-4 text-gray-600">{emp.department}</td>
                                    <td className="px-5 py-4 text-gray-600">{emp.designation}</td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => { setEditEmployee(emp); setModalOpen(true); }}
                                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <Pencil size={16} />
                                            </button>
                                            <button
                                                onClick={() => setDeleteTarget(emp)}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
                        <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
                        <div className="flex gap-2">
                            <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}
                                className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors">
                                Previous
                            </button>
                            <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}
                                className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors">
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            <EmployeeModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSuccess={fetchEmployees}
                editData={editEmployee}
            />
            <ConfirmDialog
                isOpen={Boolean(deleteTarget)}
                title="Delete Employee"
                message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
            />
        </div>
    );
}
