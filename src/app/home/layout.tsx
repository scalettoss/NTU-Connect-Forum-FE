import './globals.css';
import '@/styles/animations.css';

import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import HeaderPage from '@/components/layout/HeaderPage';
import FooterPage from '@/components/layout/FooterPage';
import ToastContainer from '@/components/common/ToastContainer';


export const metadata = {
    title: 'NTU Connect',
    description: 'NTU Connect - Kết nối sinh viên trường Đại học Nguyễn Tất Thành',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (

        <ThemeProvider>
            <SidebarProvider>
                <HeaderPage />
                {children}
                <FooterPage />
                <ToastContainer />
            </SidebarProvider>
        </ThemeProvider>

    );
}
