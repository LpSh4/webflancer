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
                target: 'https://backend.ryban.ru',
                changeOrigin: true,
                secure: false,
            },
            '/api/v1/socket.io': {
                target: 'https://backend.ryban.ru',
                changeOrigin: true,
                secure: false,
                ws: true,
            }
        }
    }
});
