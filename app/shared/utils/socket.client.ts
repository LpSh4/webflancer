import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = () => {
    if (!socket) {
        // Если мы в DEV-режиме — шлем пустую строку (работает прокси Vite)
        // Если в PROD — берем VITE_SOCKET_URL, а если она пустая, жестко подставляем прод-домен бэка
        const targetUrl = import.meta.env.DEV
            ? ''
            : (import.meta.env.VITE_SOCKET_URL || 'https://backend.ryban.ru');

        socket = io(targetUrl, {
            path: '/api/v1/socket.io',
            withCredentials: true,
            autoConnect: false,
            transports: ['websocket', 'polling']
        });
    }
    return socket;
};