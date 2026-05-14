import { CreateLogInterface, LoggerRepository } from "./logger.repository";
import { EntityManager } from "typeorm";
import { LogTypes } from "../../entities/log.base.entity";
import { UserLog } from "../../entities/log.user.entity";

export class LoggerService {
  constructor(
    private loggerRepo: LoggerRepository,
    private em: EntityManager,
  ) {}

  async createUserLog(
    data: CreateLogInterface,
    em?: EntityManager,
  ): Promise<UserLog> {
    const manager = em ?? this.em;

    const log = {
      targetId: data.targetId,
      type: data.type ? data.type : LogTypes.SYSTEM,
      title: data.title ? data.title : "System Log",
      content: data.content
        ? data.content
        : "System log was sent due to an undefined reason",
    };
    console.log("zqwf");
    return this.loggerRepo.createUserLog({ em: manager, ...log });
  }

  async getUserLogs(
    userId: string,
    em?: EntityManager,
  ): Promise<UserLog[] | null> {
    return await this.loggerRepo.getUserLogs(userId, em);
  }
}
