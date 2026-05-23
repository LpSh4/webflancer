import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { CreateCommissionData, EditCommissionData } from "./commission.types";
import { authenticate } from "../auth/auth.middleware";
import {
  CommissionSearchQuery,
  CommissionSearchResponse,
  CommissionSearchSchema,
  CreateCommissionSchema,
  EditCommissionSchema,
  getByIdSchema,
} from "./schemas/commission.schema";
import { Commission } from "../../entities/commission.entity";
import { Role } from "../../entities/user.entity";
import { UnauthorizedError } from "../../errors/errors";

export async function commissionRoutes(fastify: FastifyInstance) {
  const resolve = (req: FastifyRequest) =>
    req.diScope.cradle.commissionController;

  fastify.post<{
    Body: CreateCommissionData;
  }>(
    "/create",
    { preHandler: [authenticate], schema: CreateCommissionSchema },
    async (
      req: FastifyRequest<{ Body: CreateCommissionData }>,
      res: FastifyReply,
    ): Promise<Commission> => {
      if (req.user.role !== Role.CLIENT)
        throw new UnauthorizedError("Developers cannot create commissions");
      return resolve(req).createCommission(req, res);
    },
  );

  fastify.post<{
    Params: { id: string };
    Body: EditCommissionData;
  }>(
    "/edit/:id",
    { preHandler: [authenticate], schema: EditCommissionSchema },
    async (
      req: FastifyRequest<{ Params: { id: string }; Body: EditCommissionData }>,
      res: FastifyReply,
    ): Promise<never> => {
      req.body.userId = req.user.id;
      req.body.id = req.params.id;
      return resolve(req).editCommission(req, res);
    },
  );

  fastify.get<{
    Querystring: CommissionSearchQuery;
  }>(
    "/search",
    { schema: CommissionSearchSchema },
    async (
      req: FastifyRequest<{
        Querystring: CommissionSearchQuery;
      }>,
      res: FastifyReply,
    ): Promise<CommissionSearchResponse> => {
      return resolve(req).searchCommissions(req, res);
    },
  );

  fastify.post<{
    Params: { targetId: string };
  }>(
    "/complete/:targetId",
    {
      preHandler: [authenticate],
      schema: getByIdSchema,
    },
    async (
      req: FastifyRequest<{ Params: { targetId: string } }>,
      res: FastifyReply,
    ): Promise<never> => {
      return resolve(req).completeCommission(req, res);
    },
  );

  fastify.post<{ Params: { id: string } }>(
    "/toggle-archive/:id",
    {
      preHandler: [authenticate],
    },
    async (
      req: FastifyRequest<{ Params: { id: string } }>,
      res: FastifyReply,
    ): Promise<never> => {
      return resolve(req).toggleArchivedCommission(req, res);
    },
  );

  fastify.get<{
    Params: { targetId: string };
  }>(
    "/view/:targetId",
    { preHandler: [authenticate], schema: getByIdSchema },
    async (
      req: FastifyRequest<{ Params: { targetId: string } }>,
      res: FastifyReply,
    ): Promise<Commission> => {
      return resolve(req).getById(req, res);
    },
  );

  fastify.get<{
    Params: { targetId: string };
  }>(
    "/user/:targetId",
    { preHandler: [authenticate], schema: getByIdSchema },
    async (
      req: FastifyRequest<{ Params: { targetId: string } }>,
      res: FastifyReply,
    ): Promise<Commission[]> => {
      return resolve(req).getByUserId(req, res);
    },
  );
}
