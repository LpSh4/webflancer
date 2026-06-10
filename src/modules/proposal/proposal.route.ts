import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import {
  CommissionWorkStatus,
  ProposalStatus,
} from "../../entities/commission.enums";
import {
  AcceptProposalsSchema,
  ChangeProposalStatusSchema,
  CreateProposalSchema,
  getByIdSchema,
} from "./schemas/proposal.schema";
import { authenticate } from "../auth/auth.middleware";
import { CommissionProposal } from "../../entities/commission.entity.proposals";

export async function proposalRoutes(fastify: FastifyInstance) {
  const resolve = (req: FastifyRequest<any>) =>
    req.diScope.cradle.proposalController;

  fastify.post<{
    Body: { workStatus: CommissionWorkStatus };
    Params: {
      id: string;
    };
  }>(
    "/create/:id",
    { preHandler: authenticate, schema: CreateProposalSchema },
    async (
      req: FastifyRequest<{
        Body: { workStatus: CommissionWorkStatus };
        Params: {
          id: string;
        };
      }>,
      res: FastifyReply,
    ): Promise<CommissionProposal> => {
      return resolve(req).createProposal(req, res);
    },
  );

  fastify.get<{ Params: { targetId: string } }>(
    "/commission/:targetId",
    { preHandler: [authenticate] },
    async (req, res) => {
      return resolve(req).getByCommission(req, res);
    },
  );

  fastify.post<{
    Body: {
      status: ProposalStatus;
    };
    Params: {
      id: string;
    };
  }>(
    "/change-status/:id",
    { preHandler: authenticate, schema: ChangeProposalStatusSchema },
    async (
      req: FastifyRequest<{
        Body: {
          status: ProposalStatus;
        };
        Params: {
          id: string;
        };
      }>,
      res: FastifyReply,
    ): Promise<CommissionProposal> => {
      return resolve(req).changeStatus(req, res);
    },
  );

  fastify.post<{
    Params: {
      targetId: string;
    };
  }>(
    "/accept-all/:targetId",
    {
      preHandler: authenticate,
      schema: AcceptProposalsSchema,
    },
    async (
      req: FastifyRequest<{
        Params: {
          targetId: string;
        };
      }>,
      res: FastifyReply,
    ): Promise<never> => {
      return resolve(req).acceptAll(req, res);
    },
  );

  fastify.get<{
    Params: {
      targetId: string;
    };
  }>(
    "/view-commission/:targetId",
    { preHandler: authenticate, schema: getByIdSchema },
    async (
      req: FastifyRequest<{
        Params: {
          targetId: string;
        };
      }>,
      res: FastifyReply,
    ): Promise<CommissionProposal[]> => {
      return resolve(req).viewCommission(req, res);
    },
  );

  fastify.get<{
    Params: {
      targetId: string;
    };
  }>(
    "/:targetId",
    { preHandler: authenticate, schema: getByIdSchema },
    async (
      req: FastifyRequest<{
        Params: {
          targetId: string;
        };
      }>,
      res: FastifyReply,
    ): Promise<CommissionProposal> => {
      return resolve(req).view(req, res);
    },
  );
}
