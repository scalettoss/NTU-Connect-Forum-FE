"use client";
import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Briefcase, Edit, Camera, Save, X, Lock } from 'lucide-react';
import { getUserInformation, updateUserInformation } from '@/services/UserService';
import { UserInformationResponseType, UserInformationRequestType } from '@/types/UserType';
import { getUserInfoFromTokenClient } from '@/helper/UserTokenHelper';
import { getImagesFromUrl } from '@/helper/GetImagesHelper';
import ChangePasswordModal from '@/components/modals/ChangePasswordModal';
import ToastService from '@/services/ToastService';

const UserProfile = () => {
    const [user, setUser] = useState<UserInformationResponseType | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phoneNumber: '',
        address: '',
        dateOfBirth: '',
        position: '',
        bio: '',
        gender: '',
        isProfilePublic: false
    });

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setLoading(true);
                setError(null);
                const decodeToken = getUserInfoFromTokenClient();
                //@ts-ignore
                const response = await getUserInformation(decodeToken?.id);
                //@ts-ignore
                const userData = response;
                // Format date of birth to YYYY-MM-DD for input field
                const formattedDateOfBirth = userData.dateOfBirth ? new Date(userData.dateOfBirth).toISOString().split('T')[0] : '';
                setUser(userData);

                // Initialize form data with the user data, ensure all values are defined
                setFormData({
                    fullName: userData.fullName || '',
                    email: userData.email || '',
                    phoneNumber: userData.phoneNumber || '',
                    address: userData.address || '',
                    dateOfBirth: formattedDateOfBirth,
                    position: userData.roleName || '',
                    bio: userData.bio || '',
                    gender: userData.gender || '',
                    isProfilePublic: userData.isProfilePublic || false
                });
            } catch (err) {
                console.error("Error fetching user data:", err);
                setError("Không thể tải thông tin người dùng. Vui lòng thử lại sau.");
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target as HTMLInputElement;

        if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            setFormData(prev => ({
                ...prev,
                [name]: checked
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const imageUrl = URL.createObjectURL(file);
            setImagePreview(imageUrl);
            setSelectedFile(file); // Lưu file vào state
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Reset previous errors
        setFormErrors({});

        // Validate form data
        let isValid = true;
        const errors: { [key: string]: string } = {};

        // Validate fullName (must have at least 2 words)
        const nameWords = formData.fullName.trim().split(/\s+/);
        if (nameWords.length < 2) {
            errors.fullName = "Họ và tên phải có ít nhất 2 từ";
            isValid = false;
        }

        // Validate phone number (optional)
        if (formData.phoneNumber && !/^[0-9]{10,11}$/.test(formData.phoneNumber)) {
            errors.phoneNumber = "Số điện thoại không hợp lệ";
            isValid = false;
        }

        if (!isValid) {
            setFormErrors(errors);
            return;
        }

        setLoading(true);

        try {
            // Create FormData
            const formDataObj = new FormData();

            if (user) {
                if (formData.fullName !== user.fullName) {
                    // Parse fullName into firstName and lastName
                    const nameParts = formData.fullName.trim().split(/\s+/);
                    const firstName = nameParts[nameParts.length - 1];
                    const lastName = nameParts.slice(0, nameParts.length - 1).join(' ');

                    formDataObj.append('firstName', firstName);
                    formDataObj.append('lastName', lastName);
                }

                if (formData.phoneNumber !== user.phoneNumber)
                    formDataObj.append('phoneNumber', formData.phoneNumber);

                if (formData.address !== user.address)
                    formDataObj.append('address', formData.address);

                const formattedOriginalDate = user.dateOfBirth ?
                    new Date(user.dateOfBirth).toISOString().split('T')[0] : '';

                if (formData.dateOfBirth !== formattedOriginalDate && formData.dateOfBirth) {
                    formDataObj.append('dateOfBirth', new Date(formData.dateOfBirth).toISOString());
                }

                if (formData.bio !== user.bio)
                    formDataObj.append('bio', formData.bio || '');

                if (formData.gender !== user.gender)
                    formDataObj.append('gender', formData.gender);

                if (formData.isProfilePublic !== user.isProfilePublic)
                    formDataObj.append('isProfilePublic', formData.isProfilePublic.toString());

                // Add avatar to FormData if changed
                if (selectedFile) {
                    formDataObj.append('avatarFile', selectedFile);
                }
            }

            // Debug: Log FormData contents
            console.log('FormData contents:');
            for (const [key, value] of formDataObj.entries()) {
                console.log(key, value);
            }

            // Check if there are changes in FormData or avatar is selected
            const hasChanges = formDataObj.entries().next().done !== true || selectedFile !== null;

            // Only proceed with update if there are changes
            if (hasChanges) {
                const decodeToken = getUserInfoFromTokenClient();
                //@ts-ignore
                await updateUserInformation(decodeToken?.id, formDataObj, true);

                // Fetch updated user data from server to get new avatar URL
                //@ts-ignore
                const refreshedResponse = await getUserInformation(decodeToken?.id);
                //@ts-ignore
                const refreshedUserData = refreshedResponse;

                // Format date of birth for form
                const formattedDateOfBirth = refreshedUserData.dateOfBirth ?
                    new Date(refreshedUserData.dateOfBirth).toISOString().split('T')[0] : '';

                // Update both user state and form data
                setUser(refreshedUserData);
                setFormData({
                    fullName: refreshedUserData.fullName || '',
                    email: refreshedUserData.email || '',
                    phoneNumber: refreshedUserData.phoneNumber || '',
                    address: refreshedUserData.address || '',
                    dateOfBirth: formattedDateOfBirth,
                    position: refreshedUserData.roleName || '',
                    bio: refreshedUserData.bio || '',
                    gender: refreshedUserData.gender || '',
                    isProfilePublic: refreshedUserData.isProfilePublic || false
                });

                // Hiển thị thông báo thành công
                ToastService.success('Cập nhật thông tin thành công!', 'top-center', 3000);

                // Dispatch custom event to notify other components (like Header) about the update
                window.dispatchEvent(new CustomEvent('userProfileUpdated'));
            }

            // Success, exit editing mode and reset file states
            setIsEditing(false);
            setError(null);
            setSelectedFile(null);
            setImagePreview(null);
        } catch (err) {
            console.error("Error updating user information:", err);
            setError("Không thể cập nhật thông tin. Vui lòng thử lại sau.");

            // Hiển thị thông báo lỗi
            ToastService.error('Không thể cập nhật thông tin. Vui lòng thử lại!', 'top-center', 3000);
        } finally {
            setLoading(false);
        }
    };

    const cancelEdit = () => {
        // Reset form về giá trị ban đầu nếu có dữ liệu user
        if (user) {
            const formattedDateOfBirth = user.dateOfBirth ?
                new Date(user.dateOfBirth).toISOString().split('T')[0] : '';

            setFormData({
                fullName: user.fullName || '',
                email: user.email || '',
                phoneNumber: user.phoneNumber || '',
                address: user.address || '',
                dateOfBirth: formattedDateOfBirth,
                position: user.roleName || '',
                bio: user.bio || '',
                gender: user.gender || '',
                isProfilePublic: user.isProfilePublic || false
            });
        }
        setImagePreview(null);
        setSelectedFile(null); // Reset selected file
        setIsEditing(false);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen">
                <div className="text-red-500 mb-4">{error || "Không tìm thấy thông tin người dùng."}</div>
                <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
                >
                    Thử lại
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-orange-100 via-white to-blue-100">
            <ChangePasswordModal
                isOpen={showChangePasswordModal}
                onClose={() => setShowChangePasswordModal(false)}
            />

            <div className="w-full max-w-7xl mx-auto p-4 md:p-8">
                <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100 w-full">
                    {/* Header Section with improved gradient */}
                    <div className="relative h-48 md:h-64 bg-gradient-to-r from-orange-600 via-orange-500 to-orange-700">
                        {/* Decorative elements */}
                        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20">
                            <div className="absolute top-10 left-10 w-20 h-20 rounded-full bg-white"></div>
                            <div className="absolute top-20 right-20 w-32 h-32 rounded-full bg-white"></div>
                            <div className="absolute bottom-10 left-1/4 w-16 h-16 rounded-full bg-white"></div>
                            <div className="absolute -top-5 right-1/3 w-24 h-24 rounded-full bg-white"></div>
                            <div className="absolute bottom-5 right-1/4 w-12 h-12 rounded-full bg-white"></div>
                        </div>

                        <div className="absolute bottom-0 left-0 w-full transform translate-y-1/2 flex justify-center">
                            <div className="relative">
                                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white overflow-hidden bg-white shadow-xl">
                                    {isEditing ? (
                                        imagePreview ? (
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : user.avatarUrl ? (
                                            <img
                                                src={getImagesFromUrl(user.avatarUrl)}
                                                alt={user.fullName}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                                                <User size={40} className="text-gray-400" />
                                            </div>
                                        )
                                    ) : user.avatarUrl ? (
                                        <img
                                            src={getImagesFromUrl(user.avatarUrl)}
                                            alt={user.fullName}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                                            <User size={40} className="text-gray-400" />
                                        </div>
                                    )}

                                    {isEditing && (
                                        <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-orange-500 rounded-full p-2 cursor-pointer shadow-md hover:bg-orange-600 transition">
                                            <Camera size={16} className="text-white" />
                                            <input
                                                id="avatar-upload"
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                            />
                                        </label>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Profile Content */}
                    <div className="pt-16 md:pt-20 px-4 md:px-8 pb-8">
                        {!isEditing ? (
                            <>
                                {/* Thông tin hiển thị */}
                                <div className="text-center mb-6">
                                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{user?.fullName}</h1>
                                    {formData.position && (
                                        <div className="mt-2 flex justify-center">
                                            <div className={`
                                                px-4 py-1 rounded-full text-sm font-medium shadow-sm
                                                ${formData.position === 'admin' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                                                    formData.position === 'moderator' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                                                        'bg-green-100 text-green-800 border border-green-200'}
                                            `}>
                                                <div className="flex items-center">
                                                    <span className={`
                                                        h-2 w-2 rounded-full mr-2
                                                        ${formData.position === 'admin' ? 'bg-purple-500' :
                                                            formData.position === 'moderator' ? 'bg-blue-500' :
                                                                'bg-green-500'}
                                                    `}></span>
                                                    {formData.position === 'admin' ? 'Quản trị viên' :
                                                        formData.position === 'moderator' ? 'Kiểm duyệt viên' :
                                                            'Người dùng'}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-end mb-6 space-x-2">
                                    <button
                                        onClick={() => setShowChangePasswordModal(true)}
                                        className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-full hover:bg-blue-100 transition shadow-sm"
                                    >
                                        <Lock size={16} className="mr-1" />
                                        Đổi mật khẩu
                                    </button>
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="flex items-center text-sm font-medium text-orange-600 hover:text-orange-800 bg-orange-50 px-3 py-1.5 rounded-full hover:bg-orange-100 transition shadow-sm"
                                    >
                                        <Edit size={16} className="mr-1" />
                                        Chỉnh sửa thông tin
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4 bg-gradient-to-br from-white to-orange-50 p-5 rounded-xl shadow-md border border-orange-100">
                                        <h2 className="text-xl font-semibold text-gray-800 border-b border-orange-100 pb-2">Thông tin cá nhân</h2>

                                        <div className="flex items-start">
                                            <Mail className="w-5 h-5 text-orange-500 mr-3 mt-0.5" />
                                            <div>
                                                <p className="text-sm text-gray-500">Email</p>
                                                <p className="text-gray-800">{formData.email || ''}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start">
                                            <Phone className="w-5 h-5 text-orange-500 mr-3 mt-0.5" />
                                            <div>
                                                <p className="text-sm text-gray-500">Số điện thoại</p>
                                                <p className="text-gray-800">{user.phoneNumber || 'Chưa cập nhật'}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start">
                                            <MapPin className="w-5 h-5 text-orange-500 mr-3 mt-0.5" />
                                            <div>
                                                <p className="text-sm text-gray-500">Địa chỉ</p>
                                                <p className="text-gray-800">{user.address || 'Chưa cập nhật'}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start">
                                            <Calendar className="w-5 h-5 text-orange-500 mr-3 mt-0.5" />
                                            <div>
                                                <p className="text-sm text-gray-500">Ngày sinh</p>
                                                <p className="text-gray-800">
                                                    {user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'Chưa cập nhật'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start">
                                            <User className="w-5 h-5 text-orange-500 mr-3 mt-0.5" />
                                            <div>
                                                <p className="text-sm text-gray-500">Giới tính</p>
                                                <p className="text-gray-800">{user.gender || 'Chưa cập nhật'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4 bg-gradient-to-br from-white to-blue-50 p-5 rounded-xl shadow-md border border-blue-100">
                                        <h2 className="text-xl font-semibold text-gray-800 border-b border-blue-100 pb-2">Thống kê hoạt động</h2>

                                        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-50">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="text-center bg-orange-50 rounded-lg p-3 shadow-sm border border-orange-100">
                                                    <p className="text-2xl font-bold text-orange-600">{user.postCount || 0}</p>
                                                    <p className="text-sm text-gray-600">Bài viết</p>
                                                </div>
                                                <div className="text-center bg-blue-50 rounded-lg p-3 shadow-sm border border-blue-100">
                                                    <p className="text-2xl font-bold text-blue-600">{user.commentCount || 0}</p>
                                                    <p className="text-sm text-gray-600">Bình luận</p>
                                                </div>
                                                <div className="text-center bg-pink-50 rounded-lg p-3 shadow-sm border border-pink-100">
                                                    <p className="text-2xl font-bold text-pink-600">{user.likeCount || 0}</p>
                                                    <p className="text-sm text-gray-600">Lượt thích</p>
                                                </div>
                                                <div className="text-center bg-purple-50 rounded-lg p-3 shadow-sm border border-purple-100">
                                                    <p className="text-2xl font-bold text-purple-600">{0}</p>
                                                    <p className="text-sm text-gray-600">Lượt xem</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center bg-white p-4 rounded-lg shadow-sm border border-gray-50 mt-4">
                                            <div className={`h-3 w-3 rounded-full mr-2 ${user.isProfilePublic ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                            <p className="text-gray-700">
                                                {user.isProfilePublic
                                                    ? 'Profile đang được hiển thị công khai'
                                                    : 'Profile đang ở chế độ riêng tư'}
                                            </p>
                                        </div>

                                        <div>
                                            <h3 className="text-md font-semibold text-gray-700 mb-2">Giới thiệu</h3>
                                            <p className="text-gray-600 bg-white p-4 rounded-lg shadow-sm border border-gray-50">
                                                {user.bio || 'Chưa có thông tin giới thiệu.'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                {/* Form chỉnh sửa */}
                                <div className="text-center mb-6">
                                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Chỉnh sửa thông tin</h1>
                                </div>

                                {error && (
                                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6 flex items-start">
                                        <div className="flex-shrink-0 mt-0.5">
                                            <X className="h-5 w-5 text-red-500" />
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm">{error}</p>
                                        </div>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div>
                                                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                                                <input
                                                    type="text"
                                                    id="fullName"
                                                    name="fullName"
                                                    value={formData.fullName}
                                                    onChange={handleInputChange}
                                                    className={`w-full px-3 py-2 border ${formErrors.fullName ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500`}
                                                />
                                                {formErrors.fullName && (
                                                    <p className="text-red-500 text-xs mt-1">{formErrors.fullName}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                                <input
                                                    type="email"
                                                    id="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50"
                                                    readOnly
                                                />
                                                <p className="text-xs text-gray-500 mt-1">Email không thể thay đổi</p>
                                            </div>

                                            <div>
                                                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                                                <input
                                                    type="tel"
                                                    id="phoneNumber"
                                                    name="phoneNumber"
                                                    value={formData.phoneNumber}
                                                    onChange={handleInputChange}
                                                    className={`w-full px-3 py-2 border ${formErrors.phoneNumber ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500`}
                                                />
                                                {formErrors.phoneNumber && (
                                                    <p className="text-red-500 text-xs mt-1">{formErrors.phoneNumber}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                                                <input
                                                    type="text"
                                                    id="address"
                                                    name="address"
                                                    value={formData.address}
                                                    onChange={handleInputChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">Ngày sinh</label>
                                                <input
                                                    type="date"
                                                    id="dateOfBirth"
                                                    name="dateOfBirth"
                                                    value={formData.dateOfBirth}
                                                    onChange={handleInputChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">Giới tính</label>
                                                <select
                                                    id="gender"
                                                    name="gender"
                                                    value={formData.gender}
                                                    onChange={handleInputChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                >
                                                    <option value="">-- Chọn giới tính --</option>
                                                    <option value="Nam">Nam</option>
                                                    <option value="Nữ">Nữ</option>
                                                    <option value="Khác">Khác</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label htmlFor="bio" className="mt-12 block text-sm font-medium text-gray-700 mb-1">Giới thiệu bản thân</label>
                                                <textarea
                                                    id="bio"
                                                    name="bio"
                                                    rows={4}
                                                    value={formData.bio || ''}
                                                    onChange={handleInputChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                ></textarea>
                                            </div>
                                            <div className="mt-4">
                                                <div className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        id="isProfilePublic"
                                                        name="isProfilePublic"
                                                        checked={formData.isProfilePublic}
                                                        onChange={handleInputChange}
                                                        className="h-4 w-4 text-orange-500 focus:ring-orange-400 border-gray-300 rounded"
                                                    />
                                                    <label htmlFor="isProfilePublic" className="ml-2 block text-sm text-gray-700">
                                                        Cho phép hiển thị profile công khai
                                                    </label>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Khi bật tùy chọn này, thông tin cá nhân của bạn sẽ được hiển thị với người dùng khác
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end mt-6 space-x-3">
                                        <button
                                            type="button"
                                            onClick={cancelEdit}
                                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center shadow-sm"
                                            disabled={loading}
                                        >
                                            <X size={16} className="mr-1" />
                                            Hủy
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-md text-white hover:from-orange-600 hover:to-orange-700 flex items-center shadow-sm"
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <>
                                                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                                                    Đang xử lý...
                                                </>
                                            ) : (
                                                <>
                                                    <Save size={16} className="mr-1" />
                                                    Lưu thay đổi
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile; 