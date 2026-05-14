import { LoggerService } from "./logger.service";
import { FastifyReply, FastifyRequest } from "fastify";
import { UserLog } from "../../entities/log.user.entity";

export class LoggerController {
  constructor(private loggerService: LoggerService) {}

  getUserLogs = async (
    req: FastifyRequest<{
      Params: {
        id: string;
      };
    }>,
    res: FastifyReply,
  ): Promise<UserLog[] | null> => {
    const logs = await this.loggerService.getUserLogs(req.params.id);
    return res.status(200).send(logs);
  };
}
