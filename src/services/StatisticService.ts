import adminApi from "@/lib/AdminApi";
import { CountAllStatisticType, StatisticsResponseType } from "@/types/StatisticType";

export const getCountAllStatistic = async (): Promise<CountAllStatisticType> => {
    const response = await adminApi.get("/statistic/count");
    return response.data;
};

export const getLastestActivity = async (): Promise<StatisticsResponseType[]> => {
    const response = await adminApi.get("/statistic/activity");
    return response.data;
};
