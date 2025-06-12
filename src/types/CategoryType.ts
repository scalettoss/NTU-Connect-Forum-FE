export interface CategoryResponseType {
    categoryId: number;
    slug: string;
    name: string;
    description: string;
    createdAt: string;
    updatedAt?: number;
    countTotalPost?: number;
}

export interface CategoryNameResponseType {
    name: string;
    categoryId: number;
}

export interface AddCategoryRequestType {
    name: string;
    description: string;
}

export interface UpdateCategoryRequestType {
    name?: string;
    description?: string;
}
