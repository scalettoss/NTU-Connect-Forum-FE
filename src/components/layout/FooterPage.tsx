"use client";
import Link from 'next/link';
import { Facebook, Instagram, Twitter, Youtube, Mail, MapPin, ExternalLink } from 'lucide-react';

const FooterPage = () => {
    return (
        <footer className="bg-gradient-to-r from-white via-orange-50 to-white text-gray-700 border-t border-gray-200">
            {/* Phần chính của footer - đã thu gọn */}
            <div className="w-full max-w-7xl mx-auto py-6 px-4 md:px-8">
                <div className="flex flex-col md:flex-row justify-between">
                    {/* Logo và Social */}
                    <div className="mb-6 md:mb-0">
                        <div className="flex items-center space-x-2 mb-4">
                            <div className="h-8 w-8 rounded-full bg-orange-500 flex items-center justify-center">
                                <span className="text-base font-bold text-white">N</span>
                            </div>
                            <span className="text-lg font-bold tracking-tight text-gray-800">NTU Connect</span>
                        </div>

                        <div className="flex space-x-3">
                            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-[#1877F2] hover:opacity-80 transition">
                                <Facebook size={16} />
                            </a>
                            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-[#833AB4] hover:opacity-80 transition">
                                <Instagram size={16} />
                            </a>
                            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-[#1DA1F2] hover:opacity-80 transition">
                                <Twitter size={16} />
                            </a>
                            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-[#FF0000] hover:opacity-80 transition">
                                <Youtube size={16} />
                            </a>
                        </div>
                    </div>

                    {/* Liên kết và thông tin - thu gọn */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
                        {/* Links */}
                        <div>
                            <h4 className="text-sm font-semibold mb-3 text-gray-800">Liên kết</h4>
                            <ul className="space-y-2 text-xs text-gray-600">
                                <li className="hover:text-orange-500 transition">
                                    <Link href="/about">Giới thiệu</Link>
                                </li>
                                <li className="hover:text-orange-500 transition">
                                    <Link href="/blogs">Bài viết</Link>
                                </li>
                                <li className="hover:text-orange-500 transition">
                                    <Link href="/events">Sự kiện</Link>
                                </li>
                            </ul>
                        </div>

                        {/* Hỗ trợ */}
                        <div>
                            <h4 className="text-sm font-semibold mb-3 text-gray-800">Hỗ trợ</h4>
                            <ul className="space-y-2 text-xs text-gray-600">
                                <li className="hover:text-orange-500 transition">
                                    <Link href="/faq">Câu hỏi thường gặp</Link>
                                </li>
                                <li className="hover:text-orange-500 transition">
                                    <Link href="/terms">Điều khoản sử dụng</Link>
                                </li>
                                <li className="hover:text-orange-500 transition">
                                    <Link href="/privacy">Chính sách bảo mật</Link>
                                </li>
                            </ul>
                        </div>

                        {/* Liên hệ */}
                        <div>
                            <h4 className="text-sm font-semibold mb-3 text-gray-800">Liên hệ</h4>
                            <ul className="space-y-2 text-xs text-gray-600">
                                <li className="flex items-start">
                                    <MapPin size={14} className="text-orange-500 mr-1 mt-0.5 flex-shrink-0" />
                                    <span>Nha Trang, Khánh Hòa</span>
                                </li>
                                <li className="flex items-start">
                                    <Mail size={14} className="text-orange-500 mr-1 mt-0.5 flex-shrink-0" />
                                    <span>contact@ntuconnect.com</span>
                                </li>
                                <li className="flex items-start">
                                    <ExternalLink size={14} className="text-orange-500 mr-1 mt-0.5 flex-shrink-0" />
                                    <a href="https://ntu.edu.vn" target="_blank" rel="noopener noreferrer" className="hover:text-orange-500">
                                        ntu.edu.vn
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Phần bản quyền - đã thu gọn */}
            <div className="bg-gradient-to-r from-gray-50 via-orange-50/30 to-gray-50 py-3 border-t border-gray-200">
                <div className="max-w-7xl mx-auto px-4 md:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <p className="text-xs text-gray-500">© {new Date().getFullYear()} NTU Connect</p>
                        <p className="text-xs text-gray-500 mt-1 md:mt-0">Được phát triển bởi Sinh viên Đại học Nha Trang</p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default FooterPage;
