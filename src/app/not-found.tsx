'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function NotFound() {
    const router = useRouter();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-white to-blue-50 px-4 py-16">
            <motion.div
                className="text-center max-w-2xl"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.6, type: "spring" }}
                    className="mb-8"
                >
                    <div className="relative mx-auto w-72 h-72 md:w-96 md:h-96">
                        <svg viewBox="0 0 240 240" className="w-full h-full">
                            <circle cx="120" cy="120" r="100" fill="#EBF4FF" />
                            <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" className="font-extrabold" fontSize="110" fill="#3B82F6">
                                404
                            </text>
                        </svg>
                        <motion.div
                            className="absolute -top-6 -right-6"
                            animate={{
                                rotate: [0, 10, 0, -10, 0],
                                y: [0, -5, 0, -5, 0]
                            }}
                            transition={{
                                repeat: Infinity,
                                duration: 5,
                                ease: "easeInOut"
                            }}
                        >
                            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="#FEF3C7" stroke="#FBBF24" strokeWidth="1.5" />
                                <path d="M9 15.5H15M9 8.5H9.01M15 8.5H15.01" stroke="#B45309" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                        </motion.div>
                    </div>
                </motion.div>

                <h2 className="text-3xl font-bold text-gray-800 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                    Không Tìm Thấy Trang
                </h2>

                <motion.p
                    className="text-lg text-gray-600 mb-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                >
                    Oops! Có vẻ như bạn đã đi vào vùng lãnh thổ chưa được khám phá.
                    <br className="hidden md:block" />
                    Trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển.
                </motion.p>

                <motion.div
                    className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                >
                    <button
                        onClick={() => router.back()}
                        className="group relative px-6 py-3 text-base font-medium text-white bg-blue-600 rounded-lg overflow-hidden shadow-lg hover:shadow-blue-200 transition-all duration-300 w-full sm:w-auto"
                    >
                        <span className="absolute inset-0 w-0 bg-blue-800 transition-all duration-300 ease-out group-hover:w-full"></span>
                        <span className="relative flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                            </svg>
                            Quay Lại
                        </span>
                    </button>
                    <Link
                        href="/home"
                        className="group relative px-6 py-3 text-base font-medium text-blue-600 bg-white border border-blue-200 rounded-lg overflow-hidden shadow-sm hover:shadow-blue-100 transition-all duration-300 w-full sm:w-auto"
                    >
                        <span className="absolute inset-0 w-0 bg-blue-50 transition-all duration-300 ease-out group-hover:w-full"></span>
                        <span className="relative flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                            </svg>
                            Về Trang Chủ
                        </span>
                    </Link>
                </motion.div>
            </motion.div>
        </div>
    );
} 