"use client";
import React, { useState } from 'react';
import AdminLayout from '@/components/admin/layout/AdminLayout';
import { Search, Filter, Eye, Check, X, AlertTriangle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getAllReportPost, handleReportPost } from '@/services/ReportService';
import { ReportPostResponseType, HandleReportPostRequestType } from '@/types/ReportType';
import { PaginationRequestType, PaginationResponseType } from '@/types/PaginationType';
import ToastService from '@/services/ToastService';
import { getImagesFromUrl } from '@/helper/GetImagesHelper';



const STATUS_MAPPING = {
    'pending': 'bg-yellow-100 text-yellow-800 border border-yellow-200',
    'resolved': 'bg-green-100 text-green-800 border border-green-200',
    'rejected': 'bg-red-100 text-red-800 border border-red-200'
} as const;

const DEFAULT_SEARCH_VALUES = {
    searchQuery: '',
    selectedStatus: 'all',
    currentPage: 1,
    pageSize: 10
};

const ReportManagementPage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState(DEFAULT_SEARCH_VALUES.searchQuery);
    const [selectedStatus, setSelectedStatus] = useState(DEFAULT_SEARCH_VALUES.selectedStatus);
    const [currentPage, setCurrentPage] = useState(DEFAULT_SEARCH_VALUES.currentPage);
    const [reports, setReports] = useState<ReportPostResponseType[]>([]);
    const [pagination, setPagination] = useState<PaginationResponseType<ReportPostResponseType> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [processingReportId, setProcessingReportId] = useState<number | null>(null);
    const router = useRouter();

    const fetchReports = async () => {
        try {
            setIsLoading(true);
            const paginationRequest: PaginationRequestType = {
                PageNumber: currentPage,
                PageSize: DEFAULT_SEARCH_VALUES.pageSize,
                SortBy: selectedStatus === 'all' ? undefined : selectedStatus
            };

            const response = await getAllReportPost(paginationRequest);
            setReports(response.items);
            setPagination(response);
        } catch (error) {
            console.error('Error fetching reports:', error);
            ToastService.error('Không thể tải danh sách báo cáo');
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        fetchReports();
    }, [currentPage, selectedStatus]);

    const resetSearch = () => {
        setSearchQuery(DEFAULT_SEARCH_VALUES.searchQuery);
        setSelectedStatus(DEFAULT_SEARCH_VALUES.selectedStatus);
        setCurrentPage(DEFAULT_SEARCH_VALUES.currentPage);
    };

    const handleViewDetails = (reportId: number) => {
        router.push(`/admin/reports/${reportId}`);
    };

    const handleReportStatus = async (reportId: number, status: 'resolved' | 'rejected') => {
        if (processingReportId) return;

        try {
            setProcessingReportId(reportId);
            const data: HandleReportPostRequestType = {
                reportId,
                status
            };

            await handleReportPost(data);
            await fetchReports(); // Refresh the list after handling
            ToastService.success(`Báo cáo đã được ${status === 'resolved' ? 'xử lý' : 'từ chối'} thành công`);
        } catch (error) {
            console.error('Error handling report:', error);
            ToastService.error('Không thể xử lý báo cáo. Vui lòng thử lại sau.');
        } finally {
            setProcessingReportId(null);
        }
    };

    const handleResolveReport = (reportId: number) => handleReportStatus(reportId, 'resolved');
    const handleRejectReport = (reportId: number) => handleReportStatus(reportId, 'rejected');

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header Section */}
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Quản lý báo cáo</h2>
                        <p className="mt-1 text-sm text-gray-600">Xử lý các báo cáo vi phạm từ người dùng</p>
                    </div>
                    <div className="flex space-x-3">
                        <button
                            onClick={resetSearch}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <Filter className="h-4 w-4 mr-2" />
                            Đặt lại bộ lọc
                        </button>
                    </div>
                </div>

                {/* Filters and Search Section */}
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Search Input */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="Tìm kiếm theo tiêu đề bài viết..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* Status Filter */}
                        <div>
                            <select
                                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                            >
                                <option value="all">Tất cả trạng thái</option>
                                <option value="pending">Chờ xử lý</option>
                                <option value="resolved">Đã xử lý</option>
                                <option value="rejected">Đã từ chối</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Reports Table */}
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Bài viết
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Người báo cáo
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Lý do
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Trạng thái
                                    </th>

                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Ngày báo cáo
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Thao tác
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                                            Đang tải dữ liệu...
                                        </td>
                                    </tr>
                                ) : reports.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                                            Không có báo cáo nào
                                        </td>
                                    </tr>
                                ) : (
                                    reports.map((report, index) => (
                                        <tr key={index}>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {report.title}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        <img
                                                            className="h-10 w-10 rounded-full"
                                                            src={getImagesFromUrl(report.avatarUrl)}
                                                            alt={report.fullName}
                                                        />
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {report.fullName}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900">{report.reason}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${STATUS_MAPPING[report.status as keyof typeof STATUS_MAPPING]}`}>
                                                    {report.status === 'pending' ? 'Chờ xử lý' :
                                                        report.status === 'resolved' ? 'Đã xử lý' : 'Đã từ chối'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(report.createdAt).toLocaleDateString('vi-VN')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end space-x-2">
                                                    <button
                                                        onClick={() => handleViewDetails(report.reportId)}
                                                        className="text-blue-600 hover:text-blue-900"
                                                        title="Xem chi tiết"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </button>
                                                    {report.status === 'pending' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleResolveReport(report.reportId)}
                                                                disabled={processingReportId === report.reportId}
                                                                className="text-green-600 hover:text-green-900 disabled:text-gray-400 disabled:cursor-not-allowed"
                                                                title="Xử lý báo cáo"
                                                            >
                                                                {processingReportId === report.reportId ? (
                                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                                ) : (
                                                                    <Check className="h-4 w-4" />
                                                                )}
                                                            </button>
                                                            <button
                                                                onClick={() => handleRejectReport(report.reportId)}
                                                                disabled={processingReportId === report.reportId}
                                                                className="text-red-600 hover:text-red-900 disabled:text-gray-400 disabled:cursor-not-allowed"
                                                                title="Từ chối báo cáo"
                                                            >
                                                                {processingReportId === report.reportId ? (
                                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                                ) : (
                                                                    <X className="h-4 w-4" />
                                                                )}
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {pagination && pagination.totalPages > 1 && (
                        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                            <div className="flex-1 flex justify-between sm:hidden">
                                <button
                                    onClick={() => setCurrentPage(currentPage - 1)}
                                    disabled={!pagination.hasPrevious}
                                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                                >
                                    Trang trước
                                </button>
                                <button
                                    onClick={() => setCurrentPage(currentPage + 1)}
                                    disabled={!pagination.hasNext}
                                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                                >
                                    Trang sau
                                </button>
                            </div>
                            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-gray-700">
                                        Hiển thị <span className="font-medium">{((currentPage - 1) * DEFAULT_SEARCH_VALUES.pageSize) + 1}</span> đến{' '}
                                        <span className="font-medium">
                                            {Math.min(currentPage * DEFAULT_SEARCH_VALUES.pageSize, pagination.totalCount)}
                                        </span>{' '}
                                        của <span className="font-medium">{pagination.totalCount}</span> kết quả
                                    </p>
                                </div>
                                <div>
                                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                        <button
                                            onClick={() => setCurrentPage(currentPage - 1)}
                                            disabled={!pagination.hasPrevious}
                                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                                        >
                                            <span className="sr-only">Trang trước</span>
                                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                        {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                                            <button
                                                key={page}
                                                onClick={() => setCurrentPage(page)}
                                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${page === currentPage
                                                    ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {page}
                                            </button>
                                        ))}
                                        <button
                                            onClick={() => setCurrentPage(currentPage + 1)}
                                            disabled={!pagination.hasNext}
                                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
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
            </div>
        </AdminLayout>
    );
};

export default ReportManagementPage; 