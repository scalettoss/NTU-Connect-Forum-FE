'use client'

import React, { useEffect, useState } from 'react'
import { updateCategory } from '@/services/CategoryService'
import ToastService from '@/services/ToastService'
import { CategoryResponseType } from '@/types/CategoryType'

interface UpdateCategoryModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    category: CategoryResponseType
}

export default function UpdateCategoryModal({
    isOpen,
    onClose,
    onSuccess,
    category,
}: UpdateCategoryModalProps) {
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (category) {
            setName(category.name)
            setDescription(category.description || '')
        }
    }, [category])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!name.trim()) {
            ToastService.error('Vui lòng nhập tên danh mục')
            return
        }

        try {
            setIsLoading(true)
            await updateCategory(category.categoryId.toString(), {
                name: name.trim(),
                description: description.trim()
            })

            ToastService.success('Cập nhật danh mục thành công')
            onSuccess()
            onClose()
        } catch (error) {
            console.error('Error updating category:', error)
            ToastService.error('Có lỗi xảy ra khi cập nhật danh mục')
        } finally {
            setIsLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-md shadow-xl">
                <div className="p-6">
                    <h2 className="text-lg font-semibold mb-4">Cập nhật danh mục</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                    Tên danh mục
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Nhập tên danh mục"
                                    disabled={isLoading}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                    Mô tả
                                </label>
                                <textarea
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Nhập mô tả cho danh mục"
                                    disabled={isLoading}
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isLoading}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                {isLoading ? 'Đang cập nhật...' : 'Cập nhật'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
} 