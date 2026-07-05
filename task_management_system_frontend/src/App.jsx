import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { PrivateRoute, AdminRoute } from './routes/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';

// Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import EmployeePage from './pages/employees/EmployeePage';
import TaskPage from './pages/tasks/TaskPage';
import ReportPage from './pages/reports/ReportPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: { borderRadius: '10px', fontSize: '14px', fontFamily: 'Inter, sans-serif' },
          }}
        />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route element={<PrivateRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/tasks" element={<TaskPage />} />

              {/* Admin Only */}
              <Route element={<AdminRoute />}>
                <Route path="/employees" element={<EmployeePage />} />
                <Route path="/reports" element={<ReportPage />} />
              </Route>
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
