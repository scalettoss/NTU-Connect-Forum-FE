"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { PlusCircle, X, Upload, FileText, AlertCircle, Sparkles, ChevronDown } from 'lucide-react';
import { createPost } from '@/services/PostService';
import { getAllCategoryNameForDropdown } from '@/services/CategoryService';
import { CategoryNameResponseType } from '@/types/CategoryType';
import ToastService from '@/services/ToastService';
import FileIcon from '@/components/common/FileIcon';

// CategoryOption now matches CategoryNameResponseType
type CategoryOption = CategoryNameResponseType;

const ALLOWED_FILE_TYPES = [
    ".jpg", ".jpeg", ".png", ".pdf", ".docx", ".txt",
    ".xlsx", ".pptx", ".mp3", ".gif"
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILES = 5;

const CreatePostForm: React.FC = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [categoryId, setCategoryId] = useState<number | null>(null);
    const [categories, setCategories] = useState<CategoryOption[]>([]);
    const [files, setFiles] = useState<File[]>([]);
    const [errors, setErrors] = useState<{
        title?: string;
        content?: string;
        categoryId?: string;
        files?: string;
    }>({});
    const [isLoading, setIsLoading] = useState(false);
    const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    // Fetch categories on component mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setIsCategoriesLoading(true);
                const response = await getAllCategoryNameForDropdown();
                // Handle the API response as a simple array
                if (response) {
                    // Force type as CategoryNameResponseType[]
                    const categoryData = response.data;
                    //@ts-ignore
                    setCategories(categoryData);
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
                ToastService.error('Không thể tải danh mục');
            } finally {
                setIsCategoriesLoading(false);
            }
        };

        fetchCategories();
    }, []);

    const validateForm = () => {
        const newErrors: {
            title?: string;
            content?: string;
            categoryId?: string;
            files?: string;
        } = {};

        if (!title.trim()) {
            newErrors.title = 'Vui lòng nhập tiêu đề';
        } else if (title.length < 3) {
            newErrors.title = 'Tiêu đề phải có ít nhất 3 ký tự';
        }

        if (!content.trim()) {
            newErrors.content = 'Vui lòng nhập nội dung';
        } else if (content.length < 10) {
            newErrors.content = 'Nội dung phải có ít nhất 10 ký tự';
        }

        if (categoryId === null) {
            newErrors.categoryId = 'Vui lòng chọn danh mục';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || []);

        if (selectedFiles.length + files.length > MAX_FILES) {
            ToastService.warning(`Bạn chỉ có thể tải lên tối đa ${MAX_FILES} tệp`);
            return;
        }

        // Validate file types and sizes
        const invalidFiles: string[] = [];
        const validFiles: File[] = [];

        selectedFiles.forEach(file => {
            const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

            if (!ALLOWED_FILE_TYPES.includes(fileExtension)) {
                invalidFiles.push(`${file.name} (định dạng không được hỗ trợ)`);
            } else if (file.size > MAX_FILE_SIZE) {
                invalidFiles.push(`${file.name} (vượt quá 10MB)`);
            } else {
                validFiles.push(file);
            }
        });

        if (invalidFiles.length > 0) {
            ToastService.error(`Các tệp không hợp lệ: ${invalidFiles.join(', ')}`);
        }

        if (validFiles.length > 0) {
            setFiles(prevFiles => [...prevFiles, ...validFiles]);
        }

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const removeFile = (index: number) => {
        setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    };

    const getFileTypeIcon = (fileName: string): string => {
        const extension = fileName.split('.').pop()?.toLowerCase() || '';

        if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) return 'image';
        if (extension === 'pdf') return 'pdf';
        if (['doc', 'docx'].includes(extension)) return 'word';
        if (['xls', 'xlsx'].includes(extension)) return 'excel';
        if (['ppt', 'pptx'].includes(extension)) return 'presentation';
        if (extension === 'mp3') return 'audio';

        return 'other';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            // Scroll to the first error
            const firstError = document.querySelector('.error-message');
            firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        setIsLoading(true);

        try {
            // Prepare form data
            const formData = new FormData();
            formData.append('title', title);
            formData.append('content', content);
            formData.append('categoryId', categoryId!.toString());

            // Fix: Use "files" as the key and append each file one by one
            for (let i = 0; i < files.length; i++) {
                formData.append('files', files[i]);
            }

            await createPost(formData);

            ToastService.success('Tạo bài viết thành công. Xin vui lòng đợi phê duyệt');

            router.push('/home');

        } catch (error) {
            console.error('Error creating post:', error);
            ToastService.error('Không thể tạo bài viết. Vui lòng thử lại sau.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6 md:p-8 overflow-hidden relative">
            {/* Background pattern */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 opacity-50 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-orange-50 opacity-50 rounded-full -ml-20 -mb-20"></div>

            <div className="relative">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 flex items-center">
                    <Sparkles className="mr-2 text-blue-500" size={24} />
                    Tạo bài viết mới
                </h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Title Field */}
                    <div className="group">
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1 group-focus-within:text-blue-600 transition-colors">
                            Tiêu đề <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className={`w-full px-4 py-3 border ${errors.title ? 'border-red-300 bg-red-50' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm`}
                            placeholder="Nhập tiêu đề bài viết"
                        />
                        {errors.title && (
                            <p className="mt-1.5 text-sm text-red-600 flex items-center error-message">
                                <AlertCircle size={16} className="mr-1 flex-shrink-0" />
                                {errors.title}
                            </p>
                        )}
                    </div>

                    {/* Category Dropdown */}
                    <div className="group">
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1 group-focus-within:text-blue-600 transition-colors">
                            Danh mục <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <select
                                id="category"
                                value={categoryId || ''}
                                onChange={(e) => setCategoryId(Number(e.target.value))}
                                disabled={isCategoriesLoading}
                                className={`w-full appearance-none px-4 py-3 border ${errors.categoryId ? 'border-red-300 bg-red-50' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm`}
                            >
                                <option value="">Chọn danh mục</option>
                                {categories.map((category) => (
                                    <option key={category.categoryId} value={category.categoryId}>
                                        {/* @ts-ignore */}
                                        {category.categoryName}
                                    </option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                <ChevronDown size={16} className="mr-1" />
                            </div>
                        </div>
                        {errors.categoryId && (
                            <p className="mt-1.5 text-sm text-red-600 flex items-center error-message">
                                <AlertCircle size={16} className="mr-1 flex-shrink-0" />
                                {errors.categoryId}
                            </p>
                        )}
                    </div>

                    {/* Content Field */}
                    <div className="group">
                        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1 group-focus-within:text-blue-600 transition-colors">
                            Nội dung <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            id="content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={6}
                            className={`w-full px-4 py-3 border ${errors.content ? 'border-red-300 bg-red-50' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm`}
                            placeholder="Nhập nội dung bài viết"
                        />
                        {errors.content && (
                            <p className="mt-1.5 text-sm text-red-600 flex items-center error-message">
                                <AlertCircle size={16} className="mr-1 flex-shrink-0" />
                                {errors.content}
                            </p>
                        )}
                    </div>

                    {/* File Attachments */}
                    <div className="group bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <label className="block text-sm font-medium text-gray-800 mb-2">
                            <Upload size={18} className="inline-block mr-1" />
                            Tệp đính kèm (tối đa {MAX_FILES} tệp, mỗi tệp không quá 10MB)
                        </label>

                        {/* File list */}
                        {files.length > 0 && (
                            <div className="mb-4 space-y-2.5 mt-3">
                                {files.map((file, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center bg-white rounded-lg p-2 border border-blue-100 shadow-sm hover:shadow-md transition-shadow"
                                    >
                                        <div className="mr-2 flex-shrink-0">
                                            <FileIcon fileType={getFileTypeIcon(file.name)} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                                            <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeFile(index)}
                                            className="p-1.5 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors"
                                            aria-label="Remove file"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* File upload button */}
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className={`group flex items-center px-4 py-2.5 text-blue-600 bg-white border border-blue-200 rounded-lg hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all duration-200 shadow-sm ${files.length >= MAX_FILES ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={files.length >= MAX_FILES}
                        >
                            <Upload size={18} className="mr-2 group-hover:animate-bounce" />
                            <span>Tải lên tệp đính kèm</span>
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            onChange={handleFileChange}
                            multiple
                            className="hidden"
                            accept={ALLOWED_FILE_TYPES.join(',')}
                        />
                        <p className="mt-2 text-xs text-gray-600">
                            Định dạng hỗ trợ: {ALLOWED_FILE_TYPES.join(', ')}
                        </p>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full px-6 py-3.5 text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Đang tạo bài viết...
                                </div>
                            ) : (
                                <div className="flex items-center justify-center">
                                    <PlusCircle size={20} className="mr-2" />
                                    Tạo bài viết mới
                                </div>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreatePostForm; 