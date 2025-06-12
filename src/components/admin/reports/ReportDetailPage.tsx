"use client";
import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/layout/AdminLayout';
import { getDetailReportPost, handleReportPost } from '@/services/ReportService';
import { getPostDetailByAdmin } from '@/services/PostService';
import { useParams, useRouter } from 'next/navigation';
import ToastService from '@/services/ToastService';
import { ArrowLeft, Calendar, MessageCircle, ThumbsUp, User, AlertTriangle, Check, X, Loader2 } from 'lucide-react';
import { PostDetailResponseType } from '@/types/PostType';
import { ReportPostResponseType, HandleReportPostRequestType } from '@/types/ReportType';
import { getImagesFromUrl } from '@/helper/GetImagesHelper';
import { getFileType, getFileName, categorizeFileUrls } from '@/helper/FileHelper';
import FileIcon from '@/components/common/FileIcon';
import { getFileFromUrl } from '@/helper/GetUrlFileHelper';

const STATUS_STYLES = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    resolved: 'bg-green-100 text-green-800 border-green-200',
    rejected: 'bg-red-100 text-red-800 border-red-200',
} as const;

const STATUS_LABELS = {
    pending: 'Chờ xử lý',
    resolved: 'Đã xử lý',
    rejected: 'Đã từ chối',
} as const;

const ReportDetailPage: React.FC = () => {
    const [report, setReport] = useState<ReportPostResponseType | null>(null);
    const [post, setPost] = useState<PostDetailResponseType | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const params = useParams();
    const router = useRouter();
    const reportId = Number(params.id);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const reportResponse = await getDetailReportPost(reportId);
                setReport(reportResponse);

                // Fetch post details using postId from report
                const postResponse = await getPostDetailByAdmin(reportResponse.postId);
                setPost(postResponse);
            } catch (error) {
                console.error('Error fetching details:', error);
                ToastService.error('Không thể tải thông tin báo cáo');
            } finally {
                setIsLoading(false);
            }
        };

        if (reportId) {
            fetchData();
        }
    }, [reportId]);

    const handleBack = () => {
        router.back();
    };

    const handleReportStatus = async (status: 'resolved' | 'rejected') => {
        if (!report || isProcessing) return;

        try {
            setIsProcessing(true);
            const data: HandleReportPostRequestType = {
                reportId: report.reportId,
                status
            };

            await handleReportPost(data);

            // Refresh report data
            const updatedReport = await getDetailReportPost(reportId);
            setReport(updatedReport);

            ToastService.success(`Báo cáo đã được ${status === 'resolved' ? 'xử lý' : 'từ chối'} thành công`);
        } catch (error) {
            console.error('Error handling report:', error);
            ToastService.error('Không thể xử lý báo cáo. Vui lòng thử lại sau.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleResolveReport = () => handleReportStatus('resolved');
    const handleRejectReport = () => handleReportStatus('rejected');

    if (isLoading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </AdminLayout>
        );
    }

    if (!report || !post) {
        return (
            <AdminLayout>
                <div className="text-center py-12">
                    <h2 className="text-2xl font-semibold text-gray-900">Không tìm thấy báo cáo</h2>
                    <button
                        onClick={handleBack}
                        className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Quay lại
                    </button>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
                {/* Header Section */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100 shadow-sm mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={handleBack}
                                className="p-3 hover:bg-white hover:shadow-md rounded-xl transition-all duration-200 bg-white/70 border border-blue-200"
                            >
                                <ArrowLeft className="h-5 w-5 text-blue-600" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                    Chi tiết báo cáo
                                </h1>
                                <p className="text-sm text-blue-600/70 mt-1">Xem và xử lý báo cáo vi phạm</p>
                            </div>
                        </div>
                        <span className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 ${STATUS_STYLES[report.status as keyof typeof STATUS_STYLES]} shadow-sm`}>
                            {STATUS_LABELS[report.status as keyof typeof STATUS_LABELS]}
                        </span>
                    </div>
                </div>

                {/* Report Information */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin báo cáo</h2>
                            <div className="space-y-4">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 h-12 w-12">
                                        <img
                                            className="h-12 w-12 rounded-full"
                                            src={getImagesFromUrl(report.avatarUrl)}
                                            alt={report.fullName}
                                        />
                                    </div>
                                    <div className="ml-4">
                                        <div className="text-sm font-medium text-gray-900">{report.fullName}</div>
                                        <div className="text-sm text-gray-500">
                                            {new Date(report.createdAt).toLocaleDateString('vi-VN')}
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-900">Lý do báo cáo</h3>
                                    <p className="mt-1 text-sm text-gray-600">{report.reason}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Post Information */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Bài viết bị báo cáo</h2>
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-xl font-medium text-gray-900">{post.title}</h3>
                                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                                        <span className="flex items-center">
                                            <User className="h-4 w-4 mr-1" />
                                            {post.fullName}
                                        </span>
                                        <span className="flex items-center">
                                            <Calendar className="h-4 w-4 mr-1" />
                                            {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                                        </span>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[post.status as keyof typeof STATUS_STYLES]}`}>
                                            {STATUS_LABELS[post.status as keyof typeof STATUS_LABELS]}
                                        </span>
                                    </div>
                                </div>
                                <div className="prose prose-sm max-w-none mt-4">
                                    <div dangerouslySetInnerHTML={{ __html: post.content }} />
                                </div>

                                {/* File Attachments */}
                                {post.fileUrls && post.fileUrls.length > 0 && (
                                    <div className="mt-6 space-y-4">
                                        {/* Images */}
                                        {(() => {
                                            const { imageUrls, documentUrls } = categorizeFileUrls(post.fileUrls);
                                            return (
                                                <>
                                                    {imageUrls.length > 0 && (
                                                        <div>
                                                            <h4 className="text-sm font-medium text-gray-900 mb-3">Hình ảnh đính kèm</h4>
                                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                                {imageUrls.map((url, index) => (
                                                                    <a
                                                                        key={`img-${index}`}
                                                                        href={getFileFromUrl(url)}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="relative aspect-video group"
                                                                    >
                                                                        <img
                                                                            src={getImagesFromUrl(url)}
                                                                            alt={`Attached image ${index + 1}`}
                                                                            className="w-full h-full object-cover rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                                                                        />
                                                                    </a>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Documents */}
                                                    {documentUrls.length > 0 && (
                                                        <div>
                                                            <h4 className="text-sm font-medium text-gray-900 mb-3">Tài liệu đính kèm</h4>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                {documentUrls.map((url, index) => {
                                                                    const fileType = getFileType(url);
                                                                    const fileName = getFileName(url);
                                                                    const shortName = fileName.length > 25
                                                                        ? fileName.substring(0, 22) + '...' + fileName.substring(fileName.lastIndexOf('.'))
                                                                        : fileName;

                                                                    return (
                                                                        <a
                                                                            key={`doc-${index}`}
                                                                            href={getFileFromUrl(url)}
                                                                            download
                                                                            className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
                                                                            title={fileName}
                                                                            target="_blank"
                                                                        >
                                                                            <div className="flex-shrink-0">
                                                                                <FileIcon fileType={fileType} size={24} />
                                                                            </div>
                                                                            <div className="ml-3 flex-1 min-w-0">
                                                                                <p className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600">
                                                                                    {shortName}
                                                                                </p>
                                                                            </div>
                                                                        </a>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    )}
                                                </>
                                            );
                                        })()}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    {report.status === 'pending' && (
                        <div className="flex justify-end space-x-4 mt-6">
                            <button
                                onClick={handleRejectReport}
                                disabled={isProcessing}
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isProcessing ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <X className="h-4 w-4 mr-2" />
                                )}
                                Từ chối báo cáo
                            </button>
                            <button
                                onClick={handleResolveReport}
                                disabled={isProcessing}
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isProcessing ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <Check className="h-4 w-4 mr-2" />
                                )}
                                Xử lý báo cáo
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default ReportDetailPage; 