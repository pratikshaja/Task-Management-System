import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '../../api/authApi';
import { useAuth } from '../../context/AuthContext';

const loginSchema = Yup.object({
    email: Yup.string().email('Invalid email address').required('Email is required'),
    password: Yup.string()
        .min(8, 'Password must be at least 8 characters')
        .required('Password is required'),
});

export default function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const formik = useFormik({
        initialValues: { email: '', password: '', rememberMe: false },
        validationSchema: loginSchema,
        onSubmit: async (values, { setSubmitting }) => {
            try {
                const res = await authApi.login({ email: values.email, password: values.password });
                const { token, user } = res.data;
                login(user, token, values.rememberMe);
                toast.success(`Welcome back, ${user.name || user.email}!`);
                navigate('/dashboard');
            } catch (err) {
                const msg = err.response?.data?.message || 'Login failed. Please try again.';
                toast.error(msg);
            } finally {
                setSubmitting(false);
            }
        },
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                {/* Logo / Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl shadow-lg mb-4">
                        <LogIn className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">Task Manager</h1>
                    <p className="text-gray-500 mt-1">Sign in to your account</p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                    <form onSubmit={formik.handleSubmit} noValidate>
                        {/* Email */}
                        <div className="mb-5">
                            <label htmlFor="email" className="label">Email Address</label>
                            <input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                className={`input-field ${formik.touched.email && formik.errors.email ? 'border-red-400 focus:ring-red-400' : ''}`}
                                {...formik.getFieldProps('email')}
                            />
                            {formik.touched.email && formik.errors.email && (
                                <p className="error-text">{formik.errors.email}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div className="mb-5">
                            <label htmlFor="password" className="label">Password</label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    className={`input-field pr-12 ${formik.touched.password && formik.errors.password ? 'border-red-400 focus:ring-red-400' : ''}`}
                                    {...formik.getFieldProps('password')}
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {formik.touched.password && formik.errors.password && (
                                <p className="error-text">{formik.errors.password}</p>
                            )}
                        </div>

                        {/* Remember Me */}
                        <div className="flex items-center mb-6">
                            <input
                                id="rememberMe"
                                type="checkbox"
                                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                                {...formik.getFieldProps('rememberMe')}
                                checked={formik.values.rememberMe}
                            />
                            <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-600 cursor-pointer">
                                Remember me
                            </label>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={formik.isSubmitting}
                            className="btn-primary w-full py-3 text-base"
                        >
                            {formik.isSubmitting ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                    </svg>
                                    Signing in...
                                </span>
                            ) : 'Sign In'}
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-500 mt-6">
                        Don&apos;t have an account?{' '}
                        <Link to="/register" className="text-blue-600 font-semibold hover:underline">
                            Register
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
