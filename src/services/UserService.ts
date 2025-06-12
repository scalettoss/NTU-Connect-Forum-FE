import {
    UserProfileResponseType, UserInformationResponseType,
    UserInformationRequestType, UserChangesByAdminRequestType,
    AdvancedSearchUserRequestType, AddUserByAdminRequestType,
    PostManagementResponseType, PostManagementRequestType
} from '@/types/UserType';
import clientApi from '@/lib/ClientApi';
import adminApi from '@/lib/AdminApi';
import { PaginationRequestType, PaginationResponseType } from '@/types/PaginationType';

export const getUserProfile = async (id: number) => {
    return await clientApi.get<UserProfileResponseType>(`/user/${id}`);
};

export const getUserInformation = async (id: number) => {
    const response = await clientApi.get<UserInformationResponseType>(`/user/information/${id}`);
    //@ts-ignore
    return response.data;
}

export const updateUserInformation = async (id: number, data: UserInformationRequestType | FormData) => {
    const isFormData = data instanceof FormData;
    return await clientApi.put<UserInformationResponseType>(`/user/${id}`, data, isFormData);
};

export const updateUserChangesByAdmin = async (data: UserChangesByAdminRequestType): Promise<void> => {
    return await adminApi.post<void>(`/user/by-admin`, data);
};

export const getUserByName = async (name: string) => {
    // Using the search endpoint to find a user by name
    return await clientApi.get<UserProfileResponseType>('/user/search', { query: name });
};


export const getAllUser = async (pagination?: PaginationRequestType): Promise<PaginationResponseType<UserProfileResponseType>> => {
    const response = await adminApi.get<PaginationResponseType<UserProfileResponseType>>("/user", pagination);
    //@ts-ignore
    return response.data;
};

export const deleteUser = async (id: number): Promise<void> => {
    return await adminApi.delete<void>(`/user/${id}`);
};

export const advancedSearchUser = async (data: AdvancedSearchUserRequestType, pagination?: PaginationRequestType): Promise<PaginationResponseType<UserProfileResponseType>> => {
    const response = await adminApi.post<PaginationResponseType<UserProfileResponseType>>("/user/by-condition", data, pagination);
    //@ts-ignore
    return response.data;
};

export const addUserByAdmin = async (data: AddUserByAdminRequestType): Promise<void> => {
    return await adminApi.post<void>("/user/add-user", data);
};

export const getPostManagement = async (
    pagination?: PaginationRequestType,
    queryParams?: string,
    body?: { title?: string; status?: string }
): Promise<PaginationResponseType<PostManagementResponseType>> => {
    const response = await adminApi.post<PaginationResponseType<PostManagementResponseType>>(
        `/post/by-admin${queryParams ? `?${queryParams}` : ''}`,
        body,
        pagination
    );
    //@ts-ignore
    return response.data;
};
