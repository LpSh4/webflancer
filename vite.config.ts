import {reactRouter} from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import {defineConfig} from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
    plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
    ssr: {
        noExternal: ["lucide-react"],
    },
    server: {
        proxy: {
            '/api': {
                // Если тестируешь локально — шлем на 3000, если нет — на прод
                target: process.env.VITE_API_BASE_URL ? 'http://localhost:3000' : 'https://backend.ryban.ru',
                changeOrigin: true,
                secure: false,
            },
            '/api/v1/socket.io': {
                target: 'http://localhost:3000', // Локальный сервер Fastify
                changeOrigin: true,
                secure: false,
                ws: true, // Включает поддержку вебсокетов в прокси Vite
            }
        }
    }
});