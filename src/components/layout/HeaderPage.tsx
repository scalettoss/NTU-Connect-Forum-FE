"use client"
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { User, LogIn, LogOut, ChevronDown, Menu, Bookmark, PenSquare, Bell } from 'lucide-react';
import { getImagesFromUrl } from '@/helper/GetImagesHelper';
import { getUserFromTokenClient, removeAccessTokenClient, getAccessTokenClient } from '@/helper/UserTokenHelper';
import { LogoWithText } from '@/components/common/Logo';
import NotificationIcon from '@/components/NotificationIcon';

export default function HeaderPage() {
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);
    const [userInfo, setUserInfo] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [authToken, setAuthToken] = useState<string | null>(null);

    // Check for auth token changes (login/logout)
    useEffect(() => {
        const checkToken = () => {
            const token = getAccessTokenClient();
            setAuthToken(token);
        };

        // Check initially
        checkToken();

        // Set up interval to check token periodically
        const intervalId = setInterval(checkToken, 2000);

        // Listen for storage events (in case token is changed in another tab)
        const handleStorageChange = () => {
            checkToken();
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            clearInterval(intervalId);
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    // Fetch user info when auth token changes
    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                setIsLoading(true);
                if (!authToken) {
                    setUserInfo(null);
                    return;
                }

                const user = await getUserFromTokenClient();
                //@ts-ignore
                setUserInfo(user?.data);
            } catch (error) {
                console.error("Lỗi khi lấy thông tin user:", error);
                setUserInfo(null);
            } finally {
                setIsLoading(false);
            }
        };
        fetchUserInfo();
    }, [authToken]);

    // Listen for user profile updates
    useEffect(() => {
        const handleProfileUpdate = async () => {
            if (authToken) {
                try {
                    const user = await getUserFromTokenClient();
                    //@ts-ignore
                    setUserInfo(user?.data);
                } catch (error) {
                    console.error("Lỗi khi cập nhật thông tin user:", error);
                }
            }
        };

        // Listen for custom event
        window.addEventListener('userProfileUpdated', handleProfileUpdate);

        return () => {
            window.removeEventListener('userProfileUpdated', handleProfileUpdate);
        };
    }, [authToken]);

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    const handleLogout = () => {
        removeAccessTokenClient();
        setAuthToken(null);
        setUserInfo(null);
        setShowUserMenu(false);
        setMobileMenuOpen(false);
    };

    // Handle click outside for user menu
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setShowUserMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <header className="sticky top-0 z-40 bg-gradient-to-r from-white via-orange-50 to-white shadow-sm border-b border-gray-200">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Left section - Logo */}
                    <div className="flex items-center">
                        <Link href="/home">
                            <div className="flex items-center cursor-pointer">
                                <LogoWithText width={32} height={32} className="md:scale-110" />
                            </div>
                        </Link>
                    </div>

                    {/* Mobile menu button */}
                    <div className="flex md:hidden">
                        <button
                            onClick={toggleMobileMenu}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-orange-500"
                        >
                            <Menu className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Right section - desktop */}
                    <div className="hidden md:flex items-center space-x-4">
                        {isLoading ? (
                            <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
                        ) : userInfo ? (
                            <>
                                {/* Bookmark Button - Desktop */}
                                <Link
                                    href="/home/bookmarks"
                                    className="flex items-center space-x-1 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                                    aria-label="Bookmarks"
                                >
                                    <Bookmark size={18} className="text-gray-600" />
                                </Link>

                                {/* Notification Icon - Desktop */}
                                <NotificationIcon />

                                <div className="flex items-center space-x-3 relative" ref={userMenuRef}>
                                    <div className="flex items-center cursor-pointer">
                                        <Link href={`/home/profile`} className="flex items-center hover:opacity-80 transition-opacity">
                                            {userInfo.avatarUrl ? (
                                                <img
                                                    src={getImagesFromUrl(userInfo.avatarUrl)}
                                                    alt="User avatar"
                                                    className="h-8 w-8 rounded-full object-cover border-2 border-white shadow-sm"
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gradient-to-r from-orange-400 to-orange-500 text-white shadow-sm">
                                                    <User size={16} />
                                                </div>
                                            )}
                                        </Link>

                                        <button
                                            className="flex items-center ml-2 hover:bg-gray-100 rounded-full py-1 px-2"
                                            onClick={() => setShowUserMenu(!showUserMenu)}
                                        >
                                            <span className="text-sm font-medium text-gray-700">
                                                {userInfo.fullName || `${userInfo.firstName} ${userInfo.lastName}`}
                                            </span>
                                            <ChevronDown size={16} className={`ml-1 text-gray-500 transition-transform duration-200 ${showUserMenu ? 'transform rotate-180' : ''}`} />
                                        </button>
                                    </div>

                                    {/* User Dropdown Menu - Fixed positioning */}
                                    <div
                                        className={`absolute right-0 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50 transition-all duration-200 ${showUserMenu ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'}`}
                                        style={{ top: 'calc(100% + 0.5rem)' }}
                                    >
                                        <div className="py-2">
                                            <Link href="/home/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                                                <div className="flex items-center">
                                                    <User size={16} className="mr-2" />
                                                    Thông tin cá nhân
                                                </div>
                                            </Link>
                                            <Link href="/home/create-post" className="block px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 transition-colors">
                                                <div className="flex items-center">
                                                    <PenSquare size={16} className="mr-2" />
                                                    Tạo bài viết
                                                </div>
                                            </Link>
                                            <Link href="/home/bookmarks" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                                                <div className="flex items-center">
                                                    <Bookmark size={16} className="mr-2" />
                                                    Bài viết đã lưu
                                                </div>
                                            </Link>
                                            <button
                                                onClick={handleLogout}
                                                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                            >
                                                <div className="flex items-center">
                                                    <LogOut size={16} className="mr-2" />
                                                    Đăng xuất
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center space-x-3">
                                <Link href="/home/login" className="flex items-center space-x-2 px-4 py-2 rounded-md bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 transition-colors shadow-sm">
                                    <LogIn size={16} />
                                    <span>Đăng nhập</span>
                                </Link>
                                <Link href="/home/register" className="flex items-center space-x-2 px-4 py-2 rounded-md border border-orange-500 text-orange-600 hover:bg-orange-50 transition-colors">
                                    <span>Đăng ký</span>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Right section - mobile, only show login or avatar */}
                    <div className="flex md:hidden items-center">
                        {isLoading ? (
                            <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
                        ) : userInfo ? (
                            <Link href={`/home/profile`} className="flex items-center space-x-3">
                                {userInfo.avatarUrl ? (
                                    <img
                                        src={getImagesFromUrl(userInfo.avatarUrl)}
                                        alt="User avatar"
                                        className="h-8 w-8 rounded-full object-cover border-2 border-white shadow-sm"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gradient-to-r from-orange-400 to-orange-500 text-white shadow-sm">
                                        <User size={16} />
                                    </div>
                                )}
                            </Link>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <Link href="/home/login" className="flex items-center space-x-1 px-3 py-1 rounded-md bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 transition-colors shadow-sm">
                                    <LogIn size={14} />
                                    <span className="text-sm">Đăng nhập</span>
                                </Link>
                                <Link href="/home/register" className="flex items-center px-3 py-1 rounded-md border border-orange-500 text-orange-600 hover:bg-orange-50 transition-colors">
                                    <span className="text-sm">Đăng ký</span>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile menu dropdown */}
                {mobileMenuOpen && (
                    <div className="md:hidden bg-white pt-2 pb-3">
                        {/* Mobile menu items */}
                        {userInfo ? (
                            <div className="pt-2">
                                <div className="flex items-center px-4 py-2 text-sm text-gray-700">
                                    <span className="font-medium">Xin chào, {userInfo.firstName} {userInfo.lastName}</span>
                                </div>

                                {/* Create Post - Mobile */}
                                <Link
                                    href="/home/create-post"
                                    className="block w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 transition-colors"
                                >
                                    <div className="flex items-center">
                                        <PenSquare size={16} className="mr-2" />
                                        Tạo bài viết
                                    </div>
                                </Link>

                                <Link
                                    href="/home/bookmarks"
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                >
                                    <div className="flex items-center">
                                        <Bookmark size={16} className="mr-2" />
                                        Bài viết đã lưu
                                    </div>
                                </Link>

                                {/* Notification Icon - Mobile */}
                                <div className="px-4 py-2">
                                    <NotificationIcon />
                                </div>

                                <Link href="/home/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                                    <div className="flex items-center">
                                        <User size={16} className="mr-2" />
                                        Thông tin cá nhân
                                    </div>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                >
                                    <div className="flex items-center">
                                        <LogOut size={16} className="mr-2" />
                                        Đăng xuất
                                    </div>
                                </button>
                            </div>
                        ) : (
                            <div className="pt-2 px-4 space-y-2">
                                <Link
                                    href="/home/login"
                                    className="block w-full text-center py-2 rounded-md bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 transition-colors"
                                >
                                    Đăng nhập
                                </Link>
                                <Link
                                    href="/home/register"
                                    className="block w-full text-center py-2 rounded-md border border-orange-500 text-orange-600 hover:bg-orange-50 transition-colors"
                                >
                                    Đăng ký
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
}
