"use client";
import React, { useState } from 'react';
import { Bell, Send, Search, Filter, X, Loader2 } from 'lucide-react';
import { sendSystemNotification } from '@/services/NotificationService';
import { SendSystemNotificationType } from '@/types/NotificationType';
import ToastService from '@/services/ToastService';

// Mock data for notifications
const mockNotifications = [
    {
        id: 1,
        message: 'Chúng tôi rất vui mừng thông báo NtuConnect đã chính thức ra mắt!',
        sentTo: 'Tất cả người dùng',
        sentAt: '2024-03-20T08:00:00Z',
        status: 'Đã gửi'
    },
    {
        id: 2,
        message: 'Hệ thống sẽ được bảo trì vào ngày 25/03/2024',
        sentTo: 'Tất cả người dùng',
        sentAt: '2024-03-19T10:30:00Z',
        status: 'Đã gửi'
    },
];

const AdminNotificationPage = () => {
    const [notifications, setNotifications] = useState(mockNotifications);
    const [showSendForm, setShowSendForm] = useState(false);
    const [newMessage, setNewMessage] = useState('');
    const [isSending, setIsSending] = useState(false);

    const handleSendNotification = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            setIsSending(true);
            const notification: SendSystemNotificationType = {
                message: newMessage.trim()
            };

            await sendSystemNotification(notification);

            const newNotif = {
                id: notifications.length + 1,
                message: newMessage,
                sentTo: 'Tất cả người dùng',
                sentAt: new Date().toISOString(),
                status: 'Đã gửi'
            };
            setNotifications([newNotif, ...notifications]);

            setNewMessage('');
            setShowSendForm(false);
            ToastService.success('Đã gửi thông báo thành công');
        } catch (error) {
            console.error('Error sending notification:', error);
            ToastService.error('Không thể gửi thông báo. Vui lòng thử lại sau.');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="container mx-auto px-4">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                    <Bell className="h-6 w-6 mr-2" />
                    Quản lý thông báo
                </h1>
                <p className="text-gray-600 mt-1">
                    Quản lý và gửi thông báo đến người dùng
                </p>
            </div>

            {/* Actions */}
            <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
                <div className="flex gap-4 flex-1">
                    <div className="relative flex-1 max-w-md">
                        <input
                            type="text"
                            placeholder="Tìm kiếm thông báo..."
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                        />
                        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    </div>
                    <button
                        className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    >
                        <Filter className="h-5 w-5 mr-2" />
                        Lọc
                    </button>
                </div>
                <button
                    onClick={() => setShowSendForm(true)}
                    className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                    <Send className="h-5 w-5 mr-2" />
                    Gửi thông báo mới
                </button>
            </div>

            {/* Send Notification Modal */}
            {showSendForm && (
                <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 shadow-2xl transform transition-all">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center">
                                <Send className="h-5 w-5 mr-2 text-blue-600" />
                                Gửi thông báo mới
                            </h2>
                            <button
                                onClick={() => setShowSendForm(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="h-5 w-5 text-gray-500" />
                            </button>
                        </div>
                        <form onSubmit={handleSendNotification}>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nội dung thông báo
                                </label>
                                <textarea
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 min-h-[120px] resize-none"
                                    placeholder="Nhập nội dung thông báo..."
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowSendForm(false)}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                                    disabled={isSending}
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSending || !newMessage.trim()}
                                    className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSending ? (
                                        <>
                                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                            Đang gửi...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="h-5 w-5 mr-2" />
                                            Gửi thông báo
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Notifications List */}
            <div className="bg-white rounded-lg shadow">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Nội dung
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Gửi đến
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Thời gian
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Trạng thái
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {notifications.map((notification) => (
                                <tr key={notification.id}>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900 line-clamp-2">
                                            {notification.message}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">
                                            {notification.sentTo}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">
                                            {new Date(notification.sentAt).toLocaleString('vi-VN')}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                            {notification.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminNotificationPage; 