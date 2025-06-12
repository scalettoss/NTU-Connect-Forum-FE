import React from 'react';
import { Trash2 } from 'lucide-react';
import ToastService from '@/services/ToastService';
import { deleteUser } from '@/services/UserService';
import { useRouter } from 'next/navigation';

interface DeleteUserModalProps {
    userId: number;
    isOpen: boolean;
    onClose: () => void;
    userName?: string;
    onSuccess?: () => void;
}

const DeleteUserModal: React.FC<DeleteUserModalProps> = ({ userId, isOpen, onClose, userName, onSuccess }) => {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = React.useState(false);

    const handleDelete = async () => {
        try {
            setIsDeleting(true);
            await deleteUser(userId);
            ToastService.success('Xóa người dùng thành công');
            onSuccess?.();
            router.push('/admin/users');
        } catch (err) {
            console.error('Error deleting user:', err);
            ToastService.error('Không thể xóa người dùng');
        } finally {
            setIsDeleting(false);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
                {/* Backdrop */}
                <div
                    className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
                    onClick={onClose}
                />

                {/* Modal */}
                <div className="relative transform overflow-hidden rounded-lg bg-white shadow-xl transition-all sm:w-full sm:max-w-lg">
                    <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                            <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                                <Trash2 className="h-6 w-6 text-red-600" />
                            </div>
                            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                                <h3 className="text-lg font-semibold leading-6 text-gray-900">
                                    Xác nhận xóa người dùng
                                </h3>
                                <div className="mt-2">
                                    <p className="text-sm text-gray-500">
                                        {userName
                                            ? `Bạn có chắc chắn muốn xóa người dùng "${userName}"?`
                                            : 'Bạn có chắc chắn muốn xóa người dùng này?'}
                                    </p>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Hành động này không thể hoàn tác.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isDeleting ? 'Đang xóa...' : 'Xóa'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                        >
                            Hủy
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeleteUserModal; 