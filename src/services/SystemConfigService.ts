import adminApi from "@/lib/AdminApi";
import { setAutoApprovedConfigRequestType } from "@/types/SystemConfigType";

export const getAutoConfig = async () => {
    return await adminApi.get<boolean>('systemconfig/get-auto-approved');
};

export const setAutoConfig = async (data: setAutoApprovedConfigRequestType) => {
    return await adminApi.post<void>('systemconfig/set-auto-approved', data);
};