import { Metadata } from 'next';
import UserDetailsPage from '@/components/admin/users/UserDetailsPage';

export const metadata: Metadata = {
    title: 'Chi tiết người dùng | NTU Connect',
    description: 'Xem thông tin chi tiết của người dùng trong hệ thống',
};

interface UserDetailsProps {
    params: {
        id: string;
    };
}

export default function UserDetails({ params }: UserDetailsProps) {
    return <UserDetailsPage userId={parseInt(params.id)} />;
} 