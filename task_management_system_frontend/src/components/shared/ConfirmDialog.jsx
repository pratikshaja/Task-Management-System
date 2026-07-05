// Generic confirmation dialog modal
export default function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel, confirmLabel = 'Delete', confirmClass = 'btn-danger' }) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="fixed inset-0 bg-black/40" onClick={onCancel} />
            <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 w-full max-w-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm mb-6">{message}</p>
                <div className="flex gap-3 justify-end">
                    <button onClick={onCancel} className="btn-secondary px-5">Cancel</button>
                    <button onClick={onConfirm} className={`${confirmClass} px-5`}>{confirmLabel}</button>
                </div>
            </div>
        </div>
    );
}
