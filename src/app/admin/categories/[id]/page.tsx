import { Metadata } from 'next'
import CategoryDetailPage from '@/components/admin/categories/CategoryDetailPage'
import { Suspense } from 'react'

export const metadata: Metadata = {
    title: 'Chi tiết người dùng | NTU Connect',
    description: 'Xem thông tin chi tiết của danh mục trong hệ thống',
};

interface PageProps {
    params: {
        id: string
    }
}

export default function CategoryDetails({ params }: PageProps) {
    return <CategoryDetailPage params={{ id: params.id }} />;
}
