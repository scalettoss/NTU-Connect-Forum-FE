interface PaginatedResponse<T> {
    status: number;
    message: string;
    data: {
        currentPage: number;
        totalPages: number;
        pageSize: number;
        totalCount: number;
        hasPrevious: boolean;
        hasNext: boolean;
        items: T[];
    };
}

interface NonPaginatedResponse<T> {
    status: number;
    message: string;
    data: T[];
}

type ApiResponse<T> = PaginatedResponse<T> | NonPaginatedResponse<T>;