import { EntityManager } from "typeorm";
import { Role, User } from "../../entities/user.entity";
import { CreateUserData } from "./user.types";
import { Client } from "../../entities/user.entity.client";
import { Developer } from "../../entities/user.entity.developer";

export class UserRepository {
  constructor(private em: EntityManager) {}

  async createClient(
    data: CreateUserData,
    em?: EntityManager,
  ): Promise<Client> {
    const manager = em ?? this.em;

    const pendingClient = {
      ...data,
      role: Role.CLIENT,
      displayedName: data.name,
      verifiedEmail: false,
      surname: null,
      profilePicture: `https://png.pngtree.com/png-vector/20250512/ourmid/pngtree-default-avatar-profile-icon-gray-placeholder-vector-png-image_16213764.png`,
      lastOnline: new Date(),
      totalExpense: 0,
    };
    const clientEntry = manager.create(Client, pendingClient);

    return await manager.save(clientEntry);
  }

  async createDeveloper(data: CreateUserData, em?: EntityManager) {
    const manager = em ?? this.em;

    const pendingDeveloper = {
      ...data,
      role: Role.DEVELOPER,
      verifiedEmail: false,
      displayedName: data.name,
      surname: null,
      profilePicture: `https://png.pngtree.com/png-vector/20250512/ourmid/pngtree-default-avatar-profile-icon-gray-placeholder-vector-png-image_16213764.png`,
      lastOnline: new Date(),
      bio: "",
    };

    const developerEntry = manager.create(Developer, pendingDeveloper);

    return await manager.save(developerEntry);
  }

  async findById(id: string, em?: EntityManager): Promise<User | null> {
    const manager = em ?? this.em;
    return manager.findOne(User, { where: { id } });
  }

  async findByEmail(email: string, em?: EntityManager): Promise<User | null> {
    const manager = em ?? this.em;
    return manager.findOne(User, { where: { email } });
  }

  async findByLogin(login: string, em?: EntityManager): Promise<User | null> {
    const manager = em ?? this.em;
    return manager.findOne(User, { where: { login } });
  }
}
