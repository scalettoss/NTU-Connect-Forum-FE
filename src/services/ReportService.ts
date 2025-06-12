import adminApi from "@/lib/AdminApi";
import { CreateReportPostRequestType, HandleReportPostRequestType, ReportPostResponseType } from "../types/ReportType";
import clientApi from "@/lib/ClientApi";
import { PaginationRequestType, PaginationResponseType } from "@/types/PaginationType";


export const createReportPost = async (data: CreateReportPostRequestType) => {
    return await clientApi.post<void>('/report', data);
};

export const getAllReportPost = async (pagination?: PaginationRequestType) => {
    const response = await adminApi.get<PaginationResponseType<ReportPostResponseType>>(`/report`, pagination);
    // @ts-ignore
    return response.data;
};

export const getDetailReportPost = async (id: number) => {
    const response = await adminApi.get<ReportPostResponseType>(`/report/${id}`);
    // @ts-ignore
    return response.data;
};

export const handleReportPost = async (data: HandleReportPostRequestType) => {
    return await adminApi.post<void>(`/report/handle`, data);
};