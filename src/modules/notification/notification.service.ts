import { EntityManager } from "typeorm";
import {
  NotificationRepository,
  CreateNotificationInput,
} from "./notification.repository";
import { Notification } from "../../entities/notification.entity";

export class NotificationService {
  constructor(
    private em: EntityManager,
    private notificationRepo: NotificationRepository,
  ) {}

  async createNotification(
    data: CreateNotificationInput,
    em?: EntityManager,
  ): Promise<Notification> {
    const manager = em ?? this.em;

    // Always persist inside the active database transaction context
    const notification = await this.notificationRepo.createNotification(
      data,
      manager,
    );

    // 🚀 FUTURE WEBSOCKET HOOK:
    // When ready, you will inject your WsService / Socket Server instance here:
    // this.wsService.emitToUser(data.recipientId, "notification", notification);

    return notification;
  }

  async getMyNotifications(userId: string): Promise<Notification[]> {
    return this.notificationRepo.findByUserId(userId, this.em);
  }

  async readNotification(id: string, userId: string): Promise<void> {
    await this.notificationRepo.markAsRead(id, userId, this.em);
  }

  async readAllNotifications(userId: string): Promise<void> {
    await this.notificationRepo.markAllAsRead(userId, this.em);
  }
}
