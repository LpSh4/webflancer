import { Server, Socket } from "socket.io";
import { ChatService } from "../chat/chat.service"; // Импортируем наш новый сервис

export class WsService {
    private io!: Server;

    // Внедряем chatService через конструктор (Awilix сделает это автоматически)
    constructor(private chatService: ChatService) {}

    init(io: Server, jwtService: any) {
        this.io = io;

        this.io.use((socket, next) => {
            try {
                const cookieHeader = socket.handshake.headers.cookie;
                console.log("🔍 [Socket Auth] Получены куки:", cookieHeader); // <--- ЛОГ 1

                if (!cookieHeader) {
                    console.error("❌ [Socket Auth] Куки пустые!");
                    return next(new Error("Auth error: No cookies"));
                }

                // Пытаемся найти токен. Попробуем разные варианты названий (token, access_token)
                const tokenMatch = cookieHeader.match(/(?:access_token|token)=([^;]+)/);
                let token = tokenMatch ? tokenMatch[1] : null;

                if (!token) {
                    console.error("❌ [Socket Auth] В куках нет 'token' или 'access_token'!");
                    return next(new Error("Auth error: Token not found in cookies"));
                }

                // Если используется fastify-cookie, он может кодировать символы (%20, %3A)
                token = decodeURIComponent(token);

                // Декодируем токен
                const decoded = jwtService.verifyAccess(token);
                socket.data.userId = decoded.id;

                console.log(`✅ [Socket Auth] Токен валиден! ID: ${decoded.id}`); // <--- ЛОГ 2
                next();
            } catch (err: any) {
                console.error("❌ [Socket Auth] Ошибка расшифровки токена:", err.message); // <--- ЛОГ 3
                next(new Error("Auth error: Invalid token"));
            }
        });

        this.io.on("connection", (socket: Socket) => {
            const userId = socket.data.userId;
            socket.join(`user_${userId}`);
            console.log(`🟢 [Socket] User ${userId} подключился к сокетам!`);

            socket.on("join_workspace", async (data: { orderId: string }) => {
                console.log(`📦 [Socket] User ${userId} запрашивает вход в чат заказа: ${data.orderId}`);
                try {
                    const chat = await this.chatService.findOrCreateChatByOrder(data.orderId);
                    if (!chat) {
                        console.log(`⚠️ [Socket] Чат не найден (возможно, исполнитель еще не выбран)`);
                        return;
                    }

                    socket.join(`workspace_${data.orderId}`);
                    const messages = await this.chatService.getChatHistory(chat.id);

                    const history = messages.map(msg => ({
                        id: msg.id,
                        text: msg.content,
                        isSystem: msg.isSystem,
                        sentAt: msg.createdAt,
                        sender: msg.isSystem ? null : {
                            id: msg.sender?.id,
                            name: (msg.sender as any)?.displayedName || (msg.sender as any)?.name
                        }
                    }));

                    socket.emit("workspace_history", history);
                    console.log(`✅ [Socket] История отправлена (${history.length} сообщений)`);
                } catch (e) {
                    console.error("❌ [Socket] Ошибка в join_workspace:", e);
                }
            });

            // 2. Отправка обычного сообщения
            socket.on("send_message", async (data: { orderId: string; content: string }) => {
                console.log(`📩 [Socket] Пришло сообщение для заказа: ${data.orderId}`);
                try {
                    const chat = await this.chatService.findOrCreateChatByOrder(data.orderId);

                    if (!chat) {
                        console.error(`❌ [Socket] ОШИБКА: Чат не найден и не создан! Проверь, назначен ли developerId у заказа ${data.orderId}`);
                        return;
                    }

                    const savedMsg = await this.chatService.saveMessage(chat.id, userId, data.content, false);
                    console.log(`✅ [Socket] Сообщение успешно сохранено в БД (ID: ${savedMsg.id})`);

                    const history = await this.chatService.getChatHistory(chat.id);
                    const fullMsg = history.find(m => m.id === savedMsg.id);

                    this.io.to(`workspace_${data.orderId}`).emit("new_message", {
                        id: fullMsg?.id,
                        text: fullMsg?.content,
                        isSystem: false,
                        sentAt: fullMsg?.createdAt,
                        sender: {
                            id: userId,
                            name: (fullMsg?.sender as any)?.displayedName || (fullMsg?.sender as any)?.name
                        }
                    });
                    console.log(`✅ [Socket] Сообщение разослано в комнату workspace_${data.orderId}`);
                } catch (e: any) {
                    console.error(`🔥 [Socket] КРИТИЧЕСКАЯ ОШИБКА БАЗЫ ПРИ СОХРАНЕНИИ СООБЩЕНИЯ:`, e.message);
                }
            });

            socket.on("disconnect", () => {
                console.log(`🔴 [Socket] User ${userId} отключился`);
            });
        });
    }

    // Метод для системных уведомлений в чат (вызывать при смене статуса заказа!)
    async emitSystemMessage(orderId: string, content: string) {
        const chat = await this.chatService.findOrCreateChatByOrder(orderId);
        if (!chat) return;

        const savedMsg = await this.chatService.saveMessage(chat.id, null, content, true);

        this.io.to(`workspace_${orderId}`).emit("new_message", {
            id: savedMsg.id,
            text: savedMsg.content,
            isSystem: true,
            sentAt: savedMsg.createdAt,
            sender: null
        });
    }

    emitToUser(userId: string, event: string, payload: any) {
        if (this.io) this.io.to(`user_${userId}`).emit(event, payload);
    }
}