import axios from "axios";
import type { AxiosInstance } from "axios";

// Determine the base URL dynamically but accurately for local host development
const getBaseURL = () => {
    if (typeof window !== 'undefined') {
        // Browser context
        return import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';
    } else {
        // Node Server (SSR) context
        // If API_BASE_URL isn't set in your terminal shell or .env, force it to localhost:3000 instead of docker 'server:3000'
        return process.env.API_BASE_URL || 'http://127.0.0.1:3000/api/v1';
    }
};

export const apiClient: AxiosInstance = axios.create({
    baseURL: getBaseURL(),
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});