import { FastifyInstance, FastifyRequest } from "fastify";
import { authenticate } from "../auth/auth.middleware";

export async function notificationRoutes(fastify: FastifyInstance) {
  const resolve = (req: FastifyRequest) =>
    req.diScope.cradle.notificationController;

  fastify.get("/", { preHandler: [authenticate] }, async (req, res) => {
    return resolve(req).getMyNotifications(req, res);
  });

  fastify.patch(
    "/read/:id",
    { preHandler: [authenticate] },
    async (req: any, res) => {
      return resolve(req).markRead(req, res);
    },
  );

  fastify.patch(
    "/read-all",
    { preHandler: [authenticate] },
    async (req, res) => {
      return resolve(req).markAllRead(req, res);
    },
  );
}
