import { FastifyReply, FastifyRequest } from "fastify";
import { ChatService } from "./chat.service";

export class ChatController {
    constructor(private chatService: ChatService) {}

    getMyChats = async (req: FastifyRequest, res: FastifyReply) => {
        const chats = await this.chatService.getUserChats(req.user.id);
        return res.status(200).send(chats);
    };

    getHistory = async (req: FastifyRequest<{ Params: { orderId: string } }>, res: FastifyReply) => {
        const chat = await this.chatService.findOrCreateChatByOrder(req.params.orderId);
        if (!chat) return res.status(404).send({ message: "Чат еще не создан или исполнитель не выбран" });

        const messages = await this.chatService.getChatHistory(chat.id);
        return res.status(200).send(messages);
    };
}