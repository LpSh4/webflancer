import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { authenticate } from "../auth/auth.middleware";
import { BidSchema } from "./schemas/bid.schema";
import { Bid } from "../../entities/bid.entity";

export async function bidRoutes(fastify: FastifyInstance) {
  const resolve = (req: FastifyRequest) => req.diScope.cradle.bidController;

  fastify.post<{ Params: { targetId: string } }>(
    "/create/:targetId",
    {
      preHandler: [authenticate],
      schema: BidSchema,
    },
    async (
      req: FastifyRequest<{
        Params: { targetId: string };
      }>,
      res: FastifyReply,
    ): Promise<Bid> => {
      return resolve(req).createBid(req, res);
    },
  );

  fastify.post<{ Params: { targetId: string } }>(
    "/accept/:targetId",
    {
      preHandler: [authenticate],
      schema: BidSchema,
    },
    async (
      req: FastifyRequest<{
        Params: { targetId: string };
      }>,
      res: FastifyReply,
    ): Promise<never> => {
      return resolve(req).acceptBid(req, res);
    },
  );

  fastify.post<{ Params: { targetId: string } }>(
    "/withdraw/:targetId",
    {
      preHandler: [authenticate],
      schema: BidSchema,
    },
    async (
      req: FastifyRequest<{
        Params: { targetId: string };
      }>,
      res: FastifyReply,
    ): Promise<never> => {
      return resolve(req).withdrawBid(req, res);
    },
  );

  fastify.get<{ Params: { targetId: string } }>(
    "/commission/:targetId",
    {
      preHandler: [authenticate],
      schema: BidSchema,
    },
    async (
      req: FastifyRequest<{
        Params: { targetId: string };
      }>,
      res: FastifyReply,
    ): Promise<Bid[]> => {
      return resolve(req).findByCommissionId(req, res);
    },
  );

  fastify.get<{ Params: { targetId: string } }>(
    "/user/:targetId",
    {
      preHandler: [authenticate],
      schema: BidSchema,
    },
    async (
      req: FastifyRequest<{
        Params: { targetId: string };
      }>,
      res: FastifyReply,
    ): Promise<Bid[]> => {
      return resolve(req).findByUserId(req, res);
    },
  );

  fastify.get<{ Params: { targetId: string } }>(
    "/:targetId",
    {
      preHandler: [authenticate],
      schema: BidSchema,
    },
    async (
      req: FastifyRequest<{
        Params: { targetId: string };
      }>,
      res: FastifyReply,
    ): Promise<Bid[]> => {
      return resolve(req).findById(req, res);
    },
  );
}
