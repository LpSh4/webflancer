import { UserRepository } from "../user/user.repository";
import { HashService } from "./hash.service";
import { EntityManager } from "typeorm";
import {
  CreateUserData,
  LoginData,
  RefreshTokenData,
} from "../user/user.types";
import { Role, User } from "../../entities/user.entity";
import {
  ConflictError,
  NotFoundError,
  RequestError,
  UnauthorizedError,
} from "../../errors/errors";
import { JwtService } from "./jwt.service";
import { RefreshTokenRepository } from "./refresh-token.repository";
import ms from "ms";

export type SafeUser = {
  id: string;
  login: string;
  displayedName: string;
  role: Role;
};

export type LoginTokens = {
  accessToken: string;
  refreshToken: string;
  user: SafeUser;
};

export class AuthService {
  constructor(
    private em: EntityManager,
    private hashService: HashService,
    private userRepo: UserRepository,
    private jwtService: JwtService,
    private refreshTokenRepo: RefreshTokenRepository,
  ) {}

  async register(data: CreateUserData): Promise<User> {
    return this.em.transaction(async (trxEm): Promise<User> => {
      if (await this.userRepo.findByLogin(data.login)) {
        throw new ConflictError("Login already exists");
      }
      if (await this.userRepo.findByEmail(data.email)) {
        throw new ConflictError("Email already exists");
      }
      const passwordHash = await this.hashService.hashPassword(data.password);

      switch (data.role) {
        case Role.DEVELOPER:
          return await this.userRepo.createDeveloper(
            { ...data, password: passwordHash },
            trxEm,
          );
        case Role.CLIENT:
          return await this.userRepo.createClient(
            { ...data, password: passwordHash },
            trxEm,
          );
        case Role.MODERATOR:
          throw new RequestError();
        default:
          throw new RequestError();
      }
    });
  }

  async login(data: LoginData): Promise<LoginTokens> {
    const user = await this.userRepo.findByLogin(data.login, this.em);
    if (!user) throw new NotFoundError();

    const valid = await this.hashService.checkPassword(
      data.password,
      user.password,
    );
    if (!valid) throw new UnauthorizedError();

    const payload = {
      id: user.id,
      login: user.login,
      displayedName: user.displayedName,
      role: user.role,
    };

    const accessToken = this.jwtService.signAccess(payload);
    const refreshToken = this.jwtService.signRefresh(payload);

    await this.refreshTokenRepo.generateRefreshToken({
      token: refreshToken,
      expiresAt: new Date(Date.now() + ms("7d")),
      userId: user.id,
      ipAddress: data.ipAddress ? data.ipAddress : null,
      userAgent: data.userAgent ? data.userAgent : null,
    });

    const safeUser = await this.toSafeUser(user);

    return {
      accessToken,
      refreshToken,
      user: safeUser,
    };
  }

  async refresh(data: RefreshTokenData): Promise<LoginTokens> {
    return this.em.transaction(async (trxEm): Promise<LoginTokens> => {
      try {
        this.jwtService.verifyRefresh(data.oldRefreshToken);
      } catch (e) {
        throw new UnauthorizedError("Session expired");
      }

      const savedToken = await this.refreshTokenRepo.findValidToken(
        data.oldRefreshToken,
        trxEm,
      );
      if (!savedToken) {
        const decodedRefreshToken = this.jwtService.decode(
          data.oldRefreshToken,
        );
        await this.refreshTokenRepo.revokeAllForUser(decodedRefreshToken.id);
        throw new UnauthorizedError("Session expired");
      }

      await this.refreshTokenRepo.deleteByToken(data.oldRefreshToken, trxEm);

      const user = savedToken.user;
      user.lastOnline = new Date();

      const payload = {
        id: user.id,
        login: user.login,
        displayedName: user.displayedName,
        role: user.role,
      };
      const accessToken = this.jwtService.signAccess(payload);
      const refreshToken = this.jwtService.signRefresh(payload);

      await this.refreshTokenRepo.generateRefreshToken(
        {
          token: refreshToken,
          expiresAt: new Date(Date.now() + ms("7d")),
          userId: user.id,
          ipAddress: data.ipAddress ? data.ipAddress : null,
          userAgent: data.userAgent ? data.userAgent : null,
        },
        trxEm,
      );

      const safeUser = await this.toSafeUser(user);

      return {
        accessToken,
        refreshToken,
        user: safeUser,
      };
    });
  }

  async logout(refreshToken: string) {
    await this.refreshTokenRepo.deleteByToken(refreshToken);
  }

  async toSafeUser(user: User): Promise<SafeUser> {
    return {
      id: user.id,
      login: user.login,
      displayedName: user.displayedName,
      role: user.role,
    };
  }
}
