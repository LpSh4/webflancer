import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = () => {
    if (!socket) {
        // Пустая строка заставит сокет слать запросы на http://localhost:5173/api/v1/socket.io
        // А Vite проксирует это на http://0.0.0.0:3000/api/v1/socket.io благодаря твоим настройкам в vite.config.ts
        socket = io(import.meta.env.DEV ? '' : (import.meta.env.VITE_SOCKET_URL || ''), {
            path: '/api/v1/socket.io',
            withCredentials: true,
            autoConnect: false,
            transports: ['websocket', 'polling']
        });
    }
    return socket;
};