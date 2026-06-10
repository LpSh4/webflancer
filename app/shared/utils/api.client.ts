import axios from "axios";
import type { AxiosInstance } from "axios";

// export const apiClient: AxiosInstance = axios.create({
//     baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1',
//     withCredentials: true,
//     headers: {
//         "Content-Type": "application/json",
//     },
// });
export const apiClient: AxiosInstance = axios.create({
    baseURL: '/api/v1',
    // baseURL: import.meta.env.VITE_API_BASE_URL
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});