import { EntityManager } from "typeorm";
import { Role, User } from "../../entities/user.entity";
import { CreateUserData, UpdateUserData } from "./user.types";
import { Client } from "../../entities/user.entity.client";
import { Developer } from "../../entities/user.entity.developer";
import { Partial } from "@sinclair/typebox";
import { RequestError } from "../../errors/errors";

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

  async update(
    id: string,
    data: UpdateUserData,
    em?: EntityManager,
  ): Promise<User | null> {
    const manager = em ?? this.em;
    const user = await this.findById(id, manager);
    if (!user) return null;

    const CLIENT_FIELDS = [
      "companyName",
      "companyLink",
      "totalExpense",
    ] as const;
    const DEVELOPER_FIELDS = [
      "socialLinkedIn",
      "socialX",
      "socialGitHub",
      "portfolioLinks",
      "bio",
      "avgHourlyRate",
    ] as const;
    const COMMON_FIELDS = [
      "login",
      "email",
      "phoneNumber",
      "displayedName",
      "name",
      "surname",
      "profileStatus",
    ] as const;

    let allowedFields: readonly string[] = [...COMMON_FIELDS];

    switch (data.role) {
      case Role.CLIENT:
        allowedFields = [...allowedFields, ...CLIENT_FIELDS];
        break;
      case Role.DEVELOPER:
        allowedFields = [...allowedFields, ...DEVELOPER_FIELDS];
        break;
      default:
        throw new RequestError("Bad Role");
    }

    const sanitizedData: Partial<User> = {};
    for (const key of allowedFields) {
      const field = key as keyof UpdateUserData;
      if (data[field] !== undefined) {
        (sanitizedData as any)[field] = data[field];
      }
    }

    Object.assign(user, sanitizedData);

    return await this.em.save(user);
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
