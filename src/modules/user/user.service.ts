import { EntityManager } from "typeorm";
import { UpdateUserData } from "./user.types";
import { UserRepository } from "./user.repository";
import { NotFoundError } from "../../errors/errors";
import { User } from "../../entities/user.entity";

export class UserService {
  constructor(
    private em: EntityManager,
    private userRepo: UserRepository,
  ) {}

  async updateUser(userId: string, data: UpdateUserData): Promise<User> {
    const updated = await this.userRepo.update(userId, data, this.em);
    if (!updated) throw new NotFoundError("User not found");
    return updated;
  }
}
