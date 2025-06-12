export interface CreateReportPostRequestType {
    postId: number,
    reason: string
}

export interface ReportPostResponseType {
    reportId: number,
    postId: number,
    fullName: string,
    avatarUrl: string,
    title: string,
    content: string,
    reason: string,
    status: string,
    createdAt: string,
}

export interface HandleReportPostRequestType {
    reportId: number,
    status: 'pending' | 'resolved' | 'rejected'
}
