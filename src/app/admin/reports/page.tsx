import { Metadata } from 'next';
import ReportManagementPage from '@/components/admin/reports/ReportManagementPage';

export const metadata: Metadata = {
    title: 'Quản lý báo cáo | NtuConnect Admin',
    description: 'Quản lý và xử lý các báo cáo vi phạm từ người dùng',
};

export default function ReportsPage() {
    return <ReportManagementPage />;
} 