import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

// export const getSocket = () => {
//     if (!socket) {
//         socket = io(import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '') || "http://localhost:3000", {
//             path: '/api/v1/socket.io',
//             withCredentials: true, // ВАЖНО: отправляем куки на бэкенд
//             autoConnect: false,
//             transports: ['websocket', 'polling']
//         });
//     }
//     return socket;
// };

export const getSocket = () => {
    if (!socket) {
        socket = io(import.meta.env.DEV ? '' : (import.meta.env.VITE_SOCKET_URL || ''), {
            path: '/api/v1/socket.io',
            withCredentials: true,
            autoConnect: false,
            transports: ['websocket', 'polling']
        });
    }
    return socket;
};