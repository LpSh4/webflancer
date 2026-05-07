import { FastifyInstance, FastifyRequest } from "fastify";
import { authenticate } from "../auth/auth.middleware";
import { UpdateUserData } from "./user.types";
import { Role } from "../../entities/user.entity";

export async function userRoutes(fastify: FastifyInstance) {
  const resolve = (req: FastifyRequest<any>) =>
    req.diScope.cradle.userController;

  fastify.patch<{
    Body: UpdateUserData;
  }>(
    "/profile",
    { preHandler: [authenticate] },
    async (req, res): Promise<never> => {
      req.body.role = req.user.role as Role;
      req.body.id = req.user.id;

      return resolve(req).updateProfile(req, res);
    },
  );
}
