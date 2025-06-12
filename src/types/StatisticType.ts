export type CountAllStatisticType = {
    totalUsers: number;
    totalPosts: number;
    totalComments: number;
    totalCategories: number;
    totalReports: number;
    totalUploadFiles: number;
};

export type StatisticsResponseType = {
    fullName: string;
    description: string;
    createdAt: Date;
};