import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function MainLayout() {
    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <main className="flex-1 overflow-auto">
                {/* Top padding on mobile for hamburger button */}
                <div className="pt-16 lg:pt-0">
                    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
}
