import { Metadata } from "next";
import LoginPage from "@/components/login/LoginPage";

export const metadata: Metadata = {
    title: "Đăng nhập | NTU Connect",
    description: "Đăng nhập vào NTU Connect để kết nối với cộng đồng sinh viên",
};

export default function Login() {
    return <LoginPage />;
}
