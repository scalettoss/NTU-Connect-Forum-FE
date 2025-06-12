import { Metadata } from 'next';
import CategoryManagementPage from '@/components/admin/categories/CategoryManagementPage';

export const metadata: Metadata = {
    title: 'Quản lý danh mục | NTU Connect',
    description: 'Quản lý và theo dõi danh mục trong hệ thống',
};

export default function CategoriesPage() {
    return <CategoryManagementPage />;
} 