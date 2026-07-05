import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '../../api/authApi';

const registerSchema = Yup.object({
    fullName: Yup.string().min(2, 'Name too short').required('Full name is required'),
    email: Yup.string().email('Invalid email address').required('Email is required'),
    password: Yup.string()
        .min(8, 'Password must be at least 8 characters')
        .matches(/[A-Z]/, 'Must contain at least one uppercase letter')
        .matches(/[a-z]/, 'Must contain at least one lowercase letter')
        .matches(/[0-9]/, 'Must contain at least one number')
        .required('Password is required'),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref('password')], 'Passwords must match')
        .required('Please confirm your password'),
    role: Yup.string().oneOf(['Admin', 'Employee'], 'Please select a role').required('Role is required'),});


    const Field = ({ id, label, type = 'text', placeholder, formik, extra, children }) => (
        <div className="mb-4">
            <label htmlFor={id} className="label">{label}</label>
            {children || (
                <input
                    id={id}
                    type={type}
                    placeholder={placeholder}
                    className={`input-field ${extra} ${formik.touched[id] && formik.errors[id] ? 'border-red-400 focus:ring-red-400' : ''}`}
                    {...formik.getFieldProps(id)}
                />
            )}
            {formik.touched[id] && formik.errors[id] && (
                <p className="error-text">{formik.errors[id]}</p>
            )}
        </div>
    );

export default function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const navigate = useNavigate();

    const formik = useFormik({
        initialValues: { fullName: '', email: '', password: '', confirmPassword: '', role: '' },
        validationSchema: registerSchema,
        onSubmit: async (values, { setSubmitting }) => {
            try {
                await authApi.register(values); 
                toast.success('Account created! Please log in.');
                navigate('/login');
            } catch (err) {
                const msg = err.response?.data?.message || 'Registration failed. Please try again.';
                toast.error(msg);
            } finally {
                setSubmitting(false);
            }
        },
    });


    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl shadow-lg mb-4">
                        <UserPlus className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
                    <p className="text-gray-500 mt-1">Join the Task Management System</p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                    <form onSubmit={formik.handleSubmit} noValidate>
                        {/* Full Name */}
                        <Field id="fullName" label="Full Name" placeholder="John Doe" formik={formik} />

                        {/* Email */}
                        <Field id="email" label="Email Address" type="email" placeholder="you@example.com" formik={formik} />

                        {/* Password */}
                        <div className="mb-4">
                            <label htmlFor="password" className="label">Password</label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    formik={formik}
                                    className={`input-field pr-12 ${formik.touched.password && formik.errors.password ? 'border-red-400 focus:ring-red-400' : ''}`}
                                    {...formik.getFieldProps('password')}
                                />
                                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {formik.touched.password && formik.errors.password && (
                                <p className="error-text">{formik.errors.password}</p>
                            )}
                            <ul className="mt-2 space-y-1">
                                {['8+ characters', 'One uppercase', 'One lowercase', 'One number'].map((rule, i) => (
                                    <li key={i} className="text-xs text-gray-400 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300 inline-block" />
                                        {rule}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Confirm Password */}
                        <div className="mb-4">
                            <label htmlFor="confirmPassword" className="label">Confirm Password</label>
                            <div className="relative">
                                <input
                                    id="confirmPassword"
                                    type={showConfirm ? 'text' : 'password'}
                                    formik={formik}
                                    placeholder="••••••••"
                                    className={`input-field pr-12 ${formik.touched.confirmPassword && formik.errors.confirmPassword ? 'border-red-400 focus:ring-red-400' : ''}`}
                                    {...formik.getFieldProps('confirmPassword')}
                                />
                                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    onClick={() => setShowConfirm(!showConfirm)}>
                                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                                <p className="error-text">{formik.errors.confirmPassword}</p>
                            )}
                        </div>

                        {/* Role */}
                        <div className="mb-6">
                            <label htmlFor="role" className="label">Role</label>
                            <select
                                id="role"
                                formik={formik}
                                className={`input-field ${formik.touched.role && formik.errors.role ? 'border-red-400 focus:ring-red-400' : ''}`}
                                {...formik.getFieldProps('role')}
                            >
                                <option value="">Select a role</option>
                                <option value="Admin">Admin</option>
                                <option value="Employee">Employee</option>
                            </select>
                            {formik.touched.role && formik.errors.role && (
                                <p className="error-text">{formik.errors.role}</p>
                            )}
                        </div>

                        {/* Submit */}
                        <button type="submit" formik={formik} disabled={formik.isSubmitting} className="btn-primary w-full py-3 text-base">
                            {formik.isSubmitting ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                    </svg>
                                    Creating account...
                                </span>
                            ) : 'Create Account'}
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-500 mt-6">
                        Already have an account?{' '}
                        <Link to="/login" className="text-blue-600 font-semibold hover:underline">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
