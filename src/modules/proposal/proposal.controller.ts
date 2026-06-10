import { ProposalService } from "./proposal.service";
import { FastifyReply, FastifyRequest } from "fastify";
import { CommissionProposal } from "../../entities/commission.entity.proposals";
import {
  CommissionWorkStatus,
  ProposalStatus,
} from "../../entities/commission.enums";

export class ProposalController {
  constructor(private proposalService: ProposalService) {}

  createProposal = async (
    req: FastifyRequest<{
      Body: { workStatus: CommissionWorkStatus };
      Params: {
        id: string;
      };
    }>,
    res: FastifyReply,
  ): Promise<CommissionProposal> => {
    const proposal = await this.proposalService.createProposal(
      req.params.id,
      req.user.id,
      req.body.workStatus,
    );

    return res.status(201).send(proposal);
  };

  changeStatus = async (
    req: FastifyRequest<{
      Body: {
        status: ProposalStatus;
      };
      Params: {
        id: string;
      };
    }>,
    res: FastifyReply,
  ): Promise<never> => {
    await this.proposalService.changeStatus(
      req.params.id,
      req.body.status,
      req.user.id,
    );

    return res.status(204).send();
  };

  acceptAll = async (
    req: FastifyRequest<{
      Params: {
        targetId: string;
      };
    }>,
    res: FastifyReply,
  ): Promise<never> => {
    await this.proposalService.acceptAll(req.params.targetId, req.user.id);

    return res.status(204).send();
  };

  // Получить все пропоузалы (запросы на смену этапов) по ID заказа
  getByCommission = async (
    req: FastifyRequest<{ Params: { targetId: string } }>,
    res: FastifyReply,
  ) => {
    // В proposal.service метод требует targetId и userId
    const proposals = await this.proposalService.findByCommissionId(
      req.params.targetId,
      req.user.id,
    );
    return res.status(200).send(proposals);
  };

  view = async (
    req: FastifyRequest<{
      Params: {
        targetId: string;
      };
    }>,
    res: FastifyReply,
  ): Promise<CommissionProposal> => {
    const proposal = await this.proposalService.findById(
      req.params.targetId,
      req.user.id,
    );

    return res.status(200).send(proposal);
  };

  viewCommission = async (
    req: FastifyRequest<{
      Params: {
        targetId: string;
      };
    }>,
    res: FastifyReply,
  ): Promise<CommissionProposal[]> => {
    const proposals = await this.proposalService.findByCommissionId(
      req.params.targetId,
      req.user.id,
    );

    return res.status(200).send(proposals);
  };
}
