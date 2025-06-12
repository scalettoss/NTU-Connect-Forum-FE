"use client";
import React, { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { LogoWithText } from '@/components/common/Logo';
import { login } from '@/services/AuthService';
import { useRouter } from 'next/navigation';
import { toast, Toaster } from 'react-hot-toast';
import Cookies from 'js-cookie';
import { LoginRequestType } from '@/types/AuthType';

const LoginPage: React.FC = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState({
        email: '',
        password: ''
    });
    const router = useRouter();

    useEffect(() => {
        const rememberedEmail = localStorage.getItem('rememberedEmail');
        if (rememberedEmail) {
            setFormData(prev => ({ ...prev, email: rememberedEmail }));
            setRememberMe(true);
        }
    }, []);

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

            const response = await login(loginData);

            // @ts-ignore - handle the response data structure
            if (response?.data?.accessToken) {
                const expiresIn = response.data.expires || 1; // Default to 1 day if not provided
                const expirationDate = new Date();
                expirationDate.setDate(expirationDate.getDate() + expiresIn);

                // @ts-ignore
                Cookies.set('accessToken', response.data.accessToken, {
                    expires: expirationDate,
                    secure: true,
                    sameSite: 'Strict'
                });

                // Handle remember me
                if (rememberMe) {
                    localStorage.setItem('rememberedEmail', formData.email);
                } else {
                    localStorage.removeItem('rememberedEmail');
                }

                // Dispatch custom event for login
                const loginEvent = new CustomEvent('user-login', {
                    detail: { success: true }
                });
                window.dispatchEvent(loginEvent);

                localStorage.setItem('login_success', 'true');
                router.push('/home');
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
        <div className="min-h-screen bg-gradient-to-br from-orange-100 via-blue-50 to-purple-100 flex items-center justify-center p-4">
            <Toaster position="top-center" />
            <div className="w-full max-w-5xl flex overflow-hidden rounded-2xl shadow-2xl">
                {/* Left Side - Brand and Information */}
                <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-orange-400/90 via-orange-400/80 to-orange-500/90 p-12 flex-col relative">
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
                            <h2 className="text-4xl font-bold text-white drop-shadow-sm mb-6">Chào mừng trở lại!</h2>
                            <p className="text-white drop-shadow-sm mb-8">
                                Đăng nhập để kết nối với cộng đồng sinh viên, chia sẻ ý tưởng và tham gia vào các hoạt động thú vị.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Side - Login Form */}
                <div className="w-full md:w-1/2 bg-white p-8 md:p-12">
                    <div className="max-w-md mx-auto">
                        {/* Mobile logo only visible on mobile */}
                        <div className="flex justify-center mb-8 md:hidden">
                            <LogoWithText width={48} height={48} />
                        </div>

                        <div className="text-center mb-8">
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Đăng nhập</h2>
                            <p className="text-gray-600 mt-2">Nhập thông tin đăng nhập của bạn để tiếp tục</p>
                        </div>

                        <form className="space-y-5" onSubmit={handleSubmit}>
                            {/* Email Field */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                    Email
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
                                        placeholder="example@email.com"
                                        className={`appearance-none block w-full pl-10 pr-3 py-3 border ${errors.email ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-orange-500'
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
                                        className={`appearance-none block w-full pl-10 pr-10 py-3 border ${errors.password ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-orange-500'
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

                            {/* Remember Me & Forgot Password */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <input
                                        id="remember-me"
                                        name="remember-me"
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                                        Nhớ tài khoản
                                    </label>
                                </div>
                                <div className="text-sm">
                                    <a href="#" className="font-medium text-orange-600 hover:text-orange-500">
                                        Quên mật khẩu?
                                    </a>
                                </div>
                            </div>

                            {/* Login Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-200"
                            >
                                {isLoading ? (
                                    <div className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Đang xử lý...
                                    </div>
                                ) : 'Đăng nhập'}
                            </button>

                            {/* Or Separator */}
                            <div className="relative my-4">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white text-gray-500">Hoặc đăng nhập với</span>
                                </div>
                            </div>

                            {/* Social Logins */}
                            <div className="grid grid-cols-3 gap-3">
                                <button
                                    type="button"
                                    className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                                >
                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24h-1.918c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.294h6.116c.73 0 1.323-.593 1.323-1.324v-21.351c0-.732-.593-1.325-1.325-1.325z" />
                                    </svg>
                                </button>
                                <button
                                    type="button"
                                    className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                                >
                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                                    </svg>
                                </button>
                                <button
                                    type="button"
                                    className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                                >
                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
                                    </svg>
                                </button>
                            </div>

                            {/* Register Link */}
                            <div className="text-center mt-6">
                                <p className="text-sm text-gray-600">
                                    Chưa có tài khoản?{' '}
                                    <Link href="/home/register" className="font-medium text-orange-600 hover:text-orange-500">
                                        Đăng ký ngay
                                    </Link>
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
