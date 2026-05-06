import { EntityManager, MoreThan } from "typeorm";
import { createHash } from "node:crypto";
import { RefreshToken } from "../../entities/refresh-token.entity";
import { UserRepository } from "../user/user.repository";
import { NotFoundError } from "../../errors/errors";

export type CreateRefreshTokenData = {
  token: string;
  expiresAt: Date;
  userId: string;
  userAgent?: string | null;
  ipAddress?: string | null;
};

export class RefreshTokenRepository {
  constructor(
    private em: EntityManager,
    private userRepo: UserRepository,
  ) {}

  async generateRefreshToken(
    data: CreateRefreshTokenData,
    em?: EntityManager,
  ): Promise<RefreshToken> {
    const manager = em ?? this.em;

    const user = await this.userRepo.findById(data.userId, manager);
    if (!user) throw new NotFoundError("User not found");
    const { userId, token, ...rest } = data;
    const payload = {
      ...rest,
      token: this.hashToken(token),
      user: user,
    };
    const tokenEntity = manager.create(RefreshToken, payload);
    return await manager.save(tokenEntity);
  }

  async findValidToken(token: string, em?: EntityManager) {
    const manager = em ?? this.em;

    return manager.findOne(RefreshToken, {
      where: {
        token: this.hashToken(token),
        expiresAt: MoreThan(new Date()),
      },
      relations: { user: true },
    });
  }

  async revokeAllForUser(userId: string, em?: EntityManager) {
    const manager = em ?? this.em;
    return await manager.softDelete(RefreshToken, { user: userId });
  }

  async deleteByToken(token: string, em?: EntityManager) {
    const manager = em ?? this.em;

    return await manager.softDelete(RefreshToken, {
      token: this.hashToken(token),
    });
  }

  protected hashToken(token: string) {
    return createHash("sha256").update(token).digest("hex");
  }
}
