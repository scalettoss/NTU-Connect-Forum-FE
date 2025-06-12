"use client";
import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, AlertCircle, User, Calendar, Phone } from 'lucide-react';
import Link from 'next/link';
import { LogoWithText } from '@/components/common/Logo';
import { register } from '@/services/AuthService';
import { useRouter } from 'next/navigation';
import { toast, Toaster } from 'react-hot-toast';
import { RegisterRequestType } from '@/types/AuthType';

const RegisterPage: React.FC = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        terms: ''
    });
    const [acceptTerms, setAcceptTerms] = useState(false);
    const router = useRouter();

    const validateForm = () => {
        const newErrors = {
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            confirmPassword: '',
            terms: ''
        };
        let isValid = true;

        // First name validation
        if (!formData.firstName.trim()) {
            newErrors.firstName = 'Họ không được để trống';
            isValid = false;
        }

        // Last name validation
        if (!formData.lastName.trim()) {
            newErrors.lastName = 'Tên không được để trống';
            isValid = false;
        }

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

        // Confirm Password validation
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Xác nhận mật khẩu không được để trống';
            isValid = false;
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Mật khẩu không khớp';
            isValid = false;
        }

        // Terms validation
        if (!acceptTerms) {
            newErrors.terms = 'Bạn phải đồng ý với điều khoản và điều kiện';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;

        if (type === 'checkbox') {
            if (name === 'terms') {
                setAcceptTerms(checked);
            }
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }

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
            const registerData: RegisterRequestType = {
                email: formData.email,
                password: formData.password,
                confirmPassword: formData.confirmPassword,
                firstName: formData.firstName,
                lastName: formData.lastName
            };

            const response = await register(registerData);

            // @ts-ignore - handle the response data structure
            if (response?.data) {
                toast.success('Đăng ký thành công! Vui lòng đăng nhập.', {
                    duration: 1000,
                    position: 'top-center',
                    style: {
                        background: '#10B981',
                        color: '#fff',
                    },
                    iconTheme: {
                        primary: '#fff',
                        secondary: '#10B981',
                    },
                });

                // Redirect to login page after successful registration
                setTimeout(() => {
                    router.push('/home/login');
                }, 1000);
            }
            else {
                const errorMessage = typeof response === 'string' ? response : 'Đăng ký thất bại';
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
            console.error('Registration error:', error);
            toast.error('Đăng ký thất bại. Vui lòng thử lại!', {
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
                {/* Left Side - Form */}
                <div className="w-full md:w-3/5 bg-white p-8 md:p-10">
                    <div className="max-w-lg mx-auto">
                        {/* Mobile logo only visible on mobile */}
                        <div className="flex justify-center mb-8 md:hidden">
                            <LogoWithText width={48} height={48} />
                        </div>

                        <div className="text-center mb-8">
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Đăng ký tài khoản</h2>
                            <p className="text-gray-600 mt-2">Tạo tài khoản để tham gia cộng đồng NTU Connect</p>
                        </div>

                        <form className="space-y-5" onSubmit={handleSubmit}>
                            {/* Name Fields - Two columns */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                                        Họ
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <User className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            id="firstName"
                                            name="firstName"
                                            type="text"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            placeholder="Nguyễn"
                                            className={`appearance-none block w-full pl-10 pr-3 py-2.5 border ${errors.firstName ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-orange-500'} rounded-lg focus:outline-none focus:ring-2 transition-all duration-200`}
                                        />
                                    </div>
                                    {errors.firstName && (
                                        <div className="flex items-center mt-1 text-red-500 text-sm">
                                            <AlertCircle className="h-4 w-4 mr-1" />
                                            <span>{errors.firstName}</span>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                                        Tên
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <User className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            id="lastName"
                                            name="lastName"
                                            type="text"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            placeholder="Văn A"
                                            className={`appearance-none block w-full pl-10 pr-3 py-2.5 border ${errors.lastName ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-orange-500'} rounded-lg focus:outline-none focus:ring-2 transition-all duration-200`}
                                        />
                                    </div>
                                    {errors.lastName && (
                                        <div className="flex items-center mt-1 text-red-500 text-sm">
                                            <AlertCircle className="h-4 w-4 mr-1" />
                                            <span>{errors.lastName}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

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
                                        placeholder="example@email.com"
                                        className={`appearance-none block w-full pl-10 pr-3 py-2.5 border ${errors.email ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-orange-500'} rounded-lg focus:outline-none focus:ring-2 transition-all duration-200`}
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
                                        placeholder="••••••••"
                                        className={`appearance-none block w-full pl-10 pr-10 py-2.5 border ${errors.password ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-orange-500'} rounded-lg focus:outline-none focus:ring-2 transition-all duration-200`}
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
                                {errors.password ? (
                                    <div className="flex items-center mt-1 text-red-500 text-sm">
                                        <AlertCircle className="h-4 w-4 mr-1" />
                                        <span>{errors.password}</span>
                                    </div>
                                ) : (
                                    <p className="text-xs text-gray-500 mt-1">Mật khẩu phải có ít nhất 6 ký tự</p>
                                )}
                            </div>

                            {/* Confirm Password Field */}
                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                    Xác nhận mật khẩu
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        className={`appearance-none block w-full pl-10 pr-10 py-2.5 border ${errors.confirmPassword ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-orange-500'} rounded-lg focus:outline-none focus:ring-2 transition-all duration-200`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                        ) : (
                                            <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                        )}
                                    </button>
                                </div>
                                {errors.confirmPassword && (
                                    <div className="flex items-center mt-1 text-red-500 text-sm">
                                        <AlertCircle className="h-4 w-4 mr-1" />
                                        <span>{errors.confirmPassword}</span>
                                    </div>
                                )}
                            </div>

                            {/* Terms & Conditions */}
                            <div className="flex items-start">
                                <div className="flex items-center h-5">
                                    <input
                                        id="terms"
                                        name="terms"
                                        type="checkbox"
                                        checked={acceptTerms}
                                        onChange={handleChange}
                                        className={`h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded ${errors.terms ? 'border-red-300' : ''}`}
                                    />
                                </div>
                                <div className="ml-3 text-sm">
                                    <label htmlFor="terms" className="text-gray-600">
                                        Tôi đồng ý với{' '}
                                        <a href="#" className="text-orange-600 hover:text-orange-500">
                                            Điều khoản
                                        </a>{' '}
                                        và{' '}
                                        <a href="#" className="text-orange-600 hover:text-orange-500">
                                            Chính sách Bảo mật
                                        </a>
                                    </label>
                                </div>
                            </div>
                            {errors.terms && (
                                <div className="flex items-center mt-1 text-red-500 text-sm">
                                    <AlertCircle className="h-4 w-4 mr-1" />
                                    <span>{errors.terms}</span>
                                </div>
                            )}

                            {/* Register Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-200"
                            >
                                {isLoading ? (
                                    <div className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Đang xử lý...
                                    </div>
                                ) : 'Đăng ký'}
                            </button>

                            {/* Login Link */}
                            <div className="text-center mt-6">
                                <p className="text-sm text-gray-600">
                                    Bạn đã có tài khoản?{' '}
                                    <Link href="/home/login" className="font-medium text-orange-600 hover:text-orange-500">
                                        Đăng nhập
                                    </Link>
                                </p>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Right Side - Brand and Information */}
                <div className="hidden md:flex md:w-2/5 bg-gradient-to-br from-orange-400/90 via-orange-400/80 to-orange-500/90 p-12 flex-col relative">
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
                            <h2 className="text-3xl font-bold text-white drop-shadow-sm mb-6">Tham gia cộng đồng!</h2>
                            <p className="text-white drop-shadow-sm mb-8">
                                Tạo tài khoản để kết nối với cộng đồng sinh viên, chia sẻ ý tưởng và tham gia vào các hoạt động thú vị.
                            </p>
                        </div>
                    </div>

                    <div className="bg-white/15 backdrop-blur-sm p-6 rounded-xl border border-white/30 mt-auto z-10 shadow-lg">
                        <p className="text-white font-medium">Với tài khoản NTU Connect, bạn có thể:</p>
                        <ul className="mt-3 space-y-2">
                            <li className="flex items-start">
                                <div className="flex-shrink-0 h-5 w-5 text-white">
                                    <svg viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <span className="ml-2 text-white/90">Tham gia thảo luận với bạn bè</span>
                            </li>
                            <li className="flex items-start">
                                <div className="flex-shrink-0 h-5 w-5 text-white">
                                    <svg viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <span className="ml-2 text-white/90">Chia sẻ kiến thức và kinh nghiệm</span>
                            </li>
                            <li className="flex items-start">
                                <div className="flex-shrink-0 h-5 w-5 text-white">
                                    <svg viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <span className="ml-2 text-white/90">Nhận thông báo về các sự kiện mới</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
