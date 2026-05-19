import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = (token: string) => {
    if (!socket) {
        // Укажи тут URL твоего бэкенда (убедись, что порт правильный, 3000 или 3004!)
        socket = io(import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '') || "http://localhost:3000", {
            path: '/api/v1/socket.io',
            auth: { token },
            autoConnect: false,
            transports: ['websocket'] // 🔥 ЗАСТАВЛЯЕМ использовать только WebSockets
        });
    }
    return socket;
};