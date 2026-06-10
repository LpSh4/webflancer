import { asClass } from "awilix";
import { ChatController } from "./chat.controller";
import { ChatService } from "./chat.service";

export const ChatContainer = {
    chatController: asClass(ChatController).scoped().classic(),
    chatService: asClass(ChatService).scoped().classic(),
};
