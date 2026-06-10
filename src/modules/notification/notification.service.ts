import { EntityManager } from "typeorm";
import {
  NotificationRepository,
  CreateNotificationInput,
} from "./notification.repository";
import { Notification } from "../../entities/notification.entity";
import { WsService } from "../socket/ws.service"; // <-- ИМПОРТ

export class NotificationService {
  constructor(
      private em: EntityManager,
      private notificationRepo: NotificationRepository,
      private wsService: WsService // <-- ИНЖЕКТИМ СЕРВИС
  ) {}

  async createNotification(
      data: CreateNotificationInput,
      em?: EntityManager,
  ): Promise<Notification> {
    const manager = em ?? this.em;

    const notification = await this.notificationRepo.createNotification(
        data,
        manager,
    );

    this.wsService.emitToUser(data.recipientId, "new_notification", notification);

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