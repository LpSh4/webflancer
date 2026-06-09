import { EntityManager } from "typeorm";
import { UpdateUserData } from "./user.types";
import { UserRepository } from "./user.repository";
import { NotFoundError } from "../../errors/errors";
import { User } from "../../entities/user.entity";
import { NotificationType } from "../../entities/notification.entity";
import { NotificationService } from "../notification/notification.service";

export class UserService {
  constructor(
    private em: EntityManager,
    private userRepo: UserRepository,
    private notificationService: NotificationService,
  ) {}

  async updateUser(userId: string, data: UpdateUserData): Promise<User> {
    return this.em.transaction(async (trxEm): Promise<User> => {
      const updated = await this.userRepo.update(userId, data, trxEm);
      if (!updated) throw new NotFoundError("User not found");

      await this.notificationService.createNotification(
        {
          recipientId: userId,
          title: "Профиль обновлён! ✨",
          message: `Содержимое профиля было обновлено.`,
          type: NotificationType.SYSTEM,
        },
        trxEm,
      );
      return updated;
    });
  }

  async updateEmail(
    userId: string,
    email: string,
    em?: EntityManager,
  ): Promise<User> {
    const manager = em ?? this.em;

    return manager.transaction(async (trxEm): Promise<User> => {
      const updated = await this.userRepo.changeEmail(userId, email);
      if (!updated) throw new NotFoundError("User not found");
      await this.notificationService.createNotification(
        {
          recipientId: userId,
          title: "Email обновлён! ✨",
          message: `Ваша почта обновлена.`,
          type: NotificationType.SYSTEM,
        },
        trxEm,
      );
      return updated;
    });
  }

  async updateProfilePicture(
    userId: string,
    profilePicture: string,
    em?: EntityManager,
  ): Promise<User> {
    const manager = em ?? this.em;
    return manager.transaction(async (trxEm): Promise<User> => {
      const updated = await this.userRepo.changeProfilePicture(
        userId,
        profilePicture,
      );
      if (!updated) throw new NotFoundError("User not found");
      await this.notificationService.createNotification(
        {
          recipientId: userId,
          title: "Аватар обновлён! ✨",
          message: `Содержимое профиля было обновлено.`,
          type: NotificationType.SYSTEM,
        },
        trxEm,
      );
      return updated;
    });
  }

  async getUser(userId: string): Promise<User> {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundError("User not found");
    return user;
  }
}
