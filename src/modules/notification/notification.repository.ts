import { EntityManager } from "typeorm";
import {
  Notification,
  NotificationType,
} from "../../entities/notification.entity";
import { NotFoundError } from "../../errors/errors";

export interface CreateNotificationInput {
  recipientId: string;
  title: string;
  message: string;
  type: NotificationType;
  actionUrl?: string | null;
}

export class NotificationRepository {
  constructor(private em: EntityManager) {}

  async createNotification(
    data: CreateNotificationInput,
    em?: EntityManager,
  ): Promise<Notification> {
    const manager = em ?? this.em;
    const item = manager.create(Notification, data);
    return await manager.save(item);
  }

  async findByUserId(
    recipientId: string,
    em?: EntityManager,
  ): Promise<Notification[]> {
    const manager = em ?? this.em;
    return await manager.find(Notification, {
      where: { recipientId },
      order: { createdAt: "DESC" },
    });
  }

  async markAsRead(
    id: string,
    recipientId: string,
    em?: EntityManager,
  ): Promise<void> {
    const manager = em ?? this.em;
    const notification = await manager.findOne(Notification, {
      where: { id, recipientId },
    });
    if (!notification) throw new NotFoundError("Notification not found");

    await manager.update(Notification, id, { isRead: true });
  }

  async markAllAsRead(recipientId: string, em?: EntityManager): Promise<void> {
    const manager = em ?? this.em;
    await manager.update(
      Notification,
      { recipientId, isRead: false },
      { isRead: true },
    );
  }
}
