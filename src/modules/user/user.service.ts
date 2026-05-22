import { EntityManager } from "typeorm";
import { UpdateUserData } from "./user.types";
import { UserRepository } from "./user.repository";
import { NotFoundError } from "../../errors/errors";
import { User } from "../../entities/user.entity";
import { LoggerService } from "../log/logger.service";
import { LogTypes } from "../../entities/log.base.entity";

export class UserService {
  constructor(
    private em: EntityManager,
    private userRepo: UserRepository,
    private loggerService: LoggerService,
  ) {}

  async updateUser(userId: string, data: UpdateUserData): Promise<User> {
    return this.em.transaction(async (trxEm): Promise<User> => {
      const updated = await this.userRepo.update(userId, data, trxEm);
      if (!updated) throw new NotFoundError("User not found");
      await this.loggerService.createUserLog(
        {
          targetId: userId,
          type: LogTypes.SYSTEM,
          title: "User info updated",
          content: "User profile info has been updated.",
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
      await this.loggerService.createUserLog(
        {
          targetId: userId,
          type: LogTypes.SYSTEM,
          title: "User info updated",
          content: "User email has been updated.",
        },
        trxEm,
      );
      return updated;
    });
  }

  async updateProfilePicture(
    userId: string,
    profilePicture: string,
  ): Promise<User> {
    const updated = await this.userRepo.changeProfilePicture(
      userId,
      profilePicture,
    );
    if (!updated) throw new NotFoundError("User not found");
    await this.loggerService.createUserLog({
      targetId: userId,
      type: LogTypes.SYSTEM,
      title: "User info updated",
      content: "User profile picture has been updated.",
    });
    return updated;
  }

  async getUser(userId: string): Promise<User> {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundError("User not found");
    return user;
  }
}
