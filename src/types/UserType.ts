export interface UserProfileResponseType {
    userId: number;
    email: string;
    fullName: string;
    roleName: string;
    avatarUrl: string;
    isActive: boolean;
    createdAt: string;
}

export interface UserInformationResponseType {
    avatarUrl: string,
    fullName: string,
    bio: string,
    address: string,
    phoneNumber: string,
    dateOfBirth: Date,
    gender: string,
    isProfilePublic: boolean,
    createdAt: Date,
    postCount: number,
    commentCount: number,
    likeCount: number,
    roleName: string,
    email: string,
    isActive: boolean,
}

export interface UserInformationRequestType {
    firstName?: string,
    lastName?: string,
    bio?: string,
    address?: string,
    phoneNumber?: string,
    dateOfBirth?: Date,
    gender?: string,
    isProfilePublic?: boolean,
    avatarFile?: File,
}

export interface UserFormData {
    avatarUrl: File | null,
    fullName: string | '',
    bio: string | '',
    address: string | '',
    phoneNumber: string | '',
    dateOfBirth: string | '',
    gender: string | '',
    isProfilePublic: boolean | false,
    email: string | '',
    roleName: string | '',
}

export interface UserChangesByAdminRequestType {
    userId: number;
    email: string;
    password: string;
    roleId: number;
    isActive: boolean;
}

export interface AdvancedSearchUserRequestType {
    roleId?: number;
    isActive?: boolean;
    name?: string;
    email?: string;
}

export interface AddUserByAdminRequestType {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    roleId: number;
    isActive: boolean;
}

export interface PostManagementResponseType {
    postId: number;
    categoryName: string;
    title: string;
    content: string;
    status: string;
    isScam: boolean;
    confidenceScore: number;
    createdAt: string;
    updatedAt: string;
    fullName: string;
    avatarUrl: string;
    likeCount: number;
    commentCount: number;
}

export interface PostManagementRequestType {
    status?: string;
    title?: string;
}