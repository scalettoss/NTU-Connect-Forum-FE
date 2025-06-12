import { Inter } from 'next/font/google';
import '@/app/globals.css';
import '@/styles/animations.css';

import { ThemeProvider } from '@/context/ThemeContext';
import ToastContainer from '@/components/common/ToastContainer';

// Load Inter font with all weights
const inter = Inter({
    subsets: ["latin"],
    display: 'swap',
    variable: '--font-inter',
    weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
});

export const metadata = {
    title: 'Admin | NTU Connect',
    description: 'Trang quản trị NTU Connect - Quản lý nội dung và người dùng',
};

// Đây là một root layout mới, không kế thừa từ RootLayout
export default function AdminLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={inter.variable}>
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            </head>
            <body className={`${inter.className} dark:bg-gray-900`}>
                <ThemeProvider>
                    {children}
                    <ToastContainer />
                </ThemeProvider>
            </body>
        </html>
    );
} 