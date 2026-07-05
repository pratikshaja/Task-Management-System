// Reusable stat card for dashboard
export default function StatCard({ icon: Icon, label, value, color = 'blue', subLabel }) {
    const colorMap = {
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
        yellow: 'bg-yellow-50 text-yellow-600',
        red: 'bg-red-50 text-red-600',
        purple: 'bg-purple-50 text-purple-600',
    };

    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${colorMap[color] || colorMap.blue}`}>
                    <Icon size={22} />
                </div>
            </div>
            <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
            <p className="text-3xl font-bold text-gray-900">{value ?? '—'}</p>
            {subLabel && <p className="text-xs text-gray-400 mt-1">{subLabel}</p>}
        </div>
    );
}
