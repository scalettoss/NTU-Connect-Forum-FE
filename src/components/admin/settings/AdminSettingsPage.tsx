"use client";
import React, { useState, useEffect } from 'react';
import { Settings, Save, Loader2 } from 'lucide-react';
import { getAutoConfig, setAutoConfig } from '@/services/SystemConfigService';
import { setAutoApprovedConfigRequestType } from '@/types/SystemConfigType';
import ToastService from '@/services/ToastService';

const AdminSettingsPage = () => {
    const [autoApproveEnabled, setAutoApproveEnabled] = useState<boolean>(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchAutoConfig();
    }, []);

    const fetchAutoConfig = async () => {
        try {
            const response = await getAutoConfig();
            // @ts-ignore
            setAutoApproveEnabled(response.data);
        } catch (error) {
            console.error('Error fetching auto config:', error);
            ToastService.error('Không thể tải cấu hình. Vui lòng thử lại sau.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const config: setAutoApprovedConfigRequestType = {
                isAutoApproved: autoApproveEnabled
            };
            await setAutoConfig(config);
            ToastService.success('Đã lưu cấu hình thành công');
        } catch (error) {
            console.error('Error saving settings:', error);
            ToastService.error('Không thể lưu cấu hình. Vui lòng thử lại sau.');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 h-screen flex items-center justify-center">
                <div className="flex items-center space-x-2">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                    <span className="text-gray-600">Đang tải cấu hình...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                    <Settings className="h-6 w-6 mr-2" />
                    Cài đặt hệ thống
                </h1>
                <p className="text-gray-600 mt-1">
                    Quản lý các cài đặt và cấu hình hệ thống
                </p>
            </div>

            {/* Settings Form */}
            <div className="bg-white rounded-lg shadow p-6">
                <form onSubmit={handleSaveSettings}>
                    <div className="space-y-6">
                        {/* Auto Approve Section */}
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Cài đặt phê duyệt</h3>
                            <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <label htmlFor="autoApprove" className="font-medium text-gray-700">
                                            Duyệt bài viết tự động
                                        </label>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Khi bật, các bài viết mới nếu dự đoán là hợp lệ sẽ được tự động phê duyệt mà không cần kiểm duyệt
                                        </p>
                                    </div>
                                    <div className="relative inline-block w-12 mr-2 align-middle select-none">
                                        <input
                                            type="checkbox"
                                            id="autoApprove"
                                            checked={autoApproveEnabled}
                                            onChange={(e) => setAutoApproveEnabled(e.target.checked)}
                                            className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer transition-transform duration-200 ease-in-out"
                                            disabled={isSaving}
                                        />
                                        <label
                                            htmlFor="autoApprove"
                                            className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer transition-colors duration-200 ${autoApproveEnabled ? 'bg-blue-600' : 'bg-gray-300'
                                                } ${isSaving ? 'opacity-50' : ''}`}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Save Button */}
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                        Đang lưu...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-5 w-5 mr-2" />
                                        Lưu thay đổi
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminSettingsPage; 