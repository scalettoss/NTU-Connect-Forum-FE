import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Quản lý người dùng | NTU Connect',
    description: 'Quản lý và theo dõi người dùng trong hệ thống',
};

export default function UsersLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
} 