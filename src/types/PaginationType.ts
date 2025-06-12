export interface PaginationRequestType {
    PageNumber: number;
    PageSize: number;
    SortBy?: string;
}

export interface PaginationResponseType<T> {
    currentPage: number,
    totalPages: number,
    pageSize: number,
    totalCount: number,
    hasNext: boolean,
    hasPrevious: boolean,
    items: T[]
}
