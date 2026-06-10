import { Server, Socket } from "socket.io";
import { AwilixContainer } from "awilix";

export class ChatGateway {
    constructor(private io: Server, private diContainer: AwilixContainer) {}

    init() {
        this.io.on("connection", (socket: Socket) => {
            const userId = socket.data?.userId;
            if (!userId) return;

            // Джойним юзера в его личную комнату для глобальных алертов
            socket.join(`user_${userId}`);

            this.handleJoinWorkspace(socket, userId);
            this.handleSendMessage(socket, userId);
        });
    }

    private handleJoinWorkspace(socket: Socket, userId: string) {
        socket.on("join_workspace", async (data: { orderId: string }) => {
            // Берем сервисы из DI контейнера изолированно
            const scope = this.diContainer.createScope();
            const chatService = (scope.cradle as any).chatService;

            try {
                const chat = await chatService.findOrCreateChatByOrder(data.orderId);
                if (!chat) return; // Если исполнитель еще не выбран, чата нет

                // Подключаем сокет к комнате конкретного заказа
                socket.join(`workspace_${data.orderId}`);

                // Отдаем историю сообщений
                const messages = await chatService.getChatHistory(chat.id);
                const history = messages.map((msg: any) => ({
                    id: msg.id,
                    text: msg.content,
                    isSystem: msg.isSystem,
                    sentAt: msg.createdAt,
                    sender: msg.isSystem ? null : {
                        id: msg.sender?.id,
                        name: msg.sender?.displayedName || msg.sender?.name
                    }
                }));

                socket.emit("workspace_history", history);
            } catch (e) {
                console.error("Ошибка при входе в рабочую область:", e);
            } finally {
                await scope.dispose();
            }
        });
    }

    private handleSendMessage(socket: Socket, userId: string) {
        socket.on("send_message", async (data: { orderId: string; content: string }) => {
            const scope = this.diContainer.createScope();
            const chatService = (scope.cradle as any).chatService;

            try {
                const chat = await chatService.findOrCreateChatByOrder(data.orderId);
                if (!chat) return;

                // Сохраняем сообщение
                const savedMsg = await chatService.saveMessage(chat.id, userId, data.content, false);

                // Получаем пользователя, чтобы прикрепить его имя (можно добавить метод getUserById в userService)
                const userService = (scope.cradle as any).userService;
                const user = await userService.getUserById(userId);

                // Рассылаем всем в рабочей области
                this.io.to(`workspace_${data.orderId}`).emit("new_message", {
                    id: savedMsg.id,
                    text: savedMsg.content,
                    isSystem: false,
                    sentAt: savedMsg.createdAt,
                    sender: {
                        id: userId,
                        name: user?.displayedName || user?.name || "Пользователь"
                    }
                });
            } catch (e) {
                console.error("Ошибка при отправке сообщения:", e);
            } finally {
                await scope.dispose();
            }
        });
    }
}