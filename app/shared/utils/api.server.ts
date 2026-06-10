import axios from "axios";
import type { AxiosInstance } from "axios";

export const api: AxiosInstance = axios.create({
    baseURL: process.env.API_BASE_URL || 'http://localhost:3000/api/v1',
    headers: {
        "Content-Type": "application/json",
    }
});