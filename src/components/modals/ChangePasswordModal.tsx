"use client";
import React, { useState } from 'react';
import { X, Lock, Eye, EyeOff } from 'lucide-react';
import { changePassword } from '@/services/AuthService';
import { ChangePasswordRequestType } from '@/types/AuthType';
import ToastService from '@/services/ToastService';

interface ChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formData, setFormData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Xóa lỗi khi người dùng bắt đầu nhập lại
        if (formErrors[name]) {
            setFormErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const validateForm = () => {
        const errors: { [key: string]: string } = {};
        let isValid = true;

        if (!formData.oldPassword) {
            errors.oldPassword = "Vui lòng nhập mật khẩu hiện tại";
            isValid = false;
        }

        if (!formData.newPassword) {
            errors.newPassword = "Vui lòng nhập mật khẩu mới";
            isValid = false;
        } else if (formData.newPassword.length < 6) {
            errors.newPassword = "Mật khẩu phải có ít nhất 6 ký tự";
            isValid = false;
        }

        if (!formData.confirmPassword) {
            errors.confirmPassword = "Vui lòng xác nhận mật khẩu mới";
            isValid = false;
        } else if (formData.newPassword !== formData.confirmPassword) {
            errors.confirmPassword = "Mật khẩu xác nhận không khớp";
            isValid = false;
        }

        setFormErrors(errors);
        return isValid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            const data: ChangePasswordRequestType = {
                oldPassword: formData.oldPassword,
                newPassword: formData.newPassword,
                confirmPassword: formData.confirmPassword
            };

            await changePassword(data);

            ToastService.success('Đổi mật khẩu thành công!', 'top-center', 3000);

            // Reset form và đóng modal
            resetForm();
            onClose();
        } catch (err: any) {
            const errorMessage = err.message || "Không thể đổi mật khẩu. Vui lòng thử lại!";
            ToastService.error(errorMessage, 'top-center', 3000);
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            oldPassword: '',
            newPassword: '',
            confirmPassword: ''
        });
        setFormErrors({});
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500/10 backdrop-blur-sm">
            <style>{passwordInputStyle}</style>
            <div
                className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-auto overflow-hidden animate-fadeIn"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-blue-50 to-white">
                    <div className="flex items-center">
                        <Lock className="h-5 w-5 text-blue-600 mr-2" />
                        <h3 className="text-lg font-semibold text-gray-800">Đổi mật khẩu</h3>
                    </div>
                    <button
                        onClick={handleClose}
                        className="text-gray-500 hover:text-gray-700 focus:outline-none"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-4">
                        {/* Mật khẩu hiện tại */}
                        <div>
                            <label htmlFor="oldPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                Mật khẩu hiện tại
                            </label>
                            <div className="password-container">
                                <input
                                    type={showOldPassword ? "text" : "password"}
                                    id="oldPassword"
                                    name="oldPassword"
                                    value={formData.oldPassword}
                                    onChange={handleChange}
                                    className={`w-full px-3 py-2 border ${formErrors.oldPassword ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                    placeholder="Nhập mật khẩu hiện tại"
                                    disabled={isLoading}
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowOldPassword(!showOldPassword)}
                                >
                                    {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {formErrors.oldPassword && (
                                <p className="text-red-500 text-xs mt-1">{formErrors.oldPassword}</p>
                            )}
                        </div>

                        {/* Mật khẩu mới */}
                        <div>
                            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                Mật khẩu mới
                            </label>
                            <div className="password-container">
                                <input
                                    type={showNewPassword ? "text" : "password"}
                                    id="newPassword"
                                    name="newPassword"
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                    className={`w-full px-3 py-2 border ${formErrors.newPassword ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                    placeholder="Nhập mật khẩu mới"
                                    disabled={isLoading}
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                >
                                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {formErrors.newPassword && (
                                <p className="text-red-500 text-xs mt-1">{formErrors.newPassword}</p>
                            )}
                        </div>

                        {/* Xác nhận mật khẩu mới */}
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                Xác nhận mật khẩu mới
                            </label>
                            <div className="password-container">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className={`w-full px-3 py-2 border ${formErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                    placeholder="Xác nhận mật khẩu mới"
                                    disabled={isLoading}
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {formErrors.confirmPassword && (
                                <p className="text-red-500 text-xs mt-1">{formErrors.confirmPassword}</p>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end mt-6 space-x-3">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition shadow-sm flex items-center"
                            disabled={isLoading}
                        >
                            <X size={16} className="mr-1" />
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-md text-white hover:from-blue-600 hover:to-blue-700 transition shadow-sm flex items-center"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                                    Đang xử lý...
                                </>
                            ) : (
                                <>
                                    <Lock size={16} className="mr-1" />
                                    Đổi mật khẩu
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChangePasswordModal;

const passwordInputStyle = `
  /* Ẩn icon mặc định của trình duyệt */
  input[type="password"]::-ms-reveal,
  input[type="password"]::-ms-clear {
    display: none;
  }
  
  input[type="password"]::-webkit-contacts-auto-fill-button,
  input[type="password"]::-webkit-credentials-auto-fill-button {
    visibility: hidden;
    display: none !important;
    pointer-events: none;
    height: 0px;
    width: 0px;
    margin: 0;
  }
  
  .password-container {
    position: relative;
  }
  
  .password-container input {
    padding-right: 2.5rem;
  }
  
  .password-toggle {
    position: absolute;
    right: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    color: #6B7280;
  }
  
  .password-toggle:hover {
    color: #374151;
  }
`;