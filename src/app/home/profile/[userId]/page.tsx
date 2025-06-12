"use client";
import React from 'react';
import { useParams } from 'next/navigation';
import ViewUserProfilePage from '@/components/profile/ViewUserProfilePage';

const UserProfilePage = () => {
    const params = useParams();
    const userId = params.userId ? parseInt(params.userId as string) : 0;

    if (!userId) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen">
                <div className="text-red-500 mb-4">User ID không hợp lệ.</div>
            </div>
        );
    }

    return <ViewUserProfilePage userId={userId} />;
};

export default UserProfilePage; 