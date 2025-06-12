import axios from 'axios';

const serverApi = {
    get: async <T = any>(url: string): Promise<ApiResponse<T>> => {
        try {
            const res = await axios.get<ApiResponse<T>>(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
                headers: { 'Content-Type': 'application/json' }
            });
            return res.data;
        } catch (err) {
            console.log('Server API Error:', err);
            throw err;
        }
    },

    post: async <T = any>(url: string, data: any): Promise<ApiResponse<T>> => {
        try {
            const res = await axios.post<ApiResponse<T>>(`${process.env.NEXT_PUBLIC_API_URL}${url}`, data, {
                headers: { 'Content-Type': 'application/json' }
            });
            return res.data;
        } catch (err) {
            console.log('Server API Error:', err);
            throw err;
        }
    }
};

export default serverApi;
