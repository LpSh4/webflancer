import { FastifyInstance, FastifyRequest } from "fastify";
import { UserLog } from "../../entities/log.user.entity";
import { getByIdSchema } from "./schemas/logger.schema";
// import { authenticate } from "../auth/auth.middleware";

export async function loggerRoutes(fastify: FastifyInstance) {
  const resolve = (req: FastifyRequest<any>) =>
    req.diScope.cradle.loggerController;

  fastify.get<{ Params: { id: string } }>(
    "/user/:id",
    {
      // preHandler: [authenticate],
      schema: getByIdSchema,
    },
    async (req, res): Promise<UserLog[] | null> => {
      return resolve(req).getUserLogs(req, res);
    },
  );
}
