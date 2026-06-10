import {FastifyInstance, FastifyPluginAsync} from "fastify";
import fp from "fastify-plugin";
import cors from "@fastify/cors";

const corsPlugin: FastifyPluginAsync = async (fastify: FastifyInstance) => {
    await fastify.register(cors, {
        // origin: [
        //     "https://ryban.ru",
        //     "https://www.ryban.ru",
        //     "http://localhost:3000",
        //     "http://localhost:5173",
        //     "http://127.0.0.1:3000",
        //     "http://127.0.0.1:5173",
        // ],
        origin: true,
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    });
};

export default fp(corsPlugin);
