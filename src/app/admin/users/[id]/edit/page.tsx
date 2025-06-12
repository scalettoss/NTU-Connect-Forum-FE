import { Metadata } from 'next';
import EditUserPage from '@/components/admin/users/EditUserPage';

export const metadata: Metadata = {
    title: 'Chỉnh sửa người dùng | NTU Connect',
    description: 'Chỉnh sửa thông tin người dùng trong hệ thống',
};

interface EditUserProps {
    params: {
        id: string;
    };
}

export default function EditUser({ params }: EditUserProps) {
    return <EditUserPage userId={parseInt(params.id)} />;
}

