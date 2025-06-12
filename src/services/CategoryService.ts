import { AddCategoryRequestType, CategoryNameResponseType, CategoryResponseType, UpdateCategoryRequestType } from '@/types/CategoryType';
import serverApi from '@/lib/ServerApi';
import adminApi from '@/lib/AdminApi';
import { PaginationRequestType, PaginationResponseType } from '@/types/PaginationType';

export const getAllCategory = async () => {
    return await serverApi.get<CategoryResponseType>("/category");
};

export const getAllCategoryByAdmin = async (pagination?: PaginationRequestType) => {
    const response = await adminApi.get<PaginationResponseType<CategoryResponseType>>("/category", pagination);
    //@ts-ignore
    return response.data;
};

export const getCategoryById = async (id: string) => {
    return await serverApi.get<CategoryResponseType>(`/category/${id}`);
};

export const getCategoryBySlug = async (slug: string) => {
    return await serverApi.get<CategoryResponseType>(`/category/slug/${slug}`);
};

export const getAllCategoryNameForDropdown = async () => {
    return await serverApi.get<CategoryNameResponseType[]>(`/category/name`);
};

export const addCategory = async (data: AddCategoryRequestType) => {
    return await adminApi.post<void>("/category", data);
};

export const updateCategory = async (id: string, data: UpdateCategoryRequestType) => {
    return await adminApi.put<void>(`/category/${id}`, data);
}

export const deleteCategory = async (id: string) => {
    return await adminApi.delete<void>(`/category/${id}`);
}
