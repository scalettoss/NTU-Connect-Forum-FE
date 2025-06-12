"use client";
import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Shield } from 'lucide-react';
import { LogoWithText } from '@/components/common/Logo';
import { login } from '@/services/AuthService';
import { useRouter } from 'next/navigation';
import { toast, Toaster } from 'react-hot-toast';
import { setAdminAccessToken, hasAdminAccess } from '@/helper/AdminTokenHelper';
import { LoginRequestType } from '@/types/AuthType';

const AdminLoginPage: React.FC = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState({
        email: '',
        password: ''
    });
    const router = useRouter();

    const validateForm = () => {
        const newErrors = {
            email: '',
            password: ''
        };
        let isValid = true;

        // Email validation
        if (!formData.email) {
            newErrors.email = 'Email không được để trống';
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email không hợp lệ';
            isValid = false;
        }

        // Password validation
        if (!formData.password) {
            newErrors.password = 'Mật khẩu không được để trống';
            isValid = false;
        } else if (formData.password.length < 6) {
            newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error when user starts typing
        if (errors[name as keyof typeof errors]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            const loginData: LoginRequestType = {
                email: formData.email,
                password: formData.password
            };

            // TODO: Change to admin login endpoint when available
            const response = await login(loginData);

            // @ts-ignore - handle the response data structure
            if (response?.data?.accessToken) {
                // @ts-ignore
                const token = response.data.accessToken;

                // Check if user has admin role
                if (!hasAdminAccess(token)) {
                    toast.error('Bạn không có quyền truy cập khu vực quản trị', {
                        duration: 3000,
                        position: 'top-center',
                        style: {
                            background: '#EF4444',
                            color: '#fff',
                        },
                    });
                    router.push('/admin/unauthorized');
                    return;
                }

                // Store token in cookie
                // @ts-ignore
                const expiresIn = response.data.expires || 1; // Default to 1 day if not provided
                setAdminAccessToken(token, expiresIn);

                // Store login success flag in localStorage to show toast after navigation
                localStorage.setItem('admin_login_success', 'true');

                // Redirect to admin dashboard
                router.push('/admin/dashboard');
            }
            else {
                const errorMessage = response;
                toast.error(errorMessage, {
                    duration: 3000,
                    position: 'top-center',
                    style: {
                        background: '#EF4444',
                        color: '#fff',
                    },
                });
            }
        } catch (error: any) {
            console.error('Login error:', error);
            toast.error('Đăng nhập thất bại, Vui lòng thử lại!', {
                duration: 3000,
                position: 'top-center',
                style: {
                    background: '#EF4444',
                    color: '#fff',
                },
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-purple-100 flex items-center justify-center p-4">
            <Toaster position="top-center" />
            <div className="w-full max-w-5xl flex overflow-hidden rounded-2xl shadow-2xl">
                {/* Left Side - Brand and Information */}
                <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 p-12 flex-col relative">
                    {/* Decorative elements */}
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-15">
                        <div className="absolute top-10 left-10 w-20 h-20 rounded-full bg-white"></div>
                        <div className="absolute top-20 right-20 w-32 h-32 rounded-full bg-white"></div>
                        <div className="absolute bottom-10 left-1/4 w-16 h-16 rounded-full bg-white"></div>
                        <div className="absolute -top-5 right-1/3 w-24 h-24 rounded-full bg-white"></div>
                        <div className="absolute bottom-5 right-1/4 w-12 h-12 rounded-full bg-white"></div>
                    </div>

                    <div className="z-10">
                        <div className="flex items-center mb-8">
                            <LogoWithText width={48} height={48} textClassName="text-white" />
                        </div>

                        <div className="mt-auto">
                            <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full mb-6">
                                <Shield className="h-5 w-5 text-white" />
                                <span className="text-white font-medium">Admin Portal</span>
                            </div>
                            <h2 className="text-4xl font-bold text-white drop-shadow-sm mb-6">
                                Hệ Thống Quản Trị NTU Connect
                            </h2>
                            <p className="text-white/90 drop-shadow-sm mb-8">
                                Đăng nhập với tư cách quản trị viên để quản lý nội dung, người dùng và các hoạt động trên nền tảng.
                            </p>
                        </div>
                    </div>
                </div>
                {/* Right Side - Login Form */}
                <div className="w-full md:w-1/2 bg-white p-8 md:p-12">
                    <div className="max-w-md mx-auto">
                        {/* Mobile logo only visible on mobile */}
                        <div className="flex flex-col items-center mb-8 md:hidden">
                            <LogoWithText width={48} height={48} />
                            <div className="inline-flex items-center gap-2 bg-blue-100 px-4 py-1 rounded-full mt-2">
                                <Shield className="h-4 w-4 text-blue-600" />
                                <span className="text-blue-600 font-medium">Admin Portal</span>
                            </div>
                        </div>

                        <div className="text-center mb-8">
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Đăng nhập Admin</h2>
                            <p className="text-gray-600 mt-2">Nhập thông tin đăng nhập quản trị viên của bạn</p>
                        </div>

                        <form className="space-y-5" onSubmit={handleSubmit}>
                            {/* Email Field */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                    Email Admin
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        autoComplete="email"
                                        placeholder="admin@example.com"
                                        className={`appearance-none block w-full pl-10 pr-3 py-3 border ${errors.email ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                                            } rounded-lg focus:outline-none focus:ring-2 transition-all duration-200`}
                                    />
                                </div>
                                {errors.email && (
                                    <div className="flex items-center mt-1 text-red-500 text-sm">
                                        <AlertCircle className="h-4 w-4 mr-1" />
                                        <span>{errors.email}</span>
                                    </div>
                                )}
                            </div>

                            {/* Password Field */}
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                    Mật khẩu
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        value={formData.password}
                                        onChange={handleChange}
                                        autoComplete="current-password"
                                        placeholder="••••••••"
                                        className={`appearance-none block w-full pl-10 pr-10 py-3 border ${errors.password ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                                            } rounded-lg focus:outline-none focus:ring-2 transition-all duration-200`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                        ) : (
                                            <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                        )}
                                    </button>
                                </div>
                                {errors.password && (
                                    <div className="flex items-center mt-1 text-red-500 text-sm">
                                        <AlertCircle className="h-4 w-4 mr-1" />
                                        <span>{errors.password}</span>
                                    </div>
                                )}
                            </div>

                            {/* Submit Button */}
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={`w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg shadow-md hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''
                                        }`}
                                >
                                    {isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLoginPage; 