import { Metadata } from "next";
import AdminUnauthorizedPage from "@/components/admin/unauthorized/AdminUnauthorizedPage";

export const metadata: Metadata = {
    title: "Không có quyền truy cập | NTU Connect",
    description: "Bạn không có quyền truy cập vào khu vực quản trị",
};

export default function AdminUnauthorized() {
    return <AdminUnauthorizedPage />;
} 