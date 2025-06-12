import { Metadata } from "next";
import AdminLoginPage from "@/components/admin/login/AdminLoginPage";

export const metadata: Metadata = {
    title: "Admin Login | NTU Connect",
    description: "Đăng nhập Admin vào hệ thống quản trị NTU Connect",
};

export default function AdminLogin() {
    return <AdminLoginPage />;
} 