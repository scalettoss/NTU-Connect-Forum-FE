import { Metadata } from "next";
import AdminDashboardPage from "@/components/admin/dashboard/AdminDashboardPage";

export const metadata: Metadata = {
    title: "Admin Dashboard | NTU Connect",
    description: "Trang quản trị dành cho Admin NTU Connect",
};

export default function AdminDashboard() {
    return <AdminDashboardPage />;
} 