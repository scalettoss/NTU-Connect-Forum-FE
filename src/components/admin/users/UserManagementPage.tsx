"use client";
import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/layout/AdminLayout';
import { Search, Filter, MoreVertical, Edit, Trash2, UserPlus, Download, Eye, Pencil } from 'lucide-react';
import { getAllUser, advancedSearchUser } from '@/services/UserService';
import { PaginationRequestType, PaginationResponseType } from '@/types/PaginationType';
import { UserProfileResponseType, AdvancedSearchUserRequestType } from '@/types/UserType';
import { getImagesFromUrl } from '@/helper/GetImagesHelper';
import ToastService from '@/services/ToastService';
import { useRouter } from 'next/navigation';
import DeleteUserModal from './DeleteUserModal';
import AddUserModal from './AddUserModal';

const ROLE_MAPPING = {
    'Admin': 'bg-red-100 text-red-800 border border-red-200',
    'Moderator': 'bg-blue-100 text-blue-800 border border-blue-200',
    'User': 'bg-green-100 text-green-800 border border-green-200'
} as const;

const DEFAULT_SEARCH_VALUES = {
    searchQuery: '',
    selectedRole: 'all',
    selectedStatus: 'all',
    currentPage: 1
};

const UserManagementPage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState(DEFAULT_SEARCH_VALUES.searchQuery);
    const [selectedRole, setSelectedRole] = useState(DEFAULT_SEARCH_VALUES.selectedRole);
    const [selectedStatus, setSelectedStatus] = useState(DEFAULT_SEARCH_VALUES.selectedStatus);
    const [users, setUsers] = useState<UserProfileResponseType[]>([]);
    const [pagination, setPagination] = useState<PaginationResponseType<UserProfileResponseType> | null>(null);
    const [currentPage, setCurrentPage] = useState(DEFAULT_SEARCH_VALUES.currentPage);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedUser, setSelectedUser] = useState<UserProfileResponseType | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const router = useRouter();

    const resetSearch = () => {
        setSearchQuery(DEFAULT_SEARCH_VALUES.searchQuery);
        setSelectedRole(DEFAULT_SEARCH_VALUES.selectedRole);
        setSelectedStatus(DEFAULT_SEARCH_VALUES.selectedStatus);
        setCurrentPage(DEFAULT_SEARCH_VALUES.currentPage);
    };

    const fetchUsers = async (page: number) => {
        try {
            setIsLoading(true);
            const paginationRequest: PaginationRequestType = {
                PageNumber: page,
                PageSize: 10
            };

            // Build search conditions
            const searchConditions: Partial<AdvancedSearchUserRequestType> = {};

            // Only add conditions if they are explicitly selected
            if (selectedRole !== 'all') {
                searchConditions.roleId = selectedRole === 'Admin' ? 3 : selectedRole === 'Moderator' ? 2 : 1;
            }

            if (selectedStatus !== 'all') {
                searchConditions.isActive = selectedStatus === 'active';
            }

            if (searchQuery.trim()) {
                searchConditions.name = searchQuery;
                searchConditions.email = searchQuery;
            }

            const response = await advancedSearchUser(searchConditions as AdvancedSearchUserRequestType, paginationRequest);
            setUsers(response.items);
            setPagination({
                currentPage: response.currentPage,
                totalPages: response.totalPages,
                pageSize: response.pageSize,
                totalCount: response.totalCount,
                hasNext: response.hasNext,
                hasPrevious: response.hasPrevious,
                items: response.items
            });
        } catch (err) {
            console.error('Error fetching users:', err);
            setError('Không thể tải danh sách người dùng. Vui lòng thử lại sau.');
            ToastService.error('Không thể tải danh sách người dùng');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers(currentPage);
    }, [currentPage, searchQuery, selectedRole, selectedStatus]);

    const handlePageChange = (page: number) => {
        if (page !== currentPage) {
            setCurrentPage(page);
        }
    };

    const handleDeleteUser = (user: UserProfileResponseType) => {
        setSelectedUser(user);
        setShowDeleteConfirm(true);
    };

    const handleDeleteSuccess = () => {
        fetchUsers(currentPage);
        setShowDeleteConfirm(false);
        setSelectedUser(null);
    };

    const handleEditUser = (user: UserProfileResponseType) => {
        router.push(`/admin/users/${user.userId}/edit`);
    };

    const handleViewDetails = (user: UserProfileResponseType) => {
        router.push(`/admin/users/${user.userId}`);
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header Section */}
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Quản lý người dùng</h2>
                        <p className="mt-1 text-sm text-gray-600">Quản lý và theo dõi người dùng trong hệ thống</p>
                    </div>
                    <div className="flex space-x-3">
                        <button
                            onClick={resetSearch}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <Filter className="h-4 w-4 mr-2" />
                            Đặt lại bộ lọc
                        </button>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            <UserPlus className="h-4 w-4 mr-2" />
                            Thêm người dùng
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                        {error}
                    </div>
                )}

                {/* Filters and Search Section */}
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Search Input */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="Tìm kiếm theo tên, email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* Role Filter */}
                        <div>
                            <select
                                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                                value={selectedRole}
                                onChange={(e) => setSelectedRole(e.target.value)}
                            >
                                <option value="all">Tất cả vai trò</option>
                                <option value="Admin">Admin</option>
                                <option value="Moderator">Moderator</option>
                                <option value="User">User</option>
                            </select>
                        </div>

                        {/* Status Filter */}
                        <div>
                            <select
                                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                            >
                                <option value="all">Tất cả trạng thái</option>
                                <option value="active">Đang hoạt động</option>
                                <option value="inactive">Không hoạt động</option>
                            </select>
                        </div>

                        {/* Export Button */}
                        <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            <Download className="h-4 w-4 mr-2" />
                            Xuất dữ liệu
                        </button>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Người dùng
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Vai trò
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Trạng thái
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Ngày tạo
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Thao tác
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {users.map((user) => (
                                    <tr key={user.userId}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <img
                                                        className="h-10 w-10 rounded-full"
                                                        src={getImagesFromUrl(user.avatarUrl)}
                                                        alt={user.fullName}
                                                    />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {user.fullName}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {user.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${ROLE_MAPPING[user.roleName as keyof typeof ROLE_MAPPING]}`}>
                                                {user.roleName}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {user.isActive ? 'Đang hoạt động' : 'Đã khóa'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end space-x-2">
                                                <button
                                                    onClick={() => handleViewDetails(user)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                    title="Xem chi tiết"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleEditUser(user)}
                                                    className="text-indigo-600 hover:text-indigo-900"
                                                    title="Chỉnh sửa"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteUser(user)}
                                                    className="text-red-600 hover:text-red-900"
                                                    title="Xóa"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {pagination && (
                        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                            <div className="flex-1 flex justify-between sm:hidden">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={!pagination.hasPrevious}
                                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                >
                                    Trang trước
                                </button>
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={!pagination.hasNext}
                                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                >
                                    Trang sau
                                </button>
                            </div>
                            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-gray-700">
                                        Hiển thị <span className="font-medium">{((currentPage - 1) * pagination.pageSize) + 1}</span> đến{' '}
                                        <span className="font-medium">
                                            {Math.min(currentPage * pagination.pageSize, pagination.totalCount)}
                                        </span>{' '}
                                        của <span className="font-medium">{pagination.totalCount}</span> kết quả
                                    </p>
                                </div>
                                <div>
                                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                        <button
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={!pagination.hasPrevious}
                                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                                        >
                                            <span className="sr-only">Trang trước</span>
                                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                        {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                                            <button
                                                key={page}
                                                onClick={() => handlePageChange(page)}
                                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${page === currentPage
                                                    ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {page}
                                            </button>
                                        ))}
                                        <button
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={!pagination.hasNext}
                                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                                        >
                                            <span className="sr-only">Trang sau</span>
                                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Add User Modal */}
                <AddUserModal
                    isOpen={showAddModal}
                    onClose={() => setShowAddModal(false)}
                    onSuccess={() => {
                        fetchUsers(currentPage);
                    }}
                />

                {/* Delete Confirmation Modal */}
                {selectedUser && (
                    <DeleteUserModal
                        userId={selectedUser.userId}
                        isOpen={showDeleteConfirm}
                        onClose={() => {
                            setShowDeleteConfirm(false);
                            setSelectedUser(null);
                        }}
                        userName={selectedUser.fullName}
                        onSuccess={handleDeleteSuccess}
                    />
                )}
            </div>
        </AdminLayout>
    );
};

export default UserManagementPage;