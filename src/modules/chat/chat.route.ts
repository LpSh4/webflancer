import {FastifyInstance, FastifyRequest} from "fastify";
import {authenticate} from "../auth/auth.middleware";
import {chatHistorySchema} from "./chat.schema";

export async function chatRoutes(fastify: FastifyInstance) {
    const resolve = (req: FastifyRequest) => req.diScope.cradle.chatController;

    // Получить все свои чаты
    fastify.get("/", {preHandler: [authenticate]}, async (req, res) => {
        return resolve(req).getMyChats(req, res);
    });

    // Получить историю конкретного чата (по REST, если не хочется через сокеты)
    fastify.get("/history/:orderId", {
        preHandler: [authenticate],
        schema: chatHistorySchema
    }, async (req: any, res) => {
        return resolve(req).getHistory(req, res);
    });
}