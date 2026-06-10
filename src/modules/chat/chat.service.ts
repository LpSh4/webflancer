import { EntityManager } from "typeorm";
import { Chat } from "../../entities/chat.entity";
import { Message } from "../../entities/message.entity";
import { Commission } from "../../entities/commission.entity";

export class ChatService {
    constructor(private em: EntityManager) {}

    // Ищет чат по заказу. Если разраб уже выбран, но чата нет — создает его.
    async findOrCreateChatByOrder(orderId: string): Promise<Chat | null> {
        let chat = await this.em.findOne(Chat, { where: { commissionId: orderId } });

        if (!chat) {
            const commission = await this.em.findOne(Commission, { where: { id: orderId } });

            if (!commission) {
                console.error(`❌ [ChatService] Заказ ${orderId} вообще не найден в БД!`);
                return null;
            }

            if (!commission.developerId) {
                console.error(`❌ [ChatService] ОШИБКА: У заказа ${orderId} НЕТ ИСПОЛНИТЕЛЯ (developerId = null)! Чат не с кем создавать. Проверь логику acceptBid!`);
                return null;
            }

            console.log(`🔨 [ChatService] Создаем новый чат для заказа ${orderId}...`);
            try {
                chat = this.em.create(Chat, {
                    commissionId: orderId,
                    clientId: commission.clientId,
                    developerId: commission.developerId
                });
                await this.em.save(chat);
                console.log(`✅ [ChatService] Чат успешно создан (ID: ${chat.id})`);
            } catch (error: any) {
                console.error(`🔥 [ChatService] КРИТИЧЕСКАЯ ОШИБКА ПРИ СОЗДАНИИ ЧАТА (Таблицы нет в БД?):`, error.message);
                return null;
            }
        }
        return chat;
    }

    // Сохранить сообщение
    async saveMessage(chatId: string, senderId: string | null, content: string, isSystem: boolean = false): Promise<Message> {
        const msg = this.em.create(Message, {
            chatId,
            senderId,
            content,
            isSystem
        });
        return await this.em.save(msg);
    }

    // Получить историю переписки
    async getChatHistory(chatId: string): Promise<Message[]> {
        return await this.em.find(Message, {
            where: { chatId },
            order: { createdAt: "ASC" },
            relations: ["sender"] // Подтягиваем инфу об отправителе
        });
    }

    // Получить список всех активных чатов юзера (если захочешь сделать страницу Inbox)
    async getUserChats(userId: string): Promise<Chat[]> {
        return await this.em.find(Chat, {
            where: [
                { clientId: userId },
                { developerId: userId }
            ],
            relations: ["commission"]
        });
    }
}