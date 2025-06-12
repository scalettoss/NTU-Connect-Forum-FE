"use client";
import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { createReportPost } from '@/services/ReportService';
import ToastService from '@/services/ToastService';
import { AlertTriangle, X } from 'lucide-react';

interface ReportPostModalProps {
    isOpen: boolean;
    onClose: () => void;
    postId: number;
    postTitle: string;
}

const REPORT_REASONS = [
    'Spam hoặc quảng cáo',
    'Nội dung không phù hợp',
    'Thông tin sai lệch',
    'Vi phạm bản quyền',
    'Lừa đảo',
    'Quấy rối',
    'Khác'
];

export default function ReportPostModal({ isOpen, onClose, postId, postTitle }: ReportPostModalProps) {
    const [selectedReason, setSelectedReason] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [showCustomReason, setShowCustomReason] = useState<boolean>(false);
    const descriptionRef = useRef<HTMLTextAreaElement>(null);

    // Reset form when modal is closed
    useEffect(() => {
        if (!isOpen) {
            setSelectedReason('');
            setDescription('');
            setIsSubmitting(false);
            setShowCustomReason(false);
        }
    }, [isOpen]);

    useEffect(() => {
        if (showCustomReason && descriptionRef.current) {
            descriptionRef.current.focus();
        }
    }, [showCustomReason]);

    const handleReasonChange = (reason: string) => {
        setSelectedReason(reason);
        setShowCustomReason(reason === 'Khác');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedReason) {
            ToastService.warning('Vui lòng chọn lý do báo cáo');
            return;
        }

        if (showCustomReason && !description.trim()) {
            ToastService.warning('Vui lòng nhập mô tả chi tiết cho báo cáo của bạn');
            return;
        }

        try {
            setIsSubmitting(true);

            const resonse = await createReportPost({
                postId,
                reason: selectedReason,
            });

            ToastService.success('Báo cáo đã được gửi thành công');
            onClose();
        } catch (error) {
            //@ts-ignore
            const message = error.response?.data?.message;
            console.error('Error submitting report:', error);
            ToastService.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const modalContent = (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500/10 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-auto overflow-hidden animate-fadeIn"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                            <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                            <h2 className="text-xl font-semibold">Báo cáo bài viết</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700 rounded-full p-1 hover:bg-gray-100"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="mb-4">
                        <p className="text-gray-600 text-sm">
                            Bạn đang báo cáo bài viết: <span className="font-medium text-gray-800">{postTitle}</span>
                        </p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Lý do báo cáo <span className="text-red-500">*</span>
                            </label>
                            <div className="space-y-2">
                                {REPORT_REASONS.map((reason) => (
                                    <div key={reason} className="flex items-center">
                                        <input
                                            type="radio"
                                            id={`reason-${reason}`}
                                            name="report-reason"
                                            value={reason}
                                            checked={selectedReason === reason}
                                            onChange={() => handleReasonChange(reason)}
                                            className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                                        />
                                        <label
                                            htmlFor={`reason-${reason}`}
                                            className="ml-2 block text-sm text-gray-700"
                                        >
                                            {reason}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mb-5">
                            <label
                                htmlFor="description"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Mô tả chi tiết {showCustomReason && <span className="text-red-500">*</span>}
                            </label>
                            <textarea
                                ref={descriptionRef}
                                id="description"
                                rows={4}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Vui lòng cung cấp thêm thông tin về báo cáo của bạn..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            />
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isSubmitting}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-transparent rounded-md hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-500"
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting || !selectedReason || (showCustomReason && !description.trim())}
                                className={`px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 ${isSubmitting || !selectedReason || (showCustomReason && !description.trim())
                                    ? 'bg-indigo-300 cursor-not-allowed'
                                    : 'bg-indigo-600 hover:bg-indigo-700'
                                    }`}
                            >
                                {isSubmitting ? (
                                    <div className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Đang gửi...
                                    </div>
                                ) : (
                                    'Gửi báo cáo'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
} 