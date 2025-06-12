import { Metadata } from "next";
import RegisterPage from "@/components/login/RegisterPage";

export const metadata: Metadata = {
    title: "Đăng kí | NTU Connect",
    description: "Đăng kí vào NTU Connect để kết nối với cộng đồng sinh viên",
};

export default function Register() {
    return <RegisterPage />;
}

