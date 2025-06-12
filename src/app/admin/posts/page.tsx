import { Metadata } from 'next';
import PostManagementPage from '@/components/admin/posts/PostManagementPage';

export const metadata: Metadata = {
    title: 'Quản lý bài viết | NTU Connect',
    description: 'Quản lý và theo dõi bài viết trong hệ thống',
};

export default function PostsPage() {
    return <PostManagementPage />;
} 