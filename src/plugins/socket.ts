import { FastifyInstance, FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import { Server } from "socket.io";
import config from "../config";

declare module "fastify" {
  interface FastifyInstance {
    io: Server;
  }
}

const ioPlugin: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  const io = new Server(fastify.server, {
    path: "/api/v1/socket.io",
    cors: {
      // Передаем функцию валидации origin, которая пропустит и фронтенд, и локальную разработку
      origin: (requestOrigin, callback) => {
        const allowedOrigins = [
          config.frontendUrl, // Теперь тут "http://localhost:5173"
          "https://ryban.ru",
          "http://localhost:3000",
          "http://localhost:5173", // На всякий случай дублируем явным образом
          "http://127.0.0.1:5173", // Для поддержки IPv4 путей Vite
        ];

        // Если запрос без origin (например, мобильное приложение или curl), либо он в списке разрешенных
        if (!requestOrigin || allowedOrigins.includes(requestOrigin)) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      methods: ["GET", "POST"],
      credentials: true, // Важно для стабильного удержания сессии socket.io через прокси
    },
  });

  fastify.decorate("io", io);

  fastify.addHook("onClose", (fastify, done) => {
    fastify.io.close();
    done();
  });
};

export default fp(ioPlugin);
