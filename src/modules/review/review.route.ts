import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { CreateReviewData } from "./review.types";
import { authenticate } from "../auth/auth.middleware";
import { CreateReviewSchema } from "./schemas/review.schema";
import { Review } from "../../entities/review.entity";
import { getByIdSchema } from "../user/schemas/user.schema";

export async function reviewRoutes(fastify: FastifyInstance) {
  const resolve = (req: FastifyRequest<any>) =>
    req.diScope.cradle.reviewController;

  fastify.post<{
    Body: CreateReviewData;
    Params: { targetId: string };
  }>(
    "/create/:targetId",
    {
      preHandler: authenticate,
      schema: CreateReviewSchema,
    },
    async (
      req: FastifyRequest<{
        Body: CreateReviewData;
        Params: { targetId: string };
      }>,
      res: FastifyReply,
    ): Promise<Review> => {
      req.body.userId = req.user.id;
      req.body.commissionId = req.params.targetId;

      return resolve(req).createReview(req, res);
    },
  );

  fastify.get<{ Params: { targetId: string } }>(
    "/:targetId",
    {
      schema: getByIdSchema,
    },
    async (
      req: FastifyRequest<{
        Params: { targetId: string };
      }>,
      res: FastifyReply,
    ): Promise<Review> => {
      return resolve(req).getById(req, res);
    },
  );

  fastify.get<{ Params: { targetId: string } }>(
    "/commission-id/:targetId",
    {
      schema: getByIdSchema,
    },
    async (
      req: FastifyRequest<{
        Params: { targetId: string };
      }>,
      res: FastifyReply,
    ): Promise<Review> => {
      return resolve(req).getByCommissionId(req, res);
    },
  );

  fastify.get<{ Params: { targetId: string } }>(
    "/user-id/:targetId",
    {
      schema: getByIdSchema,
    },
    async (
      req: FastifyRequest<{
        Params: { targetId: string };
      }>,
      res: FastifyReply,
    ): Promise<Review[]> => {
      return resolve(req).getByUserId(req, res);
    },
  );
}
