import { UserRepository } from "../user/user.repository";
import { UserLog } from "../../entities/log.user.entity";
import { LogTypes } from "../../entities/log.base.entity";
import { EntityManager, UpdateResult } from "typeorm";
import { NotFoundError } from "../../errors/errors";

export interface CreateLogInterface {
  targetId: string;
  type: LogTypes;
  title: string;
  content: string;
  em?: EntityManager;
}

export class LoggerRepository {
  constructor(
    private userRepo: UserRepository,
    private em: EntityManager,
  ) {}

  async createUserLog(data: CreateLogInterface): Promise<UserLog> {
    const manager = data.em ?? this.em;

    const user = await this.userRepo.findById(data.targetId, manager);

    if (!user) throw new NotFoundError("User not found");
    console.log("bob");
    const log = manager.create(UserLog, {
      userId: data.targetId,
      logType: data.type,
      title: data.title,
      content: data.content,
    });

    await manager.save(log);

    return log;
  }

  async getUserLogs(userId: string, em?: EntityManager): Promise<UserLog[]> {
    const manager = em ?? this.em;

    if (!(await this.userRepo.findById(userId, manager)))
      throw new NotFoundError("User not found");

    return manager.find(UserLog, { where: { userId: userId } });
  }

  async deleteUserLog(
    logId: string,
    em?: EntityManager,
  ): Promise<UpdateResult> {
    const manager = em ?? this.em;

    const log = manager.findOne(UserLog, { where: { id: logId } });

    if (!log) throw new NotFoundError("Log not found");

    return manager.softDelete(UserLog, log);
  }
}
