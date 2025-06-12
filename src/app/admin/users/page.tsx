import { Metadata } from "next";
import UserManagementPage from "@/components/admin/users/UserManagementPage";

export const metadata: Metadata = {
    title: "Quản lý người dùng | NTU Connect",
    description: "Quản lý và theo dõi người dùng trong hệ thống NTU Connect",
};

export default function UsersPage() {
    return <UserManagementPage />;
} 